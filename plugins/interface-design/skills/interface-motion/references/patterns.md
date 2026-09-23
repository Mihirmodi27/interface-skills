# Patterns

Code uses role placeholders (`<duration.state>`) and generic custom properties; swap in the names `DESIGN.md` maps them to.

## The shared highlight

One highlight per group, animating its position and size to whichever item is hovered or focused. It never remounts.

```tsx
// Motion. The same shape works with GSAP quickTo or React Spring's useSpring.
const [hover, setHover] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
const enter = (el: HTMLElement) =>
  setHover({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });

<ul className="group-shell" onPointerLeave={() => setHover(null)}>  {/* position: relative; isolation: isolate */}
  <m.div
    aria-hidden
    className="highlight"                                       /* absolute; z-index: -1; pointer-events: none */
    initial={false}
    animate={hover ? { x: hover.x, y: hover.y, width: hover.w, height: hover.h, opacity: 1 } : { opacity: 0 }}
    transition={reduce ? { duration: <duration.state> } : { ...<spring.snappy>, opacity: { duration: <duration.micro> } }}
  />
  {items.map((it) => (
    <a key={it.id} onPointerEnter={(e) => enter(e.currentTarget)} onFocus={(e) => enter(e.currentTarget)} … />
  ))}
</ul>
```

Six details, each a bug without it:

- **`initial={false}`** (outside Motion, set the first position with no transition), or the highlight flies in from the corner on first paint.
- **Offsets, not `getBoundingClientRect()`.** `offsetLeft` / `offsetTop` are relative to the positioned parent the highlight lives in; viewport rectangles need subtraction and break if the page scrolls between measure and render.
- **`isolation: isolate` on the group, `z-index: -1` on the highlight**: behind the items but inside the group's stacking context, so it can't drop behind the group's own surface.
- **`pointer-events: none`**: the highlight sits under the pointer by definition, and would otherwise steal the enter event and oscillate.
- **Focus alongside hover**, so keyboard users get the same feedback.
- **Leave on the group, not the items**: per-item leave fires in the gaps and blanks the highlight between items.

A tooltip rides the same state on one axis: an outer element animates `x` to the item's centre; an inner one is statically `translate: -50% 0`. A plain coordinate animates cleanly; `calc(centre - 50%)` asks the library to interpolate mixed units.

**Current versus hovered.** The current item's static surface drops while the group is hovered, so the travelling highlight owns the surface; two at once make the selection ambiguous. The current item keeps `text.primary` throughout, so its place is never lost.

## Layout switches and page-level shared elements

For an element that persists across a DOM change — a card becoming a detail view, a thumbnail becoming the open image:

```css
/* CSS View Transitions — same-document via document.startViewTransition(update),
   cross-document via @view-transition { navigation: auto; } */
.card-image { view-transition-name: var(--vt-name); }  /* unique per element, e.g. set inline per card */
::view-transition-group(*) { animation-duration: <duration.overlay>; animation-timing-function: <ease.standard>; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none; }
}
```

- **Motion:** give both ends the same `layoutId`; the library measures and travels between them.
- **GSAP:** `const state = Flip.getState(els); /* change the DOM */ Flip.from(state, { duration, ease });`

Whichever tool, **measure the reading position while the outgoing layout is still rendered** — the item nearest the viewport's centre — and open the incoming layout on it. Where the ends differ in aspect ratio, cross-fade two elements, each at its own aspect and sharing a centre, rather than stretching one into the other's box.

## Presence: open and close

```css
/* CSS only: a popover or dialog entering from display: none */
.menu {
  transition: opacity <duration.popover> <ease.colour>, translate <duration.popover> <ease.standard>,
              display <duration.popover> allow-discrete, overlay <duration.popover> allow-discrete;
  opacity: 1; translate: 0 0;
}
@starting-style { .menu:popover-open { opacity: 0; translate: 0 calc(var(--motion-travel) * -1); } }
.menu:not(:popover-open) {
  opacity: 0; translate: 0 calc(var(--motion-travel) * -0.5);   /* the exit travels half as far */
  transition-duration: var(--motion-exit); transition-timing-function: <ease.exit>;
}
```

```tsx
// Motion: AnimatePresence keeps the element mounted for its exit.
<AnimatePresence>
  {open && (
    <m.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: reduce ? { duration: <duration.state> } : <spring.soft> }}
      exit={{ opacity: 0, ...(reduce ? {} : { scale: 0.98, y: -2 }), transition: { duration: <exit>, ease: <ease.exit> } }}
    />
  )}
</AnimatePresence>
```

Scale from the edge the element is anchored to (`transform-origin` at the trigger): a menu growing from its own middle seems to come from nowhere. The wrapper moves; a child carries the translucent material.

## Fill means chosen, in code

The filled state is a second layer over the outline, at the same coordinates, cross-fading in place:

```css
.icon .fill   { opacity: 0; transition: opacity <duration.popover> <ease.colour>; }
.icon .detail { opacity: 1; transition: opacity <duration.popover> <ease.colour>; }  /* interior lines a solid shape swallows */
.is-current .icon .fill,   .item:hover .icon .fill   { opacity: 1; }
.is-current .icon .detail, .item:hover .icon .detail { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .icon .fill, .icon .detail { transition: none; } }
```

Where the solid shape would swallow an interior line, knock it out with a mask rather than deleting it: the silhouette in white (fill and stroke, matching the outline exactly), the interior lines in black at the outline's stroke width. A solid chip or weight step chosen instead of fill follows the same rule: one treatment, one meaning.

## Hover intent

```ts
const closeSoon = () => {
  clearTimeout(timer.current);
  timer.current = window.setTimeout(() => setOpen(false), 100);
};
const cancelClose = () => clearTimeout(timer.current);
useEffect(() => () => clearTimeout(timer.current), []);   // unmount
useEffect(() => setOpen(false), [pathname]);              // navigation
```

Bind `closeSoon` to leaving the trigger *and* the panel, `cancelClose` to entering either. Any `setTimeout` driving UI state is cleared on unmount and reset on navigation, or a menu opened on one page reappears 100ms into the next. Where they're adjacent, a hover bridge is cheaper: padding on the wrapper spanning the visual gap, so the pointer never leaves the hover region.

## Press

`transform: scale(<press>)` on `:active`, `transition-duration: 0` in and `duration.state` back out, on `pointerdown`, not `click`. In `product`, prefer the `surface.pressed` step: a toolbar of twenty shrinking buttons is noise.

## Theme cross-fade

A universal colour transition left in the stylesheet makes every hover on the site `duration.theme` and sluggish. Apply it only for the toggle:

```ts
root.classList.add("theme-transition");
applyTheme(choice);
setTimeout(() => root.classList.remove("theme-transition"), THEME_MS + 40);
```

```css
@media (prefers-reduced-motion: no-preference) {
  :root.theme-transition, :root.theme-transition *, :root.theme-transition *::before, :root.theme-transition *::after {
    transition: background-color <duration.theme> <ease.colour>, color <duration.theme> <ease.colour>,
                border-color <duration.theme> <ease.colour>, fill <duration.theme> <ease.colour>,
                stroke <duration.theme> <ease.colour> !important;
  }
}
```

The `!important` beats each component's own transition for that window; removing the class stops it poisoning everything after. The theme mechanism and flash-free first paint belong to `color-and-theming`.

## Sound, if the preset allows it

Sound is off wherever the user didn't choose to be there. Where it exists, synthesise it with Web Audio rather than shipping files — no request, no decode latency, so it lands with the input — and, non-negotiably:

- **Arm the context on every activation gesture:** `pointerdown`, `keydown` and `touchstart`. Hover is activation in no engine, and a keyboard Enter dispatches `click`, not `pointerdown`, so a pointer-only unlock leaves keyboard users in silence for ever. `wheel` activates nothing; leave it out.
- **Hover sounds for `pointerType === "mouse"` only**, deduplicated per element: a touch tap fires `pointerover` just before `click`, and plays both.
- **Dense surfaces opt out of hover sound** with an attribute on the container; above about three ticks a second it stops being feedback.
- **A visible, persisted mute**, checked at the top of playback rather than at the listener, so it applies to in-flight input; storage access wrapped so it can't throw.
- **Two sounds is a texture; five is a soundtrack.** Press and, at most, hover.
