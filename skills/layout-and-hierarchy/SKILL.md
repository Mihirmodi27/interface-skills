---
name: layout-and-hierarchy
description: Structure interfaces around a single reading measure — one column every page shares, anchored rails in the outer margin, asymmetric spacing that groups rather than separates, a nested radius ladder with continuous corners, a documented z-index ladder, forked presentations for touch and for reader-chosen layouts, disclosures that hide content rather than unmounting it, and content gating so an empty section removes its route and its nav entry rather than showing an empty state. Use when laying out pages, setting a content width, spacing sections, choosing border radii or hairline weights, building sticky sidebars or tables of contents, offering two views of one collection, deciding what changes between desktop and touch, ordering stacking contexts, building collapsible sections that must stay crawlable, handling empty states, or reviewing a layout that feels cramped, arbitrary, or inconsistently spaced.
---

# Layout and Hierarchy

Structure for interfaces where the content is mostly text and the layout's job is to get out of its way.

One decision drives most of the rest: **there is a single reading measure, and every page uses it.** Home, article, index, long-form — all 640px. Navigating between them doesn't move the text. Everything else in this skill is either about that column, or about what you're allowed to put outside it.

Reference implementation: [modimihir.com](https://modimihir.com).

## 1. One measure

```css
.col {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 32px;
}
```

640px with 32px of padding — so the text is at most 576px wide, which at 16px type is roughly 75–85 characters per line. That's the upper end of comfortable and the right place to be for a site that expects sustained reading.

**Every page uses the same class.** The value of that isn't aesthetic consistency, it's *continuity*: clicking from a summary on the home page into the long version on another page doesn't shift the text, so the transition reads as expansion rather than as a new document.

Three rules that fall out of it:

- **Content that isn't text can leave the column** — an image wall goes full-bleed, because a masonry grid has nothing to do with a reading measure.
- **A cover image inside an article stays in the column.** Bleeding it wide turns it into a banner *above* the article rather than part of it.
- **The column is the divider width too.** A hairline that spans the viewport separates *the page*; a hairline at column width separates *the content*.

## 2. Rails live outside the column, anchored to a wider frame

The pattern for a sticky table of contents:

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

Both the rail and the column are anchored to the same centred 1280px frame. That's what makes the gap between them **hold steady from 1280px up** — at 1600px or 2400px the rail doesn't drift further from the text. A rail positioned relative to the viewport instead separates from the content it indexes as the window grows.

Three details:

- **`absolute` + a `sticky` child.** The wrapper spans the section's full height so the sticky child has a track to travel; sticky alone inside a flex row would need its own column and would push the reading column off-centre.
- **`max-h-[calc(100dvh-11rem)]` + `overflow-y-auto`.** A long table of contents must scroll inside itself rather than run off the screen. `dvh`, not `vh` — mobile browser chrome changes the viewport height, and `vh` doesn't notice.
- **`xl:block`.** Below 1280px there's no margin to put it in, so it becomes a disclosure above the text. See §6.

## 3. Spacing groups; asymmetry is the mechanism

Space is how you say what belongs together. Equal space on both sides of an element says it belongs to neither neighbour — which is almost never what you mean.

```
mt-11  (44px)   ← heading
mb-3   (12px)
                ← the paragraph it introduces
```

A ~3.5:1 ratio above versus below. The heading and what follows it are one unit; the gap above is what separates that unit from the previous one. **This is the single most common spacing mistake and the cheapest to fix.**

The same logic at every scale:

| Relationship | Inner | Outer | Ratio |
|---|---|---|---|
| Heading → its paragraph | 12px below | 44px above | 3.7:1 |
| List items → the next block | 8px between | 24px below | 3:1 |
| Bio paragraphs → the links after | 16px between | 32px after last | 2:1 |
| Section heading → its content | 16–32px | 36px+ between sections | ~2:1 |

**Section rhythm** on the home page is `py-9` (36px top and bottom) — symmetric here, because sections are peers rather than parent-and-child. Long pages use a heavier separation: `mt-16 border-t pt-10` (64px, a hairline, 40px), where the rule earns its place by marking a genuine change of subject.

**Not every boundary gets a rule.** On the home page, Work / Experience / Life get a hairline above them; Watching and Socials don't, because they read as a coda to Life rather than as peers. That's a typographic judgement about rhythm — and it belongs in the layout code, not in a config file, precisely because it's a design call and not a preference.

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

**Nesting rule: the inner radius should be the outer radius minus the padding between them.** A 16px dock with 4px of padding contains 12px buttons. A 12px button holding a 1px-inset avatar gives it 10px. Get this wrong and you see it immediately — the corners either look pinched (inner too large) or the gap opens up at the corners (inner too small).

```css
* , *::before, *::after {
  corner-shape: superellipse(1.5);
}
```

Continuous ("squircle") corners globally. `superellipse(k)` uses exponent 2^k — k=1 is a normal round corner, k=2 is a full iOS squircle, so 1.5 lands about halfway. The curvature changes gradually into the straight edge instead of meeting it at a discontinuity, which is why iOS icons look softer than a same-radius CSS rectangle.

Progressive enhancement: unsupported browsers ignore the property and get normal rounding. Nothing else in the layout depends on it.

## 5. Hairlines: 0.5px vs 1px

| Weight | For |
|---|---|
| `0.5px` | Chrome borders, dividers, glass edges |
| `1px` | Card borders, rings, disclosure outlines |
| `2px` | Quote rules, focus rings |
| `1px` (`h-px`) | Table-of-contents markers |

`0.5px` renders as a true sub-pixel hairline on retina and rounds up to 1px elsewhere — so it degrades to the next weight rather than disappearing.

The choice is about what the border is *doing*. A divider inside a dock is separating two groups of icons in the same object: 0.5px. A border around a card is defining the edge of a distinct object: 1px.

And on translucent surfaces, use the **alpha ramp** (`border-gray-alpha-400`) — a solid border on glass doesn't participate in what's behind it and reads as a pasted-on frame. See the **color-and-theming** skill.

A divider that isn't an `<hr>` should be `aria-hidden`, and an `<hr>` used as a divider needs `border-0` before you give it a background, or you get the UA border *and* your line.

## 6. Two presentations, not one responsive layout

The most consequential structural idea here. Where the interaction model genuinely differs between pointer and touch, ship **two components**, not one component with breakpoint classes.

```tsx
<nav aria-label="Primary" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <MobileDock />   {/* sm:hidden — avatar + a menu button opening a sheet */}
  <DesktopDock />  {/* hidden sm:block — hover-revealed icons, sliding highlight */}
</nav>
```

The desktop dock reveals its pages and its settings box **on hover**, and collapses on scroll. Touch fires none of that. A single responsive component would need a hover path, a touch path, a collapse rule that only applies to one of them, and a settings box reachable two different ways — more branching than two focused components, and harder to reason about.

The same pattern for the table of contents: `SectionNav` (a sticky rail) and `SectionNavCompact` (a `<details>` disclosure) render the same tree through a shared `Rows` component. **Share the data and the row rendering; fork the container.**

The test for when to fork: **does the interaction model change, or just the arrangement?** Arrangement → breakpoints. Interaction model → two components.

### The same fork, chosen by the reader rather than the device

The pattern generalises past viewport width. The reference implementation's image galleries ship two presentations of one collection — a masonry **wall** that shows everything at once, and a **roll** with one photograph open above a filmstrip — and a small dock lets the reader pick. Same data, same route, two genuinely different ways of looking.

Three rules that make a reader-chosen fork work, and they're mostly *not* layout rules:

**State lives in a module, not in either component.** The control that flips the layout and the page that re-lays-out are siblings, so the value can't live in either of them:

```ts
let current: GalleryLayout = "grid";
export function setGalleryLayout(layout: GalleryLayout) {
  current = layout;
  for (const fn of listeners) fn(layout);
}
```

One module owns it, both subscribe — the same arrangement as a theme or a sound preference. (And on a server-rendered page, subscribers must read the initial value in an *effect*, not during render, or the first client paint disagrees with the markup.)

**Decide deliberately whether the choice persists — and default to no.** The theme is remembered forever; the gallery layout deliberately isn't. It lives in module memory rather than storage, and resets to the wall as each collection mounts. The reasoning: *the wall is the view that shows the whole collection, which is what you want on arrival; the roll is somewhere you go on purpose, and neither a previous visit nor the other gallery should decide it for you.* A persisted view preference is the right call surprisingly rarely.

**The switch must carry the reader's position across.** Leaving a wall at photograph 60 and arriving at the top of a filmstrip is worse than not switching at all. Find the item nearest the centre of the viewport before the outgoing layout unmounts, and open the other one on that. See §6 of **interface-motion** for the measurement and the transition.

One layout detail underneath all of it: **each tile declares its own aspect ratio.** A wall tile is exactly its photograph's shape, so `object-cover` has nothing to crop and the roll's rect can be computed to the same shape — which is what lets the same image travel between the two without distorting. A grid of uniform boxes would make that transition impossible.

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

When a content collection is empty, it loses its **nav icon**, its **route**, and its **home-page entry** — all three, derived from the same flag. There is no empty state, because there is no way to reach the thing that would show one.

**On a file-based router, the gate moves into the page.** There's no route table to conditionally build — the file's existence *is* the route — so the check goes at the top of the component, and a catch-all handles everything else:

```tsx
// app/writing/page.tsx
export default function Page() {
  if (!has.writing) redirect("/");
  return <Writing />;
}
```

```tsx
// app/[...rest]/page.tsx — anything that isn't a real route lands somewhere real.
export default function CatchAll() {
  redirect("/");
}
```

Worth noting what survived the move from a client router: **the `routeEnabled` map stayed even though nothing consults it for routing any more.** It's read by the sitemap, the metadata builder and the nav, which all still need to know whether a path exists. The lesson is that "which routes exist" is *content* rather than *routing* — keep it as data, and the router of the day just becomes one more consumer.

Sections drop out *before* dividers are placed, so a hairline can never end up hanging above nothing:

```tsx
const shown = site.sections.filter((name) => SECTIONS[name] && sectionHasContent[name]);
```

And the catch-all redirect means an old link to a page you've since emptied lands somewhere real rather than on a 404.

Layout consequences of the same principle — a layout should look deliberate at every content count:

```tsx
// One or two folders stay folder-sized and centred rather than stretching
// across a three-up grid. (640px column − gaps) ÷ 3 ≈ 200px each.
const COLS  = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3"];
const WIDTH = ["", "max-w-[200px]", "max-w-[420px]", ""];
```

A single item stretched to full width is the tell that a grid wasn't designed for its own edge cases.

(Tailwind scans source text, so these must be **literal class strings** — a computed `grid-cols-${n}` never reaches the stylesheet.)

## 8. The z-index ladder

Documented, sparse, and ordered by permanence:

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

Wide gaps so something can be inserted without renumbering — and 60 is what that headroom was for: a greeting overlay arrived later and slotted in without touching a single existing value.

Two pairs worth understanding rather than copying. **40/50**: a full-screen tap-outside catcher must be *above* the page and *below* the menu it dismisses, or it eats the menu's own clicks. **60/100**: a splash overlay covers the navigation (or it isn't covering the page) but must never cover the skip link, because a keyboard user tabbing during a two-second greeting has to be able to get past it.

Two techniques worth knowing:

**`isolate` + negative z.** A highlight bar behind icons but in front of its container's background: `isolate` on the container scopes the `-z-10` so the bar can't fall behind the parent.

**`pointer-events-none` on a full-width strip, `auto` on the content.** A fixed nav strip spans the viewport for centring but shouldn't intercept clicks along its whole width:

```tsx
<nav className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
  <div className="pointer-events-auto">{/* the dock */}</div>
</nav>
```

Note the strip carries **no transform** — a transform would make it the containing block for the mobile sheet's full-bleed overlay, and the overlay would be trapped inside the strip's bounds.

→ Radius derivation, elevation tiers, stacking contexts: `references/radius-and-elevation.md`

## 9. Structural accessibility

Not a separate pass — these are layout decisions.

```tsx
<a href="#main" className="skip">Skip to content</a>
```

Parked off-screen with a `transform` (never `display: none`, which removes it from the tab order) and slid in on focus. Every page needs a matching `id="main"`.

- **`aria-label` on every `<nav>`.** "Primary", "On this page" — a page with three unlabelled navs is unnavigable by landmark.
- **Heading levels follow structure, not size.** A page title is `h1`, sections `h2`, sub-sections `h3`, cards `h4`. Two elements at 14px/500 can legitimately be `h3` and `h4`. Never pick a level for its default size.
- **`scroll-mt` on every anchor target**, matched to the scroll spy's reading line — otherwise a jump lands the heading above the line and the TOC highlights the previous section.
- **`aria-current` on the active row**, `aria-pressed` on toggles, `aria-expanded` + `aria-haspopup` + `aria-controls` on menu triggers.
- **A menu's wrapper stays mounted while the panel unmounts**, so `aria-controls` keeps resolving to a real element.
- **Decorative spans get `aria-hidden`.** A hand-rolled bullet inside a real `<li>` would otherwise be announced.
- **Real anchors for in-page links**, with the click handler layered on top — so they work without JS and can be copied as links.
- **`<details>`/`<summary>`** for a disclosure rather than a div and state. Keyboard behaviour, `aria-expanded`, and find-in-page all come free.

### A disclosure should hide its content, not remove it

Where you *can't* use `<details>` — because the open/close needs a custom animation — collapse by animating height to zero rather than unmounting:

```tsx
<motion.div
  initial={false}
  animate={{ height: open ? "auto" : 0 }}
  inert={!open}
  aria-hidden={!open}
  className="overflow-hidden"
>
```

Two reasons, and the second is the one people miss.

**The content is in the served HTML.** A summary, a spec table, an FAQ answer behind a toggle is worth nothing to a crawler, to an `llms.txt`, or to find-in-page if it only exists after a click. Unmounting is throwing the content away for everyone who isn't looking at the screen.

**`inert` is what makes that safe.** Content that's visually collapsed but still in the tree is still tabbable and still announced — so a keyboard user tabs into three lines of invisible prose, and a screen reader reads a summary that the page is presenting as hidden. `inert` removes it from the tab order and the accessibility tree together; `aria-hidden` alongside it covers browsers that haven't shipped `inert` yet. Neither is optional, and `display: none` isn't the answer because it can't be animated.

The general form: **hide with `inert` + zero height; don't unmount.** Reserve unmounting for content that's genuinely expensive or genuinely absent.

```css
@media print {
  nav, footer, .skip { display: none; }
  .reveal { opacity: 1; transform: none; }
  a { color: inherit; text-decoration: none; }
}
```

Print is a real presentation. The `.reveal` reset is the one people forget — scroll-triggered content prints blank without it.

## Assets

- `assets/layout-tokens.css` — the column, the spacing scale, radius ladder, continuous corners, hairlines, skip link, print styles.
- `assets/SectionNav.tsx` — two presentations of one tree, with shared row rendering.

## Checklist

- [ ] One measure, defined once, used by every page.
- [ ] Full-bleed reserved for non-text content; article covers stay in the column.
- [ ] Dividers at column width, not viewport width.
- [ ] Rails anchored to the same frame as the column, `absolute` wrapper + `sticky` child.
- [ ] Sticky panels capped with `dvh` (not `vh`) and `overflow-y-auto`.
- [ ] Spacing is asymmetric around headings — ~3:1 above vs below.
- [ ] Inner radius = outer radius − padding, at every nesting level.
- [ ] 0.5px for chrome, 1px for object edges; alpha ramp on translucent surfaces.
- [ ] Two components where the interaction model differs; shared data and rows.
- [ ] Hover-revealed affordances have a touch equivalent.
- [ ] A reader-chosen layout keeps its state in a module both sides subscribe to — read in an effect, not during render.
- [ ] A view preference persists only if you can say why; the default is not to.
- [ ] A layout switch resumes where the reader was.
- [ ] Tiles declare their content's own aspect ratio, so nothing is cropped or has to be re-fitted.
- [ ] Empty collections remove nav entry, route, and section — no empty states.
- [ ] Dividers placed after empty sections are filtered out.
- [ ] Catch-all redirect for removed routes.
- [ ] Grids look deliberate at 1, 2, and n items.
- [ ] Dynamic Tailwind classes written as literal strings.
- [ ] z-index values from a documented ladder, with gaps.
- [ ] Skip link present, moved by transform, with a matching `id="main"`.
- [ ] Every `<nav>` labelled; heading levels follow structure not size.
- [ ] Collapsed disclosures keep their content in the DOM, with `inert` **and** `aria-hidden`.
- [ ] `scroll-mt` on anchor targets, matched to the scroll spy.
- [ ] Print stylesheet resets scroll-reveal opacity.
