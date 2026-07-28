# Easing and duration

## Why duration tracks screen area

The rule — duration is set by how much of the screen changes, not by how important the element is — has a perceptual basis. The eye needs time proportional to the *distance it has to travel* and the *area it has to re-parse*. A background colour changing under a 40px button is one saccade. A whole page fading in is a re-read.

Tying duration to importance instead produces the classic mistake: the primary CTA gets a 500ms flourish while a nav row gets 150ms, so the interface feels inconsistent *and* the most-used control is the slowest.

The ladder, with the area logic explicit:

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

Text links fade to 60% opacity in 100ms with `ease-out`. Not the house curve — opacity clamps at 1, so an overshooting bezier has nothing to overshoot into; the curve's tail is wasted and the transition just feels slightly mistimed.

100ms is at the edge of perceptible. That's the point: a hover response should feel like it *already happened*, not like it's happening. Anything above ~150ms on a hover state starts to feel like lag on fast pointer movement across a list of links.

## The 150ms tier does most of the work

Colour transitions, background changes, small transforms, icon swaps, the marker that grows in a table of contents. If you're unsure which tier something belongs to, it's 150ms.

```tsx
"transition-colors duration-150 ease-geist"
"transition-[width,background-color] duration-150 ease-geist"
"transition-[color,background-color,box-shadow,transform] duration-150 ease-geist"
```

**Always enumerate properties.** `transition-all` animates properties you didn't intend — including ones that trigger layout, and ones a parent will later add. The explicit list is longer to write and strictly better.

## Where 200ms is right

The gap between 150 and 200 is small but real, and it maps to *whether other things move too*.

- A chevron rotating 180° in a disclosure: 200ms. The rotation itself is small, but the panel opening below it is not, so the chevron matches the larger event.
- A hover card scaling in: 200ms. It's a new object with content, appearing over existing content.
- The menu glyph's two bars rotating into a cross: 200ms. Two elements moving in opposition read as one compound gesture.

## Why route transitions are 260ms

```css
.route-fade { animation: routeFade 260ms var(--ease-geist) both; }
@keyframes routeFade { from { opacity: 0 } to { opacity: 1 } }
```

A route transition sits directly on the path between "I clicked" and "I can read." Every millisecond is latency the user attributes to *the site being slow*, not to *the transition being smooth*.

260ms is the shortest crossfade that still reads as intentional rather than as a flicker or a repaint glitch. Below ~200ms a full-viewport opacity change starts to look like a rendering artefact.

Note it's opacity-only — no slide, no scale. A directional page transition implies a spatial relationship between routes, and in a flat site map (home, experience, writing, playground) there isn't one. Directional motion that doesn't correspond to real structure is noise.

Implementation detail: keying the wrapper on the pathname is what replays the CSS animation on every navigation.

```tsx
<div key={pathname} className="route-fade">
```

`both` on the animation fill mode holds the `from` state before the animation starts, preventing a one-frame flash of fully-opaque content.

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

**400ms, longest on the ladder** — because it is genuinely the largest change available. Every surface, every text colour, every border, every icon fill, every shadow, simultaneously. At 150ms it reads as a jarring flash; at 400ms it reads as the lights coming up.

**Plain `ease`, not the house curve** — the house curve overshoots. Overshoot on a position is momentum. Overshoot on a colour interpolation means the background travels *past* its target colour and comes back, which reads as a wobble in the light. Colour has no mass, so it gets no physics.

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

This is the critical part. A universal colour transition left permanently in the stylesheet would apply to *every* hover state on the site — every link, every nav icon, every row — making all of them 400ms and sluggish. It exists for ~440ms (the duration plus a 40ms margin) during the one interaction that needs it, and then it's gone.

The `!important` is load-bearing: it has to beat every component's own `transition-colors duration-150` for those 440ms.

Also note the whole block is inside `prefers-reduced-motion: no-preference`, so it's opt-in rather than opt-out. The theme still changes for those users; it just changes instantly.

## Bezier or spring?

| Use a bezier when | Use a spring when |
|---|---|
| The property has no position (opacity, colour, filter) | Something is physically moving |
| The change is a discrete state flip | The motion can be interrupted or re-targeted mid-flight |
| You want the *same* feel as everything else | You want a specific character |
| Duration must be exact and predictable | Arrival time can vary a little |

The heuristic: **if the user could grab it, or if it could change target mid-flight, it's a spring.** A shared highlight moving between rows can be re-targeted three times in 400ms as the pointer crosses items — a bezier restarts from a standstill each time and looks broken; a spring inherits its current velocity and just curves toward the new target.

## The overshoot in the house curve

```
cubic-bezier(0.175, 0.885, 0.32, 1.1)
```

The `1.1` in the final control point puts the curve above 1 near the end — the value exceeds its target and settles back. The overshoot is small (~10%) and brief.

That single number is what makes 150ms colour transitions feel like something *happened* rather than something was *set*. And because every non-spring transition on the site shares it, elements that have nothing to do with each other still feel like one mechanism when they move together.

Anti-pattern: authoring a second curve because a particular element "needs a different feel." A second curve halves the coherence and buys almost nothing. If an element genuinely needs distinct character, it needs a spring — that's the axis where character is expressible without fragmenting the system.
