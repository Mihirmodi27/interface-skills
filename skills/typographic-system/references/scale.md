# The scale, derived

Why the ladder in the SKILL.md looks the way it does, and how to extend it without wrecking it.

## Against modular scales

The standard advice is to pick a base and a ratio. From 15px at 1.25×:

```
15 → 18.75 → 23.44 → 29.30 → 36.62
```

Three problems for a text-heavy interface.

**It produces too few sizes in the range you need.** Between 11px and 16px — where all chrome, meta, labels, tags and tooltips live — a 1.25× scale gives you 12 and 15 and nothing else. Real interfaces need 11, 12, 13, 14, 15 and 16 in that band, because a tooltip, a tag, a timestamp, a nav row and a paragraph are five different jobs with five different densities.

**It produces too many sizes above 20px.** A modular scale hands you 23, 29, 37, 46. A portfolio has exactly one role above 20px: the article title. The rest of the scale is dead weight that invites someone to use 23px "for variety."

**It lands on fractions.** 18.75px rounds differently across browsers and rendering engines, and subpixel type at small sizes is where hinting artefacts show up.

## Role-first instead

Every size exists because a specific piece of the interface needs it. If you can't name the role, the size doesn't get to exist.

The ladder in practice, grouped by where it appears:

**Content — one measure, top to bottom**
- 30px article title. The only genuinely large size. Its job is to be the first thing you read on the page and to survive a 26px step-down on phones.
- 19px prose heading and pull quote. Two roles, one size, different leading (1.3 vs 1.5) and different weight (500 vs 400) — which is exactly why one size can serve both.
- 18px page title. Smaller than an article title because an index page's title is a label, not a headline. This distinction matters: a *page* announces, an *article* commands.
- 17px article dek. The single odd number in the ladder, and it earns it — at 16 it merges with the prose below, at 18 it competes with the page title.
- 16px prose body and section headings. The same size doing content work at 1.75 leading and structural work at 1.2 leading and weight 500.

**Chrome — dense, scannable**
- 15px base. The `<body>` default, which almost nothing uses explicitly. It exists so unstyled text lands somewhere sensible.
- 14px, the workhorse. Reading paragraphs (1.65), secondary paragraphs (1.55), sub-headings (1.4 + 500), UI rows (leading-none). Four roles, one size, distinguished entirely by leading and weight.
- 13px. Table-of-contents rows, stack labels, footer, meta, folder captions, back links. The "supporting information" size.
- 12px. Tags, prev/next labels, hover-card titles. Small enough to read as annotation.
- 11px. Tooltips and avatar initials. The floor for anything a user is expected to read.
- 8.5px. Lettermarks inside a bordered box — a logo substitute, not text. Below the readability floor on purpose, because you recognise it rather than read it.

## Adding a role

Ask, in order:

1. **Can an existing size take it with different leading or weight?** Usually yes. 14px carries four roles this way. This is the answer 80% of the time.
2. **Is the new role actually a new role, or a variant of one you have?** "Card title" and "sub-heading" are the same role in different containers.
3. **If it genuinely needs a new size, which neighbour does it displace?** A ladder that only grows is a ladder that stopped being a system.

## The 1–2px step

In the 11–16px band the steps are 1px. That feels too small to matter and isn't, for two reasons.

First, 1px at 12px is an 8% change — proportionally larger than 2px at 30px. Perceived size difference scales with ratio, not absolute delta.

Second, in this band size is doing the *least* work. A 13px meta line and a 14px paragraph are distinguished mostly by colour tier (quiet vs primary) and position. The 1px is a supporting signal, not the primary one. That's why it can be small.

Above 16px the steps widen — 17, 18, 19, then a jump to 30 — because up there size *is* the primary signal and needs room to register.

## Responsive behaviour

Only 30px moves, and only once: 26px below the `sm` breakpoint (640px).

The reasoning: the reading measure is 640px with 32px of padding, so the text column is at most 576px wide. On a 375px phone the column is ~311px. A 30px title in 311px wraps to three lines and the negative tracking starts to hurt. 26px gets it to two.

Every other size holds because the *measure* is what changed, not the reading distance. A 14px paragraph on a phone is held closer to the eye than a 14px paragraph on a desktop, which roughly cancels the smaller column. Bumping body sizes up on mobile is a common instinct and usually makes lines too short — you get four words per line and the ragged edge becomes the dominant visual texture.

If the type genuinely feels small on a phone, the fix is nearly always the measure or the leading, not the size.

## Fixed sizes, not `rem`, and why that's a choice

The reference implementation uses `px` throughout (`text-[14px]`, not `text-sm` or `0.875rem`).

The trade: `rem` respects a user's browser font-size setting and `px` doesn't, which is a real accessibility cost. The counter-argument is that this system's hierarchy depends on precise 1px relationships in the 11–16 band, and a user scaling the root to 20px turns those into 15px steps that break the ladder — while browser *zoom* (which everyone actually uses, and which scales `px` fine) already covers the need.

Know the trade-off. If your audience skews toward users who set a root font size — documentation, government, healthcare — use `rem` and accept a looser ladder. Convert with a fixed root of 16px: 14px → 0.875rem, 13px → 0.8125rem. Never mix the two systems in one codebase.
