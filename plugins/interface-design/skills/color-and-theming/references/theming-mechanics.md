# Theming mechanics

The machinery behind laws 9 and 10, with notes where a framework changes the answer.

## The switch: an attribute, a class, or the media query

| The project has… | Mechanism |
|---|---|
| One theme | None. Declare `color-scheme` and stop |
| Two themes, no toggle, follows the OS | `@media (prefers-color-scheme: dark)` re-declares the tokens. One source of truth, so the media query is fine |
| A toggle | An attribute (`data-theme="dark"`) or a class (`.dark`) on `<html>`, set by script. The media query only *seeds* the first visit |

An attribute suits more than two values. Every theme block keys off it:

```css
:root                    { color-scheme: light; --surface-page: …; --text-primary: …; }
:root[data-theme="dark"] { color-scheme: dark;  --surface-page: …; --text-primary: …; }
```

Utility frameworks need telling. In Tailwind v4, `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` — the `:where()` keeps specificity at zero, so a `dark:` utility doesn't outrank an unprefixed one just for the attribute selector. Tailwind v3: `darkMode: ["selector", '[data-theme="dark"]']`. A CSS-in-JS provider reads the same attribute instead of holding its own state.

### Theme islands

A region that must stay light in a dark page — an embedded document preview, a print-styled code sample — can't nest `data-theme="light"` if the dark selector matches descendants: the ancestor's match applies all the way down. Re-declare the custom properties and `color-scheme` on its container; since components reference role variables, everything inside re-themes.

## No flash of wrong theme

The theme must be on `<html>` before first paint:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("theme");
      document.documentElement.dataset.theme = t === "dark" || t === "light" ? t
        : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

Inline, since an external script is a round trip the page paints during; blocking, with no `async`, `defer` or `type="module"` (which defers implicitly); before the stylesheet, so the attribute is there when the CSS applies; in `try/catch`, because storage throws in some private-browsing modes and cookie policies, and an uncaught throw stops every script after it. It duplicates the theme module on purpose; comment each to point at the other. Setting the theme in a mount effect instead flashes every dark-mode visitor white on every load.

**Under SSR** a cookie is the only way, since the server can't read storage. Check that a theming library injects a blocking head script or renders server-side — some apply the theme only after hydration.

## Persistence

Keep three functions apart; they have different callers:

```ts
type Theme = "light" | "dark";

export function readTheme(): Theme {          // initial UI state — mirrors the head script
  try {
    const t = localStorage.getItem("theme");
    if (t === "dark" || t === "light") return t;
  } catch {}
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function applyTheme(t: Theme): void {  // the DOM write
  document.documentElement.dataset.theme = t;
}
export function chooseTheme(t: Theme): void { // the user's action
  try { localStorage.setItem("theme", t); } catch {}
  applyTheme(t);                               // plus the crossfade, below
}
```

**Compare, don't parse:** exact matching lets a stale, corrupted or older-version value fall through to the default. **Wrap every storage access:** a lost preference is an annoyance; a thrown exception is a broken page. Keeping `applyTheme` apart from `chooseTheme` lets the toggle animate and the first paint not.

## Two states or three

**Two (light, dark)** is predictable, and two buttons with `aria-pressed` are simpler to build and explain than a tri-state.

**Three (light, dark, system)** costs two things; skipping either is the common bug:

1. The head script resolves `system` too, with `matchMedia` inline, and a `readChoice()` returning the stored three-way choice sits beside `readTheme()`, which returns the resolved theme.
2. A live listener, so the page follows the OS *while it's open*:

```ts
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (readChoice() === "system") applyTheme(e.matches ? "dark" : "light");
});
```

Following the OS on load and then silently stopping is worse than not offering the option. Which to ship is a dial (`SKILL.md`).

## The crossfade on toggle

A universal colour transition, added for the toggle and removed after:

```css
@media (prefers-reduced-motion: no-preference) {
  :root.theme-changing,
  :root.theme-changing *,
  :root.theme-changing *::before,
  :root.theme-changing *::after {
    transition: background-color var(--duration-theme) var(--ease-colour),
      color var(--duration-theme) var(--ease-colour),
      border-color var(--duration-theme) var(--ease-colour),
      fill var(--duration-theme) var(--ease-colour),
      stroke var(--duration-theme) var(--ease-colour) !important;
  }
}
```

```ts
root.classList.add("theme-changing");
applyTheme(t);
setTimeout(() => root.classList.remove("theme-changing"), durationTheme + 40);
```

- **Temporary, always.** Left on, every hover, link and row becomes a slow colour fade.
- **`!important`**, to beat each component's own colour transition, or the crossfade fragments.
- **Pseudo-elements listed**: `*` doesn't match them, and decoration built with them would snap.
- **`ease.colour`, not the standard curve**, if that overshoots: an overshooting colour passes its target and returns. Colour has no mass.
- **Inside `no-preference`**, so reduced-motion users get the change instantly.

`duration.theme` and `ease.colour` belong to the `interface-motion` skill.

## `color-scheme`

In every theme block. Beyond scrollbar tracks and thumbs it re-tints checkbox, radio and select chrome, date pickers, autofill and the default canvas before your background paints; a white scrollbar track reads as broken dark mode like little else.

## Runtime or build-time

| Value | Where it lives | Why |
|---|---|---|
| The role vocabulary — surfaces, text tiers, borders, accent | Custom properties per theme, surfaced through the framework's token system | Themes re-declare them |
| Translucent material tints | Runtime custom properties | `prefers-reduced-transparency` swaps them for solids |
| Lower text tiers, if the project supports it | Runtime custom properties | `prefers-contrast: more` may raise them |
| Gradients, shadow stacks, filter chains | Runtime custom properties or one shared constant | No colour-token system has a slot for them |

"Build-time" is any value compiled to a literal — a Sass variable, an inlined JS constant, a token pipeline resolving to hex, Tailwind v4's `@theme inline` holding a literal — which no media query or theme attribute can re-declare. Keep literals in the theme blocks and point the build-time layer at them: in Tailwind v4, `@theme` entries, or `@theme inline { --color-surface: var(--surface-page); }` so themes can re-declare them; in a Tailwind config, `theme.extend.colors` entries set to `var(--…)`, as in `colors: { surface: "var(--surface-page)" }`; in a JS theme object, keys holding the same `var()` references.

### Preference overrides

After every theme block, naming every theme selector:

```css
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --material-nav-tint: var(--surface-raised);
  }
}
```

That swaps the tint only; dropping the blur is the other half, owned by `surfaces-and-depth`.

In **forced-colours mode** system colours replace the palette: backgrounds and box-shadows vanish, outlines and borders survive — and with them goes a `box-shadow` focus ring and any state carried only by a background tint (law 6).

## Where per-theme variants are still needed

Tokens re-tint, so most components need no theme branching. The exceptions change *structure*: a shadow whose inset highlight weakens while its ambient layers strengthen several-fold; a two-toned edge that must nearly vanish in dark, where it reads as a glowing line. The test: **can this be one token whose value changes?** If not, it needs a variant — once, as one shared constant holding both theme forms.
