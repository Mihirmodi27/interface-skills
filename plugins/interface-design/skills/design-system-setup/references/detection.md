# Reading a codebase's design system

Where each kind of project keeps its decisions, and what to read once `scan.mjs` has pointed you at the right files. The scan counts; this is how to interpret what it counted.

## Where the tokens live

| Stack signal | Look in | Notes |
|---|---|---|
| Tailwind v4 (`@theme` in the scan's signals) | The CSS file with the `@theme` block — usually `app/globals.css`, `src/index.css`, `src/styles/*.css` | Tokens are custom properties in namespaces (`--color-*`, `--text-*`, `--radius-*`, `--ease-*`) and are used as utilities, so a token with no `var()` uses can still be everywhere. The scan's "utility" count is the one to read |
| Tailwind v3 (`tailwind.config.*` present) | `theme.extend` in the config, plus any `@layer base` custom properties | Values in `theme` (not `extend`) *replace* Tailwind's defaults — note which scales were replaced, because that's a deliberate ladder |
| shadcn/ui (`components.json`) | The CSS variables block it generated (`--background`, `--foreground`, `--muted-foreground`, `--border`, `--ring`, …) and `components/ui/*` | The names are already semantic, and many map one-to-one onto canonical roles. `--muted-foreground` is almost always `text.secondary` or `text.tertiary` — check its contrast before deciding which |
| CSS custom properties only | Whichever file the scan lists first under "Where tokens are declared" | Look for a `:root` block and a theme block (`[data-theme="dark"]`, `.dark`, or a media query) |
| Sass (`sass` dependency) | `_variables.scss`, `_tokens.scss`, `abstracts/`, `settings/` | Sass variables compile away, so the scan's custom-property table will be thin. Read the partials directly |
| CSS-in-JS (`styled-components`, `@emotion/react`, `@stitches/react`, `@vanilla-extract/css`, `@pandacss/dev`) | The theme object: `theme.ts`, `stitches.config.ts`, `*.css.ts`, `panda.config.ts` | Values live in JS, so the scan finds them as literals. Tokens are the object's keys |
| A component library (`@mui/material`, `@chakra-ui/react`, `@mantine/core`, `@radix-ui/themes`) | The `createTheme` / `extendTheme` call, or the `Theme` provider's props | The library supplies a full system; the project's decisions are the *overrides*. Map the library's roles, then record the overrides as the project's dials |
| Design tokens JSON (`tokens.json`, Style Dictionary, Tokens Studio) | The JSON source, not the generated output | The generated CSS is downstream. Point `DESIGN.md` at the source file |

## Fonts

- **`next/font`** — the import in the root layout names the family, the weights loaded and the CSS variable it's exposed as. Weights loaded is a strong hint at weights *intended*.
- **`@font-face`** — the `font-weight` ranges declared are what exists; anything else is faux-bolded by the browser.
- **Google Fonts `<link>`** — the `wght@` list in the URL.
- **System stack only** — the project has chosen not to ship a font. Record it as a decision, not an absence.

A family loaded at five weights and used at two is worth a line in open issues: the other three are download cost with no job.

## Themes

| Signal | Mechanism |
|---|---|
| `data-theme` attribute | An explicit toggle that can override the OS — the more robust setup |
| `.dark` class / `dark:` variant | The same, via a class. Check whether Tailwind's dark variant is set to the class or to the media query |
| `prefers-color-scheme` only | Follows the OS with no override. A toggle can't be added without changing the mechanism |
| `color-scheme` missing | Native scrollbars and form controls won't re-tint. An open issue if there's a dark theme |

Look for the pre-paint script as well: a theme set by React after hydration flashes the wrong theme on every load.

## Motion

- **CSS** — `transition` and `animation` declarations, `@keyframes`, and any duration or easing custom properties.
- **Motion / Framer Motion** — `transition={{ … }}` props, `variants` objects, shared presets (often a `motion.ts` or `transitions.ts`). Durations there are **seconds**, not milliseconds; the scan reports them as bare numbers.
- **GSAP, React Spring** — timelines and `config` objects. React Spring's `tension`/`friction` map roughly to stiffness/damping.
- **Reduced motion** — `prefers-reduced-motion` in CSS, `useReducedMotion()`, `MotionConfig reducedMotion`, Tailwind's `motion-safe:`/`motion-reduce:`. Note *what* happens under it — removed entirely, or replaced with a fade? The motion skill treats those very differently.

## Reading a component

The scan can't tell you how values combine. Three components read end to end tell you most of it:

1. **A page** — the reading measure, the heading sizes, the section rhythm, what the `h1` looks like.
2. **A card or list row** — the radius, the border, the surface, the hover state, the text tiers inside it.
3. **A menu, popover or dialog** — the elevation, the z-index, the open and close motion, focus handling.

Between them you will see the roles in use, which is what the mapping needs. A value that looks like a token but is never used together with its siblings is often a leftover.
