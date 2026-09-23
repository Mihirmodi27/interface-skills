# Measure and rhythm

## Deriving `measure.reading`

Set the measure in characters of `type.body`, then resolve it to a width. A pixel number chosen first is a guess about a font you haven't measured.

```css
:root {
  --measure-reading: 60ch;   /* ch = the width of "0" in the current font: ≈ 70 characters */
}
.prose { max-width: var(--measure-reading); margin-inline: auto; }
```

`ch` is the advance of the digit zero, which runs 10–20% wider than an average lowercase letter in most text faces, so `60ch` usually holds about 70 real characters. Measure once with the real font and a paragraph of real copy, then keep the unit: `ch` follows the font, so swapping the family adjusts the measure with it. If the project prefers a pixel token, resolve it from the average character width and write both down in `DESIGN.md`:

| `type.body` | Average character | 60 characters | 68 characters | 75 characters |
|---|---|---|---|---|
| 15px sans | ≈ 7.5px | 450px | 510px | 560px |
| 16px sans | ≈ 8px | 480px | 545px | 600px |
| 17px serif | ≈ 8.3px | 500px | 565px | 620px |
| 18px sans | ≈ 9px | 540px | 610px | 675px |

These are text widths. Add two `gutter`s for the container's outer width.

**Leading pays for the measure.** A longer line needs more leading so the eye finds the start of the next one on the return sweep. That pairing belongs to `typographic-system`; what this skill owes it is a stable measure to tune against.

### Check the narrowest case

The narrowest measure you ship is the smallest supported viewport minus two `gutter`s — 360 − 2 × 20 = 320px, say. Put the longest real `type.title` in it. If it breaks into four lines, or a single long word overflows, the usual fix is the type ladder, not a breakpoint that shrinks the title on phones. A responsive type step is most often a sign that one size is too large for the narrowest column.

Where a word genuinely can't fit (a long compound, a URL in prose), give prose `overflow-wrap: anywhere` rather than letting it widen the page.

### Why every template shares it

A summary on an index and its detail page are one piece of content at two lengths. If both sit at the same measure, clicking through leaves the text where it was, and the transition reads as expansion. If the article template is 720px and the index is 640px, every click moves the text sideways and the reader rereads the first line to find their place. That cost repeats on every navigation, which is why a second measure needs a decision in `DESIGN.md`, not just a class.

## Page structure per preset

### Editorial — one column

One container, one measure, used by every template. Non-text content leaves the column by being placed outside it, never by widening it.

### Product — an app shell

A working reader needs navigation, content and detail visible together, so the page is regions rather than a column:

| Region | Width | Collapses |
|---|---|---|
| Navigation | 220–264px | Last — to an icon strip, then a menu button |
| Content | Fluid, capped at `measure.app` | Never |
| Inspector | 320–400px | First — to an overlay sheet on `z.overlay` |

The law still applies inside the regions: settings help, onboarding copy, a changelog entry and an empty state's explanation sit at `measure.reading` inside whatever region holds them. A 1200px-wide paragraph of help text in a settings pane is the most common product failure of law 1.

Collapse order is by what the reader can do without: the inspector is detail, so it goes first; navigation is how they leave, so it stays longest. Name each breakpoint for what changes — `bp.inspector`, `bp.shell` — not for a device.

### Expressive — bands with a measure inside

Sections may run to the viewport edge as bands: a colour field, a full-bleed image, a product shot. The text inside any band sits in a container at `measure.reading`, or narrower for a short statement. A two-line headline may span the band; the paragraph under it may not.

```css
.band { padding-block: var(--space-section); }
.band > .text { max-width: var(--measure-reading); margin-inline: auto; padding-inline: var(--gutter); }
```

## Spacing ladders per preset

One base unit (4px), and a role for every job. Values are defaults; the ratios are the part that must survive.

| Role | editorial | product | expressive |
|---|---|---|---|
| `space.tight` | 8px | 4–8px | 8–12px |
| `space.group` | 16–24px | 12–16px | 24–32px |
| `space.section` | 48–72px | 24–32px | 96–160px |
| `space.heading-above` | 40–48px | 16–24px | 48–80px |
| `space.heading-below` | 12px | 8px | 16px |
| Pair ratio | 3:1–4:1 | 2:1–3:1 | 3:1–5:1 |

Half-steps (6px, 10px, 14px, 44px) are legitimate when a ratio lands between whole steps. What isn't legitimate is a value used once with no role behind it.

## Asymmetry at every scale

The rule: **the gap inside a group is visibly smaller than the gap around it.** The same shape recurs at every size:

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Prose heading → its paragraph | 12px | 44px above | ≈ 3.7:1 |
| List items → the next block | 8px | 24px | 3:1 |
| Card title → its body, cards in a stack | 6px | 20px between cards | ≈ 3.3:1 |
| Field label → its input, fields in a form | 4–6px | 16px | ≈ 3:1 |
| Role title → its dates | 2px | 6px | 3:1 |

Ratios cluster between 2:1 and 4:1. Below 2:1 the grouping is ambiguous; above about 5:1 the group looks stranded from its neighbours.

**The failure story.** A form with `gap: 16px` on everything puts each label exactly as far from its own input as from the input above it. On a long form the reader starts attaching labels to the wrong field, and the fix people reach for — a border round every field — adds noise to paper over a spacing bug. Tighten label-to-input to 4–6px and the form groups itself.

## Section rhythm

**Peers get symmetric padding.** Sections on a home page or a dashboard are siblings; none owns another, so each gets the same top and bottom space.

**A change of subject gets asymmetry and, sometimes, a rule.** On a long page, a major section starts with more space above the rule than below it, because the content below belongs to the heading that follows:

```css
.major-section {
  margin-top: var(--space-section);          /* e.g. 64px */
  padding-top: calc(var(--space-section) * 0.625);   /* e.g. 40px */
  border-top: var(--hairline-object) solid var(--border-divider);
}
.major-section:first-child { border-top: 0; padding-top: 0; }
```

The first section has nothing above it to separate from, so it takes no rule.

**Not every boundary gets a rule.** Decide per section whether it is a peer or a continuation. A short closing block that reads as a coda to the section before it follows on without a rule; ruling it off promotes it to a peer and flattens the page. Keep the decision in the layout code beside the sections, so it applies to whichever subset of sections is present, and never expose it as a setting — someone will turn every rule on.

## Page padding and chrome clearance

- **Top space signals a document.** Editorial pages start well below the top edge (80–112px); product content starts close under the shell's header (16–24px), because the shell already framed it.
- **Fixed chrome reserves its own clearance.** A fixed bottom bar or dock needs the page's bottom padding to exceed the bar's height plus its offset, on every template whose content can end near the viewport bottom. A page that ends in a footer can rely on the footer's padding instead.
- **Audit it per template.** The long article is fine because it ends in a footer that carries its own padding; the short index page with no footer puts its last item under the bar. It is the most common layout bug that survives review, because the reviewer's test page is always a long one.

## Viewport units

| Unit | Means | Use |
|---|---|---|
| `dvh` | The visible height, updating as mobile browser chrome shows and hides | The default for anything sized to the viewport |
| `svh` | The height with chrome fully shown | A hero that must never be cut off |
| `lvh` | The height with chrome fully hidden | Rarely — a background that must always cover |
| `vh` | Equal to `lvh` on most mobile browsers | Avoid; a `100vh` element's bottom sits under the address bar |

A sticky rail's cap is `calc(100dvh - top offset - bottom margin)` with `overflow-y: auto`, so a long table of contents scrolls within itself instead of running off the screen.
