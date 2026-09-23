# The display tier

Only `expressive` has one. It is the single oversized moment on a landing or campaign page — the headline a visitor reads first and may be the only thing they read. This file derives its size instead of guessing it, and covers what changes about leading, tracking, weight, wrapping and loading at that size.

## Why it isn't body × ratio

Every other role is sized against its neighbours: a heading is some distance above the body, a meta line some distance below. A display headline isn't read against its neighbours. It is read against **the space it fills**. Its job is to hold a line of a certain length across a certain column, and the right size is whatever does that. Take it from the body with a ratio and you get a number that is either timid in a wide hero or wraps to five lines on a phone.

So the inputs are the column and the headline, not the ladder.

## The derivation

**1. Decide characters per line.** A display line should hold roughly 12–24 characters, and a headline should run two or three lines at most. Fewer than 12 and every line break becomes a design decision; more than 24 and it's a large paragraph. Pick a target for the widest column and for the narrowest:

- widest: 18–24 characters (two lines of a 40-character headline)
- narrowest: 12–16 characters (three lines on a phone)

Use the project's real headlines. If they come from a CMS and vary, use the 90th-percentile length, not the average — the long ones are the ones that break the hero.

**2. Measure the family's average advance.** The width of an average character, in `em`, for the weight you will set it in. Grotesques run about 0.5–0.55em, condensed faces 0.4–0.45, wide faces 0.6 and over. Measure it rather than trust a table:

```js
// In the browser, after the font has loaded.
const ctx = document.createElement("canvas").getContext("2d");
ctx.font = `300 100px "Your Display Family"`; // the real weight; canvas can't read var()
const sample = "Invoices that chase themselves, so you don't have to";
const advance = ctx.measureText(sample).width / sample.length / 100; // em per character
```

A sample of real headline copy beats the alphabet, because it has the family's real mix of spaces, capitals and round letters.

**3. Divide.** For each end of the range:

```
size = column width ÷ (characters per line × advance)
```

A 960px desktop column at 20 characters and 0.52em: 960 ÷ 10.4 ≈ 92px.
A 343px phone column (375px less two 16px gutters) at 14 characters: 343 ÷ 7.28 ≈ 47px.

**4. Interpolate, with a `rem` intercept.** Between the viewport where the narrow column applies (`v₁`, size `s₁`) and the one where the wide column is reached (`v₂`, size `s₂`):

```
slope     = (s₂ − s₁) ÷ (v₂ − v₁)            → the vw coefficient × 100
intercept = s₁ − slope × v₁                   → in px, then ÷ 16 for rem
```

From 47px at 375 to 92px at 1280: slope 0.0497 (4.97vw), intercept 28.35px (1.772rem).

```css
--text-display: clamp(2.9375rem, 1.772rem + 4.97vw, 5.75rem);
```

The `rem` intercept is not a nicety. Text sized in `vw` alone ignores zoom and fails WCAG 1.4.4. Keep the maximum at no more than about 2.5 × the minimum as well; past that, a 200% zoom can't double the rendered size inside the clamp.

**5. If the hero isn't the viewport, use container units.** A display line inside a card, a split hero or a sidebar layout should be derived from its container, not the window. Set `container-type: inline-size` on the hero and use `cqi` in place of `vw`, with the same arithmetic against container widths.

**6. Check the gap to the title.** At both ends, display should be at least 1.5 × `type.title`. Closer than that and it reads as "the title got bigger", which is the failure this tier exists to avoid: two roles, one size relationship. If the gap is too small, lower the title rather than raising display — the display size is derived, the title is a choice.

### The same headline in three families

The column and the character targets held constant (960px at 20 characters, 343px at 14); only the family changes.

| Family | Advance | Phone | Desktop | `clamp()` (375 → 1280) |
|---|---|---|---|---|
| Condensed grotesque | 0.43em | 57px | 112px | `clamp(3.5625rem, 2.14rem + 6.08vw, 7rem)` |
| Neutral grotesque | 0.52em | 47px | 92px | `clamp(2.9375rem, 1.772rem + 4.97vw, 5.75rem)` |
| Wide serif | 0.60em | 41px | 80px | `clamp(2.5625rem, 1.55rem + 4.31vw, 5rem)` |

A condensed face earns a larger size for the same line — that is what condensing is for — and a wide one a smaller size. A ratio off the body would have given all three the same number and broken two of them.

## Leading at display sizes

0.95–1.05. The x-height is large enough that a tight line box reads generously, and a headline at body leading reads as separate lines rather than one object. Two checks before going below 1:

- **Accents and descenders.** A line box under 1 can clip diacritics on the line above and descenders on the line below, especially with `overflow: hidden` on the hero. Test with "Ågj" and a capital with a ring.
- **Mixed scripts.** A headline that may be translated into a script with taller marks needs the top of the range.

## Tracking at display sizes

−0.03 to −0.045em, measured in `em` so it scales with the fluid size. The looser the family's default spacing and the larger the size, the more it needs. A variable family with an optical-size (`opsz`) axis tightens its own spacing and thins its details as it grows; set `font-optical-sizing: auto` and start at the gentle end of the range, because the family has already done half the work.

Never apply display tracking to the title or heading "for consistency". Tracking corrects for size; the title is a different size.

## Weight at display sizes

`weight.display` is its own role because the right weight at 90px is rarely the right weight at 20. Above about 48px a 400 starts to look heavy, and a 300 — illegitimate anywhere text is read at length — becomes the one place a light weight belongs. The opposite is also defensible: a heavy display weight as brand voice. Either way, it is one weight with one job, and it isn't reused below the display tier.

A separate display family (`family.display`) is allowed in `expressive` when it carries a register the text family can't — a brand wordmark's voice, a serif headline over a sans text. It is still one family for one role; if it starts appearing in section headings, the page has two display tiers.

## Wrapping

Set `text-wrap: balance` on display and title, so a two-line headline doesn't end in a single orphaned word. Don't insert manual `<br>`s to fix a break at one width; they are wrong at every other. If one phrase must not break, use a non-breaking space inside it.

## Loading a display face

A display swap is the most visible swap there is: the one string that carries the frame changes shape under the reader, and a two-line headline can become three and push the whole hero down. Everything in `numerals-and-loading.md` applies with more force:

- Preload the display file for the hero's weight; it is on the critical path of the first frame.
- Metric-match its fallback on `size-adjust` **and** the vertical overrides; a width-only match still changes line height.
- Subset it. A display face rendering a dozen words needs Latin at most, often less.

## One display moment

Law 3 applies: display is the page's loudest thing, and there is one of it. A landing page that sets every section's opener at display size has flattened its own hierarchy — each section is shouting at the same volume, so none is heard. Section openers are `type.heading`; if they need more presence, give them space, not size.

## Failures worth recognising

- **The big title.** Display at 1.2 × title. Readers can't tell a hero from a page heading; the page looks under-designed rather than restrained.
- **The phone wall.** Display derived at desktop only, clamped at 64px minimum, and a 40-character headline runs five lines on a phone before anything else is visible.
- **The zoom fail.** `font-size: 7vw`. It looks right at every width and doesn't change at 200% zoom.
- **The reflow.** A self-hosted display face with no metric-matched fallback. The headline sets in the fallback, swaps, gains a line, and the call to action jumps 90px as the visitor reaches for it.
