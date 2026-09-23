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

/* ── Off the ladder, deliberately ────────────────────────────────────────
   The ladder is for STATE: something changed and the user has to follow it.
   Two categories aren't state, and squeezing them onto the ladder makes
   them worse rather than tighter.

   THE SUBJECT OF THE MOMENT. When the thing animating IS the content, the
   user is looking directly at it and the motion has to read in its own
   right. Note the discipline in the pair below: same component, two
   durations, decided by whether the motion is the subject or the report. */
export const SUBJECT = {
  /** Stepping between images — a noise-thresholded dissolve, not a cut. */
  dissolve: 0.62,
  /** The same image moving between two layouts. On screen at both ends, so
      it only has to be followable — back inside the overlay tier. */
  flight: 0.42,
} as const;

/* A SET PIECE gets its own budget by never appearing again: once per tab,
   never blocking a deep link, never played under reduced motion. See §14 of
   the SKILL.md for the gating. */
export const SET_PIECE = {
  /** The first open of a disclosure, per line. */
  theatreLine: 0.34,
  /** Every subsequent open of the same thing. */
  quietLine: 0.16,
  /** Between staggered children on the first open only. */
  stagger: 0.09,
} as const;

/* ── The curve for a track that also drives a filter ─────────────────────
   NOT --ease-geist. The house curve overshoots past 1, and a blur animating
   to 0px would have to pass through a NEGATIVE radius to settle back.
   Browsers clamp rather than crash, so the symptom isn't an error — it's a
   value stuck at zero for the tail while everything else is still moving,
   which reads as the animation stalling right at the end.

   Applies to any property with a hard floor: blur, brightness, a radius
   going to 0, a scale you've promised won't invert. Expo-out has the same
   "arrives decisively" character without ever leaving [0, 1]. */
export const EASE_FILTER = [0.16, 1, 0.3, 1] as const;

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

/* ── First-open theatre ──────────────────────────────────────────────────
   Staggered lines behind a blur, on the FIRST open only; every subsequent
   open is a quick fade. `theatre` comes from sessionStorage, so it is false
   on the server for everyone and true on the client for most.

   Which is why the shut state below is a CONSTANT. Branch a rendered style
   on a client-only flag and React hands you two different first paints and
   says so in the console. Only the transition reads the flags — a transition
   isn't a style, so there's nothing for hydration to disagree about, and a
   reader who asked for less motion gets a zero-length transition to the same
   end state rather than a different starting position.

   Record "seen" on animation COMPLETE, not on start: setting it earlier
   lands in the same render batch as the open and cancels the very animation
   it's recording. */
export function theatreLine(reduce: boolean | null, theatre: boolean) {
  return {
    shut: { opacity: 0, y: 6, filter: "blur(4px)" },
    open: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: reduce ? 0 : theatre ? SET_PIECE.theatreLine : SET_PIECE.quietLine,
        // A blur is on this track — see EASE_FILTER above.
        ease: EASE_FILTER,
      },
    },
  } as const;
}

/** The parent's stagger. Zero after the first open, so a re-open is instant. */
export function theatreList(theatre: boolean) {
  return {
    open: {
      transition: {
        staggerChildren: theatre ? SET_PIECE.stagger : 0,
        delayChildren: theatre ? 0.06 : 0,
      },
    },
  } as const;
}

/* ── Icon fill ───────────────────────────────────────────────────────────
   Fill means CHOSEN — the page you're on, or the one you're pointing at.
   Nothing is filled because it looks better.

   The filled variant is not a second drawing: it's the same outline with its
   interior painted in, layered OVER the stroke at the same coordinates. The
   silhouette never moves, so the two crossfade in place — no pop, no reflow.

   ease-out, not the house curve: the overshoot is right for travel and wrong
   for a fade. Same split the springs make between position and opacity. */
export const fillFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${
    on ? "opacity-100" : "opacity-0"
  }`;

/** The inverse — interior lines a solid shape swallows (a briefcase's
    divider, a document's rules) have to leave as the fill arrives. */
export const detailFade = (on: boolean) =>
  `transition-opacity duration-200 ease-out motion-reduce:transition-none ${
    on ? "opacity-0" : "opacity-100"
  }`;
