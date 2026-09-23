---
name: surfaces-and-depth
description: Decide how a surface says where it sits — flat in the page, raised, floating over content, or modal — and build each level as one bundle of surface, edge, shadow and stacking layer. Covers layered shadows that model one light, why dark themes lift surfaces by lightening them, scrims, gradient strokes and glows, and translucency as one optional material among several: when it earns its place, how blur, saturation and tint keep it legible, and the reduced-transparency, high-contrast, forced-colours and no-support fallbacks every material needs. Applies these rules in the project's own tokens via DESIGN.md. Use when building or reviewing cards, sticky headers, menus, popovers, tooltips, dialogs, sheets or drawers; choosing or tuning shadows; when depth looks flat, muddy or inconsistent; when dark mode loses its layers; when deciding whether a surface should be translucent at all; when text over one fails contrast; or when adding any backdrop-filter or elevation fallback.
---

# Surfaces and Depth

Every surface on a screen makes a claim about where it sits. A table row claims to be part of the page. A sticky header claims content is passing under it. A menu claims it arrived over the page and will leave again; a dialog claims nothing else can be touched until it is answered. Depth is how the interface makes those claims visibly, and a surface whose depth contradicts its behaviour is lying to the reader — a dialog that looks like a menu, a card that looks like it floats but scrolls with the page.

The organising idea is that **elevation is a small, named ladder, and each level is a bundle**: a surface colour, an edge, a shadow and a stacking layer, chosen together and applied together. Shadows, borders and z-indices are not independent knobs; they are four spellings of one fact. Translucency is a *material* a level can be made of, one option among several, and most surfaces in most systems should never use it.

This skill works in the project's own names. It reasons about `elevation.floating` and `border.layered`; the code it writes uses whatever `DESIGN.md` maps those roles to.

## Before you start

Read `DESIGN.md` at the project root — its `## Profile` and its `## Surfaces` section. They give you the preset (and any areas of the project on a different one), the project's own name for every role this skill talks about, and the decisions already made. Work in those names: this skill says `text.secondary`; the code you write says whatever `DESIGN.md` maps `text.secondary` to.

- **No `DESIGN.md`?** Don't stop. Run a narrow pass of the `design-system-setup` skill for this domain only — scan, map the roles you need, pick the preset from what the reader is doing — do the task, and recommend running the full setup afterwards.
- **A role you need has no row?** Look for a value already doing that job before inventing one. If you have to add one, name it in the project's style and record it in `DESIGN.md`.
- **The task would break a law, or move a dial off its preset?** Say so and ask. If the user confirms, do it, and record the decision with its reason under `## Decisions`.
- **The file names the `glass` preset?** The values are in `DESIGN.md`; the `glass-and-depth` skill, if installed, has the exact recipes and components behind them.

Boundaries: the radius ladder and nesting rule, hairline weights and the z-index ladder belong to `layout-and-hierarchy`; the colours of every surface, edge and tint — and why translucent tints are runtime values — belong to `color-and-theming`; the timing of anything that lifts, glows or opens belongs to `interface-motion`. This skill decides which of them a surface takes, and checks that they agree.

## Laws

### 1. Elevation is a named ladder of bundles, and a level is applied whole

**Every surface sits on exactly one level — `elevation.flat`, `.raised`, `.floating` or `.overlay` — and takes that level's surface, edge, shadow and z-layer together.** The level is chosen by what the thing *does*, not by how important it feels: in the page flow is flat; picked up, dragged or stuck while content passes under is raised; summoned over content and dismissed on its own is floating; blocking until answered is overlay.

Mixing parts across levels is the bug this ladder exists to prevent. A card given the menu's shadow on hover, without the menu's layer, casts a floating shadow that the next card in the grid paints straight over — later siblings sit above earlier ones — so the lift is visibly clipped on one side. A state change may move an element to another level, but as a whole bundle: a dragged card becomes floating, surface, edge, shadow and layer at once. A hover that deepens a raised card's shadow is that level's own hover state, defined beside it, not a borrowed part.

The ladder is small and every rung is used. In the Glass package a fourth translucent tier was defined for "a menu over a surface you already know", and nothing ever used it: every real menu needed the heavier tier. Dead rungs are worse than absent ones — the next person assumes they are load-bearing and reasons about a system that never existed.

### 2. Depth needs an edge as well as a shadow

**Any surface above `elevation.flat` has an edge that says where it ends, not only a shadow that says it is above.** A shadow is a soft gradient; it cannot draw a boundary. Without an edge the surface's outline is mush, worst in dark themes, where the shadow has almost no headroom to work with.

The edge is `border.default` on an opaque surface and `border.layered` — itself translucent — on a translucent one or on any backdrop the surface doesn't control. A solid grey edge on a see-through surface is the one part not responding to what's behind it, and over a photograph it reads as a pasted-on frame. Weights come from `hairline.*` in `layout-and-hierarchy`.

The edge is also what survives the user's preferences. In `forced-colors` mode the browser drops every `box-shadow`; a card defined by shadow alone simply vanishes into the page. A surface whose design wants no visible edge still carries `1px solid transparent`, because forced colours paint transparent borders in the system text colour. `elevation.flat` is the one level with no shadow at all: it separates by an edge or a surface step, never by a faint shadow pretending to be a border.

### 3. A shadow models one light, in layers, and lives in one definition

**A shadow is a contact layer plus one or two ambient layers from a single light above, with negative spread, felt rather than seen.** The contact layer — tight, 1px, very faint — is what makes a surface look *resting on* something rather than pasted over it. Two ambient layers fall off like a real penumbra where one large blur reads as fog. Negative spread contracts each layer before blurring, so it stays tucked under the element instead of haloing past its edges; its absence is why stock shadow presets look like glows. An optional inset top highlight is the catch light where a raised face meets the light, and does more for the floating impression than any drop layer.

Higher levels get more and longer layers; a transient one gets fewer. A tooltip that lives for half a second drops the contact layer — it hovers, it doesn't rest.

A shadow's strength is set by **what is immediately behind the surface**, not by the theme. A tooltip on `surface.inverse` needs the same strong shadow in both themes, because its own surface, not the page, is what the shadow has to separate. And on a tinted ground the shadow takes the ground's hue, darkened: neutral black under a card on a warm cream page reads as dirt.

A layered shadow is the most-copied and least-eyeballable value in a system — nobody spots a `0.04` that became `0.05` in one of five copies. **It has one definition per level, extracted the moment it appears twice**, and every use points at it.

### 4. Dark themes lift surfaces by lightening them, not only by darkening shadows

**In a dark theme each level above the page is a lighter surface than the one beneath it; the shadow is a secondary cue.** "Raised" means "more contrast against the page", and the direction flips: in light themes a raised surface is the same or slightly darker than the page, in dark themes it is lighter. A black shadow on a near-black page has nowhere to go, so a dark theme that only strengthens its shadows ends up with every level looking like the page.

The dark shadow is a *different* recipe, not a re-tint. Drop layers need roughly ten times the opacity to register at all; an inset highlight needs a fraction of its light-theme strength, or it reads as a glowing wire. Because the structure changes, the shadow is a per-theme pair of definitions. And the dark page is never pure black: `#000` gives shadows nothing to sit on and leaves the surface step as the only cue.

In the Glass package the dark chrome tint is lighter than the dark page for exactly this reason, and its shadow opacities run from 2–6% in light to 30–60% in dark.

### 5. Translucency has to be earned, and usually isn't

**A translucent surface claims that content continues underneath and that seeing it helps. Where either half is false, the surface is opaque.** The claim is true for chrome that content scrolls under, and for a floating layer whose context the reader benefits from keeping in view. It is false almost everywhere else.

When not to use translucency:

- **A page section, a panel, a sidebar in the flow.** It isn't floating; it's the page.
- **A card in a grid or a row in a list.** Nothing meaningful is behind it, and one filter per row is the worst cost profile there is.
- **Anything holding reading copy** (law 9).
- **Over a flat, single-colour backdrop.** The blur has nothing to reveal; you pay for a filter to produce a plain tint. Use the tint.
- **Where the content behind must stay readable.** That wants a shadow and an opaque surface beside the content, not a blur over it.
- **Over video, canvas or anything animating** — the filter re-runs every backdrop frame.
- **Because the preset doesn't allow it** (Dials). Product interfaces are fluent tools; borders and opaque surfaces do the work, and translucency there is decoration that costs contrast.

The Glass package — a system built around the material — uses it in four places, all floating chrome. Everything else is opaque. That ratio is the ceiling, not the target.

### 6. Blur scales with uncertainty about the backdrop

**Blur radius is set by how little you know about what's behind the surface, not by its size or importance.** Softening a backdrop you *want* recognised — a frosted pocket with cards visible behind — takes a small blur. Fixed chrome that arbitrary content scrolls under takes a medium one. A surface that can land over anything, including other translucent surfaces, takes the most defensive blur and a near-opaque tint.

| Tier | Blur | Saturate | Tint opacity | Backdrop |
|---|---|---|---|---|
| Soften | 6–10px | 1.2–1.4 | 35–60% | Content you want recognised |
| Chrome | 16–24px | 1.6–1.8 | 70–80% | Arbitrary content passing under |
| Defensive | 20–28px | 1.6–1.8 | 92–97% | Anything, including other translucent surfaces |

These are role-tier ranges, not dial values; the preset decides which tiers exist (Dials). Radius buys little performance — cost scales with area — so don't trim blur to save frames.

### 7. Blur needs saturation

**Every `backdrop-filter` blur carries a `saturate()` correction.** Blur averages neighbouring pixels, and the average of varied colours is nearer grey than any of them, so a blurred backdrop is always duller than the original and duller the more you blur. Blur plus a pale tint and nothing else is the cloudy, slightly dirty wash the word "glassmorphism" describes. The saturation boost runs in the same filter pass and costs nothing.

Lower where you're softening a backdrop that is itself the subject — over-saturating it makes the pocket louder than its contents. Above about 2.0, colours turn radioactive.

### 8. When the blur can't be relied on, the tint carries legibility

**A translucent surface is legible from its tint alone; the blur is a bonus.** A `transform`, `filter`, `perspective`, `contain: paint` or `will-change` on an ancestor weakens or breaks `backdrop-filter` in its subtree — and a menu whose wrapper scales open is exactly that, for the whole animation. A 72% tint whose blur has failed is unreadable over a busy page.

Fix it structurally where you can: the element that animates and the element that filters are different elements, with the filtered one never transformed. Where you can't, thicken the tint. In the Glass package the floating panel runs at 97% for this reason. The same ancestors also capture `position: fixed` descendants — two symptoms of one cause, so check the whole ancestor chain when a filtered or fixed element misbehaves.

### 9. Text on a translucent surface is checked against the worst backdrop

**The contrast of text on a translucent surface is the ratio against the tint composited over the lightest *and* the darkest backdrop it can land on — never against the tint as if it were opaque.** A 72% near-white tint composites to near-white over a white page and to mid-grey over a dark photograph; the same `text.tertiary` that clears 5.1:1 on the first manages 2.6:1 on the second, and the page scrolls it from one to the other. Recording the opaque-tint number as a pass documents a fiction.

Three ways to make the number true, in order: raise the tint until it is effectively opaque behind text (at 95% the backdrop contributes a few per cent); put only `text.primary`, and icons at their label's tier, on a chrome-tier surface over arbitrary content — at 72% over a dark image even `text.secondary` drops to about 4.2:1; keep reading copy off translucent surfaces entirely.

→ The compositing arithmetic and a worked check: `references/translucent-materials.md`

### 10. Translucency over translucency needs a tier gap

**Where one translucent surface overlaps another, the upper one is a visibly different tier — much heavier tint, or opaque.** Stacked blurs don't compose: the upper filter samples the lower one's already-filtered output, and the result depends on stacking contexts and the browser. And two surfaces at the same tint read as one object — a panel opening over a translucent dock at the dock's tint looks like the dock grew taller. At most one meaningful blur in any vertical stack.

### 11. A scrim says "modal", and only modal

**`elevation.overlay` brings a `scrim`; nothing below it does.** The scrim is what tells the reader the rest of the interface is paused. A floating menu with a dimmed backdrop claims to be modal and isn't; a dialog without one looks like a menu that won't close. A floating layer's outside-click catcher is transparent.

The scrim darkens toward the ground's hue, and it has to be stronger in dark themes, where dimming a near-black page barely registers — which is why the overlay's own surface step (law 4) does most of the separating there. A blurred scrim is a full-viewport filter, the most expensive surface there is; it is allowed only where the preset allows it, and never animates its blur radius.

### 12. Gradients on anything that resizes are anchored in pixels

**A gradient stroke or fill on an element that changes size places its stops in absolute units, and a gradient stroke is two background layers on one box.** Percentage stops rescale with the box: in the Glass package a panel opening from a 46px bar to 250px ran its whole navy-to-pale sweep inside the closed bar — louder closed than open — and shimmered through the animation as the ramp re-fitted every frame. Anchored at `0px / 120px / 240px`, the top holds still and the colour grows downward.

The stroke itself needs no wrapper and no mask: a transparent border, a fill layer clipped to `padding-box`, a gradient layer clipped to `border-box`, and `background-origin: border-box` — without which the gradient is sized to the padding box and every side gets the wrong end of the ramp, a result that looks almost right.

### 13. Light is emitted from the sides and passes once

**A coloured glow is weighted to the sides so it reads as emission; a sheen crosses once and then stops.** A single centred coloured shadow reads as a drop shadow that happens to be blue. Two horizontal casts plus a small one below, all with negative spread, read as light coming off the surface. If the glow reports a state — hovered, open — it holds for as long as the state does.

A sheen that loops claims the thing is still working. Run it once, then remove it: `background-clip: text` with transparent text left in place is a selection and forced-colours hazard. Under reduced motion, no sweep and the plain colour.

### 14. Every material has its fallbacks, and they come last

**Each material ships an opaque baseline, then the material inside `@supports`, then its `prefers-reduced-transparency`, `prefers-contrast: more` and `forced-colors` rules — after every theme block that sets the same properties.** The order is the law. Opaque first means the path a non-supporting browser takes is the default, and so the tested one. Preferences last, because they re-declare the same properties at the same specificity and source order decides; a reduced-transparency block above the dark-theme block wins in one theme only.

Reduced transparency has two halves and each is useless alone: swap the tint for an opaque surface *and* drop the filter. Filter only leaves a thin tint over live content — worse than before. Tint only still pays for the blur. High contrast promotes the edge to a real border and leaves the surface alone. Forced colours needs the edge from law 2.

Check the *compiled* CSS for the prefix. Safari still wants `-webkit-backdrop-filter`, but a pipeline that prefixes for you (Lightning CSS, which Tailwind v4 uses; Autoprefixer) may treat a hand-written prefixed line as a duplicate and keep only the last declaration — shipping the prefixed property alone, which Firefox ignores. The Glass package's own advice to hand-write the prefix produced exactly this on the site it documents: every translucent surface lost its blur in Firefox, invisibly everywhere else.

→ The full fallback block, in order: `references/fallbacks-and-performance.md`

### 15. Translucency has a budget, counted in area

**A `backdrop-filter` costs its area on every frame its backdrop changes — which, for chrome over a scrolling page, is every frame of every scroll.** The budget is a count of surfaces and a ceiling on their size, per preset (Dials). Closed menus unmount: a filtered element at `opacity: 0` or `visibility: hidden` still pays its pass. Blur radius never animates. Nothing filtered sits over video.

Shadows have a smaller version of the same rule: transitioning `box-shadow` repaints every frame. On one element that's fine; on every row of a list, put the lifted shadow on a pseudo-element and fade its opacity.

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| Translucency | Chrome only (a sticky header, a dock), or none | None — borders and opaque surfaces do the work | Allowed as brand material, each use named |
| Translucent tiers | ≤ 2 (chrome, defensive) | 0 | ≤ 3 |
| Translucent surfaces on screen at once | ≤ 3, none wider than the reading measure except fixed chrome | 0 | ≤ 4; full-viewport only as a static overlay scrim |
| Elevation levels in use | 3: flat, floating, overlay (raised only for sticky chrome) | 4: flat, raised, floating, overlay | 4, plus at most one named decorative level |
| `elevation.flat` separates by | Space or a surface step; edges rare | `border.default` | Surface step or edge, per brand |
| Floating shadow, peak layer opacity (light / dark) | 6% / 50% | 10% / 55% | 16% / 60% |
| Shadow layers on floating | Contact + 2 ambient + inset highlight | Contact + 1 ambient | Contact + 2 ambient + inset highlight |
| Dark surface lift per level (OKLCH L) | +0.05 | +0.04 | +0.06 |
| Scrim (black-toward-ground opacity, light / dark) | 32% / 56% | 40% / 60% | 48% / 64%, brand-tinted allowed |
| Scrim blur | None | None | ≤ 8px, never animated |
| Corner shape | Round; `superellipse(1.5)` as enhancement | Round | Round or `superellipse(1.5–2)` |
| Gradient strokes and glows | At most one, as the colour system's exception | None | Allowed, each named for what it's for |

The `glass` preset takes its values from `glass-and-depth`.

**Translucency.** Moving it up from a preset costs contrast certainty, a fallback path to maintain, and a filter pass per surface; the reader gets atmosphere in return. Product readers are fluent and come back daily, so atmosphere buys nothing and a sticky header that dims to mid-grey over a data table costs a lot. Editorial allows it on chrome because the page underneath is the thing being read and seeing it scroll under the header keeps the reader oriented.

**Levels in use.** Editorial pages mostly have nothing that can be picked up, so `elevation.raised` has no job; inventing one produces cards that look liftable and aren't. Product needs all four because dense screens really do hold draggable, sticky, floating and modal things at once. Adding a level beyond four almost always means two levels differ by too little to tell apart.

**Shadow strength.** Stronger shadows buy separation on busy screens and cost calm: past a point the eye reads the shadow as a shape. The test in every preset is the same — if you can point at the shadow as a shadow, it's one step too strong for editorial.

**Corner shape.** A superellipse varies curvature continuously into the edge and reads softer than a circular corner of the same radius; at a full squircle small elements look swollen. It is progressive enhancement: unsupported browsers round normally, and nothing in the layout may depend on it. Radius values themselves are `layout-and-hierarchy`'s.

## Building it for a project

**1. Classify every surface with the decision flow.** Walk the interface's real components, not a hypothetical list:

```
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
  Otherwise → material.translucent at the tier law 6 gives its backdrop.
```

**2. Build each level as a bundle.** Surface from `color-and-theming` (`surface.raised`, `surface.inverse`, the dark lift from the Dials), edge from `border.default` or `border.layered` at a `hairline.*` weight, shadow per law 3 at the preset's strength, layer from the `z.*` ladder in `layout-and-hierarchy`. Write the shadow once per level per theme.

**3. Derive the dark theme separately.** Lift each level's surface by the dial's step; rebuild the shadow at dark opacities with a weaker highlight; check that the edge alone still separates each level from the one below.

**4. Add materials last, with their fallbacks in order** (law 14), and count them against the budget.

**5. Measure.** Every text tier on every translucent surface against its worst backdrop (law 9), with `design-system-setup`'s `contrast.mjs`; the focus ring at 3:1 on every level's surface.

A fictional example: **Tally**, an invoicing app on `product`, with `app/(marketing)/**` on `expressive`. Its tokens already call surfaces `canvas` and `panel` and its edge `line`. The app gets four opaque levels and no translucency; the marketing header gets one chrome tier.

```css
:root {
  --elevation-raised:   0 1px 1px rgb(20 20 30 / 0.04), 0 2px 6px -2px rgb(20 20 30 / 0.06);
  --elevation-floating: 0 1px 1px rgb(20 20 30 / 0.05), 0 12px 24px -8px rgb(20 20 30 / 0.10);
  --elevation-overlay:  0 1px 1px rgb(20 20 30 / 0.06), 0 24px 48px -12px rgb(20 20 30 / 0.16);
  --scrim: rgb(20 20 30 / 0.40);
}
[data-theme="dark"] {
  --color-panel:        oklch(0.25 0.01 270);   /* canvas is 0.21; each level +0.04 */
  --color-panel-float:  oklch(0.29 0.01 270);   /* proposed: surface.floating */
  --elevation-floating: 0 1px 1px rgb(0 0 0 / 0.40), 0 12px 24px -8px rgb(0 0 0 / 0.55);
  --scrim: rgb(0 0 0 / 0.60);
}
```

In Tailwind v4 these become utilities with `@theme inline { --shadow-floating: var(--elevation-floating); }`, so the utility follows the runtime value per theme; in a v3 config, `boxShadow: { floating: 'var(--elevation-floating)' }`; in a JS theme object, `shadows.floating: 'var(--elevation-floating)'`. The theme-varying value stays a runtime custom property in every case.

→ Bundle tables for all three presets, light and dark, and shadow derivation: `references/elevation-recipes.md`
→ Blur, saturation, tint, gradient strokes, glows and sheens: `references/translucent-materials.md`

## Auditing existing code

Start from the `Shadows` and `Backdrop filters` tables in the setup scan, then grep for what the scan can't pair up:

```sh
rg -n "box-shadow|shadow-\[|shadow-(sm|md|lg|xl|2xl)" src
rg -n "backdrop-filter|backdrop-blur|-webkit-backdrop" src
rg -n "prefers-reduced-transparency|prefers-contrast|forced-colors|@supports" src
rg -n "z-index|z-\[|\bz-[0-9]" src
rg -n "background-clip:\s*text|animation:.*infinite" src
```

Then collect evidence for each law:

- **Distinct shadows**, clustered. More distinct shadows than levels means levels are being improvised; list each stray with its file.
- **Bundles**: for each component above flat, record surface, edge, shadow and layer. A shadow with no edge, a floating shadow on a flat element, a modal without a scrim, a menu with one — each is a finding.
- **Dark theme**: does each level's surface actually lift, or only its shadow change? Is the page `#000`?
- **Every filtered element**: its saturation, its tint opacity, its ancestors' transforms, what it can overlap, and the text tiers on it measured against the worst backdrop.
- **Fallbacks**: present, complete (both halves of reduced transparency), and *after* the theme blocks. Read the compiled CSS for the prefix.
- **Budget**: filtered surfaces visible at once, any at `opacity: 0` rather than unmounted, any animated blur.

Report one line per finding in `## Open issues`, with the evidence: *"`.search-popover` has `shadow-lg` and no border; vanishes in forced colours (3 files)."* Don't fix unless asked.

## Writing back to DESIGN.md

- **`## Surfaces`** — the bundle table (`Level | Surface | Edge | Shadow | Layer`) in the project's names, per theme where the surface or shadow differs; then, if the project uses translucency, a material table (`Tier | Blur | Saturate | Tint | Fallback | Used on`). Write it when you first build or audit the levels, and update it when a level changes.
- **`## Decisions`** — any dial moved off the preset, with a reason and date: *"Translucent header on the docs area despite `product`: it scrolls over diagrams readers need to keep in view."* Any law knowingly broken, with the user's confirmation.
- **`## Open issues`** — findings from an audit, one line each with evidence. Remove an issue when it's fixed.
- **Proposed roles** — a level surface the canonical list lacks (`surface.floating`, `surface.overlay`), marked `proposed`.

## Checklist

- [ ] Every surface sits on one `elevation.*` level chosen by what it does, and takes that level's surface, edge, shadow and `z.*` together.
- [ ] No borrowed parts: a lifted hover or a drag moves the whole bundle, including the layer.
- [ ] Every level in the ladder is used; no dead rungs.
- [ ] Every surface above `elevation.flat` has an edge — `border.default` opaque, `border.layered` translucent — and survives `forced-colors`.
- [ ] `elevation.flat` uses an edge or a surface step, never a faint shadow.
- [ ] Shadows are layered — contact plus ambient, negative spread, one light — and a transient surface drops the contact layer.
- [ ] Each level's shadow has one definition per theme, used everywhere.
- [ ] Shadow strength follows what's immediately behind; on a tinted ground the shadow takes its hue.
- [ ] In dark themes each level's surface is lighter than the one below; the page is not `#000`.
- [ ] Translucency appears only where content continues underneath and seeing it helps — never on cards, rows, sections, reading copy or flat backdrops.
- [ ] Blur is set by backdrop uncertainty, and every blur carries `saturate()`.
- [ ] Animating wrapper and filtered surface are separate elements, or the tint is defensive.
- [ ] Text tiers on translucent surfaces are measured against the tint over the worst backdrop.
- [ ] Overlapping translucent surfaces sit at visibly different tiers.
- [ ] `elevation.overlay` has a `scrim`; `elevation.floating` does not.
- [ ] Gradients on resizing elements use pixel stops; gradient strokes use `background-origin: border-box`.
- [ ] Glows are side-weighted; sheens run once and are removed.
- [ ] Opaque baseline, then `@supports`, then reduced-transparency (tint and filter), high-contrast and forced-colours, after every theme block.
- [ ] The compiled CSS carries both `backdrop-filter` and `-webkit-backdrop-filter`.
- [ ] Closed filtered surfaces unmount; no animated blur; nothing filtered over video.
- [ ] Translucency, tier count and on-screen budget match the preset's dials.
- [ ] Level count, shadow strength, dark lift and scrim match the preset's dials, or a decision records why not.
- [ ] Corner shape matches the dial and nothing depends on `corner-shape` support.
