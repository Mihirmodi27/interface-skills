# Radius, lines and layers

## The nesting rule, worked through

**Inner radius = outer radius − the gap between their edges.** Only then do the two curves share a centre; any other value makes the corners visibly disagree.

| Nesting | Outer | Gap | Inner | Note |
|---|---|---|---|---|
| A container holding icon buttons | 16px | 4px | 12px | |
| An icon button holding an avatar | 12px | 2px inset | 10px | |
| A sheet holding text rows | 16px | 6px | 10px → snap to 12px | 2px on a 44px row is invisible |
| A search input holding a chip | 8px | 3px | 5px → snap to 4px | |
| A card with a flush image | 12px | 0 | 12px, or clip with `overflow: hidden` | Zero gap, same radius |
| A 4px chip holding a checkbox inset 4px | 4px | 4px | 0 | Square, not "a little rounding" |

**Snap within 2px, follow exactly above that.** The ladder is worth more than 1–2px of exactness, which below about 8px the eye barely resolves; a mismatch of 4px or more is what people notice without naming.

Derive the ladder from the nestings, and write the subtraction into the token so a later padding change — the usual way a correct nesting quietly breaks — can't break it:

```css
:root {
  --radius-container: 16px;
  --container-pad: 4px;
  --radius-control: calc(var(--radius-container) - var(--container-pad)); /* 12px */
}
```

## Ladders per preset

| Role | editorial | product | expressive (round) | expressive (sharp) |
|---|---|---|---|---|
| `radius.pill` | full | full | full | full, or 0 |
| `radius.small` | 4px | 2–4px | 8px | 0 |
| `radius.control` | 8px | 4–6px | 12px | 0 |
| `radius.card` | 12px | 8–10px | 20px | 0 |
| `radius.container` | 16px | 12–16px | 28px | 0 |

Product's controls run smallest, since dense rows of them sit close together. Its cards and containers may go as round as editorial's: with content unboxed (`SKILL.md` law 3) the few cards don't tile edge to edge, which is where large radii leave triangular gaps — one more reason not to build a mosaic of panels. Pick the low end where cards sit side by side, the high end where one card sits on open page. Expressive may go either way, but never mixes round and square components or keeps four near-identical radii that are really one.

**Radius scales with size, not importance**, and sub-proportionally: a 400px panel gets a larger radius than a 40px button because it is larger, but a proportional one reads as a lozenge. **`radius.pill` is for things with no top and bottom** — tags, dots, toggles, progress tracks. A paragraph in a pill-ended card collides with the curve.

## Corner shape

A superellipse eases curvature into the straight edge where a quarter-circle `border-radius` stops dead, drawing a better corner at the same radius.

```css
*, *::before, *::after { corner-shape: superellipse(1.5); }
```

`superellipse(k)` uses the exponent 2^k: 1 is an ordinary round corner, 2 a full squircle, 1.5 about halfway — craft rather than effect. It is a dial — circular is right for product, any shape works if applied globally — and progressive enhancement: unsupported browsers draw normal rounding, so nothing may depend on it.

## Line weights by job

| Role | Job | editorial | product | expressive |
|---|---|---|---|---|
| `hairline.chrome` | A divider inside one object — toolbar groups, menu rows | 0.5px | 1px, `border.divider` | 1px |
| `hairline.object` | An object's edge — a card, an input, a disclosure | 1px | 1px, `border.default` | 1–2px |
| `rule.emphasis` | A deliberate mark — a quote bar, a focus ring, an active tab | 2px | 2px | 3–4px |

`0.5px` rounds up to 1px on 1× screens, degrading to the next weight rather than disappearing. Where chrome and object share a weight, the divider must step down in colour so it never matches the edge. A vertical divider spans the content, not the padding: a 24px line in a 40px row, centred.

```css
.divider-v { inline-size: var(--hairline-chrome); block-size: 24px; align-self: center; background: var(--border-divider); }
```

Two resets that cause visible bugs:

- An `<hr>` carries a UA border: give it `border: 0` before a `background` and `block-size`, or it draws the browser's line and yours a few pixels apart.
- A divider that is rhythm rather than structure gets `aria-hidden`; an `<hr>` announces itself as a separator.

On translucent or unknown backdrops every line uses `border.layered`; a solid border on glass reads as a frame pasted on top. `color-and-theming` owns its value, `surfaces-and-depth` the material it sits on.

## The z-index ladder per preset

Every preset shares the rungs; only product adds toasts.

| Role | Rung | Holds |
|---|---|---|
| `z.skip-link` | 100 | Above everything, modals included |
| `z.toast` (proposed) | 70 (product only) | Toasts, above a modal so a save confirmation is never hidden |
| `z.overlay` | 60 | Modals, sheets, once-a-session overlays |
| `z.nav` | 50 | Fixed navigation, the app shell's header |
| `z.dismiss` | 40 | The navigation's tap-outside catchers — over the page, under the nav |
| `z.popover` | 20 | Menus, hover cards, dropdowns |
| `z.raised` | 10 | A hovered or focused item |
| `z.below` | −10 | A highlight behind its siblings, inside `isolation: isolate` |

Ordered by permanence, gaps of ten. A stacked modal (a confirm over a dialog) needs no new rung: rendered later in the same portal, it stacks by document order. **Portals make the ladder global**: inside a card, a menu is trapped by every stacking context above it whatever its number, so overlays, menus escaping a scroll container, and toasts render into a root-level portal.

### The two pairs

```html
<!-- Catcher above the page, below the menu it dismisses. -->
<div class="catcher" style="position: fixed; inset: 0; z-index: var(--z-dismiss)" aria-hidden="true"></div>
<div class="menu" style="position: relative; z-index: var(--z-nav)">…</div>
```

A catcher on `z.nav` or above eats the menu's own clicks, so the menu seems to ignore every tap. A content popover on `z.popover` sits below `z.dismiss` and can't borrow the navigation's catcher: render its own immediately before it in the same portal, and the two stack by document order.

## Stacking-context techniques

**Negative z needs an isolated parent.** At `z-index: -10` alone, a highlight meant to slide behind a row of items but in front of their container's background drops behind the container too; `isolation: isolate` on the container scopes it.

**A lift on hover needs one on focus.** An item raised to `z.raised` on hover, so its neighbour doesn't clip its shadow, needs the same on `:focus-within`, or keyboard focus shows it clipped.

**A full-width strip passes clicks through.** A fixed bar spanning the viewport for centring takes `pointer-events: none`, its content `pointer-events: auto`, or the invisible strip swallows every click along the bottom of the page.

**Containing blocks.** A `transform`, `filter`, `backdrop-filter`, `perspective`, `contain: paint` or `will-change: transform` on an ancestor makes it the containing block for `position: fixed` descendants: a full-screen overlay renders the size of its parent strip, or a fixed header scrolls away. Check every ancestor for those properties before changing a z-index.
