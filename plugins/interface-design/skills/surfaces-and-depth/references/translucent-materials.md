# Translucent materials

Only for presets that allow translucency, and surfaces that passed the decision flow in `SKILL.md`.

## What convinces

Material, not effect, takes all five; drop one and it stops convincing.

| | Property | Job | Without it |
|---|---|---|---|
| 1 | `blur()` | Suppress the backdrop so the surface's own content reads | Text over text |
| 2 | `saturate()` | Undo the greying that blur causes | Cloudy, dirty wash |
| 3 | Tint | Carry legibility, identity and the theme | Illegible whenever the blur fails |
| 4 | Edge (`border.layered`) | Say where the surface ends | Mush at the boundary |
| 5 | Shadow (the level's) | Say it is above | A flat patch, not a floating object |

Properties 4 and 5 are the level's, not the material's: a translucent floating menu takes an opaque one's edge weight, shadow and layer. The material only swaps the surface.

## Choosing the tier

One question per surface: **how much do you know about what's behind it?**

| You know… | Tier | Blur | Saturate | Tint |
|---|---|---|---|---|
| Exactly — and you want it recognised (cards behind a frosted pocket) | Soften | 6–10px | 1.2–1.4 | 35–60%, may be a gradient |
| Only that page content scrolls under (a sticky header, a dock) | Chrome | 16–24px | 1.6–1.8 | 70–80% |
| Nothing — it may open over images or other translucent surfaces, or its wrapper animates | Defensive | 20–28px | 1.6–1.8 | 92–97% |

Most projects need one tier, chrome; a second when a floating panel opens over it, a third only when something decorative wants its backdrop seen. Define tiers for real surfaces, never expected ones; an unused tier is dead CSS someone will treat as load-bearing. Name tiers by job under `material.translucent` — `chrome`, `defensive`, `soften` — in the project's naming style.

## Why saturation

Blur is a convolution: each pixel averages its neighbours, pulling colours toward grey, more so the wider the blur. Filters apply in order, so `saturate()` after `blur()` corrects the already-blurred result:

```css
backdrop-filter: blur(20px) saturate(1.7);
```

More blur wants more saturation; softening tiers sit lower, since boosting a backdrop that is the subject makes the pocket louder than its contents. Above about 2.0, colours look radioactive. `brightness()` and `contrast()` are second-order; `grayscale()` on a backdrop defeats the material.

## The tint

Its colours belong to `color-and-theming`, as does why they are runtime custom properties, not build-time tokens (a media query replaces them; a gradient isn't a colour token systems accept). This skill sets **opacity** by tier, plus three depth rules:

- **In light themes, not pure white.** A tint matching `surface.raised`, a step off the page, reads as an object on it; white on a white page reads as a hole.
- **In dark themes, lighter than the page**, since raised means more contrast; a darker tint is a hole the other way.
- **On a large surface, a gradient**, brighter at the top where the light is — the inset highlight at a scale where a 1px line would be lost. In dark themes keep the direction, change the base: a white-based gradient over a dark page reads as fog.

## Text against the worst backdrop

Browsers composite a translucent tint per channel:

```
shown = α × tint + (1 − α) × backdrop
```

Blur doesn't rescue the worst case; a large dark patch stays dark after averaging. Composite over the lightest and darkest possible backdrop — `#fff` and `#000` if arbitrary — and check every tier against both.

A worked check: chrome tint `rgb(250 250 250 / 0.72)`, light-theme ladder `text.primary #16161a`, `text.secondary #4b4b52`, `text.tertiary #6b6b73`.

| Backdrop | Composite | `text.primary` | `text.secondary` | `text.tertiary` |
|---|---|---|---|---|
| White page | `#fbfbfb` | passes | passes | 5.1:1 |
| Black photograph | `#b4b4b4` | 8.7:1 | **4.2:1** | **2.6:1** |

At 95% the dark composite becomes `#eeeeee`: `text.secondary` 7.5:1, `text.tertiary` 4.55:1 — passing, just. Hence the defensive tier for anything below `text.primary` over arbitrary content.

```sh
# composite first, then check the ladder against the worst composite
node <design-system-setup>/scripts/contrast.mjs --ladder "#b4b4b4" "#16161a" "#4b4b52" "#6b6b73"
```

Record the ratio against the worst composite in `DESIGN.md`, naming the backdrop.

## A pocket on art

The one material a `product` preset keeps: a frosted pocket on an illustration — a folder's front panel showing the sheets behind it — at the soften tier.

```css
.pocket { background: var(--surface-page); }                     /* opaque baseline */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .pocket {
    background: linear-gradient(180deg, var(--pocket-tint-top), var(--pocket-tint-bottom));
    backdrop-filter: blur(8px) saturate(1.4);
    box-shadow: inset 0 1px 0 var(--pocket-catch);              /* catch light on the top edge */
  }
}
@media (prefers-reduced-transparency: reduce) {
  .pocket { background: var(--surface-page); backdrop-filter: none; }
}
```

The backdrop is drawn by you and holds still, so saturation stays low (it is the subject) and nothing needs measuring for text. Over art that animates, skip the filter and draw the frost into the art.

## Glass over glass

The upper filter samples the lower one's filtered output, so the result varies with stacking context, paint order and browser rather than doubling the frost; and two surfaces at one tint read as one object. The upper surface goes defensive or opaque, its blur decoration. **At most one meaningful blur in any vertical stack.**

## The wrapper and the surface

A `transform`, `filter`, `perspective`, `contain: paint` or `will-change: transform` on an element or any ancestor changes what `backdrop-filter` samples in its subtree — on an animating wrapper, every frame. Animate one element, filter another:

```html
<div class="menu-motion">                 <!-- animates scale and translate; no filter -->
  <ul class="material-defensive …">        <!-- filters; never transformed -->
```

The same properties make an ancestor the containing block for `position: fixed` descendants, trapping a full-bleed overlay in a transformed strip. When a filtered or fixed element misbehaves, walk the ancestors for all five first.

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

The fill clips to `padding-box`, the stroke to `border-box`, and `background-origin: border-box` sizes both to the border box; without it the stroke is sized to the padding box but clipped to the border box, and every side shows the wrong end of the ramp — which looks almost right. Pixel stops because the panel resizes: percentages re-fit every frame, so a closed bar runs the whole sweep in its own height and shimmers as it grows. They suit only a fixed-size box.

The stroke colours are a chromatic spend — in most presets the colour system's one exception — and `color-and-theming`'s to name.

## Glows

```css
--panel-glow:
  0 1px 2px rgb(from var(--panel-ink) r g b / 0.05),        /* contact */
  -10px 0 20px -18px rgb(from var(--panel-hue) r g b / 0.38), /* left */
  10px 0 20px -18px rgb(from var(--panel-hue) r g b / 0.38),  /* right */
  0 10px 24px -16px rgb(from var(--panel-hue) r g b / 0.30);  /* below */
```

The two horizontal casts make it emission, and heavy negative spread keeps each tucked. A glow reporting state holds for the state — `:hover, [data-open="true"]` — so the light agrees with the chevron. Timing is `interface-motion`'s; under reduced motion the change is instant, not removed.

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

Remove the class on `animationend` so the label returns to painted text; clipped-background text left in place breaks selection highlighting and forced colours.
