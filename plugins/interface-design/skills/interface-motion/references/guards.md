# Guards

Reduced motion, content that starts hidden, and set pieces: where motion can take something away. Each section's fallbacks must all exist, because each covers a different reader.

## Reduced motion: substitute, don't subtract

For every animation, ask what it communicates, then find the cheapest thing that still communicates it.

| Original | Reduced path | Why |
|---|---|---|
| Spring slide, re-targeting highlight | Flat tween at `duration.state` | The move is the message; the physics is decoration |
| Scale, squash or slide entrance | Plain fade at the same tier | Presence still shown; nothing travels |
| Blur cross-fade | Cross-fade with `blur(0px)` at both ends | Blur is the trigger; the fade isn't |
| Reveal-on-scroll | Off; content in its final visible state | The animation is the whole effect |
| Route fade, ambient loop | Off | Ditto |
| Hover lift whose motion is the whole interaction | No hover variant at all | Static is correct |
| Theme cross-fade | Instant | Whole-viewport interpolation |
| Programmatic smooth scroll | `behavior: "auto"` | Whole-viewport motion is among the strongest triggers |
| Icon fill cross-fade | Instant swap | The state is the message |
| Press scale at `duration.instant` | Keep it | Small, short, below any threshold of concern |
| Close tween (`ease.exit`) | Keep it | Already flat and short |
| Set piece | Never plays | A flourish by definition; don't substitute a quieter one |

### CSS

```css
/* Branch the travel, keep the fade */
:root { --motion-travel: 12px; }
@media (prefers-reduced-motion: reduce) { :root { --motion-travel: 0px; } }

/* Reveal: off entirely — resolving to the FINAL state, not the initial one */
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

The theme cross-fade inverts the pattern: its whole rule sits inside `prefers-reduced-motion: no-preference`, so it's opt-in.

### Libraries

```tsx
// Motion
const reduce = useReducedMotion();
transition={reduce ? { duration: <duration.state> } : <spring.snappy>}
whileHover={reduce ? undefined : "hover"}        // undefined registers no listener; "rest" still does
```

```ts
// GSAP
const mm = gsap.matchMedia();
mm.add({ reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
  const { reduce } = ctx.conditions!;
  gsap.from(".sheet", { opacity: 0, y: reduce ? 0 : 12, duration: 0.2, ease: "power3.out" });
});
```

```ts
// React Spring
const reduce = useReducedMotion();
const styles = useSpring({ opacity: open ? 1 : 0, y: open || reduce ? 0 : 12, config: snappy });
```

`MotionConfig reducedMotion="user"` (Motion) drops transforms and keeps opacity, a reasonable floor; `Globals.assign({ skipAnimation: true })` (React Spring) drops everything, the regression this section prevents. Neither replaces the per-component branch.

### Imperative APIs

Nothing called from JavaScript reads the media query: `scrollIntoView`, `scrollTo`, `Element.animate`, a GSAP timeline built outside `matchMedia`, a canvas or WebGL loop. Pass the preference in, and listen for its `change` event if the component lives long.

### Testing

macOS: Accessibility → Display → Reduce motion. iOS: Accessibility → Motion. Windows: Accessibility → Visual effects → Animation effects. Chrome DevTools: Rendering → Emulate `prefers-reduced-motion`. Walk the whole interface with it on, looking not for jank but for a menu that appears with no sign it opened, or a section that never appears.

Related preferences take the same shape elsewhere: `prefers-reduced-transparency` (translucent surfaces become opaque) in `surfaces-and-depth`, `prefers-contrast: more` in `color-and-theming`.

## Content that starts hidden

A reveal every reader sees:

```css
.reveal { opacity: 0; translate: 0 var(--reveal-travel);
          transition: opacity <duration.overlay> <ease.colour>, translate <duration.overlay> <ease.standard>; }
.reveal[data-in] { opacity: 1; translate: 0 0; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; translate: none; transition: none; } }
@media print { .reveal { opacity: 1; translate: none; } }
```

```html
<noscript><style>.reveal { opacity: 1 !important; translate: none !important; }</style></noscript>
```

```ts
export function observeReveals(): () => void {
  const els = document.querySelectorAll<HTMLElement>(".reveal:not([data-in])");
  if (typeof IntersectionObserver === "undefined") {
    els.forEach((el) => el.setAttribute("data-in", ""));   // never leave content hidden behind a feature check
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.setAttribute("data-in", "");
      io.unobserve(e.target);                                // one-shot: re-animating on scroll-back is nauseating
    }
  }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
// Call again on every client-side navigation, keyed on the path.
```

Each guard saves a reader who would otherwise see nothing:

| Guard | The reader it saves |
|---|---|
| `threshold: 0` with a root margin | Anyone reading an element taller than the viewport. A threshold is a fraction of the element's *own* area, and an element can never exceed viewport ÷ its height, so `0.1` is unreachable for anything over ten screens tall — a long article, exactly. A root margin works at any height |
| `data-in`, not a class | Anyone whose element re-renders. A framework rewrites `class` from its own value on every render, dropping a class added from outside; attributes it doesn't render, it leaves alone |
| No-observer fallback | Old or stripped-down browsers |
| `<noscript>` reset | Readers with JavaScript off, and crawlers; a feature check can't catch "the script never ran" |
| Print rule | Anyone printing; scroll-triggered content prints blank without it |
| Re-observe on navigation | Anyone arriving on a second page client-side |
| Reduced-motion rule | Readers who asked for less motion |

The re-render failure hides well: a utility applied during a hover can outrank the reveal's opacity, so the page breaks only when the pointer *leaves*. Test the state after the interaction, not during it.

**Any CSS that hides content pending JavaScript needs a `<noscript>` reset**, whether a reveal, a hydration class or a skeleton.

### Collapsibles

Animate the height (`grid-template-rows: 0fr` ↔ `1fr`) and keep the content mounted, `inert` and `aria-hidden` while shut, so a tab press or screen reader meets the trigger, not hidden prose, and search still finds the content in the served HTML.

## Set pieces

Decide before the first pixel, in a blocking inline script in the document head:

```html
<script>
  (function () {
    try {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;   // beats any replay override
      if (location.hash) return;                        // a deep link is someone asking for that section
      if (sessionStorage.getItem("intro-seen")) return; // once a session
      document.documentElement.dataset.intro = "on";    // CSS shows the overlay at paint
    } catch (e) {}                                      // storage can throw; failing means no set piece
  })();
</script>
```

The component only *ends* it — flips the attribute — and records "seen" in its completion callback; recording on start lands in the same render as the play and cancels the animation it records. Write "seen" under reduced motion too, so the reader's next tab doesn't surprise them.

**Branch client-only flags on the transition, never on a rendered style.** "Has this played?" is false on the server for everyone and true on the client for most: a style branched on it paints differently on each, while a branched transition paints the same and differs only in how long the change takes:

```tsx
variants={{
  shut: { opacity: 0, y: 6 },                                           // constant on both renders
  open: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : firstTime ? <set-piece> : <duration.state> } },
}}
```

A filling CSS animation (`animation-fill-mode: both`) can't be transitioned out of with a plain declaration, because the animation's end state wins; replace the animation to end it.

**Nothing waits behind it.** The page underneath is rendered and interactive; the skip link is the first focusable element, and focusing it ends the piece; any key or click ends it at once.
