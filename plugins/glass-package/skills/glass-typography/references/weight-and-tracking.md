# Weight and tracking

## Weight

### The two-weight argument

400 and 500. That is a 100-unit gap — the smallest step most families offer — and it is enough.

The case for it: a heading's job is to be *found*, not to be loud. When you scan a page you're looking for a change in texture, and 400→500 is a visible change in texture. Going to 700 doesn't make the heading easier to find; it makes it impossible to ignore, which is different and usually worse.

The systemic case is stronger. Weight is a scarce signal, and scales relative to its neighbours. Once your h2 is 700, your h3 needs 600 to stay distinct, your body is 400, and `<strong>` inside body has nowhere to go — 500 now reads as *lighter* than the surrounding headings. You've spent the whole axis on two levels of heading. Keep the gap at 100 and the axis stays available for everything else: active nav rows, sub-headings, emphasis, lettermarks.

### Where each lands

**400 — the default.**
All body copy. All prose. Deks. Meta lines. Tags. Tooltips. Timestamps. Quiet nav rows. Pull quotes (a quote is already set apart by size, leading and a border; adding weight makes it strident).

**500 — structure and state.**
Headings h1–h4. `<strong>`. The active row in a table of contents. Names and wordmarks. Captions that label an image rather than describe it. Lettermarks. Company/role titles in a list, where the role is the structural element and the date is supporting.

### When 300 is legitimate

Rarely, and never for text you expect to be read at length. A light weight can work for a very large display size (48px+) where 400 starts to look heavy, or for a decorative numeral. If your interface tops out at 30px — most do — you don't need it. The reference implementation loaded 300 for a while and never used it; deleting it from the font request was a straight performance win.

### Weight as an accessibility signal

WCAG 1.4.1 (Use of Colour): colour must not be the only means of conveying information. This bites hardest on active/selected states, which designers reflexively express as a colour change.

The pattern used here — in a table of contents, the active row takes both the primary text colour *and* weight 500:

```tsx
className={`… ${tone} ${state === "active" ? "font-medium" : ""}`}
```

Weight is a genuine second channel: it survives greyscale, colour-blindness, and low-contrast displays. It's also cheaper than the usual alternatives (a background pill, a border, an icon), which all add visual weight to a list that's meant to be quiet.

One caution: a weight change alters the text's rendered width, so a row that gains `font-medium` on hover will shift its neighbours. Reserve the space, or apply weight only to states that don't change on pointer movement (active, current, selected — not hover).

## Tracking

### The ladder

| Size | Tracking | Reasoning |
|---|---|---|
| 7.5px | −0.01em | Card lettering, set solid. The exception below the floor — see the note. |
| 8.5–11px | +0.02em | Tiny glyphs and near-caps need air or the counters close up. |
| 12–14px | 0 | Default metrics are designed for this range. Leave them. |
| 16px | −0.015em | Enough to look set; small enough to be invisible as a decision. |
| 18px | −0.02em | A page title is a tighter, more deliberate object than a section heading two pixels below it. |

Five rows, and only two of them are the negative-tracking-at-size rule — because the ladder tops out at 18px. **Tracking is a large-size correction, so a system with no large sizes barely needs it.** An earlier version of this table ran to 30px at −0.025em with separate values for a 19px heading and a 19px quote; all three sizes were deleted from the ladder, and their tracking went with them. If you find yourself tracking six steps, check whether the scale is doing too much work.

The 7.5px row looks like it contradicts the 8.5–11px one above it, and it doesn't: that lettering is set solid at near-caps size on a card, where the tightening is compensating for the *setting* rather than for the size. It's also the one place a 600 weight is allowed. Two exceptions in one place is a hint you're outside the text system entirely — which you are, because nobody reads it.

### Why negative and why size-dependent

A typeface's sidebearings are drawn once, at a nominal size, for text-range use. Scale the outlines up and the spaces scale with them, so an 18px heading gets a wider optical gap than the same word at 13px — but the *reader's* tolerance for gaps doesn't scale with it. Large type therefore always looks slightly loose unless you pull it in.

Below the text range the reverse holds: rendering and hinting thicken strokes relative to counters, and letters start to touch. Tiny type needs positive tracking, and near-caps needs more of it, because capitals have no descenders or ascenders to create visual separation.

`em` units matter here: tracking must scale with the type. A `px` letter-spacing that looks right at 18px will destroy 14px text.

### Never track body copy

Reading is pattern-matching on word shapes. Tracking changes those shapes, so tracked body copy measurably slows reading — and at ±0.01em on 14px text the visual gain is nil. The only exception is a genuine all-caps run, which is not reading copy by definition.

### The 8.5px lettermark

```tsx
<span className="… border border-gray-alpha-400 px-[3px] text-[8.5px] font-medium tracking-[0.02em] text-gray-800">
  {letters}
</span>
```

This is not text, it's a mark — a two-or-three-letter stand-in for a logo, sitting in the same 20px optical box as the real SVG logos beside it. It's below the readability floor on purpose: you recognise "TS" the way you recognise an icon. The `+0.02em` and the `px-[3px]` are both about keeping the letters from touching the border box.

The general principle: sub-10px type is legitimate *only* when recognition replaces reading. Never put information there that the user must actually read.
