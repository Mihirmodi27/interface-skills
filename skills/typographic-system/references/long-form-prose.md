# Long-form prose

How the reading half of the system is set. The distinction that matters: prose is the one place where the reader holds a paragraph in view for seconds at a time, so it gets looser and more generously spaced than anything else on the site — inside the *same* 640px measure, and at the *same* two sizes.

## The container sets the register

```tsx
<div className="text-[14px] leading-[1.75] text-gray-1000">
```

One wrapper carries size, leading and colour; every block inherits and only overrides what differs. Prose body is 14/1.75 — the same size as a UI paragraph, and noticeably more open (1.75 vs 1.55).

Why 1.75 specifically: at a 576px text column and 14px type, a line holds roughly 85–95 characters. That's past the upper end of comfortable, and long lines need more leading so the eye can find the start of the next one. Shorten the measure and you could pull leading back toward 1.6.

## The reading column is two sizes

16 for headings, 14 for everything a reader reads. That's the whole scale for a long-form page.

Below the headings, size does no work at all — so the four things sharing 14px separate on other axes, and each one has to pick a *different* axis or they collide:

| Block | Size | The signal |
|---|---|---|
| Lead | 14 | leading at 1.9, and 32px below |
| Keyline | 14 | weight 500, and 36px of air on both sides |
| Body | 14 | leading at 1.75 — the baseline the others are read against |
| Pull quote | 14 | a 3px rounded bar and a 16px indent |
| Note | 13 | a 1px rule, the faint tier, and a step down in size |

Read the table as a set: no two rows use the same mechanism. That's the constraint that makes a one-size reading column legible, and the reason you can't add a sixth block type without finding it an unused axis.

## Two block types worth stealing

Neither is standard, and both came out of the same diagnosis — a body of writing that was 114 paragraphs and almost nothing else. Not too much content: **one texture.**

**`keyline` — the one sentence a section is for.** Set at body size, weight 500, `my-9`. Authored by promoting a sentence out of a paragraph and then deleting it from the paragraph, which is the discipline that makes it work: *a section that gains a keyline gets shorter.* One per section, never two.

```tsx
case "keyline":
  return <p className="reveal my-9 text-[14px] font-medium leading-[1.6] text-gray-1000">…</p>;
```

**`note` — an aside set outside the argument.** A caveat, a scope limit, a piece of provenance. 13px, faint tier, a 1px left rule and 16px of indent.

```tsx
case "note":
  return <p className="reveal my-7 border-l border-gray-alpha-300 pl-4 text-[13px] leading-[1.6] text-faint">…</p>;
```

The value isn't the styling, it's what having the type does to the writing: once there's somewhere for a qualification to go, the flow stops carrying qualifications it doesn't need.

**Note how the two rules differ.** The note's is 1px and the quote's is 3px, and the type inside them is four steps apart. Two indented rules on one page will be mistaken for each other unless you make them unmistakable.

**If you add block types, validate them.** The reference implementation's content check fails the build on a blank keyline or note, two keylines in one section, and a keyline that has swollen back into the paragraph it came from. A type that only works when authored with discipline needs the discipline enforced somewhere.

## Block spacing

| Block | Spacing | Note |
|---|---|---|
| Paragraph | `mb-6` (24px) | ~1.7× the type size. |
| Lead | `mb-8` (32px) | More air below, to set the opening apart. |
| Heading (h2) | `mt-10 mb-3` (40 / 12) | Asymmetric: a heading belongs to what follows it. |
| Keyline | `my-9` (36px) | Symmetric — it belongs to neither neighbour, which is the point. |
| Quote | `my-9` (36px) | More air than a paragraph, both sides. |
| Note | `my-7` (28px) | Stepped in from the quote so the two read differently. |
| Figure | `my-9` (36px) | |
| List | `mb-6`, items `space-y-2` | Matches paragraph spacing so a list reads as one block. |

**The asymmetry is the important part.** 40px above a heading, 12px below. A heading with equal space above and below floats between two sections and belongs to neither. The ~3.3:1 ratio makes the grouping unambiguous: the heading and the paragraph beneath it are one unit.

The keyline is the deliberate exception, and it proves the rule — it's symmetric *because* it's a standalone claim rather than an introduction to something.

## Headings inside prose

```tsx
<h2 className="mt-10 mb-3 text-[16px] font-medium leading-[1.2] tracking-[-0.015em]">
```

16px against 14px body — one step, and the weight (500), the tight leading (1.2), and the 40px of space above do the real work.

This is now the *same* size as a page-level section heading, and as the detail page's own `<h1>`. Three levels at one size, separated by position and spacing. That is flatter than an article template usually is, and it's deliberate: the alternative was an in-body heading larger than the page title above it.

## Quotes

```tsx
<blockquote className="my-9 flex gap-4">
  <span aria-hidden className="w-[3px] shrink-0 rounded-full bg-gray-500" />
  <div className="text-[14px] leading-[1.75] text-gray-1000">…</div>
</blockquote>
```

The type is now identical to the body around it, so **the bar is the entire signal** — which is why it's a real one. It used to be a 2px `gray-alpha-300` border, ten percent black, near enough invisible on a white page to be doing nothing at all. That was survivable while the quote was also two steps larger than the body. It stopped being survivable the moment the size step went away.

The general rule: **when you remove one signal, audit the ones you left in.** A decoration that was riding along beside a size step usually turns out to have been decorative in the literal sense, and now it has to carry the whole distinction on its own.

Three implementation details:

- **A flex child, not a `border-left`.** A border can't be rounded on its own, and a squared-off 3px bar reads as a table rule rather than a quotation.
- **`bg-gray-500`, from the grey ramp, not the alpha ramp.** It's a decorative mark on an opaque surface — see the **color-and-theming** skill on why decorative marks stay on the solid ramp.
- **No vertical margin on the bar**, so flex's default `stretch` runs it the full height of the quote including the citation.

Note what's still absent — no italic (globally disabled), no quotation marks, no background, no colour step. Earlier versions stepped the quote *down* the colour ramp to secondary; at body size that just made it look like a de-emphasised paragraph.

The citation goes quieter and explicitly kills the browser's italic:

```tsx
<cite className="mt-2 block text-[13px] not-italic text-quiet">— {cite}</cite>
```

`not-italic` is required because `<cite>` and `<blockquote>` carry UA italics that the global `em, i { font-style: normal }` rule doesn't cover.

## Figures

```tsx
<figure className="reveal my-9">
  <div className="overflow-hidden rounded-[10px] bg-gray-100 ring-1 ring-gray-alpha-300">
    <div style={{ aspectRatio: b.aspect ?? "16 / 9" }}>
      <img src={b.src} alt={b.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>
  </div>
  <figcaption className="mt-2.5 text-[13px] leading-[1.55] text-faint">{caption}</figcaption>
</figure>
```

Aspect ratio declared on a wrapper so the box is reserved before the image loads and nothing shifts. `ring-1` rather than a border, so the outline doesn't participate in the box model and the corner radius stays exact.

**The caption is the point of the figure, not a label on it** — what the thing was for, and which constraint shaped it. Set at the note/meta tier (13px, faint) so it reads as apparatus rather than as body copy that happens to sit under a picture. A caption at body size competes with the paragraph after it.

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

Per the global mapping: `**strong**` → weight 500 + primary colour, `*em*` → muted colour, no slant. In a 14/1.75 paragraph this is especially valuable, because a 700-weight bold in open prose creates a dark blot the eye lands on before it reads the sentence. At 500 the emphasis registers on the second pass, where it belongs.

One caution specific to this system: **`<strong>` and the keyline are now the same weight at the same size.** A paragraph with a bolded clause in it can read as a keyline that failed to get its own line. Keep strong emphasis to a few words; anything longer wants to *be* a keyline.

## Reveal on scroll

Every block carries the `reveal` class, so paragraphs fade up individually as they enter the viewport rather than the article appearing as one slab. See the **interface-motion** skill for the implementation and its reduced-motion behaviour.

## The dek

```tsx
<p className="mt-2 text-[14px] leading-[1.55] text-muted">{dek}</p>
```

Body size, muted, tighter leading than the body. It used to be 17px — the single odd number in the ladder, justified by needing to sit between a 30px title and 16px prose. Both of those are gone, and so is the gap it was filling, so the dek gave up its size and now separates on colour and leading alone.

Muted is what keeps it from competing with the title; the tighter leading (1.55, against the body's 1.75 and the lead's 1.9) is what keeps it from reading as the first paragraph. **Note that the dek and the lead are adjacent, at the same size, distinguished only by leading and colour** — which is the tightest pairing in the system and the one to check first if a page starts to look undifferentiated.

## Cover art and the measure

The cover image is constrained to the same 640px column as the text, not bled full-width. The page then reads as one continuous block from title to last paragraph, and the image is part of the article rather than a banner above it. A `16 / 7` default aspect ratio is reserved before load so nothing shifts — in-body figures default to `16 / 9`, and both take an explicit ratio when the source has one.
