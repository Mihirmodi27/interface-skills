---
name: surfaces-and-depth
description: "Decide how a surface says where it sits — flat, raised, floating or modal — and build each level as one bundle of surface, edge, shadow and layer. Covers one-light layered shadows, dark themes that lift by lightening, scrims, gradient strokes, glows, and translucency as an optional material: when it earns its place, how blur, saturation and tint keep it legible, and its reduced-transparency, high-contrast, forced-colours and no-support fallbacks. Works in the project's tokens via DESIGN.md. Use when deciding whether something should be a card at all, when a screen feels boxy, tiled or template-like, when building or reviewing cards, sticky headers, menus, popovers, tooltips, dialogs, confirmations, sheets, drawers or an art panel; choosing or tuning shadows; when depth looks flat, muddy or inconsistent; when dark mode loses its layers; when deciding whether a surface should be translucent at all; when text over one fails contrast; or when adding any backdrop-filter or elevation fallback."
---

# Surfaces and Depth

Every surface claims a place: a table row, that it is part of the page; a sticky header, that content passes under it; a menu, that it arrived over the page and will leave; a dialog, that nothing else can be touched until it is answered. A surface whose depth contradicts its behaviour is lying — a dialog that looks like a menu, a card that seems to float but scrolls with the page.

## Before you start

Read `DESIGN.md` at the project root: `## Profile` for the preset and any areas on another one, `## Surfaces` for the project's name for each role and the decisions already made. Reason in roles; write code in the project's names.

- **No `DESIGN.md`:** run the `design-system-setup` skill for this domain only, do the task, then recommend the full setup.
- **A role you need has no row:** reuse a value already doing that job; otherwise add one in the project's naming style and record it in `DESIGN.md`.
- **The task would break a law or move a dial off its preset:** say so and ask; if the user confirms, record it with its reason under `## Decisions`.
- **Preset `glass`:** the values are in `DESIGN.md`; the `glass-and-depth` skill, if installed, has the exact recipes behind them.

Boundaries: the radius ladder and nesting rule, hairline weights and the z-index ladder are `layout-and-hierarchy`'s; surface, edge and tint colours, and why translucent tints are runtime values, `color-and-theming`'s; the timing of anything that lifts, glows or opens, `interface-motion`'s; a confirmation's flow and a sign-in page's layout, `product-patterns`'. This skill picks which a surface takes and checks they agree.

## Laws

### 1. Elevation is a named ladder of bundles, applied whole

**Every surface sits on exactly one level — `elevation.flat`, `.raised`, `.floating` or `.overlay` — and takes that level's surface, edge, shadow and z-layer together: four spellings of one fact.** The level follows what the thing *does* — sits in the flow, is lifted or stuck, is summoned and dismissed, or blocks until answered — not how important it feels.

Mixing parts is the bug the ladder prevents: a card given the menu's shadow on hover but not its layer is painted over by the next sibling, clipping the lift. A state change moves the whole bundle — a dragged card becomes floating in all four parts — while a hover that deepens a raised card's shadow is raised's own hover state.

A level is also one component. Every dialog is the system's dialog, a destructive confirmation included: a one-off with its own red icon circle, red heading and padding reads as out of the system however right its level. The danger goes on the one action that does it (`color-and-theming`); surface, edge, shadow and scrim stay the overlay's.

Every rung is used. The Glass package's fourth translucent tier, for "a menu over a surface you already know", never found a user. A dead rung is worse than an absent one: the next person assumes it is load-bearing.

### 2. Content sits on the page; a card is for one object

**Sections, lists, tables and figures sit on the page, unboxed; a card — a surface with its own edge — is reserved for one object the reader acts on or takes in whole, and a card never holds another card.** A box says "this is a thing". Put one round every section, stat and list and every region claims to be a thing, so none is; each nesting adds an edge, a padding and a radius, and a screen built of boxes in boxes reads as a template however good its type. The grouping a box pretends to provide is space's job (`layout-and-hierarchy`), and a heading with a hairline under it does it better.

In order of preference:

1. **Unboxed** — a heading row, then the content straight on `surface.page`: rows parted by `border.divider`, figures by vertical hairlines, never an edge round the group.
2. **A card** — one object: a decision awaiting approval, a document, a side rail. A rail with two topics is one card in two parts, parted by a divider; several items of one kind (three pending approvals) share one card the same way, not a card each.
3. **A note** — an aside or caveat takes a hairline rule on its leading edge, not a tinted box.

A tinted strip behind a group label, a bordered callout and a tile per figure are boxes by other names. The test: take the edge away. If the grouping still reads from space and the heading, the edge was decoration; if it no longer reads as one object, it wasn't a card's job either — fix the spacing.

### 3. Depth needs an edge as well as a shadow

**Any surface above `elevation.flat` has an edge that says where it ends, not only a shadow that says it is above.** A shadow is a soft gradient and cannot draw a boundary; without an edge the outline is mush, worst in dark themes, where shadows have almost no headroom. The edge is `border.default` on an opaque surface; on a translucent one or any backdrop it doesn't control, the translucent `border.layered`, since a solid grey edge there reads as a pasted-on frame. Where the preset draws the edge as a half-pixel ring at the head of the shadow stack (Dials), it is still the edge: `prefers-contrast: more` swaps in a real 1px border, whose whole job there is a boundary you can find.

`forced-colors` drops every `box-shadow` but keeps the edge, so a surface designed with no visible edge still carries `1px solid transparent`, painted in the system text colour. `elevation.flat` has no shadow: an edge or a surface step, never a faint shadow posing as a border.

### 4. A shadow models one light, in layers, and lives in one definition

**A shadow is a contact layer plus one or two ambient layers from a single light above, with negative spread, felt rather than seen.** The faint 1px contact layer makes a surface look *resting on* something; two ambient layers fall off like a penumbra where one large blur reads as fog; negative spread keeps each tucked under the element — without it, stock presets look like glows. An optional inset top highlight does more for floating than any drop layer. Higher levels get more and longer layers; a transient tooltip drops the contact layer — it hovers.

Strength follows **what is immediately behind the surface**, not the theme: a tooltip on `surface.inverse` needs the same strong shadow in both themes, since its own surface is what the shadow separates. On a tinted ground the shadow takes the ground's hue, darkened; neutral black on a warm cream page reads as dirt.

Nobody spots a `0.04` that became `0.05` in one of five copies, so **a layered shadow has one definition per level, extracted the moment it appears twice**, which every use points at.

### 5. Dark themes lift surfaces by lightening them

**In a dark theme each level above the page is lighter than the one beneath it; the shadow is a secondary cue.** Raised means more contrast against the page, so the direction flips: light-theme raised surfaces match the page or sit slightly darker; dark-theme ones are lighter, because a black shadow on a near-black page has nowhere to go, and strengthening shadows alone leaves every level looking like the page. The dark shadow is its own per-theme recipe — drop layers at roughly ten times the opacity, the highlight at a fraction of its strength — and the page is never `#000`, which gives shadows nothing to sit on. Hence the Glass package's dark chrome tint, lighter than its dark page, and shadow opacities of 2–6% in light, 30–60% in dark.

### 6. Translucency has to be earned, and usually isn't

**A translucent surface claims that content continues underneath and that seeing it helps. Where either half is false, the surface is opaque.** It holds for chrome that content scrolls under, for a floating layer whose context helps the reader, and for art — a frosted pocket on an illustration, whose backdrop is drawn, still and meant to be seen. Art earns it more often than chrome: nobody reads through it. A product keeps its art, generative or illustrated, translucent or not, to one inset panel — the half of a sign-in page beside an unboxed form — and never frosts over art that is still moving. It fails for:

- **A section, panel or sidebar in the flow** — it's the page, not floating.
- **A card in a grid or a row in a list** — nothing meaningful is behind it, and a filter per row is the worst cost profile.
- **Anything holding reading copy** (law 10).
- **A flat, single-colour backdrop** — nothing to reveal; use the tint.
- **Content behind that must stay readable** — that wants an opaque, shadowed surface beside it, not a blur over it.
- **Video, canvas or anything animating** — the filter re-runs every backdrop frame.
- **A preset that disallows it** (Dials) — in fluent product tools borders and opaque surfaces do the work, and translucency is decoration that costs contrast.

The Glass package, built around the material, uses it in four places, all floating chrome: the ceiling, not the target.

### 7. Blur scales with uncertainty about the backdrop

**Blur radius is set by how little you know about what's behind the surface, not by its size or importance.**

| Tier | Blur | Saturate | Tint opacity | Backdrop |
|---|---|---|---|---|
| Soften | 6–10px | 1.2–1.4 | 35–60% | Content you want recognised |
| Chrome | 16–24px | 1.6–1.8 | 70–80% | Arbitrary content passing under |
| Defensive | 20–28px | 1.6–1.8 | 92–97% | Anything, including other translucent surfaces |

Role-tier ranges, not dial values; the preset picks which tiers exist (Dials). Cost scales with area, not radius, so don't trim blur to save frames.

### 8. Blur needs saturation

**Every `backdrop-filter` blur carries a `saturate()` correction.** Blur averages colours toward grey, and blur plus a pale tint alone is the cloudy, dirty wash "glassmorphism" describes; the correction is free in the same pass. Go lower where the backdrop is itself the subject; above about 2.0, colours turn radioactive.

### 9. The tint carries legibility when the blur can't

**A translucent surface is legible from its tint alone; the blur is a bonus.** A `transform`, `filter`, `perspective`, `contain: paint` or `will-change` on an ancestor weakens or breaks `backdrop-filter` beneath it — a menu's scaling wrapper does, for the whole animation — and a 72% tint without its blur is unreadable over a busy page. Animate one element and filter another; failing that, thicken the tint, as the Glass package's floating panel does at 97%. The same ancestors trap `position: fixed` descendants, so check the whole ancestor chain when either misbehaves.

### 10. Translucent text is checked against the worst backdrop

**Text contrast on a translucent surface is measured against the tint composited over the lightest *and* darkest backdrop it can land on — never against the tint as if opaque.** A 72% near-white tint is near-white over a white page and mid-grey over a dark photograph: `text.tertiary` clears 5.1:1 on one and manages 2.6:1 on the other, as scrolling carries it between them. The opaque-tint number is a fiction.

Make it true, in order: raise the tint until it is effectively opaque behind text (at 95% the backdrop contributes a few per cent); over arbitrary content at the chrome tier, carry only `text.primary`, and icons at their label's tier — at 72% over a dark image even `text.secondary` falls to about 4.2:1; keep reading copy off translucent surfaces.

→ The compositing arithmetic and a worked check: `references/translucent-materials.md`

### 11. Translucency over translucency needs a tier gap

**Where one translucent surface overlaps another, the upper one is a visibly different tier — much heavier tint, or opaque.** Stacked blurs don't compose, and two surfaces at one tint read as one object: a panel over a dock at the dock's tint looks like the dock grew. At most one meaningful blur in any vertical stack.

### 12. A scrim says "modal", and only modal

**`elevation.overlay` brings a `scrim`; nothing below it does.** It says the rest of the interface is paused: a menu with one falsely claims to be modal; a dialog without one looks like a menu that won't close. A floating layer's outside-click catcher is transparent. The scrim darkens toward the ground's hue, stronger in dark themes, where dimming near-black barely registers and the overlay's surface step (law 5) does most of the separating. A blurred scrim — a full-viewport filter, the costliest surface there is — appears only where the preset allows and never animates its radius.

Modal also hands back what it took: **on close, focus returns to whatever opened it.** A dialog opened from state — a row's menu item, a shortcut, a selection — has no trigger for the primitive to fall back to, so store the opener before opening and restore it, or the next Tab starts from the top of the page.

→ Restoring focus, including when the opener is gone: `references/elevation-recipes.md`

### 13. Gradients on resizing elements are anchored in pixels

**A gradient stroke or fill on an element that changes size places its stops in absolute units, and a gradient stroke is two background layers on one box.** Percentage stops rescale with the box: a Glass package panel opening from a 46px bar to 250px ran its whole navy-to-pale sweep inside the closed bar — louder closed than open — and shimmered as it grew. Anchored at `0px / 120px / 240px`, the top holds still and the colour grows downward. The stroke also needs `background-origin: border-box`, or every side gets the wrong end of the ramp — which looks almost right.

→ The stroke's two layers, with no wrapper or mask: `references/translucent-materials.md`

### 14. Light is emitted from the sides and passes once

**A coloured glow is weighted to the sides so it reads as emission; a sheen crosses once and then stops.** One centred coloured shadow is a drop shadow that happens to be blue. A glow reporting a state — hovered, open — holds as long as the state. A looping sheen claims the thing is still working, so it runs once and is removed: `background-clip: text` with transparent text left in place is a selection and forced-colours hazard. Under reduced motion: no sweep, the plain colour.

### 15. Every material has its fallbacks, and they come last

**Each material ships an opaque baseline, then the material inside `@supports`, then its `prefers-reduced-transparency`, `prefers-contrast: more` and `forced-colors` rules — after every theme block that sets the same properties.** The order is the law: opaque first makes the non-supporting path the default, and so the tested one; preferences re-declare the same properties at the same specificity, so a reduced-transparency block above the dark-theme block wins in one theme only.

Reduced transparency needs both halves, an opaque surface *and* no filter: filter only leaves a thin tint over live content, tint only still pays for the blur. High contrast promotes the edge to a real border and leaves the surface alone; forced colours needs law 3's edge. Read the *compiled* CSS: a prefixing pipeline may treat a hand-written `-webkit-backdrop-filter` for Safari as a duplicate and drop the standard property Firefox needs — as the Glass package's own advice did to the site it documents.

→ The full fallback block, in order: `references/fallbacks-and-performance.md`

### 16. Translucency has a budget, counted in area

**A `backdrop-filter` costs its area on every frame its backdrop changes — for chrome over a scrolling page, every frame of every scroll.** The budget is a count of surfaces and a ceiling on their size, per preset (Dials). Closed menus unmount, since at `opacity: 0` or `visibility: hidden` a filtered element still pays its pass; blur radius never animates; nothing filtered sits over video. Transitioning `box-shadow` repaints every frame too: across a list, put the lifted shadow on a pseudo-element and fade its opacity.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| Content by default | Unboxed | Unboxed; a card only for one object | Unboxed; a card for one object or a named brand object |
| Cards nested in cards | Never | Never | Never |
| Translucency | Chrome only (a sticky header, a dock), or none | None on chrome or content — hairlines and opaque surfaces do the work; art only | Brand material, each use named |
| Translucent tiers | ≤ 2 (chrome, defensive) | Soften, on art only | ≤ 3 |
| Translucent surfaces on screen at once | ≤ 3, none wider than the reading measure except fixed chrome | 0, or 1 on art | ≤ 4; full-viewport only as a static overlay scrim |
| Elevation levels in use | 3: flat, floating, overlay (raised only for sticky chrome) | 4: flat, raised, floating, overlay | 4, plus at most one named decorative level |
| `elevation.flat` separates by | Space or a surface step; edges rare | Space, and hairlines between rows (`border.divider`) — never an edge round a group | Surface step or edge, per brand |
| Edge above `elevation.flat` | A `hairline.*` border | A 0.5px `border.default` ring at the head of the shadow stack; a real 1px border under `prefers-contrast: more` | A border, or a named gradient stroke |
| Floating shadow, peak layer opacity (light / dark) | 6% / 50% | 10% / 55% | 16% / 60% |
| Shadow layers on floating | Contact + 2 ambient + inset highlight | Contact + 1 ambient | Contact + 2 ambient + inset highlight |
| Dark surface lift per level (OKLCH L) | +0.05 | +0.04 | +0.06 |
| Scrim (black-toward-ground opacity, light / dark) | 32% / 56% | 40% / 60% | 48% / 64%, brand-tinted allowed |
| Scrim blur | None | None | ≤ 8px, never animated |
| Corner shape | Round; `superellipse(1.5)` as enhancement | Round | Round or `superellipse(1.5–2)` |
| Gradient strokes and glows | At most one, as the colour system's exception | None | Allowed, each named for its job |

**Translucency.** Moving up a preset trades contrast certainty, a fallback path and a filter pass per surface for atmosphere. Fluent, daily product readers gain nothing from atmosphere and lose a lot to a header dimming to mid-grey over a data table. Editorial allows it on chrome because seeing the page being read scroll under keeps the reader oriented. Product's one opening is art: its backdrop is drawn, still and carries no text, so the material costs no contrast, and keeping it there is what lets the rest of the product stay opaque.

**Edge.** A ring inside the shadow sits quieter than a border beside rows parted by hairlines and moves with the shadow as one definition; it is still law 3's edge, so the contrast swap and the transparent border for forced colours go with it.

**Levels in use.** Editorial pages mostly have nothing to pick up, so `elevation.raised` has no job; inventing one makes cards look liftable when they aren't. Product's dense screens hold draggable, sticky, floating and modal things at once. A fifth level usually means two differ too little to tell apart.

**Shadow strength.** Stronger shadows buy separation on busy screens at the cost of calm; past a point the eye reads a shadow as a shape. In every preset, if you can point at the shadow as a shadow, it's one step too strong for editorial.

**Corner shape.** A superellipse curves continuously into the edge, softer than a circular corner of the same radius; a full squircle makes small elements look swollen. As progressive enhancement, unsupported browsers round normally and nothing may depend on it.

## Building it for a project

**1. Classify every real component**, not a hypothetical list:

```
One object the reader acts on or takes in whole?         no  → unboxed on the page (law 2). Stop.
Scrolls with its neighbours, part of the page flow?      → elevation.flat. Edge or surface step. Stop.
Picked up, dragged, or stuck while content passes under? → elevation.raised
Summoned over content, dismissed on its own?             → elevation.floating  (no scrim)
Blocks everything until answered?                        → elevation.overlay   (with scrim)

Then, for raised and above, the material:
  Preset allows translucency here?                                   no  → material.opaque
  Content keeps moving under it, and seeing it helps?                no  → material.opaque
  Holds reading copy?                                                yes → material.opaque
  Carries text below text.primary over an unknown backdrop?          yes → the defensive tier
  It or an ancestor animates a transform?                            yes → split wrapper/surface, or defensive
  Over another translucent surface?                                  yes → a tier gap, or opaque
  Otherwise → material.translucent at the tier law 7 gives its backdrop.
```

**2. Build each level as a bundle**: surface from `color-and-theming` (`surface.raised`, `surface.inverse`, the dark lift from the Dials), edge from `border.default` or `border.layered` at a `hairline.*` weight, shadow per law 4 at the preset's strength, layer from `layout-and-hierarchy`'s `z.*` ladder; one shadow per level per theme.

**3. Derive the dark theme separately**: lift each surface by the dial's step, rebuild the shadow at dark opacities with a weaker highlight, and check the edge alone still separates each level from the one below.

**4. Add materials last**, fallbacks in order (law 15), counted against the budget.

**5. Measure** every text tier on every translucent surface against its worst backdrop (law 10) with `design-system-setup`'s `contrast.mjs`; the focus ring at 3:1 on each level's surface.

→ Bundle tables per preset and theme, shadow derivation and a worked example: `references/elevation-recipes.md`
→ Blur, saturation, tint, gradient strokes, glows and sheens: `references/translucent-materials.md`

## Auditing existing code

Start from the setup scan's `Shadows` and `Backdrop filters` tables, then grep for what it can't pair:

```sh
rg -n "box-shadow|shadow-\[|shadow-(sm|md|lg|xl|2xl)" src
rg -n "backdrop-filter|backdrop-blur|-webkit-backdrop" src
rg -n "prefers-reduced-transparency|prefers-contrast|forced-colors|@supports" src
rg -n "z-index|z-\[|\bz-[0-9]" src
rg -n "background-clip:\s*text|animation:.*infinite" src
rg -n "border rounded|rounded-\S+ border|border-\S+ rounded|<Card\b" src   # boxes: count per screen
```

Then collect evidence per law:

- **Boxes**, per screen: every edged or shadowed region, and what it holds. A card round a section, a list, a table or a single figure, a card inside a card, a tile per stat, a tinted strip behind a label — each is a finding. Screenshot the screen and count edges; a working screen rarely needs more than a few cards.

- **Distinct shadows**, clustered: more than levels means improvised ones; list each stray with its file.
- **Bundles** for each component above flat: a shadow with no edge, a floating shadow on a flat element, a modal without a scrim, a menu with one — each is a finding.
- **Dark theme**: does each surface lift, or just its shadow? Is the page `#000`?
- **Each filtered element**: saturation, tint, ancestors' transforms, what it can overlap, text tiers against the worst backdrop.
- **Fallbacks**: present, both halves of reduced transparency, *after* the theme blocks; the prefix in compiled CSS.
- **Budget**: filtered surfaces visible at once, any at `opacity: 0` rather than unmounted, any animated blur.

One line per finding in `## Open issues`, with evidence: *"`.search-popover` has `shadow-lg` and no border; vanishes in forced colours (3 files)."* Don't fix unless asked.

## Writing back to DESIGN.md

- **`## Surfaces`** — the bundle table (`Level | Surface | Edge | Shadow | Layer`) in the project's names, per theme where surface or shadow differs, plus a material table (`Tier | Blur | Saturate | Tint | Fallback | Used on`) if it uses translucency. Write it on first build or audit; update it as levels change.
- **`## Decisions`** — dials moved off the preset, with reason and date: *"Translucent header on the docs area despite `product`: it scrolls over diagrams readers need to keep in view."* Laws knowingly broken, with the user's confirmation.
- **`## Open issues`** — audit findings, one line each with evidence; remove each when fixed.
- **Proposed roles** — level surfaces the canonical list lacks (`surface.floating`, `surface.overlay`), marked `proposed`.

## Checklist

- [ ] Sections, lists, tables and figures sit on the page; a card holds exactly one object, and no card holds a card.
- [ ] Several objects of one kind, or a rail's topics, share one card parted by dividers; asides are a ruled note, not a tinted box.
- [ ] Each surface on one `elevation.*` level, chosen by what it does, bundle and `z.*` included.
- [ ] No borrowed parts: a lifted hover or drag moves the whole bundle, layer included.
- [ ] Every dialog, destructive confirmations included, is the system's dialog; closing one returns focus to its opener, stored when it opened from state.
- [ ] Every level in the ladder is used.
- [ ] Above `elevation.flat`, an edge (`border.default` opaque, `border.layered` translucent) that survives `forced-colors`; a ring edge becomes a 1px border under `prefers-contrast: more`.
- [ ] `elevation.flat`: edge or surface step, never a faint shadow.
- [ ] Shadows: contact plus ambient, negative spread, one light; no contact layer on transient surfaces.
- [ ] One shadow definition per level per theme, used everywhere.
- [ ] Shadow strength set by what's immediately behind; on a tinted ground, its hue.
- [ ] Dark levels each lighter than the one below; page not `#000`.
- [ ] Translucency only where content continues underneath and seeing it helps, or on still art; never cards, rows, sections, reading copy, flat backdrops.
- [ ] Blur set by backdrop uncertainty, always with `saturate()`.
- [ ] Animating wrapper and filtered surface are separate, or the tint is defensive.
- [ ] Translucent-surface text measured against the tint over the worst backdrop.
- [ ] Overlapping translucent surfaces at visibly different tiers.
- [ ] `elevation.overlay` has a `scrim`; `elevation.floating` does not.
- [ ] Resizing gradients use pixel stops; strokes use `background-origin: border-box`.
- [ ] Glows side-weighted; sheens run once and are removed.
- [ ] Opaque baseline, `@supports`, then reduced-transparency (tint and filter), high-contrast, forced-colours — after every theme block.
- [ ] Compiled CSS has both `backdrop-filter` and `-webkit-backdrop-filter`.
- [ ] Closed filtered surfaces unmount; no animated blur; nothing filtered over video.
- [ ] Translucency, tier count and on-screen budget match the dials.
- [ ] Level count, shadow strength, dark lift and scrim match the dials, or a decision says why.
- [ ] Corner shape matches the dial; nothing depends on `corner-shape` support.
