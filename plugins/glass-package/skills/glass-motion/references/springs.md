# Springs

## Two ways to specify the same thing

Motion accepts either vocabulary:

```ts
{ type: "spring", bounce: 0.2, duration: 0.4 }              // designer's controls
{ type: "spring", stiffness: 620, damping: 19, mass: 0.85 }  // physical controls
```

**`bounce` + `duration`** is what you want most of the time: `bounce` runs from 0 (critically damped, no overshoot) to 1 (very springy), and `duration`, roughly the settle time, gives a predictable arrival — which matters when a spring must feel coordinated with a bezier elsewhere on the page.

**`stiffness` + `damping` + `mass`** is for when the *relationship between two springs* is the point: "this axis is lighter and less damped than that one" can't be said in bounce/duration terms, so the squash-and-stretch in §4 of the skill needs it.

Use whichever expresses the intent; mixing them across a codebase is fine.

## The three springs, and how they were arrived at

### SLIDE — a shared element re-targeting

```ts
const SLIDE = {
  type: "spring", bounce: 0.2, duration: 0.4,
  opacity: { duration: 0.16, ease: "easeOut" },
} as const;
```

`bounce: 0.2` sits near the floor of "perceptibly springy". A highlight sliding under icons is *a thing moving*, not *a thing arriving*; bounce implies arrival, and a highlight bouncing at every stop draws attention from the item it marks.

`duration: 0.4` is longer than it sounds: the spring covers most of the distance in the first ~150ms and spends the tail settling, landing about as fast as a 200ms tween while staying re-targetable. The `opacity` override is essential; see below.

### LIFT — cards rising out of a folder

```ts
const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;
```

The one playful moment: hovering a folder on the home page lifts four preview cards out of a frosted pocket, a delight beat with 40% more bounce and 25% more duration than anything else. Being the *only* one is why it works — against restraint, one exuberant interaction reads as craft; three read as a template.

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

All three push the same way — GROW fast and loose, CROSS slow and controlled — so on `scaleY` and `scaleX` of one panel it's briefly **taller and narrower** than at rest, then settles: squash and stretch from physics, not keyframes.

`y` rides `GROW` alongside `scaleY`. Travel and vertical scale must share a spring, or the panel's anchored edge visibly detaches from the trigger during the overshoot.

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

For a `mass: 1` spring, roughly `bounce ≈ 1 − damping / (2·√stiffness)`. Useful for intuition, not conversion: pick one vocabulary per spring and tune in it.

## Always split opacity out of a spring

```ts
// Wrong — opacity springs too
{ type: "spring", bounce: 0.2, duration: 0.4 }

// Right
{ type: "spring", bounce: 0.2, duration: 0.4,
  opacity: { duration: 0.16, ease: "easeOut" } }
```

Overshooting `opacity` goes past 1 (clamped: nothing) or past 0 (clamped: a visible hitch on the way back) — either way, a flicker at the tail of a fade.

**Position wants physics, opacity wants a curve.** 160ms `easeOut` on the way in outpaces the position spring, so the element is fully visible while it settles, which makes the settle readable. Motion's per-property overrides make it a one-line fix, and the same goes for `filter` (blur), `color`, and anything else without a spatial interpretation.

## Closing is not a spring

```ts
const CLOSE = { duration: 0.13, ease: "easeIn" } as const;
```

- **A tween, not a spring.** Nothing should overshoot on the way out.
- **`easeIn`** accelerates away, mirroring the entrance's deceleration, so the element reads as *leaving* rather than being deleted.
- **130ms**, under the state tier. The user has decided; the animation only stands between them and their next action.

**Entrances can have character; exits should get out of the way.**

## Where springs are wrong

- **Anything on a fixed layout timing budget.** A spring's settle time varies; if two elements must land together and one is a bezier, use a bezier for both.
- **Colour, opacity, filter, shadow.** No position, no momentum, nothing to overshoot into.
- **A discrete state flip with no travel** — a checkbox tick, a text colour change. A 150ms bezier is more predictable and cheaper.
- **Long distances at low stiffness.** A soft spring over 800px takes over a second and feels broken. Raise stiffness with distance, or use a tween.

## Reduced-motion substitutes

Every spring has a flat replacement at the state-tier duration: 150ms, default easing, no overshoot. The highlight still moves to the new row; nothing accelerates or oscillates. See `reduced-motion.md` for the complete set.
