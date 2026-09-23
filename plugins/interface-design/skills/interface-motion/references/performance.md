# Performance

## The one scroll shape

Every scroll-driven behaviour uses one structure. At its smallest, with `update` clearing the flag:

```ts
let ticking = false;
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
window.addEventListener("scroll", onScroll, { passive: true });
```

In full, with teardown:

```ts
function onScrollFrame(update: () => void): () => void {
  let ticking = false;
  const run = () => { ticking = false; update(); };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  update();                                                   // correct on a page loaded already scrolled
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);                // a resize invalidates the same measurements
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
```

- **`passive: true`**, as the handler never calls `preventDefault()`; without it every scroll event blocks on your JavaScript, the commonest cause of scroll jank.
- **The `ticking` flag** makes a burst of events (a high-resolution trackpad fires many per frame) one measurement per painted frame.
- **No `throttle` or `debounce`.** A time-based throttle is faster than the frame rate, wasting work, or slower, dropping frames.
- **One listener per behaviour**, torn down on unmount. In a component, make the effect's dependency a value, not a fresh array — `ids.join("|")` — or the listener rebuilds every render.

A purely visual effect can use CSS scroll-driven animations (`animation-timeline: scroll()` or `view()`), off the main thread with no listener, behind `@supports (animation-timeline: scroll())` with a static fallback and inside `prefers-reduced-motion: no-preference`.

## Hysteresis

Anything toggled by scroll *direction* needs a dead zone, or a pixel of jitter — trackpad noise, a rubber-band bounce, your own layout change — flips it for ever.

```ts
const update = () => {
  const y = window.scrollY;
  const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
  if (y < 24 || atBottom) setCollapsed(false);   // always expanded at either end — checked first
  else if (y > last + 6) setCollapsed(true);     // 6px of downward intent
  else if (y < last - 6) setCollapsed(false);    // 6px of upward intent
  last = y;
};
```

The end zones come first, or a small upward scroll near the foot leaves a collapsed bar over the footer. The `- 2` absorbs sub-pixel rounding on fractional device pixel ratios.

## Never hide an affordance where it can't come back

```ts
if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;   // before attaching anything
```

Check capability where you decide to *hide*, and bail out early so no listener attaches on touch at all. Use `hover` and `pointer: fine` together: some touch devices report `any-hover: hover` because a stylus *could* be attached. Touch then needs its own presentation (`layout-and-hierarchy` covers forks).

## Scroll spies

Tracking the section being read, for a contents rail:

```ts
const READING_LINE = 120;   // px below the viewport top
const update = () => {
  let current = ids[0];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top > READING_LINE) break;   // document order: stop at the first not yet passed
    current = id;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = ids.at(-1)!;
  setActive((prev) => (prev === current ? prev : current));
};
```

- **A reading line, not an `IntersectionObserver`**, because several sections are visible at once and the question is *which heading did I last pass?*
- **The bottom clamp.** A short final section never crosses the line before the page ends, so the rail would mark the one before it.
- **Match `scroll-margin-top` to the line**, a little smaller, within ~10px. A contents link that scrolls its heading to y = 0 puts it above the line, and the rail highlights the previous section.
- **`history.replaceState` for the hash**, not router navigation, which runs the app's own scroll handling and cuts the smooth scroll short.

## What to animate

`width`, `height`, `top`, `left`, `margin` and `padding` lay out on every frame, for the element and possibly its siblings; `transform` and `opacity` don't.

**Name every property.** `transition: all` picks up properties you never intended, including layout ones a parent adds later. The explicit list — `transition: color, background-color, translate` — also makes a hover's *leave* predictable: exactly the listed properties transition out.

**A justified exception** looks like the shared highlight: one absolutely positioned, `pointer-events: none` element outside the flow, whose size change reflows nothing. If you can't say that about an element, scale it instead.

**Animating to auto** without measuring:

```css
.region { display: grid; grid-template-rows: 0fr; transition: grid-template-rows <duration.overlay> <ease.standard>; }
.region[data-open] { grid-template-rows: 1fr; }
.region > * { min-height: 0; overflow: hidden; }
```

The same works on columns with `min-width: 0`. Where supported, `interpolate-size: allow-keywords` lets `height: auto` transition directly.

**Transforms and `backdrop-filter`.** A transform on an ancestor creates a new containing block and weakens or breaks the blur beneath it, so the moving wrapper and the translucent surface are different elements; `surfaces-and-depth` covers how much the tint carries while it animates.

**`will-change`** only on an element about to animate, removed after; left on everything, it pins memory for layers that never move.

## Escalating to the GPU

Some shared-element trips can't be done in the DOM: the ends differ in aspect ratio, so one image distorts all the way, or the view is too large to re-lay-out per frame. Then draw one element on a canvas above the view and animate four numbers — a rectangle — in a uniform.

- **One decorative element, never the view.** A hundred tiles as textures costs hundreds of megabytes, and the tiles carry keyboard and screen-reader semantics a canvas can't. The drawn element has none of its own (`alt=""`, labels elsewhere).
- **Setup returns `null`, never throws.** Inside an effect, an exception takes the view down instead of falling back. Check for the artefact that proves setup completed — a linked program — rather than trusting the constructor.
- **`null` is the ordinary path:** the caller keeps its `<img>`, which also serves reduced motion, no WebGL, and a context lost later.
- **Mipmaps, trilinear filtering**, or a large image drawn small shimmers as it moves sub-pixel.
- **Soften the last pixel of the edge**, or a rectangle on fractional pixels crawls column by column. Fade alpha only, on a non-premultiplied context.
- **Don't force-lose the context on teardown.** Frameworks reuse the canvas node across remounts, and a force-lost context silently poisons it.

## Keeping the motion code small

- **Motion:** `LazyMotion` with `domAnimation` and the `m` component; `strict` makes a stray full `motion.*` import a build error. Scope a `domMax` island to the one component that needs layout animations.
- **GSAP:** register only the plugins in use; import `Flip` or `ScrollTrigger` where they're used, not in a global setup file.
- **React Spring:** import from `@react-spring/web` only.
- **CSS first.** A hover, a colour change, a reveal and most presence animations need no library; reach for one when something re-targets, is dragged, or must exit after unmounting.

