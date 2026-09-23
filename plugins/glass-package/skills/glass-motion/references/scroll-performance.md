# Scroll and performance

## The one scroll shape

Every scroll-driven behaviour has three parts: a `ticking` flag, one `requestAnimationFrame`, and a `passive` listener.

```ts
useEffect(() => {
  let ticking = false;

  const update = () => {
    ticking = false;
    /* read layout, set state */
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update();                                                  // measure once on mount
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}, [deps]);
```

- **`passive: true`** promises the handler never calls `preventDefault()`, so scrolling never waits on your JavaScript; its absence is the most common cause of scroll jank.
- **The `ticking` flag**: a high-resolution trackpad fires many scroll events per frame, and without it each queues a rAF callback that repeats the layout reads for one painted frame.
- **`update()` before the listener** makes the initial state correct on a page loaded already scrolled (a hash deep link, a restored position).
- **`resize` shares the handler**: a viewport change invalidates the same measurements.

Don't use a library `throttle`/`debounce` here. A time-based throttle is either faster than the frame rate (wasted work) or slower (dropped frames); rAF is frame-aligned by construction.

## Hysteresis

Anything that toggles on scroll *direction* needs a dead zone, or a 1px jitter — from a trackpad, a rubber-band bounce, or your own state change altering layout — flips it forever.

```ts
const update = () => {
  const y = window.scrollY;
  const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;

  if (y < 24 || atBottom) setShrunk(false);   // always expanded at either end
  else if (y > last + 6) setShrunk(true);     // 6px of downward intent
  else if (y < last - 6) setShrunk(false);    // 6px of upward intent
  last = y;
  ticking = false;
};
```

- **6px of movement** either way before the state flips; below that nothing happens, which kills the oscillation.
- **A 24px zone at the top** where the element is always in its default state, so landing at the top of a page always looks the same.
- **A bottom zone** at `scrollHeight - 2`. The `- 2` absorbs subpixel rounding; an exact comparison intermittently fails on fractional device pixel ratios.

The end zones are checked *first*, so they beat the direction logic; otherwise a small upward scroll near the bottom could leave a collapsed dock over the footer.

## Never hide an affordance where it can't come back

```ts
// Only collapse where a cursor can bring it back: on a touch screen there is
// no hover, so a shrunk dock would strand the pages.
if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
```

Touch has no hover to expand the dock, so it mustn't collapse there, or scrolling down removes the navigation for good. Bailing out of the effect, rather than branching inside it, also attaches no scroll listener on touch.

For every progressive-disclosure pattern, **the capability check belongs where you decide to hide something, not where you reveal it** — and touch needs its own presentation (see the glass-layout skill on adaptive presentations).

Use `hover` **and** `pointer: fine` together, not `(any-hover: hover)`: some touch devices report `any-hover: hover` because a stylus or mouse *could* be attached. (The related queries: `(hover: hover)`, `(pointer: fine)` vs `(pointer: coarse)`.)

## Scroll spy

Tracking which section the reader is in, for a table of contents.

```ts
const READING_LINE = 120;   // px below the viewport top

const update = () => {
  let current = list[0];
  for (const id of list) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top > READING_LINE) break;
    current = id;
  }
  const atBottom =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  if (atBottom) current = list[list.length - 1];

  setActive((prev) => (prev === current ? prev : current));
};
```

**Why a reading line, not an IntersectionObserver.** An `IntersectionObserver` answers *whether* an element is visible, the wrong question when several sections are visible at once. A reading line answers the real one — **which heading did I most recently pass?** — by taking the last section in document order whose top has crossed it, and `break`ing at the first that hasn't.

**The bottom clamp.** Without it a short final section can never become active: the page ends before its heading crosses the line, so the TOC marks the second-to-last section while you read the last. The clamp forces the final id at the bottom.

### Matching `scroll-mt`

```tsx
const ANCHOR = "scroll-mt-28";   // 112px — matched to READING_LINE = 120
```

Every heading carries `scroll-mt-28`, so a jump lands it 112px below the viewport top, just above the 120px line. Without it a TOC click puts the heading at y=0, *above* the line, and the TOC highlights the previous section: a confusing bug, a one-class fix. Keep the two within ~10px, `scroll-mt` slightly smaller.

### Deep links without the router

```tsx
el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
window.history.replaceState(null, "", `#${id}`);
```

`replaceState`, not router navigation: a router hash change triggers the app's own navigation scroll, which cuts the smooth scroll short. The URL stays copyable without a second scroll fighting the first.

### Ids as an effect dependency

```ts
const key = ids.join("|");
useEffect(() => { … }, [key]);
```

The ids arrive as a fresh array each render, so `[ids]` would rebuild the scroll listener every render; joining to a string makes the dependency value-based. (`useMemo` in the caller works too, but the join doesn't depend on the caller getting it right.)

## Bundle discipline with Motion

```tsx
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

<LazyMotion features={domAnimation} strict>
  <m.div … />
</LazyMotion>
```

`m.div` bundles no features, and `LazyMotion features={domAnimation}` loads only the DOM animation bundle (no layout animations, no drag, no scroll-linked values); `strict` throws on any `motion.*` component inside, so the saving can't silently regress. Layout animations need the larger `domMax`: scope a `domMax` island to the one component that needs it rather than raising the whole app.

## Compositor properties

Animate `transform` and `opacity`; `width`, `height`, `top`, `left`, `margin`, `padding` trigger layout every frame, for the element and potentially its siblings. The shared highlight's `width` and `height` are the justified exception — one absolutely-positioned element with `pointer-events-none`, outside the flow, so nothing reflows around it. If you can't say why layout is cheap for an element, use `transform: scale()`.

### The `1fr` ↔ `0fr` grid trick

Collapsing a region to zero width without animating `width`:

```tsx
<li
  className="grid transition-[grid-template-columns] duration-300 ease-geist motion-reduce:transition-none"
  style={{ gridTemplateColumns: expanded ? "1fr" : "0fr" }}
>
  <div className="flex min-w-0 items-center overflow-hidden">{children}</div>
</li>
```

Grid track sizes are animatable and `0fr` collapses the track completely, so the region animates from its natural width to zero unmeasured. `min-w-0` on the child is required (flex children default to `min-width: auto` and won't shrink below their content); `overflow-hidden` clips during the collapse. This answers "animate to auto height/width" without measuring pixels; `grid-template-rows` does it vertically.

### `backdrop-filter` and transforms don't mix

A transform on an ancestor creates a new containing block and weakens or breaks `backdrop-filter` in its subtree: the blur samples the wrong backdrop, or nothing. The fix is structural — the animating wrapper and the glass surface are different elements.

```tsx
<DropMenu open={open}>            {/* animates scale + y */}
  <ul className="glass-panel …">  {/* carries the blur, never transformed */}
```

Where the panel itself must animate, carry more of the effect in the tint than the blur: `glass-panel` sits at 97% opacity because its blur is compromised while it animates.

## Timers

```ts
const closeTimer = useRef<number | null>(null);

// Clear on unmount.
useEffect(() => () => void (closeTimer.current && clearTimeout(closeTimer.current)), []);

// And on navigation, where the component may survive but the state is stale.
useEffect(() => setConfigOpen(false), [pathname]);
```

Any `setTimeout` driving UI state needs both: one prevents a state update on an unmounted component, the other a menu from the previous page reappearing 100ms into the new one.
