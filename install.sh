#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE_DIR="$SCRIPT_DIR/skills/codex-pm"
TARGET_ROOT="${CODEX_HOME:-$HOME/.codex}/skills"
TARGET_DIR="$TARGET_ROOT/codex-pm"

if [ ! -f "$SOURCE_DIR/SKILL.md" ]; then
  echo "CodexPM skill not found at $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_ROOT"

if [ -L "$TARGET_DIR" ] && [ "$(readlink "$TARGET_DIR")" = "$SOURCE_DIR" ]; then
  echo "CodexPM is already installed at $TARGET_DIR"
  exit 0
fi

if [ -e "$TARGET_DIR" ] || [ -L "$TARGET_DIR" ]; then
  echo "Refusing to overwrite existing path: $TARGET_DIR" >&2
  exit 2
fi

ln -s "$SOURCE_DIR" "$TARGET_DIR"
echo "Installed CodexPM at $TARGET_DIR"
echo "Start a new Codex task before using the skill."
