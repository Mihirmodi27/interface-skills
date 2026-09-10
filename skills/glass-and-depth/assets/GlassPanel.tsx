/**
 * The glass surface, as a component — every depth cue in one place.
 *
 * The point of this file is the wrapper/surface split and the depth cues in
 * one place. (The elevation stack itself is better as the `.dock-shadow`
 * class in assets/glass.css — see the note on the SHADOW constant below.)
 * Glass is four properties plus three depth cues, and the cues are the part
 * people skip: a blurred tinted rectangle with no hairline and no shadow is a
 * patch, not a floating panel.
 *
 * Pairs with assets/glass.css (the materials) and
 * color-and-theming/assets/color-tokens.css (the tints and the ramps).
 */

import type { ReactNode } from "react";

/* ── Elevation ────────────────────────────────────────────────────────────
   Four layers modelling one light source above the element:

     inset 1px white   the specular catch where a raised surface faces the
                       light. Contributes more to the floating impression
                       than any of the shadows, and is the one most often
                       omitted — remove it and the surface looks printed on.
     1px/1px @ 2%      contact shadow: resting on something, not pasted over.
     8/16 @ 4%         near ambient.
     24/32 @ 6%        far ambient. Two layers rather than one because a
                       single large shadow reads as fog; two fall off like
                       real penumbra.

   Negative spread (-4px, -8px) contracts the shadow before blurring, keeping
   it tucked under the element instead of haloing past its edges. This is the
   detail most hand-written shadows miss, and why stock box-shadow presets
   often look like a glow.

   Opacities are 2-6%. Elevation should be felt, not seen.

   Dark mode is a DIFFERENT shadow, not the same one re-tinted:
     · shadows go up ~10x   — 4% black on #0b0b0b is mathematically
                              invisible; dark needs 30-60% to register at all
     · highlight drops ~6x  — 0.6 white on a dark surface reads as a glowing
                              edge rather than a catch light

   Because the STRUCTURE changes and not just the values, elevation cannot be
   a single token — it needs a per-theme pair, and this is the one place raw
   rgba() outside the token file is acceptable.

   PREFER THE CLASS. `.dock-shadow` in assets/glass.css is the same four
   layers in a form you can actually read and diff against its dark twin.
   The reference implementation started with the constant below and moved
   to the class, for three reasons:

     · it's ~400 characters either way, and four CSS lines beat one string
     · a constant still gets imported and interpolated at every call site,
       so a grep for the shadow finds five hits rather than one definition
     · the arbitrary-value escaping is a live hazard — underscores for
       spaces, no spaces inside the parens, and a typo produces a class the
       build silently drops: no shadow, no error

   The constant is kept here for codebases that can't add a stylesheet. */
export const SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04),0_24px_32px_-8px_rgba(0,0,0,0.06)] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_1px_rgba(0,0,0,0.3),0_8px_16px_-4px_rgba(0,0,0,0.5),0_24px_32px_-8px_rgba(0,0,0,0.6)]";

/** Hover cards and other briefly-floating panels. One ambient layer, no
    contact shadow — it's hovering, not resting. */
export const SHADOW_PANEL =
  "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]";

/** Tooltips. 30% black in BOTH themes — it sits on bg-gray-1000, which is
    near-black in light and near-white in dark, so the SURFACE sets the
    requirement rather than the page. Elevation is relative to what's
    immediately behind, not to the theme. */
export const SHADOW_TIP = "shadow-[0_4px_10px_-4px_rgba(0,0,0,0.3)]";

/* ── The hairline ─────────────────────────────────────────────────────────
   From the TRANSLUCENT ramp, not a solid grey. A solid border doesn't
   participate in what's behind it, so over a photograph it reads as a
   pasted-on frame. And because the alpha ramp inverts to white-based in dark
   mode, this is automatically lighter than its surface there and darker here.

   0.5px renders as a true sub-pixel hairline on retina and rounds UP to 1px
   elsewhere — it degrades to the next weight rather than disappearing. */
const HAIRLINE = "border-[0.5px] border-gray-alpha-400";

export type GlassTier = "nav" | "panel";

/**
 * A glass surface with all three depth cues attached.
 *
 * `tier` picks the material — and the choice is about how little you know
 * about the backdrop, not about size or importance:
 *
 *   nav    20px blur, 72% tint. Fixed chrome that arbitrary content scrolls
 *          under.
 *   panel  24px blur, 97% tint. A floating menu that must stay legible over
 *          anything — including over other glass.
 *
 * `isolate` is on by default because these surfaces usually contain a sliding
 * highlight at -z-10 (see the interface-motion skill). Without it, -z-10
 * would drop the highlight behind the container's own tint instead of just
 * behind the icons.
 */
export function GlassSurface({
  tier = "panel",
  as: Tag = "div",
  isolate = true,
  className = "",
  children,
}: {
  tier?: GlassTier;
  as?: "div" | "ul" | "nav" | "aside";
  isolate?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const material = tier === "nav" ? "glass-nav" : "glass-panel";

  return (
    <Tag
      className={`${material} ${HAIRLINE} ${SHADOW} relative ${
        isolate ? "isolate" : ""
      } rounded-2xl ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   THE WRAPPER / SURFACE SPLIT — the one structural rule to internalise.

   A transform on an ancestor weakens or breaks backdrop-filter in its
   subtree: the blur samples the wrong region, or nothing. So an animating
   menu must be TWO elements — the wrapper animates, the surface blurs, and
   they are never the same node:

     <DropMenu open={open}>              // animates scale + y. No filter.
       <GlassSurface tier="panel">       // filters. Never transformed.
         …
       </GlassSurface>
     </DropMenu>

   Where you can't split them (a surface that must animate itself), fall back
   to glass-panel's 97% tint and treat the blur as decoration.

   This is also a performance win, not just a correctness one: the wrapper
   animates on the compositor (transform and opacity only), and the glass
   child's filter isn't being recomputed against a moving containing block
   every frame.

   Same root cause, second symptom: a transform also makes an element the
   containing block for position: fixed descendants. In the reference
   implementation the fixed nav strip deliberately carries NO transform, so
   the mobile sheet's w-screen full-bleed overlay can span the viewport
   instead of being trapped inside the strip's bounds.

   When something filtered or positioned behaves inexplicably, check every
   ancestor for: transform, filter, perspective, contain, will-change.

   ── And close menus by UNMOUNTING them ─────────────────────────────────
   A backdrop-filter element still pays its full filter pass when it's
   transparent — visibility is decided at composite time, after the filter has
   already run. opacity: 0 and visibility: hidden do NOT save you; unmounting
   (or display: none) is the only thing that does.

     <AnimatePresence>
       {open && <m.div …>{children}</m.div>}
     </AnimatePresence>

   Which also keeps a closed menu out of the tab order.
   ───────────────────────────────────────────────────────────────────────── */
