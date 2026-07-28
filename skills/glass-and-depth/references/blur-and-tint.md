# Blur, saturation, and tint

## Why blur needs saturation

Blur is a convolution — each output pixel is a weighted average of its neighbours. Averaging colours moves them toward the mean, and the mean of a varied set of colours is closer to grey than any of them. So **blur is inherently desaturating**, and the effect grows with radius.

The consequence: a 20px-blurred photograph behind a translucent panel is noticeably greyer than the photograph. Add a white tint on top and you get the flat, cloudy, slightly dirty look that "glassmorphism" is criticised for. The blur isn't the problem and the tint isn't the problem — the missing saturation is.

```css
backdrop-filter: blur(20px) saturate(1.8);
```

Filter functions apply in order, so the saturation boost operates on the already-blurred result — which is what you want, since that's what needs correcting.

### Picking the value

| Saturate | When |
|---|---|
| 1.4 | You're only *softening* a backdrop you want recognised |
| 1.8 | You're *suppressing* a backdrop (the default) |
| >2.0 | Almost never — colours start to look radioactive |
| 1.0 | Never; this is just omitting it |

The reference implementation uses 1.4 on the folder pocket and 1.8 on the three chrome surfaces. The pocket's lower value is deliberate: the cards behind it are the subject, and pushing their saturation would make the pocket louder than its own contents.

There's a rough inverse relationship worth knowing — the more you blur, the more saturation you need to compensate. 8px blur / 1.4 saturate and 20px blur / 1.8 saturate are both roughly "colour preserved."

### Other filter functions

`brightness()` and `contrast()` are occasionally useful — Apple's materials effectively adjust luminance per variant. They're a second-order refinement; get blur and saturate right first. `grayscale()` on a backdrop defeats the purpose entirely.

## The tint

Three jobs, in order of importance:

1. **Legibility.** The surface's own content has to be readable over an arbitrary backdrop.
2. **Identity.** The tint is what makes this surface *a surface* rather than a blurred region of the page.
3. **Theme adaptation.** The tint is the thing that changes between light and dark.

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

**The nav tint is `#f2f2f2`, not white** — it matches `gray-100`, the system's "raised surface" token. Chrome that's slightly grey reads as an object sitting on the white page; chrome that's white reads as a hole in it.

**The dark tints are darker than the dark page background** (`#1a1a1a` and `#161616` against a `#0b0b0b` page). That's the inversion people get wrong: in light mode a raised surface is *darker* than the page, and in dark mode it's *lighter*. "Raised" means "more contrast against the page," and the direction flips.

**The dark pocket gradient is grey-based, not white-based.** A white gradient over a dark page reads as fog rather than glass. Keep the *direction* (brighter at top, where light hits) and change the *hue*.

### Why these live in `:root` and not `@theme`

```
@theme        build-time tokens Tailwind generates utilities from
:root         runtime custom properties, re-declarable by any selector
```

Two hard reasons the glass tints must be runtime:

1. **The reduced-transparency fallback replaces them via a media query.** A build-time token can't be swapped at runtime.
2. **One of them is a gradient.** No colour-token system will accept `linear-gradient(...)` where it expects a colour.

The general principle worth carrying: **a value that changes by *context* (theme, user preference, container) belongs in `:root`; a value that's part of the design vocabulary belongs in `@theme`.**

### The gradient pocket

```css
--folder-glass-bg: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.34));
```

A vertical gradient rather than a flat tint: brighter at the top where the light hits, fading down. It's the same idea as the 1px inset catch light, expressed as the whole surface — appropriate here because the surface is large enough that a 1px line would be lost on it.

Note the pocket's inset highlight is *also* brighter than the chrome's (`rgba(255,255,255,0.8)` vs `0.6`). Both choices push the same way: this is a bigger, more decorative surface, so its light modelling is more pronounced.

## The 97% panel, in full

The stated reason in the reference implementation:

> Its own animating transform weakens `backdrop-filter`, so the tint carries the opacity rather than the blur.

A `transform` on an element or any ancestor creates a new containing block and a new stacking context. `backdrop-filter` samples "everything painted behind the element" — and inside a transformed subtree, what that means becomes browser-dependent. In practice the blur either samples the wrong region or degrades to nothing for the duration of the animation.

A second reason, observable in the same interface: **the settings box opens directly above the nav dock**, so it's glass over glass. If both were 72%, the panel would look like the dock had grown taller rather than like a separate surface appearing above it. The heavy tint buys the tier separation as well as the legibility.

And a third: at 97% you can actually *compute* text contrast against the tint, which you cannot do at 72%. See below.

### Stacked glass doesn't compose

The upper surface's `backdrop-filter` samples the lower surface's already-composited output — including its blur. You don't get twice the frost; you get a result that depends on stacking contexts, paint order and browser, and it's usually an indeterminate mush.

Practical rule: **at most one meaningful blur in any vertical stack.** If two glass surfaces overlap, make the upper one effectively opaque and treat its blur as decoration.

## Text over glass

The hard constraint: **contrast ratio on a translucent surface is not computable**, because the effective background is whatever happens to be behind it.

A 72% `#f2f2f2` tint over a white page composites to about `#f5f5f5` — fine. Over a dark photograph it composites to something around `#b8b8b8`. Text at `gray-800` (`#7d7d7d`) clears AA on the first and fails it on the second, and the same pixel of text is doing both as the page scrolls.

Three mitigations, in order:

**1. Raise the tint until it's effectively opaque behind text.** At 97% the backdrop contributes ~3%, so contrast computed against the tint is accurate to within a rounding error. This is the only approach that makes the number *true*.

**2. Only put high-contrast content on glass.** The reference implementation puts icons (`gray-600` → `gray-1000` on hover) and 13–14px rows at `gray-900`/`gray-1000` on glass. Nothing muted, nothing small, nothing at `gray-500`.

**3. Don't put reading copy on glass.** No paragraph in the reference implementation sits on a translucent surface. Glass is chrome; prose is on an opaque page.

What not to do: measure contrast against the tint colour as if the surface were opaque when it's at 72%, and record the result as a pass. The real ratio is worse everywhere the backdrop is lighter than the tint, and you've documented a fiction.

The reduced-transparency fallback helps here as a side effect — it swaps the tint for a solid token, at which point contrast becomes real and computable for the users most likely to need it.

## The dead fourth tier

The reference implementation defines a `glass-menu` material — 16px blur, 1.8 saturate, 72% white tint — described as "a menu over a known surface." Grepping the source, **nothing uses it.**

Worth understanding why, because it's the useful part: every menu in the site turned out to need `glass-panel` instead, either because its wrapper animates (weakening the blur) or because it opens over other glass. The "menu over a surface you already know" case never actually materialised — in a site with a fixed dock and floating drop-ups, you never know the backdrop.

Two lessons. First, if you're copying these materials, copy three. Second, a tier that exists for a hypothetical case is dead CSS, and dead CSS in a design system is worse than absent CSS — the next person assumes it's load-bearing and reasons about a four-tier system that has only ever been three.
