/**
 * The squash-and-stretch floating menu — the shared open/close motion for
 * every menu in the system (a phone nav sheet, a settings drop-up, a socials
 * pill). All of them grow out of a trigger sitting against one edge, so all
 * of them stretch from that edge.
 *
 * The effect comes from letting two springs DISAGREE. See motion-presets.ts
 * for the numbers and the reasoning.
 *
 * Two structural decisions worth keeping:
 *
 * 1. The panel mounts only while open, so a closed menu is out of the tab
 *    order and off the paint. That matters here because the panel carries
 *    backdrop-filter, which is expensive even when invisible.
 *
 * 2. The wrapper is ALWAYS present, so a trigger's aria-controls still
 *    resolves to a real element when the menu is closed.
 *
 * Note this component animates a bare m.div and expects its child to carry
 * the glass. A transform on an ancestor weakens backdrop-filter in its
 * subtree — the wrapper scales, the child blurs, and they must be different
 * elements.
 */

import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { GROW, CROSS, CLOSE } from "./motion-presets";

export type DropPlacement = "up" | "down";

export function DropMenu({
  open,
  placement = "up",
  origin,
  id,
  className = "",
  style,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  open: boolean;
  placement?: DropPlacement;
  /** transform-origin class — defaults to the edge the menu grows from. */
  origin?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  // Start nudged back toward the trigger, so it reads as coming out of it.
  const away = placement === "up" ? 4 : -4;

  // Scale from the anchored edge, or the caller's corner for a menu that
  // hangs off one side of its trigger (e.g. origin-top-left).
  const anchor = origin ?? (placement === "up" ? "origin-bottom" : "origin-top");

  return (
    <div
      id={id}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // Empty and inert when closed, so it can't sit over the page as a trap.
      className={`${className} ${open ? "" : "pointer-events-none"}`}
    >
      <LazyMotion features={domAnimation} strict>
        <AnimatePresence>
          {open && (
            <m.div
              className={anchor}
              /* Open squashes from a real offset; exit only travels part of
                 the way back, because it's disappearing anyway. */
              initial={
                reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.82, scaleX: 0.94, y: away }
              }
              animate={reduce ? { opacity: 1 } : { opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
              exit={
                reduce
                  ? { opacity: 0, transition: CLOSE }
                  : { opacity: 0, scaleY: 0.9, scaleX: 0.97, y: away, transition: CLOSE }
              }
              transition={
                reduce
                  ? { duration: 0.15 }
                  : {
                      scaleY: GROW,  // the grow axis overshoots
                      y: GROW,       // travel rides the same spring, or the
                                     // anchored edge detaches mid-overshoot
                      scaleX: CROSS, // the cross axis arrives late
                      opacity: { duration: 0.14, ease: "easeOut" },
                    }
              }
            >
              {children}
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}
