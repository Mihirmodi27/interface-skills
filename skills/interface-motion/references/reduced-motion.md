# Reduced motion, transparency, and contrast

Three user preferences, each with a different correct response. None of them means "turn everything off."

## `prefers-reduced-motion`

### The principle

The preference exists because vestibular disorders make large-area or accelerating motion physically unpleasant — nausea, dizziness, migraine. It is not a preference for a static interface. A user who sets it still needs to know that a menu opened.

So: **substitute, don't subtract.** For every animation, ask what it was communicating, and find the cheapest way to still communicate it.

| Original | Reduced-motion path | Reasoning |
|---|---|---|
| Spring slide (highlight, tooltip) | 150ms tween | The state change is the message; the physics is decoration. |
| Squash-and-stretch open | Plain 150ms fade | Presence still communicated, no scaling. |
| Blur crossfade | Crossfade with `blur(0px)` | Blur is the vestibular trigger; the fade isn't. |
| Reveal-on-scroll | Off entirely, content visible | The animation *is* the whole effect. Nothing to degrade to. |
| Route fade | Off entirely | Ditto. |
| Card lift on hover | No hover variant at all | Motion is the entire interaction; static is correct. |
| Smooth scroll | `behavior: "auto"` | Programmatic scrolling is a large-area motion. |
| Theme crossfade | Instant swap | Whole-viewport colour interpolation. |
| Press scale | **Keep it** | 8% on a 40px button, 0ms. Below any threshold of concern. |

### In JavaScript

`useReducedMotion()` from Motion returns a live boolean.

```tsx
const reduce = useReducedMotion();
const tween = reduce ? { duration: 0.15 } : SLIDE;
```

Branch the *transition*, keep the animation. The highlight still moves to the hovered row — it just gets there on a flat 150ms curve.

For a variant-driven interaction where motion is the whole point, drop the trigger:

```tsx
<m.div
  variants={container}
  initial="rest"
  animate="rest"
  whileHover={reduce ? undefined : "hover"}
  whileFocus={reduce ? undefined : "hover"}
>
```

Not `whileHover="rest"` — passing `undefined` means no hover variant is registered at all, so Motion doesn't set up the listener.

For the presence case, branch the offsets themselves:

```tsx
initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.82, scaleX: 0.94, y: away }}
animate={reduce ? { opacity: 1 } : { opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
exit={reduce
  ? { opacity: 0, transition: CLOSE }
  : { opacity: 0, scaleY: 0.9, scaleX: 0.97, y: away, transition: CLOSE }}
```

Note the exit keeps `CLOSE` in both branches — 130ms `easeIn` is already flat, so it needs no substitute.

### Blur is the trigger, not the fade

```tsx
const blur = reduce ? "blur(0px)" : "blur(4px)";

<m.span
  initial={{ opacity: 0, filter: blur }}
  animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.28, ease: "easeOut" } }}
  exit={{ opacity: 0, filter: blur, transition: { duration: 0.18, ease: "easeIn" } }}
>
```

A single variable swaps the effect from blur-crossfade to plain crossfade. Animating `blur(0px)` → `blur(0px)` is a no-op the browser optimises away, so this costs nothing and needs no second code path.

(Also note the asymmetry here: 280ms in, 180ms out. Same principle as springs — entrances can take their time, exits shouldn't.)

### In CSS

```css
.reveal { opacity: 0; transform: translateY(8px); transition: opacity 300ms …, transform 300ms …; }
.reveal.in { opacity: 1; transform: translateY(0); }

/* Off entirely — and note it sets the FINAL state, not the initial one. */
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

The order matters: the override comes after, so it wins. And it resolves to `opacity: 1` — the danger with any reveal-on-scroll is leaving content permanently at `opacity: 0` when the mechanism is disabled.

```css
@media (prefers-reduced-motion: reduce) {
  .route-fade { animation: none; }
}
```

The theme crossfade inverts the pattern — the whole rule is *inside* `no-preference`, so it's opt-in:

```css
@media (prefers-reduced-motion: no-preference) {
  :root.theme-transition, :root.theme-transition * { transition: background-color 400ms ease, … }
}
```

### Tailwind's `motion-reduce:` variant

For CSS transitions on utility-styled elements:

```tsx
className="transition-transform duration-200 ease-geist motion-reduce:transition-none"
```

Apply it to every `transition-*` that moves something. Colour-only transitions don't strictly need it (a 150ms colour fade isn't a vestibular trigger) but there's no harm in consistency.

### Imperative APIs don't read the preference

The one that's easy to miss:

```tsx
el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
```

Programmatic smooth scrolling moves the entire viewport — one of the strongest triggers there is. Same for `window.scrollTo({ behavior: "smooth" })` and `Element.animate()`. Anything you call from JavaScript needs the branch passed in explicitly.

### Testing it

- macOS: System Settings → Accessibility → Display → Reduce motion
- iOS: Settings → Accessibility → Motion → Reduce Motion
- Windows: Settings → Accessibility → Visual effects → Animation effects
- Chrome DevTools: Rendering panel → "Emulate CSS prefers-reduced-motion"

Test with it **on** for a full pass through the site. The failure mode you're looking for isn't jank — it's a menu that appears with no transition at all, or a section that never becomes visible.

## `prefers-reduced-transparency`

Backdrop blur is expensive and, for some users, makes text over it hard to read. The response is to replace translucent surfaces with opaque ones — not to remove the surface.

```css
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-menu-bg: var(--color-background-100);
    --glass-panel-bg: var(--color-gray-100);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass-nav, .glass-menu, .glass-panel {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

Two halves, both required: swap the tint to a solid token *and* drop the filter. Dropping the filter alone leaves a translucent tint over the content; swapping the tint alone still pays for the blur.

Ordering: because the block re-declares custom properties, it must come *after* both theme blocks so it wins in either theme.

## `prefers-contrast: more`

```css
@media (prefers-contrast: more) {
  .glass-nav, .glass-menu, .glass-panel, .folder-glass {
    border-color: var(--color-gray-1000);
  }
}
```

Translucent chrome relies on a hairline border to define its edge. At high contrast that hairline needs to become a real border — the surface itself is fine, but the boundary has to be unambiguous.

## The general shape

For each of the three: identify what the effect *communicates*, then find the cheapest thing that still communicates it. A blanket `* { animation: none !important; }` is a regression dressed as accessibility work — it strips the signals along with the decoration, and it's how you end up with a menu that has no visible open state.
