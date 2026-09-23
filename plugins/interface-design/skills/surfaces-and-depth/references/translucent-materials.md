# Translucent materials

Only for projects whose preset allows translucency, and only for surfaces that passed the decision flow in `SKILL.md`. Everything here assumes the material has already earned its place.

## What a convincing material is made of

A translucent surface that reads as material rather than as an effect is several properties working at once. Drop any one and it stops convincing.

| | Property | Job | Without it |
|---|---|---|---|
| 1 | `blur()` | Suppress the backdrop so the surface's own content reads | Text over text |
| 2 | `saturate()` | Undo the greying that blur causes | Cloudy, dirty wash |
| 3 | Tint | Carry legibility, identity and the theme | Illegible whenever the blur fails |
| 4 | Edge (`border.layered`) | Say where the surface ends | Mush at the boundary |
| 5 | Shadow (the level's) | Say it is above | A flat patch, not a floating object |

Properties 4 and 5 are the level's bundle, not the material's — a translucent floating menu takes the same edge weight, shadow and layer as an opaque one. The material only swaps the surface.

## Choosing the tier

Ask one question per surface: **how much do you know about what's behind it?**

| You know… | Tier | Blur | Saturate | Tint |
|---|---|---|---|---|
| Exactly — and you want it recognised (cards behind a frosted pocket) | Soften | 6–10px | 1.2–1.4 | 35–60%, may be a gradient |
| Only that page content scrolls under (a sticky header, a dock) | Chrome | 16–24px | 1.6–1.8 | 70–80% |
| Nothing — it may open over images or other translucent surfaces, or its wrapper animates | Defensive | 20–28px | 1.6–1.8 | 92–97% |

Most projects that use translucency need one tier: chrome. A second appears when a floating panel opens over the chrome. A third only when something decorative really wants its backdrop seen. Define a tier when a real surface needs it, never for a case you expect to have — a tier with no user is dead CSS the next person will reason about as if it were load-bearing.

Name tiers as project roles under `material.translucent`, by job: `material.translucent` → `chrome`, `defensive`, `soften`, in the project's own naming style.

## Why saturation

Blur is a convolution: each output pixel averages its neighbours, and averaging colours pulls them toward grey. The wider the blur, the greyer the result. Filter functions apply in order, so `saturate()` after `blur()` corrects the already-blurred result, which is exactly what needs correcting:

```css
backdrop-filter: blur(20px) saturate(1.7);
```

More blur wants more saturation to stay "colour preserved". Softening tiers sit lower because the backdrop is the subject; pushing its colour makes the pocket louder than what it holds. Above about 2.0, colours look radioactive. `brightness()` and `contrast()` are second-order refinements; get blur and saturation right first. `grayscale()` on a backdrop defeats the material.

## The tint

The tint's colours belong to `color-and-theming`, and so does the reason they are runtime custom properties rather than build-time tokens: the reduced-transparency fallback has to replace them from a media query, and a gradient tint isn't a colour any token system accepts. What this skill sets is the tint's **opacity** by tier, and three rules about its colour that come from depth:

- **In light themes, not pure white.** A tint matching `surface.raised`, a step off the page, reads as an object on the page; a white tint on a white page reads as a hole in it.
- **In dark themes, lighter than the page.** Raised means more contrast against the page, and the direction flips. A dark tint darker than the page reads as a hole going the other way.
- **On a large surface, a gradient.** Brighter at the top, where the light is, fading down: the inset highlight's idea at a scale where a 1px line would be lost. In dark themes keep the direction and change the base — a white-based gradient over a dark page reads as fog.

## Checking text against the worst backdrop

Browsers composite a translucent tint over its backdrop per channel:

```
shown = α × tint + (1 − α) × backdrop
```

Blur doesn't rescue the worst case: a large flat region of dark photograph under the surface is still dark after averaging. Take the lightest and darkest content that can ever sit behind the surface — `#fff` and `#000` if it is arbitrary — composite the tint over each, and check every text tier on the surface against both.

A worked check: a chrome tint `rgb(250 250 250 / 0.72)`, with the light-theme ladder `text.primary #16161a`, `text.secondary #4b4b52`, `text.tertiary #6b6b73`.

| Backdrop | Composite | `text.primary` | `text.secondary` | `text.tertiary` |
|---|---|---|---|---|
| White page | `#fbfbfb` | passes | passes | 5.1:1 |
| Black photograph | `#b4b4b4` | 8.7:1 | **4.2:1** | **2.6:1** |

At 72% even `text.secondary` fails over a dark image. Raise the tint to 95% and the dark composite becomes `#eeeeee`: `text.secondary` 7.5:1, `text.tertiary` 4.55:1 — passing, just. That's why a surface that must hold anything below `text.primary` over arbitrary content takes the defensive tier.

```sh
# composite first, then check the ladder against the worst composite
node <design-system-setup>/scripts/contrast.mjs --ladder "#b4b4b4" "#16161a" "#4b4b52" "#6b6b73"
```

Record the ratio against the worst composite in `DESIGN.md`, with the backdrop named. A ratio against the opaque tint colour, when the surface is at 72%, is a fiction.

## Glass over glass

The upper surface's filter samples the lower one's already-filtered output. You don't get twice the frost; you get something that depends on stacking contexts, paint order and browser. And two surfaces at the same tint read as one: a settings panel opening directly above a translucent dock, at the dock's tint, looks like the dock has grown taller.

So the upper surface goes to the defensive tier or to opaque, and its blur is decoration. **At most one meaningful blur in any vertical stack.**

## The wrapper and the surface

A `transform`, `filter`, `perspective`, `contain: paint` or `will-change: transform` on an element or any ancestor changes what `backdrop-filter` samples in its subtree — for an animating wrapper, for every frame of the animation. The fix is structural: animate one element, filter another.

```html
<div class="menu-motion">                 <!-- animates scale and translate; no filter -->
  <ul class="material-defensive …">        <!-- filters; never transformed -->
```

The same ancestor properties also become the containing block for `position: fixed` descendants, so a full-bleed overlay inside a transformed strip is trapped inside the strip. When a filtered or fixed element misbehaves, walk the ancestor chain for all five properties before touching the element itself.

## Gradient strokes

A 1px edge that changes colour down its height, with no wrapper and no mask:

```css
.stroke-panel {
  border: 1px solid transparent;
  background-image:
    linear-gradient(var(--panel-fill-top), var(--panel-fill-bottom)),   /* fill */
    linear-gradient(180deg,                                             /* stroke */
      var(--panel-edge-top) 0px,
      var(--panel-edge-mid) 120px,
      var(--panel-edge-bottom) 240px);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
```

`background-origin: border-box` sizes both layers to the border box; without it the stroke is sized to the padding box and clipped to the border box, and every side shows the wrong end of the ramp. The stops are in pixels because this panel opens and closes: percentage stops re-fit the ramp to the box on every frame, so a closed bar runs the whole sweep in its own height and shimmers as it grows. Percentages are right only for a box that never changes size.

The stroke colours are a chromatic spend — in most presets the colour system's one exception — and are `color-and-theming`'s to name.

## Glows

```css
--panel-glow:
  0 1px 2px rgb(from var(--panel-ink) r g b / 0.05),        /* contact */
  -10px 0 20px -18px rgb(from var(--panel-hue) r g b / 0.38), /* left */
  10px 0 20px -18px rgb(from var(--panel-hue) r g b / 0.38),  /* right */
  0 10px 24px -16px rgb(from var(--panel-hue) r g b / 0.30);  /* below */
```

The two horizontal casts make it emission; a single centred cast is a drop shadow that happens to be coloured. Heavy negative spread keeps each cast tucked. If the glow reports state, it holds for the state: `:hover, [data-open="true"]`, so the light agrees with the chevron. Its transition timing is `interface-motion`'s; under reduced motion the change is instant, not removed.

## Sheens

```css
.sheen {
  background-image: linear-gradient(100deg, var(--label) 40%, var(--label-hi) 50%, var(--label) 60%);
  background-size: 250% 100%;
  background-clip: text;
  color: transparent;
  animation: sheen 700ms <ease.standard> both;   /* once — never infinite */
}
@media (prefers-reduced-motion: reduce) {
  .sheen { animation: none; background-image: none; color: var(--label); }
}
```

Remove the class on `animationend`, so the label goes back to painted text: clipped-background text left in place breaks selection highlighting and forced colours. A looping sheen says "still working" about something that has finished.
