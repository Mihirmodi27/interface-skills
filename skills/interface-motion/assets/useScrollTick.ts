import { useEffect, useRef, useState } from "react";

/**
 * The one scroll shape: a `ticking` flag, one requestAnimationFrame, and a
 * passive listener. Every scroll-driven behaviour in the system uses it.
 *
 * `passive: true` tells the browser the handler will never preventDefault, so
 * it can begin scrolling without waiting for your JS. Omitting it is the most
 * common cause of scroll jank.
 *
 * The `ticking` flag collapses a burst of scroll events into one measurement
 * per frame. Don't substitute a time-based throttle — it's either faster than
 * the frame rate (wasted work) or slower (dropped frames). rAF is
 * frame-aligned by construction.
 *
 * `resize` shares the handler because a viewport change invalidates the same
 * measurements a scroll does.
 */
export function useScrollTick(update: () => void, deps: unknown[] = []) {
  const fn = useRef(update);
  fn.current = update;

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          fn.current();
        });
      }
    };

    // Measure once on mount, so a page loaded already scrolled (a deep link,
    // a restored scroll position) starts in the right state.
    fn.current();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Collapse-on-scroll-down with hysteresis. Returns true while the element
 * should be collapsed.
 *
 * Three things at once:
 *
 *   · THRESHOLD px of movement required before the state flips. Without a
 *     dead zone, a 1px jitter — trackpad, rubber-band bounce, or your own
 *     state change altering layout — oscillates forever.
 *
 *   · A zone at the top where it's always expanded. Landing at the top of a
 *     page should look the same however you got there.
 *
 *   · A bottom zone, so a collapsed element never sits over the footer. The
 *     `- 2` absorbs subpixel rounding in the height calculation; an exact
 *     comparison intermittently fails at fractional device pixel ratios.
 *
 * The top/bottom overrides are checked FIRST so they beat the direction
 * logic.
 *
 * `hoverOnly` (default true) bails out entirely on touch devices. This
 * pattern is only safe where a cursor can bring the element back — on a
 * touch screen there is no hover, so collapsing would strand whatever the
 * element contains. The capability check belongs at the point where you
 * decide to HIDE something, not where you reveal it.
 */
export function useCollapseOnScroll({
  threshold = 6,
  topZone = 24,
  hoverOnly = true,
}: { threshold?: number; topZone?: number; hoverOnly?: boolean } = {}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (hoverOnly && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const atBottom =
        y + window.innerHeight >= document.documentElement.scrollHeight - 2;

      if (y < topZone || atBottom) setCollapsed(false);
      else if (y > last + threshold) setCollapsed(true);
      else if (y < last - threshold) setCollapsed(false);
      last = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topZone, hoverOnly]);

  return collapsed;
}

/**
 * Which of the given section ids the reader is currently in — for a table of
 * contents that marks its place.
 *
 * A reading line, not an IntersectionObserver. An observer tells you WHETHER
 * an element is visible, which is the wrong question: several sections are
 * visible at once and the answer changes with element height. A single line
 * answers the actual question — which heading did I most recently pass?
 *
 * Ids must be in document order; the loop breaks at the first section that
 * hasn't crossed the line.
 *
 * IMPORTANT: give every heading a scroll-margin-top just under READING_LINE
 * (scroll-mt-28 = 112px against 120px here). Without it, a jump scrolls the
 * heading to y=0 — ABOVE the line — so the section you just jumped to isn't
 * the active one and the TOC highlights the previous one.
 */
const READING_LINE = 120;

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  // Ids arrive as a fresh array each render, so [ids] would tear down and
  // rebuild the listener continuously. Key the effect on the contents.
  const key = ids.join("|");

  useEffect(() => {
    const list = key ? key.split("|") : [];
    if (list.length === 0) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      let current = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top > READING_LINE) break;
        current = id;
      }

      // Without this clamp a short final section can never become active:
      // you reach the end of the page before its heading crosses the line.
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = list[list.length - 1];

      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}
