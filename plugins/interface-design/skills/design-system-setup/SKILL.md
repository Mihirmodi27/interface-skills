---
name: design-system-setup
description: Fit the interface skills to a project by writing its DESIGN.md — read the existing interface (its tokens, type, colour, spacing, radii, elevation and motion, and the names it already uses for them), map it onto the canonical roles every skill in the adaptable interface-design set works in, pick a preset (editorial, product, expressive, or glass) from what the reader is doing, and list where the code breaks the laws. Use when starting interface work on a project that has no DESIGN.md, when another interface skill finds DESIGN.md missing, when the user asks to set up, document, extract, audit or reconcile a design system, when adopting these skills on an existing codebase, when tokens have drifted from what DESIGN.md says, or when choosing a design character for a new project.
---

# Design System Setup

The other skills in this set know *how* a type ladder, a colour system or a motion system should behave. They don't know *your* project: what it calls its greys, which font it ships, whether it has a dark theme, whether its reader is skimming a dashboard or reading an essay. This skill finds out, once, and writes it down in `DESIGN.md` at the project root — so every later session, and every other skill, starts from the same facts.

The job is **translation, not replacement.** A project that calls its quietest text `whisper` keeps calling it `whisper`. What setup adds is the knowledge that `whisper` is `text.tertiary` — the lowest tier that still has to be readable — so the colour skill can check it clears 4.5:1 and the type skill can put captions on it.

Three files in `references/` are the contract, and are worth reading before the first run:

- `roles.md` — the canonical roles, and which ones may share a token
- `presets.md` — the four starting characters, and how to choose between them
- `design-md.md` — the file's format, a template, and how to reconcile an existing one

## 0. If `DESIGN.md` already exists

Don't regenerate it. Read it, rescan, and **reconcile**: report what drifted since it was written (new tokens, changed values, fixed or new issues), propose edits, and keep every name and every `Decisions` entry the user chose. Then stop — a second run is an audit, not a rewrite. The rest of this file is the first run.

## 1. Scan

Run the inventory from the project root:

```sh
node <this skill>/scripts/scan.mjs . --ignore src/content
```

`--ignore` takes a path prefix and repeats; use it for directories that hold prose, documentation or code samples rather than UI, or their example values will be counted as the project's. The script prints a markdown inventory: the stack, where custom properties are declared, and every value by frequency — colours, sizes, weights, leading, tracking, measures, spacing, radii, z-indices, shadows, backdrop filters, durations, easings, springs, breakpoints — plus signals for theming, reduced motion, focus handling and font loading. `--json` gives the whole thing.

Then read the files it points at. The scan is evidence, not a verdict: it reads source text, so it can't see a value computed at runtime, a class assembled from strings, or a theme object passed through a provider. Open the top token file and the root layout, and read two or three representative components end to end — a page, a card, a menu. `references/detection.md` lists where each stack keeps its tokens and what to look for.

**Frequency is the signal.** A size used in 40 files is a role. A size used once is a stray or a genuine one-off, and the difference is worth a look, not an assumption.

## 2. Map what's there onto the roles

Go domain by domain and fill the mapping: for each canonical role in `roles.md`, which of the project's names does that job, and what value does it hold? Work from usage, not from names — a token called `gray-500` that every caption uses *is* `text.tertiary`, whatever its name suggests.

Four things to watch for, because they are where most projects have quietly broken a law:

- **One token doing two jobs.** A grey used both for borders and for text is the classic — a border needs 3:1, text needs 4.5:1, and one value can rarely be right for both. Record the coupling as an open issue; don't split it yet.
- **A job with no token.** Captions at six different greys, or durations typed inline everywhere. The role exists; the project just never named it. Propose a name in the project's style (`design-md.md` says how to detect the style) and mark it `proposed`.
- **Roles the project has that the list doesn't.** A `keyline`, a `pull-quote`, a `kicker`. Keep them as project roles under their nearest canonical parent, and note what separates each from its parent — size, weight, leading, colour or a rule. If nothing does, that's a finding.
- **Values that aren't on any ladder.** Twenty-three distinct font sizes, fourteen radii. Cluster them: which values carry most of the usage, and which could snap to a neighbour with no visible change? Propose the ladder; list the strays.

Compute contrast rather than estimating it:

```sh
node <this skill>/scripts/contrast.mjs --ladder "#ffffff" "#16161a" "#4b4b52" "#6b6b73"
```

`--ladder` takes a surface and then the text tiers, top first, and checks that each clears 4.5:1 **and** that they stay strictly descending — a ladder where every tier passes but two are indistinguishable has lost its hierarchy. Run it per theme, against the worst surface each tier actually lands on, and use `--min 3` for icons, borders and the focus ring.

## 3. Choose the preset

Decide what the reader is mostly doing — reading, working, or being persuaded — and propose `editorial`, `product` or `expressive` accordingly (`presets.md`). Offer `glass` only if the Glass package skills (`glass-typography` and its siblings) are installed — they'll be among your available skills, or in `.claude/skills/` or `~/.claude/skills/`. Choosing it fills the dials from those skills' values, written into `DESIGN.md` under the project's existing names wherever it has them.

Say what evidence you used: *"Mostly long-form pages under `app/blog`, two weights in use, one accent — this reads as `editorial`."* Mixed projects get a base preset and areas: `product`, with `app/(marketing)/** → expressive`.

Where the code already contradicts the preset — a `product` codebase with five weights — that's not a reason to change the preset. It's either a decision to record (with its reason) or an issue to list.

## 4. Ask only what the code can't answer

Most of `DESIGN.md` comes from the scan. Ask the user about what can't be read from code, and nothing else — at most four questions, each with your recommendation as the first option:

1. **The preset**, if the evidence doesn't settle it, or if you're proposing something the codebase doesn't yet look like.
2. **Themes**, if only one exists: is a second one planned? It changes how tokens should be structured now.
3. **Couplings you found**, if splitting one would change what users see — "captions and borders share `gray-500`; split them?"
4. **Names**, only where you're proposing several new ones at once and the project's style is ambiguous.

Don't ask about anything you can find out. Don't ask for approval of the whole mapping; write it, and let the user correct the file.

## 5. Write `DESIGN.md`

Follow `references/design-md.md`: the project's names in the `Name here` column, canonical roles in the `Role` column, values as the source states them, measured contrast for every text tier, per-theme columns only where themes exist, and nothing for roles the project doesn't have.

Then the two sections that make the file useful later:

- **`## Decisions`** — every dial the project sets differently from its preset, with the reason if you know it and a question mark if you don't.
- **`## Open issues`** — every law the code currently breaks, with the evidence (a ratio, a count, a file). One line each. This is a findings list, so **don't fix anything** unless the user asks; a setup run that also rewrites forty components is impossible to review.

Finish by telling the user, briefly: the preset and why, how many roles mapped cleanly, what you proposed names for, and the three most important open issues.

## 6. Generating tokens, only when asked

The adaptable set ships no token files, because the right file depends on the stack. If the user asks for tokens — for a new project, or to fill the `proposed` rows — generate them **in the project's existing mechanism**: a Tailwind v4 `@theme` block, a `tailwind.config` extension, CSS custom properties, a JS theme object, a design-tokens JSON. Match the file layout and naming already there; don't introduce a second token system beside the first.

For a project with no tokens yet, `presets.md` and each skill's `## Dials` section give defaults. Say that they are defaults, pick names with the user, and record the choices in `DESIGN.md` as you go.

## How the other skills use this file

Every skill in the adaptable set starts the same way: read `DESIGN.md`, find its own section, and work in the project's names. If the file is missing, a skill runs a narrow version of steps 1–2 for its own domain, does the task, and recommends running this skill — it doesn't refuse to work.

When a skill makes a decision that changes the system — a new role, a moved dial, a law knowingly broken — it writes that back under `Decisions`. That's what keeps the file true after the first day.

## Checklist

- [ ] An existing `DESIGN.md` was reconciled, not overwritten, and every user-chosen name and decision survived.
- [ ] The scan ignored directories of prose and examples, and its findings were checked against the code.
- [ ] Every mapped role is mapped by **usage**, not by what the token is called.
- [ ] The project's names appear unchanged; new names are marked `proposed` and follow the project's own style.
- [ ] Project roles are recorded under a canonical parent, each with the signal that separates it.
- [ ] Tokens doing two jobs are listed as issues, not silently split.
- [ ] Every text tier has a measured ratio, per theme, against its worst surface, and the ladder is strictly descending.
- [ ] The preset is justified by evidence about the reader; mixed projects list their areas by path.
- [ ] `glass` was offered only with the Glass package installed.
- [ ] At most four questions, each about something the code couldn't answer.
- [ ] Open issues list evidence; nothing was fixed without being asked.
- [ ] Any generated tokens use the project's existing mechanism and naming.
