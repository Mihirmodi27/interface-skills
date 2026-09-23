# Blur, saturation, and tint

## Why blur needs saturation

Each blurred pixel is a weighted average of its neighbours, and the mean of a varied set of colours is closer to grey than any of them. So **blur is inherently desaturating**, and more so as the radius grows.

A 20px-blurred photograph behind a panel is noticeably greyer than the photograph; add a white tint and you get the flat, cloudy, slightly dirty look "glassmorphism" is criticised for. The problem is neither blur nor tint but the missing saturation.

```css
backdrop-filter: blur(20px) saturate(1.8);
```

Filter functions apply in order, so the saturation boost corrects the already-blurred result.

### Picking the value

| Saturate | When |
|---|---|
| 1.4 | Only *softening* a backdrop you want recognised |
| 1.8 | *Suppressing* a backdrop (the default) |
| >2.0 | Almost never — colours look radioactive |
| 1.0 | Never; this is just omitting it |

The reference implementation uses 1.4 on the folder pocket, deliberately: the cards behind it are the subject, and pushing their saturation would make the pocket louder than its contents. The three chrome surfaces use 1.8.

Roughly, the more you blur, the more saturation you need: 8px / 1.4 and 20px / 1.8 both come out "colour preserved".

### Other filter functions

`brightness()` and `contrast()` are occasionally useful — Apple's materials effectively adjust luminance per variant — but they're a second-order refinement after blur and saturate. `grayscale()` on a backdrop defeats the purpose.

## The tint

Three jobs, in order of importance:

1. **Legibility.** The surface's own content has to be readable over an arbitrary backdrop.
2. **Identity.** The tint makes this *a surface* rather than a blurred region of the page.
3. **Theme adaptation.** The tint is what changes between light and dark.

### The values

```css
:root {
  --glass-nav-bg:    rgba(242, 242, 242, 0.72);
  --glass-panel-bg:  rgba(243, 243, 243, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
}

:root[data-theme="dark"] {
  --glass-nav-bg:    rgba(26, 26, 26, 0.72);
  --glass-panel-bg:  rgba(22, 22, 22, 0.97);
  --folder-glass-bg: linear-gradient(to bottom, rgba(48,48,48,0.5), rgba(30,30,30,0.34));
}
```

**The nav tint is `#f2f2f2`, not white**, matching `gray-100`, the "raised surface" token. Slightly grey chrome reads as an object on the white page; white chrome reads as a hole in it.

**The dark tints are lighter than the dark page** (`#1a1a1a` and `#161616` against `#0b0b0b`). This is the inversion people get wrong: a raised surface is *darker* than the page in light mode and *lighter* in dark mode. "Raised" means "more contrast against the page", and the direction flips.

**The dark pocket gradient is grey-based, not white-based.** A white gradient over a dark page reads as fog. Keep the *direction* (brighter at top, where light hits) and change the *hue*.

### Why these live in `:root` and not `@theme`

```
@theme        build-time tokens Tailwind generates utilities from
:root         runtime custom properties, re-declarable by any selector
```

Two hard reasons the glass tints must be runtime:

1. **The reduced-transparency fallback replaces them via a media query.** A build-time token can't be swapped at runtime.
2. **One of them is a gradient.** No colour-token system accepts `linear-gradient(...)` where it expects a colour.

The principle: **a value that changes by *context* (theme, user preference, container) belongs in `:root`; a value in the design vocabulary belongs in `@theme`.**

### The gradient pocket

```css
--folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
```

Brighter at the top where the light hits, fading down: the 1px inset catch light expressed as the whole surface, because on a surface this large a 1px line would be lost.

The pocket's inset highlight is *also* brighter than the chrome's (`rgba(255,255,255,0.8)` vs `0.6`). Both push the same way: a bigger, more decorative surface gets more pronounced light modelling.

## The 97% panel, in full

The stated reason in the reference implementation:

> Its own animating transform weakens `backdrop-filter`, so the tint carries the opacity rather than the blur.

A `transform` on an element or any ancestor creates a new containing block and stacking context, and inside a transformed subtree what "everything painted behind the element" means is browser-dependent. In practice the blur samples the wrong region or degrades to nothing for the duration of the animation.

Two more reasons. **The settings box opens directly above the nav dock**, glass over glass: at 72% each it would look like the dock had grown taller, so the heavy tint buys tier separation as well as legibility. And at 97% you can *compute* text contrast against the tint, which you cannot at 72%.

### Stacked glass doesn't compose

The upper `backdrop-filter` samples the lower surface's already-composited output, blur included, so the result depends on stacking contexts, paint order and browser — usually mush. **At most one meaningful blur in any vertical stack:** make the upper surface effectively opaque and treat its blur as decoration.

## Text over glass

**Contrast on a translucent surface is not computable.** A 72% `#f2f2f2` tint composites to about `#f5f5f5` over a white page and around `#b8b8b8` over a dark photograph. Text at `gray-800` (`#7d7d7d`) clears AA on the first and fails on the second, and the same pixel does both as the page scrolls.

Three mitigations, in order:

**1. Raise the tint until it's effectively opaque behind text.** At 97% the backdrop contributes ~3%, so contrast against the tint is accurate to a rounding error. Only this makes the number *true*.

**2. Only high-contrast content on glass:** icons (`quiet` → `gray-1000` on hover — not `gray-600`, which is 2.38:1 on white) and 13–14px rows at `gray-900`/`gray-1000`. Nothing muted, nothing small, nothing at `gray-500`.

**3. No reading copy on glass.** Glass is chrome; prose sits on an opaque page.

Measuring against the tint as if a 72% surface were opaque, and recording a pass, documents a fiction: the real ratio is worse wherever the backdrop is lighter than the tint. The reduced-transparency fallback helps as a side effect, swapping in a solid token so contrast is real for the users most likely to need it.

## The dead fourth tier

The reference implementation defines a `glass-menu` material — 16px blur, 1.8 saturate, 72% white tint — for "a menu over a known surface". Grepping the source, **nothing uses it.** Every menu needed `glass-panel`, because its wrapper animates or it opens over other glass; with a fixed dock and floating drop-ups you never know the backdrop.

Copy three. A tier for a hypothetical case is dead CSS, worse than absent CSS: the next person assumes it's load-bearing and reasons about a four-tier system that has only ever been three.
