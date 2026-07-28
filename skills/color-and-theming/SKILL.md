---
name: color-and-theming
description: Build and audit colour systems for near-monochrome interfaces — a grayscale ramp where each step encodes an intent (background, hover, border, fill, text) rather than just a lightness, a parallel translucent ramp for anything layered, light/dark theming by re-tinting the same tokens under a data attribute, accent colour restricted to focus, and translucent glass materials with reduced-transparency and high-contrast fallbacks. Use when defining colour tokens, picking a grey for a border or a hover state, implementing dark mode without a flash of wrong theme, setting text colour tiers, building backdrop-blur surfaces, layering shadows, or reviewing a palette that feels muddy, inconsistent, or accidentally colourful.
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
| 500 | Border, hovered | `#c9c9c9` | `#707070` |
| 600 | Border, active — and **resting icon colour** | `#a8a8a8` | `#7d7d7d` |
| 700 | Solid fill (a filled button, a marker) | `#8f8f8f` | `#8f8f8f` |
| 800 | Solid fill, hovered — and **muted text** | `#7d7d7d` | `#a0a0a0` |
| 900 | **Secondary text** | `#4d4d4d` | `#c4c4c4` |
| 1000 | **Primary text** | `#171717` | `#ededed` |

Plus two surfaces held apart from the ramp, because a page background is not a component surface:

| Token | Intent | Light | Dark |
|---|---|---|---|
| `background-100` | Page / card surface | `#ffffff` | `#0b0b0b` |
| `background-200` | Subtle secondary surface | `#fafafa` | `#161616` |

**What this buys you.** "What grey should this border be?" has one answer: 400. Not "let me try a few." And a reviewer can spot a mistake without a colour picker — a border at 300 is wrong because 300 means *pressed surface*, regardless of how it looks.

**Note 400 is lighter than 300 in the light theme** (`#eaeaea` vs `#e6e6e6`). That's not a mistake, and it's the clearest proof the ramp isn't a lightness gradient: a border sits *next to* content and needs to be quieter than a pressed surface, which sits *under* content. Intent wins over monotonicity.

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

## 4. Text is a five-tier ladder

| Tier | Token | Job |
|---|---|---|
| Primary | `gray-1000` | Body copy, headings, active state |
| Secondary | `gray-900` | Emphasised-but-not-primary, ancestor rows |
| Muted | `gray-800` | Deks, secondary paragraphs, `<em>`, supporting copy |
| Quiet | `gray-600` | Resting icons, inactive markers |
| Faint | `gray-500` | Timestamps, dates, list markers, read times |

Two things fall out of this that are easy to miss.

**Icons rest at 600, not at a text tier.** An icon has more visual mass than text at the same colour — it's a solid or stroked shape with no counters. Resting at 600 and going to 1000 on hover gives icon and label the same perceived weight change.

**`<em>` maps to *muted*.** Because italics are switched off globally (see the **typographic-system** skill), emphasis is re-expressed on the colour axis: `*em*` recedes to 800, `**strong**` advances to 1000 + weight 500. Emphasis becomes two-directional, which a bold-only system can't do.

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

## 6. Translucent materials

Four glass surfaces, each a different blur/tint for a different job. Their tints are **runtime variables**, not `@theme` tokens, so they can be re-declared per theme *and* replaced wholesale by the reduced-transparency fallback.

```css
:root {
  --glass-nav-bg:    rgba(242, 242, 242, 0.72);
  --glass-menu-bg:   rgba(255, 255, 255, 0.72);
  --glass-panel-bg:  rgba(243, 243, 243, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
}
```

| Material | Blur | Tint | For |
|---|---|---|---|
| `glass-nav` | 20px, saturate 1.8 | 72% | Fixed chrome that content passes under |
| `glass-menu` | 16px, saturate 1.8 | 72% | A menu over a known surface |
| `glass-panel` | 24px, saturate 1.8 | **97%** | A floating menu that must stay legible over anything |
| `folder-glass` | 8px, saturate 1.4 | gradient | A frosted pocket with cards peeking behind it |

**`saturate(1.8)` is what separates good glass from a grey wash.** Blur averages colours toward grey; boosting saturation puts the life back so the material reads as *translucent* rather than *dirty*.

**`glass-panel` sits at 97% for a structural reason.** It's the one panel whose wrapper animates (a menu scaling open), and a transform on an ancestor weakens `backdrop-filter` in its subtree. So the tint carries the opacity and the blur is a bonus. When you can't have the blur, don't pretend — thicken the tint.

Always ship the `-webkit-` prefix; Safari still needs it, and Safari is where glass matters most.

### Both fallbacks are mandatory

```css
/* Last, so it wins in either theme. */
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-menu-bg: var(--color-background-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
  .glass-nav, .glass-menu, .glass-panel, .folder-glass {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .glass-nav, .glass-menu, .glass-panel, .folder-glass {
    border-color: var(--color-gray-1000);
  }
}
```

Two halves, both needed: swap the tint to a solid token *and* drop the filter. Filter alone leaves a translucent tint over content; tint alone still pays for the blur. And note the reduced-transparency block must come **after** both theme blocks, since it re-declares the same properties.

High contrast promotes the hairline to a real border — the surface is fine, but a translucent panel's *edge* has to be unambiguous.

→ Blur values, saturation, layered shadow recipes: `references/materials.md`

## 7. Elevation is a stack, not a shadow

```
inset 0 1px 0 rgba(255,255,255,0.6),      /* top-edge catch light */
0 1px 1px rgba(0,0,0,0.02),               /* contact */
0 8px 16px -4px rgba(0,0,0,0.04),         /* near ambient */
0 24px 32px -8px rgba(0,0,0,0.06)         /* far ambient */
```

Four layers modelling one light source: a 1px inset highlight where the top edge catches light, a tight contact shadow, and two ambient shadows at increasing blur and decreasing opacity. Negative spread on the ambient layers pulls them in so they read as *under* the element rather than as a halo.

The dark variant is not the same shadow — it's a different one:

```
inset 0 1px 0 rgba(255,255,255,0.10),     /* highlight weakens */
0 1px 1px rgba(0,0,0,0.3),                /* shadows get 5–10× stronger */
0 8px 16px -4px rgba(0,0,0,0.5),
0 24px 32px -8px rgba(0,0,0,0.6)
```

Shadow opacity goes from 0.02–0.06 to 0.3–0.6 — **an order of magnitude**. A 4%-black shadow on a `#0b0b0b` surface is mathematically invisible. Meanwhile the inset highlight *drops* from 0.6 to 0.10, because on a dark surface a bright top edge reads as a glowing line.

This is the one place where a `dark:` variant per component is unavoidable, since a token can't hold a whole multi-layer shadow that changes structure. Extract it to a shared constant:

```tsx
const SHADOW = "shadow-[…] dark:shadow-[…]";
```

## Assets

- `assets/color-tokens.css` — both ramps, both themes, all four materials, all fallbacks, focus ring. The complete drop-in.
- `assets/theme.ts` — persistence, the crossfade on toggle, and the no-flash head script.

## Checklist

- [ ] Every colour is a token. No hex in components (except the shadow stack).
- [ ] Each ramp step is used for its intent — borders at 400, icons at 600, faint text at 500.
- [ ] Alpha ramp on anything layered; solid ramp only on opaque surfaces.
- [ ] Alpha ramp inverts to white-based in dark mode.
- [ ] Accent used for focus only, and re-picked (not reused) for dark.
- [ ] `:focus-visible`, not `:focus`, with `outline-offset`.
- [ ] Theme driven by a data attribute, not `prefers-color-scheme`.
- [ ] `color-scheme` declared in both themes.
- [ ] Blocking inline head script sets the theme before first paint.
- [ ] Dark surfaces are near-black, not `#000`.
- [ ] Glass tints are runtime variables, not build-time tokens.
- [ ] `saturate()` on every backdrop-filter.
- [ ] `-webkit-backdrop-filter` shipped alongside.
- [ ] `prefers-reduced-transparency` swaps tint *and* drops filter, and comes last.
- [ ] `prefers-contrast: more` promotes hairlines on translucent surfaces.
- [ ] Dark shadows are ~10× stronger; dark inset highlights are ~6× weaker.
- [ ] Contrast checked in both themes — muted text on a subtle surface is the case that fails.
