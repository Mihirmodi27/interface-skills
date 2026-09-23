---
name: interface-motion
description: Design and audit interface motion so every animation makes a change legible — durations scaled to how much screen changes, one standard curve, a colour curve that never overshoots, springs by character, asymmetric open and close, travelling shared elements, one "chosen" signal, reduced motion as substitute, content never hidden behind animation, frame-throttled scroll, compositor-only properties, hover intent, once-only set pieces. In the project's tokens via DESIGN.md, with editorial, product and expressive dials. Use when adding or reviewing animations, transitions, menus, sheets, disclosures, tooltips, hover, press and selected states, reveal-on-scroll, scroll effects, page transitions, theme switches, splash or onboarding sequences, UI sound, or motion that feels sluggish, floaty, janky or gratuitous, and when implementing reduced-motion or no-JavaScript fallbacks.
---

# Interface Motion

Motion in an interface has one job: **make a change legible.** Not to delight, not to demonstrate craft. Something opened, moved or was chosen, and the animation lets the user follow it. If removing an animation leaves the user no less clear about what happened, remove it.

The constraint also makes the few places motion *is* spent land hard, because nothing around them competes. The laws hold under every preset; the dials are where an essay, a dashboard and a launch page legitimately differ.

## Before you start

Read `DESIGN.md` at the project root: `## Profile` for the preset and any areas on another one, `## Motion` for the project's name for each role and the decisions already made. Reason in roles; write code in the project's names.

- **No `DESIGN.md`:** run the `design-system-setup` skill for this domain only, do the task, then recommend the full setup.
- **A role you need has no row:** reuse a value already doing that job; otherwise add one in the project's naming style and record it in `DESIGN.md`.
- **The task would break a law or move a dial off its preset:** say so and ask; if the user confirms, record it with its reason under `## Decisions`.
- **Preset `glass`:** the values are in `DESIGN.md`; the `glass-motion` skill, if installed, has the exact recipes behind them.

## Laws

### 1. Motion makes a change legible, or it goes

**Every animation must answer "what just changed?" — and one that answers nothing is removed, not shortened.** Motion is the strongest attention signal an interface has; spent on nothing, it trains the eye to ignore it, and the animation that matters — a save confirming, a row arriving — goes unseen. A pulsing "New" badge beside a live sync indicator is the classic: the user tunes out both. Nothing animates to attract attention, and nothing loops except to report a state still in progress, like a spinner or a progress bar; any other loop is decoration, under law 4.

### 2. Duration grows with how much of the screen changes

**Duration is set by how much the eye has to re-read, never by how important the element feels, and every tier is longer than the one below it.** Tie it to importance and the primary button gets a 500ms flourish, the navigation 150ms: the most-used control is the slowest, and nothing feels like one system.

| Role | What changes |
|---|---|
| `duration.instant` | A pressed element's own response; a focus ring |
| `duration.micro` | One property with no position — opacity on hover |
| `duration.state` | One small element — colour, background, icon swap, small transform |
| `duration.popover` | A small element *and* its surroundings — a menu, a hover card |
| `duration.overlay` | A large region entering or collapsing — a sheet, a panel, a reveal |
| `duration.theme` | Everything on the page at once |

An element tied to a larger change takes its tier: a disclosure chevron runs at `duration.popover` and lands with the panel opening below it. `duration.route` is the one tier size doesn't set; law 3 caps it. The numbers are dials; the ordering is not.

### 3. Nothing repeated waits on an animation

**Anything a user does many times a session must never wait on motion: feedback starts on the input, every transition can be interrupted, and anything on the path to content is capped.** An animation is watched the first time and endured the fortieth: a tab switch that slides for 300ms is charming once and a tax by lunchtime, and a dialog that ignores clicks until its exit completes turns a double-click into a missed one.

- Press feedback lands on `pointerdown` at `duration.instant`; waiting for `click` feels dead.
- Controls stay live while animating: a new target re-targets the motion in flight, never queues.
- A route transition sits between "I clicked" and "I can read": opacity only, never longer than `duration.overlay`, the incoming page interactive from its first frame.

### 4. Off-ladder motion names its exemption

**The ladder is for state. Anything longer must be classed as not-state — the subject of the moment, a set piece, or ambient — with the class written down beside it.** Forced onto the ladder these get worse; unclassed, a 900ms flourish ends up on a menu.

| Class | What it is | What it must earn |
|---|---|---|
| Subject | The motion *is* the content being looked at — a dissolve between photographs, a chart drawing itself once | It isn't chrome reporting a change; the same component's *state* changes stay on the ladder |
| Set piece | A greeting, a first-run sequence, a launch moment | Law 15: once a session, blocks nothing |
| Ambient | A background loop in a hero | Never behind text being read, paused off screen, absent under reduced motion; `expressive` only |

The test for all three: **would a user see this more than a handful of times a session?** If yes, it's state, and on the ladder.

### 5. One standard curve; colour never overshoots

**Everything that moves shares `ease.standard`; colour and opacity use `ease.colour`; and no curve may pass its target on a property with a floor.** One shared curve makes unrelated elements moving together feel like one mechanism; the urge for a second bezier is the urge for a spring, where character belongs (law 6).

Colour has no mass, so overshoot on a background is a wobble in the light; opacity clamps at 1, so overshoot is a wasted tail that mistimes the fade. On a property with a hard floor — `blur()` or `brightness()` toward 0, a radius toward 0, a scale that mustn't invert — browsers clamp rather than error, and the track *stalls* for its last few frames, which is hard to trace. **Check what else rides the curve:** transform with opacity is fine; add a filter and the whole track needs a monotone curve. Whether `ease.standard` overshoots is a dial; this law bites only where it does.

### 6. Springs are named by character, and move only things with position

**A spring is named for how it feels (`spring.snappy`, `spring.soft`), used wherever something can be re-targeted mid-flight or grabbed, and never drives opacity, colour or filter.** A bezier restarts from a standstill at each new target, so a highlight chasing the pointer across five items stutters five times; a spring keeps its velocity. **If the user could grab it, or it could change target mid-flight, it's a spring.** A number isn't a decision: `spring-400-30` says nothing about when to reach for it. Opacity splits out as its own short tween, because a spring's overshoot on opacity hitches at the tail of every fade.

Springs are wrong for discrete flips with no travel, anything that must land in step with a bezier, and long distances at low stiffness: a soft spring across 800px takes over a second and feels broken.

→ Curves and springs per preset in four libraries, the opacity split in code, squash and stretch, and tuning by symptom: `references/ladder-and-curves.md`

### 7. Exits get out of the way

**Closing is faster than opening, flat, and eases in — no spring, no overshoot, and it travels less far.** Opening answers the user's intent and can afford character; closing comes after they've moved on, so a bounce reads as reluctance and stands in their way, and a disappearing element needn't travel the full distance. In the Glass package a menu opens on a spring of about 400ms and closes on a 130ms `ease-in` tween.

### 8. Where identity persists, the element travels

**If the same thing is on screen before and after a change, it moves between the two positions rather than fading out in one place and in at another.** Per-item hover backgrounds across a row of icons give overlapping fades, one brightening as its neighbour dims: a stutter, not an object. One shared highlight that re-targets its position and size can't flicker, because there is only one; it skips its mount animation, or it flies in from the corner on first paint.

Leaving a grid at item 60 and arriving at the top of a list is worse than no transition, so **measure the reading position before the outgoing layout unmounts** and open the incoming one there, neither end stretched to the other's aspect. A shared element is the wrong tool for a lone item, items that reflow while hovered, items in different scroll containers, and a grid crossed diagonally.

→ Highlight, tooltip and layout-switch patterns in View Transitions, Motion `layoutId` and GSAP Flip: `references/patterns.md`

### 9. One signal means chosen

**Choose a single treatment for "this is the one" — a fill, a solid surface, a weight — and apply it everywhere a thing is current or being pointed at, and nowhere else.** Nothing is filled because it looks better. Previewing a choice and reporting one are the same gesture a beat apart, so they share it; where both are on screen at once, law 8's travelling highlight tells them apart: two signals each doing half the job, never one doing both.

A filled icon is the same outline with its interior painted, cross-faded in place at `duration.popover` on `ease.colour`, so the silhouette never moves. Marks that can't take it — a brand's official solid mark, a chevron with no interior, a lone toggle with nothing to be picked out from — signal another way. **Fill that distinguishes nothing is just weight.** Nor is a step from `text.secondary` to `text.primary` a signal; `color-and-theming` covers why.

### 10. Reduced motion is a branch with a substitute

**Every animated component reads `prefers-reduced-motion` and takes its own reduced path that still communicates the change; a global off switch is a regression.** The preference exists because large-area and accelerating motion causes nausea and dizziness, not to remove visible state: `* { animation: none !important }` strips the signals with the decoration, and a menu appears with no sign it opened.

| Original | Reduced path |
|---|---|
| Spring slide, re-targeting highlight | A flat tween at `duration.state`; the move stays legible |
| Scale or squash entrance | A plain fade |
| Blur cross-fade | A cross-fade; the blur is the trigger, not the fade |
| Reveal-on-scroll, route fade, ambient loop | Off, with content in its final visible state |
| Theme cross-fade, programmatic smooth scroll | Instant |
| Press scale at `duration.instant` | Kept: too small and short to matter |
| Set piece | Skipped entirely, not softened |

Imperative APIs — `scrollIntoView`, `scrollTo`, `Element.animate`, a GSAP timeline, a canvas loop — don't read the preference; pass it in. Motion's `MotionConfig reducedMotion="user"` and React Spring's `skipAnimation` are a floor, not the plan.

→ Every substitute in CSS, Motion, GSAP and React Spring, and how to test: `references/guards.md`

### 11. Motion never owns whether content is visible

**Any style that hides content until an animation runs must resolve to visible whenever that animation can't run** — no JavaScript, no observer, reduced motion, print, or an element too tall to trip its trigger. The failure is not a plainer page but a correct document the reader can't see. Two such bugs on the Glass package's reference site left content at opacity 0: an observer threshold of 0.1 that no section over ten viewports tall could reach, and an externally added `in` class the framework rewrote out of a state-dependent `className`.

So reveals are one-shot, with a zero threshold and a root margin, re-observed on client navigation, marked by a data attribute the framework doesn't own, and reset by a `<noscript>` style and a print rule. A collapsible animates its height and goes `inert` while shut, but stays mounted, so its content stays in the served HTML.

### 12. Scroll work runs once a frame, and never hides what it can't bring back

**Each scroll-driven behaviour is one passive listener collapsed to one `requestAnimationFrame`, with a dead zone on anything that toggles on direction — and nothing collapses on a device that can't expand it again.** A rAF flag gives one measurement per painted frame, which no time-based throttle can. A dead zone of a few pixels stops trackpad jitter toggling a collapsing header forever. A header that collapses on scroll but expands only on hover strands the navigation on touch, so gate the collapse on `(hover: hover) and (pointer: fine)` where you decide to hide.

### 13. Animate what the compositor can; escalate one element, never a view

**Animate `transform` and `opacity`, list every transitioned property by name, justify any layout property you animate, and when the DOM can't carry a transition, move one decorative element to the GPU — never the view.** `transition: all` catches properties you never meant, including layout ones a parent adds later. Animating `width` is defensible only where nothing reflows, as on one absolutely positioned element outside the flow; otherwise use a transform, or the `0fr`↔`1fr` grid track to "animate to auto". A transform on an ancestor weakens `backdrop-filter` beneath it, so the moving wrapper and the translucent surface are separate elements (`surfaces-and-depth` has the material side).

GPU escalation is for one travelling element with no semantics of its own, never a view of tiles, whose semantics a canvas can't carry and whose textures cost hundreds of megabytes; its setup returns `null` rather than throwing, the path reduced motion and no-WebGL already take.

→ The scroll shape with hysteresis, scroll spies, the grid technique, GPU rules and bundle discipline: `references/performance.md`

### 14. Pointer gaps get intent, not luck

**A hover-opened element gets a close grace period of about 100ms, or a hover bridge across the gap; the timer is cleared on unmount and on navigation; and whatever hover reveals, focus reveals too, with a separate path for touch.** Without it, the menu closes in the gap; where trigger and menu touch, a bridge of padding is cheaper, because the pointer never leaves. A timer left running across a navigation reopens a stale menu on the next page. Delay the *close*, never the open (law 3).

### 15. Set pieces play once and block nothing

**A greeting, a first-run sequence or a launch flourish plays at most once a session, is decided before the first paint, skips for deep links and reduced motion, and never covers content or the skip link.** Its long budget is defensible only because it never recurs. Gate it in a blocking inline script that sets a root attribute for CSS to answer at paint: the server can't see session storage, and a component decides a frame too late. Record "seen" on *completion*, or the write cancels the animation it records; branch client-only flags on the *transition*, never a rendered style, or server and client paint differently. Focusing the skip link, pressing a key or following a link ends it at once.

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

Springs are Motion's `bounce / duration`.

The presets move the tiers together, so law 2's ordering survives any row. Each set piece and ambient loop is a named entry in `DESIGN.md` with its law 4 class; exceeding the preset's allowance is a decision with a reason, not a drift.

→ Why each dial sits where it does: `references/ladder-and-curves.md`. Sound's rules: `references/patterns.md`

## Building it for a project

1. **Read the preset and its areas.** A `product` app with an `expressive` marketing area gets two ladders; the area's paths say which a file uses.
2. **Inventory what moves**, built or planned, with what each changes and how much screen it covers. The ladder comes from this list, not a token file.
3. **Assign tiers by area** (law 2), promoting anything tied to a larger change. What doesn't fit is a stray to snap or an exemption to class under law 4; nothing is left unclassed.
4. **Take the preset's numbers** and check them against the project: a consistent existing value within ~20ms of a dial is kept and recorded; scattered strays snap to the ladder. Confirm the tiers strictly ascend.
5. **Fix the curves.** One `ease.standard`, one `ease.colour`, `ease.exit` only if exits differ. If the standard curve overshoots, find every track carrying a filter or floored property.
6. **Name only the springs the inventory needs**, by character; with no drag and no re-targeting indicator, maybe none.
7. **Write the reduced path for every inventory row** (law 10), and the visible end state for everything that starts hidden (law 11).
8. **Emit tokens in the project's mechanism**: custom properties, a Tailwind theme or a JS theme object.

→ Per-preset tables, the *Ledgerline* token file with Tailwind mappings, and a derivation from a messy codebase: `references/ladder-and-curves.md`

## Auditing existing code

Collect evidence, then report:

- **Off-ladder durations:** `rg -n "\d+ms|duration[-:]\s*\d|duration-\[" src`; each value is a tier, a stray or an unclassed exemption.
- **Curves:** `rg -n "cubic-bezier|ease-in-out|ease:" src`; more distinct beziers than the preset's two or three is a finding, as is an overshooting one on a track with a filter.
- **Entrances on `ease-in`**, exits on springs: `rg -n "exit=|ease-in" src`.
- **Opacity inside a spring:** `type: "spring"` with no per-property opacity override.
- **`transition: all`**, `transition-all`, animated `width|height|top|left|margin`.
- **Reduced motion:** animated components against `useReducedMotion|prefers-reduced-motion|matchMedia` branches; global `animation: none !important`; `scrollIntoView|scrollTo|\.animate\(` with no branch.
- **Hidden until animated:** `opacity: 0` initial states, reveal classes, `threshold:` above 0, `classList.add` on framework-rendered elements; a missing `<noscript>` reset or print rule.
- **Scroll:** `addEventListener\("scroll"` without `passive` or rAF, or several per behaviour.
- **Loops:** `infinite`, `repeat: Infinity`, `setInterval` driving UI.
- **Hover:** timers never cleared on unmount; hover-only affordances with no `(hover: hover)` gate.

Then tab through with reduced motion on, and with JavaScript off, for anything that never appears or appears with no sign it opened. Check hover states on *leave* as well as enter; the leave state is where transition-property mistakes live.

Report each breach as one line under `## Open issues`, with the law, the evidence and the reach: *"Law 11 — `.fade-up` has no `<noscript>` reset; content blank with JS off. 23 components."*

## Writing back to DESIGN.md

Under `## Motion`: ladder rows (role, name here, value, used for); curves; springs by character; the reduced-motion policy in a sentence; each off-ladder entry as a project role under `duration.overlay`, with its law 4 class and where it plays; the sound policy, if any.

Under `## Decisions`, dated, with a reason: any dial moved off the preset (*"`duration.state` 150ms, not 100ms: the ledger's hover rows felt abrupt in testing"*), a set piece added, sound turned on, a law knowingly broken.

Under `## Open issues`: each audit breach, one line with its evidence, removed when fixed; don't fix beyond the task unasked.

## Checklist

- [ ] Every animation answers "what changed?"; only an ongoing state loops.
- [ ] `duration.*` tiers strictly ascend; the area changed sets each animation's tier.
- [ ] Press lands on `pointerdown` at `duration.instant`; nothing repeated waits; `duration.route` ≤ `duration.overlay`.
- [ ] Each off-ladder duration is classed subject, set piece or ambient in `DESIGN.md`.
- [ ] One `ease.standard`; colour and opacity on `ease.colour`; no overshoot on a filter or floored property.
- [ ] Springs are `spring.<character>`, only where things re-target or are grabbed, opacity split out.
- [ ] Exits are shorter than entrances, flat, on `ease.exit`, no spring.
- [ ] Shared elements re-target, never remount, and skip their mount animation; layout switches keep the reading position.
- [ ] One signal means chosen, only on current or hovered; marks that can't take it signal another way.
- [ ] Each animated component has a reduced path that still shows the change; imperative APIs get the preference.
- [ ] Hidden-until-animated content survives no JS, no observer, reduced motion, print, tall elements and re-renders.
- [ ] Scroll work is passive, rAF-collapsed and hysteretic, and never hides what touch can't restore.
- [ ] Only `transform` and `opacity` animate, each property named; GPU escalation is one element and fails to `null`.
- [ ] Hover-opened elements get a close grace or bridge and cleared timers; focus reveals what hover does.
- [ ] Set pieces play once a session, gate before first paint, record "seen" on completion, never block the skip link.
- [ ] Durations, curves and springs match the preset, or a `## Decisions` entry says why not.
- [ ] Reveal travel, press feedback and route transitions match the preset.
- [ ] Set pieces and ambient loops are within the preset's allowance.
- [ ] Sound only if the preset allows it, off by default behind a visible, persisted toggle.
