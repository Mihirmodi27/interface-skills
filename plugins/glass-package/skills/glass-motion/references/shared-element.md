# The shared-element highlight

The signature interaction of this system: one highlight rectangle and one tooltip per container, animating position and size to whichever child is hovered or focused.

## The problem it solves

The obvious hover highlight is a background on each item:

```tsx
// The flicker version
<a className="transition-colors hover:bg-highlight">
```

Sweep the pointer across five icons and you get five overlapping fades, one brightening as its neighbour dims: a stutter, not an object — and they must be short or the trail lags, so they can't be smooth. A shared element can't flicker, because there's only one; like a selector knob, it *travels*.

## The implementation

```tsx
type Hover = { x: number; y: number; w: number; h: number; cx: number; label: string };

const [hovered, setHovered] = useState<Hover | null>(null);

const enter = (el: HTMLElement, label: string) =>
  setHovered({
    x: el.offsetLeft,
    y: el.offsetTop,
    w: el.offsetWidth,
    h: el.offsetHeight,
    cx: el.offsetLeft + el.offsetWidth / 2,  // centre, for the tooltip
    label,
  });
```

```tsx
<ul className="relative isolate flex items-center …" onMouseLeave={() => setHovered(null)}>

  {/* The highlight — behind the icons, inside its own stacking context */}
  <m.div
    aria-hidden
    className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[12px] bg-highlight"
    initial={false}
    animate={hovered
      ? { x: hovered.x, y: hovered.y, width: hovered.w, height: hovered.h, opacity: 1 }
      : { opacity: 0 }}
    transition={tween}
  />

  {items.map((item) => (
    <a
      key={item.label}
      onMouseEnter={(e) => enter(e.currentTarget, item.label)}
      onFocus={(e) => enter(e.currentTarget, item.label)}
      …
    />
  ))}
</ul>
```

## Six details that make it work

- **`offsetLeft` / `offsetTop`, not `getBoundingClientRect()`.** Offsets are relative to the nearest positioned ancestor, the highlight's own coordinate space, and cheaper to read. `getBoundingClientRect()` is in viewport coordinates: you'd subtract the container's rect, and it breaks if the page scrolls between measurement and render.
- **`initial={false}`** means "start at whatever `animate` says", always right for a persistent re-targeting element; without it the highlight flies in from the top-left on first paint.
- **`isolate` on the container, `-z-10` on the highlight.** The highlight must sit *behind* the icons but *in front of* the container's background. `-z-10` alone drops it behind the container; `isolate` makes the container a stacking context, so `-z-10` is scoped inside it.
- **`pointer-events-none`.** The highlight is under the pointer by definition; without this it intercepts `mouseenter` from the item it's highlighting, and the whole thing oscillates.
- **`onFocus` alongside `onMouseEnter`.** Keyboard users get the same feedback, nearly free: it makes the highlight an affordance, not a mouse decoration. Pair with `onBlur` where the list can lose focus without the pointer leaving.
- **`onMouseLeave` on the *container*, not the items.** One handler clears the state when the pointer leaves the group; per-item `onMouseLeave` fires between items and would blank the highlight in the gaps.

## The tooltip variant

Same state, same spring, one axis:

```tsx
<m.div
  aria-hidden
  className="pointer-events-none absolute bottom-full left-0 mb-2"
  initial={false}
  animate={hovered ? { x: hovered.cx, opacity: 1 } : { opacity: 0 }}
  transition={tween}
>
  <div className="-translate-x-1/2 whitespace-nowrap rounded-md bg-gray-1000 px-2 py-1
                  text-[11px] leading-none text-background-100
                  shadow-[0_4px_10px_-4px_rgba(0,0,0,0.3)]">
    {hovered?.label}
  </div>
</m.div>
```

The two layers are the trick. The outer `m.div` animates `x` to the item's **centre**; the inner div is statically `-translate-x-1/2`. The animated value stays a plain coordinate — combine them and Motion would have to interpolate a mixed-unit `calc(centre - 50%)`.

`bottom-full mb-2` places it above the container at any height; flip to `top-full mt-2` when the container is itself a dropdown, so the tooltip doesn't cover what opened it. It's `aria-hidden` because every item already carries an `aria-label` with the same text.

## The vertical list variant

For rows rather than icons only the container class changes: items carry the padding, so the bar is the same box everywhere, and a negative horizontal margin lets it bleed past the text column:

```tsx
<HighlightList
  className="reveal -mx-3 flex flex-col text-[14px] leading-[1.55]"
  itemClassName="group relative flex gap-10 px-3 py-2.5"
  items={…}
/>
```

`-mx-3` against `px-3` on each item: the bar extends 12px past the measure on both sides while the text sits exactly on it. Without the negative margin you'd inset the text or clip the bar.

Here the bar uses `bg-gray-100` rather than `bg-highlight`: in a list on the page surface the subtle-surface token is right; in floating glass chrome, the elevated one.

## When the shared element is the wrong choice

- **A single element with no siblings.** Just use a hover background.
- **Items that reflow while hovered** (a list that filters as you type). The measured rect goes stale; you'd need a `ResizeObserver`, and it stops being simple.
- **Items in different scroll containers.** The offset space isn't shared.
- **A grid where the pointer moves diagonally.** The highlight travels through cells it never visited. Fine for a single row or column.

## Interaction with active state

When an item can also be *active* (the current route), the states mustn't fight. Here the active item shows a static background and drops it while the dock is hovered, so the sliding highlight owns the surface:

```tsx
isActive
  ? `text-gray-1000 ${dockHover ? "" : "bg-highlight shadow-[0_2px_2px_rgba(0,0,0,0.04)]"}`
  : "text-gray-600 hover:text-gray-1000"
```

A static and a sliding highlight at once make the selection ambiguous; ceding the surface while the pointer is present resolves it, and the active item keeps its text colour so you never lose your place.

This pairs with icon fill (§13 of the SKILL.md): the *glyph* fills both when current and when hovered, and the chip disambiguates the two when both are on screen. Two signals, each doing half the job — don't make either carry both.

## Escalating to the GPU

Everything above is one small rectangle between measured boxes, which is why it's affordable. What broke that: a gallery with a masonry wall of ~100 tiles and a "roll" with one photo open above a filmstrip, the same photograph travelling between them. Three things break the DOM approach at once:

1. **Aspect ratios differ.** Consecutive photographs are 1:1 then 16:9; one `<img>` animated between the boxes distorts for the whole trip.
2. **The wall is expensive to re-lay-out.** Layout on 100 tiles is not a per-frame budget.
3. **The endpoints exist at different moments.** One rect is measurable only while the outgoing layout is rendered, the other only after the incoming one commits.

### The shape of the fix

One viewport-sized canvas above the gallery draws a single photo into an arbitrary screen rect, so the trip is four numbers in a uniform and costs no reflow at any size:

```ts
export type Rect = { x: number; y: number; width: number; height: number };

/** Straight-line interpolation. Equal-aspect endpoints keep their aspect throughout. */
export function lerpRect(a: Rect, b: Rect, t: number): Rect { /* … */ }
```

### The four rules that keep it honest

**Only the decorative element goes on the GPU.** The wall stays DOM, and the open photo is `alt=""` because its labels sit in the strip beside it. *Once the canvas owns something with semantics, or a hundred instances, you've traded accessibility and memory for a transition.*

**Failing returns `null`, never throws**, because an exception inside an effect takes the whole view down instead of falling back:

```ts
export function createPhotoStage(canvas: HTMLCanvasElement): PhotoStage | null {
  try {
    /* … */
    // A failed shader link only warns in some libraries; the throw lands on the
    // first draw. Check the artefact that proves setup completed.
    if (!program.uniformLocations) return null;
    /* … */
  } catch {
    return null; // No WebGL, or a context that can't be set up.
  }
}
```

`null` keeps the caller's `<img>`, also the path for reduced motion and a GPU that later drops the context: not a nicety, but what renders for everyone whose machine says no.

**Carry the reading position across.** Before the switch, find the tile nearest the viewport centre and open the other layout on *that* item, from *that* rect:

```ts
// Read while the OUTGOING layout is still rendered — from the layout store's
// synchronous subscriber, before React commits the incoming one.
export function centreFrame(): { id: string; rect: Rect } | null {
  const midX = window.innerWidth / 2, midY = window.innerHeight / 2;
  let best = null;
  for (const el of document.querySelectorAll<HTMLImageElement>("img[data-frame]")) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.bottom <= 0 || r.top >= window.innerHeight) continue;
    const d = Math.hypot(r.left + r.width / 2 - midX, r.top + r.height / 2 - midY);
    if (!best || d < best.d) best = { id: el.dataset.frame!, rect: r, d };
  }
  return best;
}
```

Leaving a wall at photo 60 for the top of a filmstrip is worse than no transition. Beyond galleries, **any layout switch should resume where the reader was, measured before the old layout unmounts.**

**Each end keeps its own shape.** One shared rect stretches one photograph to the other's box for the whole crossfade; interpolate two rects around a shared centre and each keeps its aspect through the linear lerp. The GPU path then matches the `<img>` fallback exactly: two absolutely-centred images, each at its own aspect, crossfading.

### Implementation notes that cost real time to find

**Mipmaps, or the photo shimmers.** A 2000px photo in a 355px tile samples one texel in five, so without a mip chain it aliases and shimmers as the rect moves sub-pixel. Use trilinear (`LINEAR_MIPMAP_LINEAR`) so crossing mip levels as the photo grows doesn't step.

**Fade the last pixel of the edge.** The rect's edges land on moving fractional pixels, and a binary in/out test snaps the boundary between columns, so the edge crawls. One `smoothstep` across a pixel's width holds it still — fading *alpha only* on a non-premultiplied context, or the edge darkens toward black instead of disappearing.

**Don't call `WEBGL_lose_context` on teardown.** It frees GPU memory slightly sooner and poisons the canvas for good: React reuses the node across a remount (StrictMode does on every mount), and the next context silently fails to compile its shaders. Drop the textures and references; the context goes with the element.
