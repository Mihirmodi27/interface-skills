# Forks, gating and disclosures

## The fork test

**Does the interaction model change, or only the arrangement?**

| Change | Kind | Tool |
|---|---|---|
| A grid goes from one column to three | Arrangement | Breakpoint |
| A hover card sits below its row on narrow screens, beside it on wide | Arrangement | Breakpoint — only position moves |
| Padding shrinks, a row wraps, a sidebar stacks above content | Arrangement | Breakpoint |
| Navigation revealed on hover and collapsed on scroll, versus opened by tap into a sheet | Interaction model | Two components |
| A sticky table of contents in the margin, versus a one-line disclosure above the article | Interaction model | Two components |
| A data table with column resizing and row hover actions, versus a stacked card list with a swipe or a menu | Interaction model | Two components |

When it forks, **share the data and the row rendering; fork the container**: destinations, tree, item component and preferences hook live once, and each container owns only how they are revealed and dismissed.

```tsx
function Rows({ nodes, active, onJump }) { /* shared: one row per node */ }

export function ContentsRail(props)    { return <nav aria-label="On this page"><ul><Rows {...props} /></ul></nav>; }
export function ContentsCompact(props) { return <details><summary>On this page</summary><ul><Rows {...props} /></ul></details>; }
```

Both render and CSS shows one, so both stay in the served HTML and the swap costs nothing at runtime.

**The synchronisation hazard.** Two mounted presentations each holding a copy of some state disagree once the viewport crosses the breakpoint — a preference toggled in the desktop panel shows stale in the mobile sheet. Have the longer-lived one re-read the stored values as its panel opens or, once more than one value is involved, lift the state into a store both subscribe to.

## Capability, not width

| Query | Means |
|---|---|
| `(hover: hover)` | The primary input can hover |
| `(pointer: fine)` | The primary input is precise — mouse, trackpad, stylus |
| `(pointer: coarse)` | The primary input is a finger |
| `(any-hover: hover)` | *Some* input can hover — too permissive for a touchscreen laptop used by finger |

Gate hover behaviour on `(hover: hover) and (pointer: fine)` together, in CSS and in script; a framework's `hover:` utilities may already wrap themselves in a hover media query, but imperative handlers never do.

**Check where you hide, not where you reveal.** A dock that collapses on scroll and expands on hover must never collapse on touch, where nothing brings it back, so bail out of the whole effect and attach no scroll listener:

```ts
useEffect(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  // attach the collapse-on-scroll listener
}, []);
```

## The touch audit

For every hover behaviour, write down what a touch user gets; "nothing" is a bug unless it is purely decorative.

| Hover behaviour | Touch equivalent |
|---|---|
| A tooltip naming an icon | A visible text label |
| A settings panel opened on hover | A row in the menu sheet |
| Row actions revealed on hover | A persistent overflow button, or a long-press menu |
| A detail card beside a row | The same card below the row, or on the row's own page |
| A decorative lift on a card | None — the card is still a link |

## Breakpoints from content

Resize slowly and note where a specific decision fails — the rail no longer fits beside the column, the three-up grid's cards drop below a readable width, the inspector squeezes the content under its minimum — then name the breakpoint for it (`bp.rail`, `bp.grid-3`, `bp.inspector`) and record why it sits there. A breakpoint from a device list never lines up with the layout.

### On the container, inside a shell

A shell's content panel is the window minus whatever the sidebar and inspector take, and that changes while the window doesn't. A list and detail view split on a window query showed both panes at a width where, with the sidebar open, the detail had about 150px. Query the panel instead, and let each pane size itself from its own width:

```css
.panel  { container: panel / inline-size; }
.split  { display: grid; grid-template-columns: 1fr; }
@container panel (min-width: 720px) {
  .split { grid-template-columns: clamp(240px, 32cqi, 360px) 1fr; }   /* the list gives way first */
}

.detail { container: detail / inline-size; padding-inline: var(--gutter); }
@container detail (min-width: 560px) { .detail { padding-inline: calc(var(--gutter) * 2); } }
@container detail (max-width: 480px) { .detail-actions .label { display: none; } }  /* icons keep their tooltips */
```

The list is clamped so it yields before the detail does, and the detail decides its own gutters, side rail and header labels, so its actions shrink to icons rather than clip. Name container breakpoints like any other (`bp.split`, `bp.detail-rail`).

### Size and count are separate

"Make the folders 25% smaller" is a request about size: the items shrink and the row keeps its count. Fitting more per row is a different change, to the grid, and happens only when asked. Treat the two as separate tokens — an item width and a column count — so one can't move the other by accident.

## Reader-chosen views

### State in a module both sides read

```ts
type View = "grid" | "focus";
let current: View = "grid";
const listeners = new Set<(v: View) => void>();

export const getView = () => current;
export function setView(v: View) { current = v; listeners.forEach((fn) => fn(v)); }
export function onView(fn: (v: View) => void) { listeners.add(fn); return () => listeners.delete(fn); }
```

The toggle and the view are siblings, so neither owns the value. On a server-rendered page, read it after mount, not during render: the server always renders the default, and a client holding another value would paint something the markup disagrees with.

### Whether it persists

| Preference about… | Examples | Persist? |
|---|---|---|
| The reader | Theme, sound, reduced motion, density | Yes |
| A thing they were looking at | Grid versus list for a gallery, which tab of a spec was open | No — reset on arrival |
| A working setup the user built on purpose | A saved board view, a filtered table with a name | Yes, as a named, visible object, and recorded under `## Decisions` |
| How they work a page they return to daily (product) | Board or list for the task page, a week or a three-day span | Yes, per page, with the switch always visible in the page header, recorded under `## Decisions` |
| A default that is the point | A folder view that always opens on its folders | No — the default wins even where the page's other choices persist |

A persisted toggle lands a reader in a mode picked weeks ago for a different collection, and they assume the page is broken; a saved view escapes this because it is visible and named, and a per-page choice because the switch showing it sits in the header of the page it governs.

### Which views a collection gets

A second view shows how the collection moves. Work that moves through states gets a board whose columns run in the order work moves, each headed by its state; work that moves through time gets a week board with a span switch (week, three days, day). The list stays as the other view. A collection that doesn't move — a directory, an archive — gets a list and no board.

### Carry the position across

```ts
function nearestToCentre(items: Element[]) {
  const mid = innerHeight / 2;
  return items.reduce((best, el) => {
    const r = el.getBoundingClientRect();
    const d = Math.abs(r.top + r.height / 2 - mid);
    return d < best.d ? { el, d } : best;
  }, { el: items[0], d: Infinity }).el;
}
```

Open the incoming view on the item nearest the viewport centre, found before the outgoing view unmounts. Tiles at their content's own aspect ratio (`aspect-ratio: w / h`), not a uniform box, crop nothing, don't shift on load, and let one item move between layouts undistorted; the transition belongs to `interface-motion`.

## Content gating

### Owner-curated collections: one flag, every consumer

```ts
export const has = { writing: posts.length > 0, talks: talks.length > 0 };
export const routeEnabled: Record<string, boolean> = { "/writing": has.writing, "/talks": has.talks };

const pages = [has.writing && { to: "/writing", label: "Writing" }, has.talks && { to: "/talks", label: "Talks" }].filter(Boolean);
```

Navigation, route table, home-page sections, sitemap and metadata all read the same flag. On a file-based router, where the file is the route, the gate moves into the page and a catch-all sends everything else somewhere real:

```tsx
export default function Page() { if (!has.writing) redirect("/"); return <Writing />; }
```

Keep `routeEnabled` even when the router ignores it: the sitemap, metadata and nav still need to know which paths exist, because that is content and the router is one consumer. **Filter before placing dividers**, so no rule hangs above an absent section:

```ts
const shown = sections.filter((s) => hasContent[s]);   // then place rules between `shown`
```

### Grids at every count

One or two items in a three-up grid stay item-sized and centred, not stretched:

```ts
const COLS  = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3"];
const WIDTH = ["", "max-w-[200px]", "max-w-[420px]", ""];
```

Where the styling system scans source for class names, write literal strings; an interpolated `grid-cols-${n}` never reaches the stylesheet.

### User data: an empty state that teaches

| State | What it says | What it offers |
|---|---|---|
| Empty because new | What goes here and why it's worth having — one or two sentences at `measure.reading` | The one action that creates the first item; optionally an import or a sample |
| Empty because filtered | "No shipments match *Delayed, this week*" — naming the filter | Clear the filter; never implies the data is gone |
| Empty because failed | What failed, in plain words | Retry, and where to get help if it fails again |
| Loading | Nothing, or a skeleton shaped like the content | — never an empty-state message, which flashes before the data |

An illustration is optional; the action is not — a friendly drawing above "Nothing here yet" teaches nothing.

## Disclosures

Prefer `<details>`/`<summary>`: keyboard behaviour, expanded state, find-in-page (browsers open a closed `<details>` to reveal a match) and no-JS support come free. Hide the default marker and drive a chevron from the parent's `open` attribute. Where a custom animation rules it out, collapse without unmounting:

```html
<div class="panel" style="overflow: hidden; block-size: 0" inert aria-hidden="true">…</div>
```

Animate `block-size` to the content's height on open and remove `inert` and `aria-hidden` together. Unmount only content that is genuinely expensive (a heavy chart, a video) or genuinely absent.

## Structural details

```css
.skip { position: absolute; inset-inline-start: 16px; top: 16px; z-index: var(--z-skip-link); transform: translateY(-200%); }
.skip:focus { transform: none; }
:where(h2, h3, h4)[id] { scroll-margin-top: var(--reading-line); }

@media print {
  nav, footer, .skip { display: none; }
  [data-reveal] { opacity: 1; transform: none; }
}
```

`--reading-line` is the scroll spy's offset; if the two disagree, a jump lands a heading just above the line and the contents highlights the previous section.
