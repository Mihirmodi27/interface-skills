# Theming

## Why a data attribute, not `prefers-color-scheme`

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

The Tailwind v4 default drives `dark:` off the OS media query. That's fine right up until you add a theme toggle, at which point the media query and the user's explicit choice are two sources of truth and you're fighting your own stylesheet.

`data-theme` on `<html>` makes the toggle authoritative. Seed it from `prefers-color-scheme` on a first visit if you want the OS to matter; just don't let the media query be the *mechanism*.

The `&:where(…)` wrapper keeps specificity at zero, so a `dark:` utility doesn't outrank an unprefixed one purely by virtue of the attribute selector.

Also note the selector matches both the element and its descendants (`[data-theme="dark"] *`). That means a nested `data-theme="light"` island doesn't fully work — the ancestor's dark match still applies to everything below. If you need a permanently-light region inside a dark page (an embedded document preview, say), scope it by re-declaring the custom properties on that container rather than by nesting the attribute.

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
- **Blocking.** No `async`, no `defer`, no `type="module"` (which defers implicitly). It must run before the first paint.
- **Before the stylesheet.** So the attribute is set when the CSS is applied.
- **In `try/catch`.** `localStorage` throws in Safari private browsing and under some cookie policies. An uncaught throw here blocks all subsequent scripts.

This duplicates a few lines of your theme module. Accept the duplication — the alternative is a full-page white flash on every load for every dark-mode user, which is the single most noticeable bug a themed site can have. Add a comment in both places pointing at the other.

For SSR frameworks, the equivalent is rendering the attribute server-side from a cookie, which removes the flash entirely. `localStorage` isn't readable on the server, so a cookie is the only way to get it into the initial HTML.

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

  // Play a brief crossfade only on explicit toggles.
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(choice);
  window.setTimeout(() => root.classList.remove("theme-transition"), 440);
}
```

Three separate functions because they have different callers: `getThemeChoice` for initial React state, `applyTheme` for the DOM write, `setThemeChoice` for the user action. Keeping them apart is what lets the toggle animate while the initial paint doesn't.

**Every `localStorage` access is wrapped.** Reading returns a default; writing fails silently. A theme preference that doesn't persist is a minor annoyance; a thrown exception is a broken page.

**The comparison is `=== "dark"`, not a parse.** Anything unrecognised — a stale value, a corrupted entry, a value from an older version of the site — falls through to light. Defensive by construction.

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

**Why it has to be temporary.** Left in the stylesheet permanently, this rule applies to every hover state on the site — every link, every nav icon, every row becomes a 400ms colour fade. The whole interface goes sluggish. It exists for 440ms (400ms duration + a 40ms margin so nothing is cut off) during the one interaction that needs it.

**Why `!important`.** It has to beat every component's own `transition-colors duration-150` for those 440ms. Without it, components with their own colour transitions animate at their own speed and the crossfade fragments.

**Why plain `ease`, not the house curve.** The house easing overshoots. Overshoot on a position reads as momentum; overshoot on a colour interpolation means the background travels past its target colour and comes back — a wobble in the light. Colour has no mass.

**Why 400ms.** The longest duration in the system, for the largest change in the system: every surface, text colour, border, icon fill and shadow, simultaneously.

**Why inside `no-preference`.** Opt-in rather than opt-out. Reduced-motion users still get the theme change; they get it instantly.

**Why `::before` and `::after` are listed.** Pseudo-elements aren't matched by `*`. Decorative elements built with them would otherwise snap while everything else fades.

## `color-scheme`

```css
:root { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }
```

Not decorative. It tells the browser to re-tint UA-rendered surfaces your CSS can't reach:

- Scrollbar tracks and thumbs
- Form control chrome (checkboxes, radios, select arrows, date pickers)
- The default canvas colour, before your CSS loads
- `<input>` autofill backgrounds
- Text selection defaults

Skip it and the most visible symptom is a white scrollbar track on a black page — which reads as a broken dark mode more than almost anything else.

## Two states or three?

The reference implementation ships **two** explicit modes: Light and Dark, with Light as the default. No "System."

The argument for two: a theme control should be predictable. "System" means the theme changes when the user's OS crosses a sunset threshold, which is surprising if they picked it from a site's own menu. Two buttons with `aria-pressed` are also simpler to build and to explain than a tri-state.

The argument for three: respecting the OS by default is the more considerate first-visit behaviour, and some users genuinely want the site to follow their day.

If you go with three, the shape is:

```ts
type ThemeChoice = "light" | "dark" | "system";

function resolve(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
```

Two things you now owe the user: the head script has to resolve `system` too (so it needs the `matchMedia` call inline as well), and you need a live listener so the page follows the OS *while open*:

```ts
window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => { if (getThemeChoice() === "system") applyTheme(resolve("system")); });
```

Skipping the listener is the common bug: the theme follows the OS on load but then stops, which is worse than not offering the option.

## Where `dark:` variants are still needed

Because the tokens re-tint, most components need no theme branching at all. The exceptions:

**Multi-layer shadows.** A shadow that changes *structure* between themes (the inset highlight weakening while the ambient shadows strengthen 10×) can't live in a single colour token. Extract it to a shared constant:

```tsx
const SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_1px_rgba(0,0,0,0.02),…] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_1px_rgba(0,0,0,0.3),…]";
```

**Ring/border colours expressed as alpha of a specific hue.** `ring-black/[0.06] dark:ring-white/[0.08]` — the same information the alpha ramp encodes, in a case where the utility doesn't take a token. Prefer `gray-alpha-*` where you can; use the pair where you can't.

**Anything genuinely two-toned by design.** The frosted folder pocket uses `border-white/60 dark:border-white/[0.08]`: a bright top edge that has to nearly disappear on dark, because on a dark surface it reads as a glowing line.

The test for whether you need a `dark:` variant: **can this be expressed as one token whose value changes?** If yes, make it a token. If it needs a different *structure* per theme, it needs a variant.
