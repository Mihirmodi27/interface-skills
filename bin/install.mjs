#!/usr/bin/env node
/**
 * Install the interface skills into a project, for one coding agent or several.
 *
 *   npx github:Mihirmodi27/interface-skills                        asks which package, which tool
 *   npx github:Mihirmodi27/interface-skills --package custom --tool codex
 *   npx github:Mihirmodi27/interface-skills --tool claude-code,cursor --user
 *   npx github:Mihirmodi27/interface-skills --update               refresh what's installed
 *
 * Two packages ship together. The Glass package is one exact system, to copy as
 * it is; the customizable set applies the same practices in a project's own names
 * and values. Their skill names don't overlap, so both can live in one folder.
 *
 * Each tool reads skills from its own folder. Claude Code and Windsurf have their
 * own; Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode and most others share
 * `.agents/skills` in a project. Skills are always copied, never symlinked, so
 * the folder a tool reads holds the real files — and tools that share a folder
 * get one copy between them.
 *
 * The skills ship inside the package, so this copies rather than downloads — it
 * works offline and installs exactly the version npx resolved. The shell
 * installer (install.sh) does the same job for anyone without Node.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { join, relative, resolve } from "node:path";
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
const CHOICES = { 1: ["glass"], 2: ["custom"], 3: ["glass", "custom"] };
const BY_NAME = { glass: ["glass"], custom: ["custom"], both: ["glass", "custom"] };

/**
 * Where each tool reads skills from — in a project, and for the whole machine.
 * The ids and folders match the `skills` CLI (vercel-labs/skills), so a skill
 * installed either way lands in the same place.
 */
const home = homedir();
const configHome = process.env.XDG_CONFIG_HOME?.trim() || join(home, ".config");
const TOOLS = {
  "claude-code": {
    title: "Claude Code",
    project: ".claude/skills",
    global: join(process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude"), "skills"),
  },
  codex: {
    title: "Codex",
    project: ".agents/skills",
    global: join(process.env.CODEX_HOME?.trim() || join(home, ".codex"), "skills"),
  },
  cursor: { title: "Cursor", project: ".agents/skills", global: join(home, ".cursor", "skills") },
  "gemini-cli": { title: "Gemini CLI", project: ".agents/skills", global: join(home, ".gemini", "skills") },
  "github-copilot": { title: "GitHub Copilot", project: ".agents/skills", global: join(home, ".copilot", "skills") },
  opencode: { title: "OpenCode", project: ".agents/skills", global: join(configHome, "opencode", "skills") },
  windsurf: { title: "Windsurf", project: ".windsurf/skills", global: join(home, ".codeium", "windsurf", "skills") },
  agents: {
    title: "Any other agent that reads .agents/skills",
    project: ".agents/skills",
    global: join(home, ".agents", "skills"),
  },
};
const ALIASES = { claude: "claude-code", gemini: "gemini-cli", copilot: "github-copilot", other: "agents" };
const TOOL_IDS = Object.keys(TOOLS);

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

const USAGE = `Install the interface skills into a project.

  npx github:Mihirmodi27/interface-skills [options] [skill...]

Options:
  -p, --package <glass|custom|both>
                  which package to install — asked for when not given
  -t, --tool <tool[,tool…]>
                  which coding agent to install for — asked for when not given,
                  Claude Code when there's no terminal to ask on. One of:
                  ${TOOL_IDS.join(", ")}
  --user          install for every project on this machine instead of this one
  --dir <path>    install into <path>, whatever the tool
  -f, --force     overwrite skills that are already installed
  -u, --update    refresh every interface skill already installed, and move
                  1.x copies to their Glass package names — no question asked
  -l, --list      print the skill names by package, and the tools, and exit
  -h, --help      this

Skill names install just those skills, from either package, and skip the package question.`;

function die(message) {
  console.error(`interface-skills: ${message}`);
  process.exit(1);
}

function toolId(name) {
  const id = ALIASES[name] ?? name;
  if (!TOOLS[id]) die(`no tool called '${name}' — use one of: ${TOOL_IDS.join(", ")}`);
  return id;
}

const argv = process.argv.slice(2);
let dir = null;
let user = false;
let force = false;
let update = false;
let chosen = null;
const tools = [];
const wanted = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  const value = () => (arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : argv[++i]);
  if (arg === "--user") user = true;
  else if (arg === "--dir" || arg.startsWith("--dir=")) {
    const path = value();
    if (!path) die("--dir needs a path");
    dir = resolve(path);
  } else if (arg === "-p" || arg === "--package" || arg.startsWith("--package=")) {
    const v = value();
    if (!BY_NAME[v]) die(`--package takes glass, custom or both, not '${v ?? ""}'`);
    chosen = BY_NAME[v];
  } else if (["-t", "--tool", "--agent"].includes(arg) || arg.startsWith("--tool=") || arg.startsWith("--agent=")) {
    const v = value();
    if (!v) die("--tool needs a tool name");
    for (const name of v.split(",").map((s) => s.trim()).filter(Boolean)) tools.push(toolId(name));
  } else if (arg === "-f" || arg === "--force") force = true;
  else if (arg === "-u" || arg === "--update") update = true;
  else if (arg === "-l" || arg === "--list") {
    for (const pkg of Object.values(PACKAGES)) console.log(`${pkg.title}\n${pkg.skills.map((s) => `  ${s}`).join("\n")}`);
    console.log(`Tools\n${TOOL_IDS.map((id) => `  ${id.padEnd(16)} ${TOOLS[id].title}`).join("\n")}`);
    process.exit(0);
  } else if (arg === "-h" || arg === "--help") {
    console.log(USAGE);
    process.exit(0);
  } else if (arg.startsWith("-")) die(`unknown option: ${arg} (try --help)`);
  else wanted.push(arg);
}

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

async function askPackage() {
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

async function askTools() {
  if (!interactive) {
    console.log("No terminal to ask on, so installing for Claude Code. Pass --tool to choose (try --list).\n");
    return ["claude-code"];
  }
  console.log("Which tool?\n");
  TOOL_IDS.forEach((id, i) => console.log(`  ${i + 1}) ${TOOLS[id].title}`));
  console.log();
  for (;;) {
    const answer = (await prompt("Choose one or more, like 1 or 1,2 [1]: ")) || "1";
    const picks = answer.split(/[\s,]+/).filter(Boolean).map(Number);
    if (picks.length && picks.every((n) => Number.isInteger(n) && n >= 1 && n <= TOOL_IDS.length)) {
      console.log();
      return [...new Set(picks.map((n) => TOOL_IDS[n - 1]))];
    }
    console.log(`  Type numbers from 1 to ${TOOL_IDS.length}, separated by commas.`);
  }
}

const shown = (path) => (path.startsWith(process.cwd()) ? `./${relative(process.cwd(), path)}` : path.replace(home, "~"));

/** A tool's folder, for this project or for the whole machine. */
const folderFor = (id) => (user ? TOOLS[id].global : resolve(TOOLS[id].project));

/**
 * The folders to install into, each with the tools that read it — so Codex and
 * Cursor, which share `.agents/skills`, get one copy and one line of output.
 */
function destinations(ids) {
  const byPath = new Map();
  for (const id of ids) {
    const path = folderFor(id);
    byPath.set(path, [...(byPath.get(path) ?? []), TOOLS[id].title]);
  }
  // More than two readers only happens on an --update sweep of the shared
  // .agents/skills folder, where naming all six says less than naming the folder.
  return [...byPath].map(([path, readers]) => ({
    path,
    label: readers.length > 2 ? `Every tool that reads ${shown(path)}` : readers.join(", "),
  }));
}

const installedHere = (path) =>
  Object.keys(source).some((name) => existsSync(join(path, name, "SKILL.md"))) ||
  Object.keys(LEGACY).some((name) => isLegacy(join(path, name)));

/* ── Decide what goes where ─────────────────────────────────────────────── */

let dests;
if (dir) dests = [{ path: dir, label: shown(dir) }];
else if (tools.length) dests = destinations(tools);
else if (update) {
  // Everywhere something from this repo is already installed, in this scope.
  dests = destinations(TOOL_IDS).filter((d) => installedHere(d.path));
  if (dests.length === 0) {
    console.log(`Nothing from interface-skills is installed ${user ? "for this user" : "in this project"} — run without --update to choose a package.`);
    process.exit(0);
  }
}

let list = [];
if (!update) {
  list = wanted.length > 0 ? wanted : (chosen ?? (await askPackage())).flatMap((key) => PACKAGES[key].skills);
  dests ??= destinations(await askTools());
}

/* ── Install ────────────────────────────────────────────────────────────── */

let installed = 0;
let skipped = 0;

for (const dest of dests) {
  /** 1.x copies in this folder, as [old name, Glass name] pairs. */
  const legacy = Object.entries(LEGACY).filter(([from]) => isLegacy(join(dest.path, from)));
  /** Skills overwritten even without --force: the ones being refreshed or migrated. */
  const refresh = new Set();
  let names = list;
  let migrate = false;

  if (update) {
    const current = Object.keys(source).filter((n) => existsSync(join(dest.path, n, "SKILL.md")) && !isLegacy(join(dest.path, n)));
    names = [...new Set([...current, ...legacy.map(([, to]) => to)])];
    migrate = legacy.length > 0;
    for (const n of names) refresh.add(n);
  } else if (legacy.length > 0) {
    const old = legacy.map(([from]) => from).join(", ");
    if (interactive) {
      console.log(`Found skills from interface-skills 1.x in ${shown(dest.path)}: ${old}.`);
      console.log("They're the Glass package under its old names, and 2.0 gives those names to the customizable set.\n");
      const answer = ((await prompt("Move them to their Glass package names? [Y/n]: ")) || "y").toLowerCase();
      console.log();
      if (answer.startsWith("y")) {
        migrate = true;
        for (const [, to] of legacy) refresh.add(to);
        names = [...new Set([...names, ...refresh])];
      }
    } else {
      console.log(`Found interface-skills 1.x copies in ${shown(dest.path)} (${old}). Rerun with --update to move them to their Glass package names.\n`);
    }
  }

  console.log(`${dest.label} → ${shown(dest.path)}`);
  mkdirSync(dest.path, { recursive: true });

  if (migrate) {
    for (const [from, to] of legacy) {
      rmSync(join(dest.path, from), { recursive: true, force: true });
      console.log(from === to ? `  → ${from} updated from 1.x` : `  → ${from} is now ${to}`);
    }
  }

  for (const name of names) {
    if (!existsSync(join(source[name], "SKILL.md"))) die(`${name} is missing its SKILL.md — the source is incomplete`);
    const target = join(dest.path, name);
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
  console.log();
}

console.log(`${installed} installed, ${skipped} left alone.`);
console.log("Skills load on demand — the agent reads each description and decides. No need to name them.");
if (list.includes("design-system-setup")) {
  console.log("Start by asking your agent to set up the design system: it writes a DESIGN.md the other skills read.");
}
