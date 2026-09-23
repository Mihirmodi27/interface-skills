#!/usr/bin/env node
/**
 * Inventory the design values a codebase actually uses, with no dependencies.
 *
 *   node scan.mjs [root]            a markdown summary, top values first
 *   node scan.mjs [root] --json     everything, for when the summary isn't enough
 *   node scan.mjs [root] --ignore src/content --ignore docs
 *                                   leave out paths holding prose or examples, not UI
 *
 * This is evidence, not a verdict. It counts what's written in the source —
 * custom properties, Tailwind utilities, raw CSS values, motion configs — so that
 * setup can see which values are the system and which are strays. Frequency is
 * the signal: a size used 400 times is a role, a size used twice is a question.
 *
 * It reads text, not a compiled stylesheet, so it can't resolve a value computed
 * at runtime or a class built by string concatenation. When the summary and the
 * code disagree, the code wins — open the file the summary points at.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";

const argv = process.argv.slice(2);
const json = argv.includes("--json");
const ignores = [];
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--ignore") ignores.push(argv[++i] ?? "");
  else if (!argv[i].startsWith("-")) positional.push(argv[i]);
}
const root = positional[0] ?? ".";
if (!existsSync(root)) {
  console.error(`scan: no such directory: ${root}`);
  process.exit(1);
}

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", ".nuxt", ".output", ".svelte-kit", ".turbo",
  ".vercel", ".cache", "dist", "build", "out", "coverage", "vendor",
  "storybook-static", ".claude", "public", "static",
]);
const STYLE = new Set([".css", ".scss", ".sass", ".less", ".pcss", ".styl"]);
const MARKUP = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".vue", ".svelte", ".astro", ".html", ".mdx"]);

/* ── Walk ─────────────────────────────────────────────────────────────────── */

const files = [];
(function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.isDirectory() && e.name !== ".storybook") continue;
    const path = join(dir, e.name);
    if (ignores.some((ig) => ig && relative(root, path).startsWith(ig))) continue;
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path);
    } else if (STYLE.has(extname(e.name)) || MARKUP.has(extname(e.name))) {
      if (/\.min\.|\.d\.ts$|\.test\.|\.spec\.|\.stories\./.test(e.name)) continue;
      if (statSync(path).size > 1_000_000) continue;
      files.push(path);
    }
  }
})(root);

/* ── Tallies ──────────────────────────────────────────────────────────────── */

const tallies = {};
function count(bucket, value, file) {
  const v = String(value).trim().replace(/\s+/g, " ");
  if (!v) return;
  tallies[bucket] ??= new Map();
  const entry = tallies[bucket].get(v) ?? { n: 0, files: new Set() };
  entry.n++;
  entry.files.add(relative(root, file));
  tallies[bucket].set(v, entry);
}

/** Custom property definitions: name → the values it's given, and where. */
const props = new Map();
const propUses = new Map();
/**
 * Every class-like word in markup, variant prefixes stripped, so a Tailwind v4
 * `@theme` token (`--color-ink-soft`) can be credited with its utility uses
 * (`text-ink-soft`, `hover:border-ink-soft/50`) and not only its `var()` uses.
 */
const classWords = new Map();

const signals = {};
function signal(name, file) {
  signals[name] ??= new Set();
  signals[name].add(relative(root, file));
}

/** Tailwind's scale names, so `text-sm` counts as a size and `text-red-500` doesn't. */
const TW_SIZE = "xs|sm|base|md|lg|xl|[2-9]xl";
const TW_PREFIX = String.raw`(?<![\w-])(?:[a-z0-9-]+:)*!?`;
const tw = (body) => new RegExp(TW_PREFIX + body + String.raw`(?![\w-])`, "g");

const RULES = [
  // [bucket, regex, group index, only in]
  ["color.literal", /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)/g, 0, "all"],
  ["font-size", /font-size\s*:\s*([^;}"'\n]+)/g, 1, "all"],
  ["font-size", tw(`text-(${TW_SIZE})`), 1, "markup"],
  ["font-size", tw(String.raw`text-\[(\d[\d.]*(?:px|rem|em))\]`), 1, "markup"],
  ["font-weight", /font-weight\s*:\s*([^;}"'\n]+)/g, 1, "all"],
  ["font-weight", tw("font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)"), 1, "markup"],
  ["font-weight", tw(String.raw`font-\[(\d+)\]`), 1, "markup"],
  ["line-height", /line-height\s*:\s*([^;}"'\n]+)/g, 1, "all"],
  ["line-height", tw(String.raw`leading-(none|tight|snug|normal|relaxed|loose|\d+|\[[^\]]+\])`), 1, "markup"],
  ["letter-spacing", /letter-spacing\s*:\s*([^;}"'\n]+)/g, 1, "all"],
  ["letter-spacing", tw(String.raw`tracking-(tighter|tight|normal|wide|wider|widest|\[[^\]]+\])`), 1, "markup"],
  ["font-family", /font-family\s*:\s*([^;}\n]+)/g, 1, "all"],
  ["font-style", /font-style\s*:\s*(italic|oblique)/g, 1, "all"],
  ["font-style", tw("(italic)"), 1, "markup"],
  ["radius", /border-radius\s*:\s*([^;}"'\n]+)/g, 1, "all"],
  ["radius", tw(String.raw`rounded(?:-[trblse]{1,2})?(?:-(none|xs|sm|md|lg|xl|2xl|3xl|full|\[[^\]]+\]))?`), 0, "markup"],
  ["z-index", /z-index\s*:\s*([^;}"'\n]+)/g, 1, "all"],
  ["z-index", tw(String.raw`-?z-(\d+|\[[^\]]+\])`), 0, "markup"],
  ["shadow", /box-shadow\s*:\s*([^;}\n]+)/g, 1, "all"],
  ["shadow", tw(String.raw`shadow(?:-(xs|sm|md|lg|xl|2xl|inner|none|\[[^\]]+\]))?`), 0, "markup"],
  ["backdrop", /backdrop-filter\s*:\s*([^;}\n]+)/g, 1, "all"],
  ["backdrop", tw(String.raw`backdrop-(?:blur|saturate)(?:-[a-z0-9\[\].%]+)?`), 0, "markup"],
  ["max-width", /(?<!\(\s*)max-width\s*:\s*([^;}"'\n]+)/g, 1, "all"],
  ["max-width", tw(String.raw`max-w-([a-z0-9]+|\[[^\]]+\])`), 1, "markup"],
  ["spacing", tw(String.raw`(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-(\d+(?:\.5)?|px|\[[^\]]+\])`), 1, "markup"],
  ["duration", /(?:transition|animation)(?:-duration)?\s*:[^;}\n]*?(\d*\.?\d+m?s)\b/g, 1, "all"],
  ["duration", tw(String.raw`duration-(\d+|\[[^\]]+\])`), 1, "markup"],
  ["duration", /\bduration\s*:\s*(\d*\.?\d+)\b/g, 1, "markup"],
  ["easing", /cubic-bezier\([^)]*\)/g, 0, "all"],
  ["easing", /\b(?:ease|ease-in|ease-out|ease-in-out|linear)(?=[\s;,"'])/g, 0, "style"],
  ["easing", /\bease\s*:\s*(\[[^\]]*\]|"[^"]*"|'[^']*')/g, 1, "markup"],
  ["spring", /stiffness\s*:\s*(\d+)[^}]*?damping\s*:\s*(\d+)(?:[^}]*?mass\s*:\s*([\d.]+))?/g, "spring", "markup"],
  ["breakpoint", /@media[^{]*?\((?:min|max)-width\s*:\s*([^)]+)\)/g, 1, "style"],
  ["breakpoint", /(?<![\w-])(sm|md|lg|xl|2xl):(?=[a-z!-])/g, 1, "markup"],
];

const SIGNALS = [
  ["theme: prefers-color-scheme", /prefers-color-scheme/],
  ["theme: data-theme attribute", /data-theme/],
  ["theme: .dark class / dark: variant", /\.dark\b|(?<![\w-])dark:/],
  ["theme: color-scheme declared", /color-scheme\s*:/],
  ["a11y: prefers-reduced-motion", /prefers-reduced-motion|useReducedMotion|motion-reduce:|motion-safe:/],
  ["a11y: prefers-reduced-transparency", /prefers-reduced-transparency/],
  ["a11y: prefers-contrast", /prefers-contrast/],
  ["a11y: :focus-visible", /:focus-visible|focus-visible:/],
  ["a11y: bare :focus (check it isn't the ring)", /:focus(?![-\w])/],
  ["a11y: outline removed", /outline\s*:\s*(none|0)\b|outline-none/],
  ["tailwind v4 @theme block", /@theme\b/],
  ["css layers", /@layer\b/],
  ["font: @font-face", /@font-face/],
  ["font: next/font", /from\s+["']next\/font\//],
  ["font: Google Fonts link", /fonts\.googleapis\.com/],
  ["numerals: tabular-nums", /tabular-nums|font-variant-numeric/],
];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const kind = STYLE.has(extname(file)) ? "style" : "markup";

  for (const [bucket, re, group, only] of RULES) {
    if (only !== "all" && only !== kind) continue;
    for (const m of text.matchAll(re)) {
      if (group === "spring") count(bucket, `stiffness ${m[1]}, damping ${m[2]}${m[3] ? `, mass ${m[3]}` : ""}`, file);
      else if (m[group] !== undefined) count(bucket, m[group], file);
    }
  }

  for (const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
    // Skip the property being *used* inside a value, e.g. `var(--x: …)` never happens,
    // but `@property --x` blocks and Tailwind's `--tw-*` internals are noise.
    if (m[1].startsWith("--tw-")) continue;
    const entry = props.get(m[1]) ?? { values: [], files: new Set() };
    if (entry.values.length < 4 && !entry.values.includes(m[2].trim())) entry.values.push(m[2].trim());
    entry.files.add(relative(root, file));
    props.set(m[1], entry);
  }
  if (kind === "markup") {
    for (const m of text.matchAll(/(?<![\w-])(?:[a-z0-9-]+:)*!?(-?[a-z][a-z0-9-]*(?:-[a-z0-9.]+)+)(?:\/\d+)?(?![\w-])/g)) {
      classWords.set(m[1], (classWords.get(m[1]) ?? 0) + 1);
    }
  }
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
    propUses.set(m[1], (propUses.get(m[1]) ?? 0) + 1);
  }

  for (const [name, re] of SIGNALS) if (re.test(text)) signal(name, file);
}

/**
 * Tailwind v4 namespaces: `--<namespace>-<name>` becomes utilities ending in
 * `-<name>`. A heuristic — it can over-credit a name that's also a plain word —
 * but it's the difference between "unused" and "used in 40 files".
 */
const NAMESPACES = ["color", "font", "text", "radius", "shadow", "ease", "animate", "container", "spacing", "tracking", "leading", "breakpoint", "blur", "inset-shadow", "drop-shadow"];
function utilityUses(prop) {
  const ns = NAMESPACES.find((n) => prop.startsWith(`--${n}-`));
  if (!ns) return 0;
  const name = prop.slice(ns.length + 3);
  let n = 0;
  for (const [word, c] of classWords) if (word.endsWith(`-${name}`) && word !== name) n += c;
  return n;
}
const uses = (prop) => (propUses.get(prop) ?? 0) + utilityUses(prop);

/* ── Stack ────────────────────────────────────────────────────────────────── */

const stack = {};
const pkgPath = join(root, "package.json");
if (existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const KNOWN = [
      "next", "react", "vue", "nuxt", "svelte", "@sveltejs/kit", "astro", "solid-js", "@angular/core",
      "tailwindcss", "sass", "styled-components", "@emotion/react", "@vanilla-extract/css", "@stitches/react",
      "@pandacss/dev", "@mui/material", "@chakra-ui/react", "@mantine/core", "@radix-ui/themes",
      "motion", "framer-motion", "gsap", "@react-spring/web", "react-aria-components", "@headlessui/react",
      "bootstrap", "class-variance-authority", "tailwind-merge",
    ];
    for (const name of KNOWN) if (deps[name]) stack[name] = deps[name];
    if (Object.keys(deps).some((d) => d.startsWith("@radix-ui/react-"))) stack["@radix-ui primitives"] = "yes";
  } catch {
    stack["package.json"] = "unreadable";
  }
}
for (const f of ["components.json", "tailwind.config.js", "tailwind.config.ts", "tailwind.config.mjs", "tailwind.config.cjs", "theme.json", "tokens.json"]) {
  if (existsSync(join(root, f))) stack[f] = "present";
}

/* ── Token files: where the system is declared ────────────────────────────── */

const defsPerFile = new Map();
for (const [, entry] of props) for (const f of entry.files) defsPerFile.set(f, (defsPerFile.get(f) ?? 0) + 1);
const tokenFiles = [...defsPerFile].sort((a, b) => b[1] - a[1]).slice(0, 8);

/* ── Output ───────────────────────────────────────────────────────────────── */

const sorted = (bucket) => [...(tallies[bucket] ?? new Map())].sort((a, b) => b[1].n - a[1].n);

if (json) {
  const out = {
    root,
    filesScanned: files.length,
    stack,
    tokenFiles: Object.fromEntries(tokenFiles),
    customProperties: Object.fromEntries(
      [...props].map(([k, v]) => [k, { values: v.values, definedIn: [...v.files], varUses: propUses.get(k) ?? 0, utilityUses: utilityUses(k) }]),
    ),
    values: Object.fromEntries(
      Object.keys(tallies).map((b) => [b, sorted(b).map(([v, e]) => ({ value: v, count: e.n, files: e.files.size }))]),
    ),
    signals: Object.fromEntries(Object.entries(signals).map(([k, v]) => [k, [...v]])),
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const lines = [];
const say = (s = "") => lines.push(s);

say(`# Design inventory — ${basename(join(process.cwd(), root))}`);
say();
say(`${files.length} source files scanned. Counts are occurrences in source text; "files" is how many files use the value.`);
say();

say("## Stack");
say();
if (Object.keys(stack).length === 0) say("No package.json signals found.");
for (const [k, v] of Object.entries(stack)) say(`- ${k} ${v === "present" || v === "yes" ? "" : v}`.trimEnd());
say();

say("## Where tokens are declared");
say();
if (tokenFiles.length === 0) say("No custom property declarations found — values are likely inline or in a JS theme object.");
for (const [f, n] of tokenFiles) say(`- \`${f}\` — ${n} custom properties`);
say();

const TOP = 15;
/** Long values (a four-layer shadow) are clipped; --json has them whole. */
const clip = (v, n = 90) => (v.length > n ? `${v.slice(0, n)}…` : v).replace(/\|/g, "\\|");
const SECTIONS = [
  ["Colour literals", "color.literal", "A long tail here means colours bypass the tokens."],
  ["Font sizes", "font-size", "Many sizes with low counts usually means no ladder."],
  ["Font weights", "font-weight"],
  ["Line heights", "line-height"],
  ["Letter spacing", "letter-spacing"],
  ["Font families", "font-family"],
  ["Italic", "font-style", "Relevant if the system reserves or bans italic."],
  ["Max widths (measures)", "max-width"],
  ["Spacing utilities", "spacing"],
  ["Radii", "radius"],
  ["Z-index", "z-index"],
  ["Shadows", "shadow"],
  ["Backdrop filters", "backdrop"],
  ["Durations", "duration", "Bare numbers from JS configs are usually seconds."],
  ["Easing", "easing"],
  ["Springs", "spring"],
  ["Breakpoints", "breakpoint"],
];

for (const [title, bucket, note] of SECTIONS) {
  const rows = sorted(bucket);
  if (rows.length === 0) continue;
  say(`## ${title}`);
  say();
  if (note) say(`_${note}_`), say();
  say("| Value | Count | Files |");
  say("|---|---|---|");
  for (const [v, e] of rows.slice(0, TOP)) say(`| \`${clip(v)}\` | ${e.n} | ${e.files.size} |`);
  if (rows.length > TOP) say(`| … ${rows.length - TOP} more distinct values | | |`);
  say();
}

if (props.size > 0) {
  say("## Custom properties");
  say();
  say("_Most used first. A property defined but never used is a candidate for removal; one used everywhere is a role._");
  say();
  say("| Property | Uses (var · utility) | Values seen | Defined in |");
  say("|---|---|---|---|");
  const byUse = [...props].sort((a, b) => uses(b[0]) - uses(a[0]));
  for (const [k, v] of byUse.slice(0, 60)) {
    const values = v.values.map((x) => `\`${clip(x.replace(/\s+/g, " "), 48)}\``).join(" · ");
    say(`| \`${k}\` | ${propUses.get(k) ?? 0} · ${utilityUses(k)} | ${values} | ${[...v.files].slice(0, 2).join(", ")} |`);
  }
  if (props.size > 60) say(`| … ${props.size - 60} more | | | |`);
  say();
}

say("## Signals");
say();
if (Object.keys(signals).length === 0) say("None found.");
for (const [k, v] of Object.entries(signals).sort()) say(`- ${k} — ${v.size} file${v.size === 1 ? "" : "s"}`);
say();

console.log(lines.join("\n"));
