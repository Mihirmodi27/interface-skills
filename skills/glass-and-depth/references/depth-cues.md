# Depth cues

Transparency alone does not make a surface float. These are the three cues that do, and none of them involve `backdrop-filter`.

## 1. The hairline

Every glass surface in the reference implementation pairs blur with a border:

```tsx
className="glass-nav rounded-2xl border-[0.5px] border-gray-alpha-400 p-1"
```

**Why a translucent border and not a solid one.** A solid `gray-400` border on a translucent surface doesn't participate in what's behind it. Over a white page it looks right; over a photograph it reads as a pasted-on frame, because it's the only part of the surface not responding to the backdrop. `gray-alpha-400` sits *on* whatever's there.

And because the alpha ramp inverts to white-based in dark mode (see the **color-and-theming** skill), the border is automatically lighter than its surface in dark mode and darker in light mode — which is what "one step more contrast than the surface" means in both directions.

**Why 0.5px.** It renders as a true sub-pixel hairline on retina displays and rounds *up* to 1px elsewhere, so it degrades to the next weight rather than disappearing. A 1px border on a small floating dock reads as heavy; 0.5px reads as an edge.

**The exception.** The decorative folder pocket uses a solid `border-white/60` with `dark:border-white/[0.08]`. It gets away with a literal white because it's a *decorative* material over content it controls, and the bright edge is part of the effect. Note how far the dark value drops — `0.08` against `0.6`, because on a dark surface a bright edge reads as a glowing line rather than a catch light.

### Vertical dividers inside glass

```tsx
<span aria-hidden className="mx-0.5 h-6 w-[0.5px] self-center bg-gray-alpha-300" />
```

A 24px line inside a 40px-tall row — the divider spans the *icons*, not the padding. One step lighter than the outer border (`alpha-300` vs `alpha-400`), because it's an internal articulation rather than a boundary. `aria-hidden`, because it's decoration inside an already-structured list.

## 2. The shadow stack

```
inset 0 1px 0 rgba(255,255,255,0.6),      /* top-edge catch light  */
0 1px 1px rgba(0,0,0,0.02),               /* contact               */
0 8px 16px -4px rgba(0,0,0,0.04),         /* near ambient          */
0 24px 32px -8px rgba(0,0,0,0.06)         /* far ambient           */
```

Four layers modelling **one light source above the element.** Each does a distinct job:

**The inset highlight** is a 1px white line inside the top edge — the specular catch where a raised surface faces the light. This single line contributes more to the floating impression than any of the shadows, and it's the one most often omitted. Remove it and the surface immediately looks printed on rather than raised.

**The contact shadow** (1px offset, 1px blur, 2% black) is the tight dark line directly beneath. Physically it's where ambient light can't reach; perceptually it's what makes the element read as *resting on* something rather than pasted over it.

**Two ambient shadows** at increasing offset and blur — 8/16, then 24/32 — with opacity rising slightly (4% → 6%) as spread grows. Two layers rather than one because a single large shadow reads as fog; two produce a falloff closer to real penumbra.

**Negative spread** (`-4px`, `-8px`) contracts the shadow before blurring, keeping it tucked under the element instead of haloing past its edges. This is the detail most hand-written shadows miss, and it's why stock `box-shadow` presets often look like a glow.

**The opacities are 2–6%.** Elevation should be felt, not seen. If you can identify the shadow as a shadow, it's too strong.

### Dark mode is a different shadow

```
inset 0 1px 0 rgba(255,255,255,0.10),     /* highlight:  0.6  → 0.10 */
0 1px 1px rgba(0,0,0,0.3),                /* shadows:    0.02 → 0.3  */
0 8px 16px -4px rgba(0,0,0,0.5),          /*             0.04 → 0.5  */
0 24px 32px -8px rgba(0,0,0,0.6)          /*             0.06 → 0.6  */
```

Two inversions happening at once:

**Shadows get ~10× stronger.** A 4%-black shadow on a `#0b0b0b` surface is mathematically invisible — there's almost no headroom below the surface colour. Dark mode needs 30–60% black before a shadow registers at all. (This is also why the dark page background is `#0b0b0b` and not `#000000`: pure black gives shadows nothing to sit on.)

**The inset highlight gets ~6× weaker.** 0.6 white on a dark surface is a bright line that reads as a glowing edge rather than a catch light. 0.10 defines the edge without lighting it up.

Because the structure changes and not just the values, elevation **cannot be a single token**. It needs a per-theme pair — which is the one place raw `rgba()` outside the token file is acceptable.

Put it in a **CSS class**, not a JS constant:

```css
.dock-shadow {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 1px 1px rgba(0, 0, 0, 0.02),
    0 8px 16px -4px rgba(0, 0, 0, 0.04),
    0 24px 32px -8px rgba(0, 0, 0, 0.06);
}
:root[data-theme="dark"] .dock-shadow {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 1px 1px rgba(0, 0, 0, 0.3),
    0 8px 16px -4px rgba(0, 0, 0, 0.5),
    0 24px 32px -8px rgba(0, 0, 0, 0.6);
}
```

```tsx
<div className="glass-nav dock-shadow rounded-2xl border-[0.5px] border-gray-alpha-400 p-1">
```

The reference implementation started with the exported-constant version above and moved to this. Three reasons the class wins:

- **It's ~400 characters of arbitrary-value syntax either way**, and in a class it's readable — four lines you can actually compare against the four in the dark block.
- **A shared constant still has to be imported and interpolated** at every site, so it shows up in five files' class strings and a `grep` for a shadow finds five hits rather than one definition.
- **The escaping is a real hazard.** `shadow-[…rgba(0,0,0,0.04)…]` has to be written with underscores for spaces and no spaces inside the parens, and a typo there produces a class the build silently drops — no shadow, no error.

**Extract it the moment it appears twice.** A four-layer shadow is both the most-copied value in a system like this and the hardest to eyeball a divergence in — nobody spots a `0.04` that became `0.05` in one of five places.

## 3. Elevation tiers

Not everything needs four layers. **More layers as the element floats higher and persists longer.**

| Tier | Recipe | Radius | For |
|---|---|---|---|
| **Chrome** | 4 layers (inset + contact + 2 ambient) | 16px | Fixed docks, floating menus, sheets |
| **Pocket** | `inset 0 1px 0 rgba(255,255,255,0.8)` + `0 10px 28px -12px rgba(0,0,0,0.22)` | 16px | A large decorative material |
| **Panel** | `0 8px 24px -8px rgba(0,0,0,0.12)` / dark `0.6` | 12px | Hover cards |
| **Card** | `0 4px 12px -4px rgba(0,0,0,0.22)` + `ring-1 ring-black/[0.06]` / dark `ring-white/[0.08]` | 9px | Cards in a stack |
| **Transient** | `0 4px 10px -4px rgba(0,0,0,0.3)` | 6px | Tooltips |

Three things to notice.

**A tooltip's shadow is 30% black in *both* themes.** Every other tier changes between themes; the tooltip doesn't, because it sits on `bg-gray-1000` — near-black in light mode, near-white in dark. The *surface*, not the page, sets its requirement. Worth internalising: elevation is relative to what's immediately behind, not to the theme.

**The stacked card uses a `ring` instead of a `border`.** A ring doesn't affect layout, so it can't shift a card that's being positioned by transform in an animation. `ring-black/[0.06] dark:ring-white/[0.08]` is the same information the alpha ramp encodes, in a utility that doesn't take a token.

**A transient element gets no contact shadow.** A tooltip that exists for 300ms doesn't need to look like it's resting on the page — it needs to look like it's hovering briefly. Permanent chrome does need it.

## 4. Continuous corners

```css
*, *::before, *::after {
  corner-shape: superellipse(1.5);
}
```

A CSS `border-radius` is a quarter-circle: constant curvature along the arc, then an abrupt drop to zero where it meets the straight edge. That's a second-derivative discontinuity, and the eye reads it as a slight hardness at the corner.

A superellipse varies curvature continuously into the edge. That's what Apple's icon shape is, and it's why an iOS icon looks softer than a CSS rectangle of the same radius.

| k | Exponent (2^k) | Shape |
|---|---|---|
| 0 | 1 | Straight bevel |
| 1 | 2 | Normal circular corner |
| **1.5** | ~2.83 | About halfway — used here |
| 2 | 4 | Full iOS squircle |

1.5 rather than 2 because a full squircle is *noticeable* — at small sizes it starts to look like a slightly swollen rectangle. Halfway reads as "well-drawn corner" rather than as an effect.

Applied globally with `*`, including pseudo-elements. Unsupported browsers ignore the property and get normal rounding, so it's free progressive enhancement — keep it that way, and don't let anything in the layout depend on it.

## 5. The nesting radius rule

**Inner radius = outer radius − the padding between them.** Geometry, not taste: two concentric rounded rectangles share a centre of curvature only if their radii differ by exactly the gap between their edges.

Worked through the dock:

```
Dock          rounded-2xl    (16px)   p-1 (4px)
  Icon button rounded-[12px] (12px)          16 − 4 = 12  ✓
    Avatar    rounded-[10px] (10px)          12 − 2 = 10  ✓
```

The avatar is `h-9 w-9` inside an `h-10 w-10` button — a 2px inset all round, so 10px.

Get it wrong and it shows immediately: **inner too large** and the corners look pinched, with the inner curve crossing the outer one; **inner too small** and the gap widens at the corners while staying constant along the edges.

The mobile sheet rounds to the ladder rather than being exact:

```
Sheet   rounded-2xl (16px)   p-1.5 (6px)
  Row   rounded-xl  (12px)          16 − 6 = 10, rounded up to 12
```

A 2px discrepancy on a 44px-tall row is below the visibility threshold, and staying on the radius ladder is worth more than the exactness. Below ~8px the rule matters less; above it, follow it.

## 6. Stacking inside a glass surface

Glass surfaces here contain a sliding highlight that must sit **behind** the icons but **in front of** the surface's own tint:

```tsx
<ul className="glass-nav relative isolate flex items-center …">
  <m.div className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight" />
  {/* icons, in normal flow, above the bar */}
</ul>
```

`-z-10` alone would drop the bar behind the container entirely, tint included. `isolate` creates a stacking context on the container, scoping the negative z inside it — so the bar can go behind the icons but not behind the glass.

`bg-highlight` is a token: white in light mode, `#2c2c2c` in dark. An "elevated surface within an elevated surface," which needs to be lighter than the glass in light mode and lighter again in dark — so it can't be a fixed colour.

And the enclosing fixed strip carries **no transform**, for two separate reasons: a transform would weaken the `backdrop-filter` in its subtree, *and* it would become the containing block for the mobile sheet's `position: fixed` full-bleed overlay, trapping it inside the strip's bounds. Same root cause, two symptoms.
