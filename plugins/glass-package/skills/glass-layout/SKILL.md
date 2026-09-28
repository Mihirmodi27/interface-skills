---
name: glass-layout
description: "The exact layout system from modimihir.com — the Glass package, to copy as-is. One shared reading measure, margin rails, asymmetric spacing that groups, nested radii with continuous corners, a z-index ladder, forked touch and reader-chosen presentations, disclosures that hide rather than unmount, and content gating instead of empty states. Use when laying out pages, setting a content width, spacing sections, choosing border radii or hairline weights, building sticky sidebars or tables of contents, offering two views of one collection, deciding what changes between desktop and touch, ordering stacking contexts, building collapsible sections that must stay crawlable, handling empty states, or reviewing a layout that feels cramped, arbitrary, or inconsistently spaced."
---

# Glass Layout

> **Glass package.** This is the layout system running on [modimihir.com](https://modimihir.com), with its real values, meant to be copied whole. For the same principles fitted to your project's own names, values and character, use `layout-and-hierarchy` from the adaptable set. When both are installed and the project's `DESIGN.md` names a preset other than `glass`, that skill leads and this one is only a worked example.

For mostly-text interfaces, where layout should get out of the way. One decision drives the rest: **a single 640px reading measure on every page**, so moving between pages never moves the text.

## 1. One measure

```css
.col {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 32px;
}
```

At most 576px of text, roughly 75–85 characters at 16px: the top of comfortable, right for sustained reading. **Every page uses the class**, for *continuity*: a home-page summary opening into its long version doesn't shift, reading as expansion, not a new document.

- **Non-text content may leave the column**: a masonry image wall has no reading measure, so it goes full-bleed.
- **An article's cover image stays in it.** Bled wide, it becomes a banner *above* the article, not part of it.
- **Dividers are column width.** A viewport-wide hairline separates *the page*; a column-wide one separates *the content*.

## 2. Rails live outside the column, anchored to a wider frame

```tsx
<div className="relative mx-auto max-w-[1280px]">
  {/* Absolute, so it sits outside the reading column entirely */}
  <div className="absolute inset-y-0 left-8 hidden w-[196px] xl:block">
    <div className="sticky top-28 max-h-[calc(100dvh-11rem)] overflow-y-auto">
      <SectionNav … />
    </div>
  </div>

  <div className="col">{/* the reading column, untouched */}</div>
</div>
```

Rail and column share one centred 1280px frame, so their gap **holds steady from 1280px up** (1600px, 2400px); a viewport-positioned rail drifts from its content.

- **`absolute` + a `sticky` child.** The wrapper spans the section, giving the sticky child a track; sticky alone in a flex row needs its own column, pushing the text off-centre.
- **`max-h-[calc(100dvh-11rem)]` + `overflow-y-auto`.** A long list scrolls inside itself. `dvh`, not `vh`, which ignores mobile chrome changing the viewport height.
- **`xl:block`.** Below 1280px there's no margin; it becomes a disclosure above the text (§6).

## 3. Spacing groups; asymmetry is the mechanism

Equal space either side of an element says it belongs to neither neighbour — almost never what you mean.

```
mt-11  (44px)   ← heading
mb-3   (12px)
                ← the paragraph it introduces
```

~3.5:1 above to below makes them one unit. **The commonest spacing mistake, and the cheapest fix.** It holds at every scale:

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Heading → its paragraph | 12px below | 44px above | 3.7:1 |
| List items → the next block | 8px between | 24px below | 3:1 |
| Bio paragraphs → the links after | 16px between | 32px after last | 2:1 |
| Section heading → its content | 16–32px | 36px+ between sections | ~2:1 |

**Home sections** use `py-9` (36px each side), symmetric, since they're peers. Long pages use `mt-16 border-t pt-10` (64px, hairline, 40px): the rule marks a real change of subject.

**Not every boundary gets a rule.** Work / Experience / Life get one; Watching and Socials, a coda to Life, don't. A rhythm call, not a preference, so it lives in layout code, not config.

→ The full spacing scale and where each value is used: `references/measure-and-rhythm.md`

## 4. The radius ladder nests

```
rounded-full     pills, tags, dots
rounded-md    6  tooltips
rounded-[9px] 9  small cards in a stack
rounded-[10px]10 an avatar inside a button
rounded-xl   12  cards, hover panels, disclosures
rounded-[12px]12 icon buttons, highlight bars
rounded-2xl  16  the outer container (a dock, a sheet)
```

**Inner radius = outer radius minus the padding between.** A 16px dock with 4px padding holds 12px buttons; a 12px button with a 1px-inset avatar gives it 10px. Too large pinches; too small opens a gap at the corners.

```css
* , *::before, *::after {
  corner-shape: superellipse(1.5);
}
```

`superellipse(k)` uses exponent 2^k: k=1 is a normal round corner, k=2 a full iOS squircle, 1.5 halfway. Curvature eases into the edge rather than breaking at it — why iOS icons look softer than a same-radius CSS rectangle. Unsupported browsers get normal rounding; nothing depends on it.

## 5. Hairlines: 0.5px vs 1px

| Weight | For |
|---|---|
| `0.5px` | Chrome borders, dividers, glass edges |
| `1px` | Card borders, rings, disclosure outlines |
| `2px` | Quote rules, focus rings |
| `1px` (`h-px`) | Table-of-contents markers |

`0.5px` is a true hairline on retina and rounds up to 1px elsewhere, never vanishing. Weight follows the line's job: dividing icon groups inside one dock, 0.5px; defining a card's edge, 1px. On translucent surfaces use the **alpha ramp** (`border-gray-alpha-400`); a solid border on glass reads as a pasted-on frame (see **glass-color**).

A divider that isn't an `<hr>` gets `aria-hidden`; an `<hr>` divider needs `border-0` before its background, or you get the UA border *and* your line.

## 6. Two presentations, not one responsive layout

The most consequential idea: where pointer and touch interact differently, ship **two components**, not one with breakpoint classes.

```tsx
<nav aria-label="Primary" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <MobileDock />   {/* sm:hidden — avatar + a menu button opening a sheet */}
  <DesktopDock />  {/* hidden sm:block — hover-revealed icons, sliding highlight */}
</nav>
```

The desktop dock reveals pages and settings **on hover**, collapsing on scroll; touch fires none of it. One component would need hover and touch paths, a collapse rule for one, and settings reachable two ways.

`SectionNav` (a sticky rail) and `SectionNavCompact` (a `<details>` disclosure) likewise render one tree through a shared `Rows`: **share the data and rows; fork the container.** The test: **does the interaction model change, or just the arrangement?** Arrangement → breakpoints. Interaction model → two components.

### The same fork, chosen by the reader

Galleries offer a masonry **wall** (everything at once) or a **roll** (one photograph above a filmstrip), picked from a small dock: same data, same route.

**State lives in a module, not either component**, since the control and the page it re-lays-out are siblings:

```ts
let current: GalleryLayout = "grid";
export function setGalleryLayout(layout: GalleryLayout) {
  current = layout;
  for (const fn of listeners) fn(layout);
}
```

Both subscribe, as with theme or sound. When server-rendered, read the initial value in an *effect*, not during render, or the first paint disagrees with the markup.

**Decide whether the choice persists; default to no.** The theme persists forever; the gallery layout lives in module memory and resets to the wall as each collection mounts. *The wall shows the whole collection, what you want on arrival; the roll is somewhere you go on purpose, and neither a previous visit nor the other gallery should decide it for you.*

**The switch carries the reader's position.** Leaving a wall at photograph 60 for a filmstrip's start is worse than not switching: before the outgoing layout unmounts, find the item nearest the viewport's centre and open on it (§6 of **glass-motion**).

**Each tile declares its own aspect ratio**, so `object-cover` crops nothing and the roll's rect matches, letting one image travel between layouts undistorted; uniform boxes rule that out.

→ Adaptive presentations, capability queries, the touch-versus-hover audit: `references/adaptive-presentations.md`

## 7. Content gating: no empty states

One flag, three places:

```ts
// content/index.ts — one derivation, everything else reads it.
export const has = { writing: posts.length > 0, /* … */ };

export const sectionHasContent = { /* home-page sections */ };
/** Route path → whether it should exist. Unlisted paths always exist. */
export const routeEnabled: Record<string, boolean> = { "/writing": has.writing, /* … */ };
```

```ts
const PAGES = [
  has.experience && { to: "/experience", … },
  has.playground && { to: "/playground", … },
  has.writing    && { to: "/writing", … },
].filter(Boolean);
```

An empty collection loses its **nav icon**, **route** and **home-page entry** from one flag, so no empty state is reachable.

**On a file-based router the gate moves into the page**, since the file *is* the route; a catch-all sends the rest, old links included, somewhere real rather than to a 404:

```tsx
// app/writing/page.tsx
export default function Page() {
  if (!has.writing) redirect("/");
  return <Writing />;
}

// app/[...rest]/page.tsx — anything that isn't a real route lands somewhere real.
export default function CatchAll() {
  redirect("/");
}
```

**`routeEnabled` outlived the client router** though nothing routes by it: sitemap, metadata and nav still ask if a path exists. Which routes exist is *content*, not *routing*; as data, the router is one more consumer.

Sections drop out *before* dividers are placed, so no hairline hangs over nothing:

```tsx
const shown = site.sections.filter((name) => SECTIONS[name] && sectionHasContent[name]);
```

Layouts should look deliberate at every count:

```tsx
// One or two folders stay folder-sized and centred rather than stretching
// across a three-up grid. (640px column − gaps) ÷ 3 ≈ 200px each.
const COLS  = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3"];
const WIDTH = ["", "max-w-[200px]", "max-w-[420px]", ""];
```

One item stretched full width betrays a grid not designed for its edge cases. Tailwind scans source text, so write **literal class strings**; a computed `grid-cols-${n}` never reaches the stylesheet.

## 8. The z-index ladder

Documented, sparse, ordered by permanence:

| z | Layer |
|---|---|
| 100 | Skip link — must beat everything |
| 60 | A once-a-session overlay — over the dock, under the skip link |
| 50 | Fixed navigation |
| 40 | Tap-outside catcher — under the nav, over the page |
| 30 | A pocket front, over its own contents |
| 20 | Hover cards, dropdowns |
| 10 | A hovered item lifting above its siblings |
| −10 | A sliding highlight, behind content inside `isolate` |

The gaps are headroom: a later greeting overlay took 60 without renumbering. **40/50**: a tap-outside catcher sits *above* the page and *below* the menu it dismisses, or it eats the menu's clicks. **60/100**: a splash covers the nav (or it isn't covering the page) but never the skip link, so keyboard users can tab past a two-second greeting.

**`isolate` + negative z.** `isolate` on the container scopes a highlight bar's `-z-10`: behind the icons, not behind the parent.

**`pointer-events-none` on a full-width strip, `auto` on the content**, so the nav centres without intercepting clicks:

```tsx
<nav className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <div className="pointer-events-auto">{/* the dock */}</div>
</nav>
```

The strip carries **no transform**: that would make it the containing block for the mobile sheet's full-bleed overlay, trapping the overlay inside it.

→ Radius derivation, elevation tiers, stacking contexts: `references/radius-and-elevation.md`

## 9. Structural accessibility

Layout decisions, not a separate pass.

```tsx
<a href="#main" className="skip">Skip to content</a>
```

Parked off-screen by `transform` (never `display: none`, which drops it from the tab order), slid in on focus; every page needs `id="main"`.

- **`aria-label` on every `<nav>`** ("Primary", "On this page"), or landmark navigation is useless.
- **Heading levels follow structure, never default size**: `h1` page, `h2` sections, `h3` sub-sections, `h4` cards; two elements at 14px/500 can be `h3` and `h4`.
- **`scroll-mt` on every anchor target**, matched to the scroll spy's reading line, or after a jump the TOC lights the previous section.
- **`aria-current` on the active row**, `aria-pressed` on toggles, `aria-expanded` + `aria-haspopup` + `aria-controls` on menu triggers.
- **A menu's wrapper stays mounted while the panel unmounts**, so `aria-controls` still resolves.
- **Decorative spans get `aria-hidden`**, or a hand-rolled bullet in a real `<li>` is announced.
- **Real anchors for in-page links**, click handler on top: they work without JS and copy as links.
- **`<details>`/`<summary>`** over div and state: keyboard, `aria-expanded` and find-in-page free.

### A disclosure should hide its content, not remove it

Where a custom animation rules out `<details>`, collapse height to zero; don't unmount:

```tsx
<motion.div
  initial={false}
  animate={{ height: open ? "auto" : 0 }}
  inert={!open}
  aria-hidden={!open}
  className="overflow-hidden"
>
```

**The content stays in the served HTML.** A summary, spec table or FAQ answer that exists only after a click is lost to crawlers, `llms.txt` and find-in-page.

**`inert` makes that safe** — the part people miss. Collapsed content in the tree is still tabbable and announced, so keyboard users tab into invisible prose. `inert` removes it from tab order and accessibility tree; `aria-hidden` covers browsers without `inert`. Neither is optional, and `display: none` can't animate. Unmount only what's expensive or absent.

```css
@media print {
  nav, footer, .skip { display: none; }
  .reveal { opacity: 1; transform: none; }
  a { color: inherit; text-decoration: none; }
}
```

Print is a real presentation; forget the `.reveal` reset and scroll-triggered content prints blank.

## Assets

- `assets/layout-tokens.css` — column, spacing, radius ladder, continuous corners, hairlines, skip link, print.
- `assets/SectionNav.tsx` — two presentations of one tree, with shared row rendering.

## Checklist

- [ ] One measure, defined once, on every page.
- [ ] Full-bleed only for non-text; article covers stay in the column.
- [ ] Dividers at column width, not viewport width.
- [ ] Rails share the column's frame: `absolute` wrapper + `sticky` child.
- [ ] Sticky panels capped with `dvh` (not `vh`) + `overflow-y-auto`.
- [ ] Headings spaced asymmetrically, ~3:1 above vs below.
- [ ] Inner radius = outer radius − padding, at every level.
- [ ] 0.5px chrome, 1px object edges; alpha ramp on translucent surfaces.
- [ ] Two components where interaction differs; shared data and rows.
- [ ] Hover-revealed affordances have a touch equivalent.
- [ ] Reader-chosen layout state in a module both sides subscribe to, read in an effect, not during render.
- [ ] A view preference persists only if you can say why; by default, not.
- [ ] A layout switch resumes where the reader was.
- [ ] Tiles declare their content's aspect ratio; nothing cropped or refitted.
- [ ] Empty collections lose nav entry, route and section; no empty states.
- [ ] Dividers placed after empty sections are filtered out.
- [ ] Catch-all redirect for removed routes.
- [ ] Grids look deliberate at 1, 2 and n items.
- [ ] Dynamic Tailwind classes written as literal strings.
- [ ] z-index from a documented ladder, with gaps.
- [ ] Skip link present, moved by transform, matching `id="main"`.
- [ ] Every `<nav>` labelled; heading levels follow structure, not size.
- [ ] Collapsed disclosures stay in the DOM with `inert` **and** `aria-hidden`.
- [ ] `scroll-mt` on anchor targets, matched to the scroll spy.
- [ ] Print stylesheet resets scroll-reveal opacity.
