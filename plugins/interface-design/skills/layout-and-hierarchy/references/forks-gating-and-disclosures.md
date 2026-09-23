# Forks, gating and disclosures

## The fork test

**Does the interaction model change, or only the arrangement?**

| Change | Kind | Tool |
|---|---|---|
| A grid goes from one column to three | Arrangement | Breakpoint |
| A hover card sits below its row on narrow screens, beside it on wide | Arrangement | Breakpoint — same trigger, same content, only position moves |
| Padding shrinks, a row wraps, a sidebar stacks above content | Arrangement | Breakpoint |
| Navigation revealed on hover and collapsed on scroll, versus opened by tap into a sheet | Interaction model | Two components |
| A sticky table of contents in the margin, versus a one-line disclosure above the article | Interaction model | Two components |
| A data table with column resizing and row hover actions, versus a stacked card list with a swipe or a menu | Interaction model | Two components |

When it forks, **share the data and the row rendering; fork the container.** The destinations, the tree, the item component and the preferences hook live once; each container owns only how they are revealed and dismissed.

```tsx
function Rows({ nodes, active, onJump }) { /* shared: one row per node */ }

export function ContentsRail(props)    { return <nav aria-label="On this page"><ul><Rows {...props} /></ul></nav>; }
export function ContentsCompact(props) { return <details><summary>On this page</summary><ul><Rows {...props} /></ul></details>; }
```

Both render; CSS shows one. That keeps both in the served HTML and means the swap at the breakpoint costs nothing at runtime.

### The synchronisation hazard

Two presentations that are both mounted and each hold a copy of some state will disagree the moment the viewport crosses the breakpoint. A preference toggled in the desktop settings panel shows stale in the mobile sheet. Either give the longer-lived one a sync point — re-read the stored values as its panel opens — or, once more than one value is involved, lift the state into a store both subscribe to.

## Capability, not width

Width says how much room there is. It says nothing about whether there is a pointer.

| Query | Means |
|---|---|
| `(hover: hover)` | The primary input can hover |
| `(pointer: fine)` | The primary input is precise — mouse, trackpad, stylus |
| `(pointer: coarse)` | The primary input is a finger |
| `(any-hover: hover)` | *Some* input can hover — too permissive for a touchscreen laptop used by finger |

Gate hover behaviour on `(hover: hover) and (pointer: fine)` together, in CSS and in script. Check whether the framework's `hover:` utilities already wrap themselves in a hover media query; imperative handlers never do.

**Put the check where you hide, not where you reveal.** A dock that collapses on scroll-down and expands on hover must not collapse at all on touch, because nothing would bring it back. Bail out of the whole effect, so no scroll listener is attached on touch devices:

```ts
useEffect(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  // attach the collapse-on-scroll listener
}, []);
```

## The touch audit

For every hover-triggered behaviour, write down what a touch user gets. "Nothing" is a bug unless the behaviour is purely decorative.

| Hover behaviour | Touch equivalent |
|---|---|
| A tooltip naming an icon | A visible text label in the touch presentation |
| A settings panel opened on hover | A row in the menu sheet |
| Row actions revealed on hover | A persistent overflow button, or a long-press menu |
| A detail card beside a row | The same card below the row, or on the row's own page |
| A decorative lift on a card | None needed — the card is still a link to the same place |

## Breakpoints from content

A breakpoint is the width at which a specific layout decision stops working. To find one, resize slowly and note the width at which something fails: the rail no longer fits beside the column, the three-up grid's cards drop below a readable width, the inspector squeezes the content region under its minimum. Name the breakpoint for that decision (`bp.rail`, `bp.grid-3`, `bp.inspector`) and record why it sits where it does. A breakpoint copied from a device list moves nothing in particular, which is why it never lines up with the layout.

## Reader-chosen views

### State in a module both sides read

The toggle and the view it controls are siblings, so neither can own the value.

```ts
type View = "grid" | "focus";
let current: View = "grid";
const listeners = new Set<(v: View) => void>();

export const getView = () => current;
export function setView(v: View) { current = v; listeners.forEach((fn) => fn(v)); }
export function onView(fn: (v: View) => void) { listeners.add(fn); return () => listeners.delete(fn); }
```

On a server-rendered page, a component mirroring this reads it after mount, not during render: the server always renders the default, and a client that already has another value would paint something the markup disagrees with.

### Whether it persists

| Preference about… | Examples | Persist? |
|---|---|---|
| The reader | Theme, sound, reduced motion, density | Yes |
| A thing they were looking at | Grid versus list for a gallery, which tab of a spec was open | No — reset on arrival |
| A working setup the user built on purpose | A saved board view, a filtered table with a name | Yes, as a named, visible object, and recorded under `## Decisions` |

The failure a persisted view toggle produces: a reader lands on a collection in a mode they picked weeks ago, for a different collection, and assumes the page is broken. A saved view escapes this because it is visible and named — the user can see which one they're in.

### Carry the position across

Before the outgoing view unmounts, find the item nearest the viewport centre; open the incoming view on it.

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

Give every tile its content's own aspect ratio (`aspect-ratio: w / h`), not a uniform box. Nothing is cropped, nothing shifts on load, and one item can move between the two layouts without distorting — the transition itself belongs to `interface-motion`.

## Content gating

### Owner-curated collections: one flag, every consumer

```ts
export const has = { writing: posts.length > 0, talks: talks.length > 0 };
export const routeEnabled: Record<string, boolean> = { "/writing": has.writing, "/talks": has.talks };

const pages = [has.writing && { to: "/writing", label: "Writing" }, has.talks && { to: "/talks", label: "Talks" }].filter(Boolean);
```

The navigation, the route table, the home-page sections, the sitemap and the metadata all read the same flag. On a file-based router, where the file's existence is the route, the gate moves into the page and a catch-all sends everything else somewhere real:

```tsx
export default function Page() { if (!has.writing) redirect("/"); return <Writing />; }
```

Keep `routeEnabled` even when the router no longer consults it: the sitemap, the metadata and the nav still need to know which paths exist. Which routes exist is content, and the router is just one consumer.

**Filter before placing dividers**, so a rule is never left hanging above an absent section:

```ts
const shown = sections.filter((s) => hasContent[s]);   // then place rules between `shown`
```

### Grids at every count

One or two items in a three-up grid stay item-sized and centred, rather than stretching to fill:

```ts
const COLS  = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3"];
const WIDTH = ["", "max-w-[200px]", "max-w-[420px]", ""];
```

If the styling system scans source for class names, write these as literal strings — an interpolated `grid-cols-${n}` never reaches the stylesheet.

### User data: an empty state that teaches

| State | What it says | What it offers |
|---|---|---|
| Empty because new | What goes here, and why it's worth having — one or two sentences at `measure.reading` | The one action that creates the first item; optionally an import or a sample |
| Empty because filtered | "No shipments match *Delayed, this week*" — naming the filter | Clear the filter; never implies the data is gone |
| Empty because failed | What failed, in plain words | Retry, and where to get help if it fails again |
| Loading | Nothing, or a skeleton shaped like the content | — never an empty-state message, which flashes before the data |

An illustration is optional; the action is not. A friendly drawing above "Nothing here yet" teaches nothing.

## Disclosures

Prefer `<details>`/`<summary>`: keyboard behaviour, expanded state, find-in-page (browsers open a closed `<details>` to reveal a match) and no-JS support come free. Hide the default marker and style a chevron that reads the parent's `open` attribute.

Where a custom animation rules it out, collapse without unmounting:

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

`--reading-line` is the offset the scroll spy measures against; if the two disagree, a jump lands a heading just above the line and the contents highlights the previous section.
