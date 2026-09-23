# Elevation recipes

The ladder, the bundle each level carries, and how to derive the shadow for any preset and either theme. Values here are starting points in the shape the laws require; the preset dials in `SKILL.md` set their strength, and `DESIGN.md` records what the project actually chose.

## The bundle, part by part

| Part | Comes from | Job | Fails as |
|---|---|---|---|
| Surface | `surface.page`, `surface.raised`, `surface.inverse` (`color-and-theming`) | Says which object this is | A level indistinguishable from the one below, especially in dark themes |
| Edge | `border.default` or `border.layered`, at a `hairline.*` weight (`layout-and-hierarchy`) | Says exactly where it ends | Mushy outline; vanishes in forced colours if it was only a shadow |
| Shadow | This skill | Says it is above, and how far | Fog, halo, or a shape the eye reads as a second object |
| Layer | `z.*` (`layout-and-hierarchy`) | Makes the paint order agree with the shadow | A shadow cast over something that is painted on top of it |

Check the four together. A component that has three of them right and borrows the fourth from another level is the most common depth bug there is, and no single-property lint will catch it.

## The four levels

| Level | Behaviour | Surface | Edge | Shadow | Layer | Scrim |
|---|---|---|---|---|---|---|
| `elevation.flat` | Scrolls with the page | `surface.page` or `surface.subtle` | `border.default`, or none with a surface step | None | Page flow | No |
| `elevation.raised` | Picked up, dragged, or sticky over passing content | `surface.raised` | `border.default` | Contact + 1 ambient | `z.raised`, sticky chrome at `z.nav` | No |
| `elevation.floating` | Summoned, dismissed on its own | `surface.raised` (dark: one step lighter) | `border.default` / `border.layered` | Contact + 1–2 ambient, optional highlight | `z.popover` | No — a transparent catcher at `z.dismiss` |
| `elevation.overlay` | Blocks until answered | `surface.raised` (dark: two steps lighter) | `border.default` | Contact + 2 ambient, longest | `z.overlay` | Yes |

Sticky chrome is raised in behaviour but sits high on the z ladder, because content passes under it. That is the one place the level and the layer name differ, and it's why the layer is part of the bundle rather than derived from the level.

A tooltip is floating, transient: no contact layer, a short ambient, and — if it sits on `surface.inverse` — the same shadow in both themes, because the tooltip's own surface is what the shadow has to separate from the page.

## Building a shadow

Start from one number, `Y`, the near-ambient offset for the level, and derive the layers from it. Keeping the proportions fixed is what makes the levels read as one light at different heights rather than as four unrelated shadows.

```
contact        0  1px   1px   0      α × 0.35
near ambient   0  Y     2Y   −Y/2    α × 0.7
far ambient    0  3Y    4Y   −Y      α            (floating and overlay only)
inset highlight  inset 0 1px 0 white at h       (optional, per preset)
```

`α` is the level's peak opacity, from the Dials. Typical `Y`: raised 2px, floating 8px, overlay 16px. A worked floating shadow at `Y = 8px`, `α = 0.06`:

```css
--elevation-floating:
  inset 0 1px 0 rgb(255 255 255 / 0.5),
  0 1px 1px rgb(0 0 0 / 0.02),
  0 8px 16px -4px rgb(0 0 0 / 0.04),
  0 24px 32px -8px rgb(0 0 0 / 0.06);
```

**Why each proportion.** Blur at twice the offset keeps the penumbra soft without detaching from the element. Spread at minus half the offset contracts the shadow so its visible extent stays roughly under the element's footprint, displaced downward — tucked, not haloed. Opacity rising with distance models ambient occlusion: the far layer is larger and fainter per pixel, so it needs slightly more alpha to register at all.

**The contact layer is for resting things.** Permanent chrome and cards get it. Transient surfaces — tooltips, drag previews in flight — don't: they hover.

**The inset highlight is optional per preset.** It's the specular catch along the top edge where a raised face meets the light, and it contributes more to "floating" than any drop layer. Product systems usually leave it out, because a bright top line on every menu in a dense screen adds noise without adding information.

## Per preset

Light-theme floating shadows at the dial strengths. Raised and overlay follow from the `Y` values above.

| Preset | Floating recipe (light) |
|---|---|
| `editorial` | `inset 0 1px 0 rgb(255 255 255 / 0.5), 0 1px 1px rgb(0 0 0 / 0.02), 0 8px 16px -4px rgb(0 0 0 / 0.04), 0 24px 32px -8px rgb(0 0 0 / 0.06)` |
| `product` | `0 1px 1px rgb(0 0 0 / 0.04), 0 12px 24px -8px rgb(0 0 0 / 0.10)` — edges carry the rest |
| `expressive` | `inset 0 1px 0 rgb(255 255 255 / 0.6), 0 1px 2px rgb(0 0 0 / 0.06), 0 10px 20px -6px rgb(0 0 0 / 0.10), 0 32px 48px -12px rgb(0 0 0 / 0.16)` |

Editorial runs three levels and rarely needs raised. Product runs all four, relies on `border.default` for most of the separation, and keeps its shadows short so dense screens don't fill with grey. Expressive may add one decorative level — a large branded pocket, a hero card — named for what it is, with its own bundle.

## Dark theme: a different recipe

Three things change, and none of them is "the same shadow, darker":

1. **The surface lifts.** Each level above the page is lighter by the Dials' OKLCH step. Page 0.18 → raised 0.22 → floating 0.26 → overlay 0.30 at a +0.04 step. That lift carries most of the separation.
2. **The drop layers get about eight to ten times the opacity**, capped around 0.6. A 4% black shadow on a near-black page is mathematically invisible — there's almost no luminance below the surface to darken into.
3. **The highlight drops to a sixth.** `0.5` white along the top of a dark surface reads as a lit wire; `0.08` defines the edge without lighting it.

```css
[data-theme="dark"] {
  --elevation-floating:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 1px 1px rgb(0 0 0 / 0.3),
    0 8px 16px -4px rgb(0 0 0 / 0.4),
    0 24px 32px -8px rgb(0 0 0 / 0.5);   /* editorial's 50% dark peak */
}
```

Never put the page at pure black. `#000` leaves the drop layers no room at all, so only the surface step separates anything, and the lightest level has to climb further to be seen.

After deriving, check each level with its shadow switched off. If floating and raised are indistinguishable by surface and edge alone, the dark step is too small.

## Shadows on tinted grounds

Neutral black shadows are right on neutral pages. On a tinted ground — a warm off-white, a brand-coloured band — black darkens the ground toward grey and reads as dirt. Take the shadow colour from the ground's hue instead:

```css
--shadow-ink: oklch(from var(--surface-page) 0.25 calc(c * 1.5) h);
--elevation-raised: 0 1px 1px rgb(from var(--shadow-ink) r g b / 0.05),
                    0 2px 4px -1px rgb(from var(--shadow-ink) r g b / 0.08);
```

Where relative colour syntax isn't available, pick the ink by hand: the ground's hue at low lightness and slightly higher chroma. Record it under the surface role it belongs to, so a later re-tint of the ground moves the shadow with it.

## Edges that survive animation and preferences

An element that animates by transform — a card in a reordering stack — can't take a border change without shifting layout. Use `outline: 1px solid <border.default>; outline-offset: -1px`: it doesn't affect layout, and unlike a `0 0 0 1px` shadow ring, it survives forced colours, where every `box-shadow` is removed.

A surface that deliberately shows no edge in normal rendering carries `border: 1px solid transparent`. Forced colours paints it in the system text colour, so the surface keeps its boundary for exactly the users who asked for boundaries.

## Moving between levels

- **Hover on a raised card** may deepen the shadow — that's raised's own hover state, defined beside raised. If it lifts far enough to overlap a neighbour, it also takes `z.raised`, or the next sibling paints over its shadow.
- **Drag** moves the element to floating, whole: floating's shadow and layer, and its surface in dark themes. Drop moves it back.
- **A popover promoted to a dialog** — a "view details" that becomes modal — changes to overlay, and gains a scrim at the same moment.

## One definition per level

A layered shadow belongs in one place — a custom property per level per theme, or a class — and every use points at it. Inline copies drift, and nobody can see a `0.04` that became `0.05` in the fourth of five. In utility-class stacks the arbitrary-value form is also a hazard: spaces must become underscores and commas must stay unspaced, and a typo produces a class the build silently drops — no shadow, no error. Name the level once and use the name.

## Recording it

```markdown
## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.flat` | `bg-canvas` | `border-line` | — | — |
| `elevation.raised` | `bg-panel` | `border-line` | `shadow-raised` | `z-raised` |
| `elevation.floating` | `bg-panel` · dark `bg-panel-float` (proposed) | `border-line` | `shadow-floating` | `z-popover` |
| `elevation.overlay` | `bg-panel` · dark `bg-panel-overlay` (proposed) | `border-line` | `shadow-overlay` | `z-overlay` |

**Scrim** — `bg-scrim`: 40% light, 60% dark. **Materials** — opaque only.
```
