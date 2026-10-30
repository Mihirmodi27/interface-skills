# Status colours and chromatic exceptions

A status colour says *"what state is this in?"* from a small, fixed vocabulary; a hue family says what a thing is, where it lives or who; an exception asks *"may this element announce itself?"* and has to earn it. Each colour has exactly one of those jobs, written down. Mixing them grows the palette: a success green ends up on a "new" badge because it was there.

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

### Destructive actions take red ground, not red decoration

In a menu, a destructive item is a `status.danger.bg` row at rest and `status.danger.solid` with white text when highlighted. A red icon and red label on a neutral row is decoration, the coloured paragraph again, and reads as a one-off. It takes no icon: the verb and its place, set apart at the end of the menu, carry it without colour. Every destructive or session-ending item (delete, clear, sign out) takes this one treatment, so the reader learns it once.

## Figures take colour only while they report

A count or stat is in ink unless it reports a problem or progress: overdue or failed in `status.danger.fg`, pending or due soon in `status.warning.fg`, done or logged in `status.success.fg` where the preset colours done. Plain counts stay in ink, and so does every zero; "0 overdue" in red is an alarm with nothing behind it. The label beside the figure always names what it counts, so the colour confirms a word rather than replacing one. One colour per figure: a chip beside it that would compete goes neutral.

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
| A work item's state | A glyph whose shape moves with the work: empty ring, dashed ring, half, three-quarters, filled check; a cross for cancelled or failed, a "!" for blocked |
| Priority | Bars, filled from one to three |
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

A ring that fills as work moves is legible in greyscale, so its colour only confirms what the shape says; that is what lets a product colour done without colour carrying it.

## Done, and where the reader is

Law 7's dial, decided by whether completion is the news:

| The list is… | Done looks like | Why |
|---|---|---|
| A sequence the reader passes through: setup steps, passed checks, a wizard | An ink check on a neutral circle | Completion is expected; the pending item is the only news, and a column of green ticks outshouts it |
| Work people open to see what got done: a task board, a review queue | `status.success` on a filled check | Completion is what they track. The glyph's shape already says done, and late or failed items take warning or danger, so the eye still finds what needs a person |
| A long list of ticked checkboxes | A light grey box with an ink tick | An inverted ink or accent block per tick shouts down a long list; the tick's shape carries the state |
| A switch | Its strong fill, on | A switch has no tick, so the fill is the state |

The second row reverses the first on purpose: it is what the "too grey" product in law 7 changed on its boards. Record which lists take which row under `## Decisions`, so the next audit doesn't "fix" one into the other.

Where the reader *is* stays neutral. A place in the data with one member is different: on a calendar board, today's column may take a filled `accent` with `text.on-accent`, the one time the brand marks a place rather than an action. Record it as `exception.today`; it doesn't make a second.

## Hue families: colour with a job

Where the reader sorts by kind, place or person at a glance, each question gets its own family, and no family answers another's.

| Question | Family | Takes the colour | Never |
|---|---|---|---|
| What is it? | `exception.type.<name>`, one per record type | Its icon, its tag, its chart bar | Text, a state, a whole row |
| How is it doing? | `status.*` | Its glyph, a figure (above), a field's edge, a banner's tint | A kind, a place, anything merely live |
| Where does it live? | `exception.area.<name>`, one per folder or area | Nav icon, breadcrumb step, page-title icon | Text, a state |
| Who? | `exception.person.<n>`, a fixed set assigned from the person's id | Avatars only, coloured rather than grey circles | Names, rows |

- **Marks only.** The family colours the glyph; the words beside it stay in ink.
- **No crossing.** A late task's type icon keeps its hue; the status glyph beside it turns. Where a family hue falls near a status hue or the accent, move its lightness or chroma until it can't be read as one, and never reuse a status value.
- **3:1 on every ground, per theme.** A mark the reader needs is a non-text graphic: measure it with `contrast.mjs --min 3` on each surface it sits on (panel, frame, hover, selected) in each theme, and re-pick the family per theme like any accent.
- **Listed.** Under **Exceptions** in `DESIGN.md`, each family with its question, its members and its marks: "`exception.area.*` — where a record lives. Nav icon, breadcrumb step, page-title icon. Never text, never state."

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

### Live is not danger

A recording or live state borrows nothing from `status.danger`: a red-filled record button reads as an error and as the destructive colour, and looks wrong. Live is the brand's: a well tinted with the accent, a 1px accent ring, a soft accent glow, and level bars that move with the input. Red survives only as a small live dot. The control shows Stop on hover and focus, and holds still while paused; both belong to `interface-motion`. Name it `exception.live`.

### One gradient, for AI working now

If a product has one gradient, it means one thing. A thin conic stroke in the accent's hues travels round the card where AI is working live, with a soft glow; everything else stays flat. Paused, the stroke stops and the glow dims; under reduced motion it holds still; under `prefers-contrast: more` it becomes a solid accent edge. Its stops are runtime values, every one moved per theme (laws 8 and 10). Name it `exception.ai-live`.

### Marking AI output

A small sparkle glyph in the accent beside what the AI wrote: not a robot avatar, not a coloured bubble. A bubble colours the content, which the reader judges in ink like any other, and an avatar gives a tool a face. Only the mark takes the colour, and a mark, never a fill, doesn't compete with the one action the accent marks.

### When the brand hue is also a status hue

A red brand and a red danger, or a green brand and a green success, read as each other; one gives way. Usually the status moves — danger to a deeper, bluer red, success to a teal-green — because a status must be unambiguous and a brand is also recognised by shape and placement. Where the brand colour must stay on a destructive action (a red brand's "Delete"), the word, the icon and a confirmation step say "destructive". Record the choice under `## Decisions`.

### The accent is not an exception

It is the one planned colour, its jobs set by the dial; law 5 in `SKILL.md` covers the ring it can hide when over-spent.

## Charts are a different palette

Categorical series colours are neither status nor exception and need their own method (distinguishable in colour-vision deficiency, legible in both themes, ordered). Never borrow status foregrounds: a red line reads as "error" whatever it measures. The one overlap: series that *are* a family's members, such as record types, take that family's hues, since they answer the same question.
