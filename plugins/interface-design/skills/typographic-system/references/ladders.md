# Ladders, per preset

Worked ladders for the three adaptable presets, and how to extend or cut one. The numbers assume an ordinary x-height; move them for your family, and record the move.

## Against modular scales

The standard advice is a base and a ratio. From 14px at 1.25×:

```
14 → 17.5 → 21.88 → 27.34 → 34.18
```

Three problems, under every preset:

- **Too few sizes where the chrome lives.** Between 11 and 16px sit tooltips, tags, timestamps, labels, nav rows and paragraphs — five or six densities; the ratio offers 14 and then 17.5.
- **Sizes nobody asked for.** 22, 27 and 34 arrive whether a role needs them or not, and one template using 27px "for variety" is how a scale stops being one.
- **Fractions.** 17.5 and 21.88 round differently across engines, and small subpixel type shows hinting artefacts.

A ratio can sanity-check *gaps* — a heading under about 1.15× the body relies on weight alone — but never produces sizes.

## Editorial

Body 17px, the title modestly above it, so the reading is the loudest thing on the page.

| Role | Size | Leading | Tracking | Weight | Tier | Separates on |
|---|---|---|---|---|---|---|
| `type.title` | 24 | 1.25 | −0.02em | strong | `text.primary` | size |
| `type.heading` | 20 | 1.3 | −0.015em | strong | `text.primary` | size |
| `type.subheading` | 17 | 1.4 | 0 | strong | `text.primary` | weight, tight leading, space above |
| `type.lead` | 17 | 1.85 | 0 | regular | `text.primary` | leading |
| `type.body` | 17 | 1.7 | 0 | regular | `text.primary` | the baseline |
| `type.supporting` | 17 | 1.5 | 0 | regular | `text.secondary` | tier, tighter leading |
| pull quote (project role) | 17 | 1.7 | 0 | regular | `text.primary` | a bar and an indent |
| `type.ui` | 15 | 1 / 1.4 | 0 | regular | `text.secondary` | size, curve |
| `type.meta` | 14 | 1.5 | 0 | regular | `text.tertiary` | size, tier |
| `type.label` | 13 | 1.3 | 0 | regular | `text.secondary` | size |
| `type.code` | 15 | 1.6 | 0 | regular, mono | `text.secondary` | family |
| tooltip (project role under `type.meta`) | 12 | 1 | +0.01em | regular | `text.inverse` | the floor |

Seven sizes above the floor; ceiling 24 ÷ 17 = 1.41. Four roles share 17px, each owning a signal. A subheading and a keyline (if the project has one) both take `weight.strong`: the subheading separates on tight leading and asymmetric space (it belongs to what follows), the keyline on open leading and symmetric space.

## Product

Body 14px, chrome at 13. UI and data roles dominate; two weights, with strong at 500, so a heading is found by size and tier without going heavy — or a recorded third for headings (below).

| Role | Size | Leading | Tracking | Weight | Tier | Separates on |
|---|---|---|---|---|---|---|
| `type.title` | 20 | 1.3 | −0.02em | strong | `text.primary` | size |
| `type.heading` | 16 | 1.35 | −0.02em | strong | `text.primary` | size |
| `type.subheading` | 14 | 1.4 | −0.02em | strong | `text.primary` | weight, tracking |
| `type.body` | 14 | 1.5 | 0 | regular | `text.primary` | the baseline |
| `type.supporting` | 14 | 1.45 | 0 | regular | `text.secondary` | tier |
| `type.ui` | 13 | 1 / 1.4 | 0 | regular; strong when active | `text.secondary` | size, curve |
| `type.data` | 13 | 1 | 0 | regular; totals strong | `text.primary` | tabular figures |
| `type.label` | 12 | 1.3 | 0 | regular | `text.secondary` | tier |
| `type.meta` | 12 | 1.4 | 0 | regular | `text.tertiary` | tier |
| group label (project role under `type.label`) | 12 | 1.3 | 0, sentence case | regular | `text.tertiary` | a hairline rule beneath |
| `type.code` | 12.5 | 1.5 | 0 | regular, mono | `text.secondary` | family |

Five sizes plus code; ceiling 20 ÷ 14 = 1.43, and the dial allows up to 22 if a dashboard title needs it. The 12.5 compensates for a family rather than serving a role: monospace runs wide and steps down to fill the same measure. Only a product that shows code has the row; IDs, codes and times otherwise stay in the text face, tabular with a slashed zero.

Headings from 14px take −0.02em as a role signal (the tracking dial); a figure or title at 24px and over, if the ladder has one, takes −0.04em. `type.ui`, `type.label` and the reading roles stay at 0.

Two product rules. A dense table (a ledger, a log) may drop `type.ui` and `type.data` to 12px together, never one alone, or row and figures stop sharing a baseline rhythm. And an app's page title labels where you are; don't raise it to announce a feature. In a header bar it is chrome — the nav's size and weight, 13/500 — while the title of the open record or pane is the heading and takes the heading weight; one page setting its header title at 14/600 reads as a bug.

### Three weights: quiet, lifted, heading

The recorded third weight, for a dense screen where most lines share two or three sizes and each needs a quiet and a lifted voice. Weight is chosen by what the text is doing in that spot; the table goes into `DESIGN.md` as written, one row per size in use. A records app's:

| Size | Quiet, 400 | Lifted, 500 | Heading, 600 |
|---|---|---|---|
| 20 | — | — | the open record's title |
| 16 | — | — | pane, dialog and section headings |
| 14 | body, descriptions, a board card's title | a list row's title | `type.subheading`; unread row title (the state weight) |
| 13 | a row's second line, a card's time | nav items, header-bar page title, tabs, buttons, table header labels | — |
| 12 | timestamps, hints, captions | a group label's count | — |

Its rules: nothing inside a row, card or folder goes above 500 but the state weight; lift by one step, never on two neighbouring lines; every title in a set takes one weight. A board's card titles sit a step lighter than a list's row titles: a board shows many titles at once, and at 500 the whole board reads heavy.

Expect the first pass to be a step too heavy everywhere. Correct it one step at a time per context, then sweep (`type-audit.md`) — a partial step-down is worse than none.

### Worked example: Tally

**Tally**, a fictional invoicing app: preset `product`, with `app/(marketing)/** → expressive`; a grotesque with a large x-height, `tnum`, no italic, weights 400 and 500. The app shell is the ladder above, in tokens.

```css
:root {
  --font-sans: "Tally Grotesk", "Tally Grotesk Fallback", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --text-title: 1.25rem;    /* 20px type.title */
  --text-heading: 1rem;     /* 16px type.heading */
  --text-body: 0.875rem;    /* 14px type.body · type.subheading */
  --text-ui: 0.8125rem;     /* 13px type.ui */
  --text-meta: 0.75rem;     /* 12px type.meta · type.label */
  --text-code: 0.78125rem;  /* 12.5px type.code */

  --weight-regular: 400;
  --weight-strong: 500;     /* headings, active tab, column totals, <strong> */
}
body { font: var(--weight-regular) var(--text-body)/1.5 var(--font-sans); font-synthesis: none; }
.data, td, time { font-variant-numeric: tabular-nums; }  /* product: global in the app shell */
```

`type.subheading` shares the body size and separates on weight; `type.label` and the group label share the meta size and separate on tier and the group label's rule; `type.data` has no size of its own. The marketing area adds a derived `type.display` and a larger ladder, while `type.ui` and `type.meta` stay identical across the boundary (law 2).

Its display tier is the neutral-grotesque derivation in `display-tier.md` — 960 ÷ (20 × 0.52) and 343 ÷ (14 × 0.52), between 375px and 1280px viewports: 47 → 92px at 1.0 leading and −0.035em. Against a 28–40px expressive `type.title`, it stays above 1.5× at both ends.

## Expressive

Body 18px, a wide ladder, and a derived display tier above it all (`display-tier.md`).

| Role | Size | Leading | Tracking | Weight | Tier | Separates on |
|---|---|---|---|---|---|---|
| `type.display` | derived, fluid | 0.95–1.05 | −0.035em | `weight.display` | `text.primary` | size, family |
| `type.title` | 28 → 40, fluid | 1.15 | −0.025em | strong | `text.primary` | size |
| `type.heading` | 28 | 1.2 | −0.02em | strong | `text.primary` | size |
| `type.subheading` | 21 | 1.3 | −0.01em | strong | `text.primary` | weight |
| `type.lead` | 21 | 1.55 | 0 | regular | `text.primary` | leading, weight |
| `type.body` | 18 | 1.6 | 0 | regular | `text.primary` | the baseline |
| `type.supporting` | 18 | 1.5 | 0 | regular | `text.secondary` | tier |
| `type.ui` | 16 | 1 / 1.4 | 0 | regular | `text.secondary` | size |
| `type.label` | 14 | 1.3 | 0 | strong | `text.secondary` | weight |
| `type.meta` | 14 | 1.5 | 0 | regular | `text.tertiary` | tier |
| eyebrow (project role under `type.label`) | 13 | 1.2 | +0.08em, caps | strong | `text.secondary` | case |
| `type.code` | 16 | 1.6 | 0 | regular, mono | `text.secondary` | family |

Seven sizes above the floor, excluding display; ceiling 40 ÷ 18 = 2.2. Heading and phone title meet at 28 at the narrowest width; the title separates there on position and the space above it, acceptable because it is alone at the top of its page.

The 21 lead clears law 3 under a 28 heading, not under a 21 subheading; a lead never opens a subsection.

## Adding a role

Ask, in order:

1. **Can an existing size take it with different leading, weight or tier?** Usually.
2. **Is it a new role, or a variant in a different container?** "Card title" and `type.subheading` are one role. "Modal title" is `type.heading`.
3. **If it needs a size, which neighbour does it displace?** A ladder that only grows stopped being a system; name the two sizes it sits between and why neither can take it.

Record the answer as a project role under its canonical parent, with its separating signal.

## Cutting a ladder

Cut from the top down, asking after each cut what the next rung was holding up. An old Glass package ladder:

| Size | Was | Why it went |
|---|---|---|
| 30 | Article title | One template opening above every other page |
| 19 | Prose heading, pull quote | Came down with the title — an in-body heading can't outrank the page's own |
| 17 | Dek | Existed only to sit between 30 and 16 |
| 15 | `body` base | A default no role claimed |

Three of the four served the size above them — the usual shape.

## Small steps are not small

In the 11–16px band a 1px step isn't negligible: perceived difference scales with ratio, and 1px at 12 is 8%, more than 2px at 24. Size also does the least work there — a 13px meta line and a 14px paragraph differ mostly by tier and position — so a small step can be a small supporting signal. Above the text range steps must widen; 2px at 40 is noise.

## Viewports

Outside expressive display and title, nothing resizes. A phone held closer roughly cancels its narrower column, so a 17px paragraph reads at a similar apparent size; bumping body up gives four-word lines and a dominant ragged edge.

## Units

Pick one and hold it. `rem` from a 16px root: 24 → 1.5rem, 20 → 1.25rem, 17 → 1.0625rem, 14 → 0.875rem, 13 → 0.8125rem, 12 → 0.75rem, 11 → 0.6875rem; a user's 20px root scales every step, which is the point. A ladder kept in `px` for exact 1px relationships says so in `## Decisions`, having traded a user setting for them.
