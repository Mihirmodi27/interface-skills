/**
 * Motion presets — every spring and tween in the system, with the
 * reduced-motion substitutes.
 *
 * Two vocabularies appear here on purpose:
 *   bounce + duration          — a designer's controls; predictable arrival
 *   stiffness + damping + mass — needed when the RELATIONSHIP between two
 *                                springs is the effect (see GROW / CROSS)
 *
 * The one rule that applies to all of them: opacity never springs. Position
 * wants physics, opacity wants a curve. A spring on opacity overshoots past
 * its clamp and hitches on the way back — a visible flicker at the tail of
 * every fade.
 */

/* ── Shared element re-targeting ─────────────────────────────────────────
   A highlight or tooltip sliding to a new item. bounce is near the floor of
   "perceptibly springy" on purpose: this is a thing MOVING, not a thing
   ARRIVING. Bounce implies a moment of settling, and a highlight that
   settles at every stop draws attention to itself instead of to the item
   it's marking. */
export const SLIDE = {
  type: "spring",
  bounce: 0.2,
  duration: 0.4,
  opacity: { duration: 0.16, ease: "easeOut" },
} as const;

/* ── The one playful moment ──────────────────────────────────────────────
   Cards rising out of a folder on hover. 40% more bounce and 25% more
   duration than anything else in the system. That it's the ONLY such moment
   is why it works: against a baseline of restraint, one exuberant
   interaction reads as craft. Three of them read as a template. */
export const LIFT = { type: "spring", bounce: 0.28, duration: 0.5 } as const;

/* ── Squash and stretch, out of physics ──────────────────────────────────
   Two springs of deliberately different character, applied to the two axes
   of one panel. Every difference pushes the same direction — GROW is fast
   and loose, CROSS is slow and controlled:

     stiffness  620 vs 380   GROW pulls harder, moves sooner
     damping     19 vs  30   GROW resists less, overshoots
     mass      0.85 vs   1   GROW is lighter, accelerates faster

   Through the overshoot the panel is briefly TALLER and NARROWER than it
   ends up, then settles. Squash and stretch emerging from physics rather
   than a hand-authored timeline — interruptible and velocity-aware for free.

   Generalises: when two axes of one element move together, giving them
   different springs creates deformation, and deformation reads as mass. */
export const GROW = { type: "spring", stiffness: 620, damping: 19, mass: 0.85 } as const;
export const CROSS = { type: "spring", stiffness: 380, damping: 30 } as const;

/* ── Closing ─────────────────────────────────────────────────────────────
   A tween, not a spring. easeIn, so it accelerates away rather than
   decelerating in. 130ms, well under the state tier.

   A bounce on the way out reads as the interface being reluctant, and it
   stands between the user and whatever they're reaching for next.
   Entrances can have character; exits should get out of the way. */
export const CLOSE = { duration: 0.13, ease: "easeIn" } as const;

/* ── Reduced motion ──────────────────────────────────────────────────────
   Substitute, don't subtract. The preference exists because large-area or
   accelerating motion is physically unpleasant for some users — it is not a
   preference for a static interface. A user who sets it still needs to know
   that a menu opened.

   Flat, state-tier, no overshoot. The state change stays legible; the
   physics goes away. */
export const FLAT = { duration: 0.15 } as const;

/** Pick the spring or its flat substitute. `reduce` from useReducedMotion(). */
export function motionOr<T>(reduce: boolean | null, animated: T) {
  return reduce ? FLAT : animated;
}

/* ── Duration ladder, for inline JS use ──────────────────────────────────
   Mirrors motion-tokens.css. Seconds, because that's what Motion takes. */
export const DURATION = {
  micro: 0.1,
  state: 0.15,
  popover: 0.2,
  route: 0.26,
  overlay: 0.3,
  theme: 0.4,
} as const;

/* ── Blur crossfade ──────────────────────────────────────────────────────
   Text swapping in place — a wordmark revealing its tagline on hover, say.
   Note the asymmetry (280 in / 180 out): same principle as the springs.

   Blur is the vestibular trigger; the fade isn't. So reduced motion swaps
   only the blur amount to 0px and keeps the crossfade. Animating
   blur(0px) → blur(0px) is a no-op the browser optimises away, so this needs
   no second code path. */
export function blurCrossfade(reduce: boolean | null) {
  const blur = reduce ? "blur(0px)" : "blur(4px)";
  return {
    initial: { opacity: 0, filter: blur },
    animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.28, ease: "easeOut" } },
    exit: { opacity: 0, filter: blur, transition: { duration: 0.18, ease: "easeIn" } },
  } as const;
}
