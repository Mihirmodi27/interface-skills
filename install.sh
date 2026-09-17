#!/bin/sh
#
# Install the design skills into a project.
#
#   curl -fsSL https://raw.githubusercontent.com/Mihirmodi27/interface-skills/main/install.sh | sh
#
# All five by default, into ./.claude/skills. Pass names to install a subset,
# --user to install them everywhere instead, --dir to choose the folder yourself.
# Through a pipe, arguments go after `sh -s --`:
#
#   curl -fsSL .../install.sh | sh -s -- --user glass-and-depth color-and-theming
#
# Run from a clone and it copies from the clone rather than downloading.

set -eu

REPO="Mihirmodi27/interface-skills"
REF="${INTERFACE_SKILLS_REF:-main}"
ALL="typographic-system interface-motion color-and-theming glass-and-depth layout-and-hierarchy"

die() {
  printf 'interface-skills: %s\n' "$1" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Install the design skills into a project.

  install.sh [options] [skill...]

Options:
  --user          install into ~/.claude/skills instead of ./.claude/skills
  --dir <path>    install into <path>
  -f, --force     overwrite skills that are already installed
  -l, --list      print the skill names and exit
  -h, --help      this

With no skill names, all five are installed.
USAGE
}

dest=""
force=0
wanted=""

while [ $# -gt 0 ]; do
  case "$1" in
    --user) dest="$HOME/.claude/skills" ;;
    --dir) shift; [ $# -gt 0 ] || die "--dir needs a path"; dest="$1" ;;
    --dir=*) dest="${1#--dir=}" ;;
    -f|--force) force=1 ;;
    -l|--list) printf '%s\n' $ALL; exit 0 ;;
    -h|--help) usage; exit 0 ;;
    -*) die "unknown option: $1 (try --help)" ;;
    *) wanted="$wanted $1" ;;
  esac
  shift
done

[ -n "$dest" ] || dest="$PWD/.claude/skills"

# Names first, so a typo fails before anything is downloaded or written.
list="$ALL"
if [ -n "$wanted" ]; then
  list=""
  for name in $wanted; do
    known=0
    for candidate in $ALL; do
      [ "$name" = "$candidate" ] && known=1
    done
    [ "$known" -eq 1 ] || die "no skill called '$name' (try --list)"
    list="$list $name"
  done
fi

# A clone next to this script beats the network. Piped into sh, $0 is "sh" and
# has no slash in it, which is the tell that there's no script directory to look in.
src=""
case "$0" in
  */*)
    here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
    [ -d "$here/skills" ] && src="$here/skills"
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
  src="$root/skills"
fi

mkdir -p "$dest"
installed=0
skipped=0

for name in $list; do
  [ -f "$src/$name/SKILL.md" ] || die "$name is missing its SKILL.md — the source is incomplete"
  if [ -e "$dest/$name" ] && [ "$force" -eq 0 ]; then
    printf '  · %s already installed — pass --force to overwrite\n' "$name"
    skipped=$((skipped + 1))
    continue
  fi
  rm -rf "$dest/$name"
  cp -R "$src/$name" "$dest/$name"
  printf '  ✓ %s\n' "$name"
  installed=$((installed + 1))
done

printf '\n%d installed, %d left alone, in %s\n' "$installed" "$skipped" "$dest"
printf 'Skills load on demand — Claude reads each description and decides. No need to name them.\n'
