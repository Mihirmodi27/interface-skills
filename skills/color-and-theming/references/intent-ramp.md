# The intent-indexed ramp

## The idea, stated precisely

A conventional grayscale palette is indexed by **lightness**: 100 is lightest, 900 is darkest, and picking one is a judgement call. An intent-indexed ramp is indexed by **job**: each step is the answer to a specific question, and picking one is a lookup.

This changes three things:

1. **Choosing a colour stops being a design decision.** "What grey for this border?" → 400. There is no deliberation and no drift.
2. **Mistakes become reviewable without a colour picker.** A border at 300 is wrong because 300 means *pressed surface* — you can catch it reading the diff.
3. **Dark mode becomes a re-tint, not a second palette.** The indices keep their meanings; only the values change. Components need no per-theme branching.

## The steps

### 100 · 200 · 300 — surface and its states

A raised element's default background, its hover, and its pressed state. Three steps because interactive surfaces need three states, and using the same 1-step delta for each keeps the progression even.

- **100** also serves as a general subtle surface — an image wall's backdrop, a cover placeholder, a hover bar in a list on the page.
- **200** is a hover, but it's *also* the fill for a small static thing that needs to read as an inert placeholder (faux body lines in a preview card).
- **300** is a pressed surface. It's also the correct fill for a small structural mark like a preview card's title bar.

### 400 — border

The default border colour, and one of the two most-used steps in the whole ramp.

**In light mode, 400 (`#eaeaea`) is lighter than 300 (`#e6e6e6`).** This is the clearest evidence the ramp isn't a lightness gradient. A border sits *beside* content and must not compete with it; a pressed surface sits *under* content and can be darker. Intent beats monotonicity — and the two are never adjacent in practice, so nothing looks wrong.

For borders on anything translucent, use `gray-alpha-400` instead. See §2 of the skill.

### 500 · 600 — border states, and icons

500 is a hovered border, 600 an active one.

**600 has a second, more important job: the resting colour of an icon.** This surprises people — 600 is a mid-grey, and text never uses it. But an icon has more visual mass than text at the same colour: it's a solid or stroked shape with no counters to lighten it. At 900 an icon looks nearly as dark as primary text; at 600 it sits at the same *perceived* weight as the muted label beside it. Then `hover:text-gray-1000` gives icon and label the same perceived jump.

500 is *also* where the reference implementation put its **faint text** tier — timestamps, dates, read times. **That was a bug, and auditing it is what surfaced the rule below.** `#c9c9c9` on white is 1.66:1. Not "low contrast for information you look up" — illegible, and below even the 3:1 non-text floor. Text tiers are now separate tokens; see §"Borders and text are different jobs".

500 keeps its border-hover intent, and its use as the fill for *decorative* marks (list bullets, a 3px dot, an inactive rail marker) — those carry no text and the structure is conveyed semantically.

### 700 · 800 — solid fill

A filled element that isn't the primary action: a small marker, a filled chip.

The reference implementation also used **800 as its muted text tier** — deks, secondary paragraphs, `<em>`, supporting copy. `#7d7d7d` on white is **4.12:1**, which **fails** WCAG AA for normal text (4.5:1). It was the most widely-used text colour on the site, and it failed everywhere in the light theme.

(An earlier version of this file put that figure at "about 4.6:1, clears AA with almost nothing to spare." That was wrong — computed, it's 4.12:1. Don't take a ratio on trust; the arithmetic is ten lines.)

### 900 — secondary text

Emphasised but not primary. A role title above its description. An ancestor row in a table of contents (the section you're inside, when a child row is active). Body copy in a context where primary would be too heavy.

The gap between 900 (`#4d4d4d`) and 1000 (`#171717`) is large. That's deliberate — secondary should be clearly a step down, not almost-primary.

### 1000 — primary text

Body copy, headings, active states, `<strong>`. `#171717`, not `#000000`: pure black on white is harsh at small sizes and produces a slight halation on LCDs. Near-black reads as black while being kinder to read at length.

Also used as the *fill* for an inverted element — a tooltip is `bg-gray-1000` with `text-background-100`.

### background-100 · background-200

Held out of the ramp because a page background is categorically different from a component surface. 100 is the page and card surface; 200 is a subtle secondary surface.

`background-100` is also the **text** colour for anything inverted, which is why it's a token rather than a hardcoded white — a tooltip's text has to become near-black in the dark theme, and it does that for free.

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

Three properties of the dark ramp worth noticing.

**It's not an inversion.** Inverting the light ramp would put 100 at `#0d0d0d` and 1000 at `#e8e8e8` with an even distribution. The actual dark ramp is *compressed at the bottom* (100→400 spans only `#1a1a1a`→`#2e2e2e`, twenty units) and *expanded in the middle* (400→500 jumps forty units). Because dark surfaces need to be distinguishable from each other at very low lightness, where the eye is more sensitive to small differences — while mid-greys need a big jump to separate "border" from "text."

**700 is identical in both themes** (`#8f8f8f`). A mid-grey solid fill needs the same value either way; it's the one step where the semantic and the value coincide.

**The step order stays monotonic in dark mode** (400 `#2e2e2e` > 300 `#282828`), unlike light mode. Not a contradiction — the constraint is the *intent*, and in dark mode a slightly lighter border happens to also be the right lightness ordering.

## Semantics that hold across themes

- Low steps are surfaces, high steps are text. Always.
- The word "border" means 400 in both themes.
- The word "surface" means 100–300 in both themes.

This is what makes theming free at the component level: `border-gray-400` is a border in light and in dark, without a `dark:` variant.

## Borders and text are different jobs

The hardest-won rule here, and it came from auditing the reference implementation against this skill's own checklist.

**A border needs 3:1 against its surface. Text needs 4.5:1.** Those are different requirements, so a single ramp step cannot serve both — and in a *light* theme the gap is brutal, because the mid steps are light greys sitting on white:

| Step | Light value | As text on white | Verdict |
|---|---|---|---|
| 500 | `#c9c9c9` | 1.66:1 | illegible |
| 600 | `#a8a8a8` | 2.38:1 | fails even the 3:1 non-text floor |
| 700 | `#8f8f8f` | 3.23:1 | fails |
| 800 | `#7d7d7d` | 4.12:1 | fails |
| 900 | `#4d4d4d` | 8.45:1 | passes |
| 1000 | `#171717` | 17.93:1 | passes |

Only 900 and 1000 are usable as text. Everything from 500 to 800 is a border value.

**Dark mode hides this completely.** The same indices in the dark ramp sit far lighter *relative to a near-black page*, so 800 is 7.53:1 and 700 is 6.09:1 — all comfortably passing. A system developed and reviewed in dark mode will ship a light theme where most of the body copy fails AA, and nothing will look obviously wrong.

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

Three properties to hold onto:

**Every tier clears 4.5:1 in both themes**, including the worst real pairing (muted on `gray-100`, a subtle surface, at 5.79:1).

**The ladder stays strictly descending** — 17.93 / 8.45 / 6.48 / 5.49 / 4.61 in light, 16.81 / 11.28 / 7.53 / 5.48 / 4.59 in dark. This is the part that's easy to lose: once every tier must clear 4.5:1, they crowd together and the hierarchy collapses. Check the ordering, not just the thresholds.

**Only `faint` moved much in dark mode.** `muted` keeps the old 800 value, which already passed. The failure was overwhelmingly a light-theme failure.

Icons go on `quiet` rather than a dedicated tier. They only need 3:1, but they frequently sit beside a text label at the same colour, and splitting them would mean two tokens that must stay visually matched — more coupling than it saves.

**Decorative marks stay on the gray ramp.** A list bullet, a 3px dot, an inactive rail marker: these carry no text, and the structure they hint at is conveyed semantically. `bg-gray-500` is correct for them, and keeping them quiet is what stops a bulleted list reading as a column of dark dots.

## Common failures

**Using a surface step for a border.** `border-gray-200` looks fine in light mode and vanishes in dark, because 200 is a dark surface there and sits nearly flush with 100.

**Using a text step for an icon.** `text-gray-900` on a 20px icon reads as heavy as primary text and pulls focus off the label. Use the `quiet` tier.

**Using a border step for text.** The one this skill got wrong for a whole revision. See the section above — 500 through 800 are borders, and only 900/1000 are readable text on a light surface.

**Reaching for a step that isn't in the ramp.** "I need something between 500 and 600." You don't — you need to identify which intent the element actually has. If two elements genuinely need different colours for the same intent, one of them has a different intent.

**Auditing contrast in dark mode only.** The dark theme flatters every mid step. Compute the light theme, and compute it against the *worst* surface the text actually lands on — a subtle `gray-100`, not `background-100`.

## Adding a semantic colour

If you need success/warning/error, add them as their own tokens with their own light/dark values — don't try to squeeze them into the grey ramp. Give each one a *pair*: a text/icon value and a surface value, both re-picked per theme. And keep them out of the focus-ring colour's territory, so the ring remains distinctive.

The reference implementation has none of these, because nothing on the site reports state. That's worth checking before you add them.

## Spending your one chromatic exception

Separate question from semantic colour, and a harder one: not "does this state need a colour?" but "may this *element* be colourful?"

The reference implementation says yes exactly once, to a collapsed summary panel, and the test it had to pass is worth stating as a test:

**Is this element content, or is it an offer?** Content is what the reader came for and it should look like everything else they came for. An offer — "do you want the short version?", "shall I explain this?" — is the interface speaking about the content rather than being it. That's a category the eye is entitled to find quickly, and it's a category most pages have exactly one of.

Two containment rules, because an exception that isn't contained becomes a palette:

**Only the mark takes the accent.** Inside the coloured element, the text stays in the page's ink. A blue paragraph inside the panel would be a second thing to look at *within* the loud element, and the loudness stops meaning anything as soon as it's shared.

**Re-pick every stop for dark, not just the one that vanished.** A near-black top stop on a near-black page disappears down its darker half. Lightening only that end compresses the ramp and it stops reading as one gradient — move the whole thing, the way you'd re-pick an accent rather than brightening it.

And the honest check before you spend it at all: **can the element do its job with weight, position and air instead?** Most can. The one that can't is usually the one that has to be found before the reader has started reading — which is a small set.

