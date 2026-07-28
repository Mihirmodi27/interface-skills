# Adaptive presentations

## Fork the container, share the data

The rule: **does the interaction model change, or just the arrangement?**

- **Arrangement changes** → breakpoint utilities. A grid going from one column to three, a row wrapping, padding shrinking.
- **Interaction model changes** → two components.

A single component that has to support hover-reveal *and* tap-to-open ends up with a hover path, a touch path, a collapse rule that applies to only one of them, and shared state that means something different in each. Two focused components are less total code and far easier to reason about.

## Case 1: the navigation dock

```tsx
export function BottomNav() {
  return (
    <nav aria-label="Primary"
         className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <MobileDock />    {/* sm:hidden  */}
      <DesktopDock />   {/* hidden sm:block */}
    </nav>
  );
}
```

**`DesktopDock`** — a row of icon buttons with a shared sliding highlight and a sliding tooltip. Hovering an arrow opens a settings drop-up. Scrolling down collapses it to just the avatar; hovering, scrolling up, or reaching either end of the page expands it.

**`MobileDock`** — the avatar and a menu button. Tapping the button opens a drop-up sheet listing the pages as text rows, ending with socials, sound and theme. Toggling a preference leaves the sheet open; navigating or tapping outside closes it.

Almost nothing is shared, because almost nothing is the same. Every interaction in the desktop version is hover-driven, and touch fires none of them:

| Behaviour | Desktop | Mobile |
|---|---|---|
| Reveal pages | Always visible, collapse on scroll | Inside a sheet |
| Reveal settings | Hover an arrow | A row in the sheet |
| Item feedback | Sliding highlight + tooltip | `active:bg-highlight` |
| Labels | Tooltip on hover | Text in the row |
| Collapse on scroll | Yes | No — nothing brings it back |
| Press feedback | `active:scale-[0.92]` | `active:scale-[0.92]` |

What *is* shared is extracted properly — the destinations array, the icons, and the preferences hook:

```tsx
function useNavPrefs() {
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<ThemeChoice>(getThemeChoice);
  // …
  return { soundOn, setSound, theme, pickTheme, sync };
}
```

### The `sync` subtlety

Both docks are always mounted (hidden by CSS, not unmounted), and each holds its own copy of the preferences. So a change made in the desktop settings box — before the viewport crossed the breakpoint — would leave the mobile sheet showing a stale toggle.

```tsx
const toggle = () => {
  if (!open) sync();     // re-read the stored values as the sheet opens
  setOpen((o) => !o);
};
```

The desktop box needs no equivalent because its panel *mounts fresh* on open and reads the values on the way in. Worth noting the asymmetry: the mobile dock's trigger lives in the always-present dock, so the state outlives the panel.

This is the general hazard with two mounted presentations: **any state they both hold needs a defined synchronisation point.** Lift it to a shared store if there's more than one such value.

## Case 2: the table of contents

Same tree, two containers, shared row rendering.

```tsx
/** Shared — used by both presentations. */
function Rows({ nodes, active, parents, onJump }) { … }

/** The sticky rail, in the left margin on wide screens. */
export function SectionNav({ nodes, active, onJump }) {
  return (
    <nav aria-label="On this page">
      <ul className="flex flex-col">
        <Rows … />
      </ul>
    </nav>
  );
}

/** The narrow-screen disclosure — one line above the article. */
export function SectionNavCompact({ nodes, active, onJump }) {
  const [open, setOpen] = useState(false);
  const jump = (id: string) => { setOpen(false); onJump(id); };
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}
             className="group rounded-xl border border-gray-alpha-300">
      <summary className="… [&::-webkit-details-marker]:hidden">
        On this page
        <span className="… group-open:rotate-180 motion-reduce:transition-none">
          <ChevronDownIcon />
        </span>
      </summary>
      <ul className="… border-t border-gray-alpha-300">
        <Rows … onJump={jump} />
      </ul>
    </details>
  );
}
```

Both are rendered; CSS picks one:

```tsx
<div className="absolute inset-y-0 left-8 hidden w-[196px] xl:block">
  <div className="sticky top-28 max-h-[calc(100dvh-11rem)] overflow-y-auto">
    <SectionNav {...nav} />
  </div>
</div>

<div className="reveal mt-8 xl:hidden">
  <SectionNavCompact {...nav} />
</div>
```

Note the props are memoised so both get a stable object:

```tsx
const nav = useMemo(() => ({ nodes: toc, active, onJump: jump }), [active, jump]);
```

### Why `<details>` for the compact version

Free keyboard behaviour, free `aria-expanded`, free find-in-page (browsers open a closed `<details>` to reveal a match), and it works with JavaScript disabled. Mirroring `open` into React state is only needed so the disclosure can close itself after a jump.

`[&::-webkit-details-marker]:hidden` plus `list-none` removes the default triangle so the chevron can be styled. `group-open:rotate-180` on the chevron reads the parent's `open` attribute — no state needed for the rotation.

The compact version costs **one line** above the article. That's the design constraint that makes it acceptable to put a nav in the reading flow at all.

## Capability queries, not just width

Width tells you how much room you have. It does not tell you whether the user has a pointer.

```ts
if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
```

| Query | Means |
|---|---|
| `(hover: hover)` | The primary input can hover |
| `(hover: none)` | It can't |
| `(pointer: fine)` | Precise — mouse, trackpad, stylus |
| `(pointer: coarse)` | Imprecise — finger |
| `(any-hover: hover)` | *Some* input can hover |

**Use `hover` and `pointer: fine` together.** `any-hover` is too permissive — a touchscreen laptop or a tablet with a stylus attached reports `any-hover: hover` while the user is actually using a finger.

In CSS:

```css
@media (hover: hover) and (pointer: fine) {
  .thing:hover { … }
}
```

Tailwind v4's `hover:` variant already compiles to a `(hover: hover)` guard, so utility hover states are safe by default. It's imperative JavaScript that needs the explicit check.

## The rule about hiding things

> **Never hide an affordance where it can't come back.**

The dock collapses on scroll-down and expands on hover. On touch, hover doesn't exist — so a collapsed dock would permanently remove the navigation. The effect bails out entirely:

```ts
useEffect(() => {
  // Only collapse where a cursor can bring the dock back.
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  // … scroll listener
}, []);
```

Bailing out of the *whole effect* rather than branching inside it also means no scroll listener is attached on touch devices at all.

The general form: **the capability check belongs at the point where you decide to HIDE something, not at the point where you reveal it.** Checking at reveal-time is too late — the thing is already gone.

## The touch-versus-hover audit

For every hover-triggered behaviour, ask what a touch user gets. If the answer is "nothing," it's a bug.

| Hover behaviour | Touch equivalent |
|---|---|
| Icon label as a tooltip | Text label in the sheet |
| Settings box on hover | A row in the sheet |
| Company card on row hover | Sits below the row instead of beside it, at a wider breakpoint |
| Folder cards rising | Not available — but the folder is still a link to the same page |
| Dock collapse on scroll | Doesn't happen |

The folder-card lift is the honest case: it's a delight beat with no informational content, so touch users lose nothing they need. That's the only acceptable reason for a hover-only behaviour to have no equivalent — **the interaction must be purely decorative.** Anything that conveys information or provides an affordance needs a path.

## Where responsive utilities are still right

Arrangement, not interaction:

```tsx
"grid gap-4 sm:gap-6 grid-cols-3"           // grid density
"columns-3 gap-1 sm:columns-4"              // masonry columns
"pt-28 sm:pt-20"                            // page padding
"text-[30px] sm:text-[26px]"                // the one responsive type step
"absolute left-3 right-3 top-full … xl:left-full xl:top-1/2 xl:ml-6 xl:w-60"
```

That last one is the interesting case — a hover card that sits *below* its row on narrow screens and *beside* it at `xl`, where there's finally margin to put it in. Same trigger, same content, same interaction; only the position moves. Correctly a breakpoint change rather than two components.

## Breakpoints in use

| Breakpoint | Width | What changes |
|---|---|---|
| `sm` | 640px | Mobile dock ↔ desktop dock. Article title size. Page padding. Masonry columns. Stack columns. |
| `xl` | 1280px | The TOC rail appears. The hover card moves beside its row. |

Two breakpoints for the whole site. `sm` because it coincides with the reading measure — below it the column is padding-limited, so it's the natural place for the layout to change character. `xl` because that's the width at which there is finally enough margin outside a 640px column to park a 196px rail.

Both are derived from the content, not chosen from a device list. That's the point: **a breakpoint should be the width at which a specific layout decision stops working.**
