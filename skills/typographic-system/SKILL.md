---
name: typographic-system
description: Build and audit type systems for interfaces that are mostly text — a dense small-size ladder, two weights instead of five, leading that runs inverse to size, negative tracking that scales with size, and emphasis carried by weight and colour rather than italic or bold. Use when setting a type scale, picking sizes/weights/leading/tracking, styling headings, body copy, long-form prose, deks, meta lines, captions, labels, tooltips or lettermarks, separating UI copy from reading copy, choosing text colour tiers, handling numerals and tabular alignment, loading fonts, or reviewing typography that feels noisy, inconsistent, or generic.
---

# Typographic System

A type system for interfaces where the text *is* the product — portfolios, docs, writing, dashboards with real prose in them. It optimises for one thing: **a reader should never notice the typography, only the hierarchy.**

Five ideas do the work. Everything else follows from them.

1. **Two weights.** 400 and 500. Weight marks structure, never emphasis.
2. **A dense, small ladder.** UI type lives between 11 and 16px. Steps of 1–2px, not 1.25× ratios.
3. **Leading runs inverse to size.** Tight at display sizes, open at reading sizes.
4. **Tracking is negative and scales with size.** 0 at 14px, −0.025em at 30px.
5. **Emphasis is weight and colour, not italic or bold.**

The worked example throughout is the system running on [modimihir.com](https://modimihir.com) — Archivo, a 640px measure, Tailwind v4 tokens. The numbers are real and copyable; the reasoning transfers to any family.

## 1. The role ladder

Do not derive sizes from a modular ratio. A 1.25× scale from a 15px base gives you 15 / 18.75 / 23.4 / 29.3 — four sizes for a page that needs eleven, and none of them land on a whole pixel. Assign a size to a **role** instead, and let the ladder be as dense as the roles demand.

| Role | Size | Leading | Tracking | Weight | Text tier |
|---|---|---|---|---|---|
| Article title | 30 (26 below 640) | 1.12 | −0.025em | 500 | primary |
| Prose heading (h2) | 19 | 1.3 | −0.015em | 500 | primary |
| Pull quote | 19 | 1.5 | −0.01em | 400 | secondary |
| Page title (h1) | 18 | 1.25 | −0.02em | 500 | primary |
| Article dek | 17 | 1.55 | — | 400 | muted |
| Section heading (h2) | 16 | 1.2 | −0.015em | 500 | primary |
| Prose body | 16 | 1.75 | — | 400 | primary |
| Base / body | 15 | 1.55 | — | 400 | primary |
| Reading paragraph | 14 | 1.65 | — | 400 | primary or muted |
| Secondary paragraph | 14 | 1.55 | — | 400 | muted |
| Sub-heading (h3/h4) | 14 | 1.4 | — | 500 | primary |
| UI row | 14 | 1 | — | 400 | secondary |
| List row / dense label | 13 | 1.4 | — | 400 | secondary |
| Meta, caption, timestamp | 13 | — | — | 400 | quiet |
| Tag, micro-label | 12 | — | — | 400 | muted |
| Tooltip | 11 | 1 | — | 400 | inverted |
| Lettermark | 8.5 | 1 | +0.02em | 500 | muted |

Text tiers (`primary` → `quiet`) come from the **color-and-theming** skill. Note they are *not* simply the grey ramp: only the top two are ramp steps (`gray-1000`, `gray-900`), and `muted` / `quiet` / `faint` are separate tokens picked for contrast — because a border needs 3:1 and text needs 4.5:1, so one step can't serve both. Reusing mid-ramp greys for text fails in a light theme and looks fine in dark.

**Why 16px is the ceiling for UI.** Anything above 16 reads as content, not chrome. A section heading at 16/500 and a body paragraph at 14/400 are only 2px apart, but the weight change plus the leading change (1.2 vs 1.65) makes the hierarchy unmistakable. Size is the weakest of the three signals; spend it last.

**The two ends of the ladder are the only responsive steps.** The article title drops 30→26 below the `sm` breakpoint. Nothing else changes size across viewports — a 14px paragraph is 14px on a phone. Resizing body copy responsively is a tell that the measure is wrong, not the type.

→ Full derivation, including how to add a role without bloating the ladder: `references/scale.md`

## 2. Two weights

Load 400 and 500. That is the system.

```html
<!-- What the reference implementation actually needs -->
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500&display=swap" rel="stylesheet" />
```

- **400** — all body copy, all reading copy, all quiet UI.
- **500** — headings at every level, active states, `<strong>`, lettermarks.

There is no 600 and no 700. A heading at 500 against body at 400 is already a clear step; going to 700 makes the heading shout and forces every *other* level to get louder to keep its distance. That escalation is how type systems end up with five weights and no hierarchy.

**Weight is also how you avoid signalling state with colour alone.** In a table of contents, the active row takes `font-medium` *and* the primary text colour. Colour alone fails WCAG 1.4.1; weight alone is subtle but real; together they are unambiguous. Reach for weight before you reach for a background.

→ Weight and tracking in depth, including when 300 is legitimate: `references/weight-and-tracking.md`

## 3. Leading runs inverse to size

There are three leading curves, one per job:

| Job | Range | Rule |
|---|---|---|
| **Display** — titles, headings | 1.12 – 1.3 | The bigger the size, the tighter the leading. At 30px, 1.5 leading leaves a canyon between lines. |
| **Reading** — paragraphs, prose | 1.55 – 1.75 | The longer the passage, the more open. Prose at 16/1.75 is deliberately looser than a UI paragraph at 14/1.55. |
| **UI** — rows, tooltips, labels | 1 – 1.4 | Single-line text in a fixed-height box uses `leading-none`, so vertical centring is exact and a descender can't shift the box. |

The inversion is not a preference, it's optics. Line spacing needs to exceed the visual gap *inside* a line — the x-height. At 30px the x-height is already large, so 1.12 reads generously. At 14px the same ratio would collide.

**Prose gets its own, looser numbers.** Long-form body at 16/1.75 versus UI paragraphs at 14/1.65 versus secondary text at 14/1.55. The reader is holding a paragraph in view for seconds at a time; the extra leading is what makes that bearable.

## 4. Tracking is negative and scales with size

```
≤14px      0
16–19px   −0.015em    (−0.01em for a quote, which wants to breathe)
18px      −0.02em
30px      −0.025em
tiny caps +0.02em     (8.5px lettermarks, 11px initials)
```

Digital type is rendered with slightly loose default spacing at large sizes. Pulling it in is what makes a heading look *set* rather than typed. Below 14px, do the opposite: tiny text and anything approaching all-caps needs *positive* tracking or the letters merge.

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

## 7. One family

One family, one voice. A display/body pairing needs a reason — a distinct editorial register, a code face, a brand lockup. "Headings should feel different" is not one; that's what weight, size, leading and tracking are for.

Font loading, in order:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="…&display=swap" rel="stylesheet" />
```

```css
--font-sans: "Archivo", system-ui, -apple-system, "Helvetica Neue", sans-serif;
```

`display=swap` shows fallback text immediately and swaps — a flash of unstyled text beats a flash of *nothing*. The fallback chain is ordered so the substitute has a similar x-height, which keeps the reflow small. Self-host if you can; the `preconnect` pair is the mitigation when you can't.

```css
body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

## 8. UI copy and reading copy are different systems

The single most useful distinction in the whole skill. The same page runs two type systems:

|  | UI copy | Reading copy |
|---|---|---|
| Size | 13–16 | 14–30 |
| Leading | 1 – 1.55 | 1.55 – 1.75 |
| Lives in | chrome, rows, labels, nav | a constrained measure |
| Optimised for | scanning, glancing | sustained reading |
| Colour | often secondary/quiet | primary |

A nav row and a paragraph can both be 14px and still be doing unrelated jobs. When something looks off, check you haven't applied reading leading to a UI row (the row grows and the dock loses its rhythm) or UI leading to a paragraph (it turns into a wall).

→ How prose blocks are set — headings, quotes, lists, spacing: `references/long-form-prose.md`

## Assets

- `assets/type-tokens.css` — the full ladder as CSS custom properties plus Tailwind v4 `@theme` tokens, ready to drop in.
- `assets/prose.tsx` — the long-form renderer, showing the reading-copy half of §8 in practice.

## Applying this to an existing codebase

1. **Inventory before you change anything.** Grep every distinct size, weight, leading and tracking in use. Systems drift into 14 sizes and 5 weights without anyone deciding to.
2. **Collapse weights first.** It's the highest-leverage single change, and the most visible.
3. **Map sizes to roles, not to a scale.** Two roles that share a size are fine. A size with no role gets deleted.
4. **Set leading per curve.** Most drift shows up here — a heading with reading leading, a paragraph with UI leading.
5. **Add tracking only above 14px.**
6. **Switch emphasis to weight + colour.** Then delete the italic font file.

## Checklist

- [ ] Two weights loaded and used. No 600/700 anywhere.
- [ ] Every size in the codebase maps to a named role.
- [ ] Leading follows display / reading / UI curves — check headings specifically.
- [ ] Negative tracking above 14px only; positive on sub-10px and near-caps.
- [ ] No `font-style: italic` in output; `em` maps to colour.
- [ ] `<strong>` is 500, not 700.
- [ ] `tabular-nums` set globally; any live-updating number verified stable.
- [ ] Only the largest role changes size responsively.
- [ ] Single-line UI text uses `leading-none` inside fixed-height boxes.
- [ ] `display=swap` plus a metric-similar fallback chain.
- [ ] Active/selected states carry weight or colour *and* one more signal.
