# Ladder, curves and springs

The numbers behind the `## Dials` table, the reasoning that sets them, and how to derive a project's ladder from what it already ships.

## Why area, not importance

The eye needs time in proportion to the distance it travels and the area it has to re-read. A background colour changing under a 40px button is one fixation. A panel sliding in is a new region to parse. The whole page changing colour is a re-read of everything. Duration tracks that cost.

| Area changing | Role | editorial | product | expressive |
|---|---|---|---|---|
| A pressed element's own fill or scale | `duration.instant` | 0 | 0 | 0 |
| One property, no position | `duration.micro` | 100ms | 80ms | 120ms |
| One small element | `duration.state` | 150ms | 100ms | 200ms |
| A small element and its surroundings | `duration.popover` | 200ms | 150ms | 280ms |
| A large region entering or collapsing | `duration.overlay` | 300ms | 200ms | 450ms |
| The viewport, on the critical path | `duration.route` | 250ms | — | 400ms |
| Everything, at once | `duration.theme` | 400ms | 250ms | 600ms |

`duration.route` sits below `duration.overlay` in every column because law 3 caps it: a page transition is latency the user attributes to the product being slow. Below ~200ms a full-viewport fade starts to look like a rendering glitch, which is why `product` drops it rather than shortening it.

**If unsure which tier, it's `duration.state`.** It does most of the work in every preset.

**Above ~150ms on a hover state**, a fast pointer across a list of links leaves a visible trail. That is the ceiling on `duration.micro` and `duration.state` for anything hovered in bulk, in any preset — `expressive` gets its longer `duration.state` on entrances and single controls, and should keep list-row hovers at `duration.micro`.

## Exits

An exit runs at roughly two-thirds of its entrance, on `ease.exit` (an `ease-in`: it starts slowly and accelerates away, so the element reads as leaving rather than being deleted), and travels about half the entrance's offset.

| Entrance | editorial exit | product exit | expressive exit |
|---|---|---|---|
| A menu or popover | 130ms | 100ms | 180ms |
| A sheet or panel | 200ms | 130ms | 280ms |

## Curves

| Role | editorial | product | expressive |
|---|---|---|---|
| `ease.standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | `cubic-bezier(0.2, 0, 0, 1)` | `cubic-bezier(0.34, 1.2, 0.64, 1)` |
| `ease.colour` | `ease` | `ease-out` | `ease` |
| `ease.exit` | `ease-in` | `ease-in` | `ease-in` |

`editorial`'s curve decelerates hard and never leaves [0, 1], so it is legal on every property. `product`'s front-loads even more of the change, so a 100ms transition has visibly arrived by 50ms. `expressive`'s end control point above 1 overshoots slightly — enough to feel physical on a transform, never enough to read as a bounce.

**Where `ease.standard` overshoots, find every track that carries a floored property** — `blur()`, `brightness()`, `saturate()` toward 0, a radius toward 0, a scale that must not invert — and give that track a monotone curve. `cubic-bezier(0.16, 1, 0.3, 1)` has the same "arrives decisively" character without passing its target. It isn't a second character; it's the same intent in a curve that's legal for the property. Record it in `DESIGN.md` as a proposed role, `ease.floor`, if the project needs one.

A theme cross-fade is the other curve that is always monotone. It is the largest change available, and overshoot on a colour is a wobble in the light.

### Library equivalents

| | CSS | Motion | GSAP |
|---|---|---|---|
| A bezier | `cubic-bezier(a, b, c, d)` | `ease: [a, b, c, d]` | `CustomEase.create("standard", "a,b,c,d")` |
| `ease-in` | `ease-in` | `"easeIn"` | `"power1.in"` |
| `ease-out` | `ease-out` | `"easeOut"` | `"power1.out"` |

React Spring is physics-only; use a spring config, or its `easings` with a `duration` for the colour track.

## Springs

Two vocabularies describe the same physics:

- **`bounce` + `duration`** (Motion) — a designer's controls. `bounce` 0 is critically damped, no overshoot; `duration` is roughly the settle time. Predictable arrival, which matters when a spring runs beside a bezier.
- **`stiffness` + `damping` + `mass`** (Motion, and React Spring as `tension` / `friction` / `mass`) — needed when the relationship between two springs is the point, as in squash and stretch.

The bridge, for intuition rather than conversion: damping ratio ζ = damping ÷ (2 · √(stiffness · mass)), and bounce ≈ 1 − ζ. Pick one vocabulary per spring and tune in it.

| Character | Used for | editorial | product | expressive |
|---|---|---|---|---|
| `spring.snappy` | A shared element re-targeting; a dragged item released | bounce 0.15, 0.35s · 400 / 34 | bounce 0, 0.25s · 600 / 49 | bounce 0.2, 0.4s · 380 / 31 |
| `spring.soft` | A panel or card entering | bounce 0.2, 0.45s · 260 / 26 | — (tween) | bounce 0.3, 0.6s · 180 / 19 |
| `spring.playful` | The one delight beat | bounce 0.3, 0.5s · 300 / 24, once | — | bounce 0.45, 0.7s · 220 / 16 |

Stiffness / damping pairs assume mass 1. `snappy` stays near the floor of "perceptibly springy" in every preset: a highlight is a thing moving, not a thing arriving, and a highlight that settles at every stop draws attention to itself rather than to what it marks.

```ts
// Motion
const snappy = { type: "spring", bounce: 0.15, duration: 0.35 };
// React Spring
const snappy = { tension: 400, friction: 34 };
// GSAP has no spring solver; for re-targeting use gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" }),
// which re-targets smoothly from the current value.
// CSS: linear() can sample a spring's curve, but it can't re-target mid-flight — use it for entrances only.
```

### Tuning by symptom

Change one control at a time.

| Symptom | Fix |
|---|---|
| Floaty, slow to commit | ↑ stiffness, or ↓ duration |
| Wobbles too many times | ↑ damping, or ↓ bounce |
| Snaps, feels mechanical | ↓ damping slightly |
| Slow to start moving | ↓ mass |
| Too eager, no weight | ↑ mass |
| Flickers at the end of a fade | opacity is still on the spring — split it out |
| Takes over a second across a long distance | raise stiffness with distance, or use a tween |

### Squash and stretch

Two axes of one element, two springs of different character. Give the grow axis a light, underdamped spring (high stiffness, low damping, mass below 1) and the cross axis a stiffer, heavily damped one. Through the overshoot the element is briefly taller and narrower than its resting size, then settles — the animation principle, from physics, interruptible for free. Travel on the grow axis rides the same spring as its scale, or the anchored edge detaches from the trigger mid-flight. In the Glass package the pair is 620 / 19 / 0.85 against 380 / 30. `editorial` may spend this once; `product` never; `expressive` may use it on menus throughout.

## Deriving a project's ladder from its code

A worked case: a codebase with 31 distinct durations.

1. **Cluster by value and by what moves.** 150ms and 160ms and 175ms are all hover colours: one tier. 300ms and 350ms are both drawers: one tier. A lone 1200ms is a toast's auto-dismiss — a timer, not motion; out of scope.
2. **Name each cluster's role** by the area it changes, not by the name in the code. A token called `--slow` used on every tooltip is `duration.popover`.
3. **Compare with the preset.** Where a cluster sits within ~20ms of the dial and is used consistently, keep the project's value and record it; users already know its rhythm. Where it's scattered, snap it to the dial.
4. **Check the ordering.** Tiers must strictly ascend. A project whose tooltips (popover) outrun its drawers (overlay) has the ladder upside down, and that is an open issue whatever the numbers are.
5. **Class what's left** under law 4 or list it as a stray. Nothing remains unclassed.
6. **Write it to `DESIGN.md`** with the counts: *"`duration.state` → `--dur-fast` 150ms; 42 uses; 9 strays at 160–180ms snapped."*
