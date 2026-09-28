---
name: glass-and-depth
description: "The exact glass material from modimihir.com — the Glass package, to copy as-is. Material, not glassmorphism: blur scaled to backdrop uncertainty, saturation against greying, a tint for legibility when blur fails, and depth cues (hairline, layered shadows, continuous corners). Also gradient 1px strokes, emissive glows, one-pass sheens. Use when building or reviewing frosted navigation, floating menus, sheets, drop-ups, hover cards, tooltips, modal panels, gradient borders or any backdrop-filter surface; when glass looks muddy, cloudy, flat, or unreadable; when a gradient shifts or shimmers as its box resizes; when stacking glass over glass; when text over a translucent surface fails contrast; and when implementing reduced-transparency, high-contrast, reduced-motion, or no-backdrop-filter fallbacks."
---

# Glass and Depth

> **Glass package.** This is the glass material running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. For the same principles fitted to your project's own names, values and character, use `surfaces-and-depth` from the adaptable set. When both are installed and the project's `DESIGN.md` names a preset other than `glass`, that skill leads and this one is only a worked example.

Glassmorphism is blur and a white tint alone: a cloudy rectangle. Glass that reads as **material** is **four properties working at once**, plus three depth cues that have nothing to do with transparency:

| | Property | Job |
|---|---|---|
| 1 | `blur()` | Suppress the backdrop so the surface's content reads |
| 2 | `saturate()` | Undo blur's desaturation — *translucent*, not *dirty* |
| 3 | A tint | Carry legibility, especially when blur is compromised |
| 4 | A hairline edge | Say exactly where the surface ends |
| 5 | A layered shadow | Say it's above something |
| 6 | Continuous corners | Say it's an object |

Without 2 it's muddy, without 4 the edge is mush, without 5 it's a flat patch; drop any one and it stops convincing.

## 1. Blur scales with uncertainty about the backdrop

Not with importance or size, but with **how little you know about what's behind it**.

| Tier | Blur | Saturate | Tint | Backdrop | Used for |
|---|---|---|---|---|---|
| `folder-glass` | **8px** | 1.4 | gradient, 55%→34% | Content you *want* recognised | A frosted pocket, cards peeking behind |
| `glass-nav` | **20px** | 1.8 | 72% | Arbitrary page content | Fixed chrome that content scrolls under |
| `glass-panel` | **24px** | 1.8 | **97%** | Anything, including other glass | A floating menu that must stay legible |

The pocket's cards should stay recognisable: 8px softens rather than obscures, and 1.4 saturation keeps the pocket quieter than its contents. Paragraphs, photographs and image walls scroll under fixed chrome; 20px leaves less to compete with its icons. The panel, least in control of its backdrop, gets the most defensive 24px.

> **A finding from the reference implementation:** a fourth material, `glass-menu` (16px / 1.8 / 72%), for "a menu over a surface you already know", is dead CSS: every menu needed `glass-panel`'s defensive tint. Copy three tiers.

## 2. `saturate()` is not optional

The highest-leverage line here. Blur averages pixels, pulling colour toward grey, so a blurred backdrop is *always* greyer than the original, more so the more you blur.

```css
backdrop-filter: blur(20px) saturate(1.8);
```

1.8 restores colour so it reads *translucent*, not *dirty*: free, same pass, as in Apple's materials. **1.8 where you're suppressing the backdrop, 1.4 where you're only softening it**; above ~2.0 colours look radioactive.

## 3. The tint carries legibility when the blur can't

`glass-panel` pairs a 24px blur with **97% opacity** because:

> A `transform` on an ancestor weakens or breaks `backdrop-filter` in its subtree.

Its menus' wrappers *scale open*, and meanwhile the blur samples the wrong backdrop or nothing, so the tint does the work. **When you can't rely on the blur, thicken the tint.** Never ship a 72% surface whose blur is broken; it's unreadable over busy content.

Better, where you can: make the animating wrapper and glass surface different elements.

```tsx
<DropMenu open={open}>            {/* animates scale + y */}
  <ul className="glass-panel …">  {/* carries the blur, never transformed */}
```

Same bug class as a transform capturing `position: fixed` descendants: when anything filtered or positioned misbehaves, check every ancestor for `transform`, `filter`, `perspective`, `contain` and `will-change`.

## 4. Glass over glass needs a tier gap

The settings box (`glass-panel`) opens right above the dock (`glass-nav`). **Stacked blurs don't compose:** the upper blurs the lower's already-blurred output, giving not twice the frost but mush that varies by stacking context and browser. **Two surfaces at one tint read as one object:** at 72% the drop-up would look like the dock growing taller; at 97% it's a separate panel. So **when glass overlaps glass, the tiers must differ visibly**: a much heavier tint on the upper surface, or opaque.

## 5. Depth cues: glass alone doesn't float

A blurred, tinted rectangle is a *patch*; three more cues make it an object.

### The hairline

```tsx
className="glass-nav rounded-2xl border-[0.5px] border-gray-alpha-400 p-1"
```

`0.5px` is a true hairline on retina and rounds up to 1px elsewhere, degrading rather than disappearing. **Use the translucent ramp** (see **glass-color**), **not a solid grey:** a solid `gray-400` ignores the backdrop and reads as a pasted-on frame; `gray-alpha-400` sits *on* whatever's there, white page or photograph.

### The shadow stack

Four layers, one light source above, in **one class**, not inline:

```css
.dock-shadow {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),   /* top-edge catch light */
    0 1px 1px rgba(0, 0, 0, 0.02),            /* contact */
    0 8px 16px -4px rgba(0, 0, 0, 0.04),      /* near ambient */
    0 24px 32px -8px rgba(0, 0, 0, 0.06);     /* far ambient */
}
:root[data-theme="dark"] .dock-shadow {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 1px 1px rgba(0, 0, 0, 0.3),
    0 8px 16px -4px rgba(0, 0, 0, 0.5),
    0 24px 32px -8px rgba(0, 0, 0, 0.6);
}
```

The **inset highlight**, the specular catch where a raised surface faces the light, does more for the float than any shadow. The **contact shadow** makes it *rest on* something, not sit pasted over. **Two ambient layers**: one reads as fog, two fall off like penumbra. **Negative spread** keeps it tucked, not haloing. Opacities are 2–6%: a shadow you can identify as a shadow is too strong.

Dark mode is a **different** shadow, not a re-tint: shadows ~10× stronger (4% black on `#0b0b0b` is invisible), highlight ~6× weaker (0.6 white on dark is a glowing edge, not a catch light).

**Extract it the moment it appears twice.** This ~400-character string was once inline in five places here, each with a dark twin; nobody spots a `0.04` that became `0.05` in one. Not being a colour, it *can't* be a design token (§6 of **glass-color**), so a class is its only home.

### Continuous corners

```css
*, *::before, *::after { corner-shape: superellipse(1.5); }
```

A `border-radius` quarter-circle's curvature drops abruptly to zero at the edge; a superellipse eases into it, as an iOS icon does. `superellipse(k)` uses exponent 2^k, so 1.5 is about halfway to a full squircle. Unsupported browsers get normal rounding.

→ Every elevation tier, the nesting radius rule, why each layer is there: `references/depth-cues.md`

## 6. A gradient edge, without a wrapper or a mask

For an edge that *changes* down its height (the one chromatic panel runs deep navy to pale blue), skip the wrapper div inset by 1px and the SVG mask:

```css
.sv-panel {
  border: 1px solid transparent;
  background-image:
    linear-gradient(var(--sv-fill-top), var(--sv-fill-bottom)),      /* the fill */
    linear-gradient(180deg,                                          /* the stroke */
      var(--sv-edge-top) 0px,
      var(--sv-edge-mid) 120px,
      var(--sv-edge-bottom) 240px);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
```

Fill clipped to the padding edge, gradient to the border edge, showing through the transparent border. **`background-origin: border-box` is the load-bearing line:** without it the gradient is sized to the padding box but clipped to the border box, so every side gets the wrong end of the ramp: almost right, the worst kind of wrong.

### Anchor gradient stops in pixels, not percentages

Percentage stops rescale **whenever the box resizes**. A 46px bar opening to 250px ran the whole navy-to-pale sweep inside 46px, *louder* than the panel it became, and shimmered as the ramp re-fitted each frame. In pixels (`0px / 120px / 240px`) the top holds still and the colour grows downward: free, and the better reveal.

**On anything that changes size, anchor gradients in absolute units.** Percentages suit a fixed box, not a disclosure, a resizable panel or anything animating its height.

### Weight the glow to the sides

One coloured shadow reads as *a drop shadow that happens to be blue*; four read as light off the panel:

```css
box-shadow:
  0 1px 2px rgba(22, 39, 107, 0.05),          /* contact */
  -10px 0 20px -18px rgba(47, 90, 196, 0.38), /* left */
  10px 0 20px -18px rgba(47, 90, 196, 0.38),  /* right */
  0 10px 24px -16px rgba(47, 90, 196, 0.3);   /* below */
```

The horizontal casts make it emission. It lifts on hover **and stays lifted while open** (`.sv-panel:hover, .sv-panel[data-open="true"]`), so the colour reports the chevron's state. Transition at 220ms, off under `prefers-reduced-motion`.

### One pass of light, not a loop

To shimmer a label as the panel opens, clip a moving gradient to it and run it **once**:

```css
.sv-sheen {
  background-image: linear-gradient(100deg,
    var(--sv-accent) 40%, var(--sv-sheen-hi) 50%, var(--sv-accent) 60%);
  background-size: 250% 100%;
  background-clip: text;
  color: transparent;
  animation: svSheen 700ms var(--ease-geist) both;
}
```

**Drop the class on `animationend`**: left in place, `background-clip: text` with `color: transparent` is a text-selection and forced-colours hazard. **Never loop it**: a repeating shimmer claims work is still happening. Under reduced motion, drop animation and background image for plain accent colour.

## 7. Text over glass is the real accessibility problem

**Contrast on a translucent surface can't be computed**: the effective background is whatever is behind it. In order of preference:

1. **Raise the tint until it's effectively opaque behind text.** Hence `glass-panel` at 97%, where contrast against the tint *is* computable.
2. **Only high-contrast text on glass:** here, icons at `quiet`→`gray-1000` (not `gray-600`, 2.38:1 on white) and 13–14px rows at `gray-900`/`gray-1000`. Nothing muted, nothing small.
3. **No reading copy on glass.** No paragraph on the site sits on a translucent surface. Glass is chrome.

The trap: measuring against the tint as if a 72% surface were opaque. That number is fiction: the real ratio is worse wherever the backdrop is light.

## 8. Fallbacks

### `prefers-reduced-transparency` — both halves, and it must come last

```css
/* AFTER both theme blocks — it re-declares the same properties. */
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
  .glass-nav, .glass-panel, .folder-glass {
    backdrop-filter: none;
  }
}
```

**Both halves are required.** Filter alone leaves a 72% tint over live content, *worse* than the glass; tint alone still pays for the blur. Hence **runtime `:root` variables, not build-time tokens**: a media query must replace them. (One is a gradient, too, which no colour-token system accepts.)

### `prefers-contrast: more`

```css
@media (prefers-contrast: more) {
  .glass-nav, .glass-panel, .folder-glass { border-color: var(--color-gray-1000); }
}
```

Translucent chrome's edge is its hairline, so at high contrast it becomes a real border: the surface stays, the boundary turns unambiguous.

### `@supports` — the gap in the reference implementation

The reference implementation has **no `@supports` guard**, so without `backdrop-filter` it gets a bare 72% tint: legible, but weak. Support is near universal; the guard is still right:

```css
.glass-nav { background: var(--color-gray-100); }   /* opaque baseline */

@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-nav {
    background: var(--glass-nav-bg);
    backdrop-filter: blur(20px) saturate(1.8);
  }
}
```

Opaque first, glass as the enhancement. Test both conditions: Safari shipped only the prefix for years.

**Don't hand-write `-webkit-backdrop-filter`.** Safari needs it, but Lightning CSS (Tailwind v4's) and Autoprefixer add it from your browser targets, and Lightning CSS keeps only the *last* of a hand-written pair. Standard first, the usual order, ships the prefix alone, so Firefox silently loses every blur while Chrome and Safari look fine; the reference implementation has this bug. With no build step, write the prefixed line first. Either way, check the *compiled* CSS for both.

## 9. Performance

`backdrop-filter` copies, filters and composites the region behind every frame. Cost scales with **area** and recurs whenever the backdrop changes, scroll included. It stays affordable here with:

- **Small surfaces.** A dock a few hundred pixels wide, not a full-viewport overlay.
- **Few of them.** Three or four at most; closed menus unmount (glass costs even at `opacity: 0`).
- **No animated blur.** Animating the radius re-filters every frame at a new radius.

Avoid full-page overlays, glass on list items (one per row), animating `blur()`, and glass over video or animating canvas.

→ Cost model, containment, what to measure: `references/performance-and-fallbacks.md`

## 10. When not to use glass

Glass says "this floats above your content, and the content continues underneath." Otherwise it's the wrong material:

- **A page section.** It's not floating; it's the page.
- **A card in a grid.** Nothing meaningful is behind it; use a solid surface and a shadow.
- **Anything holding reading copy.** See §7.
- **Over a solid single-colour background.** The blur reveals nothing; use the tint.
- **When the content behind must stay readable.** Use a shadow, not a blur.

The site uses glass in four places, all floating chrome: the nav dock, the settings drop-up, the mobile sheet, one decorative pocket. Everything else is opaque.

## Assets

- `assets/glass.css` — the three materials, all fallbacks, the missing `@supports` guard, `.dock-shadow`, the gradient-stroke panel. Pairs with `glass-color/assets/color-tokens.css` (tints, `--sv-*` stops).
- `assets/GlassPanel.tsx` — wrapper/surface split, hairline and stacking, as a component.

## Checklist

- [ ] `saturate()` on every `backdrop-filter`: 1.8 suppressing, 1.4 softening.
- [ ] Blur set by backdrop uncertainty, not size or importance.
- [ ] Three tiers, not one blur everywhere.
- [ ] Tint thickened where an ancestor transform compromises blur.
- [ ] Animating wrapper and glass surface are different elements.
- [ ] Overlapping glass at visibly different tints.
- [ ] Hairline **and** shadow on every glass surface.
- [ ] Hairline on the translucent ramp, not a solid grey.
- [ ] Layered shadow (inset highlight + contact + ambient), negative spread.
- [ ] Shadow stack in **one class**, not inline, dark twin beside it.
- [ ] Dark shadows ~10× stronger, dark inset highlight ~6× weaker.
- [ ] Gradient stroke: `background-origin: border-box`, transparent border.
- [ ] Gradient stops in **pixels** on anything that resizes or animates height.
- [ ] Coloured glow weighted to the sides.
- [ ] Sheen runs once, unclassed on `animationend`, off under reduced motion.
- [ ] No reading copy, and no muted or small text, on glass.
- [ ] `prefers-reduced-transparency` swaps tint **and** drops filter, and comes last.
- [ ] `prefers-contrast: more` promotes the hairline.
- [ ] `@supports` guard with an opaque baseline.
- [ ] Source has only `backdrop-filter`; *compiled* CSS adds `-webkit-backdrop-filter`.
- [ ] Glass tints are runtime `:root` variables, not build-time tokens.
- [ ] Closed menus unmount, never sit invisible.
- [ ] No animated blur radius; no full-viewport glass.
- [ ] Each use is floating chrome, not card, section or flat background.
