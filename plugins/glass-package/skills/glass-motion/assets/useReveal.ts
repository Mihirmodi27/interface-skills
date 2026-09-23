import { useEffect } from "react";

/**
 * Marks any `.reveal` element as arrived, with `data-in`, when it scrolls into
 * view. The CSS does all the animating (see motion-tokens.css); this only sets
 * an attribute.
 *
 * An attribute rather than a class, and that is not a style choice. `class` is a
 * prop React owns: the moment any `.reveal` element gets a className that depends
 * on state, React rewrites the whole attribute from its own value and a class
 * added out here is gone. The element then has `.reveal` with nothing to say it
 * arrived, so it fades to `opacity: 0` — and the observer has already unobserved
 * it, so it never comes back. React doesn't render `data-in`, so it leaves it be.
 *
 * Pass a value that changes on navigation (e.g. the pathname) so the observer
 * re-attaches to the new page's `.reveal` elements after a route change —
 * without it, a client-side navigation leaves the incoming page's content
 * permanently at opacity: 0.
 *
 * THE THIRD GUARD IS NOT IN THIS FILE, and it's the one people miss. A feature
 * check can't catch "JavaScript never ran at all": the CSS ships, `.reveal`
 * applies, and nothing arrives to set `data-in`. The reader gets a correct document
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
      document.querySelectorAll(".reveal").forEach((el) => el.setAttribute("data-in", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in", "");
            // A reveal is one-shot. Re-animating on scroll-back is nauseating,
            // and unobserving keeps the observer's element list shrinking.
            io.unobserve(entry.target);
          }
        }
      },
      // No fractional threshold, deliberately. An element's intersection ratio
      // can never exceed the viewport's height divided by its own, so anything
      // more than ten screens tall can't reach 0.1 however far you scroll, and
      // it sits at opacity 0 for the whole page. The bottom margin does the job
      // the threshold was doing: reveal once the element is 40px inside the
      // viewport, at any height.
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}
