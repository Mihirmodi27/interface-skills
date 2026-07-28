---
name: color-and-theming
description: Build and audit colour systems for near-monochrome interfaces — a grayscale ramp where each step encodes an intent (background, hover, border, fill, text) rather than just a lightness, a parallel translucent ramp for anything layered, light/dark theming by re-tinting the same tokens under a data attribute, and accent colour restricted to focus. Use when defining colour tokens, picking a grey for a border or a hover state, implementing dark mode without a flash of wrong theme, choosing text colour tiers, deciding between build-time tokens and runtime custom properties, or reviewing a palette that feels muddy, inconsistent, or accidentally colourful. For building translucent glass surfaces or layered shadows, use the glass-and-depth skill.
---

# Colour and Theming

A colour system for interfaces that are essentially monochrome — where every shade of grey is doing a specific job and colour appears once, deliberately.

The organising idea: **a step in the ramp encodes an intent, not a lightness.** `gray-400` is not "a bit darker than 300," it is *the colour a border is*. Once the ramp is indexed by intent, picking a colour stops being a judgement call — you're not choosing a grey, you're naming a role — and dark mode becomes a re-tint of the same indices rather than a second palette.

The reference implementation is [modimihir.com](https://modimihir.com), using [Geist](https://vercel.com/geist)'s grayscale semantics with Apple-style translucent materials over the top.

## 1. The intent-indexed ramp

Eleven steps, each with a defined job:

| Step | Intent | Light | Dark |
|---|---|---|---|
| 100 | Default surface for a raised element | `#f2f2f2` | `#1a1a1a` |
| 200 | That surface, hovered | `#ebebeb` | `#212121` |
| 300 | That surface, active/pressed | `#e6e6e6` | `#282828` |
| 400 | **Border** | `#eaeaea` | `#2e2e2e` |
| 500 | Border, hovered — and decorative marks | `#c9c9c9` | `#707070` |
| 600 | Border, active | `#a8a8a8` | `#7d7d7d` |
| 700 | Solid fill (a filled button, a marker) | `#8f8f8f` | `#8f8f8f` |
| 800 | Solid fill, hovered | `#7d7d7d` | `#a0a0a0` |
| 900 | **Secondary text** | `#4d4d4d` | `#c4c4c4` |
| 1000 | **Primary text** | `#171717` | `#ededed` |

Plus two surfaces held apart from the ramp, because a page background is not a component surface:

| Token | Intent | Light | Dark |
|---|---|---|---|
| `background-100` | Page / card surface | `#ffffff` | `#0b0b0b` |
| `background-200` | Subtle secondary surface | `#fafafa` | `#161616` |

**What this buys you.** "What grey should this border be?" has one answer: 400. Not "let me try a few." And a reviewer can spot a mistake without a colour picker — a border at 300 is wrong because 300 means *pressed surface*, regardless of how it looks.

**Note 400 is lighter than 300 in the light theme** (`#eaeaea` vs `#e6e6e6`). That's not a mistake, and it's the clearest proof the ramp isn't a lightness gradient: a border sits *next to* content and needs to be quieter than a pressed surface, which sits *under* content. Intent wins over monotonicity.

**Steps 500–800 are borders and fills, not text.** A border needs 3:1 against its surface; text needs 4.5:1. On a light theme those mid steps are light greys on white — 500 is 1.66:1, 800 is 4.12:1 — so every one of them fails as text. Only 900 and 1000 are readable. Dark mode hides this entirely, because the same indices sit far lighter against a near-black page. See §4.

→ Every step, what breaks when you misuse it: `references/intent-ramp.md`

## 2. The parallel translucent ramp

A second ramp, same indices, alpha instead of solid:

```css
--color-gray-alpha-100: #0000000d;   /*  5% */
--color-gray-alpha-200: #00000015;   /*  8% */
--color-gray-alpha-300: #0000001a;   /* 10% */
--color-gray-alpha-400: #00000014;   /*  8% */
--color-gray-alpha-500: #00000036;   /* 21% */
--color-gray-alpha-600: #0000003d;   /* 24% */
```

**Use the alpha ramp for anything that sits on an unknown background** — borders on glass, dividers, hairlines, overlays. A solid `gray-400` border on a translucent panel is visibly wrong because it doesn't participate in what's behind it; `gray-alpha-400` sits *on* whatever's there and stays correct over both a white page and a photograph.

In dark mode the alpha ramp inverts to **white**-based, not black:

```css
:root[data-theme="dark"] {
  --color-gray-alpha-100: #ffffff0d;
  --color-gray-alpha-400: #ffffff17;
  /* … */
}
```

This is the crux. A dark-mode border is lighter than its surface, so a black overlay would make it *disappear*. Alpha semantics are "a little more contrast than the surface," which means black in light mode and white in dark mode. Every component using the alpha ramp adapts with zero per-component changes.

Rule of thumb: **solid ramp for opaque surfaces, alpha ramp for anything layered.**

## 3. One accent, and it isn't for links

```css
--color-blue-700: #006bff;   /* light */
--color-blue-700: #3b82f6;   /* dark — brightened for contrast on dark */
```

One accent colour, used for the focus ring and essentially nothing else. Links stay monochrome.

The reasoning: in a monochrome interface, colour *is* attention. Spend it on the one thing that must be unmissable — where the keyboard is. Blue links in a grey system read as unstyled defaults; blue links plus a blue focus ring means the ring no longer stands out at all.

```css
:focus-visible {
  outline: 2px solid var(--color-blue-700);
  outline-offset: 2px;
  border-radius: 2px;
}
a:focus-visible { outline-offset: 3px; }
```

`outline-offset` puts a gap of page colour between element and ring, so the ring reads as a distinct object rather than a border. Links get 3px because inline text has ragged edges the ring shouldn't crowd.

`:focus-visible`, never `:focus` — a mouse click on a button should not leave a ring behind.

The dark-mode value is brightened (`#3b82f6` vs `#006bff`) because the same blue that has 4.5:1 against white has far less against near-black. **Any accent needs re-picking per theme, not reusing.**

## 4. Text is a five-tier ladder — and it is *not* the grey ramp

The two upper tiers come from the ramp. The lower three are **their own tokens**, picked for contrast:

| Tier | Token | Light | Dark | Job |
|---|---|---|---|---|
| Primary | `gray-1000` | 17.93:1 | 16.81:1 | Body copy, headings, active state |
| Secondary | `gray-900` | 8.45:1 | 11.28:1 | Emphasised-but-not-primary, ancestor rows |
| Muted | `muted` `#5e5e5e` / `#a0a0a0` | 6.48:1 | 7.53:1 | Deks, supporting copy, `<em>` |
| Quiet | `quiet` `#696969` / `#878787` | 5.49:1 | 5.48:1 | Resting icons, state labels, `<cite>` |
| Faint | `faint` `#757575` / `#7a7a7a` | 4.61:1 | 4.59:1 | Dates, read times, meta |

**Why they're separate tokens.** A border needs 3:1 against its surface; text needs 4.5:1. Reuse a border step for text and it fails — quietly, and only in the light theme. The reference implementation did exactly this (faint text on `gray-500` at **1.66:1**, icons on `gray-600` at **2.38:1**, most body copy on `gray-800` at **4.12:1**) and it took auditing against this skill's own checklist to catch it. See `references/intent-ramp.md` for the full table and the fix.

Three things that are easy to miss:

**Check the ordering, not just the thresholds.** Once every tier must clear 4.5:1 they crowd together and the hierarchy collapses. The ladder has to stay strictly descending — verify that, or you'll pass WCAG and lose the design.

**Icons go on `quiet`, not on a tier of their own.** They only need 3:1, but they usually sit beside a label at the same colour, and two tokens that must stay visually matched is more coupling than it saves. An icon does have more visual mass than text at the same value — it's a stroked shape with no counters — so it rests a tier *below* the label it accompanies and both go to primary on hover.

**Decorative marks stay on the grey ramp.** A list bullet, a 3px dot, an inactive rail marker: no text, and the structure is conveyed semantically. `bg-gray-500` is right for them, and keeping them faint is what stops a bulleted list reading as a column of dark dots.

**`<em>` maps to *muted*.** Because italics are switched off globally (see the **typographic-system** skill), emphasis is re-expressed on the colour axis: `*em*` recedes to `muted`, `**strong**` advances to `gray-1000` + weight 500. Emphasis becomes two-directional, which a bold-only system can't do.

## 5. Theming: one attribute, one set of tokens

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Dark mode is driven by `data-theme` on `<html>`, **not** by `prefers-color-scheme`. The reason is that a theme *toggle* needs to override the OS — and once a user has expressed a preference, the OS shouldn't win. (Seed the initial value from `prefers-color-scheme` if you like; just don't let the media query be the mechanism.)

The dark theme is then one block that re-tints the same token names:

```css
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-gray-100: #1a1a1a;      /* low steps become dark surfaces */
  --color-gray-1000: #ededed;     /* high steps become light text */
  --color-gray-alpha-100: #ffffff0d;  /* alpha inverts to white-based */
  --color-background-100: #0b0b0b;
  /* … */
}
```

Because every utility references the variables, most of the site adapts with **no per-component `dark:` classes at all**. Semantics hold across themes: low steps are surfaces, high steps are text.

`color-scheme` is not decoration — it re-tints native scrollbars, form controls, and the default canvas. Without it you get a white scrollbar track on a black page.

Dark surfaces are `#0b0b0b`, not `#000000`. Pure black gives shadows nothing to sit on (a shadow on black is invisible) and produces harsh contrast with light text. `#0b0b0b` reads as black while leaving room for elevation.

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

It must be inline (an external file is a round trip), it must be before the stylesheet, and it must be wrapped in `try/catch` because `localStorage` throws in some privacy modes. This duplicates a few lines of the theme module on purpose — the alternative is a visible flash of white on every load for dark-mode users.

→ Persistence, the crossfade on toggle, three-state (light/dark/system) trade-offs: `references/theming.md`

## 6. Some colours are runtime, not build-time

The two ramps and the surfaces belong in `@theme` — they're the vocabulary. But the **glass tints** are declared as plain `:root` custom properties instead:

```css
:root {
  --glass-nav-bg:    rgba(242, 242, 242, 0.72);
  --glass-panel-bg:  rgba(243, 243, 243, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
}
```

Two reasons they can't be tokens:

1. **A media query has to replace them at runtime.** The `prefers-reduced-transparency` fallback swaps every glass tint for a solid one. A build-time token can't be re-declared by a media query.
2. **One of them isn't a colour.** No colour-token system accepts a `linear-gradient()`.

The principle worth carrying: **a value that changes by *context* — theme, user preference, container — belongs in `:root`. A value that's part of the design vocabulary belongs in `@theme`.**

Two colour-side notes on these tints. The nav tint is `#f2f2f2` (matching `gray-100`), not white — chrome that's slightly grey reads as an object on the page rather than a hole in it. And the dark tints are *lighter* than the dark page background, because "raised" means "more contrast against the page" and the direction flips between themes.

The reduced-transparency block must come **after** both theme blocks, since it re-declares the same properties at the same specificity:

```css
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
}
```

That's only half the fallback — dropping the `backdrop-filter` is the other half, and both are required. **For the materials themselves, the blur and saturation values, elevation shadows, and text-contrast-over-glass, use the `glass-and-depth` skill.** This skill owns the tints; that one owns the surfaces built from them.

## Assets

- `assets/color-tokens.css` — both ramps, both themes, the glass tints and their fallback swap, focus ring. Pairs with `glass-and-depth/assets/glass.css`, which holds the material classes.
- `assets/theme.ts` — persistence, the crossfade on toggle, and the no-flash head script.

## Checklist

- [ ] Every colour is a token. Two allowed exceptions: the multi-layer elevation stack, and literal colours inside illustration/SVG artwork.
- [ ] Each ramp step is used for its intent — borders at 400, surfaces at 100–300.
- [ ] **No ramp step between 500 and 800 is used as a text colour.** Text uses `gray-900`/`gray-1000` or the muted/quiet/faint tokens.
- [ ] Text tiers computed, not assumed — in the **light** theme, against the worst surface the text lands on.
- [ ] Text ladder is strictly descending in contrast, so hierarchy survives the 4.5:1 floor.
- [ ] Icons clear 3:1; icons that sit beside a label share its tier ladder.
- [ ] Decorative marks (bullets, dots, inactive markers) stay on the grey ramp.
- [ ] Alpha ramp on anything layered; solid ramp only on opaque surfaces.
- [ ] Alpha ramp inverts to white-based in dark mode.
- [ ] Accent used for focus only, and re-picked (not reused) for dark.
- [ ] `:focus-visible`, not `:focus`, with `outline-offset` — a skip link is the one legitimate `:focus` (it must appear for keyboard focus regardless of heuristics).
- [ ] Theme driven by a data attribute, not `prefers-color-scheme`.
- [ ] `color-scheme` declared in both themes.
- [ ] Blocking inline head script sets the theme before first paint.
- [ ] Dark surfaces are near-black, not `#000`.
- [ ] Context-dependent colours (glass tints) are runtime `:root` variables, not `@theme` tokens.
- [ ] The reduced-transparency tint swap names both theme selectors and comes last.
- [ ] Contrast checked in both themes — muted text on a subtle surface is the case that fails.
- [ ] Glass surfaces audited against the `glass-and-depth` checklist.
