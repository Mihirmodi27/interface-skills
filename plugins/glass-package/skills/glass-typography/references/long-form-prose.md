# Long-form prose

How the reading half is set. Prose is the one place a reader holds a paragraph in view for seconds at a time, so it gets looser leading and spacing than anything else on the site — inside the *same* 640px measure, at the *same* two sizes.

## The container sets the register

```tsx
<div className="text-[14px] leading-[1.75] text-gray-1000">
```

One wrapper carries size, leading and colour; blocks inherit and override only what differs. Prose body is 14/1.75: a UI paragraph's size, noticeably more open (1.75 vs 1.55).

Why 1.75: a 576px text column at 14px holds roughly 85–95 characters a line, past comfortable, and long lines need more leading for the eye to find the next line's start. A shorter measure could pull it back toward 1.6.

## The reading column is two sizes

16 for headings, 14 for everything a reader reads. Below the headings size does no work, so the blocks sharing 14px separate on other axes, each a *different* one or they collide:

| Block | Size | The signal |
|---|---|---|
| Lead | 14 | leading at 1.9, and 32px below |
| Keyline | 14 | weight 500, and 36px of air on both sides |
| Body | 14 | leading at 1.75 — the baseline the others are read against |
| Pull quote | 14 | a 3px rounded bar and a 16px indent |
| Note | 13 | a 1px rule, the faint tier, and a step down in size |

No two rows share a mechanism, so a sixth block type needs an unused axis first.

## Two block types worth stealing

Neither is standard. Both came from one diagnosis: a body of writing that was 114 paragraphs and almost nothing else. Not too much content — **one texture.**

**`keyline` — the one sentence a section is for.** Body size, weight 500, `my-9`. Authored by promoting a sentence out of a paragraph and deleting it there, which is the discipline that makes it work: *a section that gains a keyline gets shorter.* One per section, never two.

```tsx
case "keyline":
  return <p className="reveal my-9 text-[14px] font-medium leading-[1.6] text-gray-1000">…</p>;
```

**`note` — an aside set outside the argument.** A caveat, a scope limit, a piece of provenance. 13px, faint tier, a 1px left rule and 16px of indent.

```tsx
case "note":
  return <p className="reveal my-7 border-l border-gray-alpha-300 pl-4 text-[13px] leading-[1.6] text-faint">…</p>;
```

The value is what the type does to the writing: once qualifications have somewhere to go, the flow stops carrying ones it doesn't need.

**The two rules must differ unmistakably.** The note's is 1px and the quote's 3px, with the type inside four steps apart; two indented rules on one page will otherwise be mistaken for each other.

**If you add block types, validate them.** The content check here fails the build on a blank keyline or note, two keylines in one section, or a keyline swollen back into the paragraph it came from. A type that needs authoring discipline needs it enforced somewhere.

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

**The asymmetry is the important part.** A heading with equal space above and below floats between two sections and belongs to neither; 40px above and 12px below, ~3.3:1, makes the heading and the paragraph beneath it one unit. The keyline is symmetric *because* it's a standalone claim, not an introduction.

## Headings inside prose

```tsx
<h2 className="mt-10 mb-3 text-[16px] font-medium leading-[1.2] tracking-[-0.015em]">
```

16px against 14px body is one step; the weight (500), the tight leading (1.2) and the 40px above do the real work.

It matches a page-level section heading and the detail page's own `<h1>`: three levels at one size, separated by position and spacing. Flatter than most article templates, and deliberate — the alternative was an in-body heading larger than the page title.

## Quotes

```tsx
<blockquote className="my-9 flex gap-4">
  <span aria-hidden className="w-[3px] shrink-0 rounded-full bg-gray-500" />
  <div className="text-[14px] leading-[1.75] text-gray-1000">…</div>
</blockquote>
```

The type matches the body around it, so **the bar is the entire signal**, which is why it's a real one. It used to be a 2px `gray-alpha-300` border, ten percent black, near invisible on a white page — survivable while the quote was also two steps larger than the body, not once the size step went.

**When you remove one signal, audit the ones you left in.** A decoration riding beside a size step was usually decorative in the literal sense, and now has to carry the whole distinction.

- **A flex child, not a `border-left`.** A border can't be rounded on its own, and a squared-off 3px bar reads as a table rule rather than a quotation.
- **`bg-gray-500`, from the grey ramp, not the alpha ramp.** It's a decorative mark on an opaque surface — see the **glass-color** skill on why decorative marks stay on the solid ramp.
- **No vertical margin on the bar**, so flex's default `stretch` runs it the full height of the quote, citation included.

Still absent: italic (globally disabled), quotation marks, background, colour step. Stepping the quote *down* to secondary, as earlier versions did, at body size just makes a de-emphasised paragraph.

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

The aspect ratio sits on a wrapper so the box is reserved before the image loads. `ring-1` rather than a border, so the outline stays out of the box model and the corner radius stays exact.

**The caption is the point of the figure, not a label on it**: what the thing was for, and which constraint shaped it. At the note/meta tier (13px, faint) it reads as apparatus; at body size it competes with the paragraph after it.

## Lists

```tsx
<ul className="mb-6 list-disc space-y-2 pl-5 marker:text-gray-500">
```

The `marker:` variant is the detail worth stealing. A default bullet inherits the text colour, so at primary it's a row of dark dots pulling the eye down the left edge; at the quiet tier markers read as structure. Same for `list-decimal` — a quiet number is still legible.

`space-y-2` (8px) between items against `mb-6` (24px) below: items relate more to each other than to the next paragraph, the heading asymmetry again.

## Hand-rolled bullets in UI context

Outside prose, as in a role's responsibilities list, a custom marker gives finer control:

```tsx
<li className="flex gap-2.5 text-[14px] leading-[1.65]">
  <span aria-hidden className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-gray-500" />
  <span>{text}</span>
</li>
```

A 3px dot at the quiet tier, offset `mt-[9px]` onto the first line's optical centre. The 9px is derived: 14px × 1.65 leading = 23.1px line box, centre at ~11.5px; minus half the 3px dot = 10px; minus a hair because a dot reads slightly low against lowercase x-height = 9px.

`aria-hidden` matters — a decorative span inside a real `<li>` would otherwise be announced.

## Emphasis in prose

`**strong**` → weight 500 + primary colour, `*em*` → muted colour, no slant. In a 14/1.75 paragraph a 700 bold is a dark blot the eye lands on before the sentence; at 500 it registers on the second pass, where it belongs.

**`<strong>` and the keyline are the same weight at the same size**, so a bolded clause can read as a keyline that failed to get its own line. Keep strong emphasis to a few words; anything longer wants to *be* a keyline.

## Reveal on scroll

Every block carries `reveal`, so paragraphs fade up one by one as they enter the viewport instead of the article arriving as one slab. See the **glass-motion** skill for the implementation and its reduced-motion behaviour.

## The dek

```tsx
<p className="mt-2 text-[14px] leading-[1.55] text-muted">{dek}</p>
```

Body size, muted, tighter leading. It was 17px, the ladder's one odd number, sitting between a 30px title and 16px prose; with both gone it separates on colour and leading alone.

Muted keeps it from competing with the title; the tighter leading (1.55, against the body's 1.75 and the lead's 1.9) keeps it from reading as the first paragraph. **The dek and the lead are adjacent, at the same size, told apart only by leading and colour** — the tightest pairing in the system, and the first to check if a page starts to look undifferentiated.

## Cover art and the measure

The cover image stays in the text's 640px column, not bled full-width, so the page reads as one block from title to last paragraph and the image belongs to the article rather than bannering it. A `16 / 7` default aspect ratio is reserved before load so nothing shifts — in-body figures default to `16 / 9`, and both take an explicit ratio when the source has one.
