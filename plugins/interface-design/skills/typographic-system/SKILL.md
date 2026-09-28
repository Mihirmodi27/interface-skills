---
name: typographic-system
description: "Build and audit a type system for any interface — sizes assigned to roles, not read off a ratio; one job per weight and family; leading and tracking corrected for size; roles separated on another axis once size runs out; emphasis on existing axes; tabular numerals; classless imported prose; UI copy apart from reading copy; fonts that load without moving text. Applied in the project's own tokens and character (editorial, product or expressive) via its DESIGN.md. Use when setting or extending a type scale, choosing sizes, weights, leading or tracking, adding a display tier to a landing page, styling headings, leads, deks, captions, labels (including replacing uppercase eyebrows), table figures or imported Markdown, fixing templates that feel like different sites, loading or pairing fonts, or reviewing typography that feels noisy, flat or inconsistent."
---

# Typographic System

A type system is a set of promises about hierarchy: that the largest thing on a page is the most structural, that two things at one size do the same kind of job, that a reader who has learned one page can read the next. This skill builds those promises for a project and checks the code keeps them.

The organising idea is **a size exists because a role needs it** — not because a ratio produced it or a template wanted to feel important. The laws hold under every preset; the dials move between them.

## Before you start

Read `DESIGN.md` at the project root: `## Profile` for the preset and any areas on another one, `## Type` for the project's name for each role and the decisions already made. Reason in roles; write code in the project's names.

- **No `DESIGN.md`:** run the `design-system-setup` skill for this domain only, do the task, then recommend the full setup.
- **A role you need has no row:** reuse a value already doing that job; otherwise add one in the project's naming style and record it in `DESIGN.md`.
- **The task would break a law or move a dial off its preset:** say so and ask; if the user confirms, record it with its reason under `## Decisions`.
- **Preset `glass`:** the values are in `DESIGN.md`; the `glass-typography` skill, if installed, has the exact recipes behind them.

## Laws

### 1. Sizes belong to roles, not to a ratio

**Every size on the ladder names the role that needs it; a size no role claims is deleted, not kept for variety.** A modular scale from a 14px base at 1.25× gives 14, 17.5, 21.9, 27.3 — too few sizes in the band where chrome lives, unclaimed ones above the ceiling that invite use, and fractions that hint differently across engines. Let the ladder be as dense or sparse as the roles demand.

The ladder has a floor as well as a ceiling. Below the readable floor type is recognised, not read — a two-letter lettermark, card lettering — and nothing a user must read lives there. A base size no role claims (a `body { font-size: 15px }` nothing uses explicitly) is waiting to be used by accident.

Cut downward, checking what each remaining step was holding up: removing a 30px Glass article title took three more sizes with it, two of which existed only to sit between it and the body.

→ Per-preset ladders, and adding a role without growing one: `references/ladders.md`

### 2. A scale is only a system if every template is on it

**No template opens a step above the others; a page type with its own hierarchy is opting out of the system, not expressing importance.** Glass articles once opened at 30px with 19px section headings while every index opened at 18px, and a case study felt like a different site. Readers feel the opt-out as inconsistency before they notice sizes; the fix was the site's existing ladder, not a compromise.

Areas on another preset are declared by path in `DESIGN.md`, not drifted into. Inside one every template shares its ladder, and roles crossing the boundary — navigation, `type.ui`, `type.meta`, the footer — keep one set of values, so the chrome doesn't change between marketing site and app.

### 3. A tier never outranks the heading it sits under

**Nothing inside a section — a lead, a pull quote, a keyline, a stat — may be larger, heavier or louder than the heading that owns it.** A Glass keyline at 17px under a 16px heading read as paragraphs shouting over their titles; an in-body heading larger than the page's title inverts the document. Check role pairs — `type.lead` against `type.heading`, `type.heading` against `type.title` — since a violation only shows where the two meet.

`type.display`, the one role above `type.title`, obeys it too: one loudest moment, nothing under it competing. Two are two pages' worth of hierarchy on one.

### 4. When size stops separating roles, each separates on a different axis

**Two roles at one size must differ on weight, leading, colour tier, a rule or spacing — and each must own at least one signal no other role at that size uses.** That is a short ladder working, not failing. Five roles share the Glass body size:

| Role at body size | Separates on |
|---|---|
| `type.body` | nothing — the baseline the others are read against |
| `type.lead` | leading alone, 0.15 more open than the body |
| `keyline` (project role), a section's one claim | `weight.strong`, and symmetric space: it belongs to neither neighbour |
| pull quote (project role) | a solid bar and an indent |
| `type.supporting` (the dek) | `text.secondary`, and tighter leading than the body |

A further role there needs an unused axis, or it isn't a role.

The corollary matters more: **when you remove a signal, audit the ones you left in.** The Glass pull quote's 2px border at ten percent black, invisible on white, survived only while the quote was two steps larger than the body; when the size step went, it had to become a real bar.

→ Reading blocks and the prose that carries them: `references/prose-and-emphasis.md`

### 5. Every weight and every family has one job

**Weight marks structure and state, never decoration; each weight in use has a job you can name, and a weight with no job isn't loaded.** A heading's job is to be found, not loud. Push `type.heading` to 700 and `type.subheading` needs 600, `<strong>` has nowhere to go, and the axis is spent on two heading levels — how systems end with five weights and no hierarchy. The count is a dial; the discipline isn't.

A second family earns its place with a second register — literal text in a code face, a brand display voice — never because "headings should feel different", which size, weight, leading and tracking handle. A code face for a handful of spans is a system stack, not a download.

Weight is the cheapest second channel for state: colour alone fails WCAG 1.4.1, so an active row takes `weight.strong` *and* `text.primary` — only on states that don't follow the pointer (active, current, selected, not hover), since a weight change alters width and shifts neighbours.

### 6. Leading follows the job

**Display, reading and UI text each have their own leading curve, and a role never borrows another curve's leading.** Leading must exceed the gap inside a line, which the x-height sets: at display sizes a tight ratio reads generously; at body sizes it collides. Fixed-height single-line UI runs at 1, so centring is exact and a descender can't shift the box.

| Curve | Roles | Rule |
|---|---|---|
| Display | `type.display`, `type.title`, `type.heading`, `type.subheading` | Tighter as size grows; a wrapping title gets a touch more than a heading |
| Reading | `type.lead`, `type.body`, `type.supporting` | More open as the passage or measure lengthens |
| UI | `type.ui`, `type.label`, `type.meta`, `type.data` | 1 in a fixed-height single-line box; the dial's value where it wraps |

The failures mirror each other: reading leading on a nav row loses the list's rhythm; UI leading makes a paragraph a wall. On a short ladder leading is a role signal, so a lead 0.15 off the body needs that number exact.

### 7. Tracking is a size correction, in `em`

**Negative above the text range, zero on body copy, positive on tiny text and capitals — always in `em`, never in `px`.** Sidebearings are drawn for text sizes, so scaled-up type looks loose until pulled in; below the text range strokes thicken and letters merge, and capitals, lacking ascenders and descenders, need more air still. A `px` value right at 32px destroys 14px text.

Never track body copy: reading pattern-matches word shapes, and ±0.01em on a paragraph is invisible at best, a cost at worst. Tracking six different steps means the scale is doing too much work.

### 8. UI copy and reading copy are different systems

**Chrome is set for scanning and prose for sustained reading, and the difference lives in leading, measure and tier — not necessarily size.** A 14px nav row and a 14px paragraph can share a size and nothing else: the row at 1 or 1.4 leading and `text.secondary`, read in a glance; the paragraph open-leaded, at `measure.reading` and `text.primary`. When something looks off, check first for a UI role with reading values, or the reverse. Under every preset, a product's help text is reading copy inside a tool, with reading leading and measure.

### 9. Emphasis maps onto axes the system already has

**`<em>` and `<strong>` keep their semantics and map onto weight, colour or a true style the family ships — never a synthesised style, and never anything heavier than a heading.** `font-synthesis: none` makes a missing italic or bold a visible gap in review, not a smeared glyph in production. `<strong>` takes `weight.strong`, not the default 700, which in open prose is a dark blot read before the sentence. Keep strong runs to a few words; a long bold clause reads as a heading that failed to get its own line.

The mapping covers user-agent styles: `<cite>`, `<blockquote>`, `<b>`, `<th>` and `<address>` carry italics and weights a global `em { … }` rule misses. Whether italic exists is a dial; no browser default leaking past the mapping is not.

### 10. Numerals that align are tabular

**Any number in a column, a table, a timestamp, a counter or anything that updates live uses tabular figures.** Proportional digits change width with value: prices misalign, a clock twitches. `type.data` is usually `type.ui` or `type.body` plus `font-variant-numeric: tabular-nums`, not its own size. Global or scoped is a dial; a live number never shifting its row is the law. The property fails silently, so check the family ships `tnum`.

→ Figures, alignment and feature settings: `references/numerals-and-loading.md`

### 11. Prose you can't put classes on is a guest, not a second system

**Rendered Markdown, CMS fields and imported HTML are styled by element inside one scoped class, and every element maps onto a role the ladder already has.** Left alone, imported prose brings the browser's ladder — a 2em `h1`, a 1.5em `h2`, a heavy disc bullet — and the page quietly runs two systems. A document's `h1` and `h2` map to `type.heading`, never `type.title`. → The full mapping: `references/prose-and-emphasis.md`

### 12. The font arrives without moving the text

**Self-host the family, keep `font-display: swap`, and pair it with a metric-matched fallback, so that if the swap happens the lines don't move.** A third-party font CDN costs two DNS lookups and TLS handshakes, which `preconnect` shortens but can't remove; `swap` without metric matching is a reflow under the reader's eye, worse than a wait. Tune loading for the frame where one string carries the screen — a hero headline, an opening line — where a substitution is unmissable.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| `type.body` size | 16–18px | 14px | 17–20px |
| `type.ui` size | body − 1–2px | 13px (12px in dense tables) | 15–16px |
| Ceiling: `type.title` ÷ `type.body` | ≤ 1.5 | ≤ 1.6 | ≤ 2.5 |
| `type.display` | none | none | one per page, derived from the measure; ≥ 1.5 × `type.title` at every width |
| Distinct sizes above the floor (excluding display and code) | ≤ 7 | ≤ 7 | ≤ 8 |
| Readable floor | 12px | 11px | 12px |
| Weights | 2: `weight.regular`, `weight.strong` | 2: `weight.regular` 400, `weight.strong` at 500; a third only for a recorded job | 2 for text, plus `weight.display` |
| Families | one, plus a system-stack mono | one, plus mono (webfont only if code or IDs are the product) | up to two (`family.display`), plus mono |
| Leading, reading | 1.6–1.75 | 1.45–1.55 | 1.5–1.65 |
| Leading, headings | 1.2–1.3 | 1.25–1.35 | title 1.1–1.2; display 0.95–1.05 |
| Leading, multi-line UI | 1.4 | 1.3–1.4 | 1.4 |
| Tracking at the top of the ladder | −0.02em | −0.01em | display −0.03 to −0.045em |
| Uppercase labels | none | none: sentence case, separated by tier and a rule | eyebrows, +0.06–0.1em |
| Italic | true italic, if the family ships one, for `em` and titles of works | none: `em` → `text.secondary` | true italic allowed as a display voice |
| Numerals | tabular wherever numbers align or update; proportional in prose | tabular globally; slashed zero on IDs and codes | proportional in display, tabular in data |
| Responsive sizes | none | none | display and title fluid via `clamp()` |
| Unit | `rem` | `rem` | `rem` (fluid values with a `rem` intercept) |

**Ceiling.** The ratio, not the pixel value, carries character: an editorial title modestly above body keeps the reading loudest. Raising it costs more than one size, as every tier between wants a step; record any raise with the role that needed it.

**Display.** Derived from the headline and the column, not body × ratio; within 1.5× of `type.title` it is a big title, not a tier. → Derivation, bounds, leading, tracking and weight: `references/display-tier.md`

**Weights.** Product runs two, with `weight.strong` at 500 rather than 600: on a dense screen headings are found by size, tracking and tier, and a 600 heading forces a middle weight for tabs, totals and labels to hold their own against it — how a product ends up with three weights and a noisy page. Keep strong at 500 and the active tab, the column total and the row title all take it. A third weight needs a job the two can't carry, recorded in `DESIGN.md`; it costs a font file and a check that every weight still has exactly one job. Expressive's `weight.display` can go *lighter* than regular (`references/display-tier.md`).

**Leading.** The reading range moves with the measure — long lines need more leading for the eye to find the next — so wide measures sit at the top. Product sits lowest: short reading copy, narrow measure.

**Tracking.** Values scale with how far above the text range the ladder climbs: editorial's touches two sizes, expressive display needs the most, and a family with an optical-size axis does some of that itself, so sits at the low end.

**Readable floor.** Product can go to 11px because its reader is fluent and glancing — a column header, a unit, a keyboard hint; editorial and expressive readers are not, and an 11px caption goes unread.

**Uppercase labels.** Capitals are a texture; a page of them is signage. Uppercase eyebrows over every section and column are what a template looks like, so product sets labels in sentence case and separates a group label from the same-size rows beneath it by tier (`text.tertiary`) and a hairline rule, not case. Expressive may use capitals for an eyebrow, tracked positive (law 7); editorial doesn't need them.

**Italic.** The Glass package's ban is about its family, whose italic fights the letterforms, not about italic. Editorial with a good true italic should use it; product rarely has reading copy long enough to need one, and saves a file.

**Responsive sizes.** In editorial and product a responsive step is a symptom of a size too large for the narrowest measure: fix the ladder, not a breakpoint, and on a phone fix the measure or leading (`references/ladders.md`). Expressive display is the exception, derived from a column that changes.

**Unit.** `rem` respects a user's root font size; `px` doesn't, and the Glass package uses it to protect 1px relationships in its small band, relying on browser zoom. Either is defensible; mixing them is not. Never size text in `vw` alone — it ignores zoom, failing WCAG 1.4.4.

## Building it for a project

1. **Read the reader and the family.** The preset sets the dials; the family adjusts them. Note its x-height (a large one reads bigger, so body can sit a pixel lower), true italic, `tnum`, `opsz` axis and weights. Record `family.text`; `family.display` only if the preset allows and a register needs it.
2. **List the roles the project has, not the ones this skill lists** — canonical and project roles (a `keyline`, a `kicker`, a `stat`) found in the templates. No instance, no row.
3. **Fix body first, then the ceiling** (`type.body` from dial and family, `type.title` within the ratio); everything else sits between them and the floor.
4. **Place the other roles, reusing sizes** with different leading, weight or tier; a new size only when no unused axis is left, naming the sizes it sits between.
5. **Assign each shared-size role its axis** in the table (law 4); a row whose only signal is shared at that size is a collision to fix now.
6. **Set leading per curve and tracking per size** from the dials (laws 6–7).
7. **Map emphasis, numerals and imported prose** onto those roles (laws 9–11).
8. **Load the fonts** self-hosted, only the weights in the table, with a metric-matched fallback. → `references/numerals-and-loading.md`
9. **Check the pairs:** each supporting role against its heading, each template's opening against the others'.

Worked example — **Tally**, a `product` app with an `expressive` marketing area: `references/ladders.md`.

Tailwind v4 takes these in `@theme` as `--text-*` and `--font-weight-*` (leading as `--text-*--line-height`); v3 under `theme.extend.fontSize` as `[size, { lineHeight, letterSpacing }]` tuples; a JS theme as a `typography` object keyed by role names.

## Auditing existing code

Inventory first, then read by template — drift is almost always one or two templates running their own scale.

```sh
node <design-system-setup>/scripts/scan.mjs . --ignore <prose and example dirs>
rg -o "text-\[[^\]]+\]|font-size:\s*[^;]+" src | sort | uniq -c | sort -rn
rg -o "font-(thin|light|normal|medium|semibold|bold|black)|font-weight:\s*\d+" src | sort | uniq -c
rg -n "italic|<i>|<cite|<blockquote" src
rg -n "tracking-|letter-spacing|uppercase|text-transform" src
rg -n "tabular-nums|tnum|font-variant-numeric" src
rg -n "@font-face|fonts.googleapis|font-display|size-adjust|next/font|fontsource" .
rg -n "dangerouslySetInnerHTML|v-html|innerHTML|\{@html|marked|remark|markdown-it" src
```

Evidence per law:

- **Roles (1).** Each distinct size, count and role; sizes used once or twice are strays or unnamed roles — say which.
- **Templates (2).** Each template's first-heading and body size; one opening higher is a finding, by path.
- **Pairs (3).** Section blocks' size and weight against their heading; grep `type.lead`, quote and stat styles.
- **Axes (4).** Each role's signal on shared sizes; one with no signal of its own is a collision.
- **Weights and families (5).** Loaded against used; weights with no nameable job; webfonts for a handful of spans.
- **Leading and tracking (6, 7).** Headings or rows with reading leading, tracked body copy, `px` letter-spacing, uppercase labels the preset doesn't allow.
- **Emphasis (9).** `font-synthesis` unset over a missing style, `<strong>` heavier than headings, UA italics on `cite` and `blockquote`.
- **Numerals (10).** Tables, prices, timers, counters or date columns without tabular figures; live numbers, watched for a second.
- **Imported prose (11).** Every HTML injection point, scoped and mapped or falling back to the browser.
- **Loading (12).** Third-party font hosts, `swap` without a metric-matched fallback, weights requested but unused.

Report one line per finding, with evidence, in `DESIGN.md` `## Open issues`: *"`type.lead` (`.intro`) is 20px under an 18px `type.heading` on `app/blog/[slug]` — outranks its heading."* Don't fix while auditing unless asked.

## Writing back to DESIGN.md

- **`## Type`** — families; a row per role in use (project name, size, leading, tracking, weight, tier); project roles under their canonical parent with their separating axis; each weight's job. Keep existing names; mark new ones `proposed`.
- **`## Decisions`** — every dial moved off the preset, dated, with its reason (a third weight and the table that needed it, a raised ceiling and its role, italic for a true italic); any law knowingly broken, with the user's confirmation.
- **`## Open issues`** — each violation with its evidence, removed when fixed.

Write back whenever the ladder changes shape — a role, size, weight or family added or dropped. A size without a row is how a ladder turns back into a pile of values.

## Checklist

- [ ] Every size maps to a named role in `DESIGN.md`; no unclaimed base size.
- [ ] One ladder per area; roles crossing a boundary keep one set of values.
- [ ] Nothing outranks its heading; no in-body heading outranks `type.title`; at most one `type.display` per page.
- [ ] Each role sharing a size owns a signal no other role there uses.
- [ ] Every weight and family has a job; no weight changes on hover.
- [ ] Active and selected states carry a signal besides colour.
- [ ] Display, reading and UI each use their own leading curve; fixed-height single-line UI uses 1.
- [ ] Tracking is in `em`: negative only above the text range, positive on tiny text and capitals, zero on body.
- [ ] UI and reading copy differ in leading, measure and tier; in-product help text is reading copy.
- [ ] `font-synthesis: none`; `<strong>` is `weight.strong`; no UA italic or bold leaks past the mapping.
- [ ] Aligned and live numbers are tabular, and the family ships `tnum`.
- [ ] Imported prose: one scoped class, existing roles, first-child margin reset, wide content scrolling in its own box.
- [ ] Fonts self-hosted, `swap`, metric-matched fallback; only used weights requested.
- [ ] Nothing a user must read sits below the readable floor.
- [ ] Dials match the preset: body size, ceiling ratio, weight and family counts, leading ranges, tracking at the top.
- [ ] Display derived from the measure, clamped with a `rem` intercept; no text sized in `vw` alone.
- [ ] Italic, uppercase labels, numeral defaults and the unit match the preset or a recorded decision.
