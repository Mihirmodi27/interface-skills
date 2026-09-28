---
name: design-system-setup
description: "Fit the interface skills to a project by writing its DESIGN.md — map the existing interface's tokens and the names it already uses (type, colour, spacing, radii, elevation, motion) onto the canonical roles the adaptable interface-design set works in, pick a preset (editorial, product, expressive or glass) from what the reader is doing, and list where the code breaks the laws. Use when starting interface work on a project that has no DESIGN.md, when another interface skill finds DESIGN.md missing, when the user asks to set up, document, extract, audit or reconcile a design system, when adopting these skills on an existing codebase, when tokens have drifted from what DESIGN.md says, or when choosing a design character for a new project."
---

# Design System Setup

The other skills in this set know how a type ladder, a colour system or a motion system should behave. They don't know *your* project: what it calls its greys, which font it ships, whether it has a dark theme, whether its reader is skimming a dashboard or reading an essay. This skill finds out once and writes it down in `DESIGN.md` at the project root, so every later session and every other skill starts from the same facts.

The job is **translation, not replacement.** A project that calls its quietest text `whisper` keeps calling it `whisper`; setup records that `whisper` is `text.tertiary`, the lowest tier that must still be readable, so the colour skill can check it clears 4.5:1 and the type skill can put captions on it.

The contract lives in `references/`: `roles.md` (the canonical roles, and which may share a token), `presets.md` (the four starting characters and how to choose), `design-md.md` (the file's format, a template, and how to reconcile).

## 0. If `DESIGN.md` already exists

Don't regenerate it. Rescan and **reconcile**: report what drifted (new tokens, changed values, issues fixed or new), propose edits, and keep every name and `Decisions` entry the user chose. A second run is an audit, not a rewrite; the rest of this file is the first run.

## 1. Scan

From the project root:

```sh
node <this skill>/scripts/scan.mjs . --ignore src/content
```

`--ignore` takes a path prefix and repeats; use it for directories of prose, documentation or code samples, or their example values count as the project's. The output is a markdown inventory — the stack, where custom properties are declared, every value by frequency, and signals for theming, reduced motion, focus handling and font loading. `--json` gives everything.

The scan reads source text, so it can't see a value computed at runtime, a class assembled from strings, or a theme passed through a provider. Open the top token file and the root layout, and read a page, a card and a menu end to end. `references/detection.md` lists where each stack keeps its tokens.

**Frequency is the signal.** A size used in 40 files is a role; a size used once is a stray or a genuine one-off, and deserves a look rather than an assumption.

## 2. Map what's there onto the roles

For each canonical role in `roles.md`: which of the project's names does that job, and with what value? Map by usage, not by name — a `gray-500` that every caption uses *is* `text.tertiary`.

Five places projects have quietly broken a law:

- **One token doing two jobs.** A grey used for borders and text: a border needs 3:1, text 4.5:1, and one value rarely serves both. Record the coupling as an open issue; don't split it yet.
- **A job with no token.** Captions at six greys, durations typed inline. Propose a name in the project's style (`design-md.md` says how to detect it) and mark it `proposed`.
- **Roles the list doesn't have.** A `keyline`, a `pull-quote`, a `kicker`: record each as a project role under its nearest canonical parent, with what separates it — size, weight, leading, colour or a rule. If nothing does, that's a finding.
- **Boxes as the default.** Every section, stat and list in a card, cards inside cards, a bento grid of unlike sections, tinted strips behind labels, uppercase eyebrows, several chip shapes, a second highlight hue, done states in success colour. Count the boxes per main screen and list each that holds more than one object (`surfaces-and-depth` law 2, `layout-and-hierarchy` law 3). If the user has a reference interface they've already approved, screenshot each main screen beside it; the gaps are open issues.
- **Values on no ladder.** Twenty-three font sizes, fourteen radii. Cluster them by usage, propose the ladder, list the strays that could snap to a neighbour unseen.

Compute contrast; don't estimate it:

```sh
node <this skill>/scripts/contrast.mjs --ladder "#ffffff" "#16161a" "#4b4b52" "#6b6b73"
```

`--ladder` takes a surface then the text tiers, top first, and checks each clears 4.5:1 **and** that they strictly descend — every tier passing while two are indistinguishable means the hierarchy is gone. Run it per theme against the worst surface each tier lands on; use `--min 3` for icons, borders and the focus ring.

## 3. Choose the preset

From what the reader is mostly doing — reading, working, or being persuaded — propose `editorial`, `product` or `expressive` (`presets.md`). Offer `glass` only if the Glass package skills (`glass-typography` and its siblings) are installed, among your available skills or in your agent's skills folder (`.claude/skills/`, `.agents/skills/`, or the global one in your home directory); it fills the dials from their values, under the project's existing names wherever it has them.

State the evidence: *"Mostly long-form pages under `app/blog`, two weights in use, one accent — this reads as `editorial`."* Mixed projects get a base preset plus areas: `product`, with `app/(marketing)/** → expressive`.

Code that contradicts the preset — a `product` codebase with five weights — doesn't change the preset. It's a decision to record with its reason, or an issue to list.

## 4. Ask only what the code can't answer

At most four questions, each with your recommendation first:

1. **The preset**, if the evidence doesn't settle it or you're proposing something the codebase doesn't yet look like.
2. **Themes**, if only one exists: is a second planned? It changes how tokens should be structured now.
3. **Couplings**, where splitting one changes what users see — "captions and borders share `gray-500`; split them?"
4. **Names**, only when proposing several at once and the project's style is ambiguous.

Don't ask what you can find out, and don't ask for approval of the whole mapping — write it and let the user correct the file.

## 5. Write `DESIGN.md`

Follow `references/design-md.md`: the project's names in `Name here`, canonical roles in `Role`, values as the source states them, measured contrast for every text tier, per-theme columns only where themes exist, nothing for roles the project lacks. Then:

- **`## Decisions`** — every dial set differently from the preset, with its reason, or a question mark if unknown.
- **`## Open issues`** — every law the code breaks, one line each with evidence (a ratio, a count, a file). **Don't fix anything** unless asked; a setup run that also rewrites forty components can't be reviewed.

Tell the user briefly: the preset and why, how many roles mapped cleanly, what you proposed names for, and the three most important open issues.

## 6. Generating tokens, only when asked

The set ships no token files, because the right file depends on the stack. Asked for tokens — for a new project, or to fill `proposed` rows — generate them **in the project's existing mechanism**: a Tailwind v4 `@theme` block, a `tailwind.config` extension, CSS custom properties, a JS theme object, a design-tokens JSON. Match the existing layout and naming; never add a second token system beside the first.

With no tokens yet, `presets.md` and each skill's `## Dials` section give defaults. Say they're defaults, choose names with the user, and record the choices in `DESIGN.md`.

## How the other skills use this file

Each skill in the set reads `DESIGN.md`, finds its section, and works in the project's names. If the file is missing, it runs steps 1–2 for its own domain, does the task and recommends this skill — it doesn't refuse. A decision that changes the system — a new role, a moved dial, a law knowingly broken — goes back under `Decisions`, which is what keeps the file true after the first day.

## Checklist

- [ ] An existing `DESIGN.md` was reconciled, not overwritten; every user-chosen name and decision survived.
- [ ] The scan ignored prose and example directories, and its findings were checked against the code.
- [ ] Every role is mapped by **usage**, not by what the token is called.
- [ ] The project's names are unchanged; new names are `proposed` and in the project's style.
- [ ] Project roles sit under a canonical parent, each with the signal that separates it.
- [ ] Tokens doing two jobs are listed as issues, not silently split.
- [ ] Boxes per main screen counted; every card holding more than one object, every nested card and every tile grid listed as an issue.
- [ ] Every text tier has a measured ratio per theme against its worst surface, and the ladder strictly descends.
- [ ] The preset is justified by evidence about the reader; mixed projects list areas by path.
- [ ] `glass` was offered only with the Glass package installed.
- [ ] At most four questions, each about something the code couldn't answer.
- [ ] Open issues carry evidence; nothing was fixed without being asked.
- [ ] Generated tokens use the project's existing mechanism and naming.
