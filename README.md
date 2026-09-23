# Interface Skills

AI skills for building interfaces — typography, colour, layout, surfaces and motion — distilled from the design system running on [modimihir.com](https://modimihir.com), in two packages:

| Package | For | What you get |
|---|---|---|
| **Customize** — `interface-design` | Any project, in its own style | One set of best practices, applied in *your* token names, *your* values and *your* project's character. A setup skill reads your codebase and writes a `DESIGN.md`; five skills work through it. |
| **Glass package** — `glass-package` | Copying modimihir.com's look exactly | The real system, with its real values and drop-in token files and components: two weights, an intent-indexed grey ramp, glass that reads as material, one 640px measure, a 150/200/300ms motion ladder. |

Both install together cleanly — their skill names don't overlap — and the installer asks which you want.

## Installing

**Shell** — nothing to install first:

```sh
curl -fsSL https://raw.githubusercontent.com/Mihirmodi27/interface-skills/main/install.sh | sh
```

**npx** — same installer, if you already have Node:

```sh
npx github:Mihirmodi27/interface-skills
```

Either one asks:

```
Which skills?

  1) Glass package — the exact system from modimihir.com, to copy as-is
  2) Customize — the same practices, fitted to your project's own names and values
  3) Both

Choose 1, 2 or 3 [2]:
```

and installs into `./.claude/skills`. `--package glass|custom|both` answers the question up front (and is what to use in CI, where there's no terminal to ask on — it installs the customizable set otherwise). Skill names install just those skills from either package. `--user` writes to `~/.claude/skills` so they're available in every project, `--dir` puts them somewhere else entirely, and `--force` overwrites copies you already have — without it, anything already installed is left alone:

```sh
curl -fsSL https://raw.githubusercontent.com/Mihirmodi27/interface-skills/main/install.sh | sh -s -- --package both --user
npx github:Mihirmodi27/interface-skills glass-and-depth color-and-theming
./install.sh --help
```

`--update` refreshes whatever is already installed in the folder, with no question — see [Upgrading from 1.x](#upgrading-from-1x). Arguments go after `sh -s --` when the script is piped, because everything before that belongs to `sh` rather than to the script.

**As Claude Code plugins** — the repo is a marketplace with one plugin per package, and `/plugin update` keeps them current:

```
/plugin marketplace add Mihirmodi27/interface-skills
/plugin install interface-design@interface-skills
/plugin install glass-package@interface-skills
```

Install one or both. Or copy a directory by hand — a skill is just a folder:

```sh
cp -R plugins/interface-design/skills/typographic-system  /path/to/project/.claude/skills/
```

Skills load on demand — Claude reads the frontmatter `description` to decide when one is relevant, so you don't need to invoke them by name.

## Customize: the adaptable set

Six skills in [`plugins/interface-design/skills/`](plugins/interface-design/skills/):

| Skill | Covers |
|---|---|
| [`design-system-setup`](plugins/interface-design/skills/design-system-setup/) | Scans the codebase — tokens, fonts, sizes, colours, spacing, radii, shadows, motion, theming — maps what it finds onto shared roles *in your names*, picks a preset from what your reader is doing, measures text contrast, and writes `DESIGN.md` with the open issues it found. Reconciles rather than overwrites on later runs. |
| [`typographic-system`](plugins/interface-design/skills/typographic-system/) | A type ladder assigned by role rather than by ratio, weight as structure rather than emphasis, leading and tracking that scale with size, roles that separate on a different axis once size runs out, numerals, font loading, and prose you can't put classes on. |
| [`color-and-theming`](plugins/interface-design/skills/color-and-theming/) | Tokens indexed by intent rather than lightness, text tiers picked for contrast and kept strictly descending, translucent values for layered surfaces, colour spent structurally, status palettes, and theming without a flash of the wrong theme. |
| [`layout-and-hierarchy`](plugins/interface-design/skills/layout-and-hierarchy/) | A reading measure that doesn't move between templates, spacing that groups, a nested radius ladder, a documented z-index ladder, forked components where the interaction model differs, disclosures that hide rather than unmount, and structural accessibility. |
| [`surfaces-and-depth`](plugins/interface-design/skills/surfaces-and-depth/) | Elevation as a small named ladder of bundles — surface, edge, shadow, layer — layered shadows that hold up in dark themes, translucency as one optional material with every fallback, and when not to use it. |
| [`interface-motion`](plugins/interface-design/skills/interface-motion/) | Motion that makes a change legible: durations set by how much of the screen changes, one standard curve, springs named by character, asymmetric open and close, shared elements, and reduced motion as a real alternative path. |

### How it adapts

**Your names stay yours.** The skills reason in a shared vocabulary of *roles* — `text.secondary`, `radius.card`, `duration.popover` — and `DESIGN.md` maps each role to whatever your project already calls it. If your quietest text is `--ink-whisper`, it stays `--ink-whisper`; the skills just know it's the lowest tier that still has to clear 4.5:1. Where a role has no token yet, setup proposes one in your project's naming style.

**Laws hold everywhere; dials follow the preset.** Every skill separates the two. A law is something whose violation is a bug on any project — a text tier that fails contrast, a caption that outranks its heading, a menu that's slower to close than to open, reduced motion that deletes the signal along with the animation. A dial is a choice of character — how many weights, how high the type scale climbs, how much colour, how long motion runs. Presets set the dials:

| Preset | The reader is… | Character |
|---|---|---|
| `editorial` | reading | The interface disappears; one reading measure, two weights, near-monochrome, short motion |
| `product` | working | Dense and predictable; an app shell, a real status palette, tabular figures, near-instant feedback |
| `expressive` | being persuaded | A real display tier, brand colour used broadly by rule, characterful entrances, a few set pieces |
| `glass` | on a project that has adopted the Glass package | The Glass package's exact values, in your project's names |

Mixed projects are normal — a `product` app can mark its marketing routes `expressive` and its docs `editorial`. Any dial can be overridden; the override goes in `DESIGN.md` with its reason.

**`DESIGN.md` is the contract.** Setup writes it once; every skill reads it before touching UI and writes decisions back when they change. It's a plain markdown file at your project root — tables for anything looked up, a reason for anything decided — so it's as useful to a new teammate as to a model. The format and a template are in [`design-md.md`](plugins/interface-design/skills/design-system-setup/references/design-md.md); the roles in [`roles.md`](plugins/interface-design/skills/design-system-setup/references/roles.md); the presets in [`presets.md`](plugins/interface-design/skills/design-system-setup/references/presets.md).

The adaptable set ships no token files: the right file depends on your stack. Ask for tokens and they're generated in whatever mechanism the project already uses — Tailwind v4 `@theme`, a Tailwind config, CSS custom properties, a JS theme object, a tokens JSON.

**Starting out:** install, then ask Claude to set up the design system. Review the `DESIGN.md` it writes — correct a name, move a dial, answer an open question — and from then on the other skills apply themselves.

## Glass package

Five skills in [`plugins/glass-package/skills/`](plugins/glass-package/skills/), each a `SKILL.md` you can read top to bottom, `references/` for the depth behind each section, and `assets/` with drop-in token files and components:

| Skill | Covers |
|---|---|
| [`glass-typography`](plugins/glass-package/skills/glass-typography/) | A dense small-size role ladder with a deliberately low ceiling, two weights instead of five, leading that runs inverse to size, what a role separates on once size runs out, negative tracking as a large-size correction, emphasis by weight and colour rather than italic or bold, self-hosting with a metric-matched fallback, and styling imported Markdown you can't put classes on. |
| [`glass-motion`](plugins/glass-package/skills/glass-motion/) | A duration ladder tied to how much of the screen changes and the two things allowed off it, one shared easing curve, springs tuned by character, squash-and-stretch from disagreeing springs, shared-element highlights and when to escalate one to the GPU, icon fill as the single signal for *chosen*, set pieces that play once a session, asymmetric open/close, reduced-motion as a branch rather than a switch, rAF-throttled scroll, and synthesised UI sound. |
| [`glass-color`](plugins/glass-package/skills/glass-color/) | A grayscale ramp where each step encodes an intent rather than a lightness, a parallel translucent ramp that inverts to white in dark mode, one accent reserved for focus, how to spend at most one chromatic exception without it spreading, theming by re-tinting tokens under a data attribute, and when a colour belongs in `:root` rather than `@theme`. |
| [`glass-and-depth`](plugins/glass-package/skills/glass-and-depth/) | Translucent surfaces that read as material rather than glassmorphism: blur scaled to how little you know about the backdrop, saturation to stop the blur going grey, tint that carries legibility when the blur is compromised, and the depth cues glass can't float without — hairline, layered shadow, continuous corners. Plus gradient 1px strokes with no wrapper, glows weighted to read as emission, text-over-glass contrast, the cost model, and every fallback. |
| [`glass-layout`](plugins/glass-package/skills/glass-layout/) | One reading measure every page shares, rails anchored outside it, asymmetric spacing that groups rather than separates, a nested radius ladder with continuous corners, a documented z-index ladder, two presentations instead of one responsive layout — forked by device *or* by the reader — disclosures that hide content rather than unmounting it, and content gating so there are no empty states. |

`glass-color` and `glass-and-depth` are deliberately split along one seam: **the first owns the tints, the second owns the surfaces built from them.** Install both if you're using glass — `color-tokens.css` declares the tints that `glass.css` consumes.

### Using the assets

The `assets/` directories are meant to be copied, not imported:

| File | Drop into |
|---|---|
| `glass-typography/assets/type-tokens.css` | Your stylesheet — Tailwind v4 `@theme` plus a plain-CSS fallback |
| `glass-color/assets/color-tokens.css` | Same. Both ramps, both themes, glass tints, focus ring |
| `glass-and-depth/assets/glass.css` | Same. The three material classes, `@supports` baseline, both fallbacks, the `.dock-shadow` elevation class, the gradient-stroke panel. Needs `color-tokens.css` for its tints |
| `glass-motion/assets/motion-tokens.css` | Same. Easing, durations, reveal, route fade, theme crossfade |
| `glass-layout/assets/layout-tokens.css` | Same. Column, continuous corners, skip link, print styles |
| `*/assets/*.ts` · `*.tsx` | Your source tree. React 19 + [Motion](https://motion.dev) + Tailwind v4 |

The CSS files are designed to coexist — one `@theme` block each, no overlapping token names, no duplicated rules.

### Both together

Install both and run setup, and it offers the `glass` preset: `DESIGN.md` is filled with the Glass package's values — in your project's names wherever it already has them — the adaptable skills apply the laws, and the Glass skills supply the exact recipes and components behind each value. It's the way to start from the Glass look and then let a project grow out of it on the record, one `Decisions` entry at a time.

## Ideas that recur across the set

A few principles do most of the work, and they show up in every skill — in both packages:

**Index by intent, not by magnitude.** A ramp step is "the colour a border is," not "a bit darker than the last one." A type size belongs to a role, not to a position on a modular scale. A duration is set by how much of the screen changes, not by how important the element feels. Once the system is indexed by intent, picking a value stops being a judgement call and mistakes become reviewable without a colour picker.

**Spend the loud thing once, and justify it structurally.** One accent colour, on the focus ring. One genuinely playful animation. One family, two weights. One chromatic element, and only because it's an *offer* rather than content — a justification that can't apply to anything else on the page. In a restrained system a single exuberant moment reads as craft; three read as a template. The test for an exception isn't whether it looks good, it's whether the reason it exists is narrow enough that it can't spread.

**When one signal goes, audit the ones that were riding beside it.** Collapse a type ladder and roles that were separated by size have to separate on weight, leading or a rule instead — and each on a *different* one, or they collide. A decoration that looked fine next to a size step often turns out to have been decorative in the literal sense: a pull quote's 2px hairline was invisible on a white page and nobody noticed while the quote was also two sizes larger.

**Asymmetry is the signal.** 44px above a heading and 12px below is what makes it belong to the paragraph that follows. Springs on the way in, flat tweens on the way out. Entrances can have character; exits should get out of the way.

**Substitute, don't subtract.** Every accessibility preference gets a real alternative path, not an `!important` override that strips the signal along with the decoration. Reduced motion still shows you the menu opened. Reduced transparency gets a solid surface, not a broken one.

**Two components beat one branchy component.** Where the interaction model genuinely differs — pointer versus touch, or two ways of looking at one collection — fork the container and share the data. Where only the arrangement differs, use breakpoints. When the fork is the reader's choice rather than the device's, the state belongs in a module both sides subscribe to, and it should usually *not* persist: remember a preference about the reader, not about the thing they were looking at.

**Decide before the first pixel what the first pixel depends on.** A theme, whether a greeting plays, whether a set piece has been seen — all come from storage the server can't read. Settle them in a blocking inline script that stamps an attribute on the root, let CSS answer from that attribute at paint, and let the component only *end* the state. Anything client-only that reaches React must branch transitions, never rendered styles, or hydration has two first paints to reconcile.

**No empty states for content you curate.** An empty collection loses its nav entry, its route, and its section. There's nothing to show an empty state for because there's no way to reach it.

## Upgrading from 1.x

Version 1 shipped the five Glass skills under their plain names (`typographic-system`, `color-and-theming`, …) as one plugin called `design-skills`. In 2.0 those names belong to the adaptable set, and the Glass skills are prefixed:

| 1.x | 2.0 Glass package |
|---|---|
| `typographic-system` | `glass-typography` |
| `interface-motion` | `glass-motion` |
| `color-and-theming` | `glass-color` |
| `layout-and-hierarchy` | `glass-layout` |
| `glass-and-depth` | `glass-and-depth` |

**Installed as a plugin:** nothing to do. The marketplace maps `design-skills` to `glass-package`, so the next time Claude Code starts after the marketplace refreshes, it loads the plugin under its new name, rewrites your settings to match and says so once. Third-party marketplaces don't refresh on their own unless you turn on auto-update for them in `/plugin` → Marketplaces; otherwise run `/plugin marketplace update interface-skills` once. This needs Claude Code 2.1.193 or later. If Claude Code reports a plugin cache miss, run `/plugin install glass-package@interface-skills`.

**Installed with the shell or npx installer:** copies on disk can't be reached from here, so run one command:

```sh
curl -fsSL https://raw.githubusercontent.com/Mihirmodi27/interface-skills/main/install.sh | sh -s -- --update
```

`--update` finds every interface skill in the folder, refreshes the 2.0 ones, and moves 1.x copies to their Glass names — keeping the exact system you installed rather than swapping in a different skill under the same name. Add `--user` if you installed with `--user`. Running the installer without `--update` spots 1.x copies too, and asks before moving them. From then on, `--update` is how any copy stays current.

## Provenance

The reference implementation is a React 19 / Next.js / Tailwind v4 portfolio. Its colour semantics follow [Vercel's Geist](https://vercel.com/geist) grayscale; its materials and continuous corners follow Apple's platform conventions; its motion is [Motion](https://motion.dev) for springs and presence with CSS for everything else. The adaptable set keeps the reasoning and drops the stack: its laws and checklists work as a review pass against any implementation.

## Licence

MIT — see [LICENSE](LICENSE).
