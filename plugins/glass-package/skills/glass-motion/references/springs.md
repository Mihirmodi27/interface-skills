# Springs

## Two ways to specify the same thing

Motion accepts either vocabulary:

```ts
{ type: "spring", bounce: 0.2, duration: 0.4 }              // designer's controls
{ type: "spring", stiffness: 620, damping: 19, mass: 0.85 }  // physical controls
```

**`bounce` + `duration`** is what you want most of the time. `bounce` is 0 (no overshoot, critically damped) to 1 (very springy); `duration` is roughly how long until it settles. You can reason about both directly, and `duration` gives you a predictable arrival time — which matters when a spring has to feel coordinated with a bezier transition elsewhere on the page.

**`stiffness` + `damping` + `mass`** is what you want when the *relationship between two springs* is the point. You can't express "this axis is lighter and less damped than that one" in bounce/duration terms — the squash-and-stretch effect in §4 of the skill needs the physical vocabulary to exist at all.

Use the one that expresses the intent. Mixing them across a codebase is fine.

## The three springs, and how they were arrived at

### SLIDE — a shared element re-targeting

```ts
const SLIDE = {
  type: "spring", bounce: 0.2, duration: 0.4,
  opacity: { duration: 0.16, ease: "easeOut" },
} as const;
```

`bounce: 0.2` is deliberately near the floor of "perceptibly springy." This element is a highlight sliding under a row of icons — it's *a thing moving*, not *a thing arriving*. Bounce implies arrival, a moment of settling. A highlight that bounces at every stop draws attention to the highlight instead of to the item it's marking.

`duration: 0.4` is longer than it sounds, because the spring covers most of the distance in the first ~150ms and spends the tail settling. Perceptually it lands about as fast as a 200ms tween while remaining smoothly re-targetable.

The `opacity` override is the essential part. See below.

### LIFT — cards rising out of a folder

```ts
const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;
```

More bounce, more time. This is the one genuinely playful moment in the system: hovering a folder on the home page makes four preview cards rise out of a frosted pocket. It's a delight beat, so it gets 40% more bounce and 25% more duration than anything else.

That it's the *only* such moment is why it works. In a system where the baseline is restraint, one exuberant interaction reads as craft. Three of them read as a template.

### GROW / CROSS — the disagreeing pair

```ts
const GROW  = { type: "spring", stiffness: 620, damping: 19, mass: 0.85 } as const;
const CROSS = { type: "spring", stiffness: 380, damping: 30 } as const;
```

|  | GROW | CROSS | Effect |
|---|---|---|---|
| stiffness | 620 | 380 | GROW pulls harder → moves sooner |
| damping | 19 | 30 | GROW resists less → overshoots |
| mass | 0.85 | 1 (default) | GROW is lighter → accelerates faster |

Every one of the three differences pushes the same direction: GROW is fast and loose, CROSS is slow and controlled. Applied to `scaleY` and `scaleX` of one panel, the result is that mid-flight the panel is briefly **taller and narrower** than its resting size, then settles — squash and stretch, emerging from physics rather than authored keyframes.

`y` rides `GROW` alongside `scaleY`. Travel and vertical scale must share a spring or the panel's anchored edge visibly detaches from the trigger during the overshoot.

## Tuning, practically

Change one variable at a time, and know which symptom maps to which control:

| Symptom | Fix |
|---|---|
| Feels floaty, takes too long to commit | ↑ stiffness (or ↓ duration) |
| Wobbles too many times | ↑ damping (or ↓ bounce) |
| Snaps, feels mechanical | ↓ damping slightly, or ↓ stiffness |
| Slow to start moving | ↓ mass |
| Too eager, no weight | ↑ mass |
| Overshoots visibly on opacity | you forgot to split opacity out |

Rough correspondence between the vocabularies, for a `mass: 1` spring: `bounce ≈ 1 − damping / (2·√stiffness)`. Useful for intuition, not for conversion — just pick one vocabulary per spring and tune in it.

## Always split opacity out of a spring

```ts
// Wrong — opacity springs too
{ type: "spring", bounce: 0.2, duration: 0.4 }

// Right
{ type: "spring", bounce: 0.2, duration: 0.4,
  opacity: { duration: 0.16, ease: "easeOut" } }
```

A spring overshoots. Overshooting a position means momentum, which is what you want. Overshooting `opacity` means going past 1 (clamped, so: nothing) or past 0 toward negative (clamped, so: a visible hitch as it comes back). Either way you get a flicker at the tail of a fade.

Practically: **position wants physics, opacity wants a curve.** 160ms `easeOut` on the way in — faster than the position spring, so the element is fully visible while it's still settling into place, which is what makes the settle readable.

Motion lets you override per-property inside a transition object, which makes this a one-line fix. The same applies to `filter` (blur), `color`, and anything else without a spatial interpretation.

## Closing is not a spring

```ts
const CLOSE = { duration: 0.13, ease: "easeIn" } as const;
```

Three deliberate choices:

- **A tween, not a spring.** Nothing should overshoot on the way out.
- **`easeIn`** — starts slow, accelerates away. The mirror of the entrance's deceleration, and it reads as the element *leaving* rather than being deleted.
- **130ms**, well under the state tier. The user has already decided; the animation is now just standing between them and their next action.

The asymmetry generalises: **entrances can have character, exits should get out of the way.**

## Where springs are wrong

- **Anything on a fixed layout timing budget.** A spring's settle time varies; if two elements must land together and one is a bezier, use a bezier for both.
- **Colour, opacity, filter, shadow.** No position, no momentum, nothing to overshoot into.
- **A discrete state flip with no travel** — a checkbox tick, a text colour change. A 150ms bezier is more predictable and cheaper.
- **Long distances at low stiffness.** A soft spring over 800px takes over a second and feels broken. Raise stiffness with distance, or use a tween.

## Reduced-motion substitutes

Every spring has a flat replacement at the state-tier duration:

```tsx
const reduce = useReducedMotion();
const tween = reduce ? { duration: 0.15 } : SLIDE;
```

150ms, no easing specified (linear-ish default is fine at that length), no overshoot. The state change stays legible — you still see the highlight move to the new row — but nothing accelerates or oscillates. See `reduced-motion.md` for the complete set.
