# Fallbacks and performance

Every material ships four paths besides the one you designed: no support, reduced transparency, increased contrast, and forced colours. Opaque surfaces need only the last. This file is the order they go in, what each must do, and the cost model that sets the translucency budget.

## The order

Source order is the law, because the fallbacks re-declare the same properties at the same specificity as the theme blocks, and the last declaration wins.

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

Three things to notice.

**The reduced-transparency block names every selector that set the tint**, at the same specificity. If the dark theme is `:root[data-theme="dark"]`, the fallback must say `:root[data-theme="dark"]` too, or it wins in light and loses in dark.

**`--surface-raised` in the baseline and the fallback is a surface that already exists.** The substitute is chosen per material, not blanket: chrome falls back to `surface.raised`, so the header still reads as raised; a decorative soften-tier pocket falls back to `surface.page`, because translucency was its whole purpose and there's nothing to preserve.

**Opaque is the default, the material is layered on.** Written the other way round — the material by default, a fallback bolted underneath — the non-supporting path is the one nobody ever sees, and so the one that ships broken.

## Reduced transparency: both halves

The preference exists for two reasons: blur is expensive on low-powered devices, and translucent surfaces make text harder to read. One response serves both — an opaque surface — and it needs both halves:

| Only… | Result |
|---|---|
| Drops the filter | A thin tint over live content with nothing suppressing it. Worse than before: text over text |
| Swaps the tint | Opaque, but still paying the full cost of the blur — half the reason for the preference |

A side effect worth having: with an opaque surface, text contrast becomes computable and true, for exactly the users most likely to need it.

Test with macOS *Reduce transparency*, Windows *Transparency effects* off, or the browser's rendering emulation.

## Increased contrast

A translucent surface leans on its edge, and a faint `border.layered` is the first thing to disappear under a contrast preference. Promote the edge to `text.primary`. Leave the surface alone — high contrast is about boundaries and text, not about removing the material — and it composes correctly with reduced transparency: opaque surface, strong edge.

## Forced colours

The browser replaces backgrounds and borders with system colours and removes every `box-shadow`. Two consequences:

- **A surface defined by its shadow disappears.** Law 2's edge is the only thing left. A surface with no visible edge in normal rendering carries `1px solid transparent`, which forced colours paints as `CanvasText`.
- **Anything using `background-clip: text` with transparent text** can render as nothing. That's why a sheen removes its class when it ends.

Leave `forced-color-adjust: none` alone unless a component is genuinely broken without it; the user chose their colours.

## The prefix, and the build pipeline

Safari still needs `-webkit-backdrop-filter`. Whether you should write it by hand depends on the pipeline, and the only way to know is the compiled CSS.

- **Pipeline prefixes for you** (Lightning CSS — which Tailwind v4 uses — or Autoprefixer, with browser targets that include Safari): write only `backdrop-filter`. Lightning CSS treats a hand-written `-webkit-` line beside the standard one as a duplicate and keeps the last declaration, so the conventional order ships the prefixed property alone. Firefox ignores it, and every material loses its blur there — invisibly in Chrome and Safari.
- **No prefixing step:** write both, standard property last.

In the Glass package, hand-writing the prefix after the standard property did exactly this on the live site. Verify on the built output, not the source:

```sh
# the rule as shipped — both properties must appear
grep -o '\.material-chrome{[^}]*}' dist/**/*.css
```

Or in Firefox, `getComputedStyle(el).backdropFilter` on a filtered element: `"none"` means the standard property didn't ship.

## The cost model

For every frame a filtered element is visible and its backdrop changes, the browser paints what's behind it, copies that region, runs the filter chain over it, and composites the result under the element's own content. So:

- **Cost scales with area.** One full-viewport surface costs far more than five small ones with the same total perimeter.
- **It re-runs whenever the backdrop changes** — including every frame of every scroll, for chrome over a scrolling page. That is the common case and the expensive one.
- **It can't be cached** while the backdrop moves, so promoting the element to its own layer doesn't help.
- **Radius matters less than you'd think.** Implementations downsample before blurring, so trimming 20px to 12px buys little. Reduce area and count instead.

| Avoid | Why |
|---|---|
| Full-viewport translucent surfaces | Worst case of an area-proportional cost |
| A translucent surface per list row or card | Multiplies passes by row count |
| Animating the blur radius | A fresh pass at a new radius every frame |
| Translucency over video, canvas or animation | Re-filters every backdrop frame, even when nothing in front moves |
| Closed menus at `opacity: 0` or `visibility: hidden` | Still pay the pass; visibility is decided after filtering. Unmount, or `display: none` |
| A filter over a flat single-colour backdrop | Pays for a pass to produce a plain tint |
| `will-change: backdrop-filter` | Hints an animation you don't want, and may force a needless layer |

`contain: paint` on the filtered surface sometimes helps by bounding its subtree; measure before and after.

**A blurred scrim** — the only full-viewport filter the Dials allow, and only in `expressive` — is affordable because the page behind a modal doesn't scroll: the filter runs during the open transition and then settles. It still never animates its radius; fade the scrim's opacity instead.

## The budget

The Dials give a count per preset. Count what is on screen at once, not what exists: a header, a dock and one open menu are three. Area ceiling in `editorial`: nothing wider than the reading measure except fixed chrome. `product`: zero, so there is nothing to count. `expressive`: four, and the only full-viewport one is a static overlay scrim.

## Measuring

- **Performance panel**, recording a scroll over a long page with images. Filters show as long paint and composite blocks, not as scripting.
- **Paint flashing**, to see a filtered surface repaint its whole area on every scroll frame.
- **Layers panel**, to confirm you haven't created dozens of composited layers.

Test on the slowest device you support. Desktop GPUs hide this almost completely; mid-range phones don't. The signal is dropped frames during scroll specifically.

## Shadows cost too, when they move

Transitioning `box-shadow` repaints the element every frame. On one card, fine. On every row of a long list, or on a grid where a hover runs across many cards, move the lifted shadow to a pseudo-element and fade its opacity, which the compositor handles:

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

The hovered card also takes `z.raised` if its lifted shadow reaches a neighbour, or the next sibling paints over it.
