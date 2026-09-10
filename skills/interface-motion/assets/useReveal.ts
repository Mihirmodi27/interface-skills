import { useEffect } from "react";

/**
 * Adds the `in` class to any `.reveal` element when it scrolls into view.
 * The CSS does all the animating (see motion-tokens.css); this only flips a
 * class.
 *
 * Pass a value that changes on navigation (e.g. the pathname) so the observer
 * re-attaches to the new page's `.reveal` elements after a route change —
 * without it, a client-side navigation leaves the incoming page's content
 * permanently at opacity: 0.
 *
 * THE THIRD GUARD IS NOT IN THIS FILE, and it's the one people miss. A feature
 * check can't catch "JavaScript never ran at all": the CSS ships, `.reveal`
 * applies, and nothing arrives to add `.in`. The reader gets a correct document
 * they cannot see. Put this in the document head, beside where you load the app:
 *
 *   <noscript>
 *     <style>.reveal { opacity: 1 !important; transform: none !important; }</style>
 *   </noscript>
 *
 * The general rule: any CSS that hides content pending JavaScript needs a
 * <noscript> reset. This is a correctness bug, not a nicety — the failure mode
 * is a blank page rather than a plain one.
 */
export function useReveal(dep?: unknown) {
  useEffect(() => {
    // No IntersectionObserver → show everything immediately. Never leave
    // content invisible behind a feature check.
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            // A reveal is one-shot. Re-animating on scroll-back is nauseating,
            // and unobserving keeps the observer's element list shrinking.
            io.unobserve(entry.target);
          }
        }
      },
      // 10% visible, and 40px in from the bottom edge — so an element fires
      // when it's genuinely on screen rather than the instant its top edge
      // crosses the fold.
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}
