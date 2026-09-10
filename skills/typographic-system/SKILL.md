---
name: typographic-system
description: Build and audit type systems for interfaces that are mostly text — a dense small-size ladder with a deliberately low ceiling, two weights instead of five, leading that runs inverse to size, negative tracking as a large-size correction, roles that separate on weight, leading and rules once size runs out, and emphasis carried by weight and colour rather than italic or bold. Use when setting a type scale, picking sizes/weights/leading/tracking, styling headings, body copy, long-form prose, leads, keylines, pull quotes, deks, notes, meta lines, captions, labels, tooltips or lettermarks, styling imported Markdown you can't put classes on, separating UI copy from reading copy, choosing text colour tiers, handling numerals and tabular alignment, self-hosting fonts and metric-matched fallbacks, or reviewing typography that feels noisy, inconsistent, or like two templates from different sites.
---

# Typographic System

A type system for interfaces where the text *is* the product — portfolios, docs, writing, dashboards with real prose in them. It optimises for one thing: **a reader should never notice the typography, only the hierarchy.**

Five ideas do the work. Everything else follows from them.

1. **Two weights.** 400 and 500. Weight marks structure, never emphasis.
2. **A dense, small ladder with a low ceiling.** Everything lives between 11 and 18px. Steps of 1–2px, not 1.25× ratios.
3. **Leading runs inverse to size.** Tight at display sizes, open at reading sizes — and once the ladder is short, leading is a role signal rather than a refinement.
4. **Tracking is a large-size correction.** 0 at 14px, −0.015em at 16, −0.02em at 18. That's the whole range.
5. **Emphasis is weight and colour, not italic or bold.**

And a sixth that only shows up once you've compressed the scale: **when size stops separating two roles, they separate on weight, leading, or a rule — each on a different axis.**

The worked example throughout is the system running on [modimihir.com](https://modimihir.com) — Archivo, a 640px measure, Tailwind v4 tokens. The numbers are real and copyable; the reasoning transfers to any family.

## 1. The role ladder

Do not derive sizes from a modular ratio. A 1.25× scale from a 14px base gives you 14 / 17.5 / 21.9 / 27.3 — four sizes for a page that needs ten, and none of them land on a whole pixel. Assign a size to a **role** instead, and let the ladder be as dense as the roles demand.

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

Text tiers (`primary` → `quiet`) come from the **color-and-theming** skill. Note they are *not* simply the grey ramp: only the top two are ramp steps (`gray-1000`, `gray-900`), and `muted` / `quiet` / `faint` are separate tokens picked for contrast — because a border needs 3:1 and text needs 4.5:1, so one step can't serve both. Reusing mid-ramp greys for text fails in a light theme and looks fine in dark.

**Eighteen is the ceiling, and the ceiling is lower than you think.** An earlier version of this ladder topped out at 30px, with a 19px prose heading, a 17px dek and a 16px prose body — the shape almost every article template has. The reference implementation deleted all four sizes and did not replace them. What forced it:

> Two templates were setting their own hierarchy. Articles and case studies opened at 30px with a 17px standfirst and 19px section headings, while every other page — the index pages, a skill's own page — opened at 18px. Landing on a case study from the work index felt like arriving at a different site.

The fix was to give the detail templates the scale the rest of the site already had, and then to notice that the rest of the site was running on **two sizes**: 16 for headings, 14 for everything a reader reads. So the reading column came down to those two as well.

**The lesson generalises past these numbers.** A scale is only a system if every template is on it. A template that opens two steps above the others isn't expressing importance, it's opting out — and the reader feels the opt-out as inconsistency long before they notice the sizes.

### When size stops doing the work

Collapse a ladder like this and you hit the real problem: eight roles now share 14px, and size can no longer tell any of them apart. That's the constraint the system is *for*. Each one separates on a different axis:

| Role | The signal | Not |
|---|---|---|
| Keyline | weight 500, and 36px of air on both sides | a size step |
| Lead | leading — 1.9 against the body's 1.75 | a size step |
| Pull quote | a 3px rounded bar and a 16px indent | a size step |
| Dek | the muted tier, and tighter leading at 1.55 | a size step |

And the rule that falls out of it, which is worth more than the ladder: **a tier must never outrank the heading it sits under.** An earlier pass set the keyline at 17px, above the 16px heading it belonged to, and the page read as though the paragraphs were shouting over the titles. Pulling everything to one size removes any chance of that returning — a tier can't outrank a heading it's no longer competing with on size.

The trade is real and worth stating: page titles and section headings are now the same 16px, separated by position and spacing rather than scale. That's flatter than an article template usually is. It's the right flat, because the home page already worked that way and the detail pages were the outlier.

Read the table as a set: no two rows use the same mechanism. That's what makes a one-size reading column legible, and it's why you can't add a ninth 14px role without finding it an unused axis.

**Nothing in this ladder resizes.** Not one role changes size across viewports — a 14px paragraph is 14px on a phone. The previous version had one responsive step, a 30px title dropping to 26px below `sm`; it went when the size that needed it went. Worth registering as a general point: a responsive type step is usually a symptom that one size is too large for the narrowest measure you ship, and fixing the ladder beats tuning the breakpoint.

→ Full derivation, including how to add a role without bloating the ladder: `references/scale.md`

## 2. Two weights

Load 400 and 500. That is the system.

- **400** — all body copy, all reading copy, all quiet UI.
- **500** — headings at every level, active states, `<strong>`, lettermarks.

There is no 600 and no 700. A heading at 500 against body at 400 is already a clear step; going to 700 makes the heading shout and forces every *other* level to get louder to keep its distance. That escalation is how type systems end up with five weights and no hierarchy.

**The one exception, and where it lives.** The reference implementation has exactly one `font-semibold` in it, on 7.5px lettering inside a folder card. Below about 8px a 500 stops registering as a weight at all — there aren't enough pixels across a stem for the difference to survive rasterisation — so the choice is 600 or nothing. Note the shape of the exception: it's below the ladder's readable floor, on something you recognise rather than read. That's the only kind of exception a two-weight system should accept, and one instance of it is the right number.

**Weight is also how you avoid signalling state with colour alone.** In a table of contents, the active row takes `font-medium` *and* the primary text colour. Colour alone fails WCAG 1.4.1; weight alone is subtle but real; together they are unambiguous. Reach for weight before you reach for a background.

→ Weight and tracking in depth, including when 300 is legitimate: `references/weight-and-tracking.md`

## 3. Leading runs inverse to size

There are three leading curves, one per job:

| Job | Range | Rule |
|---|---|---|
| **Display** — titles, headings | 1.2 – 1.3 | The bigger the size, the tighter the leading. A 16px heading at 1.65 reads as two loose lines rather than one heading. |
| **Reading** — paragraphs, prose | 1.55 – 1.9 | The longer the passage, the more open. Prose body at 14/1.75 is deliberately looser than a UI paragraph at 14/1.55. |
| **UI** — rows, tooltips, labels | 1 – 1.4 | Single-line text in a fixed-height box uses `leading-none`, so vertical centring is exact and a descender can't shift the box. |

The inversion is not a preference, it's optics. Line spacing needs to exceed the visual gap *inside* a line — the x-height. At display sizes the x-height is already large, so a tight ratio reads generously; at 14px the same ratio would collide.

**Two headings at the same size can still differ.** A detail-page title is 16/1.3 while a section heading is 16/1.2, because titles wrap to two lines and section headings are one word. Leading is the axis that survives a collapsed size ladder — use it before you reach for a size step.

**Prose gets its own, looser numbers, and leading is now a role signal rather than a refinement.** With body, lead and keyline all at 14px, the lead is distinguished *only* by its 1.9 against the body's 1.75. That's a 0.15 difference doing the entire job of an opening paragraph, and it works — but it means leading has to be exact, not approximated.

## 4. Tracking is negative and scales with size

```
≤14px      0
16px      −0.015em    (headings and detail-page titles)
18px      −0.02em     (index-page titles — the top of the ladder)
7.5px     −0.01em     (card lettering, which is set solid and needs pulling in)
tiny caps +0.02em     (8.5px lettermarks, 11px initials)
```

Digital type is rendered with slightly loose default spacing at large sizes. Pulling it in is what makes a heading look *set* rather than typed. Below 14px, do the opposite: tiny text and anything approaching all-caps needs *positive* tracking or the letters merge.

Note how little range this covers now — two values, 2px apart. That's the honest consequence of a ladder that tops out at 18px: **tracking is a large-size correction, so a system with no large sizes barely needs it.** If you find yourself tracking six different steps, check whether the scale is doing too much work.

Never track body copy. A −0.01em on a 14px paragraph is invisible at best and a legibility cost at worst.

## 5. Emphasis without italic or bold

This is the most opinionated rule here, and the one that most changes how a page reads.

```css
/* Italics are switched off globally. */
em, i { font-style: normal; }
```

Archivo's true italic is a separate file and its slant fights the geometric letterforms. So emphasis is re-mapped onto the two axes the system already has:

- `*emphasis*` → the **muted** text colour. It recedes rather than tilts.
- `**strong**` → weight 500 + the **primary** text colour. It advances.

```tsx
// From the inline markdown renderer
if (bold) return <strong className="font-medium text-gray-1000">{text}</strong>;
if (em)   return <em className="text-gray-800">{text}</em>;
```

Two consequences worth knowing. First, `<strong>` at 500 rather than 700 means emphasis inside a paragraph doesn't create a dark blot you read before the sentence. Second, because `em` de-emphasises rather than emphasises, you get a real *two-directional* emphasis — something bold-only systems can't express.

Keep the semantic tags. Screen readers announce them; only the visual mapping changed.

## 6. Numerals

```css
body { font-variant-numeric: tabular-nums; }
```

Tabular by default, globally — not per-component. In a text-heavy interface, numbers are almost always in a column that should align: date ranges in an experience list, timestamps, read times, version numbers. The one place proportional numerals win (a number inside a running sentence) is rare enough that the global default is the right trade.

A live clock **must** be tabular or the whole row twitches once a second as the digits change width.

## 7. One family, self-hosted

One family, one voice. A display/body pairing needs a reason — a distinct editorial register, a code face, a brand lockup. "Headings should feel different" is not one; that's what weight, size, leading and tracking are for.

The reference implementation carries exactly one exception, and it's the legitimate kind:

```css
--font-sans: var(--font-archivo), system-ui, -apple-system, "Helvetica Neue", sans-serif;
/* Code, commands and paths. System stack on purpose — a second webfont for the
   few monospace runs on the site isn't worth the request. */
--font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
```

A code face is a real second register: monospace means "this is literal, count the characters." But it's a **system stack, not a webfont.** A handful of inline `<code>` spans and two code blocks do not justify a second font request, and every platform already ships a good monospace. The general rule: *a second family earns a download only if it's carrying reading copy.*

### Self-host, and let the loader generate the fallback

```tsx
// next/font — fetched at build time, served from your own origin.
const archivo = Archivo({ subsets: ["latin"], display: "swap", variable: "--font-archivo" });
```

The reference implementation moved off Google's CDN, and the reasoning is worth repeating because `preconnect` is usually presented as the fix:

> The Google-hosted version needed a DNS lookup and TLS handshake for the stylesheet, then the same again for gstatic before the font itself was even requested. Three round trips across two third-party hosts is a long time to hold the real typeface.

`preconnect` shortens that, it doesn't remove it — you are still waiting on a stylesheet from one origin to learn the URL of a file on another. Self-hosted, the font is on the connection you already have, and the framework emits a `<link rel="preload">` for it alongside the HTML.

Two things to keep:

- **`display: swap` stays.** A flash of fallback text still beats a flash of nothing.
- **Generate a metric-matched fallback.** `next/font` synthesises a local face with your family's metrics (x-height, widths, ascent) scaled onto it, so if the swap *does* happen the line doesn't move. This is the half of `display: swap` people skip, and it's the half that makes it safe — swap without metric matching is a reflow, and a reflow under the reader's eye is worse than a wait.

**Where a swap costs the most is your loudest hint that it matters.** Here it's the opening screen: one line of text alone on the page, so a substitution under it is unmissable. Find the moment in your interface where a single string carries the whole frame, and tune font loading for that moment rather than for the average page.

```css
body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

## 8. Prose you don't control

Everything above assumes you're setting each block. Sometimes you aren't: a rendered Markdown document, a CMS field, an imported README. It arrives as an HTML string, so it can't carry utility classes and there's no component to hang a variant off.

Style it **by element, inside one scoped class** — and hold it to the same ladder rather than letting it invent a second one:

```css
.skill-prose            { font-size: 14px; line-height: 1.65; color: var(--color-muted); }
.skill-prose h2         { margin: 44px 0 12px; font-size: 16px; font-weight: 500; }
.skill-prose h3         { margin: 32px 0 10px; font-size: 14px; font-weight: 500; }
.skill-prose h4         { margin: 24px 0  8px; font-size: 13px; font-weight: 500; }
.skill-prose > :first-child { margin-top: 0; }
```

Four things this has to get right that authored prose doesn't:

- **`> :first-child { margin-top: 0 }`.** The document starts with whatever it starts with, and a leading `<h2>` would otherwise push 44px of nothing above itself.
- **Three heading levels, not one.** Authored prose on this site uses two. An imported document nests deeper, so `h4` gets a real role (13px, secondary tier) instead of falling through to a browser default.
- **Wide content scrolls inside its own box.** Code blocks and tables are the two things a Markdown document has that a designed page doesn't, and both are unbounded. `overflow-x: auto` on the `<pre>`, and a wrapping `.table-scroll` div around each table — the page body must never scroll sideways.
- **Give `<ul>` your own marker.** `list-style: none` plus a 3px `::before` dot, matching the hand-rolled bullets everywhere else, because a UA disc at 14px is far too heavy for this system. Set `li::marker { font-variant-numeric: tabular-nums }` on ordered lists so a run past 9 doesn't shift its text.

The principle: **imported prose is a guest in your type system, not a second one.** Map its elements onto roles you already have, and only add a role where the document genuinely needs something your pages don't.

## 9. UI copy and reading copy are different systems

The single most useful distinction in the whole skill. The same page runs two type systems:

|  | UI copy | Reading copy |
|---|---|---|
| Size | 11–16 | 13–18 |
| Leading | 1 – 1.55 | 1.55 – 1.9 |
| Lives in | chrome, rows, labels, nav | a constrained measure |
| Optimised for | scanning, glancing | sustained reading |
| Colour | often secondary/quiet | primary |

The two ranges overlap almost completely now, which is the point: **once the ladder is short, the distinction is carried by leading and measure, not by size.** A 14px nav row and a 14px paragraph are the same size and nothing else about them matches.

A nav row and a paragraph can both be 14px and still be doing unrelated jobs. When something looks off, check you haven't applied reading leading to a UI row (the row grows and the dock loses its rhythm) or UI leading to a paragraph (it turns into a wall).

→ How prose blocks are set — headings, quotes, lists, spacing: `references/long-form-prose.md`

## Assets

- `assets/type-tokens.css` — the full ladder as CSS custom properties plus Tailwind v4 `@theme` tokens, the role classes, and a scoped block for imported Markdown.
- `assets/prose.tsx` — the long-form renderer: the two-size reading column, the `lead` / `keyline` / `note` / `quote` / `figure` blocks and the axis each one separates on, plus the inline emphasis and link mapping.

## Applying this to an existing codebase

1. **Inventory before you change anything.** Grep every distinct size, weight, leading and tracking in use, *grouped by template*. Systems drift into 14 sizes and 5 weights without anyone deciding to — and the drift usually turns out to be one or two templates running their own scale.
2. **Collapse weights first.** It's the highest-leverage single change, and the most visible.
3. **Map sizes to roles, not to a scale.** Two roles that share a size are fine. A size with no role gets deleted.
4. **Set leading per curve.** Most drift shows up here — a heading with reading leading, a paragraph with UI leading.
5. **Add tracking only above 14px.**
6. **Switch emphasis to weight + colour.** Then delete the italic font file.

## Checklist

- [ ] Two weights loaded and used. No 600/700 above the readable floor.
- [ ] Every size in the codebase maps to a named role.
- [ ] **Every template is on the same ladder** — no page type opens a step above the others.
- [ ] Roles sharing a size separate on weight, leading, colour or a rule — and each on a *different* one.
- [ ] Nothing inside a section outranks the heading it sits under.
- [ ] Leading follows display / reading / UI curves — check headings specifically.
- [ ] Negative tracking above 14px only; positive on sub-10px and near-caps.
- [ ] No `font-style: italic` in output; `em` maps to colour.
- [ ] `<strong>` is 500, not 700.
- [ ] `tabular-nums` set globally; any live-updating number verified stable.
- [ ] No role changes size responsively — or if one does, you can say which measure forces it.
- [ ] Single-line UI text uses `leading-none` inside fixed-height boxes.
- [ ] Fonts self-hosted, with `display: swap` and a **metric-matched** generated fallback.
- [ ] A second family only where it carries a genuine second register — and system-stacked unless it carries reading copy.
- [ ] Imported HTML prose scoped to one class, mapped onto existing roles, with `> :first-child` margin reset.
- [ ] Code blocks and tables scroll in their own box; the page body never scrolls sideways.
- [ ] Active/selected states carry weight or colour *and* one more signal.
