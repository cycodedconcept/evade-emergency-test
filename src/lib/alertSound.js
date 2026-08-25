const ALERT_SOUND_CHANGE_EVENT = 'evade:alert-sound-change';
const ALERT_SOUND_FILES = {
  alert: '/sounds/sos-alert.mp3',
  ring: '/sounds/sos-ring.mp3',
};
const ALERT_SOUND_VOLUME_STORAGE_KEY = 'evade.alert-sound.volume';
const ALERT_SOUND_MUTED_STORAGE_KEY = 'evade.alert-sound.muted';

let ctx = null;
let buffers = {};
let unlocked = false;
let activeSource = null;
let initPromise = null;
let volume = 1;
let muted = false;

const getBrowserAudioContext = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.AudioContext || window.webkitAudioContext || null;
};

const clampVolume = (value) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 1;
  }

  return Math.min(Math.max(parsedValue, 0), 1);
};

const emitAlertSoundChange = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ALERT_SOUND_CHANGE_EVENT, {
      detail: getAlertSoundState(),
    })
  );
};

const readStoredVolume = () => {
  if (typeof window === 'undefined') {
    return 1;
  }

  const storedVolume = window.localStorage.getItem(ALERT_SOUND_VOLUME_STORAGE_KEY);
  return clampVolume(storedVolume === null ? 1 : storedVolume);
};

const readStoredMuted = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(ALERT_SOUND_MUTED_STORAGE_KEY) === 'true';
};

const ensureAudioContext = () => {
  const AudioContextClass = getBrowserAudioContext();

  if (!AudioContextClass) {
    return null;
  }

  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContextClass();
  }

  return ctx;
};

const fetchAndDecodeBuffer = async (audioContext, filePath) => {
  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Unable to fetch ${filePath}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error(`Alert sound preload failed for ${filePath}`, error);
    return null;
  }
};

export const initAlertSound = async () => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    volume = readStoredVolume();
    muted = readStoredMuted();

    const audioContext = ensureAudioContext();

    if (!audioContext) {
      console.error('Web Audio API is not supported in this browser.');
      emitAlertSoundChange();
      return buffers;
    }

    const decodedEntries = await Promise.all(
      Object.entries(ALERT_SOUND_FILES).map(async ([variant, filePath]) => [
        variant,
        await fetchAndDecodeBuffer(audioContext, filePath),
      ])
    );

    buffers = decodedEntries.reduce((nextBuffers, [variant, buffer]) => {
      if (buffer) {
        nextBuffers[variant] = buffer;
      }

      return nextBuffers;
    }, {});

    emitAlertSoundChange();
    return buffers;
  })().catch((error) => {
    console.error('Alert sound initialization failed', error);
    emitAlertSoundChange();
    return buffers;
  });

  return initPromise;
};

export const unlockAlertSound = async () => {
  const audioContext = ensureAudioContext();

  if (!audioContext) {
    return false;
  }

  await initAlertSound();

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const silentBuffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
    const silentSource = audioContext.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(audioContext.destination);
    silentSource.start(0);

    unlocked = true;
    emitAlertSoundChange();
    return true;
  } catch (error) {
    console.error('Alert sound unlock failed', error);
    emitAlertSoundChange();
    return false;
  }
};

export const isAlertSoundUnlocked = () => unlocked;

export const getAlertVolume = () => volume;

export const isAlertSoundMuted = () => muted;

export const setAlertMuted = (nextMuted) => {
  muted = Boolean(nextMuted);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      ALERT_SOUND_MUTED_STORAGE_KEY,
      String(muted)
    );
  }

  emitAlertSoundChange();
  return muted;
};

export const setAlertVolume = (nextVolume) => {
  volume = clampVolume(nextVolume);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      ALERT_SOUND_VOLUME_STORAGE_KEY,
      String(volume)
    );
  }

  emitAlertSoundChange();
  return volume;
};

export const stopAlert = () => {
  if (!activeSource) {
    return;
  }

  const sourceToStop = activeSource;
  activeSource = null;

  try {
    sourceToStop.onended = null;
    sourceToStop.stop(0);
  } catch {}

  try {
    sourceToStop.disconnect();
  } catch {}
};

export const playAlert = async ({
  variant = 'alert',
  loop = false,
  volume: nextVolume = 1,
} = {}) => {
  const audioContext = ensureAudioContext();

  if (!audioContext) {
    return false;
  }

  await initAlertSound();

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (error) {
      console.error('Alert sound resume failed', error);
      return false;
    }
  }

  stopAlert();

  const buffer = buffers[variant];

  if (!buffer) {
    return false;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  source.buffer = buffer;
  source.loop = loop;
  gainNode.gain.value = clampVolume(nextVolume) * volume;

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.onended = () => {
    if (activeSource === source) {
      activeSource = null;
    }
  };

  activeSource = source;

  try {
    source.start(0);
    return true;
  } catch (error) {
    console.error('Alert sound playback failed', error);
    if (activeSource === source) {
      activeSource = null;
    }
    return false;
  }
};

export const getAlertSoundState = () => ({
  unlocked,
  muted,
  volume,
  initialized: Boolean(ctx),
  contextState: ctx?.state || 'unavailable',
  loadedVariants: Object.keys(buffers),
});

export const subscribeToAlertSoundChanges = (listener) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleChange = (event) => {
    listener(event.detail || getAlertSoundState());
  };

  window.addEventListener(ALERT_SOUND_CHANGE_EVENT, handleChange);
  return () => {
    window.removeEventListener(ALERT_SOUND_CHANGE_EVENT, handleChange);
  };
};
