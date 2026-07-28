---
name: interface-motion
description: Design and audit interface animation — a duration ladder tied to how much of the screen changes, one shared easing curve, springs tuned by character rather than by number, asymmetric open/close, shared-element highlights that slide between targets, squash-and-stretch from disagreeing springs, reveal-on-scroll, route transitions, theme crossfades, press feedback, rAF-throttled scroll listeners, hover intent, and synthesised UI sound. Use when adding or reviewing animations, transitions, menus, dropdowns, sheets, tooltips, hover states, scroll effects, page transitions, or motion that feels sluggish, floaty, janky, or gratuitous — and always when implementing reduced-motion, reduced-transparency, or touch-versus-pointer behaviour.
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

Nothing loops. Nothing exceeds 400ms. Nothing animates to attract attention.

## 2. One easing curve

```css
--ease-geist: cubic-bezier(0.175, 0.885, 0.32, 1.1);
```

One curve for the whole site. The `1.1` end control point overshoots slightly and settles back — enough to feel physical, not enough to read as bounce. A single shared curve is why unrelated elements moving at the same time still feel like one system.

Where it doesn't apply:

- **Opacity-only micro-transitions** use `ease-out` at 100ms. Opacity has no position, so overshoot is meaningless (and clamps at 1 anyway).
- **The theme crossfade** uses plain `ease`, per above.
- **Anything spring-driven** doesn't use a bezier at all.

Never write a second bezier "because this one needs to feel different." Reach for a spring instead — that's the axis where character belongs.

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

Two failure modes the implementation guards against: no `IntersectionObserver` (add `.in` to everything immediately — never leave content at `opacity: 0` behind a feature check), and route changes (re-run the observer keyed on the pathname, or the new page's elements are never observed).

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

This is the most optional thing in the system. If you add it: hover sound on mouse only (`pointerType === "mouse"`), a visible mute control, and default to *on* only if you're confident. Full synthesis walkthrough and the delegation pattern: `references/sound.md`

## Assets

- `assets/motion-tokens.css` — the easing curve, the duration ladder, `.reveal`, route fade, theme crossfade.
- `assets/motion-presets.ts` — every spring and tween above, with the reduced-motion substitutes.
- `assets/DropMenu.tsx` — the squash-and-stretch menu, complete.
- `assets/useScrollTick.ts` — the rAF-throttled scroll primitive with hysteresis.
- `assets/useReveal.ts` — the IntersectionObserver hook, with both guards.

## Checklist

- [ ] Every duration is on the ladder. No 250ms, no 500ms, no 1s.
- [ ] One easing curve, plus `ease-out` for opacity-only and plain `ease` for the theme fade.
- [ ] Opacity split out of every spring as its own short tween.
- [ ] Open springs, close tweens flat and faster.
- [ ] Shared element for list/dock highlights — not per-item backgrounds.
- [ ] `initial={false}` on any persistent element that re-targets.
- [ ] `useReducedMotion()` branch in every animated component; `.reveal` fully off.
- [ ] `scrollIntoView` behaviour passes the reduced-motion preference.
- [ ] Scroll listeners are `passive` and rAF-throttled; one listener per behaviour.
- [ ] Hysteresis on any scroll-direction toggle.
- [ ] Hover-only affordances gated on `(hover: hover) and (pointer: fine)`, with a touch path.
- [ ] `LazyMotion` + `m` + `strict`. No bare `motion.*`.
- [ ] No `backdrop-filter` inside an animating transform.
- [ ] Press feedback on pointer-down.
- [ ] Nothing loops; nothing animates to attract attention.
