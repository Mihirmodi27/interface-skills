# Presets

The laws in each skill hold under every preset. What a preset changes is the **dials**: how far the type scale may climb, how many weights there are, how much colour is spent and where, how long motion runs, how much of the page is allowed to be loud.

A preset is a starting character, not a costume. Pick the one whose *reader* matches the project's reader, record it in `DESIGN.md`, and then override individual dials where the project has a reason to. The override goes in the file with its reason — a dial moved without a reason is how a system turns back into a pile of values.

Each skill owns the numbers for its own dials, in its `## Dials` section. This file only sets the character and says, in a line per domain, what that character means. When the two ever disagree, the skill wins, and this file is the one to fix.

## How to pick

Ask what the reader is doing.

| If the reader is mostly… | Preset |
|---|---|
| Reading — articles, docs, a portfolio, a changelog, anything where the text is the product | `editorial` |
| Working — scanning, comparing, entering data, coming back every day | `product` |
| Being persuaded — landing pages, launches, campaigns, a brand site seen once | `expressive` |
| On a project that has adopted the Glass package wholesale | `glass` |

Mixed projects are normal. A SaaS app with a marketing site and docs is `product` with two areas overridden: the marketing routes `expressive`, the docs `editorial`. Record areas by route or directory, not by feeling, so a skill touching a file can tell which character applies.

When the evidence doesn't settle it, propose one, say what evidence you used, and ask. Don't guess silently — the preset shapes every later decision.

## `editorial`

*The interface should disappear so the reading doesn't.* Restraint is the point, and a single loud moment reads as craft because nothing else competes with it.

- **Type** — a short, dense ladder with a low ceiling; the page title only modestly above body. Two weights. Roles that share a size separate on weight, leading or a rule.
- **Colour** — near-monochrome. One accent, spent on focus. At most one further chromatic exception, justified structurally. Links usually in the text colour.
- **Layout** — one reading measure every page shares; rails and asides live outside it. Generous, asymmetric vertical rhythm.
- **Surfaces** — mostly flat. Elevation reserved for things that float; translucency, if any, only on chrome.
- **Motion** — short, and only where it makes a change legible. Nothing loops. One set piece, at most, once a session.

## `product`

*The interface is a tool, and the reader is fluent in it.* Density, predictability and scannability beat atmosphere. Signal has to survive a screen full of data.

- **Type** — tighter, smaller steps; UI and data roles dominate. Two weights, strong at 500; labels in sentence case, never uppercase eyebrows. Tabular figures anywhere numbers align.
- **Colour** — near-monochrome neutral ground with a real status palette (danger, warning, success, info), each a foreground/background pair. One accent hue for primary action and focus, and no second highlight hue. Colour marks what needs a person, not what is finished. Colour for meaning, never for decoration.
- **Layout** — an app shell rather than a single measure: a collapsible sidebar holding all navigation (no top bar), content, and inspector regions, each with its own width rules. Sections stack, each opened by its heading; no bento mosaics or stat tiles. Tighter spacing, still grouped asymmetrically. Prose inside the product (settings help, empty-state copy) still sits at a reading measure.
- **Surfaces** — content unboxed on the page, rows parted by hairlines; a card only for one object, never a card in a card. A clear, small elevation ladder: flat page, raised cards, floating menus, modal overlays. Hairlines do more work than shadows.
- **Motion** — shortest of the three. State feedback is near-instant; nothing delays a repeated action. Springs only where something is dragged or thrown.

## `expressive`

*The interface is making an impression, usually once.* Scale, colour and motion are allowed to carry brand — but still by rule, or it turns into a template.

- **Type** — a real display tier far above body, possibly a second family for it. Wider scale, still assigned to roles rather than derived from a ratio. Tracking correction matters most here.
- **Colour** — a brand palette used broadly, with rules about where each colour may go. Chromatic exceptions still named and counted, just more of them.
- **Layout** — sections may break the reading measure and go full-bleed; the measure still governs any paragraph longer than two lines.
- **Surfaces** — depth, gradients and translucency allowed as brand material, each with its fallback.
- **Motion** — longer and more characterful on entrances; exits still get out of the way. A few set pieces, each once. Reduced motion still gets a real alternative.

## `glass`

The Glass package's exact values: `editorial` in character, with every dial already decided on [modimihir.com](https://modimihir.com). Offer it only when the Glass package skills (`glass-typography`, `glass-color`, `glass-layout`, `glass-and-depth`, `glass-motion`) are installed — setup copies its values from them into `DESIGN.md`, in the project's own names wherever the project already has names, and those skills supply the exact recipes and components.

A `glass` project can still override a dial. It should expect to: the Glass values were chosen for one text-heavy portfolio, and a project that isn't one will find the places they don't fit.
