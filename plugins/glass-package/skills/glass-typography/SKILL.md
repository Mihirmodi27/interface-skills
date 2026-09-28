---
name: glass-typography
description: "The exact type system from modimihir.com — the Glass package, to copy as-is. For mostly-text interfaces: a dense ladder with a low ceiling, two weights, leading inverse to size, tracking only at large sizes, roles that separate on weight, leading and rules, and emphasis by weight and colour, not italic. Use when setting a type scale, picking sizes/weights/leading/tracking, styling headings, body copy, long-form prose, leads, keylines, pull quotes, deks, notes, meta lines, captions, labels, tooltips or lettermarks, styling imported Markdown you can't put classes on, separating UI copy from reading copy, choosing text colour tiers, handling numerals and tabular alignment, self-hosting fonts and metric-matched fallbacks, or reviewing typography that feels noisy, inconsistent, or like two templates from different sites."
---

# Glass Typography

> **Glass package.** This is the type system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. For the same principles fitted to your project's own names, values and character, use `typographic-system` from the adaptable set. When both are installed and the project's `DESIGN.md` names a preset other than `glass`, that skill leads and this one is only a worked example.

For interfaces where the text *is* the product — portfolios, docs, writing. The aim: **a reader should never notice the typography, only the hierarchy.** The example is Archivo in a 640px measure with Tailwind v4 tokens; the reasoning transfers to any family.

## 1. The role ladder

Do not derive sizes from a modular ratio: 1.25× from 14px gives 14 / 17.5 / 21.9 / 27.3, four sizes for a page that needs ten, none on a whole pixel. Give each **role** a size, in steps of 1–2px, as densely as the roles demand.

| Role | Size | Leading | Tracking | Weight | Text tier |
|---|---|---|---|---|---|
| Index page title (h1) | 18 | 1.25 | −0.02em | 500 | primary |
| Detail page title (h1) | 16 | 1.3 | −0.015em | 500 | primary |
| Section heading (h2) | 16 | 1.2 | −0.015em | 500 | primary |
| Prose heading (h2) | 16 | 1.2 | −0.015em | 500 | primary |
| Keyline — a section's claim | 14 | 1.6 | — | 500 | primary |
| Lead paragraph | 14 | 1.9 | — | 400 | primary |
| Prose body | 14 | 1.75 | — | 400 | primary |
| Pull quote | 14 | 1.75 | — | 400 | primary |
| Dek / standfirst | 14 | 1.55 | — | 400 | muted |
| Reading paragraph | 14 | 1.65 | — | 400 | primary or muted |
| Sub-heading (h3/h4) | 14 | 1.4 | — | 500 | primary |
| UI row | 14 | 1 | — | 400 | secondary |
| Summary line | 13.5 | 1.6 | — | 400 | primary |
| List row / dense label | 13 | 1.4 | — | 400 | secondary |
| Note, caption, meta, fact | 13 | 1.5–1.6 | — | 400 | faint or quiet |
| Code | 12.5 | 1.6 | — | 400 mono | secondary |
| Tag, micro-label | 12 | — | — | 400 | muted |
| Tooltip | 11 | 1 | — | 400 | inverted |
| Lettermark | 8.5 | 1 | +0.02em | 500 | muted |
| Card lettering | 7.5 | 1.2 | −0.01em | 600 | primary |

Text tiers (`primary` → `quiet`) come from the **glass-color** skill. Only the top two are grey-ramp steps (`gray-1000`, `gray-900`); `muted` / `quiet` / `faint` are separate tokens picked for contrast: a border needs 3:1, text 4.5:1, and one step can't serve both. Mid-ramp greys as text fail in a light theme and look fine in dark.

**Eighteen is the ceiling, and it's lower than you think.** An earlier ladder topped out at 30px, with a 19px prose heading, a 17px dek and a 16px prose body. Case studies and articles opened at 30px and every other page at 18px, so a case study felt like a different site. **A scale is only a system if every template is on it**; one that opens two steps above the others is opting out, not expressing importance. The rest of the site ran on **two sizes**, 16 for headings and 14 for everything read; the detail templates came down to those, and the four sizes were deleted, not replaced.

### When size stops doing the work

Collapse the ladder and eight roles share 14px — the constraint the system is *for*. Each separates on a different axis, no two sharing a mechanism. That keeps a one-size column legible, and means a ninth 14px role needs an unused axis first.

| Role | The signal | Not |
|---|---|---|
| Keyline | weight 500, and 36px of air on both sides | a size step |
| Lead | leading — 1.9 against the body's 1.75 | a size step |
| Pull quote | a 3px rounded bar and a 16px indent | a size step |
| Dek | the muted tier, and tighter leading at 1.55 | a size step |

**A tier must never outrank the heading it sits under** — the rule worth more than the ladder. A 17px keyline under a 16px heading made the paragraphs shout over the titles; at one size, that can't return.

The cost is a flatter page: titles and section headings are both 16px, separated by position and spacing. It's the right flat, because the home page already worked that way and the detail pages were the outlier.

**Nothing in this ladder resizes.** The old step, a 30px title dropping to 26px below `sm`, went with the size that needed it. A responsive type step usually means one size is too large for your narrowest measure: fix the ladder, not the breakpoint.

→ Full derivation, including how to add a role without bloating the ladder: `references/scale.md`

## 2. Two weights

Load 400 and 500. That is the system.

- **400** — all body copy, all reading copy, all quiet UI.
- **500** — headings at every level, active states, `<strong>`, lettermarks.

No 600, no 700. 500 against 400 is already a clear step; 700 makes headings shout and forces every *other* level louder to keep its distance, which is how systems end up with five weights and no hierarchy.

**The one exception** is a single `font-semibold`, on 7.5px folder-card lettering. Below about 8px a 500 doesn't survive rasterisation as a weight — too few pixels across a stem — so it's 600 or nothing. It's below the readable floor, on something recognised rather than read: the only kind of exception to accept, and one is the right number.

**Weight also keeps state off colour alone.** A contents rail's active row takes `font-medium` *and* primary colour: colour alone fails WCAG 1.4.1, weight alone is subtle but real, together they're unambiguous. Reach for weight before a background.

→ Weight and tracking in depth, including when 300 is legitimate: `references/weight-and-tracking.md`

## 3. Leading runs inverse to size

Three curves, one per job:

| Job | Range | Rule |
|---|---|---|
| **Display** — titles, headings | 1.2 – 1.3 | Bigger means tighter. A 16px heading at 1.65 reads as two loose lines, not one heading. |
| **Reading** — paragraphs, prose | 1.55 – 1.9 | Longer passages, more open: prose body 14/1.75 against a UI paragraph's 14/1.55. |
| **UI** — rows, tooltips, labels | 1 – 1.4 | Single-line text in a fixed-height box takes `leading-none`: exact centring, and no descender shifts the box. |

The inversion is optics: line spacing must exceed the gap *inside* a line, the x-height. That's already large at display sizes, so a tight ratio reads generously; at 14px it would collide.

**Two headings at one size can still differ**: a detail-page title is 16/1.3 and a section heading 16/1.2, because titles wrap and section headings are one word. Leading survives a collapsed ladder; use it before a size step.

**In prose, leading is a role signal rather than a refinement.** A 0.15 step, 1.9 against 1.75, is all that marks the lead from the body, so leading must be exact, not approximated.

## 4. Tracking is negative and scales with size

```
≤14px      0
16px      −0.015em    (headings and detail-page titles)
18px      −0.02em     (index-page titles — the top of the ladder)
7.5px     −0.01em     (card lettering, which is set solid and needs pulling in)
tiny caps +0.02em     (8.5px lettermarks, 11px initials)
```

Default spacing reads loose at large sizes; pulling it in makes a heading look *set*, not typed. Below 14px, tiny text and near-caps need *positive* tracking or the letters merge. **Tracking is a large-size correction, so a system with no large sizes barely needs it** — two negative values, 2px apart. Tracking six steps means the scale is doing too much work.

Never track body copy: −0.01em on a 14px paragraph is invisible at best and a legibility cost at worst.

## 5. Emphasis without italic or bold

```css
/* Italics are switched off globally. */
em, i { font-style: normal; }
```

Archivo's true italic is a separate file whose slant fights its geometric letterforms, so emphasis moves to two axes the system already has:

- `*emphasis*` → the **muted** text colour. It recedes rather than tilts.
- `**strong**` → weight 500 + the **primary** text colour. It advances.

```tsx
// From the inline markdown renderer
if (bold) return <strong className="font-medium text-gray-1000">{text}</strong>;
if (em)   return <em className="text-gray-800">{text}</em>;
```

At 500, `<strong>` doesn't make a dark blot you read before the sentence; and because `em` de-emphasises, emphasis runs in *two directions*, which bold-only systems can't express. Keep the semantic tags: screen readers announce them.

## 6. Numerals

```css
body { font-variant-numeric: tabular-nums; }
```

Globally, not per-component: text-heavy interfaces put numbers in columns that should align — date ranges, timestamps, read times, versions. Proportional numerals win only inside a running sentence, too rare to set the default. A live clock **must** be tabular or its row twitches every second as digits change width.

## 7. One family, self-hosted

One family, one voice. A second needs a reason — an editorial register, a code face, a brand lockup — and "headings should feel different" isn't one; weight, size, leading and tracking do that. The one exception here is legitimate:

```css
--font-sans: var(--font-archivo), system-ui, -apple-system, "Helvetica Neue", sans-serif;
/* Code, commands and paths. System stack on purpose — a second webfont for the
   few monospace runs on the site isn't worth the request. */
--font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
```

Monospace is a real second register ("this is literal, count the characters") but a **system stack, not a webfont**: a few `<code>` spans and two code blocks don't justify a request, and every platform ships a good one. *A second family earns a download only if it's carrying reading copy.*

### Self-host, and let the loader generate the fallback

```tsx
// next/font — fetched at build time, served from your own origin.
const archivo = Archivo({ subsets: ["latin"], display: "swap", variable: "--font-archivo" });
```

Google's CDN cost a DNS lookup and TLS handshake for the stylesheet and again for gstatic before the font was requested: three round trips over two third-party hosts. `preconnect`, the usual fix, shortens that without removing it; you still wait on one origin to learn a URL on another. Self-hosted, the font rides your existing connection, with a `<link rel="preload">` alongside the HTML.

- **Keep `display: swap`.** Fallback text beats no text.
- **Generate a metric-matched fallback.** `next/font` synthesises a local face scaled to your family's metrics (x-height, widths, ascent), so a swap that *does* happen doesn't move the line. It's the half of `display: swap` people skip, and what makes it safe: unmatched, a swap is a reflow under the reader's eye, worse than a wait.

**Tune loading where a swap costs most**: here the opening screen, one line alone on the page. Find where one string carries the whole frame and tune for that, not the average page.

```css
body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

## 8. Prose you don't control

Rendered Markdown, a CMS field or an imported README arrives as an HTML string, with no classes and no component to vary. Style it **by element, in one scoped class**, on the same ladder:

```css
.skill-prose            { font-size: 14px; line-height: 1.65; color: var(--color-muted); }
.skill-prose h2         { margin: 44px 0 12px; font-size: 16px; font-weight: 500; }
.skill-prose h3         { margin: 32px 0 10px; font-size: 14px; font-weight: 500; }
.skill-prose h4         { margin: 24px 0  8px; font-size: 13px; font-weight: 500; }
.skill-prose > :first-child { margin-top: 0; }
```

Four things it needs that authored prose doesn't:

- **`> :first-child { margin-top: 0 }`**, or a leading `<h2>` pushes 44px of nothing above itself.
- **Three heading levels, not one.** Imports nest deeper than authored prose's two, so `h4` gets a real role (13px, secondary tier), not a browser default.
- **Wide content scrolls in its own box**, since code blocks and tables are unbounded: `overflow-x: auto` on the `<pre>`, a wrapping `.table-scroll` div on each table. The page body must never scroll sideways.
- **Your own `<ul>` marker**: `list-style: none` and a 3px `::before` dot matching the hand-rolled bullets, because a UA disc at 14px is far too heavy. On ordered lists, `li::marker { font-variant-numeric: tabular-nums }` stops a run past 9 shifting its text.

**Imported prose is a guest in your type system, not a second one.** Map it onto roles you have; add one only where the document needs something your pages don't.

## 9. UI copy and reading copy are different systems

The most useful distinction here — one page runs two type systems:

|  | UI copy | Reading copy |
|---|---|---|
| Size | 11–16 | 13–18 |
| Leading | 1 – 1.55 | 1.55 – 1.9 |
| Lives in | chrome, rows, labels, nav | a constrained measure |
| Optimised for | scanning, glancing | sustained reading |
| Colour | often secondary/quiet | primary |

The ranges overlap: **once the ladder is short, leading and measure carry the distinction, not size.** A 14px nav row and a 14px paragraph share nothing else. If something looks off, check for reading leading on a UI row (it grows; the dock loses its rhythm) or UI leading on a paragraph (a wall).

→ How prose blocks are set — headings, quotes, lists, spacing: `references/long-form-prose.md`

## Assets

- `assets/type-tokens.css` — the ladder as CSS custom properties and Tailwind v4 `@theme` tokens, the role classes, and a scoped block for imported Markdown.
- `assets/prose.tsx` — the long-form renderer: the two-size column, the `lead` / `keyline` / `note` / `quote` / `figure` blocks and their axes, inline emphasis and link mapping.

## Applying this to an existing codebase

1. **Inventory before changing anything.** Grep every distinct size, weight, leading and tracking, *grouped by template*: systems drift into 14 sizes and 5 weights without anyone deciding to, usually via one or two templates running their own scale.
2. **Collapse weights first** — the highest-leverage change, and the most visible.
3. **Map sizes to roles, not to a scale.** Roles may share a size; a size with no role gets deleted.
4. **Set leading per curve.** Most drift is here: headings with reading leading, paragraphs with UI leading.
5. **Add tracking only above 14px.**
6. **Switch emphasis to weight + colour.** Then delete the italic font file.

## Checklist

- [ ] Two weights loaded and used; no 600/700 above the readable floor.
- [ ] Every size maps to a named role.
- [ ] **Every template on the same ladder**; no page type opens a step above the others.
- [ ] Roles sharing a size separate on weight, leading, colour or a rule — each a *different* one.
- [ ] Nothing in a section outranks its heading.
- [ ] Leading follows the display / reading / UI curves; check headings especially.
- [ ] Negative tracking above 14px only; positive on sub-10px and near-caps.
- [ ] No `font-style: italic` in output; `em` maps to colour.
- [ ] `<strong>` is 500, not 700.
- [ ] `tabular-nums` global; live-updating numbers verified stable.
- [ ] No role resizes responsively, or you can name the measure that forces it.
- [ ] Single-line UI text in fixed-height boxes uses `leading-none`.
- [ ] Fonts self-hosted, `display: swap`, with a **metric-matched** generated fallback.
- [ ] A second family only for a real second register; system-stacked unless it carries reading copy.
- [ ] Imported HTML prose: one scoped class, existing roles, `> :first-child` margin reset.
- [ ] Code blocks and tables scroll in their own box, never the page body.
- [ ] Active/selected states: weight or colour *and* one more signal.
