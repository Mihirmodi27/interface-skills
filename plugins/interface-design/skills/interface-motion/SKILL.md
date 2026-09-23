---
name: interface-motion
description: Design and audit interface motion so every animation makes a change legible — a duration ladder that grows with how much of the screen changes, one standard curve plus a colour curve that never overshoots, springs named by character, asymmetric open and close, shared elements that travel, one signal for "chosen", reduced motion as a real substitute, content that never waits on an animation to be visible, frame-throttled scroll work, compositor-only properties, hover intent, and set pieces that play once. Applies these in the project's own tokens via DESIGN.md, with dials for editorial, product or expressive work. Use when adding or reviewing animations, transitions, menus, sheets, disclosures, tooltips, hover, press and selected states, reveal-on-scroll, scroll effects, page transitions, theme switches, splash or onboarding sequences, UI sound, or motion that feels sluggish, floaty, janky or gratuitous, and when implementing reduced-motion or no-JavaScript fallbacks.
---

# Interface Motion

Motion in an interface has one job: **make a change legible.** Not to delight, not to demonstrate craft. Something opened, something moved, something was chosen — the animation exists so the user can follow it. If you can remove an animation and the user is no less clear about what happened, remove it.

That constraint is generative rather than limiting. It decides every duration (how much of the screen changed?), every curve (does this thing have position, or is it a fade?), every spring (what should this feel like?), and every exemption (is this state, or is it something else?). And it means the few places motion *is* spent land hard, because nothing around them competes.

This skill works in the project's own names. `DESIGN.md` maps each canonical role — `duration.state`, `ease.standard`, `spring.snappy` — to whatever the codebase already calls it, and sets the preset whose dials fill in the numbers. The laws below hold under every preset; the dials are where an essay, a dashboard and a launch page legitimately differ.

## Before you start

Read `DESIGN.md` at the project root — its `## Profile` and its `## Motion` section. They give you the preset (and any areas of the project on a different one), the project's own name for every role this skill talks about, and the decisions already made. Work in those names: this skill says `text.secondary`; the code you write says whatever `DESIGN.md` maps `text.secondary` to.

- **No `DESIGN.md`?** Don't stop. Run a narrow pass of the `design-system-setup` skill for this domain only — scan, map the roles you need, pick the preset from what the reader is doing — do the task, and recommend running the full setup afterwards.
- **A role you need has no row?** Look for a value already doing that job before inventing one. If you have to add one, name it in the project's style and record it in `DESIGN.md`.
- **The task would break a law, or move a dial off its preset?** Say so and ask. If the user confirms, do it, and record the decision with its reason under `## Decisions`.
- **The file names the `glass` preset?** The values are in `DESIGN.md`; the `glass-motion` skill, if installed, has the exact recipes and components behind them.

## Laws

### 1. Motion makes a change legible, or it goes

**Every animation must answer "what just changed?" — and one that answers nothing is removed, not shortened.** Motion is the strongest attention signal an interface has. Spent on nothing, it trains the eye to ignore motion, and then the one animation that matters — a save confirming, a row arriving — goes unseen. A pulsing "New" badge beside a live sync indicator is the classic: the user has learned to tune out both.

So nothing animates to attract attention, and nothing loops — except a loop that reports a state still in progress (a spinner, a progress bar), because there the change genuinely hasn't finished. A loop with nothing ongoing is decoration, and falls under law 4.

### 2. Duration grows with how much of the screen changes

**Duration is set by how much the eye has to re-read, never by how important the element feels, and every tier on the ladder is longer than the one below it.** The eye needs time in proportion to the distance it travels and the area it re-parses: a colour changing under a button is one glance; a whole page arriving is a re-read. Tie duration to importance instead and the primary button gets a 500ms flourish while the navigation gets 150ms — the most-used control is the slowest, and nothing feels like one system.

| Role | What changes |
|---|---|
| `duration.instant` | A pressed element's own response; a focus ring |
| `duration.micro` | One property with no position — opacity on hover |
| `duration.state` | One small element — colour, background, an icon swap, a small transform |
| `duration.popover` | A small element *and* its surroundings — a menu, a hover card |
| `duration.overlay` | A large region entering or collapsing — a sheet, a panel, a reveal |
| `duration.theme` | Everything on the page at once |

An element tied to a larger change takes the larger change's tier: a disclosure chevron is a small rotation, but it belongs to a panel opening below it, so it runs at `duration.popover` and lands with the panel. `duration.route` is the one tier the size rule doesn't set — law 3 caps it. The numbers are dials; the ordering is not.

### 3. Nothing repeated waits on an animation

**Anything a user does many times a session must never make them wait for motion to finish: feedback starts on the input, every transition can be interrupted, and anything on the path to content is capped.** An animation is watched the first time and endured the fortieth. A tab switch that slides for 300ms is charming once and a tax by lunchtime; a dialog that ignores clicks until its exit completes turns a double-click into a missed one.

- Press feedback lands on `pointerdown` at `duration.instant`. Waiting for `click` feels dead.
- Controls stay live while they animate. A new target re-targets the motion in flight; it never queues behind it.
- A route transition sits between "I clicked" and "I can read", so it is opacity only, never longer than `duration.overlay`, and the incoming page is interactive from its first frame. In `product`, the default is no route transition at all.

### 4. Off-ladder motion names its exemption

**The ladder is for state. Anything that runs longer must be classed as not-state — the subject of the moment, a set piece, or ambient — and the class written down beside it.** Forcing these onto the ladder makes them worse rather than tighter; letting them off without a class is how a 900ms flourish ends up on a menu.

| Class | What it is | What it must earn |
|---|---|---|
| Subject | The motion *is* the content the user is looking at — a dissolve between photographs, a chart drawing itself once | It isn't chrome reporting a change; the same component's *state* changes stay on the ladder |
| Set piece | A greeting, a first-run sequence, a launch moment | Law 15: once a session, blocks nothing |
| Ambient | A background loop in a hero | Never behind text being read, paused off screen, absent under reduced motion; `expressive` only |

The test for all three: **would a user see this more than a handful of times a session?** If yes, it's state, and it's on the ladder. In the Glass package this showed up inside one gallery: stepping between photographs dissolves slowly because the photograph is the subject; the same photograph travelling between two layouts stays inside the overlay tier because that is a state change. Same component, two durations, decided by whether the motion is the subject or the report.

### 5. One standard curve; colour never overshoots

**Everything that moves shares `ease.standard`; colour and opacity use `ease.colour`; and no curve may pass its target on a property with a floor.** One shared curve is why unrelated elements moving at once still feel like one mechanism. The urge to write a second bezier "because this one needs a different feel" is the urge for a spring — that's the axis where character belongs (law 6).

Colour has no mass. An overshooting curve on a background makes it travel past its target colour and come back, which reads as a wobble in the light. Opacity clamps at 1, so overshoot there is wasted tail that makes the fade feel mistimed. And a property with a hard floor — `blur()` to 0, `brightness()`, a radius to 0, a scale that mustn't invert — cannot take a curve that goes past its end value. Browsers clamp rather than error, so the symptom is a track that *stalls* for its last few frames, and it's very hard to attribute. **Check what else rides the curve before choosing it:** transform and opacity together are fine; add a filter and the whole track needs a monotone curve. Whether `ease.standard` overshoots is a dial; this law only bites where it does.

### 6. Springs are named by character, and move only things with position

**A spring is named for how it feels (`spring.snappy`, `spring.soft`), used wherever something can be re-targeted mid-flight or grabbed, and never drives opacity, colour or filter.** A bezier restarts from a standstill each time its target changes: a highlight chasing the pointer across five items stutters five times. A spring inherits its current velocity and curves toward the new target. **If the user could grab it, or it could change target mid-flight, it's a spring.**

Name by character because a number isn't a decision — `spring-400-30` tells the next person nothing about when to reach for it. And split opacity out of every spring as its own short tween: a spring overshoots, and overshooting opacity means a visible hitch at the tail of every fade.

```ts
// Motion (Framer Motion). React Spring: config {tension, friction}; GSAP: a tween for opacity beside the move.
transition={{ ...<spring.snappy>, opacity: { duration: <duration.micro>, ease: <ease.colour> } }}
```

Springs are wrong for discrete flips with no travel, for anything that must land in step with a bezier, and for long distances at low stiffness — a soft spring across 800px takes over a second and feels broken. When two axes of one element move together, giving them springs of different character creates squash and stretch from physics alone; deformation reads as mass.

→ Per-preset curves and springs in four libraries, conversion between vocabularies, and tuning by symptom: `references/ladder-and-curves.md`

### 7. Exits get out of the way

**Closing is faster than opening, flat, and eases in — no spring, no overshoot, and it travels less far.** Opening answers the user's intent and can afford a little character. Closing happens after the user has already moved on; a bounce on the way out reads as the interface being reluctant, and it stands between them and whatever they're reaching for next. The exit's offsets can be smaller than the entrance's too: it doesn't need to travel the full distance, because it's disappearing anyway. In the Glass package a menu opens on a spring of about 400ms and closes on a 130ms `ease-in` tween.

### 8. Where identity persists, the element travels

**If the same thing is on screen before and after a change, it moves between the two positions — it doesn't fade out in one place and fade in at another.** Per-item hover backgrounds across a row of icons produce overlapping fades, one brightening as its neighbour dims: a stutter, not an object. One shared highlight that re-targets its position and size cannot flicker, because there is only one of it. It must skip its mount animation, or it flies in from the corner on first paint.

The same law governs layout switches. Leaving a grid at item 60 and arriving at the top of a list is worse than no transition. **Measure the reading position before the outgoing layout unmounts**, and open the incoming one on that item, from that rectangle. Where the two ends differ in aspect, each keeps its own shape rather than one being stretched to the other's box. The shared element is the wrong tool for a lone item, for items that reflow while hovered, for items in different scroll containers, and for a grid crossed diagonally.

→ The highlight, tooltip and layout-switch patterns, in CSS View Transitions, Motion `layoutId` and GSAP Flip: `references/patterns.md`

### 9. One signal means chosen

**Choose a single treatment for "this is the one" — a fill, a solid surface, a weight — apply it everywhere a thing is current or being pointed at, and nowhere else.** Nothing is filled because it looks better. Previewing a choice and reporting one are the same gesture a beat apart, so they share the signal; where both are on screen at once, a second signal (the travelling highlight of law 8) tells them apart. Two signals, each doing half the job — never one doing both.

The mechanism matters as much as the rule. A filled icon is not a second drawing: it is the same outline with its interior painted, layered over the stroke and cross-faded in place at `duration.popover` on `ease.colour`, so the silhouette never moves. Marks that can't take the signal — a brand's official solid mark, an open stroke like a chevron with no interior, a lone toggle with nothing to be picked out from — signal some other way. **Fill that distinguishes nothing is just weight.** A tone step in text colour is not a signal either; `color-and-theming` covers why.

### 10. Reduced motion is a branch with a substitute

**Every animated component reads `prefers-reduced-motion` and takes its own reduced path that still communicates the change; a global off switch is a regression.** The preference exists because large-area and accelerating motion causes nausea and dizziness. It is not a request for an interface with no visible state. `* { animation: none !important }` strips the signals with the decoration — and produces a menu that appears with no indication it opened.

| Original | Reduced path |
|---|---|
| Spring slide, re-targeting highlight | A flat tween at `duration.state` — the move stays legible |
| Scale or squash entrance | A plain fade |
| Blur cross-fade | A cross-fade; the blur is the trigger, not the fade |
| Reveal-on-scroll, route fade, ambient loop | Off, with content in its final visible state |
| Theme cross-fade, programmatic smooth scroll | Instant |
| Press scale at `duration.instant` | Kept — too small and too short to matter |
| Set piece | Skipped entirely, not softened |

Imperative APIs don't read the preference: `scrollIntoView`, `scrollTo`, `Element.animate`, a GSAP timeline, a canvas loop. Pass it in. Library-wide switches — Motion's `MotionConfig reducedMotion="user"`, React Spring's `skipAnimation` — are a floor, not the plan.

→ Every substitute in CSS, Motion, GSAP and React Spring, and how to test: `references/guards.md`

### 11. Motion never owns whether content is visible

**Any style that hides content until an animation runs must resolve to visible whenever that animation can't run** — no JavaScript, no observer, reduced motion, print, or an element too tall to trip its trigger. The failure mode is not a plainer page; it is a correct document the reader cannot see.

In the Glass package's reference site, two of these shipped. A reveal observer asked for an intersection threshold of 0.1 — a fraction of the element's *own* area — so any section more than ten viewports tall could never reach it, and every long page sat at opacity 0. The fix: no fractional threshold; a root margin does the job at any height. Later, a component with a state-dependent `className` had its externally added `in` class rewritten away by the framework on the next render, and the rows faded back to 0 with nothing left to bring them back. The fix: mark "revealed" with a data attribute the framework doesn't own.

So: reveals are one-shot, observed with a zero threshold and a root margin, re-observed on client navigation, marked by an attribute, reset by a `<noscript>` style and a print rule. A collapsible region animates its height and goes `inert` while shut — it doesn't unmount, so its content stays in the served HTML.

### 12. Scroll work runs once a frame, and never hides what it can't bring back

**Each scroll-driven behaviour is one passive listener collapsed to one `requestAnimationFrame`, with a dead zone on anything that toggles on direction — and nothing collapses on a device that can't expand it again.**

```ts
let ticking = false;
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
window.addEventListener("scroll", onScroll, { passive: true });
```

`passive` lets the browser scroll without waiting on the handler; the flag turns a burst of events into one measurement per painted frame. A time-based throttle is always either faster than the frame rate or slower. Without a dead zone of a few pixels, a trackpad's jitter toggles a collapsing header forever. And a header that shrinks on scroll and expands on hover strands the navigation on a touch screen, where hover doesn't exist: gate the collapse on `(hover: hover) and (pointer: fine)`, at the point where you decide to hide.

### 13. Animate what the compositor can; escalate one element, never a view

**Animate `transform` and `opacity`, list every transitioned property by name, justify any layout property you animate, and when the DOM can't carry a transition, move one decorative element to the GPU — never the view.** `transition: all` animates properties you never meant to, including layout ones a parent adds later. Animating `width` is defensible on a single absolutely positioned element outside the flow, where nothing reflows around it; if you can't say why layout is cheap for this element, use a transform, or the `0fr`↔`1fr` grid-track technique for "animate to auto". A transform on an ancestor also weakens `backdrop-filter` beneath it — split the moving wrapper from the translucent surface (`surfaces-and-depth` has the material side).

GPU escalation is for one travelling element that has no semantics of its own. A canvas that owns a hundred tiles has traded their keyboard and screen-reader semantics, and hundreds of megabytes, for a transition. Its setup must return `null` rather than throw, and that `null` is the same path reduced motion and no-WebGL already take.

→ The scroll shape with hysteresis, scroll spies, the grid technique, GPU rules and bundle discipline: `references/performance.md`

### 14. Pointer gaps get intent, not luck

**A hover-opened element gets a close grace period of about 100ms, or a hover bridge across the gap; the timer is cleared on unmount and on navigation; and whatever hover reveals, focus reveals too, with a separate path for touch.** Without the grace period, moving from a trigger to the menu it opened closes the menu in the gap between them. Where the two are adjacent, padding that spans the gap is cheaper than a timer, because the pointer never leaves. A timer left running across a navigation reopens a stale menu on the next page. Delay the *close*, never the open — that is law 3.

### 15. Set pieces play once and block nothing

**A greeting, a first-run sequence or a launch flourish plays at most once a session, is decided before the first paint, skips for deep links and reduced motion, and never covers content or the skip link.** Its long budget is only defensible because it never recurs. Whether it plays depends on session storage the server can't see, so decide it in a blocking inline script that sets an attribute on the root, and let CSS answer at paint; decide it in a component and a frame of the page shows before the overlay covers it. Record "seen" when the piece *completes*, not when it starts, or the write cancels the animation it records. Branch client-only flags on the *transition*, never on a rendered style, or server and client paint differently. Focusing the skip link, pressing a key or following a link ends the piece at once.

→ The inline gate, the hydration-safe variant and the "seen" bookkeeping: `references/guards.md`

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| `duration.micro` | 100ms | 80ms | 120ms |
| `duration.state` | 150ms | 100ms | 200ms |
| `duration.popover` | 200ms | 150ms | 280ms |
| `duration.overlay` | 300ms | 200ms | 450ms |
| `duration.route` | 250ms opacity fade | none | 400ms fade; directional only where routes have a real order |
| `duration.theme` | 400ms | 250ms | 600ms |
| Exit duration | ≈ ⅔ of the entrance (popover exit 130ms) | 100ms | 180ms |
| `ease.standard` | `cubic-bezier(0.22, 1, 0.36, 1)` — no overshoot | `cubic-bezier(0.2, 0, 0, 1)` — no overshoot | `cubic-bezier(0.34, 1.2, 0.64, 1)` — slight overshoot |
| `ease.colour` · `ease.exit` | `ease` · `ease-in` | `ease-out` · `ease-in` | `ease` · `ease-in` |
| Springs | `snappy` 0.15 / 0.35s, `soft` 0.2 / 0.45s, one `playful` 0.3 / 0.5s | `snappy` 0 / 0.25s, for drag, throw and a re-targeting indicator only | `snappy` 0.2 / 0.4s, `soft` 0.3 / 0.6s, `playful` 0.45 / 0.7s |
| Reveal-on-scroll | 8px travel, `duration.overlay`, no stagger | none | up to 24px, stagger ≤ 80ms, whole group ≤ 600ms |
| Press feedback | scale 0.96 on small controls | `surface.pressed` step, no scale | scale 0.92–0.95 |
| Set pieces | at most one on the site | none | a few, each named |
| Ambient loops | none | progress indicators only | a hero only, paused off screen |
| Sound | absent, or opt-in behind a visible toggle | absent | opt-in, default off, visible toggle |

Springs are given as Motion's `bounce / duration`. The `glass` preset takes its values from `glass-motion`.

**The duration tiers.** The three presets move the numbers together, so the ordering of law 2 survives any row. `product` is shortest because its user is fluent and repeats everything; `expressive` is longest on entrances because it is usually seen once. Pushing `product`'s `duration.state` above ~150ms makes a dense table of hover states trail the pointer; pushing `editorial`'s above ~200ms makes reading chrome feel heavy.

**Whether `ease.standard` overshoots.** Overshoot makes a transform feel physical and costs you law 5's floor check on every track. `editorial` and `product` spend no overshoot, so their standard curve is legal everywhere; `expressive` spends a little and must keep a monotone curve for anything carrying a filter.

**Springs.** `product` confines springs to things with real momentum — a dragged card, a thrown sheet — because a spring's variable settle time is exactly what a fluent user notices. `editorial` gets one `playful` spring for one delight beat; against a baseline of restraint, one exuberant interaction reads as craft, and three read as a template.

**Sound.** Off wherever the user didn't choose to be there. If it exists: a visible, persisted mute; muting checked at playback, not at the listener; the audio context armed on `pointerdown`, `keydown` *and* `touchstart` — arming on pointer alone leaves keyboard users in silence for ever; hover sounds for mouse only; dense surfaces opt out of hover sound. `references/patterns.md` has the rest.

**Set pieces and ambient.** Each one is a named entry in `DESIGN.md` with its class from law 4. Raising the count past the preset's is a decision with a reason, not a drift.

## Building it for a project

1. **Read the preset and its areas.** A `product` app with an `expressive` marketing area gets two ladders; the area's paths say which one a file uses.
2. **Inventory what moves.** List every animated thing in the interface, or planned for it, and write beside each what changes and how much of the screen it covers. This list, not a token file, is where the ladder comes from.
3. **Assign tiers by area** (law 2), promoting anything that belongs to a larger change. Anything that doesn't fit is either a stray to snap to a tier or an exemption to class under law 4 — nothing is left unclassed.
4. **Take the preset's numbers**, then check them against the project: an existing, consistent value within ~20ms of a dial keeps its value and is recorded; a spread of strays snaps to the ladder. Confirm the tiers strictly ascend.
5. **Fix the curves.** One `ease.standard`, one `ease.colour`, `ease.exit` only if exits use a different curve. If the standard curve overshoots, find every track that carries a filter or a floored property.
6. **Name the springs by character**, only the ones the inventory needs. A project with no drag and no re-targeting indicator may need none.
7. **Write the reduced path for every row of the inventory** (law 10), and the visible end state for everything that starts hidden (law 11).
8. **Emit tokens in the project's mechanism.**

A fictional project, *Ledgerline* — bookkeeping software on `product`, with `app/(site)/**` on `expressive`. The app's tokens, in its existing `--motion-*` style:

```css
:root {
  --motion-micro: 80ms;     /* duration.micro   — row opacity on hover       */
  --motion-state: 100ms;    /* duration.state   — cell colour, icon swaps    */
  --motion-popover: 150ms;  /* duration.popover — menus, date picker         */
  --motion-overlay: 200ms;  /* duration.overlay — inspector panel, sheets    */
  --motion-theme: 250ms;    /* duration.theme                                */
  --motion-exit: 100ms;     /* exits: ease-in, flat                          */
  --motion-ease: cubic-bezier(0.2, 0, 0, 1);  /* ease.standard */
  --motion-ease-colour: ease-out;              /* ease.colour   */
  --motion-travel: 12px;    /* how far a sheet slides as it fades in       */
}
@media (prefers-reduced-motion: reduce) {
  :root { --motion-travel: 0px; }  /* the sheet still fades; it no longer slides */
}
```

Tailwind v4: `--ease-*` in `@theme` generates `ease-*` utilities; durations have no theme namespace, so reference them as `duration-(--motion-state)`. A Tailwind v3 config extends `transitionDuration` and `transitionTimingFunction`; a JS theme object carries `motion.duration.state` and `motion.spring.snappy` beside its colours.

→ Full per-preset tables and a worked derivation from a messy codebase: `references/ladder-and-curves.md`

## Auditing existing code

Collect evidence, then report. Useful searches:

- **Off-ladder durations:** `rg -n "\d+ms|duration[-:]\s*\d|duration-\[" src` — cluster the values; every one is a tier, a stray, or an unclassed exemption.
- **Curves:** `rg -n "cubic-bezier|ease-in-out|ease:" src` — count distinct beziers; more than the preset's two or three is a finding. Check any overshooting curve for a filter on the same track.
- **Entrances on `ease-in`**, exits on springs: `rg -n "exit=|ease-in" src`.
- **Opacity inside a spring:** transition objects with `type: "spring"` and no per-property opacity override.
- **`transition: all`**, `transition-all`, and animated `width|height|top|left|margin`.
- **Reduced motion coverage:** count animated components against `useReducedMotion|prefers-reduced-motion|matchMedia` branches; flag global `animation: none !important` rules; flag `scrollIntoView|scrollTo|\.animate\(` with no branch.
- **Hidden-until-animated content:** `opacity: 0` initial states, reveal classes, `threshold:` values above 0, `classList.add` on elements the framework renders, and whether a `<noscript>` reset and a print rule exist.
- **Scroll:** `addEventListener\("scroll"` without `passive`, without rAF, or several per behaviour.
- **Loops:** `infinite`, `repeat: Infinity`, `setInterval` driving UI.
- **Hover timers** with no clear on unmount; hover-only affordances with no `(hover: hover)` gate.

Then do what a grep can't: tab through the interface with reduced motion on, and with JavaScript off, and look for anything that never appears or appears with no sign it opened. Verify hover states on *leave* as well as on enter — the leave state is where transition-property mistakes live.

Report each breach as one line under `## Open issues`, with the law, the evidence and the reach: *"Law 11 — `.fade-up` has no `<noscript>` reset; content blank with JS off. 23 components."*

## Writing back to DESIGN.md

Under `## Motion`, keep: the ladder rows (role, name here, value, used for); the curves; springs by character; the reduced-motion policy in one sentence; every off-ladder entry as a project role under `duration.overlay`, with its class from law 4 and where it plays; and the sound policy, if sound exists.

Under `## Decisions`, dated, with a reason: any dial moved off the preset (*"`duration.state` 150ms, not 100ms: the ledger's hover rows felt abrupt in testing"*), a set piece added, sound turned on, a law knowingly broken.

Under `## Open issues`: every breach found in an audit, one line each with evidence. Remove a line when it's fixed; don't fix beyond the task without being asked.

## Checklist

- [ ] Every animation answers "what changed?"; nothing loops except to report an ongoing state.
- [ ] `duration.*` tiers strictly ascend, and each animation's tier is set by the area it changes.
- [ ] Press lands on `pointerdown` at `duration.instant`; nothing repeated waits on motion; `duration.route` ≤ `duration.overlay`.
- [ ] Every off-ladder duration is classed as subject, set piece or ambient in `DESIGN.md`.
- [ ] One `ease.standard`; colour and opacity on `ease.colour`; no overshoot on a filter or floored property.
- [ ] Springs are named `spring.<character>`, used where things re-target or are grabbed, with opacity split out.
- [ ] Exits are shorter than entrances, flat, `ease.exit`, no spring.
- [ ] Shared elements re-target rather than remount, skip their mount animation, and layout switches keep the reading position.
- [ ] One signal means chosen, used only for current or hovered; marks that can't take it signal another way.
- [ ] Every animated component has a reduced path that still shows the change; imperative APIs receive the preference.
- [ ] Hidden-until-animated content survives no JS, no observer, reduced motion, print, tall elements and re-renders.
- [ ] Scroll behaviours are passive, rAF-collapsed, have hysteresis, and never hide what touch can't restore.
- [ ] Only `transform` and `opacity` animate, properties are listed by name, and any GPU escalation covers one element and fails to `null`.
- [ ] Hover-opened elements have a close grace or bridge, timers are cleared, and focus reveals what hover does.
- [ ] Set pieces play once a session, are gated before first paint, record "seen" on completion, and never block the skip link.
- [ ] Durations, curves and springs match the preset's dials, or a `## Decisions` entry says why not.
- [ ] Reveal travel, press feedback and route transitions match the preset.
- [ ] Set pieces and ambient loops are within the preset's allowance.
- [ ] Sound is absent unless the preset allows it, and then off by default with a visible, persisted toggle.
