---
name: glass-and-depth
description: Build translucent "glass" surfaces that read as real floating material rather than as glassmorphism — blur scaled to how little you know about the backdrop, saturation to stop the blur going grey, tint that carries legibility when the blur is compromised, and the depth cues a translucent surface can't float without (a hairline edge, a layered shadow stack, continuous corners). Use when building or reviewing frosted navigation, floating menus, sheets, drop-ups, hover cards, tooltips, modal panels, or any backdrop-filter surface; when glass looks muddy, cloudy, flat, or unreadable; when stacking glass over glass; when text over a translucent surface fails contrast; and always when implementing reduced-transparency, high-contrast, or no-backdrop-filter fallbacks.
---

# Glass and Depth

Translucent surfaces done so they read as **material** rather than as an effect.

The failure mode has a name — glassmorphism — and a cause: doing blur and a white tint, and stopping there. That produces a cloudy rectangle. Real glass in an interface is **four properties working at once**, plus three depth cues that have nothing to do with transparency:

| | Property | Job |
|---|---|---|
| 1 | `blur()` | Suppress the backdrop so the surface's own content can be read |
| 2 | `saturate()` | Undo the desaturation blur causes — the difference between *translucent* and *dirty* |
| 3 | A tint | Carry legibility, especially when the blur is compromised |
| 4 | A hairline edge | Say exactly where the surface ends |
| 5 | A layered shadow | Say it's above something |
| 6 | Continuous corners | Say it's an object |

Drop any one and it stops being convincing. Drop 2 and it's muddy. Drop 4 and the edge is mush. Drop 5 and it's a flat patch rather than a floating panel.

Reference implementation: the floating navigation, menus and sheets on [modimihir.com](https://modimihir.com).

## 1. Blur scales with uncertainty about the backdrop

Not with importance, and not with size. The question is: **how much do you know about what's behind this?**

| Tier | Blur | Saturate | Tint | Backdrop | Used for |
|---|---|---|---|---|---|
| `folder-glass` | **8px** | 1.4 | gradient, 55%→34% | Content you *want* recognised | A frosted pocket with cards peeking behind |
| `glass-nav` | **20px** | 1.8 | 72% | Arbitrary page content | Fixed chrome that content scrolls under |
| `glass-panel` | **24px** | 1.8 | **97%** | Anything, including other glass | A floating menu that must stay legible |

**8px on the pocket** — you want to see the cards behind it, recognisably. Blur is softening, not obscuring. That's why its saturation is lower too (1.4): the cards behind it are the subject, and over-saturating them would make the pocket louder than its contents.

**20px on fixed chrome** — a paragraph, a photograph, or a full-bleed image wall can scroll under it. More blur means less of that survives to compete with the nav's own icons.

**24px on the panel** — the most defensive value, for the surface with the least control over its backdrop.

> **A finding from the reference implementation:** it also defines a fourth material, `glass-menu` (16px / 1.8 / 72%), for "a menu over a surface you already know" — and nothing uses it. Every menu in the site turned out to need `glass-panel`'s defensive tint instead. It's dead CSS. Three tiers is the real system; if you're copying this, copy three.

## 2. `saturate()` is not optional

This is the single highest-leverage line in the whole skill.

Blur averages neighbouring pixels. Averaging colours pulls them toward grey — that's just what averaging does. So a blurred backdrop is *always* less saturated than the original, and the more you blur, the greyer it gets. Blur-plus-tint alone gives you the characteristic cheap-frosted-glass wash.

```css
backdrop-filter: blur(20px) saturate(1.8);
```

1.8 puts the life back. The backdrop stays recognisably colourful through the surface, which is what makes the eye read *translucent* instead of *dirty*.

Apple's platform materials do exactly this, which is why iOS glass looks like glass. It costs nothing — it's the same filter pass.

Rule of thumb: **1.8 where you're suppressing the backdrop, 1.4 where you're only softening it.** Above ~2.0 colours start to look radioactive.

## 3. The tint carries legibility when the blur can't

`glass-panel` sits at **97% opacity** while still carrying a 24px blur. That looks self-contradictory until you know the constraint:

> A `transform` on an ancestor weakens or breaks `backdrop-filter` in its subtree.

`glass-panel` is used on menus whose wrapper *scales open*. Throughout that animation the blur is compromised — it samples the wrong backdrop, or nothing. So the tint has to be doing the work, and the blur is a bonus that lands once the animation settles.

**The generalisable rule: when you can't rely on the blur, thicken the tint.** Never ship a 72% surface whose blur is broken; it's unreadable over busy content.

Where you *do* have the choice, fix it structurally instead — the animating wrapper and the glass surface must be different elements:

```tsx
<DropMenu open={open}>            {/* animates scale + y */}
  <ul className="glass-panel …">  {/* carries the blur, never transformed */}
```

This is the same class of bug as a transform capturing `position: fixed` descendants. When something filtered or positioned behaves inexplicably, check every ancestor for `transform`, `filter`, `perspective`, `contain` and `will-change`.

## 4. Glass over glass needs a tier gap

In the reference implementation a settings box (`glass-panel`) opens *directly above* the navigation dock (`glass-nav`). Two translucent surfaces, overlapping.

Two things this teaches:

**Stacked blurs don't compose the way you'd hope.** The upper surface blurs whatever it samples — which is the lower surface's *already-blurred* output. You don't get twice the frost, you get an indeterminate mush that depends on stacking contexts and browser.

**Two surfaces at the same tint read as one object.** If the drop-up box were also 72%, it would look like the dock had simply grown taller. The 97% tint is what makes it read as a *separate* panel that has appeared above the dock.

So: **when glass overlaps glass, the tiers must differ visibly.** Take the upper surface to a much heavier tint, or make it opaque. Don't stack two surfaces of the same material and expect a hierarchy.

## 5. Depth cues: glass alone doesn't float

A blurred, tinted rectangle is a *patch*. Three non-transparency cues turn it into an object.

### The hairline

```tsx
className="glass-nav rounded-2xl border-[0.5px] border-gray-alpha-400 p-1"
```

`0.5px` renders as a true sub-pixel hairline on retina and rounds up to 1px elsewhere — it degrades to the next weight rather than disappearing.

**Use the translucent ramp, not a solid grey.** A solid `gray-400` border on a translucent surface doesn't participate in what's behind it, so it reads as a pasted-on frame. `gray-alpha-400` sits *on* whatever's there and stays correct over a white page or a photograph. (See the **color-and-theming** skill for the ramp.)

### The shadow stack

Four layers modelling one light source above the element:

```
inset 0 1px 0 rgba(255,255,255,0.6),      /* top-edge catch light */
0 1px 1px rgba(0,0,0,0.02),               /* contact */
0 8px 16px -4px rgba(0,0,0,0.04),         /* near ambient */
0 24px 32px -8px rgba(0,0,0,0.06)         /* far ambient */
```

The **inset highlight** does more for the floating impression than any of the shadows — it's the specular catch where a raised surface faces the light. The **contact shadow** is what makes it look *resting on* something rather than pasted over. **Two ambient layers** instead of one, because a single large shadow reads as fog while two fall off like real penumbra. **Negative spread** contracts before blurring, so the shadow stays tucked under the element instead of haloing past its edges.

Opacities are 2–6%. Elevation should be felt, not seen — if you can identify the shadow as a shadow, it's too strong.

Dark mode is a **different** shadow, not the same one re-tinted: shadows go up ~10× (4% black on `#0b0b0b` is mathematically invisible) while the inset highlight drops ~6× (0.6 white on a dark surface reads as a glowing edge, not a catch light).

### Continuous corners

```css
*, *::before, *::after { corner-shape: superellipse(1.5); }
```

A `border-radius` quarter-circle has constant curvature that drops abruptly to zero at the straight edge. A superellipse varies curvature continuously into the edge — which is why an iOS icon looks softer than a same-radius CSS rectangle. `superellipse(k)` uses exponent 2^k, so 1.5 lands about halfway to a full squircle. Unsupported browsers get normal rounding.

→ Every elevation tier, the nesting radius rule, why each layer is there: `references/depth-cues.md`

## 6. Text over glass is the real accessibility problem

**You cannot compute the contrast ratio of text on a translucent surface**, because the effective background depends on what's behind it — which is arbitrary page content, or a photograph.

Three ways to make it safe, in order of preference:

1. **Raise the tint until the surface is effectively opaque behind text.** This is why `glass-panel` is 97%. At that opacity you *can* compute contrast, against the tint colour.
2. **Only put high-contrast text on glass.** In the reference implementation, glass surfaces carry icons at `gray-600`→`gray-1000` and 13–14px rows at `gray-900`/`gray-1000`. Nothing muted, nothing small.
3. **Don't put reading copy on glass at all.** No paragraph in the reference implementation sits on a translucent surface. Glass is for chrome.

The trap to avoid: measuring contrast against the tint colour as if the surface were opaque, when it's at 72%. That number is fiction — the real ratio is worse everywhere the backdrop is light.

## 7. Fallbacks

### `prefers-reduced-transparency` — both halves, and it must come last

```css
/* AFTER both theme blocks — it re-declares the same properties. */
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --glass-nav-bg: var(--color-gray-100);
    --glass-panel-bg: var(--color-gray-100);
    --folder-glass-bg: var(--color-background-100);
  }
  .glass-nav, .glass-panel, .folder-glass {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

**Both halves are required.** Dropping the filter alone leaves a 72% tint over live content — *worse* than the glass was. Swapping the tint alone still pays the full cost of the blur.

This is why the glass tints are **runtime `:root` variables and not build-time tokens**: a media query has to be able to replace them at runtime. (One of them is a gradient, too, which no colour-token system accepts.)

### `prefers-contrast: more`

```css
@media (prefers-contrast: more) {
  .glass-nav, .glass-panel, .folder-glass { border-color: var(--color-gray-1000); }
}
```

Translucent chrome leans on its hairline to define its edge. At high contrast that hairline has to become a real border — the *surface* is fine, the *boundary* has to be unambiguous.

### `@supports` — the gap in the reference implementation

Being honest about this one: the reference implementation has **no `@supports` guard**, so in a browser without `backdrop-filter` the surfaces fall back to a bare 72% tint with no blur — legible, but weak. Nearly every current browser supports it, so it's a small risk; it's still the right thing to add:

```css
.glass-nav { background: var(--color-gray-100); }   /* opaque baseline */

@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-nav {
    background: var(--glass-nav-bg);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
  }
}
```

Opaque first, glass as the enhancement. Test both conditions — Safari shipped the prefixed version for years.

Always ship `-webkit-backdrop-filter`. Safari still wants it, and Safari is where glass matters most.

## 8. Performance

`backdrop-filter` is genuinely expensive: for every frame, the browser copies the region behind the element, filters it, and composites. It scales with **area**, and it re-runs whenever anything behind it changes — including scroll.

What makes it affordable in the reference implementation:

- **Small surfaces.** A dock a few hundred pixels wide, not a full-viewport overlay.
- **Few of them.** Three or four on screen at most, and the menus unmount when closed rather than sitting invisible (glass costs something even at `opacity: 0`).
- **No animated blur.** The blur radius never changes. Animating it forces a re-filter every frame at a new radius.

What to avoid: full-page glass overlays, glass on list items (one per row), animating `blur()`, and glass over a video or an animating canvas.

→ Cost model, containment, what to measure: `references/performance-and-fallbacks.md`

## 9. When not to use glass

Glass says "this floats above your content, and the content continues underneath." If that isn't true, it's the wrong material.

- **A page section.** It's not floating; it's the page.
- **A card in a grid.** Nothing meaningful is behind it. Use a solid surface and a shadow.
- **Anything holding reading copy.** See §6.
- **Over a solid single-colour background.** The blur has nothing to reveal — you're paying for a filter to produce a flat tint. Just use the tint.
- **When the content behind it must stay readable.** Then you want a shadow, not a blur.

The reference implementation uses glass in exactly four places, all of them floating chrome: the nav dock, the settings drop-up, the mobile sheet, and one decorative pocket. Everything else is opaque.

## Assets

- `assets/glass.css` — the three material classes with all fallbacks, plus the `@supports` guard the reference implementation is missing. Pairs with `color-and-theming/assets/color-tokens.css`, which declares the tints.
- `assets/GlassPanel.tsx` — the wrapper/surface split, the shared shadow constant, hairline and stacking, as a component.

## Checklist

- [ ] `saturate()` on every `backdrop-filter` — 1.8 suppressing, 1.4 softening.
- [ ] Blur chosen by how little you know about the backdrop, not by size or importance.
- [ ] Three tiers, not one blur value reused everywhere.
- [ ] Tint thickened wherever the blur is compromised by an ancestor transform.
- [ ] Animating wrapper and glass surface are different elements.
- [ ] Overlapping glass surfaces sit at visibly different tints.
- [ ] Every glass surface has a hairline **and** a shadow, not one alone.
- [ ] Hairline uses the translucent ramp, not a solid grey.
- [ ] Shadow is layered (inset highlight + contact + ambient), with negative spread.
- [ ] Dark shadows ~10× stronger, dark inset highlight ~6× weaker.
- [ ] No reading copy on glass; no muted or small text on glass.
- [ ] `prefers-reduced-transparency` swaps tint **and** drops filter, and comes last.
- [ ] `prefers-contrast: more` promotes the hairline.
- [ ] `@supports` guard with an opaque baseline.
- [ ] `-webkit-backdrop-filter` shipped alongside.
- [ ] Glass tints are runtime `:root` variables, not build-time tokens.
- [ ] Closed menus unmount rather than sitting invisible.
- [ ] No animated blur radius; no full-viewport glass.
- [ ] Each use is genuinely floating chrome — not a card, section, or flat background.
