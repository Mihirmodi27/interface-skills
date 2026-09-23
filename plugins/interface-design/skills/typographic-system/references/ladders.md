# Ladders, per preset

Worked ladders for the three adaptable presets, how each was reasoned, and how to extend or cut one without wrecking it. The numbers are defaults for a family with an ordinary x-height; move them for the family you have, and record the move.

## Against modular scales

The standard advice is a base and a ratio. From 14px at 1.25×:

```
14 → 17.5 → 21.88 → 27.34 → 34.18
```

Three problems, under every preset:

- **Too few sizes where the chrome lives.** Between 11 and 16px sit tooltips, tags, timestamps, labels, nav rows and paragraphs — five or six densities. The ratio offers 14 and nothing until 17.5.
- **Sizes nobody asked for.** It hands you 22, 27 and 34 whether or not a role needs them, and an unclaimed size is an invitation. One template using 27px "for variety" is how a scale stops being one.
- **Fractions.** 17.5 and 21.88 round differently across engines, and subpixel type at small sizes is where hinting artefacts show.

A ratio can still be a sanity check on the *gaps* — a heading that is less than about 1.15× the body is relying on weight alone — but it never produces the sizes.

## Editorial

Body 17px. The title sits modestly above it, so the reading is the loudest thing on the page.

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

Seven sizes above the floor. Ceiling 24 ÷ 17 = 1.41. Four roles share 17px and each owns a signal. The subheading and a keyline, if the project has one, both take `weight.strong`; the subheading keeps it distinct with tight leading and asymmetric space (it belongs to what follows), the keyline with open leading and symmetric space.

## Product

Body 14px, chrome at 13. UI and data roles dominate, and the third weight exists for a job, not for range.

| Role | Size | Leading | Tracking | Weight | Tier | Separates on |
|---|---|---|---|---|---|---|
| `type.title` | 20 | 1.3 | −0.01em | strong | `text.primary` | size |
| `type.heading` | 16 | 1.35 | 0 | strong | `text.primary` | size |
| `type.subheading` | 14 | 1.4 | 0 | strong | `text.primary` | weight |
| `type.body` | 14 | 1.5 | 0 | regular | `text.primary` | the baseline |
| `type.supporting` | 14 | 1.45 | 0 | regular | `text.secondary` | tier |
| `type.ui` | 13 | 1 / 1.4 | 0 | regular; `weight.medium` when active | `text.secondary` | size, curve |
| `type.data` | 13 | 1 | 0 | regular; totals `weight.medium` | `text.primary` | tabular figures |
| `type.label` | 12 | 1.3 | 0 | medium | `text.secondary` | weight |
| `type.meta` | 12 | 1.4 | 0 | regular | `text.tertiary` | tier |
| section label (project role under `type.label`) | 11 | 1.2 | +0.05em, caps | medium | `text.tertiary` | case |
| `type.code` | 12.5 | 1.5 | 0 | regular, mono | `text.secondary` | family |

Six sizes plus code. Ceiling 20 ÷ 14 = 1.43; the dial allows up to 22 if a dashboard title needs it. The 12.5 is the one size that exists to compensate for a family rather than serve a role: monospace runs wide and needs a step down to occupy the same measure.

Two product-specific rules. A dense table (a ledger, a log) may drop `type.ui` and `type.data` to 12px together, as one decision; never one without the other, or the row and its figures stop sharing a baseline rhythm. And a page title in an app is a label for where you are, not a headline — resist raising it to announce a feature.

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

Seven sizes above the floor, excluding display. Ceiling 40 ÷ 18 = 2.2. The heading at 28 and the phone title at 28 meet at the narrowest width — the title separates there on position and the space above it, which is acceptable because the title is alone at the top of its page.

The lead at 21 sits under a 28 heading, so it clears law 3; it would not clear it under a 21 subheading, and a lead never opens a subsection.

## Adding a role

Ask, in order:

1. **Can an existing size take it with different leading, weight or tier?** Usually. Most "new" roles are this.
2. **Is it a new role, or a variant in a different container?** "Card title" and `type.subheading` are one role. "Modal title" is `type.heading`.
3. **If it genuinely needs a size, which neighbour does it displace?** A ladder that only grows stopped being a system. Name the two sizes it sits between and why neither can take it.

Record the answer as a project role under its canonical parent, with its separating signal.

## Cutting a ladder

Cut from the top down, and after each cut ask what the next rung was holding up. In the Glass package an old ladder had 30, 19, 17 and 15 in it:

| Size | Was | Why it went |
|---|---|---|
| 30 | Article title | One template opening above every other page |
| 19 | Prose heading, pull quote | Came down with the title — an in-body heading can't outrank the page's own |
| 17 | Dek | Existed only to sit between 30 and 16 |
| 15 | `body` base | A default no role claimed |

Three of the four existed to serve the size above them. That is the usual shape: remove the top and the rungs below it stop being load-bearing.

## Small steps are not small

In the 11–16px band a 1px step looks negligible and isn't. Perceived difference scales with ratio: 1px at 12 is an 8% change, larger proportionally than 2px at 24. In that band size is also doing the least work — a 13px meta line and a 14px paragraph are told apart mostly by tier and position — so a small step is a supporting signal, which is why it can be small. Above the text range, steps need to widen; 2px at 40 is noise.

## Viewports

Outside expressive display and title, nothing resizes. A phone is held closer than a laptop, which roughly cancels the narrower column, so the same 17px paragraph reads at a similar apparent size. Bumping body up on phones gives four-word lines and a ragged edge that becomes the dominant texture. If type feels small on a phone, fix the measure or the leading.

## Units

Pick one and hold it. With `rem`, convert from a 16px root: 24 → 1.5rem, 20 → 1.25rem, 17 → 1.0625rem, 14 → 0.875rem, 13 → 0.8125rem, 12 → 0.75rem, 11 → 0.6875rem. A user who sets a 20px root scales every step proportionally, which is the point. A ladder that depends on exact 1px relationships and stays in `px` must say so in `## Decisions`, because it has traded a user setting for them.
