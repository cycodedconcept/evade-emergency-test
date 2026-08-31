import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let audioContextInstances = [];

class MockGainNode {
  constructor() {
    this.gain = { value: 1 };
    this.connect = vi.fn();
  }
}

class MockBufferSource {
  constructor() {
    this.buffer = null;
    this.loop = false;
    this.onended = null;
    this.connect = vi.fn();
    this.disconnect = vi.fn();
    this.start = vi.fn();
    this.stop = vi.fn(() => {
      if (typeof this.onended === 'function') {
        this.onended();
      }
    });
  }
}

class MockAudioContext {
  constructor() {
    audioContextInstances.push(this);
    this.state = 'suspended';
    this.sampleRate = 22050;
    this.destination = {};
    this.createdSources = [];
    this.decodeAudioData = vi.fn(async () => ({ decoded: true }));
    this.resume = vi.fn(async () => {
      this.state = 'running';
    });
    this.createBuffer = vi.fn(() => ({ silent: true }));
    this.createBufferSource = vi.fn(() => {
      const source = new MockBufferSource();
      this.createdSources.push(source);
      return source;
    });
    this.createGain = vi.fn(() => new MockGainNode());
  }
}

describe('alertSound', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    audioContextInstances = [];
    global.fetch = vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    }));
    window.AudioContext = MockAudioContext;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    delete global.fetch;
    delete window.AudioContext;
  });

  it('preloads both sound variants only once', async () => {
    const {
      getAlertSoundState,
      initAlertSound,
    } = await import('../lib/alertSound');

    await initAlertSound();
    await initAlertSound();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(getAlertSoundState().loadedVariants).toEqual(['alert', 'ring']);
  });

  it('unlocks, persists volume, and stops the previous source before replaying', async () => {
    const {
      getAlertSoundState,
      initAlertSound,
      playAlert,
      setAlertMuted,
      setAlertVolume,
      unlockAlertSound,
    } = await import('../lib/alertSound');

    await initAlertSound();
    await unlockAlertSound();
    setAlertVolume(0.4);

    expect(getAlertSoundState().unlocked).toBe(true);
    expect(localStorage.getItem('evade.alert-sound.volume')).toBe('0.4');

    await playAlert({ variant: 'alert', loop: false, volume: 1 });
    await playAlert({ variant: 'ring', loop: true, volume: 1 });

    const audioContextInstance = audioContextInstances[0];
    const [, firstSource, secondSource] = audioContextInstance.createdSources;

    expect(firstSource.start).toHaveBeenCalledTimes(1);
    expect(firstSource.stop).toHaveBeenCalledTimes(1);
    expect(secondSource.loop).toBe(true);
    expect(secondSource.start).toHaveBeenCalledTimes(1);

    setAlertMuted(true);

    expect(secondSource.stop).toHaveBeenCalledTimes(1);
  });
});
