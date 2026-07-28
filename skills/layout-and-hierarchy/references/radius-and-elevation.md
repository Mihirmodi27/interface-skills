# Radius, corners, and stacking

## The nesting rule

**Inner radius = outer radius − the padding between them.**

This is geometry, not taste. Two concentric rounded rectangles share a centre of curvature only if their radii differ by exactly the gap between their edges. Get it wrong and the mismatch is immediately visible:

- **Inner radius too large** → the corners look pinched, and the inner element's curve crosses the outer one.
- **Inner radius too small** → the gap between them widens at the corners while staying constant along the edges.

Worked through the reference implementation's dock:

```
Dock:          rounded-2xl      (16px)   p-1  (4px padding)
  Icon button: rounded-[12px]   (12px)            16 − 4 = 12  ✓
    Avatar:    rounded-[10px]   (10px)   inset ~2px   12 − 2 = 10  ✓
```

Three levels, each derived. The avatar is `h-9 w-9` inside an `h-10 w-10` button — a 2px inset all round, so 10px.

Same for the mobile sheet:

```
Sheet:  rounded-2xl   (16px)   p-1.5 (6px)
  Row:  rounded-xl    (12px)          16 − 6 = 10, rounded up to 12
```

Rounded to the nearest step on the ladder rather than using a literal 10px — a 2px discrepancy on a 44px-tall row is below the threshold of visibility, and keeping to the ladder is worth more than the exactness. Below ~8px the rule matters less; above it, follow it.

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

Two observations:

**Radius scales with size, not with importance.** A 40px icon button gets 12px; a 300px panel gets 16px. Not proportional — the ratio drops as things get larger, because a large element with a proportional radius starts to read as a lozenge.

**`rounded-full` is only for things whose radius shouldn't be a decision** — a tag, a dot, a marker. Anything with content that has a top and a bottom gets a real radius.

## Continuous corners

```css
*, *::before, *::after {
  corner-shape: superellipse(1.5);
}
```

A standard CSS `border-radius` is a quarter-circle. Its curvature is constant along the arc and then drops abruptly to zero where it meets the straight edge — a second-derivative discontinuity. The eye picks that up as a slight hardness at the corner.

A superellipse varies curvature continuously into the edge. That's what Apple's icon shape is, and it's why an iOS icon looks softer than a CSS rectangle with the same radius.

`superellipse(k)` uses exponent 2^k:

| k | Exponent | Shape |
|---|---|---|
| 0 | 1 | Straight bevel |
| 1 | 2 | Normal circular corner |
| 1.5 | ~2.83 | About halfway to a squircle ← used here |
| 2 | 4 | Full iOS-style squircle |

1.5 rather than 2 because a full squircle is noticeable — at small sizes it starts to look like a slightly swollen rectangle. Halfway reads as "well-drawn corner" rather than as an effect.

Applied globally with `*`, including pseudo-elements. It's a single property with no layout implications, and unsupported browsers ignore it and get normal rounding. Genuinely free progressive enhancement — but keep it that way: nothing else in the layout should depend on it.

## Hairline weights

| Weight | Class | For |
|---|---|---|
| 0.5px | `border-[0.5px]`, `h-[0.5px]` | Chrome borders, dividers, glass edges |
| 1px | `border`, `ring-1`, `h-px` | Card borders, TOC markers |
| 2px | `border-l-2` | Quote rules, focus rings |

`0.5px` is a true sub-pixel hairline on retina and rounds up to 1px elsewhere — it degrades to the next weight up rather than disappearing.

The choice is about what the line is doing:

- **A divider inside an object** — separating two groups of icons within one dock: 0.5px. It's an internal articulation, not a boundary.
- **A border around an object** — defining where a card ends: 1px. It's a real edge.
- **A rule with editorial weight** — a blockquote's left rule: 2px. It's a mark, not a hairline.

Vertical dividers use `w-[0.5px]` with an explicit height and `self-center`:

```tsx
<span aria-hidden className="mx-0.5 h-6 w-[0.5px] self-center bg-gray-alpha-300" />
```

A 24px line in a 40px-tall row — the divider spans the icons, not the padding. `aria-hidden` because it's decoration.

And on translucent surfaces, use the alpha ramp. A solid `gray-400` border on glass doesn't participate in what's behind it and reads as a pasted-on frame.

## Elevation tiers

Elevation is covered in depth in the **color-and-theming** skill's `materials.md`. The structural summary:

| Tier | Layers | For |
|---|---|---|
| Chrome | 4 (inset + contact + 2 ambient) | Fixed docks, floating menus |
| Floating panel | 1 + ring | Hover cards, stacked cards |
| Transient | 1 | Tooltips |

**More layers as the element floats higher and persists longer.** A tooltip that exists for 300ms doesn't need a contact shadow; permanent chrome does.

And the pairing that matters here: elevated surfaces get a **hairline plus a shadow**, never one alone. The shadow says "above"; the hairline says "and here is exactly where it ends." Shadow alone leaves the edge mushy, especially in dark mode where the shadow has less contrast to work with.

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

Gaps of 10 so something can be inserted without renumbering. Ordered by **permanence**, not by importance: the more permanently an element is on screen, the higher it sits.

**The 40/50 pair is the one to get right.** A full-screen tap-outside catcher must be above the page (so it catches the click) and below the menu it dismisses (or it eats the menu's own clicks):

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

Folder cards rise out of a pocket on hover and would otherwise be clipped by the next folder in the grid. `focus-within:z-10` alongside `hover:` so keyboard focus gets the same lift.

## Stacking-context techniques

### `isolate` plus negative z

A highlight bar must be behind the icons but in front of the container's own background. `-z-10` alone drops it behind the container entirely. `isolate` creates a stacking context on the container, scoping the negative z inside it:

```tsx
<ul className="relative isolate flex items-center …">
  <m.div className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight" />
  {/* icons, in normal flow, above the bar */}
</ul>
```

### `pointer-events-none` on a strip, `auto` on the content

A fixed nav strip spans the viewport for centring but must not intercept clicks along its whole width:

```tsx
<nav aria-label="Primary"
     className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <MobileDock />   {/* each carries pointer-events-auto */}
  <DesktopDock />
</nav>
```

Without this, a 100%-wide invisible strip sits over the bottom 60px of the page and swallows every click there.

### The strip carries no transform

Worth stating explicitly because the bug is baffling when you hit it: **a transform on an ancestor makes it the containing block for `position: fixed` descendants.** The mobile nav sheet uses a full-bleed `w-screen` overlay; if the nav strip had a transform, that overlay would be trapped inside the strip's bounds instead of spanning the viewport.

Same class of problem as transforms weakening `backdrop-filter`. When something positioned or filtered behaves inexplicably, check every ancestor for `transform`, `filter`, `perspective`, `contain`, and `will-change`.

### `transform-origin` for menus

```tsx
const anchor = placement === "up" ? "origin-bottom" : "origin-top";
```

A menu that scales open must scale **from the edge its trigger is on**, or it appears to detach and drift. For a menu hanging off one side, use the corner: `origin-top-left`.
