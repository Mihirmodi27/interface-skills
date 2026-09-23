---
name: color-and-theming
description: Build and audit an interface's colour system in any palette, neutral or brand, by naming every token for the job it does rather than its lightness. Covers text tiers picked and measured for contrast, a translucent ramp for anything layered, a focus colour that is never lost, status colours as foreground/background pairs, chromatic exceptions spent by rule, and light/dark theming with no flash. Applies these rules in the project's own token names and preset, read from DESIGN.md. Use when defining or naming colour tokens, deriving a ramp from a brand hue, picking a colour for a border, hover or selected state, choosing text tiers, adding status or error colours, adding a dark theme or a theme toggle, fixing a flash of wrong theme, re-picking an accent or a gradient for dark mode, deciding between build-time tokens and runtime custom properties, or reviewing a palette that feels muddy, inconsistent, low-contrast or accidentally colourful.
---

# Colour and Theming

A colour system for interfaces of any character — a near-monochrome reading site, a dense product with a full status palette, a brand page that spends colour broadly. What changes between them is how much colour is spent. What doesn't change is how it is organised.

The organising idea: **a colour token encodes a job, not a lightness.** `border.default` is not "a bit darker than the hover surface", it is *the colour an edge is*. Once every value is indexed by intent, picking a colour stops being a judgement call — you're naming a role, not choosing a shade — a reviewer can catch a mistake by reading the diff, and a second theme becomes a re-tint of the same names rather than a second palette.

This skill reasons in the canonical roles (`text.secondary`, `surface.raised`, `focus`) and writes code in whatever the project already calls them. `DESIGN.md` holds the mapping.

## Before you start

Read `DESIGN.md` at the project root — its `## Profile` and its `## Colour` section. They give you the preset (and any areas of the project on a different one), the project's own name for every role this skill talks about, and the decisions already made. Work in those names: this skill says `text.secondary`; the code you write says whatever `DESIGN.md` maps `text.secondary` to.

- **No `DESIGN.md`?** Don't stop. Run a narrow pass of the `design-system-setup` skill for this domain only — scan, map the roles you need, pick the preset from what the reader is doing — do the task, and recommend running the full setup afterwards.
- **A role you need has no row?** Look for a value already doing that job before inventing one. If you have to add one, name it in the project's style and record it in `DESIGN.md`.
- **The task would break a law, or move a dial off its preset?** Say so and ask. If the user confirms, do it, and record the decision with its reason under `## Decisions`.
- **The file names the `glass` preset?** The values are in `DESIGN.md`; the `glass-color` skill, if installed, has the exact recipes and components behind them.

## Laws

### 1. A token is named for its job, not its lightness

**Every colour in the interface is a token, and every token is the answer to one question — "what colour is a border?", "what colour is a pressed surface?" — never a position on a lightness scale.**

A ramp indexed by lightness (`gray-100` lightest, `gray-900` darkest) makes every pick a judgement: "a border, so… 300? 400?" Two engineers answer differently, and six months later there are four border greys. Indexed by intent, the question has one answer, and a border at the pressed-surface step is visibly wrong in review without opening a colour picker.

This holds for brand hues exactly as it holds for greys. A project with `indigo-50` to `indigo-900` still has to decide which step is `accent`, which is `accent` hovered, which is `surface.selected`. If the code says `bg-indigo-600` in one place and `bg-indigo-700` in another for the same button, the ramp is doing no work. Map the steps to roles; let components reference the roles.

Two consequences worth stating:

- **Intent can beat monotonicity.** A border sits *beside* content and must stay quieter than a pressed surface, which sits *under* it — so a light theme's border step may legitimately be lighter than the pressed step. In the Glass package this showed up as `gray-400` (border) being lighter than `gray-300` (pressed), and it's the clearest proof the ramp isn't a gradient.
- **"I need something between two steps" is a misdiagnosis.** It means the element has a different job from the one you assumed. Find the job; if none of the roles fits, it's a new role, named and recorded — not an inline hex.

The allowed literals: colours inside illustration or SVG artwork, and multi-layer values that are built once as a shared constant (law 10).

### 2. Text tiers are their own tokens, never border steps

**A text colour is picked for text contrast. It is never a mid-ramp step borrowed from the border and fill range.**

Text needs 4.5:1 against its surface. A border or icon that a user must see to operate a control needs 3:1; a decorative edge needs only to be visible. Those are different requirements, so one value can rarely serve both — and in a *light* theme the gap is brutal, because the mid steps of any ramp are light tints sitting on white.

In the Glass package this was a real bug, shipped for a whole revision. Timestamps sat on the border-hover step at **1.66:1**, icons on the border-active step at **2.38:1**, and most supporting copy on the fill-hover step at **4.12:1** — the most-used text colour on the site, failing everywhere in light. A written note in the skill itself claimed that step was "about 4.6:1"; computed, it wasn't. The fix was three new tokens picked for contrast, sitting between the two text steps the ramp already had.

Dark mode hides this completely. The same indices sit far lighter against a near-black page, so every mid step passes. A system developed and reviewed in dark mode ships a light theme whose body copy fails, and nothing looks obviously wrong.

So: `text.primary`, `text.secondary`, `text.tertiary` and any project tiers between them are separate tokens. Icons take the tier of the label they sit beside, or one below it — an icon has more visual mass than text at the same value, so it rests a tier lower and both advance together on hover. Decorative marks with no text — bullets, dots, inactive rail markers — are `mark`, stay on the ramp, and are not held to text contrast; keeping them faint is what stops a list reading as a column of dark dots.

### 3. The ladder clears the floor and strictly descends, measured where it's worst

**Every text tier clears 4.5:1 against the worst surface it actually lands on, in the worst theme, and each tier is measurably below the one above it.**

Three parts, each a separate way to fail:

- **Computed, not estimated.** Ratios are arithmetic; eyes and memory are wrong about them. Use the `design-system-setup` skill's `scripts/contrast.mjs` (`--ladder <surface> <tier> <tier> …`, top tier first). It composites translucent colours before measuring, which is the number the reader sees.
- **The worst surface, not the page.** Tertiary text on `surface.page` may pass while the same text on `surface.hover`, `surface.subtle` or `surface.selected` fails. Check each tier against the surface that leaves it the least contrast: the darkest one in a light theme, the lightest in a dark theme.
- **Strictly descending, with a step you can see.** Once every tier must clear 4.5:1 the tiers crowd together into a narrow band, and it is easy to pass WCAG and lose the hierarchy — two tiers at 5.1 and 4.9 are one tier with two names. `--ladder` flags a tier that isn't below the one above; the minimum *size* of the step is a dial.

Record every ratio in `DESIGN.md`, per theme, with the surface it was measured on.

### 4. Anything on an unknown backdrop takes a translucent colour

**A border, divider, hairline or hover wash that can sit over something other than a known opaque surface uses a translucent value, and that translucent set inverts between themes.**

A solid border on a translucent panel doesn't participate in what's behind it; over a photograph or a scrolled page it reads as a frame pasted on top. A translucent border — "a little more contrast than whatever is here" — stays right over white, over grey and over an image.

The inversion is the crux. In a light theme "a little more contrast" means a black at low alpha; in a dark theme it means a *white* at low alpha, because a dark-mode edge is lighter than its surface and a black overlay would make it disappear. Build the translucent set once, with the same role names in both themes, and every layered component adapts with no per-component theme branching.

Rule of thumb: **solid values for opaque surfaces, translucent values for anything layered.** `border.layered` is the canonical role; project roles under it are fine. The tints of translucent *materials* are colours too and live here (as runtime values, law 10); the blur, the edge, the shadow and the fallback surface belong to the `surfaces-and-depth` skill.

### 5. Focus is findable on every surface

**The focus colour clears 3:1 against every surface it can land on, is drawn with a gap of page colour between it and the element, and nothing it sits next to shares it.**

```css
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
a:focus-visible { outline-offset: 3px; } /* ragged inline edges need more room */
```

`:focus-visible`, never `:focus` — a mouse click shouldn't leave a ring behind. The one legitimate `:focus` is a skip link, which must appear on keyboard focus regardless of heuristics. `outline-offset` separates the ring from the element so it reads as an object, not a border. Draw it with `outline`, not `box-shadow`: forced-colours mode removes shadows and keeps outlines. `outline: none` without a replacement is a bug under every preset.

The focus colour may share a token with `accent`. What it may not do is sit beside the same colour: an accent-coloured button with an accent-coloured ring on an accent-tinted row makes the ring invisible exactly where it's needed. If the accent is everywhere, the ring gets a different colour or a double ring (page-colour inner, focus-colour outer). Status colours stay out of the focus hue's territory for the same reason.

### 6. Colour never carries a signal alone

**Every state or status expressed in colour is also expressed in something that survives without colour — an icon, a word, a weight, a rule, a marker, a position.**

About one man in twelve has some colour-vision deficiency, and every reader loses hue in sunlight, in a greyscale screenshot, on a cheap projector. A form whose only sign of an error is a red border tells those readers nothing. Status is an icon plus a sentence, with colour reinforcing both.

The same holds for state *within* a neutral system, and it's the version people miss. Once every text tier clears 4.5:1, only two or three greys are readable, and the steps between them are too small to mean "selected" or "current". A navigation item marked active only by being one tier darker than its siblings is a signal most readers never receive. Visible state needs a rule, a marker, a fill or a weight — colour can accompany it, not carry it.

A real status palette is a set of **pairs**: each of `status.danger`, `status.warning`, `status.success`, `status.info` has a foreground that clears 4.5:1 as text on both the page and its own tint, and a background tint that reads as a surface, not as a highlighter. Both are re-picked per theme.

→ The status method, pair by pair, with a worked set: `references/status-and-exceptions.md`

### 7. Colour is spent structurally

**Every chromatic spend beyond the accent and the status palette is named for what it's for, justified by a reason that no other element on the page shares, and contained so that only the mark takes the colour.**

In any system, colour is attention. Spend it on something because of what the element *is*, not because the page felt grey. The test: is this element content, or is it the interface speaking about the content — an offer, a warning, a way in? Content should look like everything else the reader came for. The small category of elements that must be found before reading starts may announce themselves. In the Glass package the one exception is a collapsed "short version" panel: it's an offer, not part of the argument, and nothing else on the site is an offer — so the reason cannot spread.

A justification that *can* spread ("it's important", "it's new", "it's the brand colour") becomes a palette within two components, because every author thinks their element qualifies.

Containment, inside the coloured element:

- **Only the mark takes the colour.** The edge, the icon, the glyph — not the text. A coloured paragraph inside the loud element is a second thing to look at within the thing that is already loud, and the loudness stops meaning anything once it's shared.
- **Record it** as `exception.<what-it's-for>` in `DESIGN.md`, with the reason. How many exceptions a system may hold is a dial; that each one has a written, non-transferable reason is not.

Before spending one, ask whether the element can do its job with weight, position and space instead. Most can.

### 8. A theme is a re-pick, not a reuse

**Every coloured value — accent, focus, status pair, exception, every stop of every gradient — is chosen afresh for each theme and measured there.**

- **Accents.** A hue that clears 4.5:1 on white has far less on near-black. Reusing it makes the ring and the links go dim in dark mode. Re-pick the lightness (and usually trim the chroma) per theme; re-check `text.on-accent`, which often flips from light to dark.
- **Gradients move every stop.** A gradient's darkest stop can sit within a few points of a dark page and vanish down half its length. The instinct is to lighten only that stop; that compresses the ramp and it stops reading as one gradient. A gradient is a relationship between its stops, so re-picking it for a theme means moving all of them by roughly the same amount.
- **Near-black, not black.** Dark `surface.page` sits a little above `#000`: pure black gives shadows nothing to sit on and produces glare against light text. The light theme's `text.primary` is near-black for the matching reason — pure black on white halates at small sizes.
- **"Raised" flips direction.** In light, a raised surface is darker or equal to the page and separated by an edge; in dark, a raised surface is *lighter* than the page. Tinted fills in dark are tinted, not darkened, so they don't punch a hole in the page.
- **Not a mechanical inversion.** An inverted light ramp puts every gap in the wrong place. Space each theme's surfaces by contrast against *its own* page, so hover and pressed read as the same steps in both, and keep a large jump between the last edge step and the lowest text tier.

### 9. One mechanism sets the theme, before first paint

**When the user can choose a theme, an attribute or class on the root element is the mechanism — not the `prefers-color-scheme` media query — and it is set by a blocking inline script before the stylesheet applies.**

A toggle and a media query are two sources of truth, and once a user has expressed a preference the OS shouldn't win. Seed the first visit from `prefers-color-scheme` if you like; don't let the media query be the switch. (A site with no toggle may theme off the media query alone — there's only one source of truth then.)

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("theme");
      document.documentElement.dataset.theme = t === "dark" || t === "light" ? t
        : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

Inline, blocking (no `async`, `defer` or `type="module"`), before the stylesheet, wrapped in `try/catch` because storage throws in some privacy modes. Skip any of the four and dark-mode users get a white flash on every load — the most noticeable bug a themed site can have. Under SSR, render the attribute from a cookie instead.

Declare `color-scheme` per theme. It re-tints what CSS can't reach — scrollbars, form controls, autofill, the default canvas — and its absence is the white scrollbar track on a black page.

→ Persistence, two- vs three-state controls, the crossfade on toggle, nested theme islands, and where per-theme variants are still needed: `references/theming-mechanics.md`

### 10. Values that change by context are runtime; the vocabulary is build-time

**A value that has to change with theme, user preference or container is a runtime custom property on the root; the fixed vocabulary may be build-time tokens. Anything that isn't a single colour — a gradient, a shadow stack — is runtime regardless.**

A build-time token (a Sass variable, a JS constant inlined at build, a static theme object) can't be re-declared by a media query. The `prefers-reduced-transparency` fallback has to swap every translucent tint for a solid one at runtime; `prefers-contrast: more` may raise the lower text tiers; a theme toggle re-tints everything. If those values were compiled in, none of that can happen. And no colour-token system has a slot for `linear-gradient()` or a four-layer `box-shadow`, so those live as custom properties or shared constants from the start.

Source order matters when a preference block re-declares theme values at the same specificity: it goes **after** every theme block, and names every theme selector.

→ Which values go where, per stack, and the preference overrides (reduced transparency, more contrast, forced colours): `references/theming-mechanics.md`

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| Palette | Near-monochrome neutral | Neutral ground plus a status palette | A brand palette used broadly, each hue with placement rules |
| Neutral chroma (OKLCH C) | 0–0.01 | 0–0.015, toward the brand hue | 0–0.03, toward the brand hue |
| What the accent does | Focus, and nothing else | Primary action, focus, selection | Brand surfaces, action, focus |
| Chromatic exceptions beyond accent and status | ≤ 1 | 0 — the status palette is the colour | ≤ 4, each named |
| Link colour | Text colour, underlined | `accent` | `accent` or a brand hue, underlined in prose |
| Text tiers, `text.primary` to `text.tertiary` | 3–5 | 3 | 3–4 |
| Minimum step between adjacent tiers (ratio of ratios) | 1.15× | 1.4× | 1.25× |
| `text.tertiary` target on its worst surface | ≥ 4.6:1 | ≥ 4.8:1 | ≥ 4.6:1 |
| Status palette | Only if something reports state | `danger`, `warning`, `success`, `info` — required | As needed |
| Theme control | Light and dark, two-state | Light, dark and system | One theme allowed; if two, two-state |
| Dark `surface.page` lightness (OKLCH L) | 0.14–0.18 | 0.17–0.21 | 0.12–0.18 |

The `glass` preset takes its values from `glass-color`.

**Palette and neutral chroma.** A near-monochrome system makes the accent and the one exception loud by default; the cost is that every state has to be carried by something other than colour (law 6), which is more design work. A tinted neutral ties the greys to the brand, but past about 0.015 chroma the greys start reading as colour themselves, and a tinted `text.tertiary` beside a status foreground can look like a status.

**What the accent does.** Restricted to focus, colour *is* where the keyboard is. Spread to primary actions, it tells a working user where the next step is — worth it in a product — at the price of the ring needing law 5's care beside accent buttons.

**Links.** Text-coloured links keep a reading page calm and leave colour for focus; they must then be underlined, because colour isn't carrying them. Accent-coloured links scan faster in a product, where links are navigation rather than citation.

**Tiers and step size.** More tiers give prose finer shades of emphasis, but every tier must clear the floor, so each extra tier shrinks the step between its neighbours; a light theme rarely fits more than five. A product has fewer, more distinct tiers, because a scanning reader must tell them apart at a glance across a dense table.

**Tertiary target.** The margin above 4.5:1 absorbs the surfaces the floor wasn't measured on. A product has more of them (hover, selected, zebra rows), so it keeps a wider margin.

**Theme control.** Two states are predictable: a "system" option means the page changes when the OS crosses sunset, which surprises someone who picked it from the page's own menu. Three states respect the OS for people who want to follow their day, and cost a live listener (see `references/theming-mechanics.md`).

**Dark page lightness.** Lower is more dramatic and leaves less room for surfaces and shadows below the raised steps. A product's dark theme stacks panels, so its page sits higher.

## Building it for a project

1. **List the jobs.** From `roles.md`, keep the colour roles this project actually has and strike the rest — no dark theme, no dark column; no status, no status rows. Add project roles under their nearest parent.
2. **Choose the neutral.** A hue (the brand hue, or none) and a chroma from the dial. Work in OKLCH, where lightness is perceptual and hue holds steady as you move it.
3. **Fix the ends, per theme.** `surface.page` and `text.primary`: near-white and near-black in light, the dial's dark `surface.page` lightness and a light grey in dark.
4. **Place surfaces and lines as small lightness steps.** `surface.raised`, `surface.hover`, `surface.pressed`, `surface.subtle`, `border.default`, `border.hover`. Light steps go down from the page, dark steps go up; space both by their contrast against the page rather than by equal lightness gaps. Check the ones that must be seen: an input's edge, an icon, the focus ring at 3:1.
5. **Solve the text tiers from contrast targets.** Choose the targets (primary high, tertiary at the dial's target, the rest spaced by at least the minimum step), then solve each tier's lightness against the worst surface it lands on and verify with `contrast.mjs --ladder`, per theme.
6. **Derive the accent from the brand hue.** Per theme: a lightness that gives `text.on-accent` 4.5:1 and `focus` 3:1 on every surface. Then its hover and its `surface.selected` tint, and re-measure the lowest text tier on that tint.
7. **Status pairs**, if the preset needs them; **exceptions**, if one passes law 7.
8. **The translucent set**: black at low alpha in light, white at low alpha in dark, for `border.layered` and any layered washes.
9. **Write it** as custom properties, one block per theme, then run the ladder check for every theme and write the ratios into `DESIGN.md`.

A fictional scheduling product, *Harbour*, on the `product` preset with a teal brand hue (OKLCH h 195), comes out like this. The worst surface for body text is `surface.hover`, a table row:

```css
:root {
  color-scheme: light;
  --surface-page:    oklch(1 0 0);
  --surface-hover:   oklch(0.955 0.008 195);
  --border-default:  oklch(0.9 0.008 195);
  --text-primary:    oklch(0.22 0.008 195);  /* 15.19:1 on hover */
  --text-secondary:  oklch(0.41 0.008 195);  /*  7.74:1 */
  --text-tertiary:   oklch(0.52 0.008 195);  /*  4.83:1 */
  --accent:          oklch(0.5 0.08 195);    /* white text 5.77:1; focus 5.07:1 on hover */
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --surface-page:    oklch(0.17 0.008 195);
  --surface-hover:   oklch(0.24 0.008 195);
  --border-default:  oklch(0.3 0.008 195);
  --text-primary:    oklch(0.92 0.008 195);  /* 12.99:1 on hover */
  --text-secondary:  oklch(0.73 0.008 195);  /*  6.88:1 */
  --text-tertiary:   oklch(0.64 0.008 195);  /*  4.90:1 */
  --accent:          oklch(0.75 0.1 195);    /* re-picked: dark page text on it 8.94:1 */
}
```

Measuring caught one failure the page check wouldn't: the first dark `surface.selected`, `oklch(0.27 0.035 195)`, left `text.tertiary` at **4.44:1** on a selected row. It moved to `oklch(0.25 0.03 195)` (4.73:1).

In Tailwind v4 these are `@theme` entries (or `@theme inline` pointing at the runtime variables, so themes can re-declare them); in a Tailwind config they're `theme.extend.colors` entries set to `var(--…)`; in a JS theme object they're keys whose values are the same `var()` references.

→ The derivation method in full — the contrast formula, the surface spacing per theme, the brand ramp, the whole Harbour table, and per-preset starting targets: `references/deriving-a-ramp.md`

## Auditing existing code

Collect evidence first, then measure. The greps assume CSS, Tailwind or CSS-in-JS; adapt the patterns to the stack.

| Look for | Grep for | Law |
|---|---|---|
| Colour literals outside token files and artwork | `#[0-9a-fA-F]{3,8}\b`, `rgba?\(`, `hsla?\(`, `oklch\(` | 1 |
| The same job at several values | every value used for borders; every value used for captions and meta | 1 |
| Mid-ramp steps used as text | `text-(gray\|neutral\|slate\|zinc)-(300\|400\|500)`, or the project's equivalent | 2 |
| Icons on a text-primary tier by default | icon components with the top text colour at rest | 2 |
| Solid borders on translucent surfaces | `backdrop-filter` elements, then their border values | 4 |
| Lost focus | `outline:\s*(none\|0)`, `:focus\b` without `-visible`, `ring-0` | 5 |
| Colour-only status | error or success styling with no icon or message beside it; active nav marked by colour alone | 6 |
| Uncounted colour | every hue outside accent, focus and status, and what each is for | 7 |
| Reused accents and half-moved gradients | theme blocks that re-declare some gradient stops but not all; accents with one value | 8 |
| Pure black | `#000\b`, `#000000`, `black` on surfaces | 8 |
| Two theme mechanisms | `prefers-color-scheme` in CSS alongside a toggle; missing `color-scheme` | 9 |
| Flash of wrong theme | theme set in a component effect rather than an inline head script | 9 |
| Compiled context values | tints or gradients in build-time tokens that a preference query needs to replace | 10 |

Then measure: every text tier against its worst surface, in every theme, with `contrast.mjs --ladder`; the focus colour at `--min 3` against every surface it can land on; each status foreground against the page and against its own tint.

Report each finding as one line in `DESIGN.md` `## Open issues`, with evidence — a ratio, a count, a file: "`text.tertiary` (`--ink-3`) is 4.21:1 on `surface.hover` in light — fails 4.5:1. Used in 22 files." Don't fix what wasn't asked for.

## Writing back to DESIGN.md

- **The ratios.** Every text tier and the focus colour, per theme, with the surface each was measured on. Re-measure and update them whenever a value in `## Colour` changes.
- **New roles.** A role you had to add — a `surface.selected` the project lacked, a project tier between secondary and tertiary — with its name in the project's style, marked `proposed` until the user accepts it.
- **Exceptions.** Each `exception.<name>` under **Exceptions**, with what it's for and why that reason can't spread.
- **Moved dials.** Under `## Decisions`, dated, with the reason: "Links in `accent`, not text colour: the docs area is navigation-heavy and readers scan for links."
- **Open issues.** Every law the code breaks, with evidence; remove the line when it's fixed.

## Checklist

- [ ] Every colour is a token named for its job; the only literals are artwork and shared multi-layer constants.
- [ ] Brand-hue steps are mapped to roles (`accent`, its hover, `surface.selected`), and components reference the roles.
- [ ] No border or fill step is used as a text colour; `text.primary` through `text.tertiary` are their own tokens.
- [ ] Every text tier clears 4.5:1 on the worst surface it lands on, in every theme, computed with `contrast.mjs`.
- [ ] The text ladder is strictly descending in every theme.
- [ ] Icons take their label's tier or one below; `mark` is used only for decoration without text.
- [ ] Controls' edges and icons that must be seen clear 3:1.
- [ ] Anything layered uses `border.layered` or another translucent value, and the translucent set inverts per theme.
- [ ] `focus` clears 3:1 on every surface it can land on, uses `:focus-visible` with an offset, and never sits beside its own colour.
- [ ] No state or status is signalled by colour alone.
- [ ] Each `status.*` is a foreground/background pair, re-picked per theme, with the foreground at 4.5:1 on the page and on its tint.
- [ ] Every `exception.<name>` has a written reason no other element shares, and only its mark takes the colour.
- [ ] Accents, status pairs and exceptions are re-picked per theme, and every gradient stop moves.
- [ ] Dark `surface.page` is near-black, not `#000`; light `text.primary` is near-black, not `#000`.
- [ ] With a toggle, the theme is an attribute or class on the root, set by a blocking inline script before the stylesheet.
- [ ] `color-scheme` is declared in every theme.
- [ ] Context-dependent values and anything that isn't a single colour are runtime custom properties; preference overrides come after every theme block.
- [ ] Dial check: the palette, accent's jobs and link colour match the preset.
- [ ] Dial check: exception count is within the preset's limit.
- [ ] Dial check: tier count, minimum step and tertiary target match the preset.
- [ ] Dial check: the status palette is present if the preset requires it.
- [ ] Dial check: the theme control and dark page lightness match the preset, or a `## Decisions` entry says why not.
