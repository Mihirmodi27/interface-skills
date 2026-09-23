# Weight and tracking

## Weight

### The two-weight argument

400 and 500: a 100-unit gap, the smallest step most families offer, and enough.

A heading's job is to be *found*, not to be loud. Scanning, you look for a change in texture, and 400→500 is one. 700 doesn't make the heading easier to find; it makes it impossible to ignore, which is different and usually worse.

The systemic case is stronger: weight is a scarce signal, read relative to its neighbours. Once your h2 is 700, your h3 needs 600 to stay distinct, body is 400, and `<strong>` inside body has nowhere to go — 500 now reads as *lighter* than the headings around it. You've spent the whole axis on two heading levels. Keep the gap at 100 and the axis stays free for active nav rows, sub-headings, emphasis and lettermarks.

### Where each lands

**400 — the default.**
All body copy. All prose. Deks. Meta lines. Tags. Tooltips. Timestamps. Quiet nav rows. Pull quotes (already set apart by size, leading and a border; weight makes them strident).

**500 — structure and state.**
Headings h1–h4. `<strong>`. The active row in a table of contents. Names and wordmarks. Captions that label an image rather than describe it. Lettermarks. Company/role titles in a list, where the role is structural and the date supporting.

### When 300 is legitimate

Rarely, and never for text read at length: at a very large display size (48px+), where 400 starts to look heavy, or a decorative numeral. If your interface tops out at 30px — most do — you don't need it. The reference implementation loaded 300 for a while and never used it; dropping it from the font request was a straight performance win.

### Weight as an accessibility signal

WCAG 1.4.1 (Use of Colour) bites hardest on active/selected states, reflexively drawn as a colour change. Here the active table-of-contents row takes the primary text colour *and* weight 500:

```tsx
className={`… ${tone} ${state === "active" ? "font-medium" : ""}`}
```

Weight is a real second channel — it survives greyscale, colour-blindness and low-contrast displays — and cheaper than a background pill, border or icon, each of which adds visual weight to a list meant to be quiet.

One caution: a weight change alters rendered width, so a row that gains `font-medium` on hover shifts its neighbours. Reserve the space, or apply weight only to states that don't change on pointer movement (active, current, selected — not hover).

## Tracking

### The ladder

| Size | Tracking | Reasoning |
|---|---|---|
| 7.5px | −0.01em | Card lettering, set solid. The exception below the floor — see the note. |
| 8.5–11px | +0.02em | Tiny glyphs and near-caps need air or the counters close up. |
| 12–14px | 0 | Default metrics are designed for this range. Leave them. |
| 16px | −0.015em | Enough to look set; small enough to be invisible as a decision. |
| 18px | −0.02em | A page title is a tighter, more deliberate object than a section heading two pixels below. |

Only two rows are the negative-tracking-at-size rule, because the ladder tops out at 18px. An earlier table ran to 30px at −0.025em, with separate values for a 19px heading and a 19px quote; all three sizes left the ladder and took their tracking with them.

The 7.5px row doesn't contradict the 8.5–11px one: that lettering is set solid at near-caps size on a card, so the tightening compensates for the *setting*, not the size. It's also the one place a 600 weight is allowed. Two exceptions in one place hint you're outside the text system — which you are, since nobody reads it.

### Why negative and why size-dependent

Sidebearings are drawn once, at a nominal text size. Scale the outlines up and the spaces scale with them, so an 18px heading gets a wider optical gap than the same word at 13px — but the *reader's* tolerance for gaps doesn't scale. Large type always looks slightly loose unless pulled in.

Below the text range the reverse holds: rendering and hinting thicken strokes relative to counters, and letters touch. Tiny type needs positive tracking, near-caps more, because capitals have no ascenders or descenders to separate them.

Use `em` units so tracking scales with the type. A `px` letter-spacing that looks right at 18px will destroy 14px text.

### Never track body copy

Reading is pattern-matching on word shapes; tracking changes the shapes, so tracked body copy measurably slows reading — and at ±0.01em on 14px text the visual gain is nil. The only exception is a genuine all-caps run, which is not reading copy by definition.

### The 8.5px lettermark

```tsx
<span className="… border border-gray-alpha-400 px-[3px] text-[8.5px] font-medium tracking-[0.02em] text-gray-800">
  {letters}
</span>
```

Not text but a mark: a two-or-three-letter stand-in for a logo, in the same 20px optical box as the real SVG logos beside it. It's below the readability floor on purpose — you recognise "TS" the way you recognise an icon. The `+0.02em` and the `px-[3px]` both keep the letters off the border box.

Sub-10px type is legitimate *only* when recognition replaces reading. Never put information there that the user must actually read.
