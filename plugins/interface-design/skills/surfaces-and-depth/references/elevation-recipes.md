# Elevation recipes

Starting values for each level's bundle and shadow; `SKILL.md`'s Dials set their strength, `DESIGN.md` the project's choice.

## The bundle, part by part

| Part | Comes from | Job | Fails as |
|---|---|---|---|
| Surface | `surface.page`, `surface.raised`, `surface.inverse` (`color-and-theming`) | Which object this is | Indistinguishable from the level below, especially in dark themes |
| Edge | `border.default` or `border.layered`, at a `hairline.*` weight (`layout-and-hierarchy`) | Exactly where it ends | Mushy outline; vanishes in forced colours if it was only a shadow |
| Shadow | This skill | That it is above, and how far | Fog, halo, or a shape read as a second object |
| Layer | `z.*` (`layout-and-hierarchy`) | Makes paint order agree with the shadow | A shadow cast over something painted on top of it |

Check the four together: three right and one borrowed is the commonest depth bug, and no single-property lint catches it.

## The four levels

| Level | Behaviour | Surface | Edge | Shadow | Layer | Scrim |
|---|---|---|---|---|---|---|
| `elevation.flat` | Scrolls with the page | `surface.page` or `surface.subtle` | `border.default`, or none with a surface step | None | Page flow | No |
| `elevation.raised` | Picked up, dragged, or sticky over passing content | `surface.raised` | `border.default` | Contact + 1 ambient | `z.raised`, sticky chrome at `z.nav` | No |
| `elevation.floating` | Summoned, dismissed on its own | `surface.raised` (dark: one step lighter) | `border.default` / `border.layered` | Contact + 1–2 ambient, optional highlight | `z.popover` | No — a transparent catcher at `z.dismiss` |
| `elevation.overlay` | Blocks until answered | `surface.raised` (dark: two steps lighter) | `border.default` | Contact + 2 ambient, longest | `z.overlay` | Yes |

Sticky chrome is raised in behaviour but high on the z ladder, because content passes under it — the one place level and layer differ, and why the layer is part of the bundle.

A tooltip is floating and transient: no contact layer, a short ambient and, on `surface.inverse`, one shadow for both themes, its own surface being what the shadow separates.

## Building a shadow

Derive every layer from `Y`, the level's near-ambient offset; fixed proportions read as one light at different heights.

```
contact        0  1px   1px   0      α × 0.35
near ambient   0  Y     2Y   −Y/2    α × 0.7
far ambient    0  3Y    4Y   −Y      α            (floating and overlay only)
inset highlight  inset 0 1px 0 white at h       (optional, per preset)
```

`α` is the level's peak opacity, from the Dials. Typical `Y`: raised 2px, floating 8px, overlay 16px. At `Y = 8px`, `α = 0.06`:

```css
--elevation-floating:
  inset 0 1px 0 rgb(255 255 255 / 0.5),
  0 1px 1px rgb(0 0 0 / 0.02),
  0 8px 16px -4px rgb(0 0 0 / 0.04),
  0 24px 32px -8px rgb(0 0 0 / 0.06);
```

**Why each proportion.** Blur at twice the offset keeps the penumbra soft without detaching; spread at minus half keeps the shadow under the footprint, displaced downward — tucked, not haloed. Opacity rises with distance, as ambient occlusion: the larger far layer is fainter per pixel, so needs slightly more alpha.

**The contact layer is for resting things**, chrome and cards; tooltips and drag previews in flight hover, and skip it. **The inset highlight**, the specular catch on the top edge, is optional per preset; product usually omits it, a bright line on every menu in a dense screen being noise.

## Per preset

Light-theme floating shadows at the dial strengths; raised and overlay follow from the `Y` values above.

| Preset | Floating recipe (light) |
|---|---|
| `editorial` | `inset 0 1px 0 rgb(255 255 255 / 0.5), 0 1px 1px rgb(0 0 0 / 0.02), 0 8px 16px -4px rgb(0 0 0 / 0.04), 0 24px 32px -8px rgb(0 0 0 / 0.06)` |
| `product` | `0 1px 1px rgb(0 0 0 / 0.04), 0 12px 24px -8px rgb(0 0 0 / 0.10)` — edges carry the rest |
| `expressive` | `inset 0 1px 0 rgb(255 255 255 / 0.6), 0 1px 2px rgb(0 0 0 / 0.06), 0 10px 20px -6px rgb(0 0 0 / 0.10), 0 32px 48px -12px rgb(0 0 0 / 0.16)` |

Product leans on `border.default` with short shadows, so dense screens don't fill with grey, and draws that edge as a ring inside the shadow on cards, menus and dialogs alike (below). Expressive may add one decorative level — a branded pocket, a hero card — named, with its own bundle.

## Dark theme: a different recipe

Three things change; none is "the same shadow, darker":

1. **The surface lifts** by the Dials' OKLCH step: page 0.18 → raised 0.22 → floating 0.26 → overlay 0.30 at +0.04. It carries most of the separation.
2. **Drop layers get about eight to ten times the opacity**, capped around 0.6. A 4% black shadow on a near-black page is invisible.
3. **The highlight drops to a sixth.** `0.5` white along a dark top edge reads as a lit wire; `0.08` defines the edge without lighting it.

```css
[data-theme="dark"] {
  --elevation-floating:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 1px 1px rgb(0 0 0 / 0.3),
    0 8px 16px -4px rgb(0 0 0 / 0.4),
    0 24px 32px -8px rgb(0 0 0 / 0.5);   /* editorial's 50% dark peak */
}
```

A `#000` page leaves drop layers no room, so only the surface step separates and the top level must climb further. Then switch shadows off: if surface and edge can't tell floating from raised, the dark step is too small.

## Shadows on tinted grounds

On a tinted ground — warm off-white, a brand band — neutral black reads as dirt. Take the shadow from the ground's hue:

```css
--shadow-ink: oklch(from var(--surface-page) 0.25 calc(c * 1.5) h);
--elevation-raised: 0 1px 1px rgb(from var(--shadow-ink) r g b / 0.05),
                    0 2px 4px -1px rgb(from var(--shadow-ink) r g b / 0.08);
```

Without relative colour syntax, pick it by hand (the ground's hue, low lightness, slightly more chroma) and record it under its surface role, so re-tinting the ground moves the shadow.

## Edges that survive

A card animating by transform, as in a reordering stack, can't change its border without shifting layout; use `outline: 1px solid <border.default>; outline-offset: -1px`, which, unlike a `0 0 0 1px` shadow ring, survives forced colours. An edgeless surface carries `border: 1px solid transparent` — a boundary for exactly the users who asked for one.

**The ring edge** (`product`): the edge as the first layer of the level's one shadow definition, so edge and shadow change together and every card, menu and dialog gets the same line.

```css
:root {
  --elevation-floating:
    0 0 0 0.5px var(--border-default),          /* the edge */
    0 1px 1px rgb(0 0 0 / 0.04),
    0 12px 24px -8px rgb(0 0 0 / 0.10);
}
.card, .menu, .dialog { border: 1px solid transparent; box-shadow: var(--elevation-floating); }
@media (prefers-contrast: more) {
  .card, .menu, .dialog { border-color: var(--text-primary); }   /* a real 1px edge, as for materials */
}
```

Half a pixel is one device pixel on a 2x screen and rounds to a faint 1px on 1x, which is the point — quieter than any border — and why the contrast preference gets a real one. Forced colours paints the transparent border.

## Moving between levels

- **Hover on a raised card** may deepen the shadow, as raised's own state; if the lift overlaps a neighbour it also takes `z.raised`, or the next sibling paints over it. In `product`, hover is a surface wash and the bundle stays put; `interface-motion` says why.
- **Drag** moves it to floating, whole — shadow, layer, dark surface — and drop moves it back.
- **A popover promoted to a dialog** changes to overlay and gains a scrim at the same moment.

## Closing an overlay

A dialog hands focus back to its opener. Primitives do this for a trigger they rendered; a dialog opened from state — a row's menu item, a keyboard shortcut, a bulk selection — has none, and focus falls to `<body>`. Store the opener as it opens:

```tsx
const opener = useRef<HTMLElement | null>(null);
const openDialog = () => { opener.current = document.activeElement as HTMLElement; setOpen(true); };

<Dialog open={open} onOpenChange={setOpen}
  onCloseAutoFocus={(e) => {                       // or the primitive's equivalent close hook
    e.preventDefault();
    const back = opener.current?.isConnected ? opener.current : fallback();
    back?.focus();
  }}>
```

- **Opened from a menu item:** the item unmounted with the menu; store the menu's trigger, not the item.
- **The opener is gone** — the row was just deleted: `fallback()` focuses its neighbour, or the list's heading, never the page top.

## The art panel

Where a product keeps art (`SKILL.md` law 6) it is one inset panel: on a sign-in page, the half beside an unboxed form, from the breakpoint where both fit; phones get the form alone.

- **Its own surface, not a level.** Inset by the page gutter, at `radius.container`, no shadow: it is part of the page, not above it.
- **Its theme is scoped.** Art designed for one ground looks wrong on the other, so the panel pins a theme (`data-theme="dark"` on the panel, its tokens re-resolving inside) and reads the same in both.
- **Generative over photographic.** A photograph or a soft gradient wash reads dated; art generated in the brand's colours reads current. Its motion is ambient (`interface-motion` law 4): the screen it lives on is an area on a preset that allows it, or the art holds one still frame, as it must under reduced motion.
- **A frosted element sits over still art** only, as the pocket in `translucent-materials.md`, with its opaque fallback.

## One definition per level

One custom property per level per theme, or one class, never inline copies. Utility arbitrary values add a hazard: spaces become underscores, commas stay unspaced, and a typo yields a class the build silently drops — no shadow, no error.

## A worked example

**Tally**, a fictional invoicing app on `product` with `app/(marketing)/**` on `expressive`, whose tokens call surfaces `canvas` and `panel` and the edge `line`: four opaque levels in the app, one chrome tier on the marketing header.

```css
:root {
  --elevation-raised:   0 1px 1px rgb(20 20 30 / 0.04), 0 2px 6px -2px rgb(20 20 30 / 0.06);
  --elevation-floating: 0 1px 1px rgb(20 20 30 / 0.05), 0 12px 24px -8px rgb(20 20 30 / 0.10);
  --elevation-overlay:  0 1px 1px rgb(20 20 30 / 0.06), 0 24px 48px -12px rgb(20 20 30 / 0.16);
  --scrim: rgb(20 20 30 / 0.40);
}
[data-theme="dark"] {
  --color-panel:        oklch(0.25 0.01 270);   /* canvas is 0.21; each level +0.04 */
  --color-panel-float:  oklch(0.29 0.01 270);   /* proposed: surface.floating */
  --elevation-floating: 0 1px 1px rgb(0 0 0 / 0.40), 0 12px 24px -8px rgb(0 0 0 / 0.55);
  --scrim: rgb(0 0 0 / 0.60);
}
```

The theme-varying value stays a runtime custom property: Tailwind v4 `@theme inline { --shadow-floating: var(--elevation-floating); }`, so the utility follows each theme; v3 `boxShadow: { floating: 'var(--elevation-floating)' }`; a JS theme object `shadows.floating: 'var(--elevation-floating)'`.

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
