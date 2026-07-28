# Scroll and performance

## The one scroll shape

Every scroll-driven behaviour in the system uses the same three-part structure: a `ticking` flag, one `requestAnimationFrame`, and a `passive` listener.

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

**`passive: true`** tells the browser the handler will never call `preventDefault()`, so it can begin scrolling without waiting for your JavaScript to run. Without it, every scroll event blocks the scroll until the handler returns — the single most common cause of scroll jank.

**The `ticking` flag** collapses a burst of scroll events into one measurement per frame. Scroll can fire many times per frame on a high-resolution trackpad; without the flag you queue that many rAF callbacks and do the layout reads repeatedly for one painted frame.

**`update()` before the listener** so the initial state is correct on a page loaded already scrolled (a deep link with a hash, a restored scroll position).

**`resize` shares the handler** — a viewport change invalidates the same measurements a scroll does, and it's the same work.

Do not use `throttle`/`debounce` from a utility library here. A time-based throttle is either faster than the frame rate (wasted work) or slower (dropped frames). rAF is exactly frame-aligned by construction.

## Hysteresis

Any behaviour that toggles on scroll *direction* needs a dead zone, or a 1px jitter — from a trackpad, a rubber-band bounce, or your own state change altering layout — flips it forever.

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

Three things at once:

- **6px of movement required** in either direction before the state flips. Below that, nothing happens — which is what kills the oscillation.
- **A 24px zone at the top** where the element is always in its default state. Landing at the top of a page should always look the same, regardless of how you got there.
- **A bottom zone** using `scrollHeight - 2`. The `- 2` absorbs subpixel rounding in the height calculation; an exact comparison intermittently fails on fractional device pixel ratios.

The top and bottom zones are absolute overrides checked *first*, so they beat the direction logic. Otherwise a small upward scroll near the bottom of the page could leave a collapsed dock sitting over the footer.

## Never hide an affordance where it can't come back

```ts
// Only collapse where a cursor can bring it back: on a touch screen there is
// no hover, so a shrunk dock would strand the pages.
if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
```

The dock collapses on scroll-down and expands on hover. On a touch device the expand path doesn't exist, so the collapse must not happen either — otherwise scrolling down permanently removes the navigation.

Bailing out of the effect entirely (rather than branching inside it) also means no scroll listener is attached on touch devices at all.

This generalises to every progressive-disclosure pattern: **the capability check belongs at the point where you decide to hide something, not at the point where you reveal it.** And a touch device needs its own presentation — see the layout-and-hierarchy skill on adaptive presentations.

Related media queries worth knowing: `(hover: hover)`, `(pointer: fine)` vs `(pointer: coarse)`, `(any-hover: hover)`. Use `hover` **and** `pointer: fine` together — some touch devices report `any-hover: hover` because a stylus or mouse *could* be attached.

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

### Why a reading line, not an IntersectionObserver

An `IntersectionObserver` tells you *whether* an element is visible, which is the wrong question — several sections are visible at once, and the answer changes with element height. A single reading line answers the actual question: **which heading did I most recently pass?**

The loop walks sections in document order and takes the last one whose top has crossed the line. `break` on the first one that hasn't, since the list is ordered — no need to check the rest.

### The bottom clamp

Without it, a short final section can never become active: you hit the end of the page before its heading crosses the reading line, so the TOC marks the second-to-last section while you're reading the last one. The clamp forces the final id at the bottom of the page.

### Matching `scroll-mt`

```tsx
const ANCHOR = "scroll-mt-28";   // 112px — matched to READING_LINE = 120
```

Every heading carries `scroll-mt-28`, so a jump lands it 112px below the viewport top — just above the 120px reading line. Without this, clicking a TOC row scrolls the heading to y=0, which is *above* the line, so the section you just jumped to isn't the active one and the TOC highlights the previous section. A confusing bug with a one-class fix.

Keep the two numbers within ~10px of each other, with `scroll-mt` slightly smaller.

### Deep links without the router

```tsx
el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
window.history.replaceState(null, "", `#${id}`);
```

`replaceState` rather than router navigation. A router hash change would trigger the app's own navigation scroll effect, which cuts the smooth scroll short mid-flight. This keeps the URL copyable and deep-linkable without a second scroll fighting the first.

### Ids as an effect dependency

```ts
const key = ids.join("|");
useEffect(() => { … }, [key]);
```

The ids arrive as a fresh array every render, so `[ids]` re-runs the effect on every render — tearing down and rebuilding the scroll listener continuously. Joining to a string makes the dependency value-based. (`useMemo` on the caller's side works too; the join is more robust because it doesn't depend on the caller getting it right.)

## Bundle discipline with Motion

```tsx
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

<LazyMotion features={domAnimation} strict>
  <m.div … />
</LazyMotion>
```

- `motion.div` pulls the entire feature set in at import time.
- `m.div` is a minimal component with no features bundled.
- `LazyMotion features={domAnimation}` loads just the DOM animation bundle — no layout animations, no drag, no scroll-linked values.
- `strict` throws if a `motion.*` component appears inside, which is what stops the saving from silently regressing later.

If you need layout animations, `domMax` is the larger bundle. Prefer scoping a `domMax` island to the one component that needs it rather than raising the whole app.

## Compositor properties

Animate `transform` and `opacity`. They're handled on the compositor thread and don't invalidate layout.

`width`, `height`, `top`, `left`, `margin`, `padding` trigger layout on every frame — for the animated element and potentially its siblings.

The shared highlight animates `width` and `height` and is fine, because it's a single absolutely-positioned element with `pointer-events-none` outside the document flow: nothing reflows around it. That's the shape of a justified exception. If you can't articulate why layout is cheap for a particular element, use `transform: scale()` instead.

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

Grid track sizes are animatable, and `0fr` collapses the track completely — so the region animates from its natural content width to zero without you ever measuring it. `min-w-0` on the child is required (flex children default to `min-width: auto` and refuse to shrink below their content), and `overflow-hidden` clips during the collapse.

This is the correct answer to "animate to auto height/width," which is otherwise a measure-and-set-pixels problem. Same technique works with `grid-template-rows` for vertical collapse.

### `backdrop-filter` and transforms don't mix

A transform on an ancestor creates a new containing block and weakens or breaks `backdrop-filter` in its subtree — the blur samples the wrong backdrop, or samples nothing.

The fix is structural: the animating wrapper and the glass surface must be different elements.

```tsx
<DropMenu open={open}>            {/* animates scale + y */}
  <ul className="glass-panel …">  {/* carries the blur, never transformed */}
```

Where the panel's own animation is unavoidable, compensate by carrying more of the effect in the tint and less in the blur — `glass-panel` sits at 97% opacity precisely because its blur is compromised while it animates.

## Timers

```ts
const closeTimer = useRef<number | null>(null);

// Clear on unmount.
useEffect(() => () => void (closeTimer.current && clearTimeout(closeTimer.current)), []);

// And on navigation, where the component may survive but the state is stale.
useEffect(() => setConfigOpen(false), [pathname]);
```

Any `setTimeout` driving UI state needs both. The unmount cleanup prevents a state update on an unmounted component; the navigation reset prevents a menu opened on the previous page from reappearing 100ms into the new one.
