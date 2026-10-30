---
name: product-patterns
description: "Design the interaction and copy patterns a product runs on — short sentence-case labels, rows that name type and origin, one treatment for destructive actions, confirmations that say what is lost, an agent's work shown step by step with inline approvals, live states, keyboard-first tools, few choices up front, empty states that offer the first action, boards and lists, optimistic moves, dashboards and forms — and iterating on feedback, via DESIGN.md. Use when writing or reviewing UI copy, button labels, menu items, toasts or empty states; adding delete, sign-out or other destructive flows; building a chat or agent panel, tool-call display, approval step or live transcript; adding keyboard shortcuts or a command palette; designing a create or record launcher or a filter toolbar; offering a board and a list of the same items; making drag-and-drop feel instant; planning a dashboard, form or sign-in page; or iterating on a product UI from owner or client feedback."
---

# Product Patterns

The other skills in this set decide how an interface looks: its type, colour, layout, surfaces and motion. This one decides how it behaves and what it says — the label on a button, what a confirmation asks, how an agent shows its work, what happens when a save fails. **A pattern is a promise the product keeps everywhere**: once delete asks one way, every delete must, or the reader has to read every dialog to learn what it wants. Most product bugs a reviewer can't name are a pattern kept in one place and broken in another.

The laws hold under every preset. How much keyboard, how much is remembered and how much copy a screen carries are dials.

## Before you start

Read `DESIGN.md` at the project root: `## Profile` for the preset and any areas on another one, `## Patterns` for the conventions already chosen — the product's nouns, its destructive pattern, its shortcut map, which views are remembered — and `## Decisions`. Write copy in the project's nouns.

- **No `DESIGN.md`:** run the `design-system-setup` skill for the profile and preset only, do the task, then add a `## Patterns` section and recommend the full setup.
- **A pattern you need has no entry:** find the nearest one already in the code and reuse it; otherwise define it once and record it under `## Patterns`.
- **The task would break a law or move a dial off its preset:** say so and ask; if the user confirms, record it with its reason under `## Decisions`.
- **Preset `glass`:** it carries no pattern values; use the dials of the preset nearest the reader.

Boundaries: how a label or figure is set is `typographic-system`'s; what colour danger, brand and status take, `color-and-theming`'s; where things sit and which views fork, `layout-and-hierarchy`'s; what a dialog or card is built from, `surfaces-and-depth`'s; how long anything takes to move, `interface-motion`'s. This skill decides the flow and the words, and names the owner where the rest is someone else's.

## Laws

### 1. A label is as short as its action, in sentence case

**A label names the action in the fewest words that still say it: a button reads its verb — "Send", "Save changes", "Record" — not the sentence around it ("Record a voice note").** Labels are scanned, not read; every extra word moves the verb away from where the eye lands, and the tail is the first thing to truncate. Short is not narrow: a label covers everything behind it, so an item that takes questions, bug reports and requests is "Help & feedback", not "Request a feature". Add an object only where two verbs on one screen would otherwise collide ("Save draft" beside "Publish"); a confirm button repeats its dialog's verb ("Delete project"), never "OK" or "Yes".

**Sentence case everywhere** — buttons, menu items, dialog titles, field and column names, tabs, toasts, and labels the code generates from keys (`dueDate` → "Due date"). Title case marks every word as a name, and uppercase strips word shapes; acronyms, proper nouns and third-party product names stay as written.

### 2. A row's second line says what it is and where it's from

**Under a title, the second line names the record's type and origin in the product's own nouns — "Task from Riverside", "Note from site walk" — never an event ("Issue added to Riverside").** The title says which one; the reader's next questions are what kind and from where, and those let them triage without opening it. Event phrasing describes something that happened to the record once, in a verb nobody filters by, and often swaps the noun, so the reader wonders whether an "issue" here is a "task" everywhere else. **One noun per kind of thing across the product**, listed in `DESIGN.md`. Time, owner and status take their own slots — a column, a meta line, a glyph — not the sentence. The title stays the strongest line in the row (`typographic-system`, `color-and-theming`).

→ Before-and-after labels, button verbs, generated labels, toasts and error copy: `references/copy.md`

### 3. Destructive and session-ending actions look alike, and come last

**Every action that destroys data or ends the session — delete, remove, clear, revoke, sign out — takes one treatment and one place: set apart at the end of its menu, after a divider, with no icon.** Position and treatment are recognised before words are read; when delete has a bin, clear has none and sign out sits mid-menu, the reader learns three severities that don't exist. The colour is ground, not decoration (`color-and-theming`). Such an action is never the default focus, never beside the item clicked most, and never the primary button of a dialog that isn't about it. The reverse holds too: **nothing that isn't destructive borrows its look** — a recording or live state is not danger.

### 4. A confirmation says what is lost, in the system's own dialog

**A confirmation states in plain words what will be lost, uses the product's standard dialog, and asks for proof of intent in proportion to the loss.** A one-off with a red icon circle and red heading reads as something other than the product asking (`surfaces-and-depth` law 1). Proportion:

- **Reversible** — no dialog; do it, and offer Undo in the toast.
- **Irreversible, one item** — a dialog whose button repeats the verb.
- **Irreversible and large** — a project, an account, a workspace — "Type DELETE to confirm", compared case-insensitively, the input focused on open (not Cancel), the action disabled until it matches, "Deleting…" while it runs, and the dialog held open until it succeeds or says why it failed.

**One pattern everywhere**: deleting a project and deleting an account read the same. On close, focus returns to what opened it — a row, a menu item — which the dialog must be told, since it wasn't opened by its own trigger.

### 5. An agent's work is shown step by step, and approved where it happens

**Every tool call an AI agent makes appears as a collapsible card — the tool's name in sentence case, its arguments, its result — never as a lone spinner; a step that needs approval asks inline, under its own card.** A spinner asks for trust; a card lets the reader check what was done and catch it going wrong. A modal approval hides the card and the conversation the decision depends on. The approve button names the action and takes the brand action colour; reject is muted.

The conversation carries no avatar per message: the reader's turns sit right-aligned on a tint, the agent's run full width with no fill, because the agent's output is the content. Mark AI output with one small mark in brand, not a robot face or a coloured bubble (`color-and-theming`). The panel is non-modal, so the reader keeps working beside it.

### 6. Live output separates the settled from the forming

**A streaming state — a live transcript, an answer being generated — shows committed text in ink and the phrase still forming muted, with a caret; keeps the newest line in view under a top fade; and lets the reader scroll back without being dragged down.** Words that may still change shouldn't look final; ink that rewrites itself reads as a glitch. Follow the bottom while the reader is there; once they scroll up, stop following and offer "Jump to latest". Screen readers hear committed segments only.

**Paused means still**: the motion that stood for live stops (`interface-motion`), and the paused state offers what the reader wants next — the text so far, Copy, Resume. One "working now" signal per screen, and a live control turns into its action on hover and focus (level bars become a Stop square), so stopping is where the reader is already looking.

→ Tool-call cards, inline approvals, conversation layout, follow-the-bottom and announcing: `references/agents-and-live-states.md`

### 7. Dense tools are keyboard-first, and Escape closes one layer

**In a tool used all day, every frequent action has a key — ⌘K or Ctrl+K for a command palette, J and K to move through a list, a single key to filter, Enter to send and Shift+Enter for a new line — and Escape closes only the innermost layer.** The pointer is the slow path for an action repeated a hundred times a day, and an Escape that closes the dialog and the panel under it throws away context. Single-letter keys never fire while focus is in a text field. **Every drag has a keyboard path** ("Move to…" in the row menu), so dragging is a shortcut, never the only way. A shortcut is shown where its action lives — menu item, tooltip, palette — from one map recorded in `DESIGN.md`.

### 8. Few choices up front; the rest one step away

**A launcher offers only the choices the task has, and a toolbar or a long list holds back what isn't needed every time.** Every option on the path of the most frequent action is something to read before starting: a record launcher asks one question with two answers — which project, or a personal note — not a form. Toolbar filters are icons with tooltips, not a text label on every control. A long admin list groups into collapsed bars, closed by default, each with a summary ("Admins 3 · Members 9"), and a search opens every group it matches.

### 9. An empty state offers the first action

**Where the user's own data is empty, say in one line what goes here and offer the one action that creates the first item — never "No items found."** "No … found" reports a failure and sends the reader looking for the create button elsewhere. Empty because filtered is a different state: name the filter and offer to clear it. Owner-curated collections don't get an empty state at all; they disappear (`layout-and-hierarchy` law 10).

### 10. Work is shown the way it moves

**Items that move through stages get a board whose columns run in the order work moves, each headed by its status glyph; items placed in time get a week board with Week, 3 days and Day spans; the list stays as the second view of the same items.** The board makes the state of the work the layout; a list makes it a column to sort by. Both share data, filters and rows (`layout-and-hierarchy` law 8).

On a working page the reader returns to daily, the view and span are remembered per page, with the switch visible in the page header, and the default wins where it is the point (folders open on folders) — `layout-and-hierarchy` law 9 owns the rule; list each page under `## Patterns`. Status changes by drag (law 11) and by the keyboard path (law 7).

### 11. A move happens now and rolls back visibly

**A drag, toggle, rename or reorder updates the screen at once, saves in the background, and on failure puts the item back where it was with a toast that says what failed and offers Retry.** Waiting on the network for a move the reader can already see makes every action feel broken. The rollback has to be seen: a card that silently snaps back reads as a missed drop, and one that silently stays reads as saved. Keep the previous state until the save confirms, and drop responses older than the latest change. **Not for the irreversible** (law 4) **or for results the server decides** — sending, paying, anything another person sees at once.

→ Board and list, remembered views, rollback code, the shortcut map, launchers and grouped lists: `references/collections-and-dashboards.md`

### 12. A dashboard is overview, trends and action items, from one pipeline

**A dashboard answers three questions in order — where things stand (overview), which way they're moving (trends), what needs the reader (action items) — and drops anything nobody acts on.** A recent-activity feed nobody clicks is a column of noise next to the items that need a decision. **Wireframe it first and share the wireframe**: arguing about boxes is cheaper than arguing about a built page. A long page is fine; a page that hides what needs action to stay short is not. **A scoped overview runs the global overview's pipeline with its sources filtered**, never a parallel query, so the two can't disagree. Figures under a header can double as the table's filters (stat rows: `layout-and-hierarchy` law 3; figure colours: `color-and-theming`).

### 13. A form leads with the field that decides the rest

**The field whose answer changes what follows comes first and full width — a category before the free text — and every field has its label above, its hint below, and its error in the hint's place.** Asking for the free text first makes the reader write before they know what kind of thing they're writing, then reshuffles the form under them. An error replaces the hint rather than adding a line, so nothing jumps; a failure of the whole form is one line with an icon above the button; the one primary button reads the verb.

**A sign-in screen is a form with nothing else**: unboxed in its own column of about 360px — title, one muted line, fields, one brand button — with an art panel taking the other half from a wide breakpoint, and the form alone on a phone. List the auth routes as an `expressive` area in `DESIGN.md`'s `## Profile`, since that is the only place the art may move; elsewhere it holds one still frame (the panel: `surfaces-and-depth`'s art-panel recipe; its motion: `interface-motion`'s ambient class; 16px inputs on phones: `typographic-system`).

→ The confirmation dialog, undo toasts, field anatomy and the sign-in layout in code: `references/actions-and-forms.md`

## Dials

| Dial | editorial | product | expressive |
|---|---|---|---|
| Label length | 1–3 words | 1–2 words, verb first | A call to action may run to a short phrase |
| Keyboard | Tab order, skip link, Escape | Palette, list movement, single-key actions, shown in menus | Tab order and Escape |
| View memory | Reset on arrival | Remembered per page on daily working pages, switch in the header (`layout-and-hierarchy` law 9) | Reset on arrival |
| Optimistic updates | Rare | Default for moves, toggles, renames, reorders | Rare |
| Proof of intent for large deletes | Typed word | Typed word | Typed word |
| Empty-state copy | One sentence and the action | One line and the action | A headline, a line and the action |
| Agent steps | Collapsed to one line each | Collapsed when done; running and failed steps open | Collapsed to one line each |
| Toasts | Failures and Undo only | Failures, Undo, and results off screen | Failures and Undo only |

The `glass` preset carries no pattern dials; take them from the preset nearest the reader.

**Keyboard.** Product readers repeat; editorial and expressive readers arrive, read and leave, so a palette there is a feature nobody discovers. Every preset keeps the floor: everything reachable by Tab, Escape closing one layer.

**View memory.** A working reader returns to the same collection daily and set its view for a reason; a visiting reader didn't, and should see the collection as designed.

**Toasts.** A toast confirms what the reader can't see happen. A move they watched needs none; a save that failed, an undo window, or a result on another page does.

## Iterating on feedback

Most product feedback is one step: "one step lighter", "25% smaller", "to 16px". The craft is making exactly that change, everywhere it applies, and writing it down.

1. **Make the change asked, at the size asked.** Move one step on the existing ladder; don't re-pick the system. "Make it 25% smaller" keeps the count per row unless more per row was asked for.
2. **After any change to a shared rule, sweep the product** — every route, every component on that rule — **and report what moved.** Partial updates are the commonest bug: some screens took the new value, some didn't. Ask before calling a page done, and never "fix" a page the owner has said is theirs.
3. **Record the decision** under `## Decisions`, dated and marked user decision or client feedback, newest first, replacing whatever it supersedes (format: `design-system-setup`'s `references/design-md.md`).
4. **Study reference products for how information is structured, not how it looks**: where icons are and aren't, where tags appear, how tables are built, what is boxed and what isn't, what aligns with what.
5. **Wireframe a new page type before building it**, and share the wireframe.
6. **Review on a preview harness**: the real app on mock data, every route reachable without a backend, so a whole-product sweep or audit takes minutes.

→ The sweep, the report, the log entry, a reference-study worksheet and the harness: `references/iteration.md`

## Auditing existing code

| Law | Look for | Evidence |
|---|---|---|
| 1 | Title case or uppercase labels; buttons that are sentences; "OK", "Yes", "Submit"; generated labels shown raw | Label, file, count |
| 2 | Second lines built from event verbs; two nouns for one kind of thing | The template string; the noun pairs |
| 3 | Destructive items with icons, mid-menu or styled differently from each other | Menu, item, treatment |
| 4 | Bespoke confirm dialogs; `window.confirm`; Cancel focused for large deletes; no pending label; focus lost on close | Component, and which step is missing |
| 5 | Spinners standing in for agent steps; approvals in modals; per-message avatars | Component |
| 6 | Interim text styled as final; auto-scroll that fights the reader; ambient motion while paused; interim text in a live region | Component and the behaviour |
| 7 | Frequent actions with no key; drag with no keyboard path; Escape handlers that close more than one layer; single keys firing in inputs | Action, and its key or "none" |
| 8 | Launchers with more than two or three choices; text-labelled filter rows; long flat admin lists | Screen, choice count |
| 9 | "No … found" / "No … yet" on user data; empty states with no action | Route, and which case |
| 10 | Status work with only a list; columns out of workflow order; view memory unrecorded | Page and view key |
| 11 | Moves awaiting the server; silent rollbacks; optimistic sends or payments | Mutation and its failure path |
| 12 | Panels nobody acts on; scoped views with their own query | Panel; the two queries |
| 13 | Free text before the field that decides it; errors added beside hints; several primary buttons | Form, field order |

Click through every flow once with the keyboard alone, and once with the network throttled to failure. Report one line per finding with its evidence under `## Open issues`, and fix nothing unless asked.

## Writing back to DESIGN.md

- **`## Patterns`**: the product's nouns, one per kind of thing; the second-line formula; the destructive items and the proof each needs; the shortcut map; which pages remember their view and which default wins; the agent-step conventions.
- **Decisions**, dated, marked by who decided, with the reason: any dial moved off the preset, or a law knowingly broken.
- **Open issues** for every law the code breaks, with evidence, removed when the fix lands.

## Checklist

- [ ] Labels are as short as their action, read the verb, and are sentence case, generated ones included.
- [ ] Row second lines name type and origin in the product's nouns; one noun per kind of thing.
- [ ] Every destructive or session-ending item shares one treatment, last in its menu, with no icon; nothing else borrows it.
- [ ] Confirmations use the system dialog, say what is lost, scale proof to the loss, show progress and return focus.
- [ ] Agent steps are cards with name, arguments and result; approvals are inline; no per-message avatars; the panel is non-modal.
- [ ] Streaming text separates committed from forming, follows only while the reader is at the bottom, and is still when paused.
- [ ] Frequent actions have keys; every drag has a keyboard path; Escape closes one layer; single keys never fire in inputs.
- [ ] Launchers offer only the task's choices; toolbar filters are icons with tooltips; long lists group and collapse.
- [ ] Empty user data offers the first action; filtered-empty names the filter.
- [ ] Staged work has a board in workflow order beside its list; remembered views follow `layout-and-hierarchy` law 9 and are listed under `## Patterns`.
- [ ] Moves are optimistic with a visible rollback; sends, payments and deletes are not.
- [ ] Dashboards run overview, trends, action items, wireframed first, scoped views on the global pipeline.
- [ ] Forms lead with the deciding field; errors replace hints; sign-in is a form alone in its column, its route an `expressive` area if the art moves.
- [ ] Feedback was applied at the size asked, swept product-wide, reported, and recorded as a dated decision.
- [ ] Dials match the preset, or the difference is under `## Decisions`.
