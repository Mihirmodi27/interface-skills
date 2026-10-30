# Iterating on feedback

A product UI is mostly finished in review, not in the first build. The feedback that arrives is small and specific, and most of the work is applying it everywhere it reaches.

## One step at a time

| Feedback | Change | Not |
|---|---|---|
| "One step lighter" | The next weight down on the existing ladder, in that context | Re-picking the weight scale |
| "Make it 25% smaller" | Scale that element by 0.75 and snap to the nearest step | Fitting more per row |
| "Bring the title to 16px" | That role to 16px, everywhere the role is used | That one instance |
| "Too cluttered" | Spacing and grouping first (`layout-and-hierarchy`) | Colour or type |
| "Not symmetric" | Match the sibling that looks right | A third variant |
| "Looks heavy everywhere" | Step weights down one, context by context, and show the result | A new font |

When feedback is ambiguous in size, ask one question with a recommendation: "One step lighter (500 → 400), or only the card titles?"

## The sweep

A change to a shared rule — a role's size, a weight, a colour job, a spacing step, a component's variant — isn't done when the screen in front of you looks right.

1. **Find every use.** Grep the token, the class, the component and any raw value that should have been the token (`text-sm` where the role was meant). Raw values are where partial updates hide.
2. **Migrate raw values to the role** while you're there, so the next change is one edit.
3. **Walk every route** in the preview harness, light and dark, at a phone and a desktop width.
4. **Report what moved**, one line each, and what you deliberately left:

```
Card title weight 600 → 500 (role `type.card-title`):
- Board, list, inbox, search results: updated via the role
- Calendar event chips: were raw `font-semibold`, migrated to the role
- Dashboard figures: left at 600 — figures aren't titles (say if you want them lighter)
```

5. **Ask before calling a page done.** Pages the owner has said are theirs are left alone, even when the sweep would touch them; list them in the report instead.

## The decision log

Every decision goes under `## Decisions` in `DESIGN.md` — newest first, dated, marked by who decided, with the reason. A new decision on a subject replaces the old entry; git history keeps what it replaced. The format is `design-system-setup`'s `references/design-md.md`.

```markdown
- 2026-10-28 — Card titles at 500, not 600: "unnecessarily heavy" next to the pane title. (User decision.)
- 2026-10-21 — Boards remember their view per page; folders always open on folders. (User decision.)
- 2026-10-14 — More colour, each hue with one job: type, status, area, person. (Client feedback.)
```

Read the log before changing anything it covers. A reviewer's instinct to "fix" a decided value is how a product oscillates between two versions.

## Studying a reference

When the owner points at a product they like, study **how it structures information**, not how it looks:

| Look at | Note |
|---|---|
| Icons | Where they appear and where they don't — beside nav items but not menu items? On buttons or only in toolbars? |
| Tags and chips | What gets one and what is plain text |
| Tables | Frame or none; header treatment; row height; what's in the first column; where row actions live |
| Boxes | What is a card, what sits on the page, what is grouped by space alone |
| Alignment | What lines up with what — titles with table edges, icons with text |
| Density | Row heights, gaps, how much fits above the fold |
| Copy | Label length, case, how second lines and empty states read |

Then apply the structure in the project's own tokens. Copying the look imports a second system; copying the structure keeps one.

## Wireframe first

A new page type — a dashboard, a settings area, a board — starts as a wireframe: boxes and words, no colour, shareable as a link or an image. It settles what's on the page and in what order, which is the expensive argument, before any styling makes it costly to change. Keep the wireframe beside the build until the page ships.

## The preview harness

The real app, on mock data, with every route reachable and no backend:

- **A data layer the app already calls**, swapped at the boundary — a mock adapter, a request interceptor, or fixtures behind the same hooks — never a fork of the components.
- **Fixtures that cover the states**: empty, one item, many, very long names, every status, an error, a slow response. A switch per state (a query parameter or a dev menu) lets a review jump to it.
- **A route index**: one page listing every route and state, so a sweep can visit all of them in order.
- **Typed against the real models**, so the harness breaks at build time when the data shape changes rather than drifting quietly.
- **Signed in by default** with a demo identity, and sign-out returning to the sign-in screen, so the auth screens are reviewable too.

With it, a whole-product sweep or a rendered audit (`typographic-system`, `layout-and-hierarchy`) takes minutes instead of needing a staging account and real data.
