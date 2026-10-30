# The intent-indexed ramp

## The idea, stated precisely

A conventional grayscale palette is indexed by **lightness** (100 lightest, 900 darkest), and picking one is a judgement call. An intent-indexed ramp is indexed by **job**, and picking one is a lookup. So:

1. **Choosing a colour stops being a design decision.** "What grey for this border?" → 400. No deliberation, no drift.
2. **Mistakes become reviewable without a colour picker.** A border at 300 is wrong because 300 means *pressed surface*; you catch it reading the diff.
3. **Dark mode becomes a re-tint, not a second palette.** The indices keep their meanings, only the values change, and components need no per-theme branching.

## The steps

### 100 · 200 · 300 — surface and its states

A raised element's background, hover and pressed state: three states, one step apart, so the progression stays even.

- **100** is also a general subtle surface — an image wall's backdrop, a cover placeholder, a hover bar in a list.
- **200** also fills a small static thing that should read as an inert placeholder (faux body lines in a preview card).
- **300** also fills a small structural mark, such as a preview card's title bar.

### 400 — border

The default border, one of the two most-used steps.

**In light mode, 400 (`#eaeaea`) is lighter than 300 (`#e6e6e6`).** A border sits *beside* content and must not compete with it; a pressed surface sits *under* it and can be darker. The two are never adjacent in practice, so nothing looks wrong.

On anything translucent, use `gray-alpha-400` instead (§2 of the skill).

### 500 · 600 — border states (and where icons used to go)

500 is a hovered border, 600 an active one.

**600 used to be the resting colour of an icon, and that was a bug.** The reasoning was sound — an icon has more visual mass than text at the same colour, a stroked shape with no counters to lighten it, so it should rest a tier below the label beside it and `hover:text-gray-1000` gives both the same perceived jump. But 600 is 2.38:1 on white in the light theme, under even the 3:1 non-text floor (table below). Icons now rest on `quiet`, keeping the one-tier-below relationship on a token picked for contrast; see §4 of the skill.

500 was where the reference implementation put its **faint text** tier — timestamps, dates, read times. **That was a bug, and auditing it surfaced the rule below.** `#c9c9c9` on white is 1.66:1: not "low contrast for information you look up" but illegible, below even the 3:1 non-text floor. Text tiers are now separate tokens (below).

500 keeps its border-hover intent and its use as the fill for *decorative* marks (list bullets, a 3px dot, an inactive rail marker), which carry no text and whose structure is conveyed semantically.

### 700 · 800 — solid fill

A filled element that isn't the primary action: a small marker, a filled chip.

The reference implementation also used **800 as its muted text tier** — deks, secondary paragraphs, `<em>`, supporting copy. `#7d7d7d` on white is **4.12:1**, which **fails** WCAG AA for normal text (4.5:1). It was the site's most-used text colour, and it failed everywhere in the light theme.

(An earlier version of this file put it at "about 4.6:1, clears AA with almost nothing to spare." Computed, it's 4.12:1. Don't take a ratio on trust; the arithmetic is ten lines.)

### 900 — secondary text

Emphasised but not primary: a role title above its description, an ancestor row in a table of contents (the section you're inside while a child row is active), body copy where primary would be too heavy.

The gap between 900 (`#4d4d4d`) and 1000 (`#171717`) is deliberately large: secondary should be clearly a step down, not almost-primary.

### 1000 — primary text

Body copy, headings, active states, `<strong>`. `#171717`, not `#000000`: pure black on white is harsh at small sizes and halates slightly on LCDs, while near-black reads as black and is kinder at length.

Also the *fill* for an inverted element: a tooltip is `bg-gray-1000` with `text-background-100`.

**Not for a ticked box in a long list.** A column of inverted ink squares shouts down the list. A ticked box is a `gray-100` square on its 400 border with a `gray-1000` tick: the tick's shape carries the state, so the fill doesn't have to. A switch keeps the inverted fill, having no tick to carry it.

### background-100 · background-200

Held out of the ramp because a page background is categorically different from a component surface. 100 is the page and card surface; 200 a subtle secondary surface.

`background-100` is also the **text** colour for anything inverted, which is why it's a token rather than a hardcoded white: a tooltip's text has to become near-black in the dark theme, and does so for free.

## Dark-mode re-tinting

```css
:root[data-theme="dark"] {
  --color-gray-100: #1a1a1a;   /* 100–400: dark surfaces, rising slowly */
  --color-gray-200: #212121;
  --color-gray-300: #282828;
  --color-gray-400: #2e2e2e;
  --color-gray-500: #707070;   /* 500–800: the mid greys jump */
  --color-gray-600: #7d7d7d;
  --color-gray-700: #8f8f8f;
  --color-gray-800: #a0a0a0;
  --color-gray-900: #c4c4c4;   /* 900–1000: light text */
  --color-gray-1000: #ededed;
}
```

**It's not an inversion.** Inverting the light ramp would put 100 at `#0d0d0d` and 1000 at `#e8e8e8`, evenly spaced. The real dark ramp is *compressed at the bottom* (100→400 spans only `#1a1a1a`→`#2e2e2e`, twenty units) and *expanded in the middle* (400→500 jumps forty units), because dark surfaces must stay distinguishable at very low lightness, where the eye is more sensitive to small differences, while mid-greys need a big jump to separate "border" from "text."

**700 is identical in both themes** (`#8f8f8f`): a mid-grey solid fill needs the same value either way, the one step where semantic and value coincide.

**The step order stays monotonic in dark mode** (400 `#2e2e2e` > 300 `#282828`). No contradiction: the constraint is the *intent*, and in dark mode a slightly lighter border also happens to be the right lightness order.

## Semantics that hold across themes

Low steps are surfaces and high steps are text, always; "border" means 400 and "surface" means 100–300 in both themes. That is what makes theming free per component: `border-gray-400` is a border in light and dark, with no `dark:` variant.

## Borders and text are different jobs

The hardest-won rule here, from auditing the reference implementation against this skill's own checklist. **A border needs 3:1 against its surface. Text needs 4.5:1.** One step can't serve both, and in a *light* theme the gap is brutal, because the mid steps are light greys on white:

| Step | Light value | As text on white | Verdict |
|---|---|---|---|
| 500 | `#c9c9c9` | 1.66:1 | illegible |
| 600 | `#a8a8a8` | 2.38:1 | fails even the 3:1 non-text floor |
| 700 | `#8f8f8f` | 3.23:1 | fails |
| 800 | `#7d7d7d` | 4.12:1 | fails |
| 900 | `#4d4d4d` | 8.45:1 | passes |
| 1000 | `#171717` | 17.93:1 | passes |

**Dark mode hides this completely.** Against a near-black page the same indices sit far lighter — 800 is 7.53:1, 700 is 6.09:1, all comfortably passing. A system developed and reviewed in dark mode ships a light theme where most body copy fails AA, and nothing looks obviously wrong.

### The fix: text tiers as their own tokens

```css
:root {
  --color-muted: #5e5e5e;   /* 6.48:1 — deks, supporting copy, <em> */
  --color-quiet: #696969;   /* 5.49:1 — resting icons, state labels, <cite> */
  --color-faint: #757575;   /* 4.61:1 — dates, read times, meta */
}
:root[data-theme="dark"] {
  --color-muted: #a0a0a0;   /* 7.53:1 */
  --color-quiet: #878787;   /* 5.48:1 */
  --color-faint: #7a7a7a;   /* 4.59:1 */
}
```

**Every tier clears 4.5:1 in both themes**, including the worst real pairing: muted on `gray-100`, a subtle surface, at 5.79:1.

**The ladder stays strictly descending** — 17.93 / 8.45 / 6.48 / 5.49 / 4.61 in light, 16.81 / 11.28 / 7.53 / 5.48 / 4.59 in dark. Once every tier must clear 4.5:1 they crowd together, so check the ordering, not just the thresholds.

**Only `faint` moved much in dark mode.** `muted` keeps the old 800 value, which already passed there: the failure was overwhelmingly a light-theme one.

## Common failures

**A surface step as a border.** `border-gray-200` looks fine in light mode and vanishes in dark, where 200 is a dark surface nearly flush with 100.

**A text step as an icon.** `text-gray-900` on a 20px icon reads as heavy as primary text and pulls focus off the label. Use `quiet`.

**A border step as text.** The one this skill got wrong for a whole revision (above).

**A step that isn't in the ramp.** "I need something between 500 and 600." You don't; you need the element's intent. If two elements need different colours for the same intent, one of them has a different intent.

**Auditing contrast in dark mode only.** The dark theme flatters every mid step. Compute the light theme, against the *worst* surface the text lands on — a subtle `gray-100`, not `background-100`.

## Adding a semantic colour

Success/warning/error get their own tokens with their own light/dark values, not a squeeze into the grey ramp. Give each a *pair* — a text/icon value and a surface value, both re-picked per theme — and keep them out of the focus ring's territory so the ring stays distinctive.

The reference implementation has none, because nothing on the site reports state. Check that before you add them. If you do:

**Shape carries the state; colour confirms it.** A status glyph that fills as work moves (an empty ring, a half, a filled check, a cross) reads in greyscale and to a colour-blind reader; the hue only agrees with it. Colour as the sole signal fails WCAG 1.4.1 the way a colour-only active row does.

**Red means loss, and nothing else.** A live or recording state is not danger. Give it shape and motion (a ring, a meter that moves while it listens) and keep red to a small live dot; a red-filled "recording" control borrows the destructive colour and makes every glance at it an alarm.

**Destructive actions take a red ground, not red decoration.** In a menu: the danger *surface* value as the row's ground at rest, solid danger with `background-100` text when highlighted, no icon, set apart at the end. Every destructive or session-ending item — delete, clear, sign out — takes that one treatment, so the reader learns it once.

**Small marks need 3:1 against every ground they land on**: page, panel and hover state, in each theme. A mark picked once for both themes, or checked only against the page, is the one that fails on the hover row.

## Spending your one chromatic exception

Harder than semantic colour: not "does this state need a colour?" but "may this *element* be colourful?" The reference implementation says yes once, to a collapsed summary panel, which passed this test:

**Is this element content, or an offer?** Content is what the reader came for, and should look like the rest of it. An offer — "do you want the short version?", "shall I explain this?" — is the interface speaking about the content rather than being it: a category the eye is entitled to find quickly, and one most pages have exactly one of.

The two containment rules (only the mark takes the accent; re-pick every stop for dark) are in §3 of the skill.

And the honest check before spending it: **can the element do its job with weight, position and air instead?** Most can. The one that can't is usually the one that must be found before the reader has started reading — a small set.
