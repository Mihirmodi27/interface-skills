#!/usr/bin/env node
/**
 * Install the design skills into a project.
 *
 *   npx interface-skills
 *   npx interface-skills --user glass-and-depth color-and-theming
 *
 * The skills ship inside the package, so this copies rather than downloads —
 * it works offline and installs exactly the version npx resolved. The shell
 * installer (install.sh) does the same job for anyone without Node.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const ALL = [
  "typographic-system",
  "interface-motion",
  "color-and-theming",
  "glass-and-depth",
  "layout-and-hierarchy",
];

const SOURCE = fileURLToPath(new URL("../skills/", import.meta.url));

const USAGE = `Install the design skills into a project.

  npx interface-skills [options] [skill...]

Options:
  --user          install into ~/.claude/skills instead of ./.claude/skills
  --dir <path>    install into <path>
  -f, --force     overwrite skills that are already installed
  -l, --list      print the skill names and exit
  -h, --help      this

With no skill names, all five are installed.`;

function die(message) {
  console.error(`interface-skills: ${message}`);
  process.exit(1);
}

const argv = process.argv.slice(2);
let dest = null;
let force = false;
const wanted = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "--user") dest = join(homedir(), ".claude", "skills");
  else if (arg === "--dir") {
    const path = argv[++i];
    if (!path) die("--dir needs a path");
    dest = resolve(path);
  } else if (arg.startsWith("--dir=")) dest = resolve(arg.slice("--dir=".length));
  else if (arg === "-f" || arg === "--force") force = true;
  else if (arg === "-l" || arg === "--list") {
    console.log(ALL.join("\n"));
    process.exit(0);
  } else if (arg === "-h" || arg === "--help") {
    console.log(USAGE);
    process.exit(0);
  } else if (arg.startsWith("-")) die(`unknown option: ${arg} (try --help)`);
  else wanted.push(arg);
}

dest ??= resolve(".claude/skills");

// Names first, so a typo fails before anything is written.
for (const name of wanted) {
  if (!ALL.includes(name)) die(`no skill called '${name}' (try --list)`);
}
const list = wanted.length > 0 ? wanted : ALL;

if (!existsSync(SOURCE)) {
  die(`the skills aren't next to this script — expected them at ${SOURCE}`);
}

mkdirSync(dest, { recursive: true });
let installed = 0;
let skipped = 0;

for (const name of list) {
  if (!existsSync(join(SOURCE, name, "SKILL.md"))) {
    die(`${name} is missing its SKILL.md — the source is incomplete`);
  }
  const target = join(dest, name);
  if (existsSync(target) && !force) {
    console.log(`  · ${name} already installed — pass --force to overwrite`);
    skipped++;
    continue;
  }
  rmSync(target, { recursive: true, force: true });
  cpSync(join(SOURCE, name), target, { recursive: true });
  console.log(`  ✓ ${name}`);
  installed++;
}

console.log(`\n${installed} installed, ${skipped} left alone, in ${dest}`);
console.log("Skills load on demand — Claude reads each description and decides. No need to name them.");
