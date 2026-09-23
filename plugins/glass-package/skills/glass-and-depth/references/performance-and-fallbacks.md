# Performance and fallbacks

## The cost model

For every frame in which a `backdrop-filter` element is visible, the browser must:

1. Paint everything behind the element.
2. **Copy** the region behind it into a texture.
3. Run the filter chain over that texture (a blur is a two-pass separable convolution).
4. Composite the filtered result, then the element's own background and content on top.

Three consequences:

**Cost scales with area, not element count.** A full-viewport glass overlay costs vastly more than five small docks with the same total perimeter.

**It re-runs whenever anything behind it changes**, scroll included. A fixed glass nav over a scrolling page re-filters every frame of every scroll: the common case, and the expensive one.

**It can't be cached across frames** while the backdrop moves, so promoting it to its own layer doesn't help.

Blur radius matters less than you'd expect (a separable blur is roughly linear in radius, and implementations downsample first), so *don't* buy performance by dropping 20px to 12px. Reduce area instead.

## What makes it affordable here

The reference implementation runs three or four glass surfaces and stays smooth on a phone.

**Small surfaces.** The dock is a few hundred pixels wide and 48px tall; the settings box is smaller. Nothing spans the viewport.

**Few of them, and only while needed.** The menus **unmount** when closed rather than sitting at `opacity: 0`:

```tsx
<AnimatePresence>
  {open && <m.div …>{children}</m.div>}
</AnimatePresence>
```

A `backdrop-filter` element pays its filter pass even when transparent or hidden behind another element: visibility is decided at composite time, after the filter runs. Unmounting is the only way to stop paying. (`display: none` also works; `opacity: 0` and `visibility: hidden` generally do not.)

**No animated blur.** Animating `blur()` forces a fresh filter pass at a new radius every frame, one of the most expensive things you can ask of a browser.

**Nothing animating behind the glass.** The backdrop is text and static images; glass over a playing video or an animating canvas re-filters continuously even when nothing in the foreground moves.

## What to avoid

| Anti-pattern | Why |
|---|---|
| Full-viewport glass overlay | Cost is area-proportional; the worst case |
| Glass on list items | Multiplies filter passes by row count |
| Animating `blur()` | New filter pass per frame at a new radius |
| Glass over video or canvas | Re-filters every backdrop frame |
| Closed menus kept at `opacity: 0` | Still pays the full filter cost |
| Glass over a flat background | Pays for a filter to produce a plain tint — use the tint |
| Nested glass | Samples already-filtered output; indeterminate result, doubled cost |

## Measuring it

In Chrome DevTools:

- **Performance panel**: record a scroll and look for long green *Composite Layers* and *Paint* blocks. Glass shows up here, not in scripting.
- **Rendering panel** → *Paint flashing*: a glass surface repaints its whole area on every scroll frame.
- **Layers panel**: confirm you haven't created dozens of composited layers.

Test on the slowest device you support, scrolling a long page with images; desktop GPUs hide the problem, mid-range Android phones don't. The signal is dropped frames *during scroll*; smooth on a mid-range phone means you're fine.

## Containment

`contain: paint` on a glass surface can help by bounding what the browser considers for its subtree. Measure before and after: depending on the surrounding layout, it's a real win or nothing.

Do **not** reach for `will-change: backdrop-filter`. It hints that the property will animate, exactly what you don't want, and can force an unnecessary layer.

## `prefers-reduced-transparency`

Blur is expensive on low-powered devices and translucency hurts legibility for some users; one response serves both: **replace the material with an opaque one.**

```css
/* MUST come after both theme blocks: it re-declares the same properties at
   the same specificity, so source order decides. And it must name BOTH
   selectors, or it only wins in one theme. */
@media (prefers-reduced-transparency: reduce) {
  :root,
  :root[data-theme="dark"] {
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

**Both halves are mandatory, and each is useless alone:**

- Filter only → a 72% tint over live page content with no blur to suppress it. *Worse* than the glass, and now text overlaps text.
- Tint only → you still pay the entire cost of the blur, half the reason for the preference. And with a solid tint, **text contrast becomes computable and real** for the users most likely to need it.

The substitutions are per material, not blanket-white: chrome goes to `gray-100`, the raised-surface token, so the dock still reads as raised; the decorative pocket goes to `background-100`, fully opaque, since its whole purpose was translucency.

Test it: macOS System Settings → Accessibility → Display → *Reduce transparency*, or DevTools Rendering panel → *Emulate CSS prefers-reduced-transparency*.

## `prefers-contrast: more`

```css
@media (prefers-contrast: more) {
  .glass-nav, .glass-panel, .folder-glass {
    border-color: var(--color-gray-1000);
  }
}
```

A translucent surface leans on its hairline for its edge, and an 8%-alpha hairline is the first thing to disappear under a contrast preference. Promoting it to primary text colour makes the boundary unambiguous.

The surface stays: high contrast is about edges and text, not the material. Combined with reduced-transparency, the two compose: solid surface, strong border.

## `@supports` — the gap worth closing

The reference implementation has **no `@supports` guard**, so without `backdrop-filter` its surfaces get a bare tint: legible but weak, marginal at 72% over a photograph. Support is very good (Firefox shipped it unflagged in 103, mid-2022), so it's a small risk, not a live bug, but this is the right pattern:

```css
/* Opaque baseline — what a non-supporting browser gets. */
.glass-nav {
  background: var(--color-gray-100);
}

/* Glass as the enhancement. Test BOTH conditions — Safari shipped only the
   prefixed version for years. */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-nav {
    background: var(--glass-nav-bg);
    backdrop-filter: blur(20px) saturate(1.8);
  }
}
```

**Opaque is the default and glass is layered on**, not the reverse: invert it and the non-supporting path is the one never tested.

`assets/glass.css` in this skill ships with the guard in place.

## The `-webkit-` prefix

Safari still requires it, and Safari is where glass looks best. But **let the build add it**:

```css
backdrop-filter: blur(20px) saturate(1.8);   /* the only line in source */
```

Lightning CSS (Tailwind v4's transformer) and Autoprefixer emit it from your browser targets, in the right order. Lightning CSS keeps only the *last* of a hand-written pair, so standard-then-prefixed compiles to the prefix alone, and Firefox, which has no `-webkit-` alias, loses every blur, invisibly in every other browser. The reference implementation shipped this: `.glass-nav`, `.glass-menu`, `.glass-panel` and `.folder-glass` all compile prefixed-only. Hand-write the prefixed `none` in the reduced-transparency block and Firefox keeps blurring for the users who asked it to stop.

Two checks: in a headless browser `getComputedStyle(el).backdropFilter` reads `"none"` when the standard property was dropped, the only cheap tell; and the compiled stylesheet should carry both properties for the selector. With no build step, write the prefixed line first and the standard one last, so the standard one wins wherever both are understood.

## The transform interaction, as a performance note

Inside a transformed subtree, `backdrop-filter` may be recomputed against a moving containing block every frame, paying full cost for a wrong result. So the structural fix from SKILL.md is a double win:

```tsx
<DropMenu open={open}>            {/* animates — no filter here */}
  <ul className="glass-panel …">  {/* filters — never transformed */}
```

The wrapper animates cheaply (transform and opacity are compositor-only), and the child's filter isn't fighting it.
