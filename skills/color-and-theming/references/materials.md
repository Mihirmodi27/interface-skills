# Translucent materials and elevation

## Why glass tints are runtime variables

```css
/* NOT in @theme. */
:root {
  --glass-nav-bg:    rgba(242, 242, 242, 0.72);
  --glass-menu-bg:   rgba(255, 255, 255, 0.72);
  --glass-panel-bg:  rgba(243, 243, 243, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
}
```

The solid ramp lives in `@theme` (build-time tokens Tailwind generates utilities from). The glass tints live in `:root` as plain custom properties, for two reasons:

1. **They must be re-declarable per theme *and* per media query.** The reduced-transparency fallback replaces all four with solid tokens. A build-time token can't be swapped by a media query at runtime.
2. **One of them isn't a colour.** `--folder-glass-bg` is a gradient, which no colour token system will accept.

The general principle: **a value that changes by *context* (theme, user preference, container) belongs in `:root`; a value that's part of the vocabulary belongs in `@theme`.**

## The four materials

```css
.glass-nav {
  background: var(--glass-nav-bg);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
}
.glass-menu {
  background: var(--glass-menu-bg);
  backdrop-filter: blur(16px) saturate(1.8);
  -webkit-backdrop-filter: blur(16px) saturate(1.8);
}
.glass-panel {
  background: var(--glass-panel-bg);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
}
.folder-glass {
  background: var(--folder-glass-bg);
  backdrop-filter: blur(8px) saturate(1.4);
  -webkit-backdrop-filter: blur(8px) saturate(1.4);
}
```

| Material | Blur | Saturate | Tint | Job |
|---|---|---|---|---|
| `glass-nav` | 20px | 1.8 | 72% | Fixed chrome with page content passing under it |
| `glass-menu` | 16px | 1.8 | 72% | A menu over a surface you already know |
| `glass-panel` | 24px | 1.8 | **97%** | A floating menu that must stay legible over anything |
| `folder-glass` | 8px | 1.4 | gradient | A frosted pocket with cards visible behind it |

### Blur scales with uncertainty about the backdrop

8px on the folder pocket: you *want* to see the cards behind it, recognisably. Blur is there to soften, not to obscure.

16px on a menu over a known surface: enough to detach the menu, not so much that it becomes an opaque slab.

20px on fixed nav chrome: arbitrary page content scrolls under it, so it has to work over a paragraph, a photo, or an image wall. More blur means less of that content survives to compete with the nav's own icons.

24px on the panel: the most defensive value, for the surface with the least control over its backdrop.

### `saturate()` is not optional

Blur averages neighbouring pixels, and averaging colours pulls them toward grey. Without a saturation boost, glass over a colourful photo produces a muddy wash — the classic "cheap frosted glass" look.

1.8 restores the life. 1.4 on the folder pocket because the cards behind it are already the subject; over-saturating them would make the pocket louder than its contents.

Apple's own materials do exactly this, which is why iOS glass reads as *translucent* rather than *dirty*.

### The 97% panel

`glass-panel` sits at 97% opacity — effectively opaque — while still carrying a 24px blur. That looks contradictory until you know the constraint:

> A transform on an ancestor weakens or breaks `backdrop-filter` in its subtree.

`glass-panel` is used on menus whose wrapper animates (scaling open — see the **interface-motion** skill). During that animation the blur is compromised. So the *tint* carries the legibility and the blur is a bonus that lands once the animation settles.

The generalisable rule: **when you can't rely on the blur, thicken the tint.** Don't ship a 72% surface whose blur is broken; it's unreadable over busy content.

The structural fix where you have the choice: animate the wrapper, put the glass on a static child.

```tsx
<DropMenu open={open}>            {/* animates scale + y */}
  <ul className="glass-panel …">  {/* carries the blur, never transformed */}
```

### `-webkit-` prefix

Still required for Safari, and Safari is both where glass looks best and where the largest share of users who'll notice it are. Ship both, always. There's no cost.

## Both fallbacks

```css
/* AFTER both theme blocks, because it re-declares the same properties. */
@media (prefers-reduced-transparency: reduce) {
  :root,
  :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-menu-bg: var(--color-background-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
}

@media (prefers-reduced-transparency: reduce) {
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

**Both halves of the transparency fallback are required.** Dropping the filter alone leaves a 72% tint sitting over page content — worse than the glass was. Swapping the tint alone still pays the (substantial) cost of the blur.

**Ordering matters.** The variable block re-declares custom properties that both `:root` and `:root[data-theme="dark"]` also declare. Same specificity, so source order decides — it has to come last, and it has to name both selectors.

**High contrast promotes the hairline.** A translucent panel's boundary is normally a `0.5px` alpha border. At high contrast that has to become a real border at primary text colour: the *surface* is fine, but the *edge* has to be unambiguous.

Each glass surface pairs with a hairline in normal use:

```tsx
className="glass-nav rounded-2xl border-[0.5px] border-gray-alpha-400 p-1"
```

`0.5px` renders as a true sub-pixel hairline on retina displays and rounds to 1px elsewhere. `gray-alpha-400` rather than solid `gray-400`, because a solid border on a translucent surface doesn't participate in what's behind it and reads as a pasted-on frame.

## Elevation: the four-layer stack

```
inset 0 1px 0 rgba(255,255,255,0.6),      /* top-edge catch light */
0 1px 1px rgba(0,0,0,0.02),               /* contact  */
0 8px 16px -4px rgba(0,0,0,0.04),         /* near ambient */
0 24px 32px -8px rgba(0,0,0,0.06)         /* far ambient  */
```

Four layers modelling one light source above the element:

**The inset highlight** is a 1px white line inside the top edge — the specular catch light where a physical raised surface faces the light. This single line does more for the "floating object" impression than any of the shadows.

**The contact shadow** (1px offset, 1px blur, 2% black) is the tight dark line directly under the element. Physically it's where ambient light can't reach; perceptually it's what makes the element look *resting on* something rather than pasted over it.

**Two ambient shadows** at increasing offset and blur (8/16, then 24/32) with *decreasing* opacity relative to their spread. Two layers instead of one because a single large shadow reads as a fog; two produce a gradient that falls off the way real penumbra does.

**Negative spread** (`-4px`, `-8px`) contracts the shadow before blurring it, so it stays tucked under the element instead of haloing out past its edges. This is the detail most hand-written shadows miss.

Opacities are tiny — 2%, 4%, 6%. Elevation should be felt, not seen. If you can identify the shadow as a shadow, it's too strong.

### The dark variant is a different shadow

```
inset 0 1px 0 rgba(255,255,255,0.10),     /* highlight: 0.6 → 0.10 */
0 1px 1px rgba(0,0,0,0.3),                /* shadows: 0.02 → 0.3   */
0 8px 16px -4px rgba(0,0,0,0.5),          /*          0.04 → 0.5   */
0 24px 32px -8px rgba(0,0,0,0.6)          /*          0.06 → 0.6   */
```

**Shadows get roughly 10× stronger.** A 4%-black shadow on a `#0b0b0b` surface is mathematically invisible — there's almost no headroom below the surface colour. Dark mode needs 30–60% black for a shadow to register at all.

**The inset highlight gets 6× weaker.** 0.6 white on a dark surface is a bright line that reads as a glowing edge rather than a catch light. 0.10 is enough to define the edge without lighting it up.

This inversion — shadows up, highlight down — is why elevation can't be a single token. It's a structural change, not a value change, so it needs a `dark:` variant. Extract it once:

```tsx
const SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04),0_24px_32px_-8px_rgba(0,0,0,0.06)] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_1px_rgba(0,0,0,0.3),0_8px_16px_-4px_rgba(0,0,0,0.5),0_24px_32px_-8px_rgba(0,0,0,0.6)]";
```

One constant, imported everywhere. It's the only place raw hex/rgba is acceptable in a component.

### Smaller elevation recipes

Not everything needs four layers. The system uses three tiers:

```
/* A tooltip — small, close, brief */
shadow-[0_4px_10px_-4px_rgba(0,0,0,0.3)]

/* A hover card — a real floating object, but not chrome */
shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]  dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]

/* A card in a stack — one layer, with a ring instead of a border */
shadow-[0_4px_12px_-4px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]
```

The pattern: **more layers as the element floats higher and stays longer.** A tooltip that exists for 300ms doesn't need a contact shadow. Fixed chrome that's always present does.

Note the tooltip's shadow is 30% black in *both* themes — it sits on `bg-gray-1000`, which is near-black in light mode and near-white in dark, so it's the one case where the surface, not the page, sets the requirement.

### The gradient pocket

```css
--folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
```

A vertical gradient rather than a flat tint: brighter at the top, where the light hits, fading down. It's the same catch-light idea as the inset highlight, expressed as the surface itself — appropriate for a large surface where a 1px line would be lost.

The dark version keeps the direction but shifts to grey and lowers the range:

```css
--folder-glass-bg: linear-gradient(to bottom, rgba(48,48,48,0.5), rgba(30,30,30,0.34));
```

Not white-based, because a white gradient over a dark page reads as fog rather than glass.
