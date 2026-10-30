# Measure and rhythm

## Deriving `measure.reading`

Set the measure in characters of `type.body`, then resolve it; a pixel number chosen first is a guess about an unmeasured font.

```css
:root {
  --measure-reading: 60ch;   /* ≈ 70 characters */
}
.prose { max-width: var(--measure-reading); margin-inline: auto; }
```

`ch` is the advance of the digit zero, which runs 10–20% wider than an average lowercase letter in most text faces, so `60ch` usually holds about 70 real characters. Measure once with the real font and copy, then keep the unit, which follows the font when the family changes. For a pixel token, resolve from the average character width and record both in `DESIGN.md`:

| `type.body` | Average character | 60 characters | 68 characters | 75 characters |
|---|---|---|---|---|
| 15px sans | ≈ 7.5px | 450px | 510px | 560px |
| 16px sans | ≈ 8px | 480px | 545px | 600px |
| 17px serif | ≈ 8.3px | 500px | 565px | 620px |
| 18px sans | ≈ 9px | 540px | 610px | 675px |

These are text widths; add two `gutter`s for the container. A longer line needs more leading for the return sweep — a pairing `typographic-system` tunes against a stable measure.

### Check the narrowest case

The narrowest measure is the smallest supported viewport minus two `gutter`s — 360 − 2 × 20 = 320px, say. If the longest real `type.title` breaks into four lines there, or a long word overflows, fix the type ladder rather than shrinking the title on phones; a responsive type step usually means one size is too large for the narrowest column. For a word that can't fit (a long compound, a URL), give prose `overflow-wrap: anywhere` rather than letting it widen the page.

### Why every template shares it

An index summary and its detail page are one piece of content at two lengths. With a 720px article and a 640px index, every click moves the text sideways and the reader rereads the first line to find their place — on every navigation, which is why a second measure needs a decision in `DESIGN.md`, not just a class.

## Page structure per preset

### Editorial — one column

One container, one measure, every template; non-text content leaves the column by being placed outside it, never by widening it.

### Product — an app shell

A working reader needs navigation, content and detail together, so the page is regions:

| Region | Width | Collapses |
|---|---|---|
| Navigation | 220–264px | Last — to an icon strip, then a menu button |
| Content | Fills its panel, left-aligned at one `gutter` | Never |
| Inspector | 320–400px | First — to an overlay sheet on `z.overlay` |

Settings help, onboarding copy, a changelog entry and an empty state's explanation still sit at `measure.reading`; a 1200px-wide paragraph of help text in a settings pane is the most common product failure of law 1. The inspector is detail, so it collapses first; navigation is how the reader leaves, so it stays longest. A centred column inside the content panel wastes the width a working reader opened the window for, and a page that sets its own `max-width` or padding drifts from its neighbours: the shell owns both.

### The product page

Top to bottom, every page in the shell has the same parts, so a reader learns one page and can read them all:

| Part | Shape |
|---|---|
| Header bar | About 44px; breadcrumb at the start, the page's own actions at the end as quiet ghost buttons; the page title at the nav's size, not a display heading |
| Stat strip | 3–4 figures under the header, parted by hairlines; each figure filters the table below to what it counts, and shows when it's the active filter |
| Toolbar | Search, then filters as icons with tooltips — a text label on every filter crowds the bar — then the view switch; on touch the filters open as a labelled sheet |
| Content | The table, board or list, at the panel's full width |

**The table.** One shared component on every page: `radius.card` in a hairline frame, a tinted header row with `text.primary` labels, rows around 44px, hairlines between rows only (no column rules), a hover wash. A table that doesn't use it is a second table style.

**The group bar.** One shared component: a tinted band about 36px tall holding a chevron, the group's name, its count and an add action, sticky under the header row while its group scrolls. Long administrative tables start with every group closed, each bar carrying a summary ("Admins 3/12 · Members 9/12"); a search opens every group it matches.

**Forms.** The field that decides the rest goes first, at full width — a category before the free text that depends on it.

**Overviews and dashboards.** Order the sections overview, trends, action items, and cut what nobody acts on — a recent-activity feed is the usual casualty. A long page is fine when the order is right. A scoped overview, one project's, is the global overview's layout over filtered sources, never a second layout, so the two can't disagree. Wireframe a new page type and share it before building: it is cheaper to argue about.

### Expressive — bands with a measure inside

Sections may run to the viewport edge as bands — a colour field, a full-bleed image, a product shot — but the text inside sits at `measure.reading`, or narrower for a short statement. A two-line headline may span the band; the paragraph under it may not.

```css
.band { padding-block: var(--space-section); }
.band > .text { max-width: var(--measure-reading); margin-inline: auto; padding-inline: var(--gutter); }
```

## Spacing ladders per preset

One base unit (4px), a role for every job. Values are defaults; the ratios must survive.

| Role | editorial | product | expressive |
|---|---|---|---|
| `space.tight` | 8px | 4–8px | 8–12px |
| `space.group` | 16–24px | 12–16px | 24–32px |
| `space.section` | 48–72px | 24–32px | 96–160px |
| `space.heading-above` | 40–48px | 16–24px | 48–80px |
| `space.heading-below` | 12px | 8px | 16px |
| Pair ratio | 3:1–4:1 | 2:1–3:1 | 3:1–5:1 |

Half-steps (6px, 10px, 14px, 44px) are legitimate when a ratio lands between whole steps; a value used once with no role behind it isn't.

## Asymmetry at every scale

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Prose heading → its paragraph | 12px | 44px above | ≈ 3.7:1 |
| List items → the next block | 8px | 24px | 3:1 |
| Card title → its body, cards in a stack | 6px | 20px between cards | ≈ 3.3:1 |
| Inside a dense card: meta line → title, title → details | 6px | 12px | 2:1 |
| Board cards → the next lane | 8px between cards | 12px between lanes | 1.5:1, held by the lane's own edge |
| Field label → its input, fields in a form | 4–6px | 16px | ≈ 3:1 |
| Role title → its dates | 2px | 6px | 3:1 |

Ratios cluster between 2:1 and 4:1. A form with `gap: 16px` on everything puts each label as far from its input as from the one above, and on a long form readers attach labels to the wrong field. A border round every field only adds noise over the spacing bug; tighten label-to-input to 4–6px and the form groups itself. The same goes for a screen called cluttered: check its gaps against this table — padding inside a card (12px on a dense board), tiers within it, gaps between peers — before reaching for colour, weight or another rule.

## Section rhythm

**Peers get symmetric padding**: sections on a home page or a dashboard are siblings, so each gets the same top and bottom space. **A change of subject gets asymmetry and, sometimes, a rule**, with more space above the rule than below, because the content below belongs to the heading that follows:

```css
.major-section {
  margin-top: var(--space-section);          /* e.g. 64px */
  padding-top: calc(var(--space-section) * 0.625);   /* e.g. 40px */
  border-top: var(--hairline-object) solid var(--border-divider);
}
.major-section:first-child { border-top: 0; padding-top: 0; }
```

The first section has nothing above it to separate from, so it takes no rule. A short closing block that reads as a coda follows on without one; ruling it off promotes it to a peer and flattens the page. Decide peer or continuation in the layout code beside the sections, so it applies to whichever subset is present, and never expose it as a setting — someone will turn every rule on.

## Page padding and chrome clearance

- **Top space signals a document.** Editorial pages start well below the top edge (80–112px); product content starts close under the page's header bar (16–24px), which already framed it.
- **Fixed chrome reserves its own clearance.** Under a fixed bottom bar or dock, the page's bottom padding must exceed the bar's height plus its offset on every template whose content can end near the viewport bottom; a page ending in a footer can rely on the footer's padding.
- **Audit it per template.** The long article ends in a padded footer; the short index without one puts its last item under the bar — the layout bug that most often survives review, because the test page is always a long one.

## Viewport units

| Unit | Means | Use |
|---|---|---|
| `dvh` | The visible height, tracking mobile browser chrome | The default for anything sized to the viewport |
| `svh` | The height with chrome fully shown | A hero that must never be cut off |
| `lvh` | The height with chrome fully hidden | Rarely — a background that must always cover |
| `vh` | Equal to `lvh` on most mobile browsers | Avoid; a `100vh` element's bottom sits under the address bar |

A sticky rail is capped at `calc(100dvh - top offset - bottom margin)` with `overflow-y: auto`.

## Worked example: *Manifest*

A fictional freight-tracking app — `product`, docs area `editorial`, Inter at 14px in the app and 16px in the docs:

```css
:root {
  --measure-reading: 34rem;       /* 544px ≈ 65 characters of Inter at 16px — docs and all help text */
  --measure-app: 100%;            /* content fills its panel, left-aligned */
  --shell-nav: 240px;
  --shell-inspector: 360px;
  --gutter: 16px;

  --space-tight: 6px;
  --space-group: 16px;
  --space-section: 32px;
  --space-heading-above: 24px;    /* 3:1 */
  --space-heading-below: 8px;

  --radius-container: 12px;       /* panel, 4px padding … */
  --radius-card: 8px;             /* … holds 8px rows */
  --radius-control: 6px;          /* button, 2px inset … */
  --radius-small: 4px;            /* … holds a 4px badge */
  --radius-pill: 9999px;

  --hairline-chrome: 0.5px;       /* a border: one device pixel on 2×, 1px on 1×; divider uses border.divider */
  --hairline-object: 0.5px;       /* table frames match their row rules */
  --rule-emphasis: 2px;

  --z-below: -10; --z-raised: 10; --z-popover: 20; --z-dismiss: 40;
  --z-nav: 50; --z-overlay: 60; --z-toast: 70; --z-skip-link: 100;
}
```

The same values land as `--spacing-*`, `--radius-*` and `--container-*` variables in a Tailwind v4 `@theme` block, under `theme.extend.spacing`, `borderRadius`, `maxWidth` and `zIndex` in a Tailwind config, or as `space`, `radii`, `sizes` and `zIndices` keys in a JS theme object — whichever the project already uses, under its own names.
