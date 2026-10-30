# Canonical roles

The shared vocabulary every skill in the adaptable set speaks. A role is a *job* a value does — "the colour secondary text is", "how long a popover takes to open" — never a value, and never a name a project has to adopt.

`DESIGN.md` is where the two meet: each row maps a canonical role to **the name this project already uses** for it, and to its value. The skills reason in roles and write code in the project's names. A project that calls its lowest text tier `whisper` keeps calling it `whisper`; the skills just know that `whisper` is `text.tertiary`.

Three rules for the mapping:

1. **Not every role needs a row.** A project with no dark theme has no dark column. A product without prose has no `lead`. Leave a role out rather than inventing a value for it; the skills treat a missing role as "not in this system", not as an error.
2. **A project may have more roles than this list.** Record them as *project roles* under the nearest canonical one — a portfolio's `keyline` is a project role under `body`, separated by weight. The skills will ask what signal separates it from its parent, because that is the question that keeps extra roles honest.
3. **Two canonical roles may share one project token** only where this file says they can. Everywhere else, a shared token is a finding: it means two jobs are coupled, and changing one will silently change the other.

---

## Type

Sizes, leading, tracking and weight all hang off these. Owned by `typographic-system`.

| Role | Job |
|---|---|
| `type.display` | The one oversized moment on a marketing or landing page. Absent in most editorial and product systems |
| `type.title` | The page's `h1` |
| `type.heading` | Section headings, `h2` |
| `type.subheading` | `h3` and below |
| `type.lead` | An opening paragraph set apart from the body |
| `type.body` | Running reading copy |
| `type.supporting` | A standfirst, a dek, a description under a title — reading copy one tier quieter |
| `type.ui` | Control text: buttons, menu rows, inputs, tabs |
| `type.label` | Tags, badges, field labels, micro-labels |
| `type.meta` | Dates, captions, counts, read times, footnotes |
| `type.code` | Inline and block code |
| `type.data` | Numerals that must align — tables, prices, stats. Often `type.ui` or `type.body` plus tabular figures rather than its own size |

Families: `family.text`, `family.display` (only if different), `family.mono`.
Weights: `weight.regular`, `weight.strong`. Two optional ones, each only where the preset allows it: `weight.medium`, a middle weight for dense UI where a project records a job the other two can't carry, and `weight.display`, the display tier's own weight, never reused below it.

## Colour

Owned by `color-and-theming`. Every colour role has a value per theme.

**Text** — a strictly descending ladder, each tier clearing 4.5:1 on the worst surface it lands on:

| Role | Job |
|---|---|
| `text.primary` | Headings, body, the active state |
| `text.secondary` | Supporting copy, inactive-but-readable UI |
| `text.tertiary` | The lowest readable tier: meta, placeholders that carry meaning, timestamps |
| `text.inverse` | Text on an inverted surface (a tooltip, a filled button) |
| `text.on-accent` | Text on the accent colour |
| `text.link` | Only if links differ from surrounding text. Many systems leave this out on purpose |

A project may slot extra tiers between secondary and tertiary (the Glass package has `muted` and `quiet` there). Each extra tier must be distinguishable from its neighbours *and* clear 4.5:1 — which is the constraint that usually limits a light theme to four or five.

**Icons** have no tier of their own: they take the tier of the label they sit beside, or one below it.

**Surfaces:**

| Role | Job |
|---|---|
| `surface.page` | The page background |
| `surface.subtle` | A secondary page region — a sidebar, a footer band |
| `surface.raised` | A component's own surface — a card, an input, a menu |
| `surface.hover` | That surface, hovered |
| `surface.pressed` | That surface, pressed or active |
| `surface.selected` | A persistent selected state — distinct from hover |
| `surface.floating` · `surface.overlay` | A floating or modal level's own surface, where it differs from `surface.raised` — usually only in dark themes, where elevation is shown by lightening |
| `surface.inverse` | Tooltips, toasts, solid-filled chrome |

**Lines and fills:**

| Role | Job |
|---|---|
| `border.default` | The edge of an object — a card, an input |
| `border.control` | The edge of an input or control, which must reach 3:1 to be seen as interactive. May share a token with `border.default` only if that already reaches 3:1 |
| `border.hover` | That edge, hovered or emphasised |
| `border.divider` | A rule between groups inside one object or column. May share a token with `border.default` |
| `border.layered` | A border or divider on an unknown or translucent backdrop — must be translucent itself |
| `fill.strong` | A solid fill: a filled button, a marker, a toggle's on state |
| `fill.strong-hover` | That fill, hovered |
| `mark` | Decorative marks with no text: bullets, dots, inactive rail markers. Not held to text contrast |

**Signal:**

| Role | Job |
|---|---|
| `focus` | The focus ring. Must hit 3:1 against every surface it can land on |
| `accent` · `accent.hover` | The brand or action colour, if the system has one, and its hovered state. `accent` may share a token with `focus` |
| `status.danger` · `status.warning` · `status.success` · `status.info` | Each a pair — `status.<name>.fg`, a foreground that clears 4.5:1 as text, and `status.<name>.bg`, a background tint — plus `status.<name>.solid` where a filled control needs it (a destructive button). Required in product systems, usually absent in editorial ones |
| `exception.<name>` | A deliberate chromatic spend outside the accent — one per system in editorial, a few in expressive; in product none by default, plus one hue family per question the reader can't answer at a glance, named `exception.<question>.<member>` (`exception.type.task`, `exception.area.<name>`, `exception.person.<n>`), each listed in `DESIGN.md`. Always named after what it's *for* |

## Layout

Owned by `layout-and-hierarchy`.

| Role | Job |
|---|---|
| `measure.reading` | The width of running text |
| `measure.wide` | Content that isn't prose but should still align — grids, tables |
| `measure.app` | An application shell's content area, if there is one |
| `measure.frame` | The wider frame that the reading column and its rails are both anchored to, so the gap between them holds as the window grows |
| `measure.rail` | The width of a rail in the outer margin — a table of contents, an aside |
| `gutter` | Horizontal page padding at the smallest width |
| `space.tight` | Inside a group — a label and its value, items in a list |
| `space.group` | Between groups inside a section |
| `space.section` | Between sections |
| `space.heading-above` · `space.heading-below` | The asymmetric pair around a heading. Their *ratio* is the rule, not their values |
| `radius.pill` · `radius.small` · `radius.control` · `radius.card` · `radius.container` | Smallest to outermost. Nested radii obey inner = outer − padding |
| `hairline.chrome` · `hairline.object` · `rule.emphasis` | Divider weight inside chrome, the edge of an object, and a deliberate heavy rule (a quote bar, a focus ring) |
| `z.below` · `z.raised` · `z.popover` · `z.dismiss` · `z.nav` · `z.overlay` · `z.toast` · `z.skip-link` | The stacking ladder, low to high. `z.toast` sits over modals, because a notification about a modal's action must not hide behind it |
| `bp.<name>` | Breakpoints, named for what changes at them, not for devices |

## Surfaces and depth

Owned by `surfaces-and-depth`.

| Role | Job |
|---|---|
| `elevation.flat` | In the page — separated by a border or a surface step, no shadow |
| `elevation.raised` | Lifted slightly — a card that can be picked up, a sticky header |
| `elevation.floating` | Over content, dismissable — menus, popovers, hover cards |
| `elevation.overlay` | Over everything, modal — dialogs, sheets |
| `material.opaque` | A solid surface |
| `material.translucent` | A see-through surface, if the system uses them at all. Tiers, when there are several, are named by how little is known about the backdrop: `.soften` (a backdrop meant to stay recognisable), `.chrome` (content scrolling under fixed chrome), `.defensive` (anything, including other glass) |
| `scrim` | The dimming layer behind a modal |

Each elevation level is a *bundle* — a surface, an edge, a shadow and a z-layer. The skill checks the bundle, not the parts.

## Motion

Owned by `interface-motion`.

| Role | Job |
|---|---|
| `duration.instant` | 0 — press feedback, focus rings |
| `duration.micro` | Opacity and colour on hover |
| `duration.state` | Small state changes: colour, background, icon swaps, small transforms |
| `duration.popover` | Something small appearing: a hover card, a menu, a chevron |
| `duration.overlay` | Something large appearing or collapsing: a sheet, a region, a reveal |
| `duration.route` | A page transition |
| `duration.theme` | Every colour on the page changing at once |
| `ease.standard` | The one curve almost everything uses |
| `ease.colour` | For colour-only interpolation, where an overshooting curve would wobble |
| `ease.exit` · `duration.exit` | Only if exits deliberately use a different curve, or a duration of their own rather than a shorter tier |
| `ease.floor` | A curve that never passes its target, for tracks carrying a property that can't go below zero (blur, scale to nothing) when `ease.standard` overshoots |
| `spring.<character>` | Springs named by how they feel — `snappy`, `soft`, `playful` — never by their numbers |

`duration.*` values must increase with the size of the change. That is the one rule a project can't rename away.
