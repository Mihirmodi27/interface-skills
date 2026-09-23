# The `DESIGN.md` format

One file at the project root. It is the contract between the project and every skill in the adaptable set: the skills read it before touching an interface, and they write decisions back to it when a decision changes.

It is written for two readers at once — a person skimming it to learn the system, and a model looking up one row. That settles most format questions: tables for anything looked up, a sentence of reasoning for anything decided, and **stable section headings**, because the skills find their section by its heading.

## Rules

- **The project's names, always.** The `Name here` column holds whatever the codebase already calls the thing — a Tailwind class, a CSS custom property, a theme key, a component prop. The `Role` column holds the canonical role from `roles.md`. Never rename a project's tokens to match the canonical roles; the mapping is the whole point.
- **Where the project has no name for a role it needs**, propose one in the project's existing naming style and mark it `proposed`. Detect the style from what's there — `--color-text-muted` implies `--color-text-<tier>`; `ink.soft` implies `ink.<adjective>`; a project with evocative names (`dek`, `keyline`, `whisper`) gets evocative proposals. Don't import a naming scheme the project doesn't use.
- **Values as the code states them.** `14px`, `0.875rem`, `text-sm` — whichever the source uses, with the resolved pixel value in parentheses where it's a scale step or a unit conversion. A value that differs per theme gets a column per theme.
- **Contrast is written down, not implied.** Every text tier carries its measured ratio against the surface it's checked on, per theme. Setup computes them with `scripts/contrast.mjs`.
- **Leave out what isn't there.** No dark theme, no dark column. No prose, no `lead` row. An empty row reads as a requirement.
- **Decisions carry a reason and a date.** Anything that moves a dial off its preset, or knowingly breaks a law, goes under `## Decisions`. A skill that meets a decision respects it; a skill that would break a law without one asks first and then records the answer here.
- **Findings are not fixes.** Setup lists what violates a law under `## Open issues` and leaves the code alone unless asked. The list is how a later session knows what's known.

## Template

Copy this shape. Drop any table or row that doesn't apply; add project roles under the canonical role they refine.

````markdown
# Design system

> The interface skills read this before touching UI, and write back to it when a decision changes. Edit it by hand whenever you like — it is the source of truth for intent, the code is the source of truth for values. Set up YYYY-MM-DD.

## Profile

| | |
|---|---|
| Product | One line: what it is and who it's for |
| Reader | What the reader is mostly doing — reading, working, or being persuaded |
| Preset | `editorial` · `product` · `expressive` · `glass` |
| Areas | Routes or directories on a different preset, e.g. `app/(marketing)/** → expressive` |
| Stack | Framework, styling approach, component library |
| Tokens live in | Paths, e.g. `src/styles/tokens.css`, `tailwind.config.ts` |
| Themes | `light`, `dark` — and the mechanism: attribute, class, media query |
| Motion | CSS only, or the library in use |

## Type

**Families** — `family.text`: Inter (self-hosted, `next/font`), `family.mono`: JetBrains Mono.

| Role | Name here | Size | Leading | Tracking | Weight | Tier |
|---|---|---|---|---|---|---|
| `type.title` | `text-title` | 20px | 1.25 | −0.02em | 600 | `text.primary` |
| `type.body` | `text-base` | 15px | 1.6 | 0 | 400 | `text.primary` |
| ↳ `pull-quote` (project role) | `.pull` | 15px | 1.6 | 0 | 400 | `text.primary` — separated by a 3px rule |

**Weights** — `weight.regular` 400, `weight.strong` 600.

## Colour

**Text** — checked against `surface.page` unless noted.

| Role | Name here | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|---|
| `text.primary` | `--ink` | `#16161a` | 17.4:1 | `#ececef` | 16.1:1 |

**Surfaces**, **Lines and fills**, **Signal** — same columns, without ratios except for `focus` (3:1 against its worst surface).

**Exceptions** — each chromatic spend beyond the accent, with what it's for and why that reason can't spread.

## Layout

| Role | Name here | Value |
|---|---|---|
| `measure.reading` | `max-w-prose` | 65ch (≈ 620px) |

Plus the radius ladder, the z-index ladder, breakpoints, and any forks (places where touch and pointer get different components).

## Surfaces

| Level | Surface | Edge | Shadow | Layer |
|---|---|---|---|---|
| `elevation.floating` | `bg-popover` | `border-subtle` | `shadow-md` | `z-popover` |

Plus `material.translucent` tiers, if any, and their fallbacks.

## Motion

| Role | Name here | Value | Used for |
|---|---|---|---|
| `duration.state` | `--dur-fast` | 150ms | hover colour, icon swaps |
| `ease.standard` | `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | everything but colour |

Plus springs by character, and the reduced-motion policy in one sentence.

## Decisions

- YYYY-MM-DD — Three weights, not two: the billing table needs a middle weight for column totals. (`typographic-system` dial override.)

## Open issues

- `text.tertiary` (`--ink-faint`) is 3.1:1 on `surface.subtle` in light — fails 4.5:1. Used in 14 files.
````

## When the file already exists

Read it first; never regenerate over it. Setup's job on a second run is to **reconcile**: re-scan, show what drifted (a token added, a value changed, an issue fixed), and propose edits to the file — keeping every `Decisions` entry and every name the user chose, even where the scan would have proposed something else.
