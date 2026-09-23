# Status colours and chromatic exceptions

Two different questions that both end in "may this be coloured?". A status colour answers *"what state is this in?"* and belongs to a fixed, small vocabulary. An exception answers *"may this element announce itself?"* and has to earn it. Mixing the two is how a palette grows: a success green gets used for a "new" badge because it was there.

## Does the project need a status palette?

`product` requires one: a working reader meets errors, warnings and confirmations every day, and each must be recognisable at a glance. `editorial` and `expressive` need one only if something on the page reports state — a form, a subscription flow, a build status, a changelog's breaking-change marker. Check before adding it; a reading site with four unused status pairs has four tokens nobody maintains.

## The pair, and what each half must pass

Each status role is a **foreground** and a **background tint**, both re-picked per theme.

| Half | Job | Must clear |
|---|---|---|
| Foreground | The icon, the message's lead word, a border on a field in error | 4.5:1 on `surface.page`, on its own tint, and on any surface a status row can sit on (`surface.hover` in a table) |
| Background tint | The banner, the toast, the row, the field's fill | Reads as a surface, not a highlighter — about the `surface.hover` ratio against the page, with a little chroma |

Body text inside a status banner stays in `text.primary` and `text.secondary`. Only the icon and the lead word take the foreground — the mark, as with any chromatic element. Re-measure the lowest text tier used inside the banner against the tint.

A **solid** status fill — a destructive button — can often reuse the foreground as its fill: in light a foreground at 4.5:1 on white already gives white text 4.5:1 on it. In dark it takes dark `text.on-accent`-style text. If the project names it separately, `status.danger.solid` is the proposed form.

The notation in `DESIGN.md`: `status.danger.fg` and `status.danger.bg`, one row each, per theme.

## Deriving the four

1. **Hues.** Danger around OKLCH h 25, warning around 70 (amber, not yellow), success around 150, info around 250. Keep each at least ~40° from the `accent` and `focus` hue; if info collides with the accent, info takes the accent's hue and loses its own token, or it drops colour altogether — information rarely needs a colour.
2. **Light tints.** L 0.965, chroma 0.015–0.02. Push chroma until the script reports clipping, then back off.
3. **Light foregrounds.** Chroma 0.10–0.12; solve lightness for the tertiary target against the *tint*, which is darker than the page and therefore the worst surface.
4. **Dark tints.** L 0.25, chroma about 0.035 — tinted, not darkened, so the banner sits on the page rather than punching a hole in it.
5. **Dark foregrounds.** Chroma about 0.11; solve lightness against the dark tint, then check it against the lightest surface a status can sit on.

**Why amber, not yellow.** A yellow foreground has no lightness at usable chroma where it clears 4.5:1 on white — by the time it passes it is brown-olive. Amber stays recognisably "warning" at a readable lightness. A project that insists on a yellow warning uses it as the *tint* and an amber or near-black foreground.

### Harbour's status set

The same fictional scheduling product as `deriving-a-ramp.md`. Measured with `contrast.mjs`, foreground against page / own tint / `surface.hover`:

| Role | Light fg | Light bg | Ratios | Dark fg | Dark bg | Ratios |
|---|---|---|---|---|---|---|
| `status.danger` | `oklch(0.53 0.12 27)` | `oklch(0.965 0.015 27)` | 5.60 / 5.04 / 4.93 | `oklch(0.66 0.11 27)` | `oklch(0.25 0.035 27)` | 5.85 / 4.95 / 5.02 |
| `status.warning` | `oklch(0.52 0.1 70)` | `oklch(0.965 0.02 70)` | 5.63 / 5.08 / 4.95 | `oklch(0.66 0.11 70)` | `oklch(0.25 0.035 70)` | 6.01 / 5.06 / 5.17 |
| `status.success` | `oklch(0.51 0.12 150)` | `oklch(0.965 0.02 150)` | 5.44 / 4.95 / 4.78 | `oklch(0.64 0.11 150)` | `oklch(0.25 0.035 150)` | 5.95 / 4.93 / 5.12 |
| `status.info` | `oklch(0.52 0.12 250)` | `oklch(0.965 0.015 250)` | 5.50 / 4.97 / 4.83 | `oklch(0.65 0.11 250)` | `oklch(0.25 0.035 250)` | 5.93 / 4.97 / 5.10 |

Harbour's accent is teal at h 195; info at 250 sits 55° away, far enough that an info banner and a focused button never read as the same thing.

## The non-colour half of every signal

Colour reinforces; something else carries. For each status, and for every interactive state, name the carrier:

| Signal | Carrier that survives without colour |
|---|---|
| A field in error | A message below it, in words, linked with `aria-describedby`; an icon; the border change is the third signal, not the first |
| A status banner | A distinct icon *shape* per status (a cross, a triangle, a tick, an "i"), and a lead word — "Error", "Saved" |
| A toast | The same, plus `role="status"` or `role="alert"` so it is announced |
| The current nav item | A marker, a rule, a fill or a weight — and `aria-current` |
| A selected row | `surface.selected` *and* a check, a rule or a bar at the edge |
| A disabled control | Reduced contrast *and* the absence of hover and pointer — plus `disabled` or `aria-disabled` |

A field in error, written in roles — the message and the icon carry it, the colour confirms it:

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

Why this is a law even in a neutral system: picture a contents rail that marks the current section only by moving its label from `text.secondary` to `text.primary`. At 7.7:1 and 15:1 the two tiers are a clear difference in a ratio table, and nearly invisible on a laptop in daylight, for a reader with low vision, or at a glance mid-scroll. Once every tier must clear 4.5:1 there are only two or three readable greys, and the steps between them are too small to carry meaning. A 2px rule or a marker at the item's edge carries the state; the colour change stays, as reinforcement.

## Chromatic exceptions

### The test

**Is this element content, or is it the interface speaking about the content?** Content — the article, the table, the product card — should look like everything else the reader came for. The interface speaking — an offer ("the short version?"), a way in, a warning before the reader begins — is a category the eye is entitled to find quickly, and most pages have very few of them.

In the Glass package the one exception is a collapsed "short version" panel at the top of a long case study. It passes because it is an offer — the interface asking whether you want three lines instead of three thousand words — and nothing else on the site is an offer. Its colour is a gradient edge and a single accent mark; the summary text inside stays in the page's ink.

Reasons that can't spread, because they name a category with one member: "it's the only offer on the page", "it's the one call to action in the flow", "it's the live indicator, and only one thing is ever live".

Reasons that can, and will: "it's important", "it's new", "it's premium", "it's the brand colour", "the page felt grey". Every author believes their element qualifies, so within two components the exception is a palette.

### Containment

- **Only the mark takes the colour.** The edge, the glyph, the icon, the dot. Text inside stays in the page's ink. A coloured paragraph inside the coloured element doubles the loudness, and the element stops meaning anything once its loudness is shared with its contents.
- **The exception has its own named tokens**, `exception.<what-it's-for>-*`, so nothing else borrows them by accident.
- **Every stop moves per theme.** An exception's gradient is re-picked whole for dark: a deep top stop that sits a few points above a dark page vanishes down half its length, and lightening only that stop pinches the ramp so it no longer reads as one gradient. Move all the stops by roughly the same lightness, and tint the fill rather than darkening it.

### Counting

The number allowed is a dial — ≤ 1 in `editorial`, 0 in `product` (the status palette is its colour), ≤ 4 in `expressive`. An expressive brand palette still names each hue's place: "coral only on section backgrounds in the pricing band", "violet only on the one hero illustration". A hue with no written place is an uncounted exception.

Before spending one, ask whether weight, position and space can do the job. Most elements can be found without colour; the ones that can't are usually the ones that must be found before reading starts.

### When the brand hue is also a status hue

A red brand and a red danger, or a green brand and a green success, will be read as one another. Choose which one gives way. Usually the status moves — danger to a deeper, bluer red, success to a teal-green — because a status must be unambiguous and a brand can be recognised by shape and placement. Where the brand colour must stay on a destructive action (a red brand's "Delete" button), the carrier rule does the work: the word, the icon and a confirmation step say "destructive", not the hue. Record the choice under `## Decisions`.

### The accent is not an exception

The accent is the system's one planned colour, with fixed jobs set by the preset dial. It can still be over-spent: accent links beside an accent focus ring beside accent buttons means the ring disappears where it's most needed. Law 5 in `SKILL.md` covers the ring; the dial covers the accent's reach.

## Charts are a different palette

Categorical series colours in a chart are neither status nor exception, and they need their own method (distinguishable in colour-vision deficiency, legible in both themes, ordered). Don't borrow the status foregrounds for series — a red line reads as "error" whatever it measures.
