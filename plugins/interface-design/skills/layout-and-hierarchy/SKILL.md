---
name: layout-and-hierarchy
description: Structure interfaces so the layout carries the hierarchy — running text at one reading measure that doesn't move between templates, spacing that groups by asymmetry, rails anchored to the content's frame, a radius ladder that nests, line weights assigned by job, a documented z-index ladder, breakpoints named for what changes, separate components where the interaction model forks, owner-curated sections that disappear when empty while user data gets an empty state that teaches, and disclosures that hide rather than unmount. Applies these rules in the project's own tokens and character via DESIGN.md. Use when setting a content width or app shell, spacing sections and headings, choosing radii or border weights, ordering z-index, building sticky sidebars or tables of contents, choosing breakpoints or what changes between touch and pointer, offering two views of a collection, designing empty states, building collapsible sections, or reviewing a layout that feels cramped or arbitrary.
---

# Layout and Hierarchy

Layout is how an interface says what belongs together, what outranks what, and what sits on top of what — before anyone has read a word. This skill covers the structure that says it: the width text runs at, the space between things, the rails beside the content, the radii and lines that draw objects, the order layers stack in, where the layout changes character, and what happens when there is nothing to show.

One idea organises all of it: **space and structure are signal, so every value must mean one thing.** A gap says "these belong together" or "these don't". A radius says how deeply an object is nested. A line's weight says whether it divides or bounds. A z-index says how permanent a layer is. A value picked for how it looks rather than for what it says is how a layout drifts into feeling arbitrary — and why that drift is so hard to name in review.

Everything here works in the project's own names through `DESIGN.md`. The laws hold under every preset; how wide, how loose and how round are dials, set per preset and overridden with a reason.

## Before you start

Read `DESIGN.md` at the project root — its `## Profile` and its `## Layout` section. They give you the preset (and any areas of the project on a different one), the project's own name for every role this skill talks about, and the decisions already made. Work in those names: this skill says `text.secondary`; the code you write says whatever `DESIGN.md` maps `text.secondary` to.

- **No `DESIGN.md`?** Don't stop. Run a narrow pass of the `design-system-setup` skill for this domain only — scan, map the roles you need, pick the preset from what the reader is doing — do the task, and recommend running the full setup afterwards.
- **A role you need has no row?** Look for a value already doing that job before inventing one. If you have to add one, name it in the project's style and record it in `DESIGN.md`.
- **The task would break a law, or move a dial off its preset?** Say so and ask. If the user confirms, do it, and record the decision with its reason under `## Decisions`.
- **The file names the `glass` preset?** The values are in `DESIGN.md`; the `glass-layout` skill, if installed, has the exact recipes and components behind them.

## Laws

### 1. Running text has one reading measure, and it doesn't move between templates

**Every block of running prose sits at `measure.reading`, defined once, and every template that shows prose uses the same one.** Measure is a reading constraint before it is a style: past about 80 characters the return sweep starts landing on the wrong line, and under about 45 the eye spends more effort returning than reading. So it is set in characters of `type.body` and resolved to a width, not picked as a round pixel number.

Sharing it buys **positional continuity**. When an index shows a one-line summary and its detail page shows the long version at the same measure, clicking through doesn't move the text — the transition reads as the summary expanding, not as arriving at a different document. A template with its own width breaks that for every route into or out of it. In the Glass package the home page, articles and indexes all share one column, and it is the reason moving between them feels like one continuous document.

What may leave the measure: content that isn't prose — an image wall, a data table or a diagram at `measure.wide`, a full-bleed band on an expressive page — plus chrome and rails. What may not: **any paragraph longer than two lines.** An expressive page can bleed its sections to the viewport edge and its paragraphs still sit at the measure; a product settings page wraps its help text at the measure inside a wide panel. A cover image that belongs to an article stays at the article's width, or it becomes a banner above the article rather than part of it.

**A divider is as wide as what it divides.** A rule across the viewport separates the page; a rule at the measure separates the content. In a single-column reading layout the second is what you mean.

The narrowest measure you ship — the smallest viewport minus two `gutter`s — is a constraint on the type scale. If a `type.title` wraps to four lines at 320px, the fix is usually the ladder (`typographic-system`), not a responsive type step.

### 2. Space groups, and asymmetry is how it groups

**The gap inside a group must be visibly smaller than the gap around it, so a heading sits closer to what it introduces than to what came before.** Equal space on both sides of an element says it belongs to neither neighbour, which is almost never what you mean. A heading with symmetric margins floats between two sections and the reader can't tell which one it heads — the difference between a page you can skim and one you can't, and the cheapest spacing fix there is.

`space.heading-above : space.heading-below` is the rule, and the ratio matters more than the values: **between 2:1 and 5:1.** Below 2:1 the grouping is ambiguous; above 5:1 the group looks marooned. The Glass package runs 44px above a prose heading and 12px below, about 3.7:1. The same logic holds at every scale — a label and its value, list items and the block after them, a card's title and its body versus the gap between cards.

**Symmetric spacing is right only between peers.** Sections of equal standing get equal padding, because none of them owns another. And **a rule marks a change of subject, not every boundary**: on the Glass home page the three substantial sections get a hairline above them and the two that read as a coda follow on without one. A rule on every boundary flattens a page into equal slabs. That judgement lives in the layout code, next to the sections, not in a setting someone can switch on everywhere.

Spacing values come from roles — `space.tight`, `space.group`, `space.section`, the heading pair — on one base unit, with half-steps where a ratio needs them. A one-off `margin-top: 37px` is either a missing role or a mistake, and review should be able to tell which.

→ Spacing ladders per preset, section rhythm, page padding and chrome clearance, viewport units: `references/measure-and-rhythm.md`

### 3. Rails anchor to the same frame as the content

**A sticky sidebar, table of contents or margin note is positioned against the same centred frame as the content column, so the gap between them holds steady as the window widens.** A rail positioned against the viewport drifts away from the text it indexes: fine at 1280px, a stranger at 2400px.

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

The wrapper is absolute and spans the section's height so the sticky child has a track to travel, and the column stays centred — a rail in a flex row beside the column would push it off-centre. **A sticky panel is capped to the dynamic viewport and scrolls inside itself**; `dvh`, not `vh`, because mobile browser chrome changes the visible height and `vh` doesn't notice. Below the width at which the rail fits beside the column, it becomes a disclosure in the flow above the content — never simply hidden.

The same anchoring governs an app shell: the navigation and inspector regions are the rails, sized as regions of the shell, not floated against the window. And anything fixed to an edge reserves its own clearance: a page whose last line can end under a fixed bottom bar is the most common "looks fine on my long page" bug, and it has to be checked template by template.

### 4. Nested radii: inner = outer − padding

**Where one rounded object sits inside another, the inner radius is the outer radius minus the gap between their edges.** This is geometry, not taste: two concentric rounded rectangles share a centre of curvature only when their radii differ by exactly that gap. Inner too large and the corner looks pinched, its curve crossing the outer one; inner too small and the gap swells at the corners while staying constant along the edges. Both are visible at a glance, even to people who couldn't say what's wrong.

A 16px container with 4px of padding holds 12px buttons; a 12px button with an avatar inset by 2px gives the avatar 10px. Snap to the nearest ladder step when the difference is 2px or less — keeping to the ladder is worth more than exactness below that. When outer − padding reaches zero, the inner corner is square, not "a small radius for consistency".

**Radius scales with size, not importance** — and sub-proportionally, because a large panel with a proportional radius reads as a lozenge. `radius.pill` is only for things with no top and bottom to speak of: tags, dots, toggles, markers. Anything holding a paragraph gets a real step from the ladder.

### 5. A line's weight says what it's doing

**Lines are assigned by job — `hairline.chrome` for a divider inside one object, `hairline.object` for the edge of an object, `rule.emphasis` for a deliberate mark — and an internal divider is never more prominent than the edge of the object it sits in.** A divider inside a toolbar articulates; a card's border bounds; a quote bar or a focus ring marks. When the divider inside a card is as strong as the card's own edge, the card reads as two objects. Where the preset gives chrome and object the same weight, the divider steps down in colour instead (`border.divider` against `border.default`).

Three jobs, so at most three weights; a fourth is a line without a job. On a translucent or unknown backdrop the line itself must be translucent (`border.layered`) — its colour belongs to `color-and-theming`, its weight to this skill. A divider that isn't semantic structure is `aria-hidden`, and an `<hr>` used as a divider has its UA border reset before it gets a background, or it renders the browser's line and yours a few pixels apart.

### 6. The z-index ladder is documented, sparse, and ordered by permanence

**Every z-index comes from one named ladder with gaps between the rungs; a literal `z-index: 9999` is a bug waiting for its pair.** The ladder is ordered by permanence: the longer something stays on screen, the higher it sits, and the skip link beats everything. Gaps of ten let a new layer slot in without renumbering — in the Glass package a once-a-session greeting overlay arrived long after the ladder was set and took a free rung without a single existing value changing.

Two pairs are constraints, not choices:

- **A dismiss catcher sits above the page and directly below the thing it dismisses.** A full-screen tap-outside catcher above its own menu eats the menu's clicks; one below the page catches nothing. `z.dismiss` serves the navigation; a content popover that needs a catcher renders the pair together in its portal, catcher first.
- **`z.skip-link` sits above `z.overlay`.** An overlay that covers the navigation must never cover the skip link, because a keyboard user tabbing during a splash or a modal has to be able to get past it.

| Role | Default | Holds |
|---|---|---|
| `z.skip-link` | 100 | The skip link — above everything, modals included |
| `z.toast` | 70 | Toasts and notifications — over modals, so news about a modal's own action isn't hidden behind it |
| `z.overlay` | 60 | Modal dialogs, sheets, a once-a-session overlay |
| `z.nav` | 50 | Fixed navigation, the most permanent chrome |
| `z.dismiss` | 40 | Tap-outside catchers for the navigation's menus and sheets — over the page, under the nav |
| `z.popover` | 20 | Hover cards, dropdowns, menus attached to content |
| `z.raised` | 10 | A hovered or focused item lifting above its siblings |
| `z.below` | −10 | A highlight behind content, inside an isolated parent |

Stacking contexts are part of the law: a negative layer needs `isolation: isolate` on its parent or it falls behind the parent's own background; and **a `transform`, `filter`, `perspective`, `contain` or `will-change` on an ancestor makes it the containing block for `position: fixed` descendants**, trapping a full-screen overlay inside a strip. Check every ancestor before reaching for a higher number.

→ Radius ladders and hairline weights per preset, nesting worked through, stacking-context techniques: `references/radius-lines-and-layers.md`

### 7. Fork the component when the interaction model changes, not when the arrangement does

**Arrangement changes — column count, wrapping, padding, a card moving from below its row to beside it — are breakpoint work. Interaction-model changes — hover-revealed versus tap-to-open, a sticky rail versus an inline disclosure — are two components that share their data and their row rendering.** One component serving both grows a hover path, a touch path, a collapse rule only one of them uses, and shared state that means something different in each. In the Glass package the navigation ships as a hover-driven desktop dock and a sheet-based mobile dock, and the table of contents as a sticky rail and a `<details>` disclosure; each pair shares its destinations and rows and forks only the container.

Two mounted presentations that each hold state need a defined synchronisation point — a preference changed in one must not show stale in the other — or the state moves to a store both read.

**Breakpoints are named for what changes at them and derived from the content**: the width at which a specific layout decision stops working (`bp.rail`, `bp.shell`), not a device list. **Capability, not width, decides hover**: gate hover behaviour on `(hover: hover) and (pointer: fine)` together — `any-hover` is too permissive for a touchscreen laptop.

**Never hide an affordance where it can't come back.** A dock that collapses on scroll and expands on hover permanently removes navigation on a phone. The capability check belongs where you decide to hide, not where you reveal. And every hover behaviour has a touch equivalent unless it is purely decorative — anything that carries information or offers an action needs a path.

### 8. A view choice is about the thing, so it doesn't persist by default

**When the reader can switch between presentations of one collection, the choice resets on arrival unless you can name why it shouldn't, and the switch carries the reader's position across.** Persist preferences about the *reader* — theme, sound, motion, density. Don't persist a preference about a *thing* they were looking at: a reader lands in a mode they picked weeks ago, for a different collection, and doesn't remember choosing it. The Glass package's galleries open on the wall view every time, because the wall shows the whole collection, which is what you want on arrival; the single-photograph view is somewhere you go on purpose.

Product systems meet the legitimate exception: a saved view — a board grouped by assignee, a filtered table — is something a user builds deliberately and returns to daily. Persist it as a named, visible thing, and record the decision; don't let a toggle silently become sticky.

The state lives in a module both the control and the view subscribe to, since they are siblings; on a server-rendered page, read it after mount, or the first client paint disagrees with the markup. Before the outgoing view unmounts, find the item nearest the viewport centre and open the incoming view there — leaving a grid at item 60 and arriving at item 1 is worse than not switching. Tiles that declare their content's own aspect ratio are what let one item travel between the two without cropping or distortion.

### 9. Owner-curated content disappears when empty; user data gets an empty state that teaches

**When a collection the site's owner curates is empty, its route, its navigation entry, its section and any divider around it all go — derived from one flag. When the data is the user's own, the empty state is the feature's first screen and must teach it.**

The two cases look alike and are opposites. "No posts yet" on a portfolio publishes an absence to every visitor; there is nothing the visitor can do about it, so it is an admission, not information. Derive one flag per collection and let the navigation, the router, the section list, the sitemap and the metadata all read it — "which routes exist" is content, not routing. Filter sections *before* placing dividers so a rule never hangs above nothing, and redirect an emptied route somewhere real rather than to a 404.

An empty inbox or a project with no tasks is the opposite: the user can act, and this is where they learn how. The empty state says what goes here and why it's useful, offers the one action that creates the first item, and sits at `measure.reading` like any other prose. **"Empty because new" and "empty because filtered" are different states**: the filtered one names the filter and offers to clear it, and never pretends the data doesn't exist.

At every count, the layout should look deliberate: one or two items in a three-up grid stay item-sized rather than stretching. A single card stretched to full width is the tell that a grid was never designed for its own edge cases.

→ Gating code for route tables and file-based routers, empty-state anatomy, forks and the touch audit: `references/forks-gating-and-disclosures.md`

### 10. A disclosure hides its content; it doesn't unmount it

**Collapsed content stays in the served markup — a native `<details>`, or animated to zero height with `inert` and `aria-hidden` — and is unmounted only when it is genuinely expensive or genuinely absent.** A spec table, an FAQ answer or a summary behind a toggle is worth nothing to a crawler, to find-in-page or to a text export if it only exists after a click; unmounting throws it away for everyone who isn't looking at the screen.

`inert` is what makes keeping it safe. Visually collapsed content still in the tree is still tabbable and still announced, so a keyboard user tabs into invisible prose and a screen reader reads a section the page presents as closed. `inert` removes it from the tab order and the accessibility tree together; `aria-hidden` alongside covers engines without `inert`. `display: none` isn't the answer where the close is animated, because it can't be. Prefer `<details>` wherever the animation allows: keyboard behaviour, expanded state and find-in-page come free. A menu's wrapper stays mounted while its panel unmounts, so `aria-controls` always resolves.

### 11. Structure is accessibility, and it's decided with the layout

**Landmarks, heading levels, the skip link and anchor offsets are layout decisions, made in the same pass as the layout, not retrofitted.**

- A skip link parked off-screen by a transform (never `display: none`, which removes it from the tab order), on `z.skip-link`, targeting an `id="main"` every template carries.
- Every `<nav>` labelled — a page with three unlabelled navs is unnavigable by landmark.
- **Heading levels follow structure, not size.** Two headings at the same size can legitimately be `h3` and `h4`; never pick a level for its default style.
- `scroll-margin-top` on every anchor target, matched to the scroll spy's reading line, or a jump lands the heading above the line and the contents highlights the previous section.
- `aria-current` on the active row, `aria-pressed` on toggles, `aria-expanded` and `aria-controls` on disclosure and menu triggers; decorative spans `aria-hidden`; in-page links as real anchors with the handler layered on top.
- Print is a presentation: chrome hidden, and every scroll-revealed element forced visible, or the page prints blank.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| `measure.reading`, in characters of `type.body` | 65–75; default 70 | 60–70; default 65 — prose inside the product only | 55–70; default 62 |
| Page structure | One column every template shares | App shell: nav region, content region, optional inspector | Sections may go full-bleed; text blocks at the measure |
| `measure.wide` | ≈ 1.5 × `measure.reading` | = `measure.app` | Viewport minus two `gutter`s |
| `measure.app` | — | Content 960–1440px; nav region 220–264px; inspector 320–400px | — |
| `gutter` (smallest width) | 24–32px | 16px | 20–24px |
| `space.tight` / `space.group` / `space.section` | 8 / 16–24 / 48–72px | 4–8 / 12–16 / 24–32px | 8–12 / 24–32 / 96–160px |
| Heading pair ratio, above : below | 3:1–4:1 | 2:1–3:1 | 3:1–5:1 |
| Rules between sections | Only at a change of subject | Panel edges do the separating; rules only inside panels | Surface or colour bands; rules rare |
| Page top space | 80–112px | 16–24px inside the shell | Set by the hero |
| Radius: `small` / `control` / `card` / `container` | 4 / 8 / 12 / 16px | 2 / 4–6 / 8 / 12px | Either 0 throughout, or 8 / 12 / 20 / 28px |
| Corner shape | Circular, or a light superellipse | Circular | Any, applied globally |
| `hairline.chrome` / `hairline.object` / `rule.emphasis` | 0.5 / 1 / 2px | 1 / 1 / 2px, divider a colour step lighter | 1 / 1–2 / 3–4px |
| Breakpoints | 2 | 3 | 3–4 |
| Rail appears at | `measure.reading` + 2 × (rail + gap) + gutters, ≈ 1200–1280px | Always a region; collapses at `bp.shell` | Rarely has rails |
| Rungs on the z ladder | ≈ 7 | 8–9 (adds toasts, stacked modals) | ≈ 7 |

The `glass` preset takes its values from `glass-layout`.

**The measure.** Editorial sits at the top of the comfortable range because its reader is committed; long lines are efficient once reading is sustained, provided leading pays for the return sweep. Product text is scanned in short bursts, so it sits lower. Expressive body often runs larger, so fewer characters fit the same comfortable width. Moving the measure below 55 or above 80 characters costs reading, whatever the preset.

**Page structure.** Editorial's single column is what buys positional continuity; product trades it for a shell because a working reader needs navigation, content and detail visible at once. The law under both is the same: prose stays at the measure.

**Density.** Product halves editorial's spacing because a working reader compares things side by side and scrolling is friction. It keeps the asymmetry — a dense form with equal gaps everywhere is exactly where grouping is lost first. Expressive section gaps are large because each section is a scene; the heading pair ratio still holds inside it.

**Radius.** A sharp system (0 throughout) is a legitimate expressive character, and it satisfies the nesting law trivially. What costs is mixing: a round button inside a square card, or four near-identical radii that are really one.

**Hairlines.** `0.5px` renders as a true hairline on high-density screens and rounds up to 1px elsewhere, so it degrades rather than vanishing. Product sets 1px throughout because much of its use is on external monitors at 1× and density needs a line that reads; its divider steps down in colour instead.

**Breakpoints.** Each one should name the decision that stops working at it. Two is enough for a single-column site: where the column becomes padding-limited, and where a rail finally fits.

## Building it for a project

1. **Read the preset and the areas.** A `product` app with `app/(docs)/** → editorial` gets a shell for the app and a single column for the docs, sharing one `measure.reading`.
2. **Set the measure from the type.** Take `family.text` at `type.body` and choose a character count from the dials. Resolve it to a width by measuring the font — a 16px sans averages about 8px per character, so 70 characters ≈ 560px of text — or express it in `ch`, remembering that `ch` is the width of the digit zero and runs 10–20% wider than an average letter, so 60ch holds roughly 70 characters. Check the narrowest case: 360px minus two `gutter`s, with the longest `type.title` in the project.
3. **Derive the frame.** If the content has a rail, `measure.frame` = `measure.reading` + 2 × (`measure.rail` + gap) + 2 × `gutter`, and `bp.rail` is that width. For a shell, set the region widths and the width at which the inspector, then the nav, collapses.
4. **Build the spacing from ratios.** Pick the base (4px), `space.section`, then set the heading pair from the preset's ratio and fill `space.tight` and `space.group` so every group's inner gap is at most half its outer one.
5. **Build the radius ladder inward.** Choose `radius.container`, list every real nesting in the project (container → control → avatar), and derive each step by subtracting padding. The ladder is whatever those subtractions produce, snapped.
6. **Assign the three line jobs**, per the preset, and confirm the divider is never more prominent than the object edge.
7. **Write the z ladder** from the table in law 6, dropping rungs the project doesn't use and keeping the gaps.
8. **List the forks and the gates**: which components ship twice and why, which collections are owner-curated (gated) and which are user data (empty states).

A fictional freight-tracking app, *Manifest* — `product`, docs area `editorial`, Inter at 14px in the app and 16px in the docs:

```css
:root {
  --measure-reading: 34rem;       /* 544px ≈ 65 characters of Inter at 16px — docs and all help text */
  --measure-app: 1360px;
  --shell-nav: 240px;
  --shell-inspector: 360px;
  --gutter: 16px;

  --space-tight: 6px;
  --space-group: 16px;
  --space-section: 32px;
  --space-heading-above: 24px;    /* 3:1 with the pair below */
  --space-heading-below: 8px;

  --radius-container: 12px;       /* a panel, 4px padding …            */
  --radius-card: 8px;             /* … holds 8px rows (12 − 4)         */
  --radius-control: 6px;          /* a button, 2px inset …             */
  --radius-small: 4px;            /* … holds a 4px badge (6 − 2)       */
  --radius-pill: 9999px;

  --hairline-chrome: 1px;         /* divider uses border.divider, a step lighter */
  --hairline-object: 1px;
  --rule-emphasis: 2px;

  --z-below: -10; --z-raised: 10; --z-popover: 20; --z-dismiss: 40;
  --z-nav: 50; --z-overlay: 60; --z-toast: 70; --z-skip-link: 100;
}
```

The same values land as `--spacing-*`, `--radius-*` and `--container-*` variables in a Tailwind v4 `@theme` block, under `theme.extend.spacing`, `borderRadius`, `maxWidth` and `zIndex` in a Tailwind config, or as `space`, `radii`, `sizes` and `zIndices` keys in a JS theme object — in whichever mechanism the project already uses, under its own names.

## Auditing existing code

Start from the setup scan's measures, spacing, radii, z-index and breakpoint frequencies, then collect evidence per law:

| Law | Look for | Evidence |
|---|---|---|
| 1 | Every distinct `max-width` / `max-w-*` on templates that hold prose; prose inside full-width containers | Templates at different measures, by route |
| 2 | Headings whose top and bottom margins are equal, or whose ratio is under 2:1; spacing values used once | Ratio per heading style; stray values with counts |
| 3 | Sticky elements positioned against the viewport; `100vh`; sticky panels without `overflow-y`; fixed bottom chrome | File and line; pages whose last line sits under the chrome |
| 4 | Rounded elements inside rounded elements | outer, padding, inner — and the mismatch |
| 5 | Border widths by job; dividers stronger than their object's edge; `<hr>` without a border reset | Counts per weight; offending components |
| 6 | Every `z-index` / `z-*` literal | The full set of values, sorted, with what each holds; catchers above menus; overlays above the skip link; transformed ancestors of fixed elements |
| 7 | `onMouseEnter`/`:hover` with no touch path; `any-hover`; hide-on-scroll without a capability check | Behaviour and its touch equivalent, or "none" |
| 8 | View toggles written to storage | Key, what it controls, whether a reason exists |
| 9 | Empty-state copy on owner-curated collections ("No … yet"); user-data empty states with no action | Route or component, and which case it is |
| 10 | Conditional rendering of disclosure content; collapsed content without `inert` | Component, and what content is missing from the HTML |
| 11 | Skip link and `id="main"`; unlabelled `<nav>`; heading levels chosen for size; anchor targets without `scroll-margin-top`; no print reset for hidden reveals | Per template |

Verify in a browser what can't be read from source: resize from 320px to 2560px watching the rail gap, tab through collapsed disclosures, and open find-in-page on a closed one. Report one line per finding with its evidence — a ratio, a count, a file — under `## Open issues`, and fix nothing unless asked.

## Writing back to DESIGN.md

- **Layout table rows** for every role this skill set or found: the measures, gutter, spacing roles and the heading pair (with its ratio), the radius ladder with the nestings it was derived from, the three line jobs, the z ladder, breakpoints named for what changes, and the forks — one line per component shipped twice, saying which interaction model each serves.
- **The gate list**: which collections are owner-curated and gated, and which are user data with empty states.
- **Decisions**, dated, with the reason: any dial moved off the preset (a 1px chrome hairline in an editorial project), any persisted view preference, any layer added to the ladder, any template allowed a different measure.
- **Open issues**, for every law the code breaks, with evidence. Remove an issue when the fix lands.
- **Proposed roles**, marked `proposed`, when the project needs a job with no row — a rail width, a frame width, a toast layer.

## Checklist

- [ ] Running prose sits at one `measure.reading`, defined once and shared by every template; no paragraph over two lines escapes it.
- [ ] Only non-text content, chrome and rails leave the measure; dividers are as wide as what they divide.
- [ ] The narrowest measure fits the longest `type.title` without a responsive type step.
- [ ] Every heading is closer to what follows than to what precedes: `space.heading-above : space.heading-below` between 2:1 and 5:1.
- [ ] Symmetric spacing only between peers; rules only at a change of subject.
- [ ] Every spacing value is a role on the base unit; strays are listed.
- [ ] Rails anchor to the same frame as the content; sticky panels are capped with `dvh` and scroll within.
- [ ] Below `bp.rail` the rail becomes an in-flow disclosure; fixed chrome has clearance on every template.
- [ ] Inner radius = outer − padding at every nesting; `radius.pill` only on things without a top and bottom.
- [ ] `hairline.chrome`, `hairline.object`, `rule.emphasis` each have one job; no divider outranks its object's edge; `border.layered` on translucent backdrops.
- [ ] Every z-index comes from the ladder; `z.dismiss` sits under what it dismisses; `z.skip-link` tops `z.overlay`.
- [ ] No transformed or filtered ancestor traps a fixed descendant; negative layers sit inside an isolated parent.
- [ ] Components fork where the interaction model differs, share data and rows, and sync any state both hold.
- [ ] Breakpoints are named for what changes; hover is gated on `(hover: hover) and (pointer: fine)`.
- [ ] No affordance is hidden where it can't come back; every informative hover has a touch path.
- [ ] View choices reset on arrival unless a recorded decision says otherwise; switching keeps the reader's place.
- [ ] Empty owner-curated collections lose route, nav entry, section and divider; user data gets an empty state with its first action.
- [ ] Grids look deliberate at 1, 2 and n items.
- [ ] Collapsed disclosures keep their content in the HTML, with `inert` and `aria-hidden`, or use `<details>`.
- [ ] Skip link by transform with `id="main"`; every `<nav>` labelled; heading levels follow structure; anchors carry `scroll-margin-top`; print forces reveals visible.
- [ ] Dials match the preset (`measure.reading`, spacing density, heading ratio, radius ladder, hairline weights, breakpoint count), or the difference is recorded under `## Decisions`.
