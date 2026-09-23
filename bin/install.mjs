#!/usr/bin/env node
/**
 * Install the interface skills into a project.
 *
 *   npx github:Mihirmodi27/interface-skills                     asks which package
 *   npx github:Mihirmodi27/interface-skills --package custom
 *   npx github:Mihirmodi27/interface-skills --user glass-and-depth color-and-theming
 *   npx github:Mihirmodi27/interface-skills --update            refresh what's installed
 *
 * Two packages ship together. The Glass package is one exact system, to copy as
 * it is; the customizable set applies the same practices in a project's own names
 * and values. Their skill names don't overlap, so both can live in one folder.
 *
 * The skills ship inside the package, so this copies rather than downloads — it
 * works offline and installs exactly the version npx resolved. The shell
 * installer (install.sh) does the same job for anyone without Node.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const ROOT = fileURLToPath(new URL("../plugins/", import.meta.url));

const PACKAGES = {
  glass: {
    title: "Glass package",
    blurb: "the exact system from modimihir.com, to copy as-is",
    dir: join(ROOT, "glass-package", "skills"),
    skills: ["glass-typography", "glass-motion", "glass-color", "glass-and-depth", "glass-layout"],
  },
  custom: {
    title: "Customize",
    blurb: "the same practices, fitted to your project's own names and values",
    dir: join(ROOT, "interface-design", "skills"),
    skills: [
      "design-system-setup",
      "typographic-system",
      "color-and-theming",
      "layout-and-hierarchy",
      "surfaces-and-depth",
      "interface-motion",
    ],
  },
};
/**
 * 1.x shipped the Glass system under the names the adaptable set now uses. A
 * copy made then is the Glass skill in all but name, so an update moves it to
 * its Glass name rather than overwriting it with a different skill.
 */
const LEGACY = {
  "typographic-system": "glass-typography",
  "interface-motion": "glass-motion",
  "color-and-theming": "glass-color",
  "layout-and-hierarchy": "glass-layout",
  "glass-and-depth": "glass-and-depth",
};

/** Whether an installed copy predates 2.0. Every 2.0 skill carries one of these two lines. */
function isLegacy(dir) {
  try {
    const md = readFileSync(join(dir, "SKILL.md"), "utf8");
    return !md.includes("## Before you start") && !md.includes("**Glass package.**");
  } catch {
    return false;
  }
}

const CHOICES = { 1: ["glass"], 2: ["custom"], 3: ["glass", "custom"] };
const BY_NAME = { glass: ["glass"], custom: ["custom"], both: ["glass", "custom"] };

const USAGE = `Install the interface skills into a project.

  npx github:Mihirmodi27/interface-skills [options] [skill...]

Options:
  -p, --package <glass|custom|both>
                  which package to install — asked for when not given
  --user          install into ~/.claude/skills instead of ./.claude/skills
  --dir <path>    install into <path>
  -f, --force     overwrite skills that are already installed
  -u, --update    refresh every interface skill already in the folder, and move
                  1.x copies to their Glass package names — no question asked
  -l, --list      print the skill names, by package, and exit
  -h, --help      this

Skill names install just those skills, from either package, and skip the question.`;

function die(message) {
  console.error(`interface-skills: ${message}`);
  process.exit(1);
}

const argv = process.argv.slice(2);
let dest = null;
let force = false;
let update = false;
let chosen = null;
const wanted = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "--user") dest = join(homedir(), ".claude", "skills");
  else if (arg === "--dir") {
    const path = argv[++i];
    if (!path) die("--dir needs a path");
    dest = resolve(path);
  } else if (arg.startsWith("--dir=")) dest = resolve(arg.slice("--dir=".length));
  else if (arg === "-p" || arg === "--package" || arg.startsWith("--package=")) {
    const value = arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : argv[++i];
    if (!BY_NAME[value]) die(`--package takes glass, custom or both, not '${value ?? ""}'`);
    chosen = BY_NAME[value];
  } else if (arg === "-f" || arg === "--force") force = true;
  else if (arg === "-u" || arg === "--update") update = true;
  else if (arg === "-l" || arg === "--list") {
    for (const pkg of Object.values(PACKAGES)) console.log(`${pkg.title}\n${pkg.skills.map((s) => `  ${s}`).join("\n")}`);
    process.exit(0);
  } else if (arg === "-h" || arg === "--help") {
    console.log(USAGE);
    process.exit(0);
  } else if (arg.startsWith("-")) die(`unknown option: ${arg} (try --help)`);
  else wanted.push(arg);
}

dest ??= resolve(".claude/skills");

/** Skill name → the directory it ships in. */
const source = {};
for (const pkg of Object.values(PACKAGES)) for (const s of pkg.skills) source[s] = join(pkg.dir, s);

// Names first, so a typo fails before anything is asked or written.
for (const name of wanted) {
  if (!source[name]) die(`no skill called '${name}' (try --list)`);
}

const interactive = process.stdin.isTTY && process.stdout.isTTY;

async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

async function ask() {
  // No terminal to ask on — CI, or output piped somewhere. Take the default and say how to choose.
  if (!interactive) {
    console.log("No terminal to ask on, so installing the customizable set. Pass --package glass|custom|both to choose.\n");
    return BY_NAME.custom;
  }
  console.log("Which skills?\n");
  console.log(`  1) ${PACKAGES.glass.title} — ${PACKAGES.glass.blurb}`);
  console.log(`  2) ${PACKAGES.custom.title} — ${PACKAGES.custom.blurb}`);
  console.log("  3) Both\n");
  for (;;) {
    const answer = (await prompt("Choose 1, 2 or 3 [2]: ")) || "2";
    if (CHOICES[answer]) {
      console.log();
      return CHOICES[answer];
    }
    console.log("  Type 1, 2 or 3.");
  }
}

/** 1.x copies in the folder, as [old name, Glass name] pairs. */
const legacy = Object.entries(LEGACY).filter(([from]) => isLegacy(join(dest, from)));

/** Moves 1.x copies aside so their Glass names can be installed fresh. */
function migrate() {
  for (const [from, to] of legacy) {
    rmSync(join(dest, from), { recursive: true, force: true });
    console.log(from === to ? `  → ${from} updated from 1.x` : `  → ${from} is now ${to}`);
  }
}

let list;
/** Skills that must be overwritten even without --force: the ones being refreshed or migrated. */
const refresh = new Set();

if (update) {
  const installed = Object.keys(source).filter((name) => existsSync(join(dest, name, "SKILL.md")) && !isLegacy(join(dest, name)));
  list = [...new Set([...installed, ...legacy.map(([, to]) => to)])];
  if (list.length === 0) {
    console.log(`Nothing from interface-skills is installed in ${dest} — run without --update to choose a package.`);
    process.exit(0);
  }
  migrate();
  for (const name of list) refresh.add(name);
} else {
  if (legacy.length > 0) {
    const names = legacy.map(([from]) => from).join(", ");
    if (interactive) {
      console.log(`Found ${legacy.length} skill${legacy.length === 1 ? "" : "s"} from interface-skills 1.x: ${names}.`);
      console.log("They're the Glass package under its old names, and 2.0 gives those names to the customizable set.\n");
      const answer = ((await prompt("Move them to their Glass package names? [Y/n]: ")) || "y").toLowerCase();
      console.log();
      if (answer.startsWith("y")) {
        migrate();
        for (const [, to] of legacy) refresh.add(to);
        console.log();
      }
    } else {
      console.log(`Found interface-skills 1.x copies (${names}). Rerun with --update to move them to their Glass package names.\n`);
    }
  }
  list = wanted.length > 0 ? wanted : (chosen ?? (await ask())).flatMap((key) => PACKAGES[key].skills);
  list = [...new Set([...list, ...refresh])];
}

mkdirSync(dest, { recursive: true });
let installed = 0;
let skipped = 0;

for (const name of list) {
  if (!existsSync(join(source[name], "SKILL.md"))) {
    die(`${name} is missing its SKILL.md — the source is incomplete`);
  }
  const target = join(dest, name);
  if (existsSync(target) && !force && !refresh.has(name)) {
    console.log(`  · ${name} already installed — pass --force to overwrite`);
    skipped++;
    continue;
  }
  rmSync(target, { recursive: true, force: true });
  cpSync(source[name], target, { recursive: true });
  console.log(`  ✓ ${name}`);
  installed++;
}

console.log(`\n${installed} installed, ${skipped} left alone, in ${dest}`);
console.log("Skills load on demand — Claude reads each description and decides. No need to name them.");
if (list.includes("design-system-setup")) {
  console.log("Start by asking Claude to set up the design system: it writes a DESIGN.md the other skills read.");
}
