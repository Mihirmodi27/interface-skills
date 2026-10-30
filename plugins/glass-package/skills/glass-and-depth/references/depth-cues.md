# Depth cues

Transparency alone does not make a surface float. These three cues do, and none involves `backdrop-filter`.

## 1. The hairline

Every glass surface here pairs blur with a border:

```tsx
className="glass-nav rounded-2xl border-[0.5px] border-gray-alpha-400 p-1"
```

**Why a translucent border.** A solid `gray-400` border doesn't participate in what's behind it: right over a white page, a pasted-on frame over a photograph, the only part of the surface not responding to the backdrop. `gray-alpha-400` sits *on* whatever's there. And because the alpha ramp inverts to white-based in dark mode (see the **glass-color** skill), the border is automatically lighter than its surface in dark mode and darker in light — "one step more contrast than the surface" in both directions.

**Why 0.5px.** It's a true sub-pixel hairline on retina and rounds *up* to 1px elsewhere, degrading to the next weight rather than disappearing. On a small floating dock, 1px reads as heavy; 0.5px reads as an edge.

**The exception.** The decorative folder pocket uses a solid `border-white/60` with `dark:border-white/[0.08]`. A literal white works because it's a *decorative* material over content it controls, and the bright edge is part of the effect. The dark value drops to `0.08` from `0.6` because on a dark surface a bright edge reads as a glowing line, not a catch light.

### Vertical dividers inside glass

```tsx
<span aria-hidden className="mx-0.5 h-6 w-[0.5px] self-center bg-gray-alpha-300" />
```

A 24px line in a 40px-tall row, spanning the *icons*, not the padding. One step lighter than the outer border (`alpha-300` vs `alpha-400`) because it's an internal articulation, not a boundary. `aria-hidden`, because it's decoration inside an already-structured list.

## 2. The shadow stack

```
inset 0 1px 0 rgba(255,255,255,0.6),      /* top-edge catch light  */
0 1px 1px rgba(0,0,0,0.02),               /* contact               */
0 8px 16px -4px rgba(0,0,0,0.04),         /* near ambient          */
0 24px 32px -8px rgba(0,0,0,0.06)         /* far ambient           */
```

Four layers modelling **one light source above the element**:

**The inset highlight**, a 1px white line inside the top edge, is the specular catch where a raised surface faces the light. It does more for the floating impression than any shadow and is the one most often omitted; without it the surface looks printed on.

**The contact shadow** (1px offset, 1px blur, 2% black) is the tight dark line directly beneath, where ambient light can't reach. It makes the element read as *resting on* something rather than pasted over it.

**Two ambient shadows**, 8/16 then 24/32, with opacity rising slightly (4% → 6%) as spread grows. One large shadow reads as fog; two fall off closer to real penumbra.

**Negative spread** (`-4px`, `-8px`) contracts the shadow before blurring, keeping it tucked under the element instead of haloing. Most hand-written shadows miss this, which is why stock `box-shadow` presets often look like a glow.

**The opacities are 2–6%.** Elevation should be felt, not seen.

### Dark mode is a different shadow

```
inset 0 1px 0 rgba(255,255,255,0.10),     /* highlight:  0.6  → 0.10 */
0 1px 1px rgba(0,0,0,0.3),                /* shadows:    0.02 → 0.3  */
0 8px 16px -4px rgba(0,0,0,0.5),          /*             0.04 → 0.5  */
0 24px 32px -8px rgba(0,0,0,0.6)          /*             0.06 → 0.6  */
```

**Shadows get ~10× stronger.** A 4%-black shadow on a `#0b0b0b` surface is mathematically invisible, with almost no headroom below the surface colour; dark mode needs 30–60% black before a shadow registers. (It's also why the dark page is `#0b0b0b`, not `#000000`: pure black gives shadows nothing to sit on.)

**The inset highlight gets ~6× weaker.** 0.6 white on a dark surface reads as a glowing edge; 0.10 defines the edge without lighting it up.

Because the structure changes and not just the values, elevation **cannot be a single token**. It needs a per-theme pair — the one place raw `rgba()` outside the token file is acceptable — and it belongs in a **CSS class**, not a JS constant:

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

The reference implementation started with an exported constant and moved to this, for three reasons:

- **It's ~400 characters of arbitrary-value syntax either way**, but in a class it's four readable lines you can compare against the four in the dark block.
- **A shared constant is still imported and interpolated at every site**, so a `grep` for the shadow finds five hits rather than one definition.
- **The escaping is a hazard.** `shadow-[…rgba(0,0,0,0.04)…]` needs underscores for spaces and none inside the parens, and a typo produces a class the build silently drops: no shadow, no error.

## 3. Elevation tiers

**More layers as the element floats higher and persists longer.**

| Tier | Recipe | Radius | For |
|---|---|---|---|
| **Chrome** | 4 layers (inset + contact + 2 ambient) | 16px | Fixed docks, floating menus, sheets |
| **Pocket** | `inset 0 1px 0 rgba(255,255,255,0.8)` + `0 10px 28px -12px rgba(0,0,0,0.22)` | 16px | A large decorative material |
| **Panel** | `0 8px 24px -8px rgba(0,0,0,0.12)` / dark `0.6` | 12px | Hover cards |
| **Card** | `0 4px 12px -4px rgba(0,0,0,0.22)` + `ring-1 ring-black/[0.06]` / dark `ring-white/[0.08]` | 9px | Cards in a stack |
| **Transient** | `0 4px 10px -4px rgba(0,0,0,0.3)` | 6px | Tooltips |

**A tooltip's shadow is 30% black in *both* themes.** It sits on `bg-gray-1000`, near-black in light mode and near-white in dark, so the *surface*, not the page, sets its requirement. Elevation is relative to what's immediately behind, not to the theme.

**The stacked card uses a `ring`, not a `border`.** A ring doesn't affect layout, so it can't shift a card positioned by transform mid-animation. `ring-black/[0.06] dark:ring-white/[0.08]` carries the alpha ramp's information in a utility that doesn't take a token.

**A transient element gets no contact shadow.** A tooltip that exists for 300ms should look like it's hovering briefly, not resting on the page. Permanent chrome needs it.

### A confirmation takes an existing tier

The dialog that asks "are you sure?" is the one most often built as a one-off, and a red icon circle with red body text in a box nobody else uses looks pasted in from another product. It takes the panel the rest of the system floats, and the same pattern wherever loss is permanent, so deleting one thing and deleting everything read alike:

- **Plain words for what goes**, in the page's ink: what is removed, and that it can't be undone.
- **Type-to-confirm where loss is total**: "Type DELETE to confirm", matched case-insensitively. Autofocus the input, not Cancel, and keep the action disabled until it matches.
- **The action carries the red**, as every destructive action does (**glass-color**), and reports progress in its own label ("Deleting…") while it runs.
- **Focus returns to the opener.** A dialog opened from state — a row's menu, a keyboard shortcut — has no trigger for the primitive to fall back to, so focus drops to `<body>` and a keyboard user starts the page over. Hold the opening element on open and focus it on close.

```tsx
const opener = useRef<HTMLElement | null>(null);
const open = () => { opener.current = document.activeElement as HTMLElement; setOpen(true); };
const close = () => { setOpen(false); requestAnimationFrame(() => opener.current?.focus()); };
```

## 4. Continuous corners

```css
*, *::before, *::after {
  corner-shape: superellipse(1.5);
}
```

A `border-radius` quarter-circle has constant curvature along the arc, then drops abruptly to zero at the straight edge — a second-derivative discontinuity the eye reads as slight hardness. A superellipse varies curvature continuously into the edge. That's Apple's icon shape, and why an iOS icon looks softer than a CSS rectangle of the same radius.

| k | Exponent (2^k) | Shape |
|---|---|---|
| 0 | 1 | Straight bevel |
| 1 | 2 | Normal circular corner |
| **1.5** | ~2.83 | About halfway — used here |
| 2 | 4 | Full iOS squircle |

Not 2, because a full squircle is *noticeable*: at small sizes it looks like a slightly swollen rectangle. Halfway reads as a well-drawn corner rather than an effect.

It's applied globally with `*`, pseudo-elements included. Unsupported browsers ignore it and get normal rounding, so it's free progressive enhancement; keep it that way, and let nothing in the layout depend on it.

## 5. The nesting radius rule

**Inner radius = outer radius − the padding between them.** Two concentric rounded rectangles share a centre of curvature only if their radii differ by exactly the gap between their edges.

Through the dock:

```
Dock          rounded-2xl    (16px)   p-1 (4px)
  Icon button rounded-[12px] (12px)          16 − 4 = 12  ✓
    Avatar    rounded-[10px] (10px)          12 − 2 = 10  ✓
```

The avatar is `h-9 w-9` inside an `h-10 w-10` button, a 2px inset all round, so 10px.

Wrong, it shows at once: **inner too large** and the corners look pinched, the inner curve crossing the outer; **inner too small** and the gap widens at the corners while staying constant along the edges.

The mobile sheet rounds to the ladder rather than being exact:

```
Sheet   rounded-2xl (16px)   p-1.5 (6px)
  Row   rounded-xl  (12px)          16 − 6 = 10, rounded up to 12
```

A 2px discrepancy on a 44px-tall row is below the visibility threshold, and staying on the radius ladder is worth more than exactness. Below ~8px the rule matters less; above it, follow it.

## 6. Stacking inside a glass surface

A sliding highlight must sit **behind** the icons but **in front of** the surface's own tint:

```tsx
<ul className="glass-nav relative isolate flex items-center …">
  <m.div className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight" />
  {/* icons, in normal flow, above the bar */}
</ul>
```

`-z-10` alone would drop the bar behind the container, tint included. `isolate` creates a stacking context on the container that scopes the negative z inside it, so the bar goes behind the icons but not behind the glass.

`bg-highlight` is a token, white in light mode and `#2c2c2c` in dark: an elevated surface within an elevated surface, lighter than the glass in light mode and lighter again in dark, so it can't be a fixed colour.

The enclosing fixed strip carries **no transform**, for two reasons with one root cause: a transform would weaken the `backdrop-filter` in its subtree, *and* become the containing block for the mobile sheet's `position: fixed` full-bleed overlay, trapping it inside the strip.
