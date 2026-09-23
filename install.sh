#!/bin/sh
#
# Install the interface skills into a project.
#
#   curl -fsSL https://raw.githubusercontent.com/Mihirmodi27/interface-skills/main/install.sh | sh
#
# Asks which package to install — the Glass package (one exact system, to copy
# as-is), the customizable set (the same practices in your project's own names),
# or both — into ./.claude/skills. --package answers the question up front,
# skill names install just those, --user installs everywhere instead, --dir
# chooses the folder yourself. Through a pipe, arguments go after `sh -s --`:
#
#   curl -fsSL .../install.sh | sh -s -- --package both --user
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
  --user          install into ~/.claude/skills instead of ./.claude/skills
  --dir <path>    install into <path>
  -f, --force     overwrite skills that are already installed
  -u, --update    refresh every interface skill already in the folder, and move
                  1.x copies to their Glass package names — no question asked
  -l, --list      print the skill names, by package, and exit
  -h, --help      this

Skill names install just those skills, from either package, and skip the question.
USAGE
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

dest=""
force=0
update=0
package=""
wanted=""

while [ $# -gt 0 ]; do
  case "$1" in
    --user) dest="$HOME/.claude/skills" ;;
    --dir) shift; [ $# -gt 0 ] || die "--dir needs a path"; dest="$1" ;;
    --dir=*) dest="${1#--dir=}" ;;
    -p|--package) shift; [ $# -gt 0 ] || die "--package needs glass, custom or both"; package="$1" ;;
    --package=*) package="${1#--package=}" ;;
    -f|--force) force=1 ;;
    -u|--update) update=1 ;;
    -l|--list)
      printf 'Glass package\n'; printf '  %s\n' $GLASS
      printf 'Customize\n'; printf '  %s\n' $CUSTOM
      exit 0 ;;
    -h|--help) usage; exit 0 ;;
    -*) die "unknown option: $1 (try --help)" ;;
    *) wanted="$wanted $1" ;;
  esac
  shift
done

[ -n "$dest" ] || dest="$PWD/.claude/skills"
[ -z "$package" ] || package_skills "$package" >/dev/null

# Names first, so a typo fails before anything is asked, downloaded or written.
for name in $wanted; do
  known=0
  for candidate in $GLASS $CUSTOM; do
    [ "$name" = "$candidate" ] && known=1
  done
  [ "$known" -eq 1 ] || die "no skill called '$name' (try --list)"
done

# 1.x copies in the folder, as old:new pairs. Moving them waits until the
# download has worked, so a failed fetch can't leave the folder emptier.
legacy=""
for pair in $LEGACY; do
  if is_legacy "$dest/${pair%%:*}"; then legacy="$legacy $pair"; fi
done
do_migrate=0
refresh=""

has_tty() { (: </dev/tty) 2>/dev/null; }

if [ "$update" -eq 1 ]; then
  list=""
  for name in $GLASS $CUSTOM; do
    if [ -f "$dest/$name/SKILL.md" ] && ! is_legacy "$dest/$name"; then list="$list $name"; fi
  done
  for pair in $legacy; do
    contains "$list" "${pair#*:}" || list="$list ${pair#*:}"
  done
  if [ -z "$list" ]; then
    printf 'Nothing from interface-skills is installed in %s — run without --update to choose a package.\n' "$dest"
    exit 0
  fi
  do_migrate=1
  refresh="$list"
elif [ -n "$legacy" ]; then
  names=""
  for pair in $legacy; do names="$names${names:+, }${pair%%:*}"; done
  if has_tty; then
    {
      printf 'Found skills from interface-skills 1.x: %s.\n' "$names"
      printf "They're the Glass package under its old names, and 2.0 gives those names to the customizable set.\n\n"
      printf 'Move them to their Glass package names? [Y/n]: '
    } >/dev/tty
    read -r answer </dev/tty || answer=""
    printf '\n' >/dev/tty
    case "${answer:-y}" in
      [Yy]*)
        do_migrate=1
        for pair in $legacy; do refresh="$refresh ${pair#*:}"; done
        ;;
    esac
  else
    printf 'Found interface-skills 1.x copies (%s). Rerun with --update to move them to their Glass package names.\n\n' "$names"
  fi
fi

# Piped into sh, stdin is the script itself, so the question goes to the
# terminal directly. No terminal at all (CI) means the default, said out loud.
if [ "$update" -eq 1 ]; then
  :
elif [ -n "$wanted" ]; then
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
for name in $refresh; do contains "$list" "$name" || list="$list $name"; done

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
  printf 'Fetching %s@%s\n' "$REPO" "$REF"
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

mkdir -p "$dest"
if [ "$do_migrate" -eq 1 ]; then
  for pair in $legacy; do
    from=${pair%%:*}
    to=${pair#*:}
    rm -rf "$dest/$from"
    if [ "$from" = "$to" ]; then
      printf '  → %s updated from 1.x\n' "$from"
    else
      printf '  → %s is now %s\n' "$from" "$to"
    fi
  done
fi

installed=0
skipped=0
setup=0

for name in $list; do
  case " $GLASS " in
    *" $name "*) from="$src/glass-package/skills/$name" ;;
    *) from="$src/interface-design/skills/$name" ;;
  esac
  [ -f "$from/SKILL.md" ] || die "$name is missing its SKILL.md — the source is incomplete"
  [ "$name" = "design-system-setup" ] && setup=1
  if [ -e "$dest/$name" ] && [ "$force" -eq 0 ] && ! contains "$refresh" "$name"; then
    printf '  · %s already installed — pass --force to overwrite\n' "$name"
    skipped=$((skipped + 1))
    continue
  fi
  rm -rf "$dest/$name"
  cp -R "$from" "$dest/$name"
  printf '  ✓ %s\n' "$name"
  installed=$((installed + 1))
done

printf '\n%d installed, %d left alone, in %s\n' "$installed" "$skipped" "$dest"
printf 'Skills load on demand — Claude reads each description and decides. No need to name them.\n'
if [ "$setup" -eq 1 ]; then
  printf 'Start by asking Claude to set up the design system: it writes a DESIGN.md the other skills read.\n'
fi
