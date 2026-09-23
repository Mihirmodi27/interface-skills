# Theming

## Why a data attribute, not `prefers-color-scheme`

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Tailwind v4 drives `dark:` off the OS media query by default, which is fine until a theme toggle makes the media query and the user's explicit choice two sources of truth. `data-theme` on `<html>` makes the toggle authoritative. Seed it from `prefers-color-scheme` on a first visit if you want the OS to matter; just don't let the media query be the *mechanism*.

The `&:where(…)` wrapper keeps specificity at zero, so a `dark:` utility doesn't outrank an unprefixed one merely by carrying an attribute selector.

The selector matches the element and its descendants (`[data-theme="dark"] *`), so a nested `data-theme="light"` island doesn't fully work: the ancestor's dark match still applies below it. For a permanently-light region inside a dark page (an embedded document preview, say), re-declare the custom properties on that container instead of nesting the attribute.

## No flash of wrong theme

```html
<head>
  <!-- Before the stylesheet. Blocking on purpose. -->
  <script>
    (function () {
      try {
        document.documentElement.dataset.theme =
          localStorage.getItem("theme") === "dark" ? "dark" : "light";
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="…" />
</head>
```

Four requirements, all load-bearing:

- **Inline.** An external script is a network round trip, and the page paints during it.
- **Blocking.** No `async`, no `defer`, no `type="module"` (which defers implicitly): it must run before the first paint.
- **Before the stylesheet**, so the attribute is set when the CSS applies.
- **In `try/catch`.** `localStorage` throws in Safari private browsing and under some cookie policies, and an uncaught throw here blocks every later script.

This duplicates a few lines of your theme module. Accept it, and leave a comment in each place pointing at the other: the alternative is a full-page white flash on every load for every dark-mode user, the most noticeable bug a themed site can have.

In SSR frameworks, render the attribute server-side from a cookie, which removes the flash entirely. `localStorage` isn't readable on the server, so a cookie is the only way into the initial HTML.

## Persistence and the crossfade

```ts
export type ThemeChoice = "light" | "dark";

const KEY = "theme";

export function getThemeChoice(): ThemeChoice {
  try {
    if (localStorage.getItem(KEY) === "dark") return "dark";
  } catch { /* localStorage unavailable */ }
  return "light";
}

export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.dataset.theme = choice;
}

export function setThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch { /* preference just won't persist */ }

  // Crossfade only on explicit toggles.
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-transition"), 440);
}
```

Three functions for three callers — `getThemeChoice` for initial React state, `applyTheme` for the DOM write, `setThemeChoice` for the user action — which is what lets the toggle animate while the initial paint doesn't.

**Every `localStorage` access is wrapped.** Reads return a default; writes fail silently. A preference that doesn't persist is a minor annoyance; a thrown exception is a broken page.

**The comparison is `=== "dark"`, not a parse.** Anything unrecognised — a stale value, a corrupted entry, a value from an older version of the site — falls through to light.

### The 440ms class

The crossfade is a universal colour transition, added for one interaction and then removed:

```css
@media (prefers-reduced-motion: no-preference) {
  :root.theme-transition,
  :root.theme-transition *,
  :root.theme-transition *::before,
  :root.theme-transition *::after {
    transition: background-color 400ms ease, color 400ms ease, border-color 400ms ease,
      fill 400ms ease, stroke 400ms ease, box-shadow 400ms ease !important;
  }
}
```

**Why temporary.** Left in the stylesheet, this rule applies to every hover on the site: every link, nav icon and row becomes a 400ms colour fade, and the interface goes sluggish. It lives for 440ms (400ms plus a 40ms margin so nothing is cut off), during the one interaction that needs it.

**Why `!important`.** For those 440ms it has to beat every component's own `transition-colors duration-150`; without it, components fade at their own speed and the crossfade fragments.

**Why plain `ease`, not the house curve.** The house easing overshoots. Overshoot on a position reads as momentum; on a colour it sends the background past its target and back — a wobble in the light. Colour has no mass.

**Why 400ms.** The longest duration in the system, for its largest change: every surface, text colour, border, icon fill and shadow at once.

**Why inside `no-preference`.** Opt-in, not opt-out: reduced-motion users still get the theme change, instantly.

**Why `::before` and `::after`.** `*` doesn't match pseudo-elements, so decorative elements built with them would snap while everything else fades.

## `color-scheme`

```css
:root { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }
```

Not decorative. It re-tints the UA-rendered surfaces your CSS can't reach:

- Scrollbar tracks and thumbs
- Form control chrome (checkboxes, radios, select arrows, date pickers)
- The default canvas colour, before your CSS loads
- `<input>` autofill backgrounds
- Text selection defaults

Skip it and the telltale is a white scrollbar track on a black page, which reads as broken dark mode more than almost anything.

## Two states or three?

The reference implementation ships **two** explicit modes, Light and Dark, with Light as the default. No "System."

For two: a theme control should be predictable, and "System" changes the theme when the OS crosses a sunset threshold, which surprises someone who picked it from the site's own menu. Two `aria-pressed` buttons are also simpler to build and explain than a tri-state. For three: following the OS is the more considerate first visit, and some users want the site to follow their day. With three, the shape is:

```ts
type ThemeChoice = "light" | "dark" | "system";

function resolve(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
```

You then owe two things: the head script must resolve `system` too (so it needs the `matchMedia` call inline), and a live listener must keep the page following the OS *while open*:

```ts
window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => { if (getThemeChoice() === "system") applyTheme(resolve("system")); });
```

Skipping the listener is the common bug: the theme follows the OS on load and then stops, which is worse than not offering the option.

## Where `dark:` variants are still needed

Because the tokens re-tint, most components need no theme branching. The exceptions:

**Multi-layer shadows.** A shadow whose *structure* changes between themes (the inset highlight weakening while the ambient shadows strengthen 10×) can't live in one colour token. Extract it to a shared constant:

```tsx
const SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_1px_rgba(0,0,0,0.02),…] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_1px_rgba(0,0,0,0.3),…]";
```

**Ring/border colours as alpha of a specific hue.** `ring-black/[0.06] dark:ring-white/[0.08]` encodes what the alpha ramp does, where the utility won't take a token. Prefer `gray-alpha-*` where you can; use the pair where you can't.

**Anything two-toned by design.** The frosted folder pocket uses `border-white/60 dark:border-white/[0.08]`: a bright top edge that must nearly vanish on dark, where it would read as a glowing line.

The test: **can this be one token whose value changes?** If yes, make it a token. If it needs a different *structure* per theme, it needs a variant.
