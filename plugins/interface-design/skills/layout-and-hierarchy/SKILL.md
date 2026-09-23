---
name: layout-and-hierarchy
description: Structure interfaces so the layout carries the hierarchy — one shared reading measure, asymmetric spacing, frame-anchored rails, nesting radii, line weights by job, a z-index ladder, breakpoints named for what changes, forks by interaction model, gated owner content versus teaching empty states, and disclosures that hide rather than unmount, in the project's tokens via DESIGN.md. Use when setting a content width or app shell, spacing sections and headings, choosing radii or border weights, ordering z-index, building sticky sidebars or tables of contents, choosing breakpoints or what changes between touch and pointer, offering two views of a collection, designing empty states, building collapsible sections, or reviewing a layout that feels cramped or arbitrary.
---

# Layout and Hierarchy

Layout says what belongs together, what outranks what and what sits on top, before anyone has read a word. **Space and structure are signal, so every value must mean one thing**: a gap says whether things belong together, a radius how deeply an object is nested, a line's weight whether it divides or bounds, a z-index how permanent a layer is. A value picked for how it looks rather than what it says is how a layout drifts into feeling arbitrary, and why the drift is so hard to name in review.

This skill speaks in roles such as `text.secondary`; the code says whatever `DESIGN.md` maps them to. The laws hold under every preset; how wide, how loose and how round are dials, set per preset and overridden with a reason.

## Before you start

Read `DESIGN.md` at the project root: `## Profile` for the preset and any areas on another one, `## Layout` for the project's name for each role and the decisions already made. Reason in roles; write code in the project's names.

- **No `DESIGN.md`:** run the `design-system-setup` skill for this domain only, do the task, then recommend the full setup.
- **A role you need has no row:** reuse a value already doing that job; otherwise add one in the project's naming style and record it in `DESIGN.md`.
- **The task would break a law or move a dial off its preset:** say so and ask; if the user confirms, record it with its reason under `## Decisions`.
- **Preset `glass`:** the values are in `DESIGN.md`; the `glass-layout` skill, if installed, has the exact recipes behind them.

## Laws

### 1. Running text has one reading measure, and it doesn't move between templates

**Every block of running prose sits at `measure.reading`, defined once and shared by every template that shows prose.** Past about 80 characters the return sweep lands on the wrong line; under about 45 the eye spends more effort returning than reading. So the measure is set in characters of `type.body` and resolved to a width, not picked as a round pixel number. Sharing it buys **positional continuity**: clicking from an index summary to its detail page reads as the summary expanding, not as arriving somewhere else, and a template with its own width breaks that on every route in or out.

Non-prose content — an image wall, a data table or a diagram at `measure.wide`, a full-bleed band on an expressive page — may leave the measure, as may chrome and rails. **No paragraph longer than two lines may**, and an article's cover image stays at the article's width or becomes a banner above it, not part of it. **A divider is as wide as what it divides**: in a single-column reading layout, the measure, not the viewport. If a `type.title` wraps to four lines at the narrowest measure — the smallest viewport minus two `gutter`s, 320px say — the fix is usually the ladder (`typographic-system`), not a responsive type step.

### 2. Space groups, and asymmetry is how it groups

**The gap inside a group must be visibly smaller than the gap around it, so a heading sits closer to what it introduces than to what came before.** With equal margins it belongs to neither neighbour. The ratio `space.heading-above : space.heading-below` matters more than the values: **between 2:1 and 5:1.** Below 2:1 the grouping is ambiguous; above 5:1 the group looks marooned. The Glass package runs 44px above a prose heading and 12px below, about 3.7:1; the same shape holds at every scale.

**Symmetric spacing is right only between peers.** **A rule marks a change of subject, not every boundary** — the Glass home page rules off its three substantial sections and lets the two that read as a coda follow on — or the page flattens into equal slabs; that judgement lives in the layout code beside the sections, never in a setting someone can switch on everywhere. Spacing values come from roles — `space.tight`, `space.group`, `space.section`, the heading pair — on one base unit, with half-steps where a ratio needs them; a one-off `margin-top: 37px` is either a missing role or a mistake, and review should be able to tell which.

→ Spacing ladders per preset, section rhythm, page padding and chrome clearance, viewport units: `references/measure-and-rhythm.md`

### 3. Rails anchor to the same frame as the content

**A sticky sidebar, table of contents or margin note is positioned against the same centred frame as the content column, so the gap between them holds as the window widens.** Against the viewport, a rail drifts from the text it indexes: fine at 1280px, a stranger at 2400px.

```css
.frame { position: relative; max-width: var(--measure-frame); margin-inline: auto; }
.frame > .rail {
  position: absolute; inset-block: 0; inset-inline-start: var(--gutter);
  width: var(--measure-rail);
}
.rail > .rail-inner {
  position: sticky; top: var(--rail-top);
  max-height: calc(100dvh - var(--rail-top) - var(--space-section));
  overflow-y: auto;
}
```

The absolute wrapper spans the section so the sticky child has a track, and keeps the column centred, where a flex row would push it off. **A sticky panel is capped to the dynamic viewport and scrolls inside itself** — `dvh`, because `vh` ignores mobile browser chrome. Where the rail no longer fits, it becomes an in-flow disclosure above the content, never simply hidden. A shell's navigation and inspector are rails too, sized as regions of the shell, not floated against the window. Anything fixed to an edge reserves its own clearance, checked template by template.

### 4. Nested radii: inner = outer − padding

**Where one rounded object sits inside another, the inner radius is the outer radius minus the gap between their edges.** This is geometry, not taste: only then do the curves share a centre. Too large and the corner pinches; too small and the gap swells at the corners — visible even to people who couldn't say what's wrong. A 16px container with 4px of padding holds 12px buttons; a 12px button with an avatar inset 2px gives the avatar 10px. Snap to the ladder when the difference is 2px or less; when outer − padding reaches zero, the inner corner is square, not "a small radius for consistency".

**Radius scales with size, not importance** — and sub-proportionally, or a large panel reads as a lozenge. `radius.pill` is only for things with no top and bottom — tags, dots, toggles, markers — never anything holding a paragraph.

### 5. A line's weight says what it's doing

**Lines are assigned by job — `hairline.chrome` for a divider inside one object, `hairline.object` for an object's edge, `rule.emphasis` for a deliberate mark such as a quote bar or a focus ring — and an internal divider is never more prominent than its object's edge**, or the object reads as two. Where chrome and object share a weight, the divider steps down in colour (`border.divider` against `border.default`). Three jobs, at most three weights. On a translucent or unknown backdrop the line is translucent (`border.layered`; its colour is `color-and-theming`'s). A non-structural divider is `aria-hidden`, and an `<hr>` needs its UA border reset.

### 6. The z-index ladder is documented, sparse, and ordered by permanence

**Every z-index comes from one named ladder with gaps between the rungs; a literal `z-index: 9999` is a bug waiting for its pair.** The longer something stays on screen, the higher it sits; the skip link beats everything. Gaps of ten let a later layer, like the Glass package's once-a-session greeting overlay, take a free rung without renumbering. Two pairs are constraints, not choices:

- **A dismiss catcher sits above the page and directly below what it dismisses**: above its menu it eats the menu's clicks; below the page it catches nothing. `z.dismiss` serves the navigation; a content popover renders its own catcher in its portal, catcher first.
- **`z.skip-link` sits above `z.overlay`**, so a keyboard user tabbing during a splash or a modal can always get past it.

| Role | Default | Holds |
|---|---|---|
| `z.skip-link` | 100 | The skip link |
| `z.toast` | 70 | Toasts, over modals |
| `z.overlay` | 60 | Modals, sheets, once-a-session overlays |
| `z.nav` | 50 | Fixed navigation |
| `z.dismiss` | 40 | The navigation's tap-outside catchers |
| `z.popover` | 20 | Hover cards, dropdowns, content menus |
| `z.raised` | 10 | A hovered or focused item |
| `z.below` | −10 | A highlight behind content |

A negative layer needs an `isolation: isolate` parent, and **a `transform`, `filter`, `perspective`, `contain` or `will-change` on an ancestor traps `position: fixed` descendants inside it** — check every ancestor before reaching for a higher number.

→ Radius ladders and hairline weights per preset, nesting worked through, stacking-context techniques: `references/radius-lines-and-layers.md`

### 7. Fork the component when the interaction model changes, not when the arrangement does

**Arrangement changes — column count, wrapping, padding, a card moving from below its row to beside it — are breakpoint work. Interaction-model changes — hover-revealed versus tap-to-open, a sticky rail versus an inline disclosure — are two components sharing their data and row rendering**, because one component serving both grows a hover path, a touch path, a collapse rule only one uses, and state that means different things in each. Two mounted presentations holding state need a sync point or a shared store.

**Breakpoints are named for what changes at them and derived from the content** (`bp.rail`, `bp.shell`), not copied from a device list. **Capability, not width, decides hover**: gate it on `(hover: hover) and (pointer: fine)` together; `any-hover` is too permissive for a touchscreen laptop. **Never hide an affordance where it can't come back**: a dock that collapses on scroll and expands on hover loses navigation on a phone for good, so check capability where you hide, not where you reveal. Every hover that carries information or an action has a touch path; only decoration is exempt.

### 8. A view choice is about the thing, so it doesn't persist by default

**When the reader can switch between presentations of one collection, the choice resets on arrival unless you can name why it shouldn't, and the switch carries the reader's position across.** Persist preferences about the *reader* — theme, sound, motion, density — not about a *thing*, or readers land in a mode picked weeks ago for another collection and don't remember choosing it; the Glass galleries open on the wall every time, because the whole collection is what you want on arrival. A product's saved view — a board grouped by assignee, a filtered table — is the legitimate exception: persist it as a named, visible thing and record the decision, never as a toggle that silently turns sticky. On the switch, open the incoming view on the item nearest the viewport centre; leaving a grid at item 60 and arriving at item 1 is worse than not switching.

### 9. Owner-curated content disappears when empty; user data gets an empty state that teaches

**When a collection the site's owner curates is empty, its route, navigation entry, section and any divider around it all go — derived from one flag. When the data is the user's own, the empty state is the feature's first screen and must teach it.**

"No posts yet" on a portfolio publishes an absence to visitors who can do nothing about it: an admission, not information. Navigation, router, section list, sitemap and metadata all read the one flag, because which routes exist is content, not routing; sections are filtered before dividers are placed, and an emptied route redirects somewhere real, not to a 404. An empty inbox is the opposite: the user can act, so say what goes here and why, and offer the one action that creates the first item. **"Empty because new" and "empty because filtered" are different states**: the filtered one names the filter and offers to clear it. At every count the layout looks deliberate: one or two items in a three-up grid stay item-sized, not stretched.

→ Forks and the touch audit, reader-chosen views, gating code for route tables and file-based routers, empty-state anatomy: `references/forks-gating-and-disclosures.md`

### 10. A disclosure hides its content; it doesn't unmount it

**Collapsed content stays in the served markup — a native `<details>`, or animated to zero height with `inert` and `aria-hidden` — and is unmounted only when it is genuinely expensive or genuinely absent**, because content that exists only after a click is lost to crawlers, find-in-page and text export. `inert` makes keeping it safe: without it, collapsed content is still tabbable and announced, so a keyboard user tabs into invisible prose and a screen reader reads a section shown as closed. `aria-hidden` alongside covers engines without `inert`; `display: none` can't be animated, so it's no answer where the close is. Prefer `<details>` wherever the animation allows. A menu's wrapper stays mounted while its panel unmounts, so `aria-controls` always resolves.

### 11. Structure is accessibility, and it's decided with the layout

**Landmarks, heading levels, the skip link and anchor offsets are layout decisions, made in the same pass as the layout, not retrofitted.**

- A skip link off-screen by transform (never `display: none`, which drops it from the tab order), on `z.skip-link`, targeting an `id="main"` on every template.
- Every `<nav>` labelled — three unlabelled navs make a page unnavigable by landmark.
- **Heading levels follow structure, not size.** Two headings at one size can legitimately be `h3` and `h4`; never pick a level for its default style.
- `scroll-margin-top` on every anchor target, matched to the scroll spy's reading line, or a jump lands above the line and the contents highlights the previous section.
- `aria-current` on the active row, `aria-pressed` on toggles, `aria-expanded` and `aria-controls` on disclosure and menu triggers; decorative spans `aria-hidden`; in-page links as real anchors with the handler layered on top.
- Print is a presentation: chrome hidden and every scroll-revealed element forced visible, or the page prints blank.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| `measure.reading`, in characters of `type.body` | 65–75; default 70 | 60–70; default 65 — prose inside the product only | 55–70; default 62 |
| Page structure | One column every template shares | App shell: nav, content, optional inspector | Sections may go full-bleed; text at the measure |
| `measure.wide` | ≈ 1.5 × `measure.reading` | = `measure.app` | Viewport minus two `gutter`s |
| `measure.app` | — | Content 960–1440px; nav 220–264px; inspector 320–400px | — |
| `gutter` (smallest width) | 24–32px | 16px | 20–24px |
| `space.tight` / `space.group` / `space.section` | 8 / 16–24 / 48–72px | 4–8 / 12–16 / 24–32px | 8–12 / 24–32 / 96–160px |
| Heading pair ratio, above : below | 3:1–4:1 | 2:1–3:1 | 3:1–5:1 |
| Rules between sections | Only at a change of subject | Panel edges separate; rules only inside panels | Surface or colour bands; rules rare |
| Page top space | 80–112px | 16–24px inside the shell | Set by the hero |
| Radius: `small` / `control` / `card` / `container` | 4 / 8 / 12 / 16px | 2 / 4–6 / 8 / 12px | Either 0 throughout, or 8 / 12 / 20 / 28px |
| Corner shape | Circular, or a light superellipse | Circular | Any, applied globally |
| `hairline.chrome` / `hairline.object` / `rule.emphasis` | 0.5 / 1 / 2px | 1 / 1 / 2px, divider a colour step lighter | 1 / 1–2 / 3–4px |
| Breakpoints | 2 | 3 | 3–4 |
| Rail appears at | `measure.reading` + 2 × (rail + gap) + gutters ≈ 1200–1280px | Always a region; collapses at `bp.shell` | Rarely has rails |
| Rungs on the z ladder | ≈ 7 | 8–9 (adds toasts, stacked modals) | ≈ 7 |

The `glass` preset takes its values from `glass-layout`.

**The measure.** Editorial's committed reader sits high, since long lines are efficient in sustained reading when leading pays for the return sweep. Product text is scanned in bursts and sits lower; expressive body runs larger, so fewer characters fit. Below 55 or above 80 characters costs reading on any preset.

**Density.** Product halves editorial's spacing, since a working reader compares side by side and scrolling is friction, but keeps the asymmetry: a dense form with equal gaps is where grouping goes first. Expressive sections are scenes with large gaps, and the heading ratio still holds inside them.

**Radius.** A sharp system (0 throughout) is a legitimate expressive character that satisfies the nesting law trivially; what costs is mixing a round button into a square card.

**Hairlines.** `0.5px` degrades to 1px on 1× screens rather than vanishing. Product sets 1px because much of its use is on 1× external monitors, where density needs a line that reads, and steps its divider down in colour.

**Breakpoints.** A single-column site needs two: where the column becomes padding-limited, and where a rail fits.

## Building it for a project

1. **Read the preset and the areas.** A `product` app with `app/(docs)/** → editorial` gets a shell for the app and a single column for the docs, sharing one `measure.reading`.
2. **Set the measure from the type**: a character count from the dials for `family.text` at `type.body`, resolved to a width by measuring the font (a 16px sans averages about 8px per character, so 70 characters ≈ 560px) or in `ch`, which runs wider than an average letter. Check it at the narrowest viewport minus two `gutter`s with the project's longest `type.title`.
3. **Derive the frame.** With a rail, `measure.frame` = `measure.reading` + 2 × (`measure.rail` + gap) + 2 × `gutter`, and `bp.rail` is that width; for a shell, set the region widths and where the inspector, then the nav, collapses.
4. **Build spacing from ratios**: the base (4px) and `space.section`, the heading pair at the preset's ratio, then `space.tight` and `space.group` so every group's inner gap is at most half its outer one.
5. **Build the radius ladder inward** from `radius.container` through every real nesting (container → control → avatar), subtracting padding and snapping.
6. **Assign the three line jobs** per the preset; no divider outranks its object's edge.
7. **Write the z ladder** from law 6, dropping unused rungs and keeping the gaps.
8. **List the forks and the gates**: which components ship twice and why; which collections are owner-curated (gated) and which are user data (empty states).

→ Worked example (*Manifest*, a fictional `product` app with `editorial` docs) and its Tailwind and JS-theme forms: `references/measure-and-rhythm.md`

## Auditing existing code

Start from the setup scan's frequencies for measures, spacing, radii, z-index and breakpoints, then collect per law:

| Law | Look for | Evidence |
|---|---|---|
| 1 | Distinct `max-width` / `max-w-*` on prose templates; prose in full-width containers | Measures by route |
| 2 | Headings with equal margins or a ratio under 2:1; one-off spacing values | Ratio per heading style; strays with counts |
| 3 | Viewport-positioned sticky elements; `100vh`; sticky panels without `overflow-y`; fixed bottom chrome | File and line; pages ending under the chrome |
| 4 | Rounded elements inside rounded elements | Outer, padding, inner, mismatch |
| 5 | Border widths by job; dividers stronger than their object's edge; `<hr>` without a border reset | Counts per weight; offenders |
| 6 | Every `z-index` / `z-*` literal | Sorted values and what each holds; catchers above menus; overlays above the skip link; transformed ancestors of fixed elements |
| 7 | `onMouseEnter`/`:hover` with no touch path; `any-hover`; hide-on-scroll without a capability check | Each behaviour's touch equivalent, or "none" |
| 8 | View toggles written to storage | Key, what it controls, any reason |
| 9 | "No … yet" on owner-curated collections; user-data empty states with no action | Route or component, and which case |
| 10 | Disclosure content rendered conditionally; collapsed content without `inert` | Component, and what's missing from the HTML |
| 11 | Skip link and `id="main"`; unlabelled `<nav>`; heading levels chosen for size; anchors without `scroll-margin-top`; no print reset for hidden reveals | Per template |

In a browser, resize from 320px to 2560px watching the rail gap, tab through collapsed disclosures, and run find-in-page on a closed one. Report one line per finding with its evidence — a ratio, a count, a file — under `## Open issues`, and fix nothing unless asked.

## Writing back to DESIGN.md

- **Layout table rows** for every role set or found — measures, gutter, spacing roles, the heading pair and its ratio, the radius ladder and its nestings, the three line jobs, the z ladder, breakpoints named for what changes — plus one line per forked component naming the interaction model each version serves.
- **The gate list**: owner-curated collections (gated) and user data (empty states).
- **Decisions**, dated, with the reason: any dial moved off the preset (a 1px chrome hairline in an editorial project), persisted view preference, layer added to the ladder, or template allowed a different measure.
- **Open issues** for every law the code breaks, with evidence, removed when the fix lands.
- **Proposed roles**, marked `proposed`, for a job with no row — a rail width, a frame width, a toast layer.

## Checklist

- [ ] Prose sits at one `measure.reading`, defined once and shared by every template; no paragraph over two lines escapes it.
- [ ] Only non-text content, chrome and rails leave the measure; dividers are as wide as what they divide.
- [ ] The narrowest measure fits the longest `type.title` without a responsive type step.
- [ ] Headings sit closer to what follows than what precedes: `space.heading-above : space.heading-below` between 2:1 and 5:1.
- [ ] Symmetric spacing only between peers; rules only at a change of subject.
- [ ] Every spacing value is a role on the base unit; strays are listed.
- [ ] Rails anchor to the content's frame; sticky panels are capped with `dvh` and scroll within.
- [ ] Below `bp.rail` the rail becomes an in-flow disclosure; fixed chrome has clearance on every template.
- [ ] Inner radius = outer − padding at every nesting; `radius.pill` only on things without a top and bottom.
- [ ] `hairline.chrome`, `hairline.object`, `rule.emphasis` have one job each; no divider outranks its object's edge; `border.layered` on translucent backdrops.
- [ ] Every z-index is on the ladder; `z.dismiss` sits under what it dismisses; `z.skip-link` tops `z.overlay`.
- [ ] No transformed or filtered ancestor traps a fixed descendant; negative layers sit in an isolated parent.
- [ ] Components fork where the interaction model differs, share data and rows, and sync state both hold.
- [ ] Breakpoints are named for what changes; hover is gated on `(hover: hover) and (pointer: fine)`.
- [ ] No affordance hides where it can't come back; every informative hover has a touch path.
- [ ] View choices reset on arrival unless a recorded decision says otherwise; switching keeps the reader's place.
- [ ] Empty owner-curated collections lose route, nav entry, section and divider; user data gets an empty state with its first action.
- [ ] Grids look deliberate at 1, 2 and n items.
- [ ] Collapsed disclosures keep their content in the HTML, with `inert` and `aria-hidden`, or use `<details>`.
- [ ] Skip link by transform with `id="main"`; every `<nav>` labelled; heading levels follow structure; anchors carry `scroll-margin-top`; print forces reveals visible.
- [ ] Dials (`measure.reading`, spacing density, heading ratio, radius ladder, hairline weights, breakpoint count) match the preset, or the difference is under `## Decisions`.
