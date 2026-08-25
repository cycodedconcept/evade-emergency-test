# Task: Fix inconsistent notification sound + add reliable SOS alerting

## Context
React app (Evade emergency dispatch). New incidents arrive in real time and are supposed to
play an alert sound. The sound currently fires inconsistently — it must not, because a missed
SOS alert has real consequences.

**Read the existing code first** and mirror conventions: the store/slice structure, how
real-time incidents arrive (socket / polling / SSE), the existing header/layout components,
and the theme tokens. Reuse existing UI primitives — introduce no new ones.

## Root causes to fix (all five)
1. **Browser autoplay policy** — `audio.play()` is rejected until the user has interacted with
   the page. A responder who loads the dashboard and clicks nothing gets silence.
2. **`new Audio(url)` per notification** — refetch/decode each time, so playback is late or
   dropped under load.
3. **Overlapping `play()` calls** — throws an unhandled `AbortError` that kills the sound.
4. **Suspended `AudioContext`** after the tab is backgrounded; it never auto-resumes.
5. **React StrictMode / effect cleanup** tearing down the audio element on re-render.

## 1. Audio assets

Add two royalty-free sounds under `public/sounds/`:
- `sos-alert.mp3` — short attention tone (~500ms), for normal-priority incidents
- `sos-ring.mp3` — seamlessly loopable ring, for HIGH priority

Source from Pixabay Audio, Mixkit, or Freesound (CC0 only) — all free for commercial use.
**Do not use ripped sounds from WhatsApp, Slack, iOS, or any other product**: it's a copyright
issue, and responders already associate those tones with other apps, so they get ignored or
send people to the wrong window. Keep files small (<50KB) and pre-decoded at startup.

## 2. Core module — `src/lib/alertSound.js`

Use the **Web Audio API** with a decoded buffer, not `<audio>` elements. Module-level
singleton (survives StrictMode remounts).

```js
let ctx = null, buffers = {}, unlocked = false, activeSource = null;
```

Exports:

- `initAlertSound()` — create `AudioContext`, fetch + `decodeAudioData` both files once into
  `buffers`. Idempotent. Swallow and log fetch failures without throwing.
- `unlockAlertSound()` — play a silent 1-frame buffer and call `ctx.resume()`. Must be invoked
  from a real user gesture. Sets `unlocked = true`. Idempotent.
- `isAlertSoundUnlocked()` — returns `unlocked`, for UI state.
- `playAlert({ variant = 'alert', loop = false, volume = 1 })` — if `ctx.state === 'suspended'`,
  `resume()` first. **Always call `stopAlert()` before starting** so sources never overlap.
  Route through a `GainNode` for volume. Store the source in `activeSource`.
- `stopAlert()` — `source.stop()` inside try/catch (already-stopped sources throw), null out
  `activeSource`.
- `setAlertVolume(v)` — persist to localStorage.

## 3. Unlock flow

At app root, once:
```js
useEffect(() => {
  initAlertSound();
  const unlock = () => { unlockAlertSound(); setSoundReady(true); };
  window.addEventListener("click", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  return () => {
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
  };
}, []);
```
Also call `unlockAlertSound()` explicitly on the login submit button — that's a guaranteed
gesture and unlocks audio before the dashboard even mounts.

## 4. Visible sound state — required, not optional

Add an **"Alert sounds"** control in the existing header (reuse the current icon-button
component):
- **Blocked** (`!unlocked`) — warning-toned icon with a tooltip/banner: "Click anywhere to
  enable alert sounds." A responder must *see* that audio is blocked, never discover it by
  missing an SOS.
- **On** — normal speaker icon. Click mutes.
- **Muted** — muted speaker icon, user preference persisted to localStorage.

Include a volume slider in the same popover, plus a "Test sound" button.

## 5. Incident integration

Where new incidents are received:
```js
playAlert({
  variant: incident.priority === "HIGH" ? "ring" : "alert",
  loop: incident.priority === "HIGH",
});
```

- HIGH priority **loops until acknowledged** — call `stopAlert()` when the responder
  acknowledges/opens the incident, or on a safety timeout (cap at ~60s) so it can't ring
  forever if the tab is abandoned.
- Normal priority plays once.
- Debounce: if several incidents land within ~2s, play once, not N times.
- Respect the mute preference, but consider whether HIGH should override mute — flag this as a
  product decision in your summary rather than deciding silently.

## 6. Reinforce beyond audio
Sound alone is unreliable (muted device, headphones out, tab buried):
- **Notification API** — request permission at an appropriate moment (not on page load), show
  a desktop notification with the emergency ID and type; clicking it focuses the tab and opens
  the incident.
- **Document title flash** — alternate `(1) SOS — Evade` with the normal title while an
  unacknowledged HIGH incident exists; restore on acknowledge.
- **In-app visual** — persistent banner/toast that cannot be missed, styled with existing
  danger tokens.

## 7. Constraints
- Browser audio only works while a tab is open. If responders need alerts with the browser
  closed, that's service-worker push or a native path — **out of scope here; note it in your
  summary rather than half-implementing it.**
- No new dependencies; Web Audio is built in.
- Must survive React StrictMode double-mounting without duplicate contexts or double playback.

## 8. Acceptance criteria
- Hard reload → click once → alert plays reliably on the next incident.
- Hard reload → click nothing → header clearly shows sounds are blocked.
- Ten incidents in quick succession → one clean sound, no overlap, no console errors.
- Background the tab for 5 minutes, then trigger an incident → sound still plays
  (context resumes).
- HIGH-priority alert loops and stops on acknowledge.
- No unhandled promise rejections or `AbortError` in the console.

## 9. Deliverables
List every file created or modified. Name the sound files you chose and their source/license.
Flag the mute-override decision and anything you guessed about the real-time incident flow.