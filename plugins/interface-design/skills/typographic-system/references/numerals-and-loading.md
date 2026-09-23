# Numerals and loading

Two things a type system has to get right that no one notices until they break: figures that hold still, and fonts that arrive without moving the text.

## Figures

A family can draw its digits four ways, and the two choices are independent.

| | Proportional | Tabular |
|---|---|---|
| **Lining** (cap height, uniform) | Headlines, display numerals, a number in a UI label | Tables, prices, timers, dates in a column — the default for interfaces |
| **Oldstyle** (ascend and descend like lowercase) | Numbers inside running prose, in an editorial system whose family has them | Rarely: aligned figures in a book-like table |

```css
font-variant-numeric: tabular-nums;                  /* digits share one advance */
font-variant-numeric: lining-nums tabular-nums;      /* for families that default to oldstyle */
font-variant-numeric: oldstyle-nums proportional-nums; /* prose, editorial only */
font-variant-numeric: slashed-zero;                  /* IDs, codes, anything with O and 0 */
font-variant-numeric: diagonal-fractions;            /* 1/2 → ½, where the family supports it */
```

`font-feature-settings: "tnum" 1, "zero" 1` is the low-level equivalent. Prefer `font-variant-numeric`: `font-feature-settings` is all-or-nothing, so a later rule that sets one feature silently drops the others.

### Where tabular is mandatory

- **Any column.** A column of prices that doesn't align on the decimal can't be scanned; the eye reads the shape of the column before any single value.
- **Anything live.** A clock, a countdown, a counter, an upload percentage, a stock ticker. Proportional digits change width with value, so the row twitches every update and anything after it on the line jitters.
- **Dates and times in lists.** An experience list, a changelog, a log. The ranges line up or the list looks unfinished.
- **Ordered-list markers past nine.**

Proportional figures are right in two places: a number in a running sentence, where tabular spacing opens odd gaps around a 1, and display numerals, where the gaps show at size.

### Global or scoped

The dial decides. `product` sets tabular on the app shell's root, because nearly every number sits in something that aligns. `editorial` scopes it to tables, lists, meta lines and anything live, and leaves prose proportional. `expressive` sets it on `type.data` only. Whichever applies, the law is the same: no aligned or live number is proportional.

### Check the family has it

The property fails silently. A family without a `tnum` feature renders proportional digits and throws no error. Test it in the DOM rather than trust the specimen (canvas can't apply `font-variant-numeric`):

```js
const probe = (s) => { const el = Object.assign(document.createElement("span"), { textContent: s });
  el.style.cssText = "font: 400 16px 'Your Family'; font-variant-numeric: tabular-nums; position:absolute";
  document.body.append(el); const w = el.getBoundingClientRect().width; el.remove(); return w; };
probe("1111") === probe("0000"); // false: the family has no tnum, and needs another plan
```

If it doesn't have them, set `type.data` in the mono family or a sibling family that does, and record the decision.

### Aligning a numeric column

- **Right-align numbers**, left-align text, and align each header with its column's content.
- **Fixed decimals within a column.** 12.5 above 3.25 misaligns even in tabular figures; show both to two places.
- **Units in the header, not the cells.** "Amount (GBP)" over bare figures, rather than a currency sign on every row pushing the digits out of line. Where a sign must be in the cell, put it in its own column or pad with a figure space (U+2007), which is the width of one tabular digit.
- **A real minus.** U+2212 (−) is drawn to the width of a plus and sits on the maths axis; a hyphen is narrower and low, and a negative number misaligns by a hair.
- **Totals take a weight, not a size.** In `product`, `weight.medium` on a totals row separates it from the rows above without breaking the column's rhythm.

## Loading

### Self-host

A third-party font service means a DNS lookup and TLS handshake for the stylesheet, then again for the host that serves the files, before the font itself is requested. `preconnect` shortens that; it can't remove it, because you are still waiting on a stylesheet from one origin to learn a file URL on another. Self-hosted, the file comes over the connection the HTML used and can be preloaded from the first byte.

Framework loaders do this at build time — `next/font`, `@nuxt/fonts` — and `@fontsource` packages do it for any bundler. Otherwise, download the files and serve them with the rest of the static assets.

### Request only what the table uses

Load the weights `DESIGN.md` lists and nothing else. A family loaded at five weights and used at two is three downloads with no job. A variable file covering the range is usually smaller than three static ones and settles the question. Subset to the scripts you ship with `unicode-range`; the display face in `expressive` needs far less than the text face.

Preload only the files the first frame needs: the text face at `weight.regular` and, in `expressive`, the display weight. Preloading everything competes with the page for bandwidth.

A mono family for code and paths is a system stack — `ui-monospace, "SF Mono", Menlo, Consolas, monospace` — unless code is the product. Every platform ships a good one; a handful of spans doesn't justify a request.

### Swap, with a metric-matched fallback

`font-display: swap` stays: a flash of fallback text beats a flash of nothing. But a swap between faces with different metrics reflows every line — widths change, lines rewrap, the paragraph grows or shrinks under the reader. The fix is a fallback face scaled to the webfont's metrics, declared as its own `@font-face` over a local system font:

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

`next/font` generates this automatically (`adjustFontFallback`, on by default); `fontaine` and Capsize's `createFontStack` generate it for any stack from the family's metrics. Use them rather than tune by eye. Match both width and the vertical metrics: width alone still changes the line box.

### Tune for the frame that shows it

A swap costs most where one string carries the whole screen: an opening line alone on the page, a hero headline, a single large number on a dashboard. Find that frame and tune loading for it — preload, subset, match — rather than for the average page. On a page of body text a well-matched swap is invisible; under a lone headline it is the first thing a visitor sees.

### Smoothing

`-webkit-font-smoothing: antialiased` thins text on macOS, most visibly light text on dark surfaces. Set it on `body` once, or not at all; toggling it per component makes the same weight look different in two places.
