# Radius, corners, and stacking

## The nesting rule

**Inner radius = outer radius − the padding between them.**

Geometry, not taste: concentric rounded rectangles share a centre of curvature only if their radii differ by exactly the gap between them.

- **Inner radius too large** → the corners look pinched, and the inner curve crosses the outer one.
- **Inner radius too small** → the gap widens at the corners while staying constant along the edges.

The reference implementation's dock:

```
Dock:          rounded-2xl      (16px)   p-1  (4px padding)
  Icon button: rounded-[12px]   (12px)            16 − 4 = 12  ✓
    Avatar:    rounded-[10px]   (10px)   inset ~2px   12 − 2 = 10  ✓
```

Three levels, each derived. The avatar is `h-9 w-9` inside an `h-10 w-10` button — a 2px inset all round, so 10px.

The mobile sheet:

```
Sheet:  rounded-2xl   (16px)   p-1.5 (6px)
  Row:  rounded-xl    (12px)          16 − 6 = 10, rounded up to 12
```

Rounded to the ladder, not a literal 10px: 2px on a 44px-tall row is invisible, and the ladder is worth more than exactness. Below ~8px the rule matters less; above it, follow it.

## The ladder

| Radius | Class | For |
|---|---|---|
| full | `rounded-full` | Pills, tags, dots, markers |
| 2px | — | The focus ring's own radius |
| 5px | `rounded-[5px]` | A lettermark box (tiny, so a small radius) |
| 6px | `rounded-md` | Tooltips, the skip link |
| 9px | `rounded-[9px]` | Small cards in a stack |
| 10px | `rounded-[10px]` | Avatar inside a button; a list highlight bar |
| 12px | `rounded-xl` / `rounded-[12px]` | Cards, hover panels, disclosures, icon buttons |
| 16px | `rounded-2xl` / `rounded-[16px]` | Outer containers — a dock, a sheet, a pocket |

**Radius scales with size, not importance.** A 40px icon button gets 12px; a 300px panel gets 16px. Not proportional — the ratio drops as things grow, because a large element with a proportional radius reads as a lozenge.

**`rounded-full` is only for things whose radius shouldn't be a decision** — a tag, a dot, a marker. Anything with content that has a top and a bottom gets a real radius.

## Continuous corners

```css
*, *::before, *::after {
  corner-shape: superellipse(1.5);
}
```

A `border-radius` quarter-circle's curvature drops abruptly to zero at the straight edge — a second-derivative discontinuity the eye reads as hardness. A superellipse varies curvature continuously into the edge; that's Apple's icon shape.

`superellipse(k)` uses exponent 2^k:

| k | Exponent | Shape |
|---|---|---|
| 0 | 1 | Straight bevel |
| 1 | 2 | Normal circular corner |
| 1.5 | ~2.83 | About halfway to a squircle ← used here |
| 2 | 4 | Full iOS-style squircle |

1.5 rather than 2 because a full squircle is noticeable — at small sizes it looks like a slightly swollen rectangle. Halfway reads as a well-drawn corner rather than an effect.

Applied globally with `*`, pseudo-elements included: one property, no layout implications, normal rounding where unsupported. Keep it free progressive enhancement — nothing else should depend on it.

## Hairline weights

| Weight | Class | For |
|---|---|---|
| 0.5px | `border-[0.5px]`, `h-[0.5px]` | Chrome borders, dividers, glass edges |
| 1px | `border`, `ring-1`, `h-px` | Card borders, TOC markers |
| 2px | `border-l-2` | Quote rules, focus rings |

The choice is about what the line is doing:

- **A divider inside an object** — two groups of icons within one dock: 0.5px. An internal articulation, not a boundary.
- **A border around an object** — where a card ends: 1px. A real edge.
- **A rule with editorial weight** — a blockquote's left rule: 2px. A mark, not a hairline.

Vertical dividers use `w-[0.5px]` with an explicit height and `self-center`:

```tsx
<span aria-hidden className="mx-0.5 h-6 w-[0.5px] self-center bg-gray-alpha-300" />
```

A 24px line in a 40px-tall row: the divider spans the icons, not the padding. `aria-hidden` because it's decoration.

On glass, a solid `gray-400` border reads as a pasted-on frame; use the alpha ramp.

## Elevation tiers

Covered in depth in the **glass-and-depth** skill (`references/depth-cues.md`), including the four-layer stack and why dark mode needs a structurally different shadow. For layout:

| Tier | Layers | For |
|---|---|---|
| Chrome | 4 (inset + contact + 2 ambient) | Fixed docks, floating menus |
| Floating panel | 1 + ring | Hover cards, stacked cards |
| Transient | 1 | Tooltips |

**More layers as the element floats higher and persists longer.** A tooltip that exists for 300ms doesn't need a contact shadow; permanent chrome does.

Elevated surfaces get a **hairline plus a shadow**, never one alone: the shadow says "above", the hairline "and exactly here it ends." Shadow alone leaves the edge mushy, especially in dark mode, where it has less contrast.

## The z-index ladder

| z | Layer | Note |
|---|---|---|
| 100 | Skip link | Must beat everything, including modals |
| 50 | Fixed navigation | The highest permanent chrome |
| 40 | Tap-outside catcher | Under the nav, over the page |
| 30 | Pocket front | Above the cards it contains |
| 20 | Hover cards, dropdowns | Above page content, below nav |
| 10 | A hovered item | Lifts above its siblings |
| −10 | Sliding highlight | Behind content, inside `isolate` |

Gaps of 10 leave room to insert; order is by **permanence**, not importance. **The 40/50 pair** (§8 of the skill) in code:

```tsx
{open && (
  <div aria-hidden onClick={() => setOpen(false)}
       className="pointer-events-auto fixed inset-0 z-40 sm:hidden" />
)}
<div className="pointer-events-auto relative z-50 sm:hidden">
  {/* the menu */}
</div>
```

**`z-index: 10` for a hover lift:**

```tsx
<Link className="group relative block transition-[z-index] hover:z-10 focus-within:z-10">
```

Folder cards rising out of a pocket would otherwise be clipped by the next folder; `focus-within:z-10` gives keyboard focus the same lift.

## Stacking-context techniques

### `isolate` plus negative z

`-z-10` alone drops a highlight bar behind the container entirely; `isolate` makes the container a stacking context, scoping the negative z inside it:

```tsx
<ul className="relative isolate flex items-center …">
  <m.div className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight" />
  {/* icons, in normal flow, above the bar */}
</ul>
```

### `pointer-events-none` on a strip, `auto` on the content

The strip spans the viewport for centring but mustn't intercept clicks:

```tsx
<nav aria-label="Primary"
     className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <MobileDock />   {/* each carries pointer-events-auto */}
  <DesktopDock />
</nav>
```

Otherwise a 100%-wide invisible strip swallows every click in the bottom 60px of the page.

### The strip carries no transform

A baffling bug: **a transform on an ancestor makes it the containing block for `position: fixed` descendants**, so the mobile sheet's full-bleed `w-screen` overlay would be trapped inside the strip instead of spanning the viewport.

Same class as transforms weakening `backdrop-filter`: when something positioned or filtered misbehaves, check every ancestor for `transform`, `filter`, `perspective`, `contain`, and `will-change`.

### `transform-origin` for menus

```tsx
const anchor = placement === "up" ? "origin-bottom" : "origin-top";
```

A menu scales **from its trigger's edge**, or it seems to detach and drift; off one side, use the corner: `origin-top-left`.
