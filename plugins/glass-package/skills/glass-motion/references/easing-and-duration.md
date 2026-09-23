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
| …but see below — a *filter* can't take the overshooting one | |
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

## The one property class the house curve can't have

The overshoot is safe on `transform` — going 10% past a translation and settling back is exactly the physical impression it's for. It's meaningless on opacity, which clamps at 1. But there is a third case, and it's a correctness bug rather than a matter of taste:

**A property with a hard floor at zero cannot take a curve that goes past its target.**

```ts
// Lines staggering in behind a blur: filter: blur(4px) → blur(0px).
// --ease-geist would have to pass through a NEGATIVE radius to settle back.
const EASE = [0.16, 1, 0.3, 1] as const;   // expo-out: decelerates hard, never exceeds 1
```

The class of properties: `blur()`, `brightness()`, `saturate()` toward 0, `border-radius` toward 0, any scale you've promised won't invert. Browsers clamp rather than crash, so the symptom isn't an error — it's a value that sticks at zero for the tail of the transition while everything else on the same track is still settling. Which reads as the animation *stalling* right at the end, and is very hard to attribute.

The check before you reach for the house curve: **what else is riding this track?** A transform and an opacity together are fine. Add a filter and the whole track needs a monotone curve.

Expo-out `cubic-bezier(0.16, 1, 0.3, 1)` is the right substitute. It has the same "arrives decisively then eases" character the house curve has, without ever leaving [0, 1]. Using it does not fragment the system in the way a second *character* curve would — it's the same intent, expressed by a curve that's legal for the property.

## Durations that legitimately sit off the ladder

The ladder is for **state**: something changed, and the user needs to follow it. Two categories aren't state, and squeezing them onto the ladder makes them worse rather than tighter.

**The subject of the moment.** When the thing animating *is* the content rather than chrome reporting a change to it, the user is looking directly at it and the motion has to be readable in its own right. An image gallery's dissolve between photographs runs 620ms — a noise-thresholded dissolve needs time to read as a dissolve rather than a cut.

The discipline is in the pair, though. In the same component:

```ts
const DISSOLVE = 0.62;  // stepping between photographs — the subject
const FLIGHT   = 0.42;  // the same photo moving between layouts — a state change
```

The flight stays inside the overlay tier because the photograph is already on screen at both ends; it only has to be *followable*. Same component, two durations, decided by whether the motion is the subject or the report.

**A once-a-session set piece.** A greeting screen can take two and a half seconds. It's exempt because it happens once per tab, never blocks a deep link, and never plays under reduced motion — and it has to keep earning that by never appearing again. See §14 of the SKILL.md for how to gate one.

The test: **would a user see this more than a handful of times a session?** If yes, it's on the ladder. If no, it can have its own budget.
