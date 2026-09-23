# The scale, derived

Why the ladder in the SKILL.md looks the way it does, and how to extend it without wrecking it.

## Against modular scales

The standard advice is to pick a base and a ratio. From 14px at 1.25×:

```
14 → 17.5 → 21.88 → 27.34 → 34.18
```

Three problems for a text-heavy interface.

**It produces too few sizes in the range you need.** Between 11px and 16px — where all chrome, meta, labels, tags and tooltips live — a 1.25× scale gives you 14 and nothing else until 17.5. Real interfaces need 11, 12, 13, 14 and 16 in that band, because a tooltip, a tag, a timestamp, a nav row and a paragraph are five different jobs with five different densities.

**It produces sizes above the ceiling.** A modular scale hands you 22, 27, 34. This system's largest role is 18px. Everything the scale offers above that is dead weight that invites someone to use 22px "for variety" — and one template using 22px for variety is exactly how a scale stops being one.

**It lands on fractions.** 17.5px rounds differently across browsers and rendering engines, and subpixel type at small sizes is where hinting artefacts show up.

## Role-first instead

Every size exists because a specific piece of the interface needs it. If you can't name the role, the size doesn't get to exist.

The ladder in practice, grouped by where it appears:

**Content — one measure, top to bottom**
- 18px index-page title. The largest role on the site: `/writing`, `/work`, `/experience`, `/resume`, `/skills`, and a skill's own page. It's a label for a collection, and it's the only place tracking goes to −0.02em.
- 16px everything structural — a detail page's title, a section heading, a prose heading. One size, three roles, separated by leading (1.3 for a wrapping title, 1.2 for a heading) and by position.
- 14px everything read — body, lead, keyline, pull quote, dek, sub-headings. Six roles at one size. This is where the system does its real work, and §1 of the SKILL.md is the table of how they stay apart.
- 13.5px summary lines. Half a pixel, and it's deliberate: a collapsed summary panel is read once, standing, deciding whether to continue — a hair above the note tier and a hair below the body it's summarising. Use half-steps at most once.
- 13px the apparatus — notes, captions, citations, facts, meta, back links.

**Chrome — dense, scannable**
- 12.5px code. Monospace runs wide, so it needs a step down to occupy the same measure as the prose around it. This is the one place a size exists to compensate for a *family* rather than a role.
- 12px. Tags, prev/next labels, hover-card titles. Small enough to read as annotation.
- 11px. Tooltips and avatar initials. The floor for anything a user is expected to read.
- 8.5px lettermarks, 7.5px card lettering. Below the readability floor on purpose — you recognise these rather than read them, which is also why 7.5px is the one place a 600 weight is allowed.

**What was deleted, and why it's worth knowing**

An earlier version of this ladder had 30, 19, 17 and 15 in it. All four are gone:

| Size | Was | Why it went |
|---|---|---|
| 30 | Article title | Two templates opening two steps above every other page. Now 16. |
| 19 | Prose heading, pull quote | Came down with the title — an in-body heading can't outrank the page's own. Now 16 and 14. |
| 17 | Article dek | Existed only to sit between 30 and 16. With both gone it had no gap to fill. Now 14, muted. |
| 15 | `<body>` base | A default nothing used explicitly. A base size that no role claims is a size waiting to be used by accident. |

The deletions have a shape: **three of the four existed to serve the size above them.** Remove the top of a ladder and the rungs below it stop being load-bearing. When you cut a scale, cut downward and check what each remaining step was actually holding up.

## Adding a role

Ask, in order:

1. **Can an existing size take it with different leading or weight?** Usually yes. 14px carries four roles this way. This is the answer 80% of the time.
2. **Is the new role actually a new role, or a variant of one you have?** "Card title" and "sub-heading" are the same role in different containers.
3. **If it genuinely needs a new size, which neighbour does it displace?** A ladder that only grows is a ladder that stopped being a system.

## The 1–2px step

In the 11–16px band the steps are 1px. That feels too small to matter and isn't, for two reasons.

First, 1px at 12px is an 8% change — proportionally larger than 2px at 18px. Perceived size difference scales with ratio, not absolute delta.

Second, in this band size is doing the *least* work. A 13px meta line and a 14px paragraph are distinguished mostly by colour tier (faint vs primary) and position. The 1px is a supporting signal, not the primary one. That's why it can be small.

Above 16px there is exactly one step left — 18 — because the ladder deliberately stops there. A ceiling this low is unusual and it's the system's most consequential choice; §1 of the SKILL.md has the argument.

## Responsive behaviour

**Nothing resizes.** Not one role changes size across viewports.

That's a change from the earlier version of this system, where the 30px article title dropped to 26px below the `sm` breakpoint. The step-down existed because 30px in a ~311px phone column wrapped to three lines. With the ceiling at 18px there's nothing left that a phone column can't hold, so the responsive rule dissolved along with the size that needed it.

Worth noticing: **a responsive type step is usually a symptom.** It says one size is too large for the narrowest measure you ship. Fixing the ladder removed the need for the breakpoint entirely — which is the better outcome than tuning the breakpoint, because a size that only works at one viewport is a size the system can't reason about.

Every other size holds because the *measure* is what changes, not the reading distance. A 14px paragraph on a phone is held closer to the eye than a 14px paragraph on a desktop, which roughly cancels the smaller column. Bumping body sizes up on mobile is a common instinct and usually makes lines too short — you get four words per line and the ragged edge becomes the dominant visual texture.

If the type genuinely feels small on a phone, the fix is nearly always the measure or the leading, not the size.

## Fixed sizes, not `rem`, and why that's a choice

The reference implementation uses `px` throughout (`text-[14px]`, not `text-sm` or `0.875rem`).

The trade: `rem` respects a user's browser font-size setting and `px` doesn't, which is a real accessibility cost. The counter-argument is that this system's hierarchy depends on precise 1px relationships in the 11–16 band, and a user scaling the root to 20px turns those into 15px steps that break the ladder — while browser *zoom* (which everyone actually uses, and which scales `px` fine) already covers the need.

Know the trade-off. If your audience skews toward users who set a root font size — documentation, government, healthcare — use `rem` and accept a looser ladder. Convert with a fixed root of 16px: 18px → 1.125rem, 14px → 0.875rem, 13px → 0.8125rem. Never mix the two systems in one codebase.
