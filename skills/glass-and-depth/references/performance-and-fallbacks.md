# Performance and fallbacks

## The cost model

For every frame in which a `backdrop-filter` element is visible, the browser must:

1. Paint everything behind the element.
2. **Copy** the region behind it into a texture.
3. Run the filter chain over that texture (a blur is a two-pass separable convolution).
4. Composite the filtered result, then the element's own background and content on top.

Three consequences follow directly:

**Cost scales with area, not with element count** — a full-viewport glass overlay costs vastly more than five small docks with the same total perimeter. Area is the variable that matters.

**It re-runs whenever anything behind it changes** — including scroll. A fixed glass nav over a scrolling page is re-filtering every single frame of every scroll. This is the common case and the expensive one.

**It cannot be cached across frames** while the backdrop moves, so the usual "promote it to its own layer" instinct doesn't help; the whole point is that it depends on other layers.

Blur radius has a smaller effect than you'd expect (a separable blur is roughly linear in radius, and implementations downsample first), so *don't* try to buy performance by dropping 20px to 12px. Reduce area instead.

## What makes it affordable here

The reference implementation runs three or four glass surfaces and stays smooth on a phone. Why:

**Small surfaces.** The dock is a few hundred pixels wide and 48px tall. The settings box is smaller. Nothing spans the viewport.

**Few of them, and only while needed.** The menus **unmount** when closed rather than sitting at `opacity: 0`:

```tsx
<AnimatePresence>
  {open && <m.div …>{children}</m.div>}
</AnimatePresence>
```

This matters more than it looks. A `backdrop-filter` element still costs its filter pass when it's transparent or hidden behind another element — visibility is decided at composite time, after the filter has run. Unmounting is the only way to actually stop paying. (`display: none` also works; `opacity: 0` and `visibility: hidden` generally do not.)

**No animated blur.** The blur radius is constant. Animating `blur()` forces a fresh filter pass at a new radius every frame — one of the most expensive things you can ask a browser to do.

**Nothing animating behind the glass.** The backdrop is text and static images. Glass over a playing video or an animating canvas re-filters continuously even when nothing in the foreground moves.

## What to avoid

| Anti-pattern | Why |
|---|---|
| Full-viewport glass overlay | Cost is area-proportional; this is the worst case |
| Glass on list items | Multiplies the filter passes by row count |
| Animating `blur()` | New filter pass per frame at a new radius |
| Glass over video or canvas | Re-filters every backdrop frame |
| Closed menus kept at `opacity: 0` | Still pays the full filter cost |
| Glass over a flat background | Pays for a filter to produce a plain tint — just use the tint |
| Nested glass | Sampling already-filtered output; indeterminate result, doubled cost |

## Measuring it

In Chrome DevTools:

- **Performance panel**, record a scroll. Look for long green *Composite Layers* and *Paint* blocks. Glass shows up here rather than in scripting.
- **Rendering panel** → *Paint flashing* to see the repainted region — a glass surface repaints its whole area on every scroll frame.
- **Layers panel** to confirm you haven't accidentally created dozens of composited layers.

Test on the slowest device you support, scrolling a long page with images. Desktop GPUs hide this problem almost completely; mid-range Android phones do not.

The signal you're looking for is dropped frames *during scroll* specifically. If scroll is smooth on a mid-range phone, you're fine.

## Containment

`contain: paint` on a glass surface can help by bounding what the browser considers for its subtree. Measure before and after — it's occasionally a real win and occasionally nothing, depending on the surrounding layout.

Do **not** reach for `will-change: backdrop-filter`. It hints that the property will animate, which is exactly what you don't want it to do, and it can force an unnecessary layer.

## `prefers-reduced-transparency`

The preference exists for two distinct reasons: blur is expensive on low-powered devices, and translucent surfaces make text harder to read for some users. Both are served by the same response — **replace the material with an opaque one.**

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
    -webkit-backdrop-filter: none;
  }
}
```

**Both halves are mandatory, and each is useless alone:**

- Filter only → a 72% tint sitting over live page content with no blur to suppress it. *Worse* than the glass was, and now text overlaps text.
- Tint only → you still pay the entire cost of the blur, which was half the reason for the preference.

The tint substitutions are chosen per material, not blanket-white: chrome goes to `gray-100` (the raised-surface token, so the dock still reads as raised), the decorative pocket goes to `background-100` (fully opaque, since its whole purpose was translucency and there's nothing to preserve).

A useful side effect: with a solid tint, **text contrast becomes computable and real** for exactly the users most likely to need it.

Test it: macOS System Settings → Accessibility → Display → *Reduce transparency*, or DevTools Rendering panel → *Emulate CSS prefers-reduced-transparency*.

## `prefers-contrast: more`

```css
@media (prefers-contrast: more) {
  .glass-nav, .glass-panel, .folder-glass {
    border-color: var(--color-gray-1000);
  }
}
```

A translucent surface leans on its hairline to define its edge, and a 8%-alpha hairline is the first thing to disappear under a contrast preference. Promoting it to primary text colour makes the boundary unambiguous.

Note what *isn't* changed: the surface itself. High contrast is about edges and text, not about removing the material. Combine with reduced-transparency if the user has both, and the two compose correctly — solid surface, strong border.

## `@supports` — the gap worth closing

The reference implementation has **no `@supports` guard**. In a browser without `backdrop-filter`, its surfaces fall back to a bare tint with no blur: legible, but weak, and at 72% over a photograph, marginal.

Support is now very good (Firefox shipped it unflagged in 103, mid-2022), so this is a small risk rather than a live bug. It's still the right pattern:

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
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
  }
}
```

Progressive enhancement in the correct direction: **the opaque version is the default and the glass is layered on**, rather than the glass being the default with a fallback bolted underneath. If you invert it, the non-supporting path is the one that never gets tested.

`assets/glass.css` in this skill ships with the guard in place.

## The `-webkit-` prefix

Still required for Safari, and Safari is simultaneously where glass looks best and where most of the users who'll notice it are. Always declare both, unprefixed second:

```css
backdrop-filter: blur(20px) saturate(1.8);
-webkit-backdrop-filter: blur(20px) saturate(1.8);
```

There's no cost and no downside. Autoprefixer will do it if it's in your pipeline; declaring it by hand means it survives a build-config change.

## The transform interaction, as a performance note

Covered in the SKILL.md as a correctness issue, but it has a performance dimension too: an element inside a transformed subtree may have its `backdrop-filter` recomputed against a changing containing block on every frame of the transform — paying full cost while producing a wrong result.

Which makes the structural fix a double win:

```tsx
<DropMenu open={open}>            {/* animates — no filter here */}
  <ul className="glass-panel …">  {/* filters — never transformed */}
```

The wrapper animates cheaply (transform and opacity are compositor-only), and the glass child's filter isn't fighting a moving containing block.
