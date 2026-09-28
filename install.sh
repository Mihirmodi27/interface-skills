#!/bin/sh
#
# Install the interface skills into a project, for one coding agent or several.
#
#   curl -fsSL https://raw.githubusercontent.com/Mihirmodi27/interface-skills/main/install.sh | sh
#
# Asks which package to install — the Glass package (one exact system, to copy
# as-is), the customizable set (the same practices in your project's own names),
# or both — and which tool to install it for. --package and --tool answer the
# questions up front, skill names install just those, --user installs for every
# project on the machine, --dir chooses the folder yourself. Through a pipe,
# arguments go after `sh -s --`:
#
#   curl -fsSL .../install.sh | sh -s -- --package both --tool codex --user
#
# Each tool reads skills from its own folder. Claude Code and Windsurf have
# their own; Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode and most others
# share .agents/skills in a project. Skills are always copied, never symlinked,
# and tools that share a folder get one copy between them.
#
# --update refreshes whatever is already installed, and moves 1.x copies (the
# Glass system under the names 2.0 gives the customizable set) to their Glass
# names:
#
#   curl -fsSL .../install.sh | sh -s -- --update
#
# Run from a clone and it copies from the clone rather than downloading.

set -eu

REPO="Mihirmodi27/interface-skills"
REF="${INTERFACE_SKILLS_REF:-main}"
GLASS="glass-typography glass-motion glass-color glass-and-depth glass-layout"
CUSTOM="design-system-setup typographic-system color-and-theming layout-and-hierarchy surfaces-and-depth interface-motion"
# 1.x name → the Glass name it became.
LEGACY="typographic-system:glass-typography interface-motion:glass-motion color-and-theming:glass-color layout-and-hierarchy:glass-layout glass-and-depth:glass-and-depth"
# Ids and folders match the `skills` CLI (vercel-labs/skills), so a skill
# installed either way lands in the same place.
TOOLS="claude-code codex cursor gemini-cli github-copilot opencode windsurf agents"
TAB=$(printf '\t')
NL='
'

die() {
  printf 'interface-skills: %s\n' "$1" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Install the interface skills into a project.

  install.sh [options] [skill...]

Options:
  -p, --package <glass|custom|both>
                  which package to install — asked for when not given
  -t, --tool <tool[,tool…]>
                  which coding agent to install for — asked for when not given,
                  Claude Code when there's no terminal to ask on. One of:
                  claude-code, codex, cursor, gemini-cli, github-copilot,
                  opencode, windsurf, agents
  --user          install for every project on this machine instead of this one
  --dir <path>    install into <path>, whatever the tool
  -f, --force     overwrite skills that are already installed
  -u, --update    refresh every interface skill already installed, and move
                  1.x copies to their Glass package names — no question asked
  -l, --list      print the skill names by package, and the tools, and exit
  -h, --help      this

Skill names install just those skills, from either package, and skip the package question.
USAGE
}

tool_title() {
  case "$1" in
    claude-code) printf 'Claude Code' ;;
    codex) printf 'Codex' ;;
    cursor) printf 'Cursor' ;;
    gemini-cli) printf 'Gemini CLI' ;;
    github-copilot) printf 'GitHub Copilot' ;;
    opencode) printf 'OpenCode' ;;
    windsurf) printf 'Windsurf' ;;
    agents) printf 'Any other agent that reads .agents/skills' ;;
  esac
}

tool_project() {
  case "$1" in
    claude-code) printf '.claude/skills' ;;
    windsurf) printf '.windsurf/skills' ;;
    *) printf '.agents/skills' ;;
  esac
}

tool_global() {
  case "$1" in
    claude-code) printf '%s/skills' "${CLAUDE_CONFIG_DIR:-$HOME/.claude}" ;;
    codex) printf '%s/skills' "${CODEX_HOME:-$HOME/.codex}" ;;
    cursor) printf '%s/.cursor/skills' "$HOME" ;;
    gemini-cli) printf '%s/.gemini/skills' "$HOME" ;;
    github-copilot) printf '%s/.copilot/skills' "$HOME" ;;
    opencode) printf '%s/opencode/skills' "${XDG_CONFIG_HOME:-$HOME/.config}" ;;
    windsurf) printf '%s/.codeium/windsurf/skills' "$HOME" ;;
    agents) printf '%s/.agents/skills' "$HOME" ;;
  esac
}

tool_id() {
  case "$1" in
    claude) printf 'claude-code' ;;
    gemini) printf 'gemini-cli' ;;
    copilot) printf 'github-copilot' ;;
    other) printf 'agents' ;;
    *)
      contains "$TOOLS" "$1" || die "no tool called '$1' — use one of: $(printf '%s' "$TOOLS" | sed 's/ /, /g')"
      printf '%s' "$1"
      ;;
  esac
}

# Every 2.0 skill carries one of these two lines; a 1.x copy carries neither.
is_legacy() {
  [ -f "$1/SKILL.md" ] || return 1
  grep -q '^## Before you start' "$1/SKILL.md" && return 1
  grep -q '\*\*Glass package\.\*\*' "$1/SKILL.md" && return 1
  return 0
}

contains() {
  case " $1 " in *" $2 "*) return 0 ;; esac
  return 1
}

package_skills() {
  case "$1" in
    glass) printf '%s' "$GLASS" ;;
    custom) printf '%s' "$CUSTOM" ;;
    both) printf '%s %s' "$GLASS" "$CUSTOM" ;;
    *) die "--package takes glass, custom or both, not '$1'" ;;
  esac
}

dir=""
user=0
force=0
update=0
package=""
tools=""
wanted=""

add_tools() {
  for t in $(printf '%s' "$1" | tr ',' ' '); do
    id=$(tool_id "$t")
    contains "$tools" "$id" || tools="$tools $id"
  done
}

while [ $# -gt 0 ]; do
  case "$1" in
    --user) user=1 ;;
    --dir) shift; [ $# -gt 0 ] || die "--dir needs a path"; dir="$1" ;;
    --dir=*) dir="${1#--dir=}" ;;
    -p|--package) shift; [ $# -gt 0 ] || die "--package needs glass, custom or both"; package="$1" ;;
    --package=*) package="${1#--package=}" ;;
    -t|--tool|--agent) shift; [ $# -gt 0 ] || die "--tool needs a tool name"; add_tools "$1" ;;
    --tool=*) add_tools "${1#--tool=}" ;;
    --agent=*) add_tools "${1#--agent=}" ;;
    -f|--force) force=1 ;;
    -u|--update) update=1 ;;
    -l|--list)
      printf 'Glass package\n'; printf '  %s\n' $GLASS
      printf 'Customize\n'; printf '  %s\n' $CUSTOM
      printf 'Tools\n'
      for t in $TOOLS; do printf '  %-16s %s\n' "$t" "$(tool_title "$t")"; done
      exit 0 ;;
    -h|--help) usage; exit 0 ;;
    -*) die "unknown option: $1 (try --help)" ;;
    *) wanted="$wanted $1" ;;
  esac
  shift
done

[ -z "$package" ] || package_skills "$package" >/dev/null

# Names first, so a typo fails before anything is asked, downloaded or written.
for name in $wanted; do
  contains "$GLASS $CUSTOM" "$name" || die "no skill called '$name' (try --list)"
done

has_tty() { (: </dev/tty) 2>/dev/null; }

folder_for() {
  if [ "$user" -eq 1 ]; then tool_global "$1"; else printf '%s/%s' "$PWD" "$(tool_project "$1")"; fi
}

# The folders to install into, one per line as "path<TAB>tools that read it",
# so Codex and Cursor, which share .agents/skills, get one copy.
dests=""
add_dest() {
  dests=$(printf '%s\n' "$dests" | awk -F "$TAB" -v p="$1" -v t="$2" '
    NF { if ($1 == p) { print $1 "\t" $2 ", " t; found = 1 } else print }
    END { if (!found) print p "\t" t }')
}

installed_here() {
  for name in $GLASS $CUSTOM; do [ -f "$1/$name/SKILL.md" ] && return 0; done
  for pair in $LEGACY; do is_legacy "$1/${pair%%:*}" && return 0; done
  return 1
}

shown() {
  case "$1" in
    "$PWD"/*) printf './%s' "${1#"$PWD"/}" ;;
    "$HOME"/*) printf '~/%s' "${1#"$HOME"/}" ;;
    *) printf '%s' "$1" ;;
  esac
}

# ── Decide what goes where ────────────────────────────────────────────────

if [ -n "$dir" ]; then
  add_dest "$dir" "$(shown "$dir")"
elif [ -n "$tools" ]; then
  for t in $tools; do add_dest "$(folder_for "$t")" "$(tool_title "$t")"; done
elif [ "$update" -eq 1 ]; then
  for t in $TOOLS; do
    f=$(folder_for "$t")
    if installed_here "$f"; then add_dest "$f" "$(tool_title "$t")"; fi
  done
  if [ -z "$dests" ]; then
    scope="in this project"; [ "$user" -eq 1 ] && scope="for this user"
    printf 'Nothing from interface-skills is installed %s — run without --update to choose a package.\n' "$scope"
    exit 0
  fi
fi

# Piped into sh, stdin is the script itself, so questions go to the terminal
# directly. No terminal at all (CI) means the defaults, said out loud.
list=""
if [ "$update" -eq 0 ]; then
  if [ -n "$wanted" ]; then
    list="$wanted"
  elif [ -n "$package" ]; then
    list=$(package_skills "$package")
  elif has_tty; then
    {
      printf 'Which skills?\n\n'
      printf '  1) Glass package — the exact system from modimihir.com, to copy as-is\n'
      printf "  2) Customize — the same practices, fitted to your project's own names and values\n"
      printf '  3) Both\n\n'
    } >/dev/tty
    while :; do
      printf 'Choose 1, 2 or 3 [2]: ' >/dev/tty
      read -r answer </dev/tty || answer=""
      case "${answer:-2}" in
        1) package=glass; break ;;
        2) package=custom; break ;;
        3) package=both; break ;;
        *) printf '  Type 1, 2 or 3.\n' >/dev/tty ;;
      esac
    done
    printf '\n' >/dev/tty
    list=$(package_skills "$package")
  else
    printf 'No terminal to ask on, so installing the customizable set. Pass --package glass|custom|both to choose.\n\n'
    list=$(package_skills custom)
  fi

  if [ -z "$dests" ]; then
    if has_tty; then
      {
        printf 'Which tool?\n\n'
        i=0
        for t in $TOOLS; do i=$((i + 1)); printf '  %d) %s\n' "$i" "$(tool_title "$t")"; done
        printf '\n'
      } >/dev/tty
      while :; do
        printf 'Choose one or more, like 1 or 1,2 [1]: ' >/dev/tty
        read -r answer </dev/tty || answer=""
        picked=""
        ok=1
        for n in $(printf '%s' "${answer:-1}" | tr ',' ' '); do
          i=0
          id=""
          for t in $TOOLS; do i=$((i + 1)); [ "$n" = "$i" ] && id="$t"; done
          if [ -z "$id" ]; then ok=0; break; fi
          contains "$picked" "$id" || picked="$picked $id"
        done
        if [ "$ok" -eq 1 ] && [ -n "$picked" ]; then break; fi
        printf '  Type numbers from 1 to 8, separated by commas.\n' >/dev/tty
      done
      printf '\n' >/dev/tty
      for t in $picked; do add_dest "$(folder_for "$t")" "$(tool_title "$t")"; done
    else
      printf 'No terminal to ask on, so installing for Claude Code. Pass --tool to choose (try --list).\n\n'
      add_dest "$(folder_for claude-code)" "$(tool_title claude-code)"
    fi
  fi
fi

# ── Fetch ─────────────────────────────────────────────────────────────────

# A clone next to this script beats the network. Piped into sh, $0 is "sh" and
# has no slash in it, which is the tell that there's no script directory to look in.
src=""
case "$0" in
  */*)
    here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
    [ -d "$here/plugins" ] && src="$here/plugins"
    ;;
esac

if [ -z "$src" ]; then
  command -v tar >/dev/null 2>&1 || die "tar is needed to unpack the download"
  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT INT TERM
  url="https://codeload.github.com/$REPO/tar.gz/refs/heads/$REF"
  printf 'Fetching %s@%s\n\n' "$REPO" "$REF"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" | tar -xzf - -C "$tmp" || die "could not download $url"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$url" | tar -xzf - -C "$tmp" || die "could not download $url"
  else
    die "neither curl nor wget is available"
  fi
  root=$(find "$tmp" -maxdepth 1 -type d -name 'interface-skills-*' | head -n 1)
  [ -n "$root" ] || die "the download didn't look like the repository"
  src="$root/plugins"
fi

# ── Install ───────────────────────────────────────────────────────────────

installed=0
skipped=0

old_ifs=$IFS
IFS=$NL
for line in $dests; do
  IFS=$old_ifs
  [ -n "$line" ] || continue
  path=${line%%"$TAB"*}
  label=${line#*"$TAB"}

  # 1.x copies in this folder, as old:new pairs. Moved only now, after the
  # download worked, so a failed fetch can't leave the folder emptier.
  legacy=""
  for pair in $LEGACY; do
    if is_legacy "$path/${pair%%:*}"; then legacy="$legacy $pair"; fi
  done
  refresh=""
  migrate=0
  names="$list"

  if [ "$update" -eq 1 ]; then
    names=""
    for name in $GLASS $CUSTOM; do
      if [ -f "$path/$name/SKILL.md" ] && ! is_legacy "$path/$name"; then names="$names $name"; fi
    done
    for pair in $legacy; do contains "$names" "${pair#*:}" || names="$names ${pair#*:}"; done
    [ -n "$legacy" ] && migrate=1
    refresh="$names"
  elif [ -n "$legacy" ]; then
    old=""
    for pair in $legacy; do old="$old${old:+, }${pair%%:*}"; done
    if has_tty; then
      {
        printf 'Found skills from interface-skills 1.x in %s: %s.\n' "$(shown "$path")" "$old"
        printf "They're the Glass package under its old names, and 2.0 gives those names to the customizable set.\n\n"
        printf 'Move them to their Glass package names? [Y/n]: '
      } >/dev/tty
      read -r answer </dev/tty || answer=""
      printf '\n' >/dev/tty
      case "${answer:-y}" in
        [Yy]*)
          migrate=1
          for pair in $legacy; do
            refresh="$refresh ${pair#*:}"
            contains "$names" "${pair#*:}" || names="$names ${pair#*:}"
          done
          ;;
      esac
    else
      printf 'Found interface-skills 1.x copies in %s (%s). Rerun with --update to move them to their Glass package names.\n\n' "$(shown "$path")" "$old"
    fi
  fi

  # More than two readers only happens on an --update sweep of the shared
  # .agents/skills folder, where naming all six says less than naming the folder.
  case "$label" in *", "*", "*) label="Every tool that reads $(shown "$path")" ;; esac
  printf '%s → %s\n' "$label" "$(shown "$path")"
  mkdir -p "$path"

  if [ "$migrate" -eq 1 ]; then
    for pair in $legacy; do
      from=${pair%%:*}
      to=${pair#*:}
      rm -rf "$path/$from"
      if [ "$from" = "$to" ]; then
        printf '  → %s updated from 1.x\n' "$from"
      else
        printf '  → %s is now %s\n' "$from" "$to"
      fi
    done
  fi

  for name in $names; do
    if contains "$GLASS" "$name"; then from="$src/glass-package/skills/$name"; else from="$src/interface-design/skills/$name"; fi
    [ -f "$from/SKILL.md" ] || die "$name is missing its SKILL.md — the source is incomplete"
    if [ -e "$path/$name" ] && [ "$force" -eq 0 ] && ! contains "$refresh" "$name"; then
      printf '  · %s already installed — pass --force to overwrite\n' "$name"
      skipped=$((skipped + 1))
      continue
    fi
    rm -rf "$path/$name"
    cp -R "$from" "$path/$name"
    printf '  ✓ %s\n' "$name"
    installed=$((installed + 1))
  done
  printf '\n'
  IFS=$NL
done
IFS=$old_ifs

printf '%d installed, %d left alone.\n' "$installed" "$skipped"
printf 'Skills load on demand — the agent reads each description and decides. No need to name them.\n'
if contains "$list" design-system-setup; then
  printf 'Start by asking your agent to set up the design system: it writes a DESIGN.md the other skills read.\n'
fi
