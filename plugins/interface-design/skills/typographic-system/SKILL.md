---
name: typographic-system
description: Build and audit a type system for any interface — a ladder of sizes assigned to roles rather than read off a ratio, weights and families that each have one job, leading and tracking that correct for size, roles that separate on a different axis once size runs out, emphasis mapped onto the axes the system already has, tabular numerals, prose you can't put classes on, UI copy kept apart from reading copy, and fonts that load without moving the text. Applies these rules in the project's own token names and at its own character (editorial, product or expressive) through the DESIGN.md at the project root. Use when setting or extending a type scale, choosing sizes, weights, leading or tracking, adding a display tier to a landing page, styling headings, leads, deks, captions, labels, table figures or imported Markdown, fixing templates that feel like different sites, loading or pairing fonts, or reviewing typography that feels noisy, flat or inconsistent.
---

# Typographic System

A type system is a set of promises about hierarchy: that the largest thing on a page is the most structural, that two things at the same size are doing the same kind of job, that a reader who has learned one page can read the next. This skill builds those promises for a project and checks the code keeps them.

The organising idea is **a size exists because a role needs it.** Not because a ratio produced it, and not because one template wanted to feel important. Once every size answers to a role, the rest follows: when roles outnumber sizes they separate on other axes, a supporting tier can never outrank its heading, and every template has to share one ladder.

The skill works in the project's own names. `DESIGN.md` maps each canonical role (`type.body`, `type.meta`, `weight.strong`) onto whatever the codebase already calls it, and records the preset whose numbers this skill fills in. The laws below hold under every preset; the dials move between them.

## Before you start

Read `DESIGN.md` at the project root — its `## Profile` and its `## Type` section. They give you the preset (and any areas of the project on a different one), the project's own name for every role this skill talks about, and the decisions already made. Work in those names: this skill says `text.secondary`; the code you write says whatever `DESIGN.md` maps `text.secondary` to.

- **No `DESIGN.md`?** Don't stop. Run a narrow pass of the `design-system-setup` skill for this domain only — scan, map the roles you need, pick the preset from what the reader is doing — do the task, and recommend running the full setup afterwards.
- **A role you need has no row?** Look for a value already doing that job before inventing one. If you have to add one, name it in the project's style and record it in `DESIGN.md`.
- **The task would break a law, or move a dial off its preset?** Say so and ask. If the user confirms, do it, and record the decision with its reason under `## Decisions`.
- **The file names the `glass` preset?** The values are in `DESIGN.md`; the `glass-typography` skill, if installed, has the exact recipes and components behind them.

## Laws

### 1. Sizes belong to roles, not to a ratio

**Every size on the ladder names the role that needs it; a size no role claims is deleted, not kept for variety.** A modular scale from a 14px base at 1.25× gives 14, 17.5, 21.9, 27.3 — too few sizes in the band where chrome lives (a tooltip, a tag, a timestamp, a nav row and a paragraph are five densities), sizes above the ceiling that invite someone to use them, and fractions that hint differently across engines. Assign sizes to roles instead and let the ladder be as dense or as sparse as the roles demand.

The ladder has a floor as well as a ceiling. Below the readable floor, type is recognised rather than read — a two-letter lettermark, card lettering — and nothing a user must read may live there. A base size that no role claims (a `body { font-size: 15px }` nothing uses explicitly) is a size waiting to be used by accident.

When you cut a ladder, cut downward and check what each remaining step was holding up. In the Glass package, removing a 30px article title took three more sizes with it: a 19px heading and a 17px dek existed only to sit between 30 and the body.

→ Per-preset ladders, and how to add a role without growing the ladder: `references/ladders.md`

### 2. A scale is only a system if every template is on it

**No template opens a step above the others; a page type with its own hierarchy is opting out of the system, not expressing importance.** In the Glass package, articles opened at 30px with 19px section headings while every index page opened at 18px, and arriving on a case study from the work index felt like landing on a different site. Readers feel the opt-out as inconsistency long before they notice sizes. The fix was not a compromise size; it was giving the detail templates the ladder the rest of the site already used.

Areas on a different preset are declared, not drifted into: `DESIGN.md` lists them by path. Inside an area every template shares that area's ladder, and the roles that cross the boundary — navigation, `type.ui`, `type.meta`, the footer — keep one set of values, so the chrome doesn't change when a reader crosses from the marketing site into the app.

### 3. A tier never outranks the heading it sits under

**Nothing inside a section — a lead, a pull quote, a keyline, a stat — may be larger, heavier or louder than the heading that owns it.** An earlier Glass pass set a section's keyline at 17px under a 16px heading, and the page read as paragraphs shouting over their titles. The same holds up the page: an in-body heading larger than the page's own title inverts the document. Check it by role pairs, not by eye — `type.lead` against `type.heading`, `type.heading` against `type.title` — because a violation only shows on pages where the two appear together.

`type.display` is the one role above `type.title`, and it obeys the same law: it is the page's single loudest moment, and nothing under it competes. Two display moments on one page are two pages' worth of hierarchy on one.

### 4. When size stops separating roles, each separates on a different axis

**Two roles at one size must differ on weight, leading, colour tier, a rule or spacing — and each must own at least one signal no other role at that size uses.** A short ladder puts several reading roles on one size, and that is the constraint working, not failing. In the Glass package five reading roles share the body size, and each takes a different signal:

| Role at body size | Separates on |
|---|---|
| `type.body` | nothing — it is the baseline the others are read against |
| `type.lead` | leading alone, 0.15 more open than the body |
| `keyline` (project role), a section's one claim | `weight.strong`, and symmetric space because it belongs to neither neighbour |
| pull quote (project role) | a solid bar and an indent |
| `type.supporting` (the dek) | `text.secondary`, and tighter leading than the body |

Read it as a set: another role at that size needs an axis nobody has used yet, and if there isn't one, it isn't a role.

The corollary matters more than the rule: **when you remove a signal, audit the ones you left in.** The Glass pull quote once had a 2px border at ten percent black, invisible on white, survivable only while the quote was also two steps larger than the body. When the size step went, the border was carrying the whole distinction and had to become a real bar.

→ How reading blocks separate, and the prose that carries them: `references/prose-and-emphasis.md`

### 5. Every weight and every family has one job

**Weight marks structure and state, never decoration; each weight in use has a job you can name, and a weight with no job isn't loaded.** A heading's job is to be found, not to be loud. Push `type.heading` to 700 and `type.subheading` needs 600 to stay distinct, `<strong>` in body has nowhere to go, and the whole axis is spent on two heading levels. That escalation is how systems end up with five weights and no hierarchy. The count is a dial; the discipline isn't.

Families follow the same rule. A second family earns its place by carrying a second register — literal text in a code face, a brand display voice — never because "headings should feel different", which is what size, weight, leading and tracking are for. A code face used for a handful of spans is a system stack, not a download.

Weight is also the cheapest second channel for state. Colour alone fails WCAG 1.4.1, so an active row takes `weight.strong` *and* `text.primary`. Apply weight only to states that don't follow the pointer — active, current, selected, not hover — because a weight change alters width and shifts the neighbours.

### 6. Leading follows the job

**Display, reading and UI text each have their own leading curve, and a role never borrows another curve's leading.** Leading must exceed the visual gap inside a line, which is set by the x-height; at display sizes the x-height is large, so a tight ratio reads generously, and at body sizes the same ratio collides. So headings run tight and tighten as they grow, reading copy runs open and opens as passages lengthen or measures widen, and single-line UI text inside a fixed-height box runs at 1 so centring is exact and a descender can't shift the box.

| Curve | Roles | Rule |
|---|---|---|
| Display | `type.display`, `type.title`, `type.heading`, `type.subheading` | Tighter as size grows. A title that wraps gets a touch more than a heading that doesn't |
| Reading | `type.lead`, `type.body`, `type.supporting` | More open as the passage or the measure lengthens |
| UI | `type.ui`, `type.label`, `type.meta`, `type.data` | 1 in a fixed-height single-line box; the dial's value where it wraps |

The two classic failures are mirror images: reading leading on a nav row (the row grows and the list loses its rhythm) and UI leading on a paragraph (it becomes a wall). Once the ladder is short, leading is also a role signal, not a refinement — a lead that differs from the body only by 0.15 of leading needs that number exact.

### 7. Tracking is a size correction, in `em`

**Negative above the text range, zero on body copy, positive on tiny text and capitals — always in `em`, never in `px`.** Sidebearings are drawn for text sizes; scale the outlines up and the gaps scale with them, so large type looks loose until it's pulled in. Below the text range, rendering thickens strokes against counters and letters merge, and capitals, with no ascenders or descenders to separate them, need more air still. A `px` value right at 32px destroys 14px text, which is why the unit is `em`.

Never track body copy: reading is pattern-matching on word shapes, and ±0.01em on a paragraph is invisible at best and a cost at worst. A system tracking six different steps has a scale doing too much work.

### 8. UI copy and reading copy are different systems

**Chrome is set for scanning and prose for sustained reading, and the difference lives in leading, measure and tier — not necessarily in size.** A 14px nav row and a 14px paragraph can share a size and nothing else: the row is 1 or 1.4 leading, sits in chrome at `text.secondary`, and is read in a glance; the paragraph is open-leaded, held to `measure.reading`, and at `text.primary`. When something looks off, check first whether a UI role has picked up reading values or the other way round. This distinction survives every preset; a product's settings help text is reading copy inside a tool, and gets reading leading at a reading measure.

### 9. Emphasis maps onto axes the system already has

**`<em>` and `<strong>` keep their semantics and map onto weight, colour or a true style the family ships — never onto a synthesised style, and never onto something heavier than a heading.** Set `font-synthesis: none` so a missing italic or bold is a visible gap in review rather than a smeared glyph in production. `<strong>` takes `weight.strong`, not 700 by default; a 700 in open prose is a dark blot read before the sentence. Keep strong runs to a few words: at the heading's weight and the body's size, a long bold clause reads as a heading that failed to get its own line.

User-agent styles are part of the mapping. `<cite>`, `<blockquote>`, `<b>`, `<th>` and `<address>` carry their own italics and weights, and a global `em { … }` rule doesn't reach them. Whether italic exists at all is a dial; that no browser default leaks past the mapping is not.

### 10. Numerals that align are tabular

**Any number in a column, a table, a timestamp, a counter or anything that updates live uses tabular figures.** Proportional digits change width with value, so a column of prices won't align on the decimal and a clock twitches once a second. `type.data` is usually `type.ui` or `type.body` plus `font-variant-numeric: tabular-nums` rather than its own size. Whether that's global or scoped is a dial; that a live number never shifts its row is the law. Check the family actually ships `tnum` before relying on it — the property fails silently.

→ Figures, alignment, and the feature settings behind them: `references/numerals-and-loading.md`

### 11. Prose you can't put classes on is a guest, not a second system

**Rendered Markdown, CMS fields and imported HTML are styled by element inside one scoped class, and every element maps onto a role the ladder already has.** Left alone, imported prose brings the browser's own ladder — a 2em `h1`, a 1.5em `h2`, a heavy disc bullet — and a page quietly runs two systems. Map a document's `h1` and `h2` to `type.heading` — never `type.title`, which the page already has — `h3` to `type.subheading`, give `h4` a real role because documents nest deeper than authored pages, reset the first child's top margin, and let code blocks and tables scroll inside their own box so the page never scrolls sideways. Add a role only where the document needs something your pages don't.

### 12. The font arrives without moving the text

**Self-host the family, keep `font-display: swap`, and pair it with a metric-matched fallback, so that if the swap happens the lines don't move.** A third-party font CDN costs a DNS lookup and a TLS handshake for the stylesheet, then the same again for the file host before the font is requested; `preconnect` shortens that, it doesn't remove it. Self-hosted, the file rides the connection the HTML came on and can be preloaded. `swap` without metric matching is a reflow under the reader's eye, which is worse than a wait. Tune loading for the frame where one string carries the whole screen — a hero headline, an opening line — because that is where a substitution is unmissable.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| `type.body` size | 16–18px | 14px | 17–20px |
| `type.ui` size | body − 1–2px | 13px (12px in dense tables) | 15–16px |
| Ceiling: `type.title` ÷ `type.body` | ≤ 1.5 | ≤ 1.6 | ≤ 2.5 |
| `type.display` | none | none | one per page, derived from the measure; ≥ 1.5 × `type.title` at every width |
| Distinct sizes above the floor (excluding display and code) | ≤ 7 | ≤ 7 | ≤ 8 |
| Readable floor | 12px | 11px | 12px |
| Weights | 2: `weight.regular`, `weight.strong` | 3: regular, `weight.medium`, strong | 2 for text, plus `weight.display` |
| Families | one, plus a system-stack mono | one, plus mono (webfont only if code or IDs are the product) | up to two (`family.display`), plus mono |
| Leading, reading | 1.6–1.75 | 1.45–1.55 | 1.5–1.65 |
| Leading, headings | 1.2–1.3 | 1.25–1.35 | title 1.1–1.2; display 0.95–1.05 |
| Leading, multi-line UI | 1.4 | 1.3–1.4 | 1.4 |
| Tracking at the top of the ladder | −0.02em | −0.01em | display −0.03 to −0.045em |
| Uppercase labels | none | section labels only, +0.05em | eyebrows, +0.06–0.1em |
| Italic | a true italic, if the family ships one, for `em` and titles of works | none: `em` → `text.secondary` | true italic allowed as a display voice |
| Numerals | tabular wherever numbers align or update; proportional in prose | tabular globally; slashed zero on IDs and codes | proportional in display, tabular in data |
| Responsive sizes | none | none | display and title fluid via `clamp()` |
| Unit | `rem` | `rem` | `rem` (fluid values with a `rem` intercept) |

The `glass` preset takes its values from `glass-typography`.

**Ceiling.** The ratio, not the pixel value, is what carries character: an editorial title modestly above body keeps the reading the loudest thing on the page. Raising it costs more than one size — every tier between title and body now wants a step, and the ladder grows to fill the gap. Record any raise with the role that needed it.

**Display.** Expressive gets a real display tier, but its size comes from the headline and the column, not from the body times a ratio: pick how many characters a display line should hold, measure the family's average advance, and divide the column by the product. It sits well clear of `type.title` — a display tier within 1.5× of the title is a big title, not a tier. → The derivation, with fluid bounds, leading, tracking and weight at display sizes: `references/display-tier.md`

**Weights.** Product earns a third weight because dense UI has a middle job: an active tab, a column total, a label that must hold its own against a 600 heading. Adding one costs a font file and forces a check that every existing weight still has exactly one job. Expressive's `weight.display` can go *lighter* than regular: above about 48px a 400 starts to look heavy, and a 300 is the one place a light weight is legitimate.

**Leading.** The reading range moves with the measure: long lines need more leading so the eye can find the start of the next one, so a project on the wide end of its measure sits at the top of the range and a narrow one can come down. Product sits lowest because its reading copy is short and its measure is narrow.

**Tracking.** The values scale with how far above the text range the ladder climbs. Editorial's ceiling barely leaves it, so tracking touches two sizes; expressive display needs the most, and a family with an optical-size axis does some of that work itself, which is why its values sit at the low end of the range.

**Readable floor.** Product can go to 11px because its reader is fluent and glancing — a column header, a unit, a keyboard hint. Editorial and expressive readers are not, and a caption at 11px is a caption nobody reads. Below the floor, only recognised marks.

**Uppercase labels.** Capitals are a texture, and a page of them is a page of signage. Product uses them once, for section labels in dense chrome, where a change of case separates a group label from the rows beneath it at the same size. Expressive uses them for an eyebrow above a headline. Both need positive tracking (law 7); editorial doesn't need them at all.

**Italic.** The ban in the Glass package is about its family, whose italic fights the letterforms — not about italic. An editorial system with a good true italic should use it. A product system usually has no reading copy long enough to need it and one fewer file to load.

**Responsive sizes.** In editorial and product a responsive size step is a symptom: one size is too large for the narrowest measure you ship, and fixing the ladder beats tuning a breakpoint. Bumping body copy up on phones makes lines too short; if type feels small on a phone, the fix is the measure or the leading. Expressive display is the exception because it is derived from the column, and the column changes.

**Unit.** `rem` respects a user's root font size; `px` doesn't. The Glass package uses `px` to protect 1px relationships in its small band and relies on browser zoom. Either is defensible; mixing them in one codebase is not. Never size text in `vw` alone — it ignores zoom, which fails WCAG 1.4.4.

## Building it for a project

1. **Read the reader and the family.** The preset gives the dials; the family adjusts them. Note its x-height (a large one reads bigger, so body can sit a pixel lower), whether it ships a true italic, a `tnum` feature and an `opsz` axis, and which weights it actually has. Record the family in `DESIGN.md` as `family.text`, and a `family.display` only if the preset allows one and a register needs it.
2. **List the roles the project has, not the ones this skill lists.** Walk the templates: which of the canonical roles appear, and which project roles (a `keyline`, a `kicker`, a `stat`) sit under them. A role with no instance gets no row.
3. **Fix body first, then the ceiling.** `type.body` from the dial and the family; `type.title` at or under the ceiling ratio. Everything else is placed between those two and the floor.
4. **Place the other roles, reusing sizes.** For each role ask: can an existing size take it with different leading, weight or tier? Usually yes. Give it a new size only when no unused axis is left, and name the size it sits between.
5. **Assign each shared-size role its axis.** Write the separating signal into the table (law 4). A row whose signal another row at that size also uses, and nothing else, is a collision to fix now.
6. **Set leading per curve and tracking per size**, from the dials. Tracking only above the text range and on capitals.
7. **Map emphasis, numerals and imported prose** onto the roles you now have (laws 9–11).
8. **Load the fonts** self-hosted, only the weights in the table, with a metric-matched fallback. → `references/numerals-and-loading.md`
9. **Check the pairs.** Every supporting role against the heading above it; every template's opening against every other template's.

A worked example: **Tally**, a fictional invoicing app, preset `product`, with `app/(marketing)/** → expressive`. Family: a grotesque with a large x-height, `tnum`, no italic, weights 400/500/600.

```css
:root {
  --font-sans: "Tally Grotesk", "Tally Grotesk Fallback", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --text-title: 1.25rem;    /* 20px  type.title       1.3   −0.01em  600 */
  --text-heading: 1rem;     /* 16px  type.heading     1.35  0        600 */
  --text-body: 0.875rem;    /* 14px  type.body 1.5 · type.subheading 1.4 at 600 */
  --text-ui: 0.8125rem;     /* 13px  type.ui          1 in fixed rows, 1.4 wrapped */
  --text-meta: 0.75rem;     /* 12px  type.meta · type.label at 500 */
  --text-code: 0.78125rem;  /* 12.5px type.code — mono runs wide, steps down */
  --text-caps: 0.6875rem;   /* 11px  section-label (project role): caps, +0.05em */

  --weight-regular: 400;
  --weight-medium: 500;     /* active tab, column totals, type.label */
  --weight-strong: 600;     /* headings, <strong> */
}
body { font: var(--weight-regular) var(--text-body)/1.5 var(--font-sans); font-synthesis: none; }
.data, td, time { font-variant-numeric: tabular-nums; }  /* product: global in the app shell */
```

Six sizes plus code. `type.subheading` shares the body size and separates on weight; `type.label` shares the meta size and separates on weight; `type.data` has no size of its own. The marketing area adds a derived `type.display` and a larger ladder of its own, while `type.ui` and `type.meta` stay identical across the boundary (law 2).

The marketing area's display tier, derived rather than chosen: the hero headline should hold about 20 characters a line in the 960px desktop column and about 14 in a 343px phone column, and the family's measured average advance is 0.52em. So 960 ÷ (20 × 0.52) ≈ 92px and 343 ÷ (14 × 0.52) ≈ 47px, interpolated between 375px and 1280px viewports:

```css
--text-display: clamp(2.9375rem, 1.772rem + 4.97vw, 5.75rem); /* 47 → 92px, 1.0, −0.035em */
```

Against a 28–40px expressive `type.title`, that stays above 1.5× at both ends.

In Tailwind v4 these land in `@theme` as `--text-*` and `--font-weight-*` tokens (with `--text-*--line-height` for leading); in Tailwind v3 under `theme.extend.fontSize` as `[size, { lineHeight, letterSpacing }]` tuples; in a JS theme as a `typography` object keyed by the project's role names.

## Auditing existing code

Start with the inventory, then read by template — drift is almost always one or two templates running their own scale.

```sh
node <design-system-setup>/scripts/scan.mjs . --ignore <prose and example dirs>
rg -o "text-\[[^\]]+\]|font-size:\s*[^;]+" src | sort | uniq -c | sort -rn
rg -o "font-(thin|light|normal|medium|semibold|bold|black)|font-weight:\s*\d+" src | sort | uniq -c
rg -n "italic|<i>|<cite|<blockquote" src
rg -n "tracking-|letter-spacing" src
rg -n "tabular-nums|tnum|font-variant-numeric" src
rg -n "@font-face|fonts.googleapis|font-display|size-adjust|next/font|fontsource" .
rg -n "dangerouslySetInnerHTML|v-html|innerHTML|\{@html|marked|remark|markdown-it" src
```

Then collect evidence per law:

- **Roles (1).** Every distinct size, with its count and the role it serves. Sizes used once or twice are strays or unnamed roles; say which.
- **Templates (2).** For each page template, the size of its first heading and its body. Any template opening above the others is a finding, named by path.
- **Pairs (3).** For each section-level block, its size and weight against the heading above it. Grep `type.lead`, quote and stat styles specifically.
- **Axes (4).** For each size carrying more than one role, the signal each role uses. A role with no signal of its own is a collision.
- **Weights and families (5).** Weights loaded against weights used; any weight with no nameable job; any webfont family downloaded for a handful of spans.
- **Leading and tracking (6, 7).** Headings with reading leading, rows with reading leading, tracked body copy, `px` letter-spacing.
- **Emphasis (9).** `font-synthesis` unset where a style is missing, `<strong>` heavier than headings, UA italics on `cite` and `blockquote` that escaped the mapping.
- **Numerals (10).** Any table, price, timer, counter or date column without tabular figures; any live number, watched for a second.
- **Imported prose (11).** Every place HTML is injected, and whether its elements are scoped and mapped or falling back to the browser.
- **Loading (12).** Third-party font hosts, `swap` without a metric-matched fallback, weights requested but never used.

Report one line per finding in `DESIGN.md` `## Open issues`, with the evidence: *"`type.lead` (`.intro`) is 20px under an 18px `type.heading` on `app/blog/[slug]` — outranks its heading."* Don't fix while auditing unless asked.

## Writing back to DESIGN.md

- **`## Type`** — the families; one row per role in use with its project name, size, leading, tracking, weight and tier; project roles under their canonical parent with the axis that separates them; the weights and what each is for. Keep existing names; mark new ones `proposed`.
- **`## Decisions`** — every dial moved off the preset, dated, with its reason: a third weight and the table that needed it, a raised ceiling and the role, italic enabled because the family has a true one. Also any law knowingly broken, with the user's confirmation.
- **`## Open issues`** — each violation with its evidence, removed when fixed.

Write back whenever the ladder changes shape: a role added or deleted, a size added, a weight or family added or dropped. A size added without a row is how a ladder turns back into a pile of values.

## Checklist

- [ ] Every size in the code maps to a named role in `DESIGN.md`; no base size goes unclaimed.
- [ ] Every template in an area shares one ladder; roles crossing an area boundary keep one set of values.
- [ ] No role inside a section outranks its heading; no in-body heading outranks `type.title`; at most one `type.display` per page.
- [ ] Every role sharing a size owns at least one named signal no other role at that size uses.
- [ ] Every weight and family in use has a job; no weight changes on hover.
- [ ] Active and selected states carry weight or another signal as well as colour.
- [ ] Headings, reading copy and UI text each use their own leading curve; fixed-height single-line UI uses 1.
- [ ] Tracking is in `em`, negative only above the text range, positive on tiny text and capitals, zero on body.
- [ ] UI copy and reading copy differ in leading, measure and tier; help text inside the product is set as reading copy.
- [ ] `font-synthesis: none`; `<strong>` is `weight.strong`; no UA italic or bold leaks past the mapping.
- [ ] Every aligned, tabulated or live number uses tabular figures, and the family ships `tnum`.
- [ ] Imported prose is scoped to one class, mapped onto existing roles, with first-child margin reset and wide content scrolling in its own box.
- [ ] Fonts are self-hosted, `swap`, with a metric-matched fallback; only used weights are requested.
- [ ] Nothing a user must read sits below the readable floor.
- [ ] Dials match the preset: body size, ceiling ratio, weight count, family count, leading ranges and tracking at the top.
- [ ] Display, if present, is derived from the measure and clamped with a `rem` intercept; no text is sized in `vw` alone.
- [ ] Italic, uppercase labels, numeral defaults and the unit match the preset or a recorded decision.
