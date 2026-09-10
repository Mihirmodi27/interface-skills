---
name: interface-motion
description: Design and audit interface animation — a duration ladder tied to how much of the screen changes, one shared easing curve, springs tuned by character rather than by number, asymmetric open/close, shared-element highlights that slide between targets, GPU escalation for a single travelling element, squash-and-stretch from disagreeing springs, icon fill as the one signal for chosen, once-a-session set pieces, reveal-on-scroll, route transitions, theme crossfades, press feedback, rAF-throttled scroll listeners, hover intent, and synthesised UI sound. Use when adding or reviewing animations, transitions, menus, dropdowns, sheets, disclosures, tooltips, hover states, icon states, splash or greeting screens, scroll effects, page transitions, or motion that feels sluggish, floaty, janky, or gratuitous — and always when implementing reduced-motion, no-JavaScript, reduced-transparency, or touch-versus-pointer behaviour.
---

# Interface Motion

Motion in a text-heavy interface has one job: **make a change legible.** Not to delight, not to demonstrate craft. If you can remove an animation and the user is no less clear about what happened, remove it.

That constraint is generative rather than limiting. It gives you a way to decide every duration (how much changed?), every easing (is this physical or is it a fade?), and every spring (what character should this have?). And it means the few places you *do* spend motion — a menu that squashes as it opens, a highlight that slides between rows — land hard, because nothing around them is competing.

The reference implementation is [modimihir.com](https://modimihir.com): CSS transitions for state, [Motion](https://motion.dev) for anything spring-driven or presence-driven.

## 1. The duration ladder

Duration is set by **how much of the screen changes**, not by how important the element feels.

| Tier | Duration | What moves | Easing |
|---|---|---|---|
| Instant | 0ms | Press feedback, focus rings | none |
| Micro | 100ms | Link opacity on hover | `ease-out` |
| State | **150ms** | Colour, background, small transforms, icon swaps | the house curve |
| Popover | **200ms** | A disclosure chevron, a hover card, a menu glyph | the house curve |
| Overlay | **300ms** | Reveal-on-scroll, a collapsing region | the house curve |
| Route | 260ms | An incoming page fading in | the house curve |
| Theme | 400ms | Every colour on the page at once | plain `ease` |

Three numbers carry almost everything: **150 / 200 / 300**. Memorise those and you rarely need to think about duration again.

Two entries break the pattern deliberately:

- **Route at 260ms**, not 300. A page transition is on the critical path to content — every millisecond is latency the user feels as slowness. 260 is the shortest crossfade that still reads as a transition rather than a flicker.
- **Theme at 400ms with plain `ease`.** This is the largest possible change (every surface, every text colour, every border simultaneously) so it gets the longest duration. And it's the one case where the overshooting house curve is *wrong* — colour doesn't have momentum, so an overshoot on a background-colour interpolation just looks like a wobble.

Nothing loops. Nothing animates to attract attention. Nothing on this ladder exceeds 400ms.

### Two things that sit off the ladder, and why that's allowed

The ladder is for **state**: something changed and the user needs to follow it. Two categories legitimately aren't state, and forcing them onto the ladder makes them worse rather than tighter.

**The subject of the moment.** In an image gallery, stepping between photographs dissolves over **620ms** — half again the longest state duration:

```ts
const DISSOLVE = 0.62;  // stepping between photographs
const FLIGHT   = 0.42;  // the same photograph moving between two layouts
```

The photograph *is* the content, not chrome reporting a change to it. A noise-thresholded dissolve needs time to read as a dissolve rather than a cut, and the reader is looking directly at the thing that's animating. Note the discipline in the pair: the flight — the same photo travelling between two layouts — stays at 420ms, inside the overlay tier, because that *is* a state change and the photo is already on screen at both ends. **Same component, two durations, decided by whether the motion is the subject or the report.**

**A once-a-session set piece.** The opening screen runs 560ms in, holds 1400ms, and takes about 2.5 seconds end to end. That is indefensible as interaction and fine as a greeting, because it happens once per tab, never blocks a deep link, and never plays under reduced motion. It gets its own budget precisely because it's *not* on the interaction path.

The test: **would a user see this more than a handful of times a session?** If yes, it's on the ladder. If no, it can have its own timing — but it has to earn the exemption by never appearing again.

## 2. One easing curve

```css
--ease-geist: cubic-bezier(0.175, 0.885, 0.32, 1.1);
```

One curve for the whole site. The `1.1` end control point overshoots slightly and settles back — enough to feel physical, not enough to read as bounce. A single shared curve is why unrelated elements moving at the same time still feel like one system.

Where it doesn't apply:

- **Opacity-only micro-transitions** use `ease-out` at 100ms. Opacity has no position, so overshoot is meaningless (and clamps at 1 anyway).
- **The theme crossfade** uses plain `ease`, per above.
- **Anything spring-driven** doesn't use a bezier at all.
- **Any track that also drives a filter.** This one is a correctness constraint, not taste: an overshooting curve passes *beyond* its end value, and a `blur()` animating to `0px` would have to go through a negative radius to get back. Use an expo-out instead — `cubic-bezier(0.16, 1, 0.3, 1)`, which decelerates hard and never exceeds 1.

```ts
// Lines staggering in behind a blur. Not --ease-geist: the same track drives
// filter: blur(4px) → blur(0px), and the house curve would overshoot past zero.
const EASE = [0.16, 1, 0.3, 1] as const;
```

The generalisable version: **check what else is riding the curve.** Overshoot is safe on transform and meaningless on opacity, but any property with a floor at zero — blur, brightness, a border radius, a scale you've promised won't invert — cannot take a curve that goes past its target.

Never write a second bezier "because this one needs to feel different." Reach for a spring instead — that's the axis where character belongs. The exception above is a different thing: it isn't a second character, it's the same intent expressed by a curve that's legal for the property.

→ Full reasoning, plus the bezier-vs-spring decision: `references/easing-and-duration.md`

## 3. Springs, tuned by character

Three springs, each with a job. Note that two are specified as `bounce`/`duration` (a designer's controls) and one as `stiffness`/`damping`/`mass` (a physicist's) — use whichever expresses the intent more directly.

```ts
// Shared UI element sliding to a new target — a highlight, a tooltip.
// Almost no bounce: this is a thing moving, not a thing arriving.
const SLIDE = { type: "spring", bounce: 0.2, duration: 0.4,
                opacity: { duration: 0.16, ease: "easeOut" } } as const;

// Cards rising out of a folder. More bounce, more time — this one is playful
// on purpose, and it's the only place on the site that is.
const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;

// A menu opening. Two springs that deliberately DISAGREE — see §4.
const GROW  = { type: "spring", stiffness: 620, damping: 19, mass: 0.85 } as const;
const CROSS = { type: "spring", stiffness: 380, damping: 30 } as const;

// Closing. Flat and quick — a bounce on the way out reads as indecision.
const CLOSE = { duration: 0.13, ease: "easeIn" } as const;
```

**Opacity is decoupled from position inside a spring.** In `SLIDE`, position springs over 400ms while opacity is a 160ms `easeOut` tween. A spring on opacity would visibly overshoot toward transparent and back — a flicker. Position wants physics; opacity wants a curve. Always split them.

→ Tuning guide, bounce vs damping, how to arrive at these numbers: `references/springs.md`

## 4. Squash and stretch, out of physics

The best motion detail in the system, and it's four lines of config.

A menu opens by scaling from the edge it's anchored to. Instead of one spring driving both axes, the **grow axis and the cross axis get springs of different character**:

- `GROW` (stiffness 620, damping 19, mass 0.85) — light and underdamped. It sails past its final size.
- `CROSS` (stiffness 380, damping 30) — stiffer, heavily damped, slower. It arrives late.

Through the overshoot the panel is briefly **taller and narrower** than it ends up, then settles. That's squash and stretch — the classic animation principle — emerging from physics rather than a hand-authored keyframe timeline. It's interruptible, it's velocity-aware, and it took no timeline at all.

```tsx
transition={{
  scaleY: GROW,   // the grow axis overshoots
  y:      GROW,   // travel rides the same spring, so they stay locked
  scaleX: CROSS,  // the cross axis lags
  opacity: { duration: 0.14, ease: "easeOut" },
}}
```

The generalisable rule: **when two axes of one element move together, giving them different springs creates deformation, and deformation reads as mass.**

## 5. Asymmetric open and close

| Direction | Character | Duration |
|---|---|---|
| Open | spring, overshoots | ~400ms effective |
| Close | tween, `easeIn`, flat | 130ms |

Opening is the user's intent being answered — it can afford personality. Closing is the user having already moved on; a bounce on exit reads as the interface being *reluctant*, and it delays whatever they're reaching for next. Close fast, close flat.

This asymmetry applies to the exit *offsets* too. Open starts from `scaleY: 0.82, scaleX: 0.94` — a real squash. Exit only goes to `scaleY: 0.9, scaleX: 0.97` — it doesn't need to travel the full distance, because it's disappearing anyway.

## 6. Shared elements

The signature interaction: in a dock or a list, **one** highlight rectangle and **one** tooltip exist, and they animate their `x / y / width / height` to whichever item is hovered.

```tsx
// One element. It re-targets. It does not remount.
<m.div
  aria-hidden
  className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight"
  initial={false}
  animate={hovered
    ? { x: hovered.x, y: hovered.y, width: hovered.w, height: hovered.h, opacity: 1 }
    : { opacity: 0 }}
  transition={SLIDE}
/>
```

Moving between items reads as one physical object sliding, not as two elements cross-fading. Per-item hover backgrounds produce a flicker as one fades out while the next fades in; a shared element cannot, because there's only one of it.

Three details that make it work:

- **`initial={false}`** — skip the mount animation. Without it the highlight flies in from the origin on first paint.
- **`isolate` on the container, `-z-10` on the highlight** — the bar sits behind the icons but inside its own stacking context, so it can't slip behind the container's own background.
- **Measure with `offsetLeft/offsetTop`, not `getBoundingClientRect()`** — offsets are relative to the positioned parent, which is the coordinate space the absolute highlight already lives in. No scroll maths, no reflow read.

→ The pattern in full, including the tooltip variant and hit-target measurement: `references/shared-element.md`

### When the DOM element isn't enough

A shared highlight works because it's one small rectangle. A shared *photograph* travelling between two layouts is a different problem: animating an `<img>` between two boxes of different aspect ratios distorts it, and re-laying-out a hundred-tile wall on every frame of the trip is not affordable.

The reference implementation puts one viewport-sized canvas above the gallery and draws the open photo into an arbitrary screen rect. The trip becomes four numbers in a uniform, so it costs no reflow at any size. Four rules make that safe rather than clever:

- **Only the decorative element goes on the GPU.** The wall stays DOM. A hundred tiles as textures is ~590MB before any atlasing, and those tiles carry the keyboard and screen-reader semantics a canvas can't. The open photo is `alt=""` — the labels live in the strip beside it — so nothing is lost by drawing it.
- **Failing must return `null`, never throw.** This runs inside an effect; an exception takes the gallery down instead of falling back. The caller keeps its `<img>` whenever there's no context — which is also the path for reduced motion, and the path if the GPU drops the context later.
- **Carry the reading position across.** Before the layout switch, find the tile nearest the centre of the viewport and open the other layout on *that* item, from *that* rect. Leaving a wall at photo 60 and arriving at the top of a filmstrip is a worse transition than no transition. Measure it while the outgoing layout is still rendered — from the store's synchronous subscriber, before React commits the incoming one.
- **Each end keeps its own shape.** Two rects, not one: consecutive photographs aren't the same aspect ratio, and a single shared rect draws one of them stretched for the whole dissolve. Interpolate them separately and share a centre; two rects of equal aspect stay that aspect through a linear lerp, so nothing can distort.

**The generalisable rule: escalate to the GPU for one element, not for a view.** The moment the canvas owns something with semantics or with a hundred instances, you've traded accessibility and memory for a transition.

## 7. Reduced motion is a branch, not a switch

Every animated component reads the preference and takes a different path. There is no global "disable animations" — that's how you end up with a menu that pops into existence with no indication it opened.

```tsx
const reduce = useReducedMotion();
const tween = reduce ? { duration: 0.15 } : SLIDE;
```

The four substitution strategies:

| Original | Reduced | Why |
|---|---|---|
| Spring slide | 150ms tween | Keeps the state change legible, drops the physics. |
| Squash-and-stretch open | plain fade | Presence is still communicated. |
| Reveal-on-scroll | fully off, content visible | The animation *is* the effect; there's nothing to degrade to. |
| Blur crossfade | crossfade, `blur(0px)` | Blur is the vestibular trigger, the fade isn't. |

```tsx
// Reduced motion means no elastic scaling — but you still see it appear.
initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.82, scaleX: 0.94, y: 4 }}
```

Also honour `prefers-reduced-transparency` (glass → solid) and `prefers-contrast: more` (add borders) — see the **color-and-theming** skill. And pass the preference through to imperative APIs, which don't read it themselves:

```tsx
el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
```

→ Every guard in the system, and how to test them: `references/reduced-motion.md`

## 8. Scroll: one listener, one rAF

Every scroll-driven behaviour follows the same shape.

```ts
let ticking = false;
const onScroll = () => {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
};
window.addEventListener("scroll", onScroll, { passive: true });
```

`passive: true` tells the browser it can scroll without waiting to see if you'll `preventDefault()`. The `ticking` flag collapses a burst of scroll events into one measurement per frame. Both are mandatory, not optimisations.

**Hysteresis stops flicker.** A dock that collapses on scroll-down needs a dead zone, or a 1px jitter toggles it forever:

```ts
if (y < 24 || atBottom) setShrunk(false);       // always open at either end
else if (y > last + 6) setShrunk(true);         // 6px of intent required
else if (y < last - 6) setShrunk(false);
```

**Never hide an affordance where it can't come back.** The dock collapses only on devices that can hover it open again:

```ts
if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
```

On touch there is no hover, so a collapsed dock would strand the navigation. This is the general principle behind every hover-revealed control: gate it on the capability, and give touch its own path.

→ Scroll spies, `scroll-mt` alignment, rAF throttling: `references/scroll-performance.md`

## 9. Reveal on scroll

CSS does the animating; JavaScript only adds a class.

```css
.reveal { opacity: 0; transform: translateY(8px);
          transition: opacity 300ms var(--ease-geist), transform 300ms var(--ease-geist); }
.reveal.in { opacity: 1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

An `IntersectionObserver` adds `.in` and immediately **unobserves** — a reveal is one-shot, and re-animating on scroll-back is nauseating. `threshold: 0.1` with `rootMargin: "0px 0px -40px 0px"` means an element fires when it's genuinely on screen rather than the instant its top edge crosses.

8px of travel. Enough to register as movement, small enough that a page of revealing paragraphs doesn't feel like it's sliding around.

Three failure modes the implementation guards against.

**No `IntersectionObserver`** — add `.in` to everything immediately. Never leave content at `opacity: 0` behind a feature check.

**Route changes** — re-run the observer keyed on the pathname, or the new page's elements are never observed.

**No JavaScript at all.** This is the one people miss, and a feature check doesn't catch it: the CSS ships, the class applies, and the script that would add `.in` never runs. The result is a correct document the reader cannot see. The guard is two lines in the document head:

```html
<noscript>
  <style>.reveal { opacity: 1 !important; transform: none !important; }</style>
</noscript>
```

The general principle: **any CSS that hides content pending JavaScript needs a `<noscript>` reset.** Reveal-on-scroll is the common case, but so is anything gated on a hydrated class — and this is a correctness bug, not a progressive-enhancement nicety, because the failure mode is a blank page rather than a plain one.

## 10. Performance: `m` not `motion`

```tsx
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

<LazyMotion features={domAnimation} strict>
  <m.div … />
</LazyMotion>
```

`motion.div` bundles the full feature set at import. `m.div` ships a minimal component and `LazyMotion` loads only the feature bundle you name — `domAnimation` (no layout animations, no drag) is a fraction of the size. `strict` makes it a build error if a `motion.*` component sneaks in and defeats the whole arrangement.

Two more rules:

- **Animate `transform` and `opacity`.** They're compositor-only. `width`/`height`/`top`/`left` trigger layout on every frame. The shared highlight animates `width`/`height` and gets away with it because it's a single absolutely-positioned element outside the flow — but that's the exception you should be able to justify.
- **A transform on a parent weakens `backdrop-filter` in its subtree.** Split the animating wrapper from the glass surface: the wrapper scales, the child carries the blur. This is why the menu component animates a bare `<m.div>` and the panel inside it holds the `glass-panel` class.

## 11. Hover intent

A 100ms grace period on close, so moving the cursor from a trigger into the menu it opened doesn't close it in the gap between them:

```ts
const closeBoxSoon = () => {
  clearTimeout(closeTimer.current);
  closeTimer.current = window.setTimeout(() => setConfigOpen(false), 100);
};
```

Cheaper alternative where the geometry allows: a **hover bridge** — padding on the wrapper that spans the visual gap, so the pointer never leaves the hover region at all (`pt-2.5` between a button and the pill below it). Use the bridge when the elements are adjacent; use the timer when they aren't.

Always clear the timer on unmount and on navigation.

## 12. Press and sound

```
active:scale-[0.92]   /* 8% — felt, not seen */
```

On the press, not the release. Respond to `pointerdown`; waiting for `click` feels dead.

The site also plays a synthesised "tok" on hover and click — Web Audio, no asset files, a sine fundamental plus a marimba-like 3.9:1 partial with a fast decay and a lowpassed noise transient for the wooden attack. Hover is quiet and high (1200Hz, 0.09s, 0.05 gain); click is lower and louder (900Hz, 0.14s, 0.13 gain). It's gated behind the autoplay policy, muteable, and persisted.

Two rules the reference implementation learned the hard way, both worth having before you write the first line:

**Arm the context on every gesture the browser accepts as activation, not just the one you expect.**

```ts
const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;
```

Listening on `pointerdown` alone is the bug. Hover is not activation in any engine, so a reader who moves the mouse across the dock without clicking hears nothing — and there is no later gesture to recover from, because *the hover was the interaction*. It's worse for the keyboard: tab to a link, press Enter, and the resulting `click` still finds a suspended context. Keyboard-only readers never hear the site at all, on any screen. Attach all three, keep the handler idempotent (`resume()` on a running context is a no-op, cheaper than the bookkeeping to detach), and note that `wheel` is deliberately excluded — scrolling counts as activation in no engine, so including it just moves the silence somewhere harder to find.

**Give dense surfaces a way to opt out of hover sound.**

```ts
if (el && !el.closest("[data-quiet-hover]")) playHover();
```

An image wall or a filmstrip is a hundred small targets in a row. A tick per tile as the cursor crosses them is a machine gun, not feedback. Clicks still sound — the opt-out is about *rate*, not about the surface being unimportant.

**Sound can be a phrase, not just an event.** Where the site plays a run of notes — one per photograph flicking past in the opening screen — they're written out as an A major pentatonic run rather than computed from an interval, because the run comes up short whenever an image fails to load and drops its turn. Pentatonic is the scale where no two notes can sound wrong together, so a truncated phrase still resolves. The landing note is the only accented one and sits a fifth *below* where the run started, so it closes the phrase instead of sounding like one more step.

This is the most optional thing in the system. If you add it: hover sound on mouse only (`pointerType === "mouse"`), a visible mute control, and default to *on* only if you're confident. Full synthesis walkthrough and the delegation pattern: `references/sound.md`

## 13. Fill means chosen

A rule about icons that is really a rule about motion, because the mechanism is a crossfade.

**An icon is filled when, and only when, it is the thing you've picked or the thing you're pointing at.** Nothing is filled because it looks better. Reporting a selection and previewing one are the same gesture a beat apart, so they get the same treatment: the glyph commits to "this one" under the pointer, and simply stays committed if you click. Where both are on screen at once — a hovered item in a dock whose current page is elsewhere — the sliding highlight from §6 is what tells them apart.

The mechanism matters as much as the rule. **A filled variant is not a second drawing.** It's the same outline with its interior painted in, layered *over* the stroke at the same coordinates:

```tsx
export const fillFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`;

// The inverse, for interior lines a solid shape swallows — a briefcase's
// divider, a document's rules. They have to leave as the fill arrives.
export const detailFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${on ? "opacity-0" : "opacity-100"}`;
```

Because the silhouette never moves between states, the two layers cross-fade in place: no pop, no reflow, nothing to line up by hand. Two details:

- **200ms `ease-out`, not the house curve.** Same split the springs make — the overshoot is right for travel and wrong for a fade.
- **Interior detail needs a knockout, not deletion.** Where the filled shape would swallow a line, paint the silhouette through a mask: the shape in white (fill *and* stroke, so it matches the outline exactly), the interior lines in black at the stroke width the outline used, so each gap lands where its line was.

**Three kinds of mark sit outside the rule**, and knowing why is what keeps it from becoming decoration:

| Mark | Why fill is wrong | What it does instead |
|---|---|---|
| Brand marks — socials, a tech stack | They're official solid silhouettes; an outlined form would be an off-brand redrawing | Colour: quiet at rest, full on hover |
| Open strokes — chevrons, arrows, checks, menu bars | No interior to paint | A stroke-weight ladder by role |
| A mark on static content, or a lone toggle | Never hovered, never current — or the only mark on screen | Stays in the default state |

That last row is the one to internalise: **fill that distinguishes nothing is just weight.** A single toggle whose glyph already changes shape has nothing to be picked out *from*, so filling it adds mass and no meaning.

## 14. Set pieces play once

Some motion is a greeting rather than feedback: an opening screen, a summary panel's first reveal. It's allowed to be longer and more theatrical than anything on the duration ladder — on the condition that it happens **once a session** and never blocks anything.

```ts
// Once a session, per item. The theatre is a welcome; a re-run is a delay.
const seenKey = (slug: string) => `short-version:${slug}`;
```

Four rules, and each one is a bug the reference implementation hit.

**Decide before the first pixel, in an inline script.** Whether a greeting plays depends on `sessionStorage`, which the server can't see — so the decision can't come from React without a frame of the page appearing before the overlay covers it. Set an attribute on `<html>` from a blocking inline script and let CSS answer the question at paint. The component's only job is to *end* it, by flipping the attribute.

```js
// Home page only, first landing of the session only, never under reduced motion.
// A link to a section (/#work) is someone asking for that section — a deep link
// skips the greeting too.
document.documentElement.dataset.intro = "on";
```

**A filling animation beats a declared value.** If the entrance is a CSS animation with `both`, you cannot transition out of it with a plain declaration — the animation's `to` state wins. Replace the animation rather than layering a transition over it.

**Branch transitions on the client-only flag, never rendered styles.** "Has this played before?" is false on the server for everyone and true on the client for most. Branch a *style* on it and React hands you two different first paints and says so in the console. Branch only the transition — a transition isn't a style, so there's nothing for hydration to disagree about, and a reader who asked for less motion gets a zero-length one rather than a different starting position.

```tsx
variants={{
  shut: { opacity: 0, y: 6, filter: "blur(4px)" },   // constant, both renders
  open: { opacity: 1, y: 0, filter: "blur(0px)",
          transition: { duration: reduce ? 0 : theatre ? 0.34 : 0.16, ease: EASE } },
}}
```

**Record "seen" on completion, not on start.** Setting the flag as the animation begins lands in the same render batch as the open and cancels the very animation it's recording. `onAnimationComplete` also makes a second open in the same visit as quiet as a second visit, which is the way round a reader expects.

One more, for anything collapsible: **animate height, don't unmount.** The content then sits in the served HTML where a crawler or an `llms.txt` can reach it. Use `inert` plus `aria-hidden` while closed so a screen reader or a tab press meets the trigger rather than the hidden prose.

## Assets

- `assets/motion-tokens.css` — the easing curve, the duration ladder, `.reveal`, route fade, theme crossfade.
- `assets/motion-presets.ts` — every spring and tween above, with the reduced-motion substitutes.
- `assets/DropMenu.tsx` — the squash-and-stretch menu, complete.
- `assets/useScrollTick.ts` — the rAF-throttled scroll primitive with hysteresis.
- `assets/useReveal.ts` — the IntersectionObserver hook, with all three guards.

## Checklist

- [ ] Every duration is on the ladder. No 250ms, no 500ms, no 1s.
- [ ] Anything off the ladder is either the subject of the moment or a once-a-session set piece — and says which.
- [ ] One easing curve, plus `ease-out` for opacity-only and plain `ease` for the theme fade.
- [ ] No overshooting curve on a track that also drives a filter, or any property with a floor at zero.
- [ ] Opacity split out of every spring as its own short tween.
- [ ] Open springs, close tweens flat and faster.
- [ ] Shared element for list/dock highlights — not per-item backgrounds.
- [ ] `initial={false}` on any persistent element that re-targets.
- [ ] A canvas escalation covers one decorative element, returns `null` on failure, and carries the reading position across.
- [ ] Icons fill only when current or hovered; filled layer crossfades over the outline in place.
- [ ] Marks that can't fill (brand silhouettes, open strokes, lone toggles) signal some other way.
- [ ] `useReducedMotion()` branch in every animated component; `.reveal` fully off.
- [ ] A `<noscript>` reset for any CSS that hides content pending JavaScript.
- [ ] Set pieces gated before first paint by an inline script, not by React.
- [ ] Client-only flags branch transitions, never rendered styles.
- [ ] "Seen" recorded on animation *complete*, not on start.
- [ ] Collapsible content animates height and goes `inert` — it doesn't unmount.
- [ ] `scrollIntoView` behaviour passes the reduced-motion preference.
- [ ] Scroll listeners are `passive` and rAF-throttled; one listener per behaviour.
- [ ] Hysteresis on any scroll-direction toggle.
- [ ] Hover-only affordances gated on `(hover: hover) and (pointer: fine)`, with a touch path.
- [ ] `LazyMotion` + `m` + `strict`. No bare `motion.*`.
- [ ] No `backdrop-filter` inside an animating transform.
- [ ] Press feedback on pointer-down.
- [ ] Audio armed on `pointerdown`, `keydown` **and** `touchstart` — not pointer alone.
- [ ] Dense hover surfaces opt out of hover sound.
- [ ] Nothing loops; nothing animates to attract attention.
