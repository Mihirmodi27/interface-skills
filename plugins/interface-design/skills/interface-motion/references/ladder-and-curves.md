# Ladder, curves and springs

The numbers behind the `## Dials` table, the reasoning that sets them, and how to derive a project's ladder from what it already ships.

## Why area, not importance

The eye needs time in proportion to the distance it travels and the area it re-reads: a background colour changing under a 40px button is one fixation, a panel sliding in is a new region to parse, and the whole page changing colour is a re-read of everything.

| Area changing | Role | editorial | product | expressive |
|---|---|---|---|---|
| A pressed element's own fill or scale | `duration.instant` | 0 | 0 | 0 |
| One property, no position | `duration.micro` | 100ms | 80ms | 120ms |
| One small element | `duration.state` | 150ms | 100ms | 200ms |
| A small element and its surroundings | `duration.popover` | 200ms | 150ms | 280ms |
| A large region entering or collapsing | `duration.overlay` | 300ms | 200ms | 450ms |
| The viewport, on the critical path | `duration.route` | 250ms | — | 400ms |
| Everything, at once | `duration.theme` | 400ms | 250ms | 600ms |

`duration.route` sits below `duration.overlay` because law 3 caps it: a page transition is latency the user blames on the product. Below ~200ms a full-viewport fade looks like a rendering glitch, so `product` drops it rather than shortening it.

**If unsure which tier, it's `duration.state`**, which does most of the work in every preset. `product` is shortest because its user is fluent and repeats everything; `expressive` is longest on entrances because they are usually seen once.

**Above ~150ms on a hover state**, a fast pointer across a list or a dense table leaves a visible trail. That caps `duration.micro` and `duration.state` for anything hovered in bulk, in any preset, so `expressive` spends its longer `duration.state` on entrances and single controls and keeps list-row hovers at `duration.micro`. Above ~200ms, `editorial`'s `duration.state` makes reading chrome feel heavy.

**A large surface is the opposite case.** A row is a thin strip the pointer crosses; a card on a board is an area the eye rests on, and the same 80ms colour change across it looks instant, not smooth. The area sets the tier here as everywhere, so a card's wash takes about 200ms in and a slower 250ms out: the pointer has already left, the fade blocks nothing, and a sweep across the board fades behind it instead of strobing. Name only `background-color` (and `border-color` if it moves), never `transform` or `box-shadow`: in `product` a card that rises or darkens its shadow under the pointer claims it can be picked up. `expressive` lets primary navigation lift, because there the travel is the invitation.

## Exits

An exit runs at about two-thirds of its entrance, on `ease.exit` (an `ease-in`, accelerating away, so the element reads as leaving rather than deleted), and travels about half the entrance's offset.

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

`editorial`'s curve decelerates hard and never leaves [0, 1], so it is legal on every property. `product`'s front-loads even more, so a 100ms transition has visibly arrived by 50ms, and doesn't overshoot either. `expressive`'s end control point above 1 overshoots slightly — physical on a transform, never a bounce — which costs law 5's floor check on every track.

**Where `ease.standard` overshoots, find every track carrying a floored property** — `blur()`, `brightness()`, `saturate()` toward 0, a radius toward 0, a scale that must not invert — and give it a monotone curve. `cubic-bezier(0.16, 1, 0.3, 1)` arrives as decisively without passing its target: the same intent, legal for the property, not a second character. Record it in `DESIGN.md` as a proposed role, `ease.floor`, if needed.

A theme cross-fade is always monotone too: it is the largest change available, and overshoot on colour is a wobble in the light.

### Library equivalents

| | CSS | Motion | GSAP |
|---|---|---|---|
| A bezier | `cubic-bezier(a, b, c, d)` | `ease: [a, b, c, d]` | `CustomEase.create("standard", "a,b,c,d")` |
| `ease-in` | `ease-in` | `"easeIn"` | `"power1.in"` |
| `ease-out` | `ease-out` | `"easeOut"` | `"power1.out"` |

React Spring is physics-only; use a spring config, or its `easings` with a `duration` for the colour track.

## Springs

Two vocabularies describe the same physics:

- **`bounce` + `duration`** (Motion): `bounce` 0 is critically damped and `duration` is roughly the settle time, so arrival is predictable beside a bezier.
- **`stiffness` + `damping` + `mass`** (Motion; React Spring's `tension` / `friction` / `mass`): needed when the relationship between two springs is the point, as in squash and stretch.

For intuition rather than conversion, damping ratio ζ = damping ÷ (2 · √(stiffness · mass)), and bounce ≈ 1 − ζ. Tune each spring in one vocabulary.

| Character | Used for | editorial | product | expressive |
|---|---|---|---|---|
| `spring.snappy` | A shared element re-targeting; a dragged item released | bounce 0.15, 0.35s · 400 / 34 | bounce 0, 0.25s · 600 / 49 | bounce 0.2, 0.4s · 380 / 31 |
| `spring.soft` | A panel or card entering | bounce 0.2, 0.45s · 260 / 26 | — (tween) | bounce 0.3, 0.6s · 180 / 19 |
| `spring.playful` | The one delight beat | bounce 0.3, 0.5s · 300 / 24, once | — | bounce 0.45, 0.7s · 220 / 16 |

Stiffness / damping pairs assume mass 1. `snappy` stays near the floor of "perceptibly springy": a highlight is a thing moving, not arriving, and one that settles at every stop draws attention to itself instead of what it marks. `product` keeps springs to real momentum — a dragged card, a thrown sheet — because a fluent user notices a spring's variable settle time. `editorial`'s one `playful` spring is one delight beat: against restraint, one exuberant interaction reads as craft, three as a template.

```ts
// Motion
const snappy = { type: "spring", bounce: 0.15, duration: 0.35 };
// Opacity always split out as its own short tween (in GSAP, a separate tween beside the move)
transition={{ ...<spring.snappy>, opacity: { duration: <duration.micro>, ease: <ease.colour> } }}
// React Spring
const snappy = { tension: 400, friction: 34 };
// GSAP has no spring solver; to re-target use gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" }),
// which re-targets smoothly from the current value.
// CSS: linear() can sample a spring's curve but can't re-target mid-flight — entrances only.
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

A light, underdamped spring on the grow axis (high stiffness, low damping, mass below 1) and a stiffer, heavily damped one on the cross axis: through the overshoot the element is briefly taller and narrower, then settles — the animation principle from physics, interruptible for free, with deformation reading as mass. Travel on the grow axis rides the same spring as its scale, or the anchored edge detaches from the trigger mid-flight. In the Glass package the pair is 620 / 19 / 0.85 against 380 / 30. `editorial` may spend this once; `product` never; `expressive` may use it on menus throughout.

## Emitting tokens

A fictional project, *Ledgerline* — bookkeeping software on `product`, with `app/(site)/**` on `expressive`. The app's tokens, in its existing `--motion-*` style:

```css
:root {
  --motion-micro: 80ms;     /* duration.micro   — row opacity on hover */
  --motion-state: 100ms;    /* duration.state   — cell colour, icon swaps */
  --motion-popover: 150ms;  /* duration.popover — menus, date picker */
  --motion-overlay: 200ms;  /* duration.overlay — inspector panel, sheets */
  --motion-theme: 250ms;    /* duration.theme */
  --motion-exit: 100ms;     /* duration.exit    — ease-in, flat */
  --motion-ease: cubic-bezier(0.2, 0, 0, 1);  /* ease.standard */
  --motion-ease-colour: ease-out;              /* ease.colour */
  --motion-travel: 12px;    /* a sheet's slide as it fades in */
}
@media (prefers-reduced-motion: reduce) {
  :root { --motion-travel: 0px; }  /* still fades, no longer slides */
}
```

In Tailwind v4, `--ease-*` in `@theme` generates `ease-*` utilities; durations have no theme namespace, so use `duration-(--motion-state)`. A v3 config extends `transitionDuration` and `transitionTimingFunction`; a JS theme object carries `motion.duration.state` and `motion.spring.snappy` beside its colours.

## Deriving a project's ladder from its code

A worked case: a codebase with 31 distinct durations.

1. **Cluster by value and by what moves.** 150ms, 160ms and 175ms are all hover colours: one tier. 300ms and 350ms are both drawers: one tier. A lone 1200ms is a toast's auto-dismiss, a timer rather than motion, so out of scope.
2. **Name each cluster's role** by the area it changes, not its name in code: a `--slow` token on every tooltip is `duration.popover`.
3. **Compare with the preset.** A consistent cluster within ~20ms of the dial keeps its value, recorded, because users already know its rhythm; a scattered one snaps to the dial.
4. **Check the ordering.** Tooltips (popover) that outrun drawers (overlay) put the ladder upside down: an open issue whatever the numbers.
5. **Class what's left** under law 4 or list it as a stray; nothing remains unclassed. One component can hold both: in a Glass package gallery, a photograph dissolving to the next is the subject, but the same photograph moving between layouts is state, in the overlay tier.
6. **Write it to `DESIGN.md`** with the counts: *"`duration.state` → `--dur-fast` 150ms; 42 uses; 9 strays at 160–180ms snapped."*
