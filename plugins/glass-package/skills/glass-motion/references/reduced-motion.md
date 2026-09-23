# Reduced motion, transparency, and contrast

Three user preferences, each with a different correct response. None of them means "turn everything off."

## `prefers-reduced-motion`

### The principle

Vestibular disorders make large-area or accelerating motion physically unpleasant — nausea, dizziness, migraine. The preference is not a request for a static interface: the user still needs to know a menu opened. So **substitute, don't subtract**: for every animation, ask what it communicated and find the cheapest way to still communicate it.

| Original | Reduced-motion path | Reasoning |
|---|---|---|
| Spring slide (highlight, tooltip) | 150ms tween | The state change is the message; physics is decoration. |
| Squash-and-stretch open | Plain 150ms fade | Presence still communicated, no scaling. |
| Blur crossfade | Crossfade with `blur(0px)` | Blur is the vestibular trigger; the fade isn't. |
| Reveal-on-scroll | Off entirely, content visible | The animation *is* the effect; nothing to degrade to. |
| Route fade | Off entirely | Ditto. |
| Card lift on hover | No hover variant at all | Motion is the whole interaction; static is correct. |
| Smooth scroll | `behavior: "auto"` | Programmatic scrolling is a large-area motion. |
| Theme crossfade | Instant swap | Whole-viewport colour interpolation. |
| Press scale | **Keep it** | 8% on a 40px button, 0ms: below any threshold of concern. |
| A once-a-session greeting | Never plays at all | A flourish by definition; skip it, don't soften it. |
| First-open theatre (staggered lines) | Same open, zero-length transitions | The disclosure opens; the choreography doesn't run. |
| A GPU dissolve between images | Fall back to the plain `<img>` | The no-WebGL path, already built. |
| Icon fill crossfade | Instant swap (`motion-reduce:transition-none`) | The state is the message; the 200ms fade isn't. |

### In JavaScript

`useReducedMotion()` from Motion returns a live boolean. Branch the *transition*, keep the animation — `reduce ? { duration: 0.15 } : SLIDE` — so the highlight still moves to the hovered row, on a flat 150ms curve.

Where motion is the whole point of a variant-driven interaction, drop the trigger:

```tsx
<m.div
  variants={container}
  initial="rest"
  animate="rest"
  whileHover={reduce ? undefined : "hover"}
  whileFocus={reduce ? undefined : "hover"}
>
```

Not `whileHover="rest"`: `undefined` registers no hover variant, so Motion doesn't set up the listener.

For presence, branch the offsets themselves:

```tsx
initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.82, scaleX: 0.94, y: away }}
animate={reduce ? { opacity: 1 } : { opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
exit={reduce
  ? { opacity: 0, transition: CLOSE }
  : { opacity: 0, scaleY: 0.9, scaleX: 0.97, y: away, transition: CLOSE }}
```

The exit keeps `CLOSE` in both branches: 130ms `easeIn` is already flat, so it needs no substitute.

### Blur is the trigger, not the fade

```tsx
const blur = reduce ? "blur(0px)" : "blur(4px)";

<m.span
  initial={{ opacity: 0, filter: blur }}
  animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.28, ease: "easeOut" } }}
  exit={{ opacity: 0, filter: blur, transition: { duration: 0.18, ease: "easeIn" } }}
>
```

One variable turns a blur-crossfade into a plain crossfade; `blur(0px)` → `blur(0px)` is a no-op the browser optimises away, so there's no cost and no second code path. (Note the asymmetry: 280ms in, 180ms out.)

### In CSS

```css
.reveal { opacity: 0; transform: translateY(8px); transition: opacity 300ms …, transform 300ms …; }
.reveal[data-in] { opacity: 1; transform: translateY(0); }

/* Off entirely — and it sets the FINAL state, not the initial one. */
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

The override comes after, so it wins, and it resolves to `opacity: 1`: the danger with any reveal-on-scroll is content left at `opacity: 0` when the mechanism is disabled.

```css
@media (prefers-reduced-motion: reduce) {
  .route-fade { animation: none; }
}
```

The theme crossfade inverts the pattern — the whole rule sits *inside* `no-preference`, so it's opt-in:

```css
@media (prefers-reduced-motion: no-preference) {
  :root.theme-transition, :root.theme-transition * { transition: background-color 400ms ease, … }
}
```

### Tailwind's `motion-reduce:` variant

```tsx
className="transition-transform duration-200 ease-geist motion-reduce:transition-none"
```

Apply it to every `transition-*` that moves something. Colour-only ones don't strictly need it (a 150ms colour fade isn't a vestibular trigger), but consistency costs nothing.

### Imperative APIs don't read the preference

The easy one to miss: `scrollIntoView` needs `behavior: reduce ? "auto" : "smooth"` passed in, because programmatic smooth scrolling moves the entire viewport, one of the strongest triggers there is. So do `window.scrollTo({ behavior: "smooth" })`, `Element.animate()`, and anything else called from JavaScript.

### Testing it

- macOS: System Settings → Accessibility → Display → Reduce motion
- iOS: Settings → Accessibility → Motion → Reduce Motion
- Windows: Settings → Accessibility → Visual effects → Animation effects
- Chrome DevTools: Rendering panel → "Emulate CSS prefers-reduced-motion"

Do a full pass with it **on**. The failure you're looking for isn't jank; it's a menu that appears with no transition at all, or a section that never becomes visible.

## `prefers-reduced-transparency`

Backdrop blur is expensive and, for some users, makes the text over it hard to read. Replace translucent surfaces with opaque ones; don't remove the surface.

```css
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass-nav, .glass-panel, .folder-glass {
    backdrop-filter: none;
  }
}
```

Both halves are required. Dropping the filter alone leaves a translucent tint over the content; swapping the tint alone still pays for the blur. Because the block re-declares custom properties, it must come *after* both theme blocks to win in either theme.

## `prefers-contrast: more`

```css
@media (prefers-contrast: more) {
  .glass-nav, .glass-panel, .folder-glass {
    border-color: var(--color-gray-1000);
  }
}
```

Translucent chrome defines its edge with a hairline border. At high contrast that hairline becomes a real border: the surface is fine, but the boundary must be unambiguous.

Both are covered in full — the `@supports` baseline, the blur's cost model, testing — in the **glass-and-depth** skill (`references/performance-and-fallbacks.md`); they're here as part of the same "substitute, don't subtract" family.

### Set pieces: skip, don't soften

A once-a-session greeting is the one case where the answer is "off": the page underneath communicates everything it does, better. Gate it in the inline script that decides whether it plays, so it's settled before the first pixel:

```js
if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
```

Two consequences. **A manual replay override must not defeat the preference**: `?intro` re-runs the greeting for development, and reduced motion still wins, because it's a preference and not a cache. And **still write the "seen" flag**, or the reader's first non-reduced session in another tab surprises them.

### Client-only flags and hydration

Anything that plays "the first time" reads `sessionStorage`, which the server can't see, so the flag is false on the server for everyone and true on the client for most — a hydration mismatch waiting to happen.

**Branch transitions on it, never rendered styles.**

```tsx
variants={{
  // A constant. Both renders agree on it.
  shut: { opacity: 0, y: 6, filter: "blur(4px)" },
  open: {
    opacity: 1, y: 0, filter: "blur(0px)",
    // Only the transition reads the flags; a transition isn't a style.
    transition: { duration: reduce ? 0 : theatre ? 0.34 : 0.16, ease: EASE },
  },
}}
```

This also gives reduced motion the better shape: a zero-length transition to the *same* end state, not a different starting position.

## The general shape

For each of the three, identify what the effect *communicates* and find the cheapest thing that still does. A blanket `* { animation: none !important; }` is a regression dressed as accessibility work: it strips the signals with the decoration, leaving a menu with no visible open state.
