# Radius, lines and layers

## The nesting rule, worked through

**Inner radius = outer radius − the gap between their edges.** Two concentric rounded rectangles share a centre of curvature only when their radii differ by exactly that gap; any other value makes the corners visibly disagree.

| Nesting | Outer | Gap | Inner | Note |
|---|---|---|---|---|
| A container holding icon buttons | 16px | 4px | 12px | |
| An icon button holding an avatar | 12px | 2px inset | 10px | |
| A sheet holding text rows | 16px | 6px | 10px → snap to 12px | A 2px difference on a 44px row is below visibility |
| A search input holding a chip | 8px | 3px | 5px → snap to 4px | |
| A card with a flush image | 12px | 0 | 12px, or clip with `overflow: hidden` | Zero gap means the same radius |
| A 4px chip holding a checkbox inset 4px | 4px | 4px | 0 | Square, not "a little rounding" |

**Snap within 2px, follow exactly above that.** Keeping to the ladder is worth more than a 1–2px exactness, and below about 8px the eye barely resolves the difference. Above it, a mismatch of 4px or more is the thing people notice without being able to name.

Derive the ladder from the nestings, not the other way round. List every place the project puts a rounded thing inside a rounded thing, pick the outermost radius, subtract inward, and the ladder is whatever those subtractions produce, snapped to a few steps.

```css
:root {
  --radius-container: 16px;
  --container-pad: 4px;
  --radius-control: calc(var(--radius-container) - var(--container-pad)); /* 12px */
}
```

Writing the subtraction into the token makes the relationship survive a later change to the padding — the most common way a correct nesting quietly breaks.

## Ladders per preset

| Role | editorial | product | expressive (round) | expressive (sharp) |
|---|---|---|---|---|
| `radius.pill` | full | full | full | full, or 0 |
| `radius.small` | 4px | 2px | 8px | 0 |
| `radius.control` | 8px | 4–6px | 12px | 0 |
| `radius.card` | 12px | 8px | 20px | 0 |
| `radius.container` | 16px | 12px | 28px | 0 |

Product runs smallest because dense surfaces tile against each other and large radii leave triangular gaps between adjacent panels. Expressive may go either direction; what it can't do is mix a round system with square components, or keep four near-identical radii that are really one.

**Radius scales with size, not importance.** A 40px button and a 400px panel both matter; the panel gets the larger radius because it is larger, and sub-proportionally, because a proportional radius on a large surface reads as a lozenge.

**`radius.pill` is for things with no top and bottom** — tags, dots, toggles, progress tracks. A card holding a paragraph with pill ends looks like a capsule, and its text collides with the curve.

## Corner shape

A CSS `border-radius` is a quarter-circle: its curvature is constant along the arc and drops to zero where it meets the straight edge. A superellipse varies curvature continuously into the edge, which reads as a softer, better-drawn corner at the same radius.

```css
*, *::before, *::after { corner-shape: superellipse(1.5); }
```

`superellipse(k)` uses the exponent 2^k: 1 is an ordinary round corner, 2 a full squircle, 1.5 about halfway — enough to read as craft rather than as an effect. It is a dial: circular corners are the right default for product, and any shape is fine as long as it is applied globally. Treat it as progressive enhancement; unsupported browsers ignore it and draw normal rounding, and nothing in the layout should depend on it.

## Line weights by job

| Role | Job | editorial | product | expressive |
|---|---|---|---|---|
| `hairline.chrome` | A divider inside one object — between groups in a toolbar, rows in a menu | 0.5px | 1px, `border.divider` | 1px |
| `hairline.object` | The edge of an object — a card, an input, a disclosure | 1px | 1px, `border.default` | 1–2px |
| `rule.emphasis` | A deliberate mark — a quote bar, a focus ring, an active tab | 2px | 2px | 3–4px |

`0.5px` renders as a true hairline on high-density screens and rounds up to 1px on 1× screens, so it degrades to the next weight rather than disappearing. Where chrome and object share a weight, the divider must step down in colour, so the internal line never matches the edge.

A vertical divider spans the content, not the padding: a 24px line in a 40px row, centred.

```css
.divider-v { inline-size: var(--hairline-chrome); block-size: 24px; align-self: center; background: var(--border-divider); }
```

Two resets that cause visible bugs when missed:

- An `<hr>` carries a UA border. Give it `border: 0` before a `background` and `block-size`, or it draws the browser's line and yours a few pixels apart.
- A divider that is rhythm rather than structure gets `aria-hidden`; an `<hr>` announces itself as a separator.

On translucent or unknown backdrops, every line uses `border.layered`. A solid border on glass doesn't participate in what's behind it and reads as a frame pasted on top — `color-and-theming` owns its value, `surfaces-and-depth` the material it sits on.

## The z-index ladder per preset

| Role | editorial | product | expressive | Holds |
|---|---|---|---|---|
| `z.skip-link` | 100 | 100 | 100 | Above everything |
| `z.toast` (proposed) | — | 70 | — | Toasts, above a modal so a save confirmation is never hidden |
| `z.overlay` | 60 | 60 | 60 | Modals, sheets, once-a-session overlays |
| `z.nav` | 50 | 50 | 50 | Fixed navigation, the app shell's header |
| `z.dismiss` | 40 | 40 | 40 | Tap-outside catchers for the navigation's menus and sheets |
| `z.popover` | 20 | 20 | 20 | Menus, hover cards, dropdowns |
| `z.raised` | 10 | 10 | 10 | A hovered or focused item |
| `z.below` | −10 | −10 | −10 | A highlight behind its siblings, inside `isolation: isolate` |

Ordered by permanence, gaps of ten. A stacked modal (a confirm over a dialog) doesn't need a new rung: render it later in the same portal and it stacks by document order.

**Portals make the ladder global.** A menu rendered inside a card is trapped by every stacking context above it, whatever its number. Overlays, menus that must escape a scroll container, and toasts render into a root-level portal, where the ladder is the only thing that decides.

### The two pairs

```html
<!-- Catcher above the page, below the menu it dismisses. -->
<div class="catcher" style="position: fixed; inset: 0; z-index: var(--z-dismiss)" aria-hidden="true"></div>
<div class="menu" style="position: relative; z-index: var(--z-nav)">…</div>
```

A catcher on `z.nav` or above eats the menu's own clicks, and the menu appears to ignore every tap. A content popover lives on `z.popover`, below `z.dismiss`, so it can't borrow the navigation's catcher: render its own catcher in the same portal, immediately before the popover, and the two stack by document order. The skip link on `z.skip-link` sits above any `z.overlay`, so a keyboard user who tabs during a splash or a modal still reaches it.

## Stacking-context techniques

**Negative z needs an isolated parent.** A highlight that slides behind a row of items but in front of their container's background: `z-index: -10` alone drops it behind the container itself. `isolation: isolate` on the container scopes it.

**A lift on hover needs one on focus too.** An item that rises to `z.raised` on hover so its shadow isn't clipped by its neighbour needs the same on `:focus-within`, or keyboard focus shows a clipped item.

**A full-width strip passes clicks through.** A fixed bar that spans the viewport for centring takes `pointer-events: none`, and its content `pointer-events: auto` — otherwise an invisible strip swallows every click along the bottom of the page.

**Containing blocks.** A `transform`, `filter`, `backdrop-filter`, `perspective`, `contain: paint` or `will-change: transform` on an ancestor makes it the containing block for `position: fixed` descendants. The symptom is a full-screen overlay that renders the size of its parent strip, or a fixed header that scrolls away. The bug is baffling from the inside and obvious once you check every ancestor for those properties — do that before changing a z-index.
