# Design Skills

Five AI skills that encode a design system for text-heavy interfaces — typography, motion, colour, glass, and structure — distilled from the system running on [modimihir.com](https://modimihir.com).

They're written to be **portable**: each one teaches the transferable principle first and uses the real implementation as the worked example. The numbers are copyable defaults, not a spec you have to adopt whole.

## The skills

| Skill | Covers |
|---|---|
| [`typographic-system`](skills/typographic-system/) | A dense small-size role ladder, two weights instead of five, leading that runs inverse to size, negative tracking that scales with size, emphasis by weight and colour rather than italic or bold, and the split between UI copy and reading copy. |
| [`interface-motion`](skills/interface-motion/) | A duration ladder tied to how much of the screen changes, one shared easing curve, springs tuned by character, squash-and-stretch from disagreeing springs, shared-element highlights, asymmetric open/close, reduced-motion as a branch rather than a switch, rAF-throttled scroll, and synthesised UI sound. |
| [`color-and-theming`](skills/color-and-theming/) | A grayscale ramp where each step encodes an intent rather than a lightness, a parallel translucent ramp that inverts to white in dark mode, one accent reserved for focus, theming by re-tinting tokens under a data attribute, and when a colour belongs in `:root` rather than `@theme`. |
| [`glass-and-depth`](skills/glass-and-depth/) | Translucent surfaces that read as material rather than glassmorphism: blur scaled to how little you know about the backdrop, saturation to stop the blur going grey, tint that carries legibility when the blur is compromised, and the depth cues glass can't float without — hairline, layered shadow, continuous corners. Plus text-over-glass contrast, the cost model, and every fallback. |
| [`layout-and-hierarchy`](skills/layout-and-hierarchy/) | One reading measure every page shares, rails anchored outside it, asymmetric spacing that groups rather than separates, a nested radius ladder with continuous corners, a documented z-index ladder, two presentations instead of one responsive layout, and content gating so there are no empty states. |

Each skill is a `SKILL.md` you can read top to bottom, `references/` for the depth behind each section, and `assets/` with drop-in token files and components.

`color-and-theming` and `glass-and-depth` are deliberately split along one seam: **the first owns the tints, the second owns the surfaces built from them.** Glass tints are colour tokens that re-tint per theme; blur radii and shadow stacks are surface craft. Install both if you're using glass — `color-tokens.css` declares the tints that `glass.css` consumes.

## Ideas that recur across the set

A few principles do most of the work, and they show up in every skill:

**Index by intent, not by magnitude.** A ramp step is "the colour a border is," not "a bit darker than the last one." A type size belongs to a role, not to a position on a modular scale. A duration is set by how much of the screen changes, not by how important the element feels. Once the system is indexed by intent, picking a value stops being a judgement call and mistakes become reviewable without a colour picker.

**Spend the loud thing once.** One accent colour, on the focus ring. One genuinely playful animation. One family, two weights. In a restrained system a single exuberant moment reads as craft; three read as a template.

**Asymmetry is the signal.** 44px above a heading and 12px below is what makes it belong to the paragraph that follows. Springs on the way in, flat tweens on the way out. Entrances can have character; exits should get out of the way.

**Substitute, don't subtract.** Every accessibility preference gets a real alternative path, not an `!important` override that strips the signal along with the decoration. Reduced motion still shows you the menu opened. Reduced transparency gets a solid surface, not a broken one.

**Two components beat one branchy component.** Where the interaction model genuinely differs — pointer versus touch — fork the container and share the data. Where only the arrangement differs, use breakpoints.

**No empty states.** An empty collection loses its nav entry, its route, and its section. There's nothing to show an empty state for because there's no way to reach it.

## Installing

Copy a skill directory into your project's or user-level skills folder:

```sh
# Project-scoped
cp -R skills/typographic-system  /path/to/project/.claude/skills/

# Or user-level, available everywhere
cp -R skills/interface-motion  ~/.claude/skills/
```

Skills load on demand — Claude reads the frontmatter `description` to decide when one is relevant, so you don't need to invoke them by name. Install all five for a coherent system, or just the one you need.

## Using the assets

The `assets/` directories are meant to be copied, not imported:

| File | Drop into |
|---|---|
| `typographic-system/assets/type-tokens.css` | Your stylesheet — Tailwind v4 `@theme` plus a plain-CSS fallback |
| `color-and-theming/assets/color-tokens.css` | Same. Both ramps, both themes, glass tints, focus ring |
| `glass-and-depth/assets/glass.css` | Same. The three material classes, `@supports` baseline, both fallbacks. Needs `color-tokens.css` for its tints |
| `interface-motion/assets/motion-tokens.css` | Same. Easing, durations, reveal, route fade, theme crossfade |
| `layout-and-hierarchy/assets/layout-tokens.css` | Same. Column, continuous corners, skip link, print styles |
| `*/assets/*.ts` · `*.tsx` | Your source tree. React 19 + [Motion](https://motion.dev) + Tailwind v4 |

The CSS files are designed to coexist — one `@theme` block each, no overlapping token names, no duplicated rules.

## Provenance and adaptation

The reference implementation is a React 19 / Vite / Tailwind v4 portfolio. Its colour semantics follow [Vercel's Geist](https://vercel.com/geist) grayscale; its materials and continuous corners follow Apple's platform conventions; its motion is [Motion](https://motion.dev) for springs and presence with CSS for everything else.

Swap the family, swap the hex values, swap the framework. What transfers is the indexing — and the checklist at the end of each skill works as a review pass against any implementation.

## Licence

MIT — see [LICENSE](LICENSE).
