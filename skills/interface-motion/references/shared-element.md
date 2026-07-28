# The shared-element highlight

The signature interaction of this system. One highlight rectangle and one tooltip exist per container; they animate position and size to whichever child is hovered or focused.

## The problem it solves

The obvious implementation of a hover highlight is a background on each item:

```tsx
// The flicker version
<a className="transition-colors hover:bg-highlight">
```

Move the pointer quickly across five icons and you get five overlapping fades — one element brightening while its neighbour dims. There's no sense of a single object; it reads as a stutter. Worse, the fades have to be short (or the trail lags badly), which means they can't be smooth.

A shared element cannot flicker, because there is only one of it. It's the same trick as a physical selector knob: the knob doesn't fade out here and fade in there, it *travels*.

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

### `offsetLeft` / `offsetTop`, not `getBoundingClientRect()`

Offsets are measured relative to the nearest positioned ancestor — which is exactly the coordinate space the absolutely-positioned highlight lives in. No scroll compensation, no container-origin subtraction, and cheaper to read.

`getBoundingClientRect()` returns viewport coordinates. You'd have to subtract the container's own rect, and the result breaks the moment the page scrolls between the measurement and the render.

### `initial={false}`

Without it, Motion animates from the element's declared origin on mount — the highlight flies in from the top-left corner on first paint. `initial={false}` means "start at whatever `animate` currently says," which for a persistent re-targeting element is always what you want.

### `isolate` on the container, `-z-10` on the highlight

The highlight must be *behind* the icons but *in front of* the container's own background. `-z-10` alone would drop it behind the container. `isolate` creates a stacking context on the container, so `-z-10` is scoped inside it — the highlight can't escape below its parent's background.

### `pointer-events-none`

The highlight sits under the pointer by definition. Without this it intercepts `mouseenter` from the item it's highlighting and the whole thing oscillates.

### `onFocus` alongside `onMouseEnter`

Keyboard users get the same feedback. This is nearly free and it's the difference between the highlight being an interaction affordance and being a mouse decoration. Pair with `onBlur` where the list can lose focus without the pointer leaving.

### `onMouseLeave` on the *container*, not the items

One handler that clears the state when the pointer leaves the whole group. Per-item `onMouseLeave` fires as you cross between items and would blank the highlight in the gaps.

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

The two-layer structure is the trick. The outer `m.div` animates `x` to the item's **centre**; the inner div is statically `-translate-x-1/2`. That way the animated value is a plain centre coordinate and the centring is a static CSS transform — if you combined them, you'd be animating `calc(centre - 50%)` and Motion would have to interpolate a mixed-unit expression.

`bottom-full mb-2` places it above the container regardless of the container's height. Flip to `top-full mt-2` when the container is itself a dropdown, so the tooltip doesn't overlay the thing that opened it.

`aria-hidden` is right here: every item already carries an `aria-label` with the same text, so announcing the tooltip would duplicate it.

## The vertical list variant

For a list of rows rather than a row of icons, only the container class changes — items carry the padding so the bar is the same box everywhere, and a negative horizontal margin lets the bar bleed slightly past the text column while the text stays aligned to it:

```tsx
<HighlightList
  className="reveal -mx-3 flex flex-col text-[14px] leading-[1.55]"
  itemClassName="group relative flex gap-10 px-3 py-2.5"
  items={…}
/>
```

`-mx-3` against `px-3` on each item: the bar extends 12px past the measure on both sides, the text sits exactly on it. Without the negative margin you'd either inset the text or clip the bar.

Note the bar uses `bg-gray-100` here rather than `bg-highlight` — in a list on the page surface, the subtle-surface token is right; in floating glass chrome, the elevated token is. Both are one token lookup.

## When the shared element is the wrong choice

- **A single element with no siblings.** Just use a hover background.
- **Items that reflow while hovered** (a list that filters as you type). The measured rect goes stale; you'd need a `ResizeObserver` and it stops being simple.
- **Items in different scroll containers.** The offset space isn't shared.
- **A grid where the pointer moves diagonally.** The highlight travels through cells it never visited, which reads oddly. Works fine for a single row or a single column.

## Interaction with active state

When an item can also be *active* (the current route, say), the two states have to not fight. The pattern used here: the active item shows a static background, and it drops that background while the dock is hovered so the sliding highlight owns the surface:

```tsx
isActive
  ? `text-gray-1000 ${dockHover ? "" : "bg-highlight shadow-[0_2px_2px_rgba(0,0,0,0.04)]"}`
  : "text-gray-600 hover:text-gray-1000"
```

Two highlights visible at once — a static one and a sliding one — makes it ambiguous which is the selection. Ceding the surface to the pointer while the pointer is present resolves it, and the active item keeps its text colour throughout so you never fully lose track of where you are.
