# Fallbacks and performance

Every material ships four more paths — no support, reduced transparency, increased contrast, forced colours; opaque surfaces need only the last — and a cost model sets its budget.

## The order

The fallbacks re-declare the theme blocks' properties at the same specificity, so source order decides.

```css
/* 1. Theme blocks — tints and shadows per theme (tint colours: color-and-theming) */
:root                { --chrome-tint: rgb(245 245 247 / 0.76); }
[data-theme="dark"]  { --chrome-tint: rgb(34 34 38 / 0.76); }

/* 2. Opaque baseline — the default, and so the tested path */
.material-chrome {
  background: var(--surface-raised);
  border: 1px solid var(--border-layered);
}

/* 3. The material, as an enhancement */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .material-chrome {
    background: var(--chrome-tint);
    backdrop-filter: blur(20px) saturate(1.7);
  }
}

/* 4. Preferences — after everything above */
@media (prefers-reduced-transparency: reduce) {
  :root, [data-theme="dark"] { --chrome-tint: var(--surface-raised); }
  .material-chrome { backdrop-filter: none; }
}
@media (prefers-contrast: more) {
  .material-chrome { border-color: var(--text-primary); }
}
@media (forced-colors: active) {
  .material-chrome { border-color: CanvasText; }
}
```

**The reduced-transparency block names every selector that set the tint**: if the dark theme is `:root[data-theme="dark"]`, so is the fallback, or it wins in light only.

**`--surface-raised` is an existing surface, chosen per material:** chrome falls back to `surface.raised` and still reads as raised; a decorative soften-tier pocket, whose whole purpose was translucency, to `surface.page`.

**Opaque is the default, the material layered on**; a fallback bolted underneath is the path nobody sees, so the one that ships broken.

## Reduced transparency: both halves

Blur is expensive on weak devices and translucency hurts reading; an opaque surface answers both, with both halves:

| Only… | Result |
|---|---|
| Drops the filter | A thin tint over live content, suppressing nothing: text over text, worse than before |
| Swaps the tint | Opaque, but still paying for the blur — half the preference's reason |

It also makes text contrast computable and true for the users most likely to need it. Test with macOS *Reduce transparency*, Windows *Transparency effects* off, or the browser's rendering emulation.

## Increased contrast

A faint `border.layered` goes first. Promote the edge to `text.primary` and leave the surface — high contrast is about boundaries and text, not the material — so it composes with reduced transparency: opaque surface, strong edge.

## Forced colours

System colours replace backgrounds and borders, and every `box-shadow` goes, leaving only law 3's edge — `1px solid transparent` on an edgeless surface, painted as `CanvasText`. **`background-clip: text` with transparent text** can render as nothing, which is why a sheen removes its class when it ends.

Leave `forced-color-adjust: none` alone unless a component is broken without it; the user chose their colours.

## The prefix and the pipeline

Safari still needs `-webkit-backdrop-filter`; hand-writing it depends on the pipeline.

- **Pipeline prefixes for you** (Lightning CSS — which Tailwind v4 uses — or Autoprefixer, with targets including Safari): write only `backdrop-filter`. Lightning CSS treats a hand-written `-webkit-` line beside the standard one as a duplicate and keeps the last, shipping the prefix alone: Firefox ignores it and loses every blur, invisibly in Chrome and Safari.
- **No prefixing step:** write both, standard property last.

The Glass package's hand-written prefix did this on its live site. Verify the built output:

```sh
# the rule as shipped — both properties must appear
grep -o '\.material-chrome{[^}]*}' dist/**/*.css
```

Or in Firefox, `getComputedStyle(el).backdropFilter` on a filtered element: `"none"` means the standard property didn't ship.

## The cost model

Each frame a visible filtered element's backdrop changes, the browser paints behind it, copies the region, filters and composites. So:

- **Cost scales with area**: one full-viewport surface costs far more than five small ones of the same total perimeter.
- **It re-runs whenever the backdrop changes** — every scroll frame for chrome over a scrolling page, the common case.
- **It can't be cached** while the backdrop moves; a layer of its own doesn't help.
- **Radius matters less than you'd think.** Implementations downsample before blurring, so trimming 20px to 12px buys little; reduce area and count.

| Avoid | Why |
|---|---|
| Full-viewport translucent surfaces | Worst case of an area-proportional cost |
| A translucent surface per list row or card | Multiplies passes by row count |
| Animating the blur radius | A fresh pass at a new radius every frame |
| Translucency over video, canvas or animation | Re-filters every backdrop frame, even when nothing in front moves |
| Closed menus at `opacity: 0` or `visibility: hidden` | Still pay; visibility is decided after filtering. Unmount, or `display: none` |
| A filter over a flat single-colour backdrop | Pays a pass to produce a plain tint |
| `will-change: backdrop-filter` | Hints an unwanted animation; may force a needless layer |

`contain: paint` on the filtered surface sometimes helps; measure before and after.

**A blurred scrim**, the one full-viewport filter the Dials allow (`expressive` only), is affordable because the page behind a modal doesn't scroll, so it settles after the open transition. Fade its opacity, never its radius.

## The budget

Count what is on screen at once, not what exists — a header, a dock and one open menu are three — against the Dials' count and area ceiling.

## Measuring

- **Performance panel**, recording a scroll over a long page of images: filters show as long paint and composite blocks, not scripting.
- **Paint flashing**, to see a filtered surface repaint its whole area every scroll frame.
- **Layers panel**, to confirm you haven't made dozens of composited layers.

Test on the slowest supported device — desktop GPUs hide this, mid-range phones don't — and watch for dropped frames during scroll.

## Moving shadows cost too

Transitioning `box-shadow` repaints every frame: fine on one card, but across a long list or a hovered grid, fade a pseudo-element's opacity, which the compositor handles:

```css
.card { position: relative; box-shadow: var(--elevation-raised); }
.card::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  box-shadow: var(--elevation-raised-hover);
  opacity: 0; transition: opacity <duration.state> <ease.standard>;
  pointer-events: none;
}
.card:hover::after { opacity: 1; }
```
