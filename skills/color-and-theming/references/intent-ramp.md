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

500 also serves as the **faint text** tier — timestamps, dates, read times, list markers. Genuinely low-contrast, and correctly so: this is information you look up rather than read.

### 700 · 800 — solid fill

A filled element that isn't the primary action: a small marker, a filled chip.

**800 doubles as the muted text tier** — deks, secondary paragraphs, `<em>`, supporting copy. This is the workhorse of the text ladder. In light mode `#7d7d7d` on white is about 4.6:1, so it clears WCAG AA for normal text with almost nothing to spare. Do not use 800 on `gray-100` or a glass surface for small text without checking; that's the combination that fails.

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
- An icon rests at 600 in both themes.
- Muted text is 800 in both themes.

This is what makes theming free at the component level. `text-gray-800` is muted text in light and in dark, without a `dark:` variant.

## Common failures

**Using a surface step for a border.** `border-gray-200` looks fine in light mode and vanishes in dark, because 200 is a dark surface there and sits nearly flush with 100.

**Using a text step for an icon.** `text-gray-900` on a 20px icon reads as heavy as primary text and pulls focus off the label.

**Reaching for a step that isn't in the ramp.** "I need something between 500 and 600." You don't — you need to identify which intent the element actually has. If two elements genuinely need different colours for the same intent, one of them has a different intent.

**Small muted text on a subtle surface.** `text-gray-800` on `bg-gray-100`: about 4.2:1 in light mode. Fails AA. Either raise the text to 900 or put it on `background-100`.

## Adding a semantic colour

If you need success/warning/error, add them as their own tokens with their own light/dark values — don't try to squeeze them into the grey ramp. Give each one a *pair*: a text/icon value and a surface value, both re-picked per theme. And keep them out of the focus-ring colour's territory, so the ring remains distinctive.

The reference implementation has none of these, because nothing on the site reports state. That's worth checking before you add them.
