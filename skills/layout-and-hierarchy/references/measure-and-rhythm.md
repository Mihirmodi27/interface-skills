# Measure and rhythm

## Deriving the measure

```css
.col { max-width: 640px; margin: 0 auto; padding: 0 32px; }
```

640px outer, 32px padding each side → **576px of text**.

At 16px prose that's roughly 75–85 characters per line. The commonly-cited comfortable range is 45–75; 576px sits at the top of it, which is a deliberate choice for a site that expects sustained reading — long lines are more efficient once the reader is committed, and the 1.75 leading compensates for the longer return sweep. At 14px UI copy the same column is ~85–95 characters, which is fine because that text is scanned rather than read.

The padding does double duty. On a 375px phone the column is `375 − 64 = 311px`, and on desktop the 32px keeps text off the edge of a maximised window.

That 311px used to force a responsive type step — a 30px article title wrapping to three lines. It doesn't any more, because the type ladder came down to an 18px ceiling and nothing left is too wide for the narrowest column. Worth registering as a general point: **the narrowest measure you ship is a constraint on the type scale, and it's usually cheaper to satisfy it in the scale than with a breakpoint.**

Notice that 640px equals Tailwind's `sm` breakpoint. Convenient rather than meaningful — below that width the column is padding-limited rather than max-width-limited, so the breakpoint and the measure coincide naturally.

## Why every page shares it

The real payoff isn't visual consistency, it's **positional continuity**. The home page shows a one-line summary of each role; clicking through to `/experience` opens the long version. Because both are in the same 640px column, the text doesn't move — the transition reads as *expansion*, not as arriving at a different document.

The same holds for the writing index → article, and for anything else that has a summary and a detail view. Any page that uses a different width breaks the effect for every transition into or out of it.

## What's allowed outside the column

**Non-text content.** The image galleries are a full-bleed CSS-columns masonry on a grey field with 4px gaps. A masonry grid has no reading measure, so constraining it to 640px would just make the images small.

```tsx
<main className="min-h-[100dvh] bg-gray-100 p-1 pb-28">
  <div className="columns-3 gap-1 sm:columns-4">
```

Note the reversed breakpoint direction — `columns-3` then `sm:columns-4`. Fewer columns on a phone, more on desktop, which is the opposite of the usual mobile-first instinct for grids and correct here because the tiles are photographs.

**Rails, anchored to a wider frame.** See §2 of the skill.

**Fixed chrome.** The nav strip spans the viewport for centring.

**What is NOT allowed outside:** an article's cover image. Constraining it to the reading measure is what makes the page read as one continuous block from title to last paragraph. Bled full-width it becomes a banner *above* the article rather than part of it — a different and worse relationship.

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

The divider reuses `.col`, so it's exactly as wide as the text it separates. A viewport-wide rule separates *the page*; a column-wide rule separates *the content*. In a single-column reading layout, the second is what you mean.

`border-0` before `h-[0.5px] bg-…` — an `<hr>` carries a UA border, so without the reset you get the browser's line *and* yours, 2–3px apart.

`aria-hidden` on the wrapper: an `<hr>` is announced as a separator, and a purely rhythmic divider between page sections isn't semantic structure.

`my-3` (12px) on top of the sections' own `py-9` (36px) → 48px total between the content of adjacent sections, with the hairline centred in it.

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

The values in bold use are `2.5`, `3.5`, `9`, `11` — the half-steps and the odd numbers. They exist because 8/12/36/44 are where the *asymmetry ratios* land, not because the scale demanded them.

## Asymmetry, in detail

Space is how you say what belongs together. The rule: **the gap inside a group must be visibly smaller than the gap around it.** Equal space on both sides of an element means it belongs to neither neighbour.

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Prose heading → its paragraph | 12px | 44px | 3.7:1 |
| List items → next block | 8px | 24px | 3:1 |
| Bio paragraphs → the links | 16px | 32px | 2:1 |
| Role title → its description | 2px | 6px | 3:1 |
| Case study title → body | 6px | 20px (between cards) | 3.3:1 |
| Capability heading → body | 8px | 32px (between capabilities) | 4:1 |

Ratios cluster between 2:1 and 4:1. Below 2:1 the grouping is ambiguous; above ~5:1 the group starts to feel marooned.

The most common failure is a heading with symmetric margins. It floats between two sections and the reader can't tell which one it heads — which sounds subtle and is actually the difference between a page you can skim and one you can't.

## Section rhythm

**Home page — peers.**

```tsx
<section className="py-9">   {/* 36px symmetric */}
```

Symmetric, because home sections are siblings at the same level. No section owns another.

**Long pages — hierarchy.**

```tsx
<section className="mt-16 border-t border-gray-alpha-300 pt-10">
```

64px above the rule, 40px below it. Asymmetric because the rule marks a genuine change of subject, and the content below belongs to the heading that follows it.

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

Work, Experience and Life are the substantial blocks and get separated. Watching and Socials read as a **coda** to Life, so they follow on without a rule.

Worth being explicit about why this lives in the layout code and not in a config file: it's a typographic judgement about rhythm, not a user preference. Exposing it as a setting would invite someone to turn every rule on — which would flatten five sections into five equally-weighted slabs and lose the shape of the page. The rule pattern holds for whichever subset of sections is present, which is what makes it a design decision rather than a hardcoded list.

## Page padding

```tsx
className="pb-20 pt-28 sm:pt-20"     // long page
className="pb-28 pt-28 sm:pt-20"     // index page
className="pt-28 pb-14 sm:pt-20 sm:pb-11"   // hero
```

**Top padding is generous** — 112px, dropping to 80px on phones. The first thing on a page shouldn't start at the top edge, and a long top margin is what signals "this is a document."

**Bottom padding accounts for the fixed dock.** `pb-28` (112px) on pages whose content can end near the viewport bottom, so the last line is never under the nav. A page that ends in a footer can use less, because the footer's own `pb-28` covers it.

Anything with fixed bottom chrome needs this audited page by page. It's the most common "looks fine on my long page" bug.

## `dvh` over `vh`

```tsx
className="min-h-[100dvh]"
className="max-h-[calc(100dvh-11rem)]"
```

`vh` on mobile refers to the viewport *without* browser chrome, so a `100vh` element extends under the address bar and its bottom is unreachable. `dvh` (dynamic viewport height) tracks the actual visible area as chrome shows and hides.

Use `dvh` for anything sized to the viewport. `svh`/`lvh` (small/large) are useful when you specifically want the always-visible or always-maximal height, but `dvh` is the right default.
