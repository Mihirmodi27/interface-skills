# Long-form prose

How the reading half of the system is set. The distinction that matters: prose is the one place where the reader holds a paragraph in view for seconds at a time, so it gets looser, larger, and more generously spaced than anything else on the site — inside the *same* 640px measure as everything else.

## The container sets the register

```tsx
<div className="text-[16px] leading-[1.75] text-gray-1000">
```

One wrapper carries size, leading and colour; every block inherits and only overrides what differs. Prose body is 16/1.75 — a full size step above UI paragraphs (14) and noticeably more open (1.75 vs 1.65).

Why 1.75 specifically: at a 576px text column and 16px type, a line holds roughly 75–85 characters. That's at the upper end of comfortable, and long lines need more leading so the eye can find the start of the next one. Shorten the measure and you could pull leading back toward 1.6.

## Block spacing

| Block | Spacing | Note |
|---|---|---|
| Paragraph | `mb-6` (24px) | 1.5× the type size. |
| Heading (h2) | `mt-11 mb-3` (44 / 12) | Asymmetric: a heading belongs to what follows it. |
| Quote | `my-8` (32px) | More air than a paragraph, both sides. |
| List | `mb-6`, items `space-y-2` | Matches paragraph spacing so a list reads as one block. |

**The asymmetry is the important part.** 44px above a heading, 12px below. A heading with equal space above and below floats between two sections and belongs to neither. The ~3.5:1 ratio makes the grouping unambiguous: the heading and the paragraph beneath it are one unit.

This is the single most common prose-typography mistake, and the easiest to fix.

## Headings inside prose

```tsx
<h2 className="mt-11 mb-3 text-[19px] font-medium leading-[1.3] tracking-[-0.015em]">
```

19px against 16px body — a small step, but the weight (500), the tight leading (1.3), and the 44px of space above do the real work. Compare with the page-level section heading at 16px: prose headings sit *inside* a reading flow and need to be slightly larger than the text they interrupt, while a section heading sits above a block and gets its authority from position.

## Quotes

```tsx
<blockquote className="my-8 border-l-2 border-gray-alpha-300 pl-5 text-[19px] leading-[1.5] tracking-[-0.01em] text-gray-900">
```

Four simultaneous signals, none of them loud: a size step up, a leading step down (1.5, tighter than body's 1.75), a step *down* the colour ramp to secondary, and a 2px left rule with 20px of indent.

Note what's absent — no italic (globally disabled), no quotation marks, no background, no larger weight. The quote is set apart by *texture*, not decoration. The colour step down is counterintuitive and correct: the quote isn't yours, so it recedes slightly even as it grows.

The citation goes quieter still and explicitly kills the browser's italic:

```tsx
<cite className="mt-2 block text-[13px] not-italic text-gray-700">— {cite}</cite>
```

`not-italic` is required because `<cite>` and `<blockquote>` carry UA italics that the global `em, i { font-style: normal }` rule doesn't cover.

## Lists

```tsx
<ul className="mb-6 list-disc space-y-2 pl-5 marker:text-gray-500">
```

The `marker:` variant is the detail worth stealing. A default bullet inherits the text colour, so at primary it's a row of dark dots pulling attention down the left edge. Dropping markers to the quiet tier makes them read as structure rather than content. Same for `list-decimal` — a quiet number is still perfectly legible.

`space-y-2` (8px) between items against `mb-6` (24px) below the list: items are more related to each other than the list is to the next paragraph. Same grouping logic as the heading asymmetry.

## Hand-rolled bullets in UI context

Outside prose — in a role's responsibilities list, say — a custom marker gives finer control:

```tsx
<li className="flex gap-2.5 text-[14px] leading-[1.65]">
  <span aria-hidden className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-gray-500" />
  <span>{text}</span>
</li>
```

A 3px dot at the quiet tier, offset `mt-[9px]` to sit on the first line's optical centre. That 9px is derived, not guessed: 14px × 1.65 leading = 23.1px line box, so the centre is at ~11.5px; minus half the 3px dot = 10px; minus a hair because a dot reads slightly low against lowercase x-height = 9px.

`aria-hidden` matters — a decorative span inside a real `<li>` would otherwise be announced.

## Emphasis in prose

Per the global mapping: `**strong**` → weight 500 + primary colour, `*em*` → muted colour, no slant. In a 16/1.75 paragraph this is especially valuable, because a 700-weight bold in open prose creates a dark blot the eye lands on before it reads the sentence. At 500 the emphasis registers on the second pass, where it belongs.

## Reveal on scroll

Every block carries the `reveal` class, so paragraphs fade up individually as they enter the viewport rather than the article appearing as one slab. See the **interface-motion** skill for the implementation and its reduced-motion behaviour.

## The dek

```tsx
<p className="mt-4 text-[17px] leading-[1.55] text-gray-800">{dek}</p>
```

17px, muted, tighter leading than the body. It sits between a 30px title and 16px prose and has to be distinguishable from both — hence the odd size. Muted colour is what keeps it from competing with the title; the tighter leading is what keeps it from reading as the first paragraph.

## Cover art and the measure

The cover image is constrained to the same 640px column as the text, not bled full-width. The page then reads as one continuous block from title to last paragraph, and the image is part of the article rather than a banner above it. A `16 / 7` default aspect ratio is reserved before load so nothing shifts.
