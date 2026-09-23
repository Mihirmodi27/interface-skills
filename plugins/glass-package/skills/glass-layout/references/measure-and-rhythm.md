# Measure and rhythm

## Deriving the measure

```css
.col { max-width: 640px; margin: 0 auto; padding: 0 32px; }
```

640px outer, 32px padding each side → **576px of text**.

At 16px prose that's roughly 75–85 characters per line. The usual comfortable range is 45–75; 576px sits at its top on purpose — long lines are efficient once the reader is committed, and 1.75 leading compensates for the longer return sweep. At 14px UI copy the column holds ~85–95 characters, which is fine because that text is scanned, not read.

The padding does double duty: on a 375px phone the column is `375 − 64 = 311px`, and on desktop the 32px keeps text off the edge of a maximised window.

That 311px once forced a responsive type step (a 30px title wrapping to three lines) until an 18px type ceiling removed it. **The narrowest measure you ship constrains the type scale, and it's usually cheaper to satisfy it in the scale than with a breakpoint.**

640px also equals Tailwind's `sm` breakpoint — convenient, not meaningful: below it the column is padding-limited, so the two coincide naturally.

## Why every page shares it

For **positional continuity** (§1 of the skill): home-page role summary → `/experience`, writing index → article, any summary/detail pair keeps its text still. A page at a different width breaks the effect for every transition into or out of it.

## What's allowed outside the column

**Non-text content.** The image galleries are a full-bleed CSS-columns masonry on a grey field with 4px gaps. A masonry grid has no reading measure; confining it to 640px would only make the images small.

```tsx
<main className="min-h-[100dvh] bg-gray-100 p-1 pb-28">
  <div className="columns-3 gap-1 sm:columns-4">
```

Note `columns-3` then `sm:columns-4`: fewer columns on a phone, more on desktop — against the mobile-first instinct for grids, and right here because the tiles are photographs.

**Rails, anchored to a wider frame.** See §2 of the skill.

**Fixed chrome.** The nav strip spans the viewport for centring.

**Not allowed outside:** an article's cover image. Kept to the measure, the page reads as one block from title to last paragraph; bled full-width, it becomes a banner *above* the article.

## Dividers at column width

```tsx
export function Divider() {
  return (
    <div className="col my-3" aria-hidden>
      <hr className="border-0 h-[0.5px] bg-gray-alpha-300" />
    </div>
  );
}
```

Reusing `.col` makes it exactly as wide as the text it separates — the content, not the page, which is what a single-column reading layout means.

`border-0` before `h-[0.5px] bg-…`: an `<hr>` carries a UA border, so without the reset you get the browser's line *and* yours, 2–3px apart.

`aria-hidden` on the wrapper: an `<hr>` is announced as a separator, and a purely rhythmic divider between sections isn't semantic structure.

`my-3` (12px) on top of the sections' own `py-9` (36px) → 48px between the content of adjacent sections, the hairline centred in it.

## The spacing scale

Tailwind's 4px scale, with a preference for a few well-worn values:

| Value | px | Typical use |
|---|---|---|
| `0.5` | 2 | Nudges between adjacent icons |
| `1` | 4 | Gallery gaps, dock padding |
| `1.5` | 6 | Sub-title under a heading |
| `2` | 8 | List items, tag gaps |
| `2.5` | 10 | Row padding, marker gaps |
| `3` | 12 | Heading → paragraph, container padding |
| `3.5` | 14 | Heading → list |
| `4` | 16 | Paragraph gaps, grid gaps |
| `5` | 20 | Quote indent, section heading → content |
| `6` | 24 | Prose paragraph gaps, meta rows |
| `7` | 28 | Capability groups |
| `8` | 32 | Section heading → content, column padding |
| `9` | 36 | Home section padding |
| `10` | 40 | Section content after a rule |
| `11` | 44 | Prose heading top margin |
| `14` | 56 | First section on a long page |
| `16` | 64 | Between major sections on a long page |
| `20`/`28` | 80/112 | Page top/bottom padding |

The values in heaviest use are `2.5`, `3.5`, `9`, `11` — the half-steps and odd numbers. They exist because 8/12/36/44 are where the *asymmetry ratios* land, not because the scale demanded them.

## Asymmetry, in detail

**The gap inside a group must be visibly smaller than the gap around it.**

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Prose heading → its paragraph | 12px | 44px | 3.7:1 |
| List items → next block | 8px | 24px | 3:1 |
| Bio paragraphs → the links | 16px | 32px | 2:1 |
| Role title → its description | 2px | 6px | 3:1 |
| Case study title → body | 6px | 20px (between cards) | 3.3:1 |
| Capability heading → body | 8px | 32px (between capabilities) | 4:1 |

Ratios cluster between 2:1 and 4:1. Below 2:1 the grouping is ambiguous; above ~5:1 the group starts to feel marooned.

The commonest failure, a heading with symmetric margins, floats between two sections so the reader can't tell which it heads — the difference between a page you can skim and one you can't.

## Section rhythm

**Home page — peers.**

```tsx
<section className="py-9">   {/* 36px symmetric */}
```

Symmetric: home sections are siblings.

**Long pages — hierarchy.**

```tsx
<section className="mt-16 border-t border-gray-alpha-300 pt-10">
```

64px above the rule, 40px below: the rule marks a change of subject, and the content below belongs to the heading after it.

The first section on such a page uses `mt-14` (56px) with no rule — there's nothing above it to separate from.

## Not every boundary gets a rule

```tsx
const SECTIONS = {
  work:       { node: <Work />,       rule: true },
  experience: { node: <Experience />, rule: true },
  life:       { node: <MyLife />,     rule: true },
  watching:   { node: <Watching />,   rule: false },
  socials:    { node: <Socials />,    rule: false },
};
```

Work, Experience and Life are the substantial blocks and get separated. Watching and Socials read as a **coda** to Life, so they follow without a rule.

It lives in layout code, not config, because it's a judgement about rhythm, not a preference: as a setting it invites turning every rule on, flattening five sections into equal slabs. The pattern holds for whichever sections are present, so it's a design decision, not a hardcoded list.

## Page padding

```tsx
className="pb-20 pt-28 sm:pt-20"     // long page
className="pb-28 pt-28 sm:pt-20"     // index page
className="pt-28 pb-14 sm:pt-20 sm:pb-11"   // hero
```

**Top padding is generous** — 112px, 80px on phones; a long top margin signals "this is a document."

**Bottom padding accounts for the fixed dock.** `pb-28` (112px) on pages whose content can end near the viewport bottom, so the last line is never under the nav. A page ending in a footer can use less, because the footer's own `pb-28` covers it.

Audit this page by page under fixed bottom chrome — the commonest "looks fine on my long page" bug.

## `dvh` over `vh`

```tsx
className="min-h-[100dvh]"
className="max-h-[calc(100dvh-11rem)]"
```

On mobile, `vh` ignores browser chrome, so a `100vh` element extends under the address bar and its bottom is unreachable; `dvh` tracks the visible area. Use it for anything sized to the viewport — `svh`/`lvh` only when you specifically want the always-visible or always-maximal height.
