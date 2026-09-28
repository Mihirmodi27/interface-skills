---
name: glass-motion
description: "The exact motion system from modimihir.com — the Glass package, to copy as-is. Durations set by how much of the screen changes, one easing curve, springs by character, asymmetric open/close, sliding shared highlights, one-element GPU escalation, squash-and-stretch, fill as chosen, once-a-session set pieces, reveal-on-scroll, route and theme fades, press feedback, rAF-throttled scroll, hover intent, synthesised sound. Use when adding or reviewing animations, transitions, menus, dropdowns, sheets, disclosures, tooltips, hover states, icon states, splash or greeting screens, scroll effects, page transitions, or motion that feels sluggish, floaty, janky, or gratuitous — and always when implementing reduced-motion, no-JavaScript, reduced-transparency, or touch-versus-pointer behaviour."
---

# Glass Motion

> **Glass package.** This is the motion system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. For the same principles fitted to your project's own names, values and character, use `interface-motion` from the adaptable set. When both are installed and the project's `DESIGN.md` names a preset other than `glass`, that skill leads and this one is only a worked example.

Motion in a text-heavy interface has one job: **make a change legible.** Not to delight, not to demonstrate craft. If you can remove an animation and the user is no less clear about what happened, remove it. The few places you *do* spend motion — a menu that squashes open, a highlight sliding between rows — then land hard, because nothing competes. State is CSS transitions; springs and presence use [Motion](https://motion.dev).

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

Three numbers carry almost everything: **150 / 200 / 300**. **Route is 260ms**, not 300: a page transition sits on the critical path to content, and 260 is the shortest crossfade that doesn't read as a flicker. **Theme is 400ms with plain `ease`**: the largest change gets the longest duration, and colour has no momentum, so the house curve's overshoot would read as a wobble. Nothing loops, nothing animates to attract attention, and nothing on the ladder exceeds 400ms.

### Two things that sit off the ladder

The ladder is for **state**: something changed that the user must follow. Two things aren't, and forcing them onto it makes them worse.

**The subject of the moment.** Stepping between gallery photographs dissolves over **620ms**: the photograph *is* the content, watched directly, and a noise-thresholded dissolve needs time to read as a dissolve rather than a cut. The same photo's flight between two layouts stays at 420ms, in the overlay tier, because that *is* a state change with the photo on screen at both ends. **Same component, two durations, decided by whether the motion is the subject or the report.**

**A once-a-session set piece.** The opening screen runs 560ms in, holds 1400ms, about 2.5 seconds in all: indefensible as interaction, fine as a greeting that plays once per tab, never blocks a deep link and never runs under reduced motion.

The test: **would a user see this more than a handful of times a session?** If yes, it's on the ladder; if no, it earns its own timing by never appearing again.

## 2. One easing curve

```css
--ease-geist: cubic-bezier(0.175, 0.885, 0.32, 1.1);
```

One curve for the whole site. The `1.1` end control point overshoots slightly and settles back, physical but not bouncy, and sharing it makes unrelated elements moving at once feel like one system. The exceptions:

- **Opacity-only micro-transitions**: `ease-out` at 100ms, since opacity has no position and clamps at 1.
- **The theme crossfade**: plain `ease`.
- **Anything spring-driven**: no bezier at all.
- **Any track that also drives a filter**, or any property floored at zero — brightness, a border radius, a scale you've promised won't invert. That's correctness, not taste: an overshooting curve passes its end value, so a `blur()` animating to `0px` would need a negative radius. Use expo-out, `cubic-bezier(0.16, 1, 0.3, 1)`, which never exceeds 1.

Overshoot is safe on transform, so **check what else rides the curve**. And never write a second bezier "because this one needs to feel different": character belongs to springs, and expo-out is the same intent in a curve legal for the property, not a second character.

→ Full reasoning, plus the bezier-vs-spring decision: `references/easing-and-duration.md`

## 3. Springs, tuned by character

Three springs, each with a job. Two are written as `bounce`/`duration` (a designer's controls), one as `stiffness`/`damping`/`mass` (a physicist's); use whichever states the intent more directly.

```ts
// Highlight or tooltip re-targeting: moving, not arriving — almost no bounce.
const SLIDE = { type: "spring", bounce: 0.2, duration: 0.4,
                opacity: { duration: 0.16, ease: "easeOut" } } as const;

// Cards rising out of a folder. Playful on purpose — the only place that is.
const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;

// Opening a menu: two springs that DISAGREE (§4).
const GROW  = { type: "spring", stiffness: 620, damping: 19, mass: 0.85 } as const;
const CROSS = { type: "spring", stiffness: 380, damping: 30 } as const;

// Closing: flat and quick.
const CLOSE = { duration: 0.13, ease: "easeIn" } as const;
```

**Split opacity out of every spring**, as `SLIDE` does: a spring on opacity overshoots toward transparent and back, which is a flicker. Position wants physics; opacity wants a curve.

→ Tuning guide, bounce vs damping, how to arrive at these numbers: `references/springs.md`

## 4. Squash and stretch, out of physics

The best motion detail in the system, in four lines of config. A menu scales open from its anchored edge, and the **grow axis and the cross axis get springs of different character**: `GROW` is light and underdamped, and sails past its final size; `CROSS` is heavily damped and arrives late. Through the overshoot the panel is briefly **taller and narrower** than it ends up — squash and stretch from physics rather than a keyframe timeline, so it stays interruptible and velocity-aware.

```tsx
transition={{
  scaleY: GROW,   // the grow axis overshoots
  y:      GROW,   // travel rides the same spring, so they stay locked
  scaleX: CROSS,  // the cross axis lags
  opacity: { duration: 0.14, ease: "easeOut" },
}}
```

**When two axes of one element move together, giving them different springs creates deformation, and deformation reads as mass.**

## 5. Asymmetric open and close

| Direction | Character | Duration |
|---|---|---|
| Open | spring, overshoots | ~400ms effective |
| Close | tween, `easeIn`, flat | 130ms |

Opening answers the user's intent and can afford personality. Closing happens after they've moved on: a bounce on exit reads as *reluctance*, and delays whatever they reach for next. Close fast, close flat. The exit offsets are smaller too — open starts from `scaleY: 0.82, scaleX: 0.94`, exit only goes to `scaleY: 0.9, scaleX: 0.97` — because it's disappearing anyway.

## 6. Shared elements

The signature interaction: in a dock or a list, **one** highlight and **one** tooltip animate their `x / y / width / height` to whichever item is hovered.

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

Per-item hover backgrounds flicker as one fades out and the next fades in; one shared element slides instead.

- **`initial={false}`** skips the mount animation, or the highlight flies in from the origin on first paint.
- **`isolate` on the container, `-z-10` on the highlight** keeps the bar behind the icons but inside its own stacking context, never behind the container's background.
- **Measure with `offsetLeft/offsetTop`, not `getBoundingClientRect()`.** Offsets are already in the positioned parent's coordinate space: no scroll maths, no reflow read.

→ In full, with the tooltip variant and hit-target measurement: `references/shared-element.md`

### When the DOM element isn't enough

A *photograph* travelling between layouts is different: an `<img>` animated between boxes of different aspect distorts, and re-laying-out a hundred-tile wall every frame is unaffordable. One viewport-sized canvas above the gallery draws the open photo into a screen rect instead — four numbers in a uniform, no reflow — under four rules:

- **Only the decorative element goes on the GPU — one element, not a view.** The wall stays DOM: a hundred tiles as textures is ~590MB before atlasing, with keyboard and screen-reader semantics a canvas can't carry. The open photo is `alt=""` (its labels sit beside it), so drawing it loses nothing.
- **Failing must return `null`, never throw**, since a throw in an effect takes the gallery down; `null` keeps the caller's `<img>`, the same path as reduced motion or a lost context.
- **Carry the reading position across**: open the other layout on the tile nearest the viewport centre, measured before React commits it. Landing at the top of a filmstrip from photo 60 is worse than no transition.
- **Each end keeps its own shape**: two rects around a shared centre, since one stretches whichever photograph has the other aspect.

## 7. Reduced motion is a branch, not a switch

Every animated component reads the preference and takes its own path. A global "disable animations" gives you a menu that pops into existence with no sign it opened.

```tsx
const reduce = useReducedMotion();
const tween = reduce ? { duration: 0.15 } : SLIDE;
```

The four substitutions:

| Original | Reduced | Why |
|---|---|---|
| Spring slide | 150ms tween | State change stays legible; physics goes. |
| Squash-and-stretch open | plain fade | Presence is still communicated. |
| Reveal-on-scroll | fully off, content visible | The animation *is* the effect; nothing to degrade to. |
| Blur crossfade | crossfade, `blur(0px)` | Blur is the vestibular trigger, the fade isn't. |

```tsx
// No elastic scaling, but you still see it appear.
initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.82, scaleX: 0.94, y: 4 }}
```

Also honour `prefers-reduced-transparency` (glass → solid) and `prefers-contrast: more` (add borders) — see the **glass-color** skill. Imperative APIs don't read it, so pass it yourself: `scrollIntoView({ behavior: reduce ? "auto" : "smooth" })`.

→ Every guard in the system, and how to test them: `references/reduced-motion.md`

## 8. Scroll: one listener, one rAF

Every scroll-driven behaviour has this shape:

```ts
let ticking = false;
const onScroll = () => {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
};
window.addEventListener("scroll", onScroll, { passive: true });
```

`passive: true` and the `ticking` flag (one measurement per frame) are both mandatory, not optimisations.

**Hysteresis stops flicker.** A dock that collapses on scroll-down needs a dead zone — 6px of intent either way, and always open within 24px of the top or at the bottom — or a 1px jitter toggles it forever.

**Never hide an affordance where it can't come back.** The dock collapses only where `(hover: hover) and (pointer: fine)` matches, so a hover can reopen it; on touch, a collapsed dock would strand the navigation. Gate every hover-revealed control on the capability, and give touch its own path.

→ Scroll spies, `scroll-mt` alignment, rAF throttling: `references/scroll-performance.md`

## 9. Reveal on scroll

CSS animates; JavaScript only marks an element as arrived.

```css
.reveal { opacity: 0; transform: translateY(8px);
          transition: opacity 300ms var(--ease-geist), transform 300ms var(--ease-geist); }
.reveal[data-in] { opacity: 1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

An `IntersectionObserver` sets `data-in` and immediately **unobserves**: a reveal is one-shot, and re-animating on scroll-back is nauseating. `threshold: 0` with `rootMargin: "0px 0px -40px 0px"` fires once an element is 40px inside the viewport — the margin, not a threshold, does that. 8px of travel registers without a page of paragraphs seeming to slide. Five failure modes:

**A fractional threshold on a tall element.** A threshold is a fraction of the element's *own* area, and the visible ratio can't exceed viewport height over element height, so anything over ten screens tall never reaches `0.1` and the observer never fires — every rendered SKILL.md on the site, eight to thirteen thousand pixels in one `.reveal`, once sat invisible at opacity 0. Never use a fractional threshold for a reveal; the root margin works at any height.

**A class the framework owns.** Once `className` depends on state, React rewrites it on render, wiping an `in` added with `classList.add`, and the already-unobserved element fades to 0 for good (tag-filtered rows here went blank as the pointer left). Mark arrival with an attribute the framework doesn't render (`data-in`), and match `.reveal[data-in]`.

**No `IntersectionObserver`**: mark everything arrived immediately. Never leave content at `opacity: 0` behind a feature check.

**Route changes**: re-run the observer keyed on the pathname, or the new page goes unobserved.

**No JavaScript at all** — the one people miss, since no feature check catches it: the CSS applies and `data-in` is never set. Two lines in the head:

```html
<noscript>
  <style>.reveal { opacity: 1 !important; transform: none !important; }</style>
</noscript>
```

**Any CSS that hides content pending JavaScript needs a `<noscript>` reset.** It's a correctness bug, not a progressive-enhancement nicety: the failure is a blank page, not a plain one.

## 10. Performance: `m` not `motion`

`motion.div` bundles every feature at import. `m.div` inside `<LazyMotion features={domAnimation} strict>` is minimal and loads only the bundle named — `domAnimation` (no layout animations, no drag) is a fraction of the size — while `strict` makes a stray `motion.*` component a build error.

- **Animate `transform` and `opacity`**, not `width`/`height`/`top`/`left`, which trigger layout every frame. The shared highlight's `width`/`height` is an exception you should be able to justify: one absolutely-positioned element outside the flow.
- **A transform on a parent weakens `backdrop-filter` in its subtree**, so the wrapper scales and the child carries the blur: the menu animates a bare `<m.div>` around the `glass-panel`.

## 11. Hover intent

A 100ms grace period on close, so crossing the gap from a trigger into its menu doesn't close it:

```ts
const closeBoxSoon = () => {
  clearTimeout(closeTimer.current);
  closeTimer.current = window.setTimeout(() => setConfigOpen(false), 100);
};
```

Where the elements are adjacent, a **hover bridge** is cheaper: wrapper padding that spans the gap (`pt-2.5` between a button and the pill below it), so the pointer never leaves the hover region. Otherwise use the timer, and always clear it on unmount and on navigation.

## 12. Press and sound

```
active:scale-[0.92]   /* 8% — felt, not seen */
```

On the press, not the release: respond to `pointerdown`; waiting for `click` feels dead.

The site also synthesises a "tok" on hover and click (Web Audio, no asset files): a sine fundamental, a fast-decaying marimba-like 3.9:1 partial, and a lowpassed noise transient for the wooden attack. Hover is quiet and high (1200Hz, 0.09s, 0.05 gain), click lower and louder (900Hz, 0.14s, 0.13 gain); it's gated on the autoplay policy, muteable, and persisted.

**Arm the context on every gesture the browser accepts as activation, not just the one you expect**: `pointerdown`, `keydown` and `touchstart`. Hover is activation in no engine, so with `pointerdown` alone a reader who only hovers the dock hears nothing — *the hover was the interaction*. Enter on a focused link dispatches `click` into a still-suspended context, so keyboard-only readers never hear the site. Keep the handler idempotent (`resume()` on a running context is a no-op); leave out `wheel`, which is activation in no engine either.

**Give dense surfaces a way to opt out of hover sound**, by skipping `playHover()` inside `[data-quiet-hover]`. A tick per tile across an image wall or a filmstrip is a machine gun, not feedback. Clicks still sound: the opt-out is about *rate*, not importance.

**Sound can be a phrase, not just an event.** The opening screen's run, a note per photograph, is written out in A major pentatonic, where no two notes clash, so a run cut short by a failed image still resolves; the landing note, the only accented one, sits a fifth *below* the start, closing the phrase rather than adding a step.

The most optional thing in the system. If you add it: hover sound on mouse only (`pointerType === "mouse"`), a visible mute control, and *on* by default only if you're confident. → Synthesis walkthrough and delegation pattern: `references/sound.md`

## 13. Fill means chosen

A rule about icons that is really about motion, because the mechanism is a crossfade.

**An icon is filled when, and only when, it is the thing you've picked or the thing you're pointing at** — never because it looks better. Previewing and reporting a choice are the same gesture a beat apart, so the glyph commits under the pointer and stays committed on click; where both show at once, the sliding highlight from §6 tells them apart.

**A filled variant is not a second drawing**: it's the outline with its interior painted in, layered *over* the stroke at the same coordinates, so the layers cross-fade in place with no pop and nothing to line up.

```tsx
export const fillFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`;

// The inverse, for interior lines the fill swallows (a briefcase's divider).
export const detailFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${on ? "opacity-0" : "opacity-100"}`;
```

- **200ms `ease-out`, not the house curve**: overshoot suits travel, not a fade.
- **Interior detail needs a knockout, not deletion.** Where the fill would swallow a line, mask the silhouette: the shape in white (fill *and* stroke, to match the outline), interior lines in black at the outline's stroke width, so each gap lands where its line was.

**Three kinds of mark sit outside the rule:**

| Mark | Why fill is wrong | What it does instead |
|---|---|---|
| Brand marks — socials, a tech stack | Official solid silhouettes; an outline is an off-brand redrawing | Colour: quiet at rest, full on hover |
| Open strokes — chevrons, arrows, checks, menu bars | No interior to paint | A stroke-weight ladder by role |
| A mark on static content, or a lone toggle | Never hovered, never current — or the only mark on screen | Stays in the default state |

**Fill that distinguishes nothing is just weight**: a lone toggle whose glyph already changes shape has nothing to be picked out *from*, so filling it adds mass, not meaning.

## 14. Set pieces play once

A greeting rather than feedback — an opening screen, a summary panel's first reveal — may be longer and more theatrical than the ladder allows, provided it happens **once a session** and never blocks anything.

```ts
// Once a session, per item. The theatre is a welcome; a re-run is a delay.
const seenKey = (slug: string) => `short-version:${slug}`;
```

Four rules, each a bug the reference implementation hit.

**Decide before the first pixel, in an inline script.** The answer lives in `sessionStorage`, invisible to the server, so deciding in React shows a frame of page before the overlay. A blocking inline script sets an attribute on `<html>` for CSS to answer at paint; the component only *ends* it, by flipping the attribute.

```js
// Home page, first landing, not a deep link (/#work), never under reduced motion.
document.documentElement.dataset.intro = "on";
```

**A filling animation beats a declared value.** A CSS entrance with `both` holds its `to` state over any plain declaration, so replace the animation rather than layering a transition over it.

**Branch transitions on the client-only flag, never rendered styles.** "Has this played before?" is false on the server and true on most clients, so a *style* branched on it gives two first paints and a console warning. A transition isn't a style, so hydration can't disagree, and reduced motion gets a zero-length transition, not a different starting position.

```tsx
variants={{
  shut: { opacity: 0, y: 6, filter: "blur(4px)" },   // constant, both renders
  open: { opacity: 1, y: 0, filter: "blur(0px)",
          transition: { duration: reduce ? 0 : theatre ? 0.34 : 0.16, ease: EASE } },
}}
```

**Record "seen" on completion, not on start.** Set at the start, it lands in the open's render batch and cancels the animation it records; `onAnimationComplete` also makes a second open in one visit as quiet as a second visit.

For anything collapsible: **animate height, don't unmount**, so the content stays in the served HTML for a crawler or an `llms.txt`; while closed, `inert` plus `aria-hidden` sends a screen reader or a tab press to the trigger, not the hidden prose.

## Assets

- `assets/motion-tokens.css` — easing curve, duration ladder, `.reveal`, route fade, theme crossfade.
- `assets/motion-presets.ts` — every spring and tween above, plus reduced-motion substitutes.
- `assets/DropMenu.tsx` — the squash-and-stretch menu.
- `assets/useScrollTick.ts` — rAF-throttled scroll with hysteresis.
- `assets/useReveal.ts` — the IntersectionObserver hook and its guards.

## Checklist

- [ ] Every duration on the ladder: no 250ms, 500ms or 1s.
- [ ] Off-ladder timing is the subject of the moment or a once-a-session set piece, and says which.
- [ ] One curve, plus `ease-out` for opacity-only and plain `ease` for the theme fade.
- [ ] No overshoot on a track driving a filter or anything floored at zero.
- [ ] Opacity split out of every spring as a short tween.
- [ ] Opens spring; closes tween, flat and faster.
- [ ] One shared highlight for lists and docks, not per-item backgrounds.
- [ ] `initial={false}` on any persistent element that re-targets.
- [ ] Canvas escalation: one decorative element, `null` on failure, reading position kept.
- [ ] Icons fill only when current or hovered, crossfading over the outline in place.
- [ ] Marks that can't fill (brand silhouettes, open strokes, lone toggles) signal another way.
- [ ] `useReducedMotion()` branch in every animated component; `.reveal` fully off.
- [ ] Reveals: `threshold: 0` plus a root margin, never fractional; arrival as a `data-` attribute, not a framework-owned class.
- [ ] A `<noscript>` reset for any CSS hiding content pending JavaScript.
- [ ] Set pieces gated before first paint by an inline script, not React.
- [ ] Client-only flags branch transitions, never rendered styles.
- [ ] "Seen" recorded on animation *complete*, not start.
- [ ] Collapsibles animate height and go `inert`; they never unmount.
- [ ] `scrollIntoView` behaviour passes the reduced-motion preference.
- [ ] Scroll listeners `passive`, rAF-throttled, one per behaviour.
- [ ] Hysteresis on any scroll-direction toggle.
- [ ] Hover-only affordances gated on `(hover: hover) and (pointer: fine)`, with a touch path.
- [ ] `LazyMotion` + `m` + `strict`; no bare `motion.*`.
- [ ] No `backdrop-filter` inside an animating transform.
- [ ] Press feedback on pointer-down.
- [ ] Audio armed on `pointerdown`, `keydown` **and** `touchstart`.
- [ ] Dense hover surfaces opt out of hover sound.
- [ ] Nothing loops; nothing animates to attract attention.
