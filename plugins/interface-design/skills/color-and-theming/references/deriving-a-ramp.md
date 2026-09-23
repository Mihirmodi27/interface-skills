# Deriving a ramp

From a preset and a brand hue (or none) to every role, per theme, every ratio measured. Dials change the inputs, not the method.

## Work in OKLCH

Pick values in `oklch(L C h)`, not hex or HSL: lightness is perceptual, so greys 0.02 apart look equally different anywhere on the ramp, and hue holds as lightness changes — a teal stays teal as it darkens, where HSL drifts. Browsers and `contrast.mjs` take `oklch()`. Where the stack needs hex (some design tools, email, older build tooling), keep the OKLCH source in a comment beside it, so a value can move without re-deriving the rest.

## The three inputs

1. **The neutral hue and chroma.** No hue and chroma 0 for pure greys; otherwise the brand hue at the preset's neutral chroma.
2. **The worst surface for each tier.** List the surfaces each text tier really lands on — tertiary text in a table meets hover and selected rows; an article caption, the page and a subtle band — and solve against the worst.
3. **The text targets.** One ratio per tier, from the table, adjusted so adjacent tiers keep the preset's minimum step.

| Preset | Tiers, top to bottom (target ratio on the worst surface) | Minimum step |
|---|---|---|
| `editorial` | 15 · 8 · 6.5 · 5.5 · 4.6 | 1.15× |
| `product` | 15 · 7.5 · 4.8 | 1.4× |
| `expressive` | 15 · 8 · 6 · 4.6 | 1.25× |

Drop unused middle tiers; never the floor.

## Solving a tier's lightness

For a surface of relative luminance `Yₛ` and a target ratio `R`, the text's luminance `Y` is:

```
text darker than the surface  (light theme):  Y = (Yₛ + 0.05) / R − 0.05
text lighter than the surface (dark theme):   Y = R × (Yₛ + 0.05) − 0.05
```

For a near-neutral colour, OKLCH lightness is very nearly the cube root of luminance, so `L ≈ ∛Y` and `Yₛ ≈ Lₛ³` — a one-line starting value; verify it, nudging by 0.005 until the check passes:

```sh
node <design-system-setup>/scripts/contrast.mjs --ladder "oklch(0.955 0.008 195)" \
  "oklch(0.22 0.008 195)" "oklch(0.41 0.008 195)" "oklch(0.52 0.008 195)"
```

Worked: a tertiary target of 4.8 on a light hover row at `L 0.955` (`Yₛ ≈ 0.871`) gives `Y = 0.921 / 4.8 − 0.05 = 0.142`, so `L ≈ 0.52`. On a dark hover row at `L 0.24` (`Yₛ ≈ 0.014`), `Y = 4.8 × 0.064 − 0.05 = 0.256`, so `L ≈ 0.635`.

For accents and status foregrounds `∛Y` is only a first guess: at high chroma luminance drifts from lightness, most in blues and violets (`oklch(0.55 0.25 290)` matches a grey near L 0.52). Let the script decide.

## Spacing surfaces and lines

Space surfaces by contrast against the page, not equal lightness steps, so the ratios read as the same steps in both themes.

| Role | Ratio against `surface.page` | Light L (from 1.0) | Dark L (from 0.17) |
|---|---|---|---|
| `surface.raised` | 1.03–1.08 | 0.985 | 0.21 |
| `surface.subtle` | 1.05–1.08 | 0.975 | 0.20 |
| `surface.hover` | 1.12–1.16 | 0.955 | 0.24 |
| `surface.selected` | 1.12–1.22, plus accent chroma | 0.95 | 0.25 |
| `surface.pressed` | 1.2–1.27 | 0.935 | 0.27 |
| `border.default` | 1.25–1.45 | 0.90 | 0.30 |
| `border.hover` · `mark` | 1.8–2.1 | 0.80 | 0.40 |
| `border.control` (an input's edge) | ≥ 3 on every surface an input sits on | 0.62 | 0.52 |

Steps land about 0.02 apart in L in light, 0.03 in dark. Light `border.default` may sit lighter than `surface.pressed` if borders should recede further (law 1). Light `surface.raised` may be the page colour with a border; dark must be lighter than the page.

## Deriving the accent from a brand hue

The brand hue is given; derive the rest per theme.

1. **`accent` in light.** The highest in-gamut chroma at a lightness where `text.on-accent` clears 4.5:1 — with white text, usually L 0.45–0.55. If the script reports clipping, lower the chroma, not the lightness.
2. **`accent` in dark.** L roughly 0.72–0.78, chroma trimmed a little; `text.on-accent` usually flips to the dark `surface.page`. Measure it as a new colour.
3. **Its hover.** 0.05 in L away from the page — darker in light, lighter in dark: more contrast in both.
4. **`surface.selected`.** The accent hue at the `surface.selected` lightness, chroma about 0.03. Re-measure the *lowest* text tier on it: this fails most often, because a tint costs a little luminance.
5. **`focus`.** The accent, if it clears 3:1 on every surface including `surface.selected`, and on the page: `outline-offset` leaves a gap of page colour, so a ring round an accent button is seen against the page.

**When the brand colour can't be text.** Yellows, limes and light cyans have no lightness at usable chroma where white text clears 4.5:1, and fail as text on white. Keep them for fills and marks with dark `text.on-accent`, and derive a darker token for anything text-sized — `text.link`, if links are coloured. Name both for their jobs; neither is "brand-yellow".

## Mapping an existing numbered ramp

A project with `gray-50…950` or `blue-100…900` keeps its names; each step gets the role most of its usage does (border, caption, hover). Three findings are common:

- **One step doing two jobs**, usually a border grey also used for meta text; record it, since it can rarely pass both 3:1 and 4.5:1.
- **One job at several steps**, usually borders at three adjacent greys; the majority step becomes the role, the rest are strays.
- **No step that works as a text tier** between secondary and the floor; the fix is a new token picked by the method above, not a borrowed step.

## The translucent set

Starting values; measure each over the lightest and darkest surface it can sit on (`contrast.mjs` composites the alpha first):

| Role | Light | Dark |
|---|---|---|
| a layered hover wash | `oklch(0 0 0 / 0.04)` | `oklch(1 0 0 / 0.05)` |
| `border.layered` | `oklch(0 0 0 / 0.08)` | `oklch(1 0 0 / 0.1)` |
| `border.layered`, hovered | `oklch(0 0 0 / 0.14)` | `oklch(1 0 0 / 0.16)` |

Tint these toward the neutral hue if the solids are tinted; a pure-black hairline beside tinted greys reads as dirt.

## Worked example: Harbour

A fictional clinic-scheduling product: `product` preset, teal brand hue at OKLCH h 195, neutral chroma 0.008. Tertiary text sits in table rows, so the worst surface is `surface.hover`; every ratio is measured with `contrast.mjs`. Core blocks, then the full set:

```css
:root {
  color-scheme: light;
  --surface-page: oklch(1 0 0);
  --surface-hover: oklch(0.955 0.008 195);
  --border-default: oklch(0.9 0.008 195);
  --text-primary: oklch(0.22 0.008 195);
  --text-secondary: oklch(0.41 0.008 195);
  --text-tertiary: oklch(0.52 0.008 195);
  --accent: oklch(0.5 0.08 195); /* white text 5.77:1 */
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --surface-page: oklch(0.17 0.008 195);
  --surface-hover: oklch(0.24 0.008 195);
  --border-default: oklch(0.3 0.008 195);
  --text-primary: oklch(0.92 0.008 195);
  --text-secondary: oklch(0.73 0.008 195);
  --text-tertiary: oklch(0.64 0.008 195);
  --accent: oklch(0.75 0.1 195); /* re-picked; dark page text on it 8.94:1 */
}
```

| Role | Light | Dark | Measured |
|---|---|---|---|
| `surface.page` | `oklch(1 0 0)` `#ffffff` | `oklch(0.17 0.008 195)` `#0b1110` | — |
| `surface.subtle` | `oklch(0.975 0.008 195)` | `oklch(0.2 0.008 195)` | — |
| `surface.raised` | `oklch(0.985 0.008 195)` | `oklch(0.21 0.008 195)` | — |
| `surface.hover` | `oklch(0.955 0.008 195)` | `oklch(0.24 0.008 195)` | — |
| `surface.selected` | `oklch(0.95 0.03 195)` | `oklch(0.25 0.03 195)` | — |
| `surface.pressed` | `oklch(0.935 0.008 195)` | `oklch(0.27 0.008 195)` | — |
| `border.default` | `oklch(0.9 0.008 195)` | `oklch(0.3 0.008 195)` | decorative |
| `border.control` | `oklch(0.62 0.008 195)` | `oklch(0.52 0.008 195)` | 3.38 / 3.22 on the worst surface an input sits on |
| `mark` | `oklch(0.8 0.008 195)` | `oklch(0.4 0.008 195)` | decorative |
| `text.primary` | `oklch(0.22 0.008 195)` | `oklch(0.92 0.008 195)` | 15.19:1 / 12.99:1 on hover |
| `text.secondary` | `oklch(0.41 0.008 195)` | `oklch(0.73 0.008 195)` | 7.74:1 / 6.88:1 on hover |
| `text.tertiary` | `oklch(0.52 0.008 195)` | `oklch(0.64 0.008 195)` | 4.83:1 / 4.90:1 on hover |
| `accent` · `focus` | `oklch(0.5 0.08 195)` | `oklch(0.75 0.1 195)` | focus 5.07:1 (light) on hover; 5.04 / 7.42 on selected |
| `accent`, hovered | `oklch(0.45 0.075 195)` | `oklch(0.8 0.1 195)` | — |
| `text.on-accent` | `oklch(1 0 0)` | `oklch(0.17 0.008 195)` | 5.77 / 8.94 |
| `surface.inverse` | = `text.primary` | = `text.primary` | — |
| `text.inverse` | = `surface.page` | = `surface.page` | 17.27 / 15.11 |

What the measurements found:

- **The first dark `surface.selected` failed:** at `oklch(0.27 0.035 195)` tertiary text on a selected row was 4.44:1; `oklch(0.25 0.03 195)` gives 4.73:1. The page check would never have shown it.
- **`surface.pressed` fails tertiary text in dark** (4.48:1). A press is momentary, so Harbour excludes it from the tertiary check and records that under `## Decisions`, so the next audit doesn't rediscover it as a bug.

The ladder steps, 15.19 → 7.74 → 4.83 in light (2.0×, 1.6×) and 12.99 → 6.88 → 4.90 in dark (1.9×, 1.4×), both clear the `product` minimum of 1.4×.
