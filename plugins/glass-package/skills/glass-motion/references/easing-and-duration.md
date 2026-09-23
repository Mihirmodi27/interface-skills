# Easing and duration

## Why duration tracks screen area

Duration follows how much of the screen changes, not importance, because the eye needs time proportional to the *distance it travels* and the *area it re-parses*. A background colour changing under a 40px button is one saccade; a whole page fading in is a re-read.

Tie it to importance and you get the classic mistake: the primary CTA gets a 500ms flourish, a nav row 150ms, so the interface feels inconsistent *and* the most-used control is the slowest.

| Duration | Area changing | Examples |
|---|---|---|
| 0 | a single element's fill | press scale, focus ring |
| 100ms | one property, no position | link opacity on hover |
| 150ms | one small element | colour, background, icon swap, marker width |
| 200ms | a small element plus its surroundings | chevron rotation, hover card appearing |
| 260ms | the whole viewport, on the critical path | route fade |
| 300ms | a large region entering or collapsing | reveal-on-scroll, a region collapsing to zero |
| 400ms | literally everything | theme crossfade |

## The 100ms tier

```tsx
className="transition-opacity duration-100 ease-out hover:opacity-60"
```

Text links fade to 60% opacity in 100ms with `ease-out`. Not the house curve: opacity clamps at 1, so an overshooting bezier has nothing to overshoot into, and its wasted tail makes the transition feel slightly mistimed.

100ms is at the edge of perceptible, which is the point: a hover response should feel like it *already happened*. Above ~150ms, a hover state lags as the pointer sweeps a list of links.

## The 150ms tier does most of the work

Colour, background, small transforms, icon swaps, the marker that grows in a table of contents. If you're unsure of the tier, it's 150ms.

```tsx
"transition-colors duration-150 ease-geist"
"transition-[width,background-color] duration-150 ease-geist"
"transition-[color,background-color,box-shadow,transform] duration-150 ease-geist"
```

**Always enumerate properties.** `transition-all` animates properties you didn't intend, including ones that trigger layout and ones a parent adds later. The explicit list is longer and strictly better.

## Where 200ms is right

The gap between 150 and 200 maps to *whether other things move too*.

- A chevron rotating 180° in a disclosure: 200ms. The rotation is small, but the panel opening below it isn't, so the chevron matches the larger event.
- A hover card scaling in: 200ms. It's a new object with content, appearing over existing content.
- The menu glyph's two bars rotating into a cross: 200ms. Two elements moving in opposition read as one compound gesture.

## Why route transitions are 260ms

```css
.route-fade { animation: routeFade 260ms var(--ease-geist) both; }
@keyframes routeFade { from { opacity: 0 } to { opacity: 1 } }
```

A route transition sits between "I clicked" and "I can read", so every millisecond is blamed on *the site being slow*. 260ms is the shortest crossfade that still reads as intentional; below ~200ms a full-viewport opacity change looks like a rendering artefact.

It's opacity-only — no slide, no scale. A directional transition implies a spatial relationship between routes, and a flat site map (home, experience, writing, playground) has none, so it would be noise.

Keying the wrapper on the pathname is what replays the CSS animation on every navigation:

```tsx
<div key={pathname} className="route-fade">
```

`both` on the fill mode holds the `from` state before the animation starts, preventing a one-frame flash of fully opaque content.

## Why the theme crossfade breaks both rules

```css
@media (prefers-reduced-motion: no-preference) {
  :root.theme-transition,
  :root.theme-transition *,
  :root.theme-transition *::before,
  :root.theme-transition *::after {
    transition: background-color 400ms ease, color 400ms ease, border-color 400ms ease,
      fill 400ms ease, stroke 400ms ease, box-shadow 400ms ease !important;
  }
}
```

**400ms, longest on the ladder**, because it is the largest change available: every surface, text colour, border, icon fill and shadow at once. At 150ms it reads as a jarring flash; at 400ms, as the lights coming up.

**Plain `ease`, not the house curve.** Overshoot on a position is momentum; on a colour interpolation the background travels *past* its target and comes back, a wobble in the light. Colour has no mass, so it gets no physics.

**A class applied only on explicit toggle**, then removed:

```ts
export function setThemeChoice(choice: ThemeChoice): void {
  localStorage.setItem(KEY, choice);
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-transition"), 440);
}
```

The critical part: left in the stylesheet, a universal colour transition would make *every* hover state — every link, nav icon and row — a sluggish 400ms. It exists for ~440ms (the duration plus a 40ms margin), during the one interaction that needs it.

The `!important` is load-bearing: it has to beat every component's own `transition-colors duration-150` for those 440ms. And the block sits inside `prefers-reduced-motion: no-preference`, so it's opt-in; for those users the theme still changes, instantly.

## Bezier or spring?

| Use a bezier when | Use a spring when |
|---|---|
| The property has no position (opacity, colour, filter) | Something is physically moving |
| …but see below — a *filter* can't take the overshooting one | |
| The change is a discrete state flip | The motion can be interrupted or re-targeted mid-flight |
| You want the *same* feel as everything else | You want a specific character |
| Duration must be exact and predictable | Arrival time can vary a little |

**If the user could grab it, or it could change target mid-flight, it's a spring.** A shared highlight can be re-targeted three times in 400ms as the pointer crosses items: a bezier restarts from a standstill each time and looks broken; a spring inherits its velocity and curves toward the new target.

## The overshoot in the house curve

```
cubic-bezier(0.175, 0.885, 0.32, 1.1)
```

The `1.1` in the final control point takes the value past its target near the end and back: a small (~10%), brief overshoot.

That number makes 150ms colour transitions feel like something *happened* rather than was *set*, and sharing it makes unrelated elements moving together feel like one mechanism. A second curve for an element that "needs a different feel" halves the coherence for almost nothing; distinct character needs a spring.

## The one property class the house curve can't have

The overshoot is safe on `transform` (10% past a translation and back is the impression it's for) and meaningless on opacity, which clamps at 1. The third case is a correctness bug, not taste:

**A property with a hard floor at zero cannot take a curve that goes past its target.**

```ts
// Lines staggering in behind a blur: filter: blur(4px) → blur(0px).
// --ease-geist would pass through a NEGATIVE radius to settle back.
const EASE = [0.16, 1, 0.3, 1] as const;   // expo-out: decelerates hard, never exceeds 1
```

The class: `blur()`, `brightness()`, `saturate()` toward 0, `border-radius` toward 0, any scale you've promised won't invert. Browsers clamp, so there's no error: the value sticks at zero while the rest of the track settles, which reads as the animation *stalling* at the end and is very hard to attribute.

So ask **what else is riding this track?** Transform and opacity together are fine; add a filter and the whole track needs a monotone curve. Expo-out `cubic-bezier(0.16, 1, 0.3, 1)` keeps the "arrives decisively then eases" character without leaving [0, 1], so it isn't a second *character* curve.

## Durations that legitimately sit off the ladder

The ladder is for **state**; §1 of the SKILL.md argues the two exceptions. The pair that shows the discipline, from one gallery component:

```ts
const DISSOLVE = 0.62;  // stepping between photographs — the subject
const FLIGHT   = 0.42;  // the same photo moving between layouts — a state change
```

The dissolve is the content being watched, so it gets 620ms to read as a dissolve rather than a cut; the flight only has to be *followable*, with the photograph on screen at both ends, so it stays inside the overlay tier. A greeting screen can take two and a half seconds only because it plays once per tab, never blocks a deep link and never runs under reduced motion (§14 of the SKILL.md covers gating one).
