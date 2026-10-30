# The scale, derived

Why the ladder in the SKILL.md looks the way it does, and how to extend it without wrecking it.

## Against modular scales

The standard advice is a base and a ratio. From 14px at 1.25×:

```
14 → 17.5 → 21.88 → 27.34 → 34.18
```

Three problems for a text-heavy interface.

**Too few sizes where you need them.** Between 11px and 16px, where all chrome, meta, labels, tags and tooltips live, a 1.25× scale gives 14 and nothing else until 17.5. Real interfaces need 11, 12, 13, 14 and 16 there: tooltip, tag, timestamp, nav row and paragraph are five jobs at five densities.

**Sizes above the ceiling.** The scale hands you 22, 27, 34; this system's largest role is 18px. Everything above is dead weight inviting someone to use 22px "for variety" — and one template doing that is exactly how a scale stops being one.

**Fractions.** 17.5px rounds differently across browsers and rendering engines, and subpixel type at small sizes is where hinting artefacts show up.

## Role-first instead

Every size exists because a specific piece of the interface needs it; if you can't name the role, the size doesn't get to exist. Grouped by where they appear:

**Content — one measure, top to bottom**
- 18px index-page title, the largest role: `/writing`, `/work`, `/experience`, `/resume`, `/skills`, a skill's own page. It labels a collection, and it's the only place tracking goes to −0.02em.
- 16px everything structural — a detail page's title, a section heading, a prose heading. Three roles, separated by leading (1.3 for a wrapping title, 1.2 for a heading) and position.
- 14px everything read — body, lead, keyline, pull quote, dek, sub-headings. Six roles at one size, where the system does its real work; §1 of the SKILL.md tabulates how they stay apart.
- 13.5px summary lines. The half-pixel is deliberate: a collapsed summary is read once, deciding whether to continue — a hair above the note tier, below the body it summarises. Use half-steps at most once.
- 13px the apparatus — notes, captions, citations, facts, meta, back links.

**Chrome — dense, scannable**
- 12.5px code. Monospace runs wide, so it steps down to occupy the same measure as the prose around it — the one size that compensates for a *family* rather than a role.
- 12px. Tags, prev/next labels, hover-card titles; small enough to read as annotation.
- 11px. Tooltips and avatar initials. The floor for anything a user is expected to read.
- 8.5px lettermarks, 7.5px card lettering. Below the floor on purpose — recognised rather than read, which is also why 7.5px is the one place a 600 weight is allowed.

**What was deleted, and why it's worth knowing**

An earlier ladder had 30, 19, 17 and 15. All four are gone:

| Size | Was | Why it went |
|---|---|---|
| 30 | Article title | Two templates opening two steps above every other page. Now 16. |
| 19 | Prose heading, pull quote | Came down with the title — an in-body heading can't outrank the page's own. Now 16 and 14. |
| 17 | Article dek | Existed only to sit between 30 and 16; with both gone, no gap to fill. Now 14, muted. |
| 15 | `<body>` base | A default nothing used explicitly — a size waiting to be used by accident. |

**Three of the four existed to serve the size above them.** Remove a ladder's top and the rungs below stop being load-bearing, so cut downward and check what each remaining step was holding up.

## Adding a role

Ask, in order:

1. **Can an existing size take it with different leading or weight?** Usually yes — 14px carries four roles this way. This is the answer 80% of the time.
2. **Is it a new role, or a variant of one you have?** "Card title" and "sub-heading" are the same role in different containers.
3. **If it needs a new size, which neighbour does it displace?** A ladder that only grows has stopped being a system.

## The 1–2px step

In the 11–16px band the steps are 1px. That feels too small to matter, and isn't.

First, 1px at 12px is an 8% change, proportionally larger than 2px at 18px; perceived difference scales with ratio, not delta.

Second, in this band size does the *least* work. A 13px meta line and a 14px paragraph are told apart mostly by colour tier (faint vs primary) and position; the 1px is a supporting signal, which is why it can be small.

Above 16px there is one step, 18, where the ladder stops — the system's most consequential choice; §1 of the SKILL.md argues it.

## Responsive behaviour

**Nothing resizes.** The 30px article title used to drop to 26px below `sm`, because in a ~311px phone column it wrapped to three lines; at an 18px ceiling the rule went with the size. Fixing the ladder beats tuning a breakpoint, because a size that only works at one viewport is one the system can't reason about.

Sizes hold because the *measure* changes, not the reading distance: a phone is held closer, which roughly cancels the narrower column. Bumping body sizes up on mobile makes lines too short — four words per line, the ragged edge the dominant texture. If type feels small on a phone, fix the measure or the leading, not the size.

## Fixed sizes, not `rem`, and why that's a choice

The reference implementation uses `px` throughout (`text-[14px]`, not `text-sm` or `0.875rem`).

The trade: `rem` respects a user's browser font-size setting and `px` doesn't, a real accessibility cost. But this hierarchy depends on precise 1px relationships in the 11–16 band, a root scaled to 20px turns them into 15px steps that break the ladder, and browser *zoom* — which everyone uses, and which scales `px` fine — already covers the need.

If your audience skews toward users who set a root font size — documentation, government, healthcare — use `rem` and accept a looser ladder. Convert at a fixed 16px root: 18px → 1.125rem, 14px → 0.875rem, 13px → 0.8125rem. Never mix the two systems in one codebase.

## Keeping every element on it

A ladder drifts by partial updates more than by bad decisions: a role changes, some elements take the new value and some keep the old, and the page reads as two systems. So every type change ends in a sweep.

1. **Walk every route**, not the page you changed, and check each text element against its role: size, leading, weight, tracking.
2. **Move raw sizes onto role tokens** as you go. `text-[14px]` or `text-sm` has to be found and edited by hand next time; `text-copy` changes in one place.
3. **Check the same element across pages** — a pane title, a page header, a pair of sibling buttons. They take one role everywhere; where two disagree, match the better one.

One trap makes step 2 fail silently. `tailwind-merge`, behind most `cn()` helpers, recognises font sizes only from Tailwind's default scale, so it reads `text-copy` as a *colour* and drops it in favour of a later `text-gray-900`: no error, just a size that falls back to the inherited one. Register the role names:

```ts
import { extendTailwindMerge } from "tailwind-merge";

export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["page", "section", "copy", "summary", "dense", "code", "micro", "tip", "mark", "card"] }],
    },
  },
});
```

Then check the *rendered* size of one element per role, not the source: the class can be written there and never reach the markup.
