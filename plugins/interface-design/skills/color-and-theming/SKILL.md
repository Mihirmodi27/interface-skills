---
name: color-and-theming
description: "Build and audit an interface's colour system in any palette, neutral or brand, by naming every token for the job it does rather than its lightness. Covers contrast-measured text tiers, translucent layers, a focus colour never lost, status pairs, rule-bound exceptions and flash-free theming, in the project's token names and preset from DESIGN.md. Use when defining or naming colour tokens, deriving a ramp from a brand hue, picking a colour for a border, hover or selected state, choosing text tiers, adding status or error colours, deciding what colour a completed step or the current nav item takes, removing a second highlight hue, answering a review that the UI is too grey, colouring types, folders, avatars or figures, styling a live state or a destructive item, adding a dark theme or a theme toggle, fixing a flash of wrong theme, re-picking an accent or a gradient for dark mode, or reviewing a palette that feels muddy, inconsistent, low-contrast or accidentally colourful."
---

# Colour and Theming

A near-monochrome reading site, a dense product with a full status palette and a brand page spending colour broadly differ in how much colour they spend, not in how it is organised: **a colour token encodes a job, not a lightness.** `border.default` is not "a bit darker than the hover surface", it is *the colour an edge is*. Indexed by intent, picking a colour means naming a role, a reviewer can catch a mistake in the diff, and a second theme is a re-tint of the same names rather than a second palette.

## Before you start

Read `DESIGN.md` at the project root: `## Profile` for the preset and any areas on another one, `## Colour` for the project's name for each role and the decisions already made. Reason in roles; write code in the project's names.

- **No `DESIGN.md`:** run the `design-system-setup` skill for this domain only, do the task, then recommend the full setup.
- **A role you need has no row:** reuse a value already doing that job; otherwise add one in the project's naming style and record it in `DESIGN.md`.
- **The task would break a law or move a dial off its preset:** say so and ask; if the user confirms, record it with its reason under `## Decisions`.
- **Preset `glass`:** the values are in `DESIGN.md`; the `glass-color` skill, if installed, has the exact recipes behind them.

## Laws

### 1. A token is named for its job, not its lightness

**Every colour in the interface is a token, and every token answers one question — "what colour is a border?", "what colour is a pressed surface?" — never a position on a lightness scale.**

Indexed by lightness (`gray-100` lightest, `gray-900` darkest), every pick is a judgement — "a border, so… 300? 400?" — and six months later there are four border greys. Indexed by intent, the question has one answer, and a border at the pressed-surface step is visibly wrong in review. Brand hues too: `indigo-50` to `indigo-900` must still say which step is `accent`, `accent` hovered and `surface.selected`; `bg-indigo-600` here and `bg-indigo-700` there on one button means the ramp does no work. Map steps to roles; components reference the roles.

- **Intent can beat monotonicity.** A border sits *beside* content and must stay quieter than a pressed surface, which sits *under* it, so in light the border step may legitimately be lighter — in the Glass package, `gray-400` (border) is lighter than `gray-300` (pressed).
- **"I need something between two steps" is a misdiagnosis.** The element has a different job from the one assumed; if no role fits, it's a new role, named and recorded — not an inline hex.

The allowed literals: colours inside illustration or SVG artwork, and multi-layer values built once as a shared constant (law 10).

### 2. Text tiers are their own tokens, never border steps

**A text colour is picked for text contrast, never a mid-ramp step borrowed from the border and fill range.**

Text needs 4.5:1 against its surface; a border or icon a user must see to operate a control, 3:1; a decorative edge, only visibility. One value rarely serves both, least in a *light* theme, where mid steps are light tints on white. The Glass package shipped this for a whole revision — timestamps at **1.66:1** on the border-hover step, icons at **2.38:1** on border-active, its most-used text colour at **4.12:1** on fill-hover, beside a note claiming "about 4.6:1" — until three new tokens, picked for contrast, went between its two text steps.

Dark mode hides this — the same indices sit far lighter on near-black, so every mid step passes, and a system reviewed in dark ships a light theme whose body copy fails. So `text.primary`, `text.secondary`, `text.tertiary` and any tiers between are separate tokens. Icons take their label's tier or one below — an icon has more visual mass than text at the same value — and both advance together on hover. Decorative marks with no text (bullets, dots, inactive rail markers) are `mark`, stay on the ramp and aren't held to text contrast; kept faint, a list doesn't read as a column of dark dots.

### 3. The ladder clears the floor and strictly descends, measured where it's worst

**Every text tier clears 4.5:1 against the worst surface it actually lands on, in the worst theme, and each tier is measurably below the one above it.**

- **Computed, not estimated.** Use the `design-system-setup` skill's `scripts/contrast.mjs` (`--ladder <surface> <tier> <tier> …`, top tier first), which composites translucent colours first — the number the reader sees.
- **The worst surface, not the page.** Tertiary text may pass on `surface.page` and fail on `surface.hover`, `surface.subtle` or `surface.selected`; measure on the surface leaving least contrast — the darkest in light, the lightest in dark.
- **Strictly descending, with a step you can see.** Above 4.5:1 the tiers crowd into a narrow band, and it's easy to pass WCAG and lose the hierarchy — tiers at 5.1 and 4.9 are one tier with two names. `--ladder` flags a tier not below the one above; the minimum *size* of the step is a dial.

### 4. Anything on an unknown backdrop takes a translucent colour

**A border, divider, hairline or hover wash that can sit over anything but a known opaque surface uses a translucent value, and that translucent set inverts between themes.**

A solid border on a translucent panel ignores what's behind it, and over a photograph or a scrolled page reads as a frame pasted on top; a translucent one — "a little more contrast than whatever is here" — stays right over anything. That is black at low alpha in light and *white* in dark, because a dark-mode edge is lighter than its surface and a black overlay would disappear. Built once, with the same role names in both themes, it needs no per-component theme branching.

`border.layered` is the canonical role; project roles under it are fine. Translucent *material* tints are colours and live here (as runtime values, law 10); blur, edge, shadow and fallback surface belong to `surfaces-and-depth`.

### 5. Focus is findable on every surface

**The focus colour clears 3:1 against every surface it can land on, is drawn with a gap of page colour between it and the element, and nothing it sits next to shares it.**

```css
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
a:focus-visible { outline-offset: 3px; } /* ragged inline edges need more room */
```

`:focus-visible`, never `:focus`, so a click leaves no ring — except a skip link, which must appear on keyboard focus regardless of heuristics. The offset makes the ring an object, not a border; `outline`, not `box-shadow`, because forced-colours mode removes shadows and keeps outlines. `outline: none` without a replacement is a bug under every preset.

Focus may share a token with `accent` but may not sit beside it: an accent ring round an accent button on an accent-tinted row is invisible exactly where it's needed. If the accent is everywhere, the ring gets a different colour or a double ring (page-colour inner, focus-colour outer). Status colours keep out of the focus hue for the same reason.

### 6. Colour never carries a signal alone

**Every state or status expressed in colour is also expressed in something that survives without colour — an icon, a word, a weight, a rule, a marker, a position.**

About one man in twelve has some colour-vision deficiency, and every reader loses hue in sunlight, greyscale screenshots, cheap projectors; a red border as the only sign of an error tells them nothing. Status is an icon plus a sentence, with colour reinforcing both: **shape carries the state, colour confirms it.** A status glyph whose shape moves with the work, a ring that fills until it is a check, reads in greyscale; so do priority bars. The case people miss is state *within* a neutral system: once every tier clears 4.5:1 only two or three greys are readable, too close to mean "selected" or "current", so a nav item marked active only by being one tier darker needs a rule, a marker, a fill or a weight as well.

A status palette is a set of **pairs**, each a foreground at 4.5:1 on the page and its own tint plus a tint that reads as a surface, not a highlighter, re-picked per theme.

→ Status pairs with a worked set, the glyph shapes, and the exception test in full: `references/status-and-exceptions.md`

### 7. Colour is spent structurally

**Every hue has one job, written down. Each chromatic spend beyond the accent and the status palette is named for what it's for, with a reason that can't spread to another element or another job, and contained so that only the mark takes the colour.**

Colour is attention, spent because of what the element *is*, never as decoration. Content looks like everything else the reader came for; only the interface speaking about it — an offer, a warning, a way in — may announce itself. The Glass package's one exception, a "short version" panel, is the site's only offer, so the reason cannot spread; "it's important", "it's new" or "it's the brand colour" can, and becomes a palette within two components, because every author thinks their element qualifies.

**"Too grey" is answered with jobs, not decoration.** Near-monochrome can go too far: a records product built to it came back as "all black and white" from its owner and "wants more colour" from its client within days. What it lacked was hue that answers a question at a glance, one family per question — *what* a thing is (its type), *how* it's doing (status), *where* it lives (its area), *who* (a person). A hue never crosses into another job: a type hue never signals state, and the danger red never marks something that is merely live.

Only the edge, the icon or the glyph takes the colour, never the text inside: a coloured paragraph shares the loudness until it means nothing. Record each as `exception.<what-it's-for>` in `DESIGN.md`, a family as `exception.<question>.<member>`, with its reason: how many a system holds is a dial; a written, non-transferable job is not. First ask whether weight, position and space can do the job. Most can.

**One hue acts, and colour points at what still needs a person.** The accent's jobs — primary action, focus, "your turn" — share one hue, and it marks one action per view. A second highlight hue beside it (a teal next to a blue) splits one meaning in two, and readers start asking which colour means what; whatever wanted it goes to a status pair, a neutral marker or weight. A hue family is not a highlight: it sits on marks and asks nothing of the reader. Where the reader *is*, the current nav item or step, is neutral, a grey pill or a rule: it is position, not a call to act. A place in the data with one member, today's column on a calendar, may be a written exception.

**Success has one job; whether finishing is that job is a dial.** Ask whether completion is the news. In a sequence the reader passes through — setup steps, passed checks, a wizard — it isn't: done is an ink check on a neutral circle, because a column of green ticks outshouts the one item still pending, and success is kept for an outcome the reader must notice, approved or released. On a board or list people open to see what got done, it is: done takes `status.success` on a filled check whose shape already says done, while what's late takes warning or danger so the eye still finds what needs a person.

→ Hue families, figures, done states, live and AI marks, destructive rows: `references/status-and-exceptions.md`

### 8. A theme is a re-pick, not a reuse

**Every coloured value — accent, focus, status pair, exception, each hue in a family, every stop of every gradient — is chosen afresh for each theme and measured there.**

- **Accents.** A hue at 4.5:1 on white has far less on near-black; reused, it dims the ring and links. Re-pick its lightness (usually trimming chroma) and re-check `text.on-accent`, which often flips from light to dark. A dark fill that keeps white text is too dark to be text on the dark page; no one value is both, so dark adds a lighter `accent.ink` for links, icons and brand text.
- **Small marks, against every ground.** Area colours shared across themes fell to 1.8:1 on a light frame. A mark the reader needs clears 3:1 on every ground it sits on — panel, frame, hover row — in each theme.
- **Gradients move every stop.** The darkest stop can sit a few points above a dark page and vanish down half its length; lightening only that stop compresses the ramp until it isn't one gradient. Move every stop by roughly the same amount.
- **Near-black, not black.** Dark `surface.page` sits a little above `#000`: pure black gives shadows nothing to sit on and glares against light text. Light `text.primary` is near-black too: pure black on white halates at small sizes.
- **"Raised" flips direction.** In light it is darker than or equal to the page, with an edge; in dark, *lighter*. Dark fills are tinted, not darkened, so they don't punch a hole in the page.
- **Not a mechanical inversion,** which puts every gap in the wrong place. Space each theme's surfaces by contrast against *its own* page, so hover and pressed read as the same steps in both, with a large jump between the last edge step and the lowest text tier.

### 9. One mechanism sets the theme, before first paint

**When the user can choose a theme, an attribute or class on the root element is the mechanism — not the `prefers-color-scheme` media query — and it is set by a blocking inline script before the stylesheet applies.**

A toggle and a media query are two sources of truth, and once a user has chosen, the OS shouldn't win; the media query may seed the first visit, not be the switch. (Without a toggle it is the only source, and fine.)

The script is inline in `<head>`, blocking, before the stylesheet, and in `try/catch` because storage throws in some privacy modes. Skip any of the four and dark-mode users get a white flash on every load, the most noticeable bug a themed site can have. Under SSR, render the attribute from a cookie. Declare `color-scheme` per theme, or scrollbars, form controls and autofill stay light on a black page.

### 10. Values that change by context are runtime; the vocabulary is build-time

**A value that has to change with theme, user preference or container is a runtime custom property on the root; the fixed vocabulary may be build-time tokens. Anything that isn't a single colour — a gradient, a shadow stack — is runtime regardless.**

A build-time token (a Sass variable, an inlined JS constant, a static theme object) can't be re-declared by a media query, so `prefers-reduced-transparency`, `prefers-contrast: more` and the toggle can't reach it; and no token system has a slot for `linear-gradient()` or a four-layer `box-shadow`. A preference block re-declaring theme values at the same specificity goes **after** every theme block and names every theme selector.

→ The head script, persistence, two or three states, the crossfade, theme islands, runtime vs build-time per stack, preference overrides: `references/theming-mechanics.md`

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| Palette | Near-monochrome neutral | Near-monochrome neutral plus a status palette | Brand palette used broadly, each hue placed by rule |
| Neutral chroma (OKLCH C) | 0–0.01 | 0–0.015, toward brand hue | 0–0.03, toward brand hue |
| What the accent does | Focus, and nothing else | Primary action, focus, selection | Brand surfaces, action, focus |
| Chromatic exceptions beyond accent and status | ≤ 1 | None by default; a hue family per question the reader can't answer at a glance (what, where, who), plus one-member exceptions — each listed | ≤ 4, each named |
| Hues that call for action | 1, the accent | 1, the accent | Brand hues, each placed by rule |
| Completed states | Uncoloured | `status.success` where completion is the news; uncoloured in a sequence passed through | Per brand, still counted |
| Current location | Uncoloured | Uncoloured | Per brand, still counted |
| Link colour | Text colour, underlined | `accent` | `accent` or a brand hue, underlined in prose |
| Text tiers, `text.primary` to `text.tertiary` | 3–5 | 3 | 3–4 |
| Minimum step between adjacent tiers (ratio of ratios) | 1.15× | 1.4× | 1.25× |
| `text.tertiary` target on its worst surface | ≥ 4.6:1 | ≥ 4.8:1 | ≥ 4.6:1 |
| Status palette | Only if something reports state | `danger`, `warning`, `success`, `info` — required | As needed |
| Theme control | Light and dark, two-state | Light, dark and system | One theme allowed; if two, two-state |
| Dark `surface.page` lightness (OKLCH L) | 0.14–0.18 | 0.17–0.21 | 0.12–0.18 |

**Palette and neutral chroma.** Near-monochrome makes the accent and the one exception loud by default, but every state must then be carried by something other than colour (law 6). Tinted greys tie to the brand, but past about 0.015 chroma they read as colour, and a tinted `text.tertiary` beside a status foreground can look like a status.

**Exceptions and done.** An editorial page's content is prose, so its colour can be the one offer, and nothing on it is a task to finish. A product holds many kinds of record in many places by many people and is scanned, not read; in grey alone every row must be read to be sorted, which is usually what "too grey" means, and its boards exist to show what got done. So it starts from the status palette alone and adds a family, or colours done, when a question can't be answered at a glance, never because a screen looks plain.

**What the accent does.** Restricted to focus, colour *is* where the keyboard is. On primary actions it shows a working user the next step — worth it in a product, at the price of law 5's care for the ring beside accent buttons.

**Links.** Text-coloured links keep a reading page calm and leave colour for focus, but must be underlined because colour isn't carrying them. Accent links scan faster in a product, where links are navigation, not citation.

**Tiers, step and tertiary target.** More tiers give prose finer emphasis, but each must clear the floor, so every extra one shrinks the steps; a light theme rarely fits more than five. A product has fewer, more distinct tiers, told apart at a glance across a dense table, and a wider margin above 4.5:1 to absorb the surfaces the floor wasn't measured on (hover, selected, zebra rows).

**Theme control.** Two states are predictable; "system" changes the page when the OS crosses sunset, surprising someone who chose from the page's menu. Three follow the OS for those who want it, and cost a live listener.

**Dark page lightness.** Lower is more dramatic but leaves less room below the raised steps; a product's dark theme stacks panels, so its page sits higher.

## Building it for a project

1. **List the jobs.** From `roles.md`, keep the colour roles this project has and strike the rest — no dark theme, no dark column; no status, no status rows. Add project roles under their nearest parent.
2. **Choose the neutral:** a hue (the brand's, or none) and a chroma from the dial, in OKLCH.
3. **Fix the ends, per theme:** `surface.page` and `text.primary` near-white and near-black in light, the dial's dark lightness and a light grey in dark.
4. **Place surfaces and lines** (`surface.raised`, `surface.hover`, `surface.pressed`, `surface.subtle`, `border.default`, `border.hover`) as small steps down from the page in light, up in dark, spaced by contrast against it; what must be seen (an input's edge, an icon, the focus ring) clears 3:1.
5. **Solve the text tiers from contrast targets** (tertiary at the dial's target, the rest at least the minimum step apart) on each tier's worst surface; verify per theme with `contrast.mjs --ladder`.
6. **Derive the accent from the brand hue**, per theme: `text.on-accent` at 4.5:1 and `focus` at 3:1 on every surface; then its hover and `surface.selected` tint, re-measuring the lowest text tier on that tint.
7. **Status pairs**, if the preset needs them; **exceptions and hue families**, each passing law 7, every mark at 3:1 on its grounds.
8. **The translucent set**: black at low alpha in light, white in dark, for `border.layered` and any layered washes.
9. **Write it** as custom properties, one block per theme, with the framework's tokens pointing at them (law 10), and record the ratios in `DESIGN.md`.

→ The contrast formula, surface spacing, the brand ramp, per-preset targets, and *Harbour*, a worked `product` example with a teal hue, measured on its worst surfaces: `references/deriving-a-ramp.md`

## Auditing existing code

Collect evidence, then measure. The greps assume CSS, Tailwind or CSS-in-JS; adapt them.

| Look for | Grep for | Law |
|---|---|---|
| Colour literals outside token files and artwork | `#[0-9a-fA-F]{3,8}\b`, `rgba?\(`, `hsla?\(`, `oklch\(` | 1 |
| The same job at several values | every value used for borders; for captions and meta | 1 |
| Mid-ramp steps used as text | `text-(gray\|neutral\|slate\|zinc)-(300\|400\|500)`, or the project's equivalent | 2 |
| Icons on a text-primary tier by default | icons with the top text colour at rest | 2 |
| Solid borders on translucent surfaces | `backdrop-filter` elements, then their border values | 4 |
| Lost focus | `outline:\s*(none\|0)`, `:focus\b` without `-visible`, `ring-0` | 5 |
| Colour-only status | error or success styling with no icon or message; nav active by colour alone | 6 |
| Uncounted colour | each hue outside accent, focus and status, and its job | 7 |
| A second action hue; done coloured against the dial | two hues on buttons, links or "needs you" markers; success colour on passed steps, checks or the current nav item | 7 |
| A hue doing two jobs | a type or area hue on state or text; danger red on a live or recording state; status colour on a plain count or a zero | 7 |
| Reused accents and half-moved gradients | some gradient stops re-declared per theme, not all; single-value accents | 8 |
| Faint marks | type, area and person hues shared across themes; each measured at `--min 3` on panel, frame and hover | 8 |
| Pure black | `#000\b`, `#000000`, `black` on surfaces | 8 |
| Two theme mechanisms | `prefers-color-scheme` in CSS alongside a toggle; missing `color-scheme` | 9 |
| Flash of wrong theme | theme set in a component effect, not an inline head script | 9 |
| Compiled context values | build-time tints or gradients a preference query must replace | 10 |

Then measure, in every theme: each text tier on its worst surface (`contrast.mjs --ladder`), the focus colour at `--min 3` on every surface it can land on, each status foreground on the page and its tint.

Report each finding as one line in `DESIGN.md` `## Open issues`, with evidence — a ratio, a count, a file: "`text.tertiary` (`--ink-3`) is 4.21:1 on `surface.hover` in light — fails 4.5:1. Used in 22 files." Don't fix what wasn't asked for.

## Writing back to DESIGN.md

- **The ratios.** Every text tier and the focus colour, per theme, with the surface measured on; re-measure when a value in `## Colour` changes.
- **New roles.** Any you added — a missing `surface.selected`, a tier between secondary and tertiary — in the project's naming style, marked `proposed` until accepted.
- **Exceptions.** Each `exception.<name>` under **Exceptions**: what it's for, and why that reason can't spread; a family with its question, its members and the marks it may take.
- **Moved dials.** Under `## Decisions`, dated, with the reason: "Links in `accent`, not text colour: the docs area is navigation-heavy and readers scan for links."
- **Open issues.** As in the audit; remove the line once fixed.

## Checklist

- [ ] Every colour is a job-named token; literals only in artwork and shared multi-layer constants.
- [ ] Components use roles (`accent`, its hover, `surface.selected`), not brand-hue steps.
- [ ] `text.primary` through `text.tertiary` are their own tokens, never border or fill steps.
- [ ] Every tier clears 4.5:1 on its worst surface, per theme, computed with `contrast.mjs`.
- [ ] The text ladder strictly descends in every theme.
- [ ] Icons take their label's tier or one below; `mark` is only for decoration without text.
- [ ] Control edges and icons that must be seen clear 3:1.
- [ ] Anything layered is translucent (`border.layered` and kin), inverting per theme.
- [ ] `focus` clears 3:1 on every surface it can land on, uses `:focus-visible` with an offset, never sits beside its own colour.
- [ ] No state or status is signalled by colour alone.
- [ ] Each `status.*` is a fg/bg pair per theme, fg at 4.5:1 on the page and its tint.
- [ ] Each `exception.<name>` has a written reason no other element shares; only its mark is coloured.
- [ ] Each hue family answers one question (what, how, where, who) and never another's.
- [ ] One hue calls for action; the reader's current location is uncoloured; done is coloured only where the dial says completion is the news.
- [ ] Accents, status pairs, exceptions and family hues are re-picked per theme; every gradient stop moves; marks clear 3:1 on every ground.
- [ ] Dark `surface.page` and light `text.primary` are near-black, not `#000`.
- [ ] With a toggle, the theme is a root attribute or class set by a blocking inline script before the stylesheet.
- [ ] `color-scheme` is declared in every theme.
- [ ] Context-dependent and multi-layer values are runtime custom properties; preference overrides follow every theme block.
- [ ] Dial check: palette, accent's jobs and link colour match the preset.
- [ ] Dial check: exception count and done colour match the preset.
- [ ] Dial check: tier count, minimum step and tertiary target match the preset.
- [ ] Dial check: status palette present if the preset requires it.
- [ ] Dial check: theme control and dark page lightness match, or `## Decisions` says why not.
