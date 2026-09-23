# Status colours and chromatic exceptions

A status colour says *"what state is this in?"* from a small, fixed vocabulary; an exception asks *"may this element announce itself?"* and has to earn it. Mixing them grows the palette: a success green ends up on a "new" badge because it was there.

## Does the project need a status palette?

`product` requires one: a working reader meets errors, warnings and confirmations daily, each to be known at a glance. Elsewhere, only if something reports state — a form, a subscription flow, a build status, a changelog's breaking-change marker; four unused pairs are four tokens nobody maintains.

## The pair, and what each half must pass

Each status role is a **foreground** and a **background tint**, both re-picked per theme.

| Half | Job | Must clear |
|---|---|---|
| Foreground | The icon, the message's lead word, a border on a field in error | 4.5:1 on `surface.page`, on its own tint, and on any surface a status row can sit on (`surface.hover` in a table) |
| Background tint | The banner, the toast, the row, the field's fill | Reads as a surface, not a highlighter — about the `surface.hover` ratio against the page, with a little chroma |

Banner body text stays in `text.primary` and `text.secondary`; only the icon and lead word take the foreground. Re-measure the lowest tier used inside on the tint.

A **solid** fill — a destructive button — can often reuse the foreground: in light, a foreground at 4.5:1 on white gives white text 4.5:1 on it; in dark it takes dark `text.on-accent`-style text. Named separately: `status.danger.solid`.

In `DESIGN.md`: `status.danger.fg` and `status.danger.bg`, one row each, per theme.

## Deriving the four

1. **Hues.** Danger around OKLCH h 25, warning around 70 (amber, not yellow), success around 150, info around 250. Keep each at least ~40° from the `accent` and `focus` hue; an info that collides takes the accent's hue and loses its token, or drops colour — information rarely needs one.
2. **Light tints.** L 0.965, chroma 0.015–0.02; push chroma until the script reports clipping, then back off.
3. **Light foregrounds.** Chroma 0.10–0.12; solve lightness for the tertiary target against the *tint*, which is darker than the page and so the worst surface.
4. **Dark tints.** L 0.25, chroma about 0.035 — tinted, not darkened, so the banner doesn't punch a hole in the page.
5. **Dark foregrounds.** Chroma about 0.11; solve against the dark tint, then check against the lightest surface a status can sit on.

**Amber, not yellow:** no yellow foreground at usable chroma clears 4.5:1 on white — by then it is brown-olive. An insisted-on yellow warning becomes the *tint*, with an amber or near-black foreground.

### Harbour's status set

From `deriving-a-ramp.md`; foreground on page / own tint / `surface.hover`:

| Role | Light fg | Light bg | Ratios | Dark fg | Dark bg | Ratios |
|---|---|---|---|---|---|---|
| `status.danger` | `oklch(0.53 0.12 27)` | `oklch(0.965 0.015 27)` | 5.60 / 5.04 / 4.93 | `oklch(0.66 0.11 27)` | `oklch(0.25 0.035 27)` | 5.85 / 4.95 / 5.02 |
| `status.warning` | `oklch(0.52 0.1 70)` | `oklch(0.965 0.02 70)` | 5.63 / 5.08 / 4.95 | `oklch(0.66 0.11 70)` | `oklch(0.25 0.035 70)` | 6.01 / 5.06 / 5.17 |
| `status.success` | `oklch(0.51 0.12 150)` | `oklch(0.965 0.02 150)` | 5.44 / 4.95 / 4.78 | `oklch(0.64 0.11 150)` | `oklch(0.25 0.035 150)` | 5.95 / 4.93 / 5.12 |
| `status.info` | `oklch(0.52 0.12 250)` | `oklch(0.965 0.015 250)` | 5.50 / 4.97 / 4.83 | `oklch(0.65 0.11 250)` | `oklch(0.25 0.035 250)` | 5.93 / 4.97 / 5.10 |

Info at 250 sits 55° from Harbour's teal accent at h 195, so an info banner never reads as a focused button.

## The non-colour half of every signal

Name the carrier for each status and interactive state:

| Signal | Carrier that survives without colour |
|---|---|
| A field in error | A message below it, in words, linked with `aria-describedby`; an icon; the border change is the third signal, not the first |
| A status banner | A distinct icon *shape* per status (a cross, a triangle, a tick, an "i"), and a lead word — "Error", "Saved" |
| A toast | The same, plus `role="status"` or `role="alert"` so it is announced |
| The current nav item | A marker, a rule, a fill or a weight — and `aria-current` |
| A selected row | `surface.selected` *and* a check, a rule or a bar at the edge |
| A disabled control | Reduced contrast *and* no hover or pointer, plus `disabled` or `aria-disabled` |

A field in error, in roles — the message and icon carry it, the colour confirms it:

```html
<label for="dob">Date of birth</label>
<input id="dob" aria-invalid="true" aria-describedby="dob-error" />
<p id="dob-error" class="field-error">
  <svg aria-hidden="true"><!-- a cross, not a dot --></svg>
  Enter a date in the past.
</p>
```

```css
input[aria-invalid="true"] { border-color: var(--status-danger-fg); }
.field-error { color: var(--text-secondary); }          /* the sentence stays in ink */
.field-error svg { color: var(--status-danger-fg); }    /* only the mark takes the colour */
```

The neutral case: a contents rail moving the current label from `text.secondary` to `text.primary` — 7.7:1 to 15:1, clear in a table, nearly invisible in daylight, to low vision, or mid-scroll. A 2px rule or marker at the edge carries the state; the colour change reinforces it.

## Chromatic exceptions

### The test

**Content, or the interface speaking about it?** An offer ("the short version?"), a way in, a warning before the reader begins is a category the eye is entitled to find quickly, and most pages have very few. The Glass package's "short version" panel is the interface asking whether you want three lines instead of three thousand words; its colour is a gradient edge and a single accent mark, and the summary inside stays in the page's ink.

Reasons that can't spread name a category with one member: "it's the only offer on the page", "it's the one call to action in the flow", "it's the live indicator, and only one thing is ever live". Reasons that can, and will: "it's important", "it's new", "it's premium", "it's the brand colour", "the page felt grey".

### Containment

- **Only the mark takes the colour** — the edge, the glyph, the icon, the dot; text inside stays in the page's ink.
- **Its own named tokens**, `exception.<what-it's-for>-*`, so nothing borrows them by accident.
- **Every stop moves per theme** by roughly the same lightness (law 8), with the fill tinted rather than darkened.

### Counting

Within the dial's allowance, an expressive palette still names each hue's place: "coral only on section backgrounds in the pricing band", "violet only on the one hero illustration". A hue without a written place is an uncounted exception. What weight, position and space can't make findable is usually what must be found before reading starts.

### When the brand hue is also a status hue

A red brand and a red danger, or a green brand and a green success, read as each other; one gives way. Usually the status moves — danger to a deeper, bluer red, success to a teal-green — because a status must be unambiguous and a brand is also recognised by shape and placement. Where the brand colour must stay on a destructive action (a red brand's "Delete"), the word, the icon and a confirmation step say "destructive". Record the choice under `## Decisions`.

### The accent is not an exception

It is the one planned colour, its jobs set by the dial; law 5 in `SKILL.md` covers the ring it can hide when over-spent.

## Charts are a different palette

Categorical series colours are neither status nor exception and need their own method (distinguishable in colour-vision deficiency, legible in both themes, ordered). Never borrow status foregrounds: a red line reads as "error" whatever it measures.
