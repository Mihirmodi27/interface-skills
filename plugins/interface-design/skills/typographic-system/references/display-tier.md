# The display tier

Only `expressive` has one: the single oversized headline on a landing or campaign page, read first and perhaps alone. This file derives its size and covers leading, tracking, weight, wrapping and loading at that size.

## Why it isn't body × ratio

Every other role is sized against its neighbours; a display headline is read against **the space it fills**, holding a line of a certain length across a certain column. Taken from the body by ratio, it is timid in a wide hero or five lines on a phone. The inputs are the column and the headline, not the ladder.

## The derivation

**1. Decide characters per line.** Roughly 12–24, over two or three lines at most; under 12 every break is a design decision, over 24 it's a large paragraph. Pick a target for each end:

- widest: 18–24 characters (two lines of a 40-character headline)
- narrowest: 12–16 characters (three lines on a phone)

Use real headlines; from a CMS, the 90th-percentile length, not the average — the long ones break the hero.

**2. Measure the family's average advance**, in `em`, at the weight you will set. Grotesques run about 0.5–0.55em, condensed faces 0.4–0.45, wide faces 0.6 and over — but measure, with real headline copy for its real mix of spaces, capitals and round letters:

```js
// After the font has loaded.
const ctx = document.createElement("canvas").getContext("2d");
ctx.font = `300 100px "Your Display Family"`; // the real weight; canvas can't read var()
const sample = "Invoices that chase themselves, so you don't have to";
const advance = ctx.measureText(sample).width / sample.length / 100; // em per character
```

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

The intercept is required: text sized in `vw` alone ignores zoom and fails WCAG 1.4.4. Keep the maximum within about 2.5 × the minimum, or a 200% zoom can't double the size inside the clamp.

**5. If the hero isn't the viewport, use container units.** In a card, split hero or sidebar layout, set `container-type: inline-size` on the hero and use `cqi` for `vw`, against container widths.

**6. Check the gap to the title.** At both ends display is at least 1.5 × `type.title`; closer, it reads as "the title got bigger". If the gap is too small, lower the title rather than raising display: display is derived, the title is a choice.

### The same headline in three families

Column and character targets held constant (960px at 20 characters, 343px at 14):

| Family | Advance | Phone | Desktop | `clamp()` (375 → 1280) |
|---|---|---|---|---|
| Condensed grotesque | 0.43em | 57px | 112px | `clamp(3.5625rem, 2.14rem + 6.08vw, 7rem)` |
| Neutral grotesque | 0.52em | 47px | 92px | `clamp(2.9375rem, 1.772rem + 4.97vw, 5.75rem)` |
| Wide serif | 0.60em | 41px | 80px | `clamp(2.5625rem, 1.55rem + 4.31vw, 5rem)` |

A condensed face earns a larger size for the same line, a wide one a smaller; a ratio off the body would have given all three one number and broken two.

## Leading at display sizes

0.95–1.05: the x-height makes a tight line box read generously, and at body leading a headline reads as separate lines, not one object. Before going below 1:

- **Accents and descenders.** Under 1, a line box can clip diacritics above and descenders below, especially with `overflow: hidden` on the hero. Test with "Ågj" and a ringed capital.
- **Mixed scripts.** A headline that may be translated into a script with taller marks takes the top of the range.

## Tracking at display sizes

−0.03 to −0.045em, in `em` so it scales with the fluid size; looser families and larger sizes need more. A variable family with an optical-size (`opsz`) axis tightens and thins itself: set `font-optical-sizing: auto` and start at the gentle end.

Never give the title or heading display tracking "for consistency": tracking corrects for size, and the title is a different size.

## Weight at display sizes

`weight.display` is its own role because the right weight at 90px is rarely right at 20. Above about 48px a 400 looks heavy, and a 300 — illegitimate wherever text is read at length — belongs here; a heavy weight as brand voice is also defensible. Either way it is one weight, one job, never reused below the tier.

A separate `family.display` is allowed in `expressive` for a register the text family can't carry — a wordmark's voice, a serif headline over sans text. One family, one role: in section headings, it makes two display tiers.

## Wrapping

`text-wrap: balance` on display and title, so a headline doesn't end in an orphan. No manual `<br>`s: right at one width, wrong at every other. A phrase that must not break gets a non-breaking space.

## Loading a display face

A display swap is the most visible there is: a two-line headline can become three and push the hero down. Everything in `numerals-and-loading.md` applies with more force:

- Preload the display file for the hero's weight; it is on the first frame's critical path.
- Metric-match its fallback on `size-adjust` **and** the vertical overrides; a width-only match still changes line height.
- Subset it. A dozen words need Latin at most, often less.

## One display moment

Law 3: there is one loudest thing. Every section opener at display size flattens the hierarchy — all shout, none is heard. Openers are `type.heading`; for presence, give them space, not size.

## Failures worth recognising

- **The big title.** Display at 1.2 × title: hero and page heading blur, and the page looks under-designed, not restrained.
- **The phone wall.** Derived at desktop only, clamped at 64px minimum: a 40-character headline fills a phone with five lines.
- **The zoom fail.** `font-size: 7vw`. Right at every width, unchanged at 200% zoom.
- **The reflow.** No metric-matched fallback: the headline swaps, gains a line, and the call to action jumps 90px as the visitor reaches for it.
