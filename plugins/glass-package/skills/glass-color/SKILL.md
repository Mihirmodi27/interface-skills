---
name: glass-color
description: The exact colour system from modimihir.com — the Glass package, to copy as-is. Near-monochrome colour: a grey ramp indexed by intent (background, hover, border, fill, text), not lightness; a translucent ramp for layers; light/dark by re-tinting the same tokens under a data attribute; accent for focus only; at most one contained chromatic exception. Use when defining colour tokens, picking a grey for a border or a hover state, introducing one colourful element into a monochrome page, re-picking an accent or a gradient for dark mode, implementing dark mode without a flash of wrong theme, choosing text colour tiers, or reviewing a palette that feels muddy, inconsistent, or accidentally colourful. For building translucent glass surfaces, gradient strokes or layered shadows, use the glass-and-depth skill.
---

# Glass Colour

> **Glass package.** This is the colour system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. For the same principles fitted to your project's own names, values and character, use `color-and-theming` from the adaptable set. When both are installed and the project's `DESIGN.md` names a preset other than `glass`, that skill leads and this one is only a worked example.

Monochrome, built on [Geist](https://vercel.com/geist)'s grayscale semantics under Apple-style translucent materials. The organising idea: **a step in the ramp encodes an intent, not a lightness.** `gray-400` is not "a bit darker than 300"; it is *the colour a border is*. Picking a colour becomes naming a role, and dark mode a re-tint of the same indices, not a second palette.

## 1. The intent-indexed ramp

| Step | Intent | Light | Dark |
|---|---|---|---|
| 100 | Raised element's surface | `#f2f2f2` | `#1a1a1a` |
| 200 | Surface, hovered | `#ebebeb` | `#212121` |
| 300 | Surface, active/pressed | `#e6e6e6` | `#282828` |
| 400 | **Border** | `#eaeaea` | `#2e2e2e` |
| 500 | Border, hovered — and decorative marks | `#c9c9c9` | `#707070` |
| 600 | Border, active | `#a8a8a8` | `#7d7d7d` |
| 700 | Solid fill (button, marker) | `#8f8f8f` | `#8f8f8f` |
| 800 | Solid fill, hovered | `#7d7d7d` | `#a0a0a0` |
| 900 | **Secondary text** | `#4d4d4d` | `#c4c4c4` |
| 1000 | **Primary text** | `#171717` | `#ededed` |

Two surfaces sit apart; a page background is not a component surface:

| Token | Intent | Light | Dark |
|---|---|---|---|
| `background-100` | Page / card surface | `#ffffff` | `#0b0b0b` |
| `background-200` | Subtle secondary surface | `#fafafa` | `#161616` |

A border at 300 is wrong because 300 means *pressed surface*, however it looks; review needs no colour picker. **400 is lighter than 300 in the light theme** (`#eaeaea` vs `#e6e6e6`) because a border sits *next to* content and must be quieter than a pressed surface, which sits *under* it. Intent wins over monotonicity.

**Steps 500–800 are borders and fills, never text** (§4).

→ Each step and its misuse: `references/intent-ramp.md`

## 2. The parallel translucent ramp

```css
--color-gray-alpha-100: #0000000d;   /*  5% */
--color-gray-alpha-200: #00000015;   /*  8% */
--color-gray-alpha-300: #0000001a;   /* 10% */
--color-gray-alpha-400: #00000014;   /*  8% */
--color-gray-alpha-500: #00000036;   /* 21% */
--color-gray-alpha-600: #0000003d;   /* 24% */
```

**Use it on any unknown background** — borders on glass, dividers, hairlines, overlays. A solid `gray-400` border on a translucent panel ignores what's behind it; `gray-alpha-400` sits *on* it, white page or photograph.

In dark mode it inverts to **white**-based:

```css
:root[data-theme="dark"] {
  --color-gray-alpha-100: #ffffff0d;
  --color-gray-alpha-400: #ffffff17;
  /* … */
}
```

A dark-mode border is lighter than its surface, so a black-based one would *disappear*. Alpha means "a little more contrast than the surface" — black in light, white in dark — so components on it adapt untouched. **Solid ramp for opaque surfaces, alpha ramp for anything layered.**

## 3. One accent for focus — and at most one deliberate exception

```css
--color-blue-700: #006bff;   /* light */
--color-blue-700: #3b82f6;   /* dark */
```

One accent, for the focus ring only: in a monochrome interface colour *is* attention, so spend it where the keyboard is. Links stay monochrome; blue ones read as unstyled defaults and dull a blue ring.

```css
:focus-visible {
  outline: 2px solid var(--color-blue-700);
  outline-offset: 2px;
  border-radius: 2px;
}
a:focus-visible { outline-offset: 3px; }
```

The offset's gap of page colour makes the ring its own object, not a border; links get 3px so ragged inline text isn't crowded. `:focus-visible`, never `:focus`, so a mouse click leaves no ring. The dark value is brighter (`#3b82f6` vs `#006bff`): a blue with 4.5:1 on white has far less on near-black. **Any accent needs re-picking per theme, not reusing.**

### The second exception, if you allow one

A monochrome system can afford at most one more colour. The site spends it on a collapsed "short version" panel atop a long case study, for a structural reason, not an aesthetic one: **the panel is an offer rather than content** ("do you want the three-line version?"). So it may announce itself, and the exception can't spread: nothing else on the site is an offer.

```css
:root {
  --sv-edge-top: #16276b;      /* navy, top of the stroke */
  --sv-edge-mid: #2f5ac4;
  --sv-edge-bottom: #6d97ea;   /* lighter blue, bottom */
  --sv-fill-top: #f4f6fc;
  --sv-fill-bottom: #eef2fa;
  --sv-accent: #2f5ac4;        /* the mark only */
}
```

Two rules keep it from becoming a palette.

**Only the mark takes the accent.** The text stays in the page's ink: a blue paragraph is a second thing to look at inside the loud element, and shared loudness means nothing.

**Dark mode lifts the whole ramp, it doesn't pinch the ends.**

```css
:root[data-theme="dark"] {
  --sv-edge-top: #24407f;   /* was #16276b */
  --sv-edge-mid: #3f6ed0;
  --sv-edge-bottom: #86adf7;
  --sv-fill-top: #171d2a;   /* tinted, not darkened */
  --sv-fill-bottom: #1b2230;
  --sv-accent: #86adf7;
}
```

A `#16276b` stop on a `#0b0b0b` page loses the stroke's darker half. Lightening only that end compresses the ramp until it stops reading as one gradient; **move every stop by roughly the same amount**, since a gradient is a relationship between stops. The fill is *tinted* to `gray-100`'s weight, not darkened, so it doesn't punch a hole in the page (the glass-tint rule, §6). The material — a 1px gradient stroke, a side-weighted glow, no wrapper — belongs to **glass-and-depth**.

## 4. Text is a five-tier ladder — and it is *not* the grey ramp

The lower three tiers are **their own tokens**, set by contrast:

| Tier | Token | Light | Dark | Job |
|---|---|---|---|---|
| Primary | `gray-1000` | 17.93:1 | 16.81:1 | Body copy, headings, active state |
| Secondary | `gray-900` | 8.45:1 | 11.28:1 | Emphasis short of primary, ancestor rows |
| Muted | `muted` `#5e5e5e` / `#a0a0a0` | 6.48:1 | 7.53:1 | Deks, supporting copy, `<em>` |
| Quiet | `quiet` `#696969` / `#878787` | 5.49:1 | 5.48:1 | Resting icons, state labels, `<cite>` |
| Faint | `faint` `#757575` / `#7a7a7a` | 4.61:1 | 4.59:1 | Dates, read times, meta |

**Why separate tokens.** A border needs 3:1, text 4.5:1, and in a light theme the mid steps are light greys on white: only 900 and 1000 read as text. Dark mode hides it: there the same indices sit far lighter. The site shipped faint text on `gray-500` at **1.66:1**, icons on `gray-600` at **2.38:1** and most body copy on `gray-800` at **4.12:1** until an audit against this skill's own checklist caught it (full table and fix: `references/intent-ramp.md`).

**Check the ordering, not just the thresholds.** Above a 4.5:1 floor the tiers crowd together; keep them strictly descending, or you'll pass WCAG and lose the hierarchy.

**Icons go on `quiet`, not a tier of their own.** They need only 3:1, but usually sit beside a label at the same colour, and two tokens kept matched is more coupling than it saves. With more mass than text at the same value (a stroked shape, no counters), an icon rests a tier *below* its label; both go to primary on hover.

**Decorative marks stay on the grey ramp.** A bullet, a 3px dot or an inactive rail marker carries no text and its structure is conveyed semantically; `bg-gray-500` keeps a list from reading as a column of dark dots.

**`<em>` maps to *muted*.** Italics are off globally (**glass-typography**), so `*em*` recedes to `muted` and `**strong**` advances to `gray-1000` + weight 500: emphasis in two directions, which bold alone can't give.

## 5. Theming: one attribute, one set of tokens

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

`data-theme` on `<html>` drives dark mode, **not** `prefers-color-scheme`, so a *toggle* can override the OS. Seed the first value from the media query if you like; don't make it the mechanism. The dark theme is one block re-tinting the same names:

```css
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-gray-100: #1a1a1a;      /* low steps become dark surfaces */
  --color-gray-1000: #ededed;     /* high steps become light text */
  --color-gray-alpha-100: #ffffff0d;
  --color-background-100: #0b0b0b;
  /* … */
}
```

Utilities read the variables, so most of the site needs **no per-component `dark:` classes**. `color-scheme` re-tints native scrollbars, form controls and the default canvas; without it, a black page gets a white scrollbar track. Dark surfaces are `#0b0b0b`, not `#000000`: still black to the eye, but shadows show and light text isn't harsh.

### No flash of wrong theme

A blocking inline script in `<head>`, before any paint:

```html
<script>
  (function () {
    try {
      document.documentElement.dataset.theme =
        localStorage.getItem("theme") === "dark" ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

Inline, as an external file is a round trip; before the stylesheet; in `try/catch`, as `localStorage` throws in some privacy modes. It duplicates the theme module on purpose, to spare dark-mode users a white flash on every load.

→ Persistence, toggle crossfade, light/dark/system trade-offs: `references/theming.md`

## 6. Some colours are runtime, not build-time

The ramps and surfaces are vocabulary, in `@theme`; the **glass tints** are plain `:root` properties:

```css
:root {
  --glass-nav-bg:    rgba(242, 242, 242, 0.72);
  --glass-panel-bg:  rgba(243, 243, 243, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
}
```

They can't be tokens. **A media query replaces them at runtime** — the `prefers-reduced-transparency` fallback swaps each for a solid tint, and a media query can't re-declare a build-time token. And **one isn't a colour**: no colour-token system accepts a `linear-gradient()`, which also puts the `--sv-*` family in `:root` (two multi-stop gradients and a four-layer `box-shadow`).

**A value that changes by *context* — theme, user preference, container — goes in `:root`; vocabulary goes in `@theme`.** A non-colour (gradient, shadow stack, filter chain) is `:root` regardless.

The nav tint is `#f2f2f2` (`gray-100`), not white: grey chrome reads as an object, not a hole in the page. Dark tints are *lighter* than the dark page, because "raised" means "more contrast against the page" and the direction flips between themes.

The reduced-transparency swap comes **after** both theme blocks, since it re-declares the same properties at equal specificity:

```css
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
}
```

Dropping the `backdrop-filter` is the other half, and both are required. Blur, saturation, elevation shadows and text contrast over glass belong to **`glass-and-depth`**.

## Assets

- `assets/color-tokens.css` — ramps, themes, glass tints and their fallback swap, focus ring; pairs with `glass-and-depth/assets/glass.css` (material classes).
- `assets/theme.ts` — persistence, toggle crossfade, no-flash head script.

## Checklist

- [ ] Every colour a token, bar the multi-layer elevation stack and illustration/SVG artwork.
- [ ] Steps used for their intent: borders at 400, surfaces at 100–300.
- [ ] **No step from 500 to 800 as text**; text is `gray-900`/`gray-1000` or muted/quiet/faint.
- [ ] Tiers computed in the **light** theme, on the worst surface the text lands on.
- [ ] Ladder strictly descending, so hierarchy survives the 4.5:1 floor.
- [ ] Icons clear 3:1 and share the ladder of the label beside them.
- [ ] Decorative marks (bullets, dots, inactive markers) on the grey ramp.
- [ ] Alpha ramp for anything layered; solid only for opaque surfaces.
- [ ] Alpha ramp white-based in dark mode.
- [ ] Accent for focus only, re-picked for dark.
- [ ] At most one chromatic exception beyond focus, for a structural reason nothing else shares.
- [ ] Inside it, only the mark is coloured; text stays in the page's ink.
- [ ] A dark-mode gradient moves **every** stop, not just the vanished one.
- [ ] `:focus-visible` with `outline-offset`, not `:focus` — bar a skip link, which must show on keyboard focus regardless of heuristics.
- [ ] Theme set by a data attribute, not `prefers-color-scheme`.
- [ ] `color-scheme` declared in both themes.
- [ ] Blocking inline head script sets the theme before first paint.
- [ ] Dark surfaces near-black, not `#000`.
- [ ] Context-dependent colours (glass tints, gradient stops) in `:root`, not `@theme`.
- [ ] Gradients, shadow stacks and other non-colours in `:root` regardless.
- [ ] Reduced-transparency swap names both theme selectors and comes last.
- [ ] Contrast checked in both themes; muted text on a subtle surface is what fails.
- [ ] Glass surfaces audited against the `glass-and-depth` checklist.
