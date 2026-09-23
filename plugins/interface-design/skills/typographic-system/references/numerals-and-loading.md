# Numerals and loading

Two things nobody notices until they break: figures that hold still, and fonts that arrive without moving the text.

## Figures

Digits come four ways, from two independent choices.

| | Proportional | Tabular |
|---|---|---|
| **Lining** (cap height, uniform) | Headlines, display numerals, a number in a UI label | Tables, prices, timers, dates in a column — the default for interfaces |
| **Oldstyle** (ascend and descend like lowercase) | Numbers in running prose, in an editorial system whose family has them | Rarely: aligned figures in a book-like table |

```css
font-variant-numeric: tabular-nums;                  /* digits share one advance */
font-variant-numeric: lining-nums tabular-nums;      /* for families that default to oldstyle */
font-variant-numeric: oldstyle-nums proportional-nums; /* prose, editorial only */
font-variant-numeric: slashed-zero;                  /* IDs, codes, anything with O and 0 */
font-variant-numeric: diagonal-fractions;            /* 1/2 → ½, where the family supports it */
```

Prefer it to the low-level `font-feature-settings: "tnum" 1, "zero" 1`: `font-feature-settings` is all-or-nothing, so a later rule setting one feature silently drops the others.

### Where tabular is mandatory

- **Any column.** Prices unaligned on the decimal can't be scanned; the eye reads the column's shape first.
- **Anything live.** A clock, a countdown, a counter, an upload percentage, a ticker. Proportional digits change width, so the row twitches every update and the rest of the line jitters.
- **Dates and times in lists** — an experience list, a changelog, a log. Ranges that don't line up look unfinished.
- **Ordered-list markers past nine.**

Proportional figures are right in a running sentence, where tabular spacing opens odd gaps around a 1, and in display numerals, where those gaps show at size.

### Global or scoped

The dial decides: `product` sets tabular on the app shell's root, where nearly every number aligns; `editorial` scopes it to tables, lists, meta lines and anything live, leaving prose proportional; `expressive` sets it on `type.data` only. No aligned or live number is proportional.

### Check the family has it

Without `tnum`, a family renders proportional digits and throws no error. Test in the DOM, not the specimen (canvas can't apply `font-variant-numeric`):

```js
const probe = (s) => { const el = Object.assign(document.createElement("span"), { textContent: s });
  el.style.cssText = "font: 400 16px 'Your Family'; font-variant-numeric: tabular-nums; position:absolute";
  document.body.append(el); const w = el.getBoundingClientRect().width; el.remove(); return w; };
probe("1111") === probe("0000"); // false: the family has no tnum, and needs another plan
```

If not, set `type.data` in the mono or a sibling family that has it, and record the decision.

### Aligning a numeric column

- **Right-align numbers**, left-align text, and align each header with its column.
- **Fixed decimals within a column.** 12.5 above 3.25 misaligns even in tabular figures; show both to two places.
- **Units in the header, not the cells.** "Amount (GBP)" over bare figures, not a currency sign pushing each row's digits out of line. A sign that must be in the cell gets its own column, or pad with a figure space (U+2007), one tabular digit wide.
- **A real minus.** U+2212 (−) is a plus's width, on the maths axis; a hyphen is narrower and low, and misaligns negatives by a hair.
- **Totals take a weight, not a size.** In `product`, `weight.medium` separates a totals row without breaking the column's rhythm.

## Loading

### Self-host

A third-party font service means a DNS lookup and TLS handshake for the stylesheet, then again for the file host, before the font is requested. `preconnect` shortens that but can't remove it: you still wait on a stylesheet from one origin to learn a file URL on another. Self-hosted, the file rides the HTML's connection and can be preloaded from the first byte. Framework loaders do this at build time — `next/font`, `@nuxt/fonts` — and `@fontsource` packages for any bundler; otherwise, serve the files with the static assets.

### Request only what the table uses

Load the weights `DESIGN.md` lists and nothing else: five loaded, two used, is three downloads with no job. A variable file covering the range is usually smaller than three static ones. Subset to the scripts you ship with `unicode-range`; the `expressive` display face needs far less than the text face.

Preload only what the first frame needs — the text face at `weight.regular` and, in `expressive`, the display weight; preloading everything competes with the page for bandwidth.

Mono for code and paths is a system stack — `ui-monospace, "SF Mono", Menlo, Consolas, monospace` — unless code is the product; every platform ships a good one.

### Swap, with a metric-matched fallback

`font-display: swap` stays: a flash of fallback text beats a flash of nothing. But swapping faces with different metrics reflows every line under the reader. The fix is a fallback scaled to the webfont's metrics, its own `@font-face` over a local system font:

```css
@font-face {
  font-family: "Brand Sans Fallback";
  src: local("Arial");
  size-adjust: <S>;
  ascent-override: <A>;
  descent-override: <D>;
  line-gap-override: <L>;
}
:root { --font-sans: "Brand Sans", "Brand Sans Fallback", system-ui, sans-serif; }
```

From the webfont's metrics (units per em `U`, ascent, descent, line gap, and average character width `w`) and the fallback's average width `wf` in its own units per em `Uf`:

```
S = (w / U) ÷ (wf / Uf)            a ratio; write it in CSS as a percentage
A = (ascent / U) ÷ S
D = (|descent| / U) ÷ S
L = (lineGap / U) ÷ S
```

`next/font` generates this (`adjustFontFallback`, on by default); `fontaine` and Capsize's `createFontStack` do it for any stack. Use them rather than tuning by eye, and match vertical metrics as well as width: width alone still changes the line box.

### Tune for the frame that shows it

A swap costs most where one string carries the screen — an opening line alone, a hero headline, one large dashboard number. Preload, subset and match for that frame, not the average page: in body text a matched swap is invisible; under a lone headline it is the first thing seen.

### Smoothing

`-webkit-font-smoothing: antialiased` thins text on macOS, most visibly light on dark. Set it on `body` once or not at all; per component, one weight looks different in two places.
