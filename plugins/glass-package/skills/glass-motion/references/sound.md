# UI sound

The most optional thing in the system, and the one to be most careful with. Sound in a web interface is unexpected; done badly it's the reason someone closes the tab. Done well it's a genuine second feedback channel that costs no visual space.

Read this section as "if you're going to do it, here's how" — not as a recommendation to do it.

## Synthesise, don't ship files

The whole sound design is ~100 lines of Web Audio with no assets. Two sounds, generated on demand.

Advantages that actually matter: no network request, no decode latency (so the sound is genuinely simultaneous with the interaction), and parameters you can tune by editing numbers rather than re-exporting audio.

## The "tok"

A woody marimba-like tick: a sine fundamental, a fast-decaying partial, and a noise transient for the attack.

```ts
function tok(base: number, duration: number, volume: number): void {
  if (muted) return;
  const c = getCtx();
  if (!c || c.state !== "running") return;
  const now = c.currentTime;

  // Fundamental + a 3.9:1 partial that decays faster than the body.
  const tones: [number, number, number][] = [
    [1, 1, duration],
    [3.9, 0.32, duration * 0.45],
  ];
  for (const [ratio, vmul, dur] of tones) {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = base * ratio;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume * vmul, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  // Wooden contact tick: short lowpassed noise for the "k".
  const transient = 0.012;
  const noise = c.createBufferSource();
  noise.buffer = getNoise(c);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.7, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + transient);
  noise.connect(lp).connect(noiseGain).connect(c.destination);
  noise.start(now);
  noise.stop(now + transient + 0.01);
}

export const playHover = () => tok(1200, 0.09, 0.05);
export const playClick = () => tok(900, 0.14, 0.13);
```

### Why each piece is there

**The 3.9:1 partial.** A pure sine reads as electronic — a test tone. Struck wooden bars (marimba, xylophone) have a strong inharmonic partial near the 4th; slightly *off* 4.0 is what makes it read as physical rather than as a musical interval. It's quieter (0.32×) and decays in 45% of the time, matching how a real bar's overtones die before the fundamental.

**The noise transient.** 12ms of lowpassed white noise at the attack. This is the "k" in "tok" — the sound of contact, before the body of the note. Without it you have a pitched beep; with it you have something being *struck*. Lowpassed at 2600Hz so it's a thud, not a click.

**Exponential ramps, not linear.** Human loudness perception is logarithmic, so a linear gain ramp sounds like it decays too fast at first and then hangs. `exponentialRampToValueAtTime` matches perception — and it cannot accept zero as a target, hence `0.0001` at both ends.

**The 2ms attack.** Ramping up over 2ms rather than starting at full gain avoids a click from the discontinuity. Fast enough to feel instantaneous.

### Hover vs click

|  | Hover | Click |
|---|---|---|
| Base | 1200Hz | 900Hz |
| Duration | 90ms | 140ms |
| Gain | 0.05 | 0.13 |

Hover is higher, shorter, and **2.6× quieter**. You cross dozens of links moving around a page; a hover sound at click volume is intolerable within seconds. Click is lower and louder because it's a completed action, and lower pitch reads as more consequential.

The interval between them is roughly a fourth — pleasant rather than dissonant when a hover is immediately followed by a click.

## The autoplay policy

An `AudioContext` starts `suspended` and can only be resumed from a user gesture. So hover sounds are silent until the reader's first real interaction unlocks it, permanently.

```ts
export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}
```

And every playback path checks state rather than assuming:

```ts
if (!c || c.state !== "running") return;
```

This is a feature, not a workaround: a page you've merely scrolled past makes no sound, and sound only ever begins after you've interacted. Fail silently — never surface an error for this.

### Arm it on every gesture the browser accepts, not just the one you expect

```ts
const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

/* Idempotent — resume() on a running context is a no-op, which is cheaper
   than the bookkeeping to detach these after the first one lands. */
const onUnlock = () => unlockAudio();
for (const type of UNLOCK_EVENTS) {
  document.addEventListener(type, onUnlock, { passive: true });
}
```

The reference implementation shipped `pointerdown` alone for months. Two failures, and neither is exotic:

**Hover is not activation, in any engine.** A reader who lands on the page and simply moves the mouse across the dock hears nothing — and there is no later gesture to recover from, because *the hover was the interaction*. The bug hid because whoever tests it clicks something within a few seconds.

**Keyboard-only readers never heard the site at all.** Tab to a link, press Enter: that dispatches `click`, not `pointerdown`, so the context was still suspended when the click handler asked it to play. Every screen, every session. `keydown` is the fix, and it's the one that matters most, because the affected group is precisely the group least able to work around it.

**`wheel` is deliberately absent.** Scrolling is the one input in this neighbourhood that counts as activation in no engine at all, so listening for it wouldn't unlock anything — it would just move the silence somewhere harder to find.

The general form: **enumerate the activation gestures, not the gesture your own hands make.** If your unlock list has one entry, it's probably wrong.

## Delegation, not per-element wiring

One set of document listeners covers every link and button on the site.

```ts
const SELECTOR = "a, button, [role='button'], summary";

const onOver = (e: PointerEvent) => {
  // Mouse only — touch has no hover, and we don't want a tick on tap.
  if (e.pointerType && e.pointerType !== "mouse") return;
  const el = (e.target as Element | null)?.closest?.(SELECTOR) ?? null;
  if (el === lastHover) return;   // don't re-fire while moving within one element
  lastHover = el;
  if (el) playHover();
};

document.addEventListener("pointerover", onOver);
document.addEventListener("click", onClick);
```

Three details:

- **`pointerType !== "mouse"` bails out.** A touch `pointerover` fires on tap, immediately before the click — so without this guard every tap plays both sounds, 15ms apart, which sounds like a stutter.
- **`lastHover` deduplication.** `pointerover` fires for descendants too. Moving across an icon *inside* a button would re-trigger without the identity check.
- **`closest(SELECTOR)`** means it works for anything interactive, including elements added later, with no per-component wiring.

`summary` is in the selector because a `<details>` disclosure is a real control that should feel like one.

### Dense surfaces opt out of the hover tick

```ts
// Surfaces made of a hundred small targets — an image wall, a filmstrip —
// opt out with data-quiet-hover. A tick per tile as the cursor crosses them
// is a machine gun, not feedback. Clicks still tick.
if (el && !el.closest("[data-quiet-hover]")) playHover();
```

One attribute on the container, and the whole subtree goes quiet on hover while staying audible on click. Worth noting what the opt-out *isn't*: it's not "this surface is unimportant", it's a rate limit. The signal stops being feedback somewhere around three ticks a second, and a grid of thumbnails passes that trivially.

## Sound as a phrase

Two sounds is a texture. Occasionally you want a *run* of them — the reference implementation plays one note per photograph as they flick past in the opening screen, then a landing note as the real mark arrives.

```ts
/* An A major pentatonic run, written out rather than computed from an
   interval: five notes want to BE a phrase, and pentatonic is the scale
   where no two of them can sound wrong together. */
const RIFFLE = [880, 990, 1100, 1320, 1467];

export function playRiffleStep(i: number): void {
  tok(RIFFLE[Math.min(Math.max(i | 0, 0), RIFFLE.length - 1)], 0.1, 0.06);
}

/** The mark arriving last, and the run resolving onto it. */
export const playLanding = () => tok(587, 0.26, 0.16);
```

Three decisions worth copying:

- **Pentatonic, because the phrase can be truncated.** A photograph that fails to load drops its turn, so the run comes up short. In a scale with no dissonant pair, a phrase that stops early still sounds finished.
- **Quieter than a click** (0.06 against 0.13). Five notes inside a second should read as a flutter, not a drum fill.
- **The landing note resolves *downward*.** It's a fifth below where the run started, and it's the only accented note. Land above the run and it sounds like one more step rather than the end of the phrase.

This is still a set piece, not a texture — it plays once a session. See §14 of the SKILL.md.

## Mute, and persistence

```ts
let muted = localStorage.getItem("ui-sound") === "off";

export function setMuted(value: boolean): void {
  muted = value;
  try { localStorage.setItem("ui-sound", value ? "off" : "on"); } catch {}
}
```

Non-negotiable requirements if you ship sound:

1. **A visible, discoverable mute control.** In the reference implementation it sits in the nav's settings box, next to the theme toggle, with an `aria-pressed` state and a label.
2. **The preference persists.** A user who muted once should never hear it again.
3. **Reading the preference never throws.** `localStorage` is unavailable in some privacy modes; wrap every access.
4. **Muting is checked at the top of playback**, not at the listener — so muting takes effect instantly for in-flight interactions.

## Should the default be on?

Genuinely arguable. On a personal site where the sound is part of the character, on is defensible — it's the only way most people will ever discover it, and it's quiet, short, and muteable. On anything a user didn't choose to visit (a tool, an app, a client site), default to off.

If you default to on, the mute control has to be *easy to find within seconds*. That's the price.

## What's deliberately absent

**Haptics.** `navigator.vibrate()` exists but isn't implemented here — Safari on iOS doesn't support it, so it would only fire on Android, and a feedback channel that exists on one platform is worse than none. If you add it, keep it under 10ms and tie it to the same mute preference.

**Sounds for anything other than hover, click, and the one greeting phrase.** No navigation sound, no reveal sound, no error sound. Two sounds is a texture; five is a soundtrack. The riffle earns its place by playing once per tab and never again.

**Pitch variation.** A tempting flourish — vary the pitch by element type or position. It turns an ambient texture into something the user starts trying to interpret.
