/**
 * Theme persistence. Two explicit modes, Light or Dark; Light is the default.
 * The choice sticks in localStorage and is reflected on <html> via data-theme,
 * which the dark token overrides key off (see color-tokens.css).
 *
 * Three separate functions because they have different callers:
 * getThemeChoice for initial React state, applyTheme for the DOM write,
 * setThemeChoice for the user action. Keeping them apart is what lets the
 * toggle animate while the initial paint doesn't.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PAIR THIS WITH THE HEAD SCRIPT AT THE BOTTOM OF THIS FILE. Without it,
 * every load flashes white before React mounts — the single most noticeable
 * bug a themed site can have.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type ThemeChoice = "light" | "dark";

const KEY = "theme";

/**
 * The comparison is `=== "dark"`, not a parse: anything unrecognised — a
 * stale value, a corrupted entry, a value from an older version of the site —
 * falls through to light.
 *
 * Every localStorage access is wrapped. It throws in Safari private browsing
 * and under some cookie policies. A preference that doesn't persist is a
 * minor annoyance; an uncaught throw is a broken page.
 */
export function getThemeChoice(): ThemeChoice {
  try {
    if (localStorage.getItem(KEY) === "dark") return "dark";
  } catch {
    /* localStorage unavailable */
  }
  return "light";
}

export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.dataset.theme = choice;
}

export function setThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* preference just won't persist */
  }

  /* The crossfade class is added for one interaction and then removed.
     Left in the stylesheet permanently it would apply to every hover state
     on the site — every link, every icon, every row becomes a 400ms colour
     fade and the whole interface goes sluggish.

     440ms = the 400ms transition plus a 40ms margin so nothing is cut off. */
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-transition"), 440);
}

/* ─────────────────────────────────────────────────────────────────────────
   The no-flash head script. Copy this into index.html, inline, in <head>,
   BEFORE the stylesheet. It duplicates the read above on purpose.

     <script>
       (function () {
         try {
           document.documentElement.dataset.theme =
             localStorage.getItem("theme") === "dark" ? "dark" : "light";
         } catch (e) {}
       })();
     </script>

   All four properties are load-bearing:
     · INLINE      — an external file is a network round trip, and the page
                     paints during it
     · BLOCKING    — no async, no defer, no type="module" (which defers
                     implicitly); it must run before the first paint
     · BEFORE CSS  — so the attribute is set when the stylesheet applies
     · try/catch   — an uncaught throw here blocks all subsequent scripts

   For SSR, render the attribute server-side from a cookie instead —
   localStorage isn't readable on the server, so a cookie is the only way to
   get the value into the initial HTML.
   ───────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────
   Adding a third "system" state, if you want it.

   The reference implementation ships two explicit modes because a theme
   control should be predictable — "System" means the theme changes when the
   OS crosses a sunset threshold, which is surprising if you picked it from a
   site's own menu. But respecting the OS on a first visit is the more
   considerate default. Both positions are defensible.

   If you go to three, you owe the user two extra things:

     export type ThemeChoice = "light" | "dark" | "system";

     function resolve(choice: ThemeChoice): "light" | "dark" {
       if (choice !== "system") return choice;
       return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
     }

   1. The head script must resolve "system" too, so it needs the matchMedia
      call inlined as well.

   2. A live listener, so the page follows the OS WHILE OPEN:

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
          "change",
          () => { if (getThemeChoice() === "system") applyTheme(resolve("system")); }
        );

      Skipping this is the common bug: the theme follows the OS on load and
      then silently stops, which is worse than not offering the option.
   ───────────────────────────────────────────────────────────────────────── */
