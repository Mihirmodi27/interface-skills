# Theming mechanics

The machinery behind laws 9 and 10: how a theme is chosen, stored and applied without a flash, how it changes on a toggle, and which values have to stay runtime so preferences can reach them. Stack-agnostic; framework notes where a stack changes the answer.

## The switch: an attribute, a class, or the media query

| The project has… | Mechanism |
|---|---|
| One theme | None. Declare `color-scheme` and stop |
| Two themes, no toggle, follows the OS | `@media (prefers-color-scheme: dark)` re-declares the tokens. One source of truth, so the media query is fine |
| A toggle | An attribute (`data-theme="dark"`) or a class (`.dark`) on `<html>`, set by script. The media query only *seeds* the first visit |

With a toggle, a media query as the mechanism is two sources of truth: the user picks light, the OS says dark, and the stylesheet fights itself. Once a user has expressed a preference the OS shouldn't win.

Either an attribute or a class works; an attribute reads better when there are more than two values. Whichever it is, every theme block keys off it:

```css
:root                    { color-scheme: light; --surface-page: …; --text-primary: …; }
:root[data-theme="dark"] { color-scheme: dark;  --surface-page: …; --text-primary: …; }
```

Utility frameworks need telling. In Tailwind v4, `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` — the `:where()` keeps specificity at zero, so a `dark:` utility doesn't outrank an unprefixed one merely because of the attribute selector. In Tailwind v3, `darkMode: ["selector", '[data-theme="dark"]']`. A CSS-in-JS theme provider reads the same attribute rather than holding its own state.

### Theme islands

A region that must stay light inside a dark page — an embedded document preview, a code sample styled to match print — can't be made by nesting `data-theme="light"` if the dark selector matches descendants: the ancestor's match still applies all the way down. Re-declare the custom properties on the island's container instead, and give it its own `color-scheme`. That's the payoff of components referencing role variables: a container that re-declares them re-themes everything inside.

## No flash of wrong theme

The theme must be on `<html>` before the first paint. A blocking inline script in `<head>`, before the stylesheet:

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

Four requirements, all load-bearing:

- **Inline.** An external script is a round trip, and the page paints during it.
- **Blocking.** No `async`, no `defer`, no `type="module"` (which defers implicitly).
- **Before the stylesheet**, so the attribute is there when the CSS applies.
- **In `try/catch`.** Storage throws in some private-browsing modes and under some cookie policies; an uncaught throw here stops every script after it.

This duplicates a few lines of the theme module on purpose. Put a comment in both places pointing at the other. The alternative — setting the theme in a component's mount effect — gives every dark-mode visitor a white flash on every load.

**Under SSR**, read the choice from a cookie and render the attribute into the initial HTML; storage isn't readable on the server, so a cookie is the only way to get it there. If a theming library is in use, check that it injects a blocking head script or renders server-side — some only apply the theme after hydration.

## Persistence

Keep three functions apart, because they have different callers:

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

**Compare, don't parse.** Matching the exact stored strings means a stale value, a corrupted entry or a value from an older version falls through to the default. **Wrap every storage access.** A preference that doesn't persist is an annoyance; a thrown exception is a broken page. Keeping `applyTheme` separate from `chooseTheme` is what lets a toggle animate while the first paint doesn't.

## Two states or three

**Two (light, dark).** Predictable: the page doesn't change when the OS crosses sunset, which surprises someone who chose from the page's own menu. Two buttons with `aria-pressed` are simpler to build and to explain than a tri-state.

**Three (light, dark, system).** Respects the OS for people who want to follow their day. It costs two things, and skipping either is the common bug:

1. The head script resolves `system` too, with `matchMedia` inline. The stored choice is now one of three values, so keep a `readChoice()` that returns it, beside `readTheme()` which returns the resolved theme.
2. A live listener, so the page follows the OS *while it's open*:

```ts
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (readChoice() === "system") applyTheme(e.matches ? "dark" : "light");
});
```

A theme that follows the OS on load and then silently stops is worse than not offering the option. Which to ship is a dial (`SKILL.md`).

## The crossfade on toggle

A universal colour transition, added for the toggle and removed straight after:

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

- **Temporary, always.** Left on permanently it applies to every hover in the interface, and every link and row becomes a slow colour fade.
- **`!important`**, to beat each component's own colour transition for that moment, or the crossfade fragments.
- **Pseudo-elements listed**, because `*` doesn't match them and decoration built with them would snap.
- **`ease.colour`, not the standard curve**, if the standard curve overshoots: overshoot on a colour means the page passes its target colour and comes back. Colour has no mass.
- **Inside `no-preference`**, so reduced-motion users get the change instantly.

`duration.theme` and `ease.colour` are owned by the `interface-motion` skill; this is only where they're used.

## `color-scheme`

Declare it in every theme block. It re-tints what CSS can't reach: scrollbar tracks and thumbs, checkbox, radio and select chrome, date pickers, autofill backgrounds, the default canvas before your background paints. Without it the most visible symptom is a white scrollbar track on a black page — which reads as a broken dark mode more than almost anything else.

## Runtime or build-time

| Value | Where it lives | Why |
|---|---|---|
| The role vocabulary — surfaces, text tiers, borders, accent | Custom properties per theme, surfaced through the framework's token system | Themes re-declare them |
| Translucent material tints | Runtime custom properties | `prefers-reduced-transparency` swaps them for solids |
| Lower text tiers, if the project supports it | Runtime custom properties | `prefers-contrast: more` may raise them |
| Gradients, shadow stacks, filter chains | Runtime custom properties or one shared constant | No colour-token system has a slot for them |

"Build-time" means a value the compiler writes into the output as a literal: a Sass variable, a JS constant inlined into styles, a token pipeline that resolves to hex, Tailwind v4's `@theme inline` when it holds a literal. None of those can be re-declared by a media query or a theme attribute. Point the build-time layer at runtime variables — `@theme inline { --color-surface: var(--surface-page); }`, `colors: { surface: "var(--surface-page)" }` — and keep the literals in the theme blocks.

### Preference overrides

Order matters when a preference block re-declares theme values at the same specificity. It comes **after** every theme block and names every theme selector:

```css
@media (prefers-reduced-transparency: reduce) {
  :root, :root[data-theme="dark"] {
    --material-nav-tint: var(--surface-raised);
  }
}
```

That swaps the tint only; dropping the blur is the other half, owned by `surfaces-and-depth`.

In **forced-colours mode** the browser replaces the palette with the user's system colours. Backgrounds and box-shadows vanish; outlines and borders survive. So a focus ring drawn with `outline` survives and one drawn with `box-shadow` disappears, and any state carried only by a background tint disappears with it — another reason law 6 requires a non-colour carrier.

## Where per-theme variants are still needed

Tokens re-tint, so most components need no theme branching. The exceptions are values whose *structure* changes between themes: a shadow whose inset highlight weakens while its ambient layers strengthen several-fold; a two-toned edge that must nearly disappear in dark because it reads as a glowing line there. Extract each to one shared constant with both theme forms.

The test: **can this be one token whose value changes?** If yes, make it a token. If it needs a different structure per theme, it needs a variant — once, in one place.
