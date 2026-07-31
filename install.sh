#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE_DIR="$SCRIPT_DIR/skills/relay"

# Detect environment and set appropriate target
if [ -n "${CODEX_HOME:-}" ]; then
  TARGET_ROOT="${CODEX_HOME}/skills"
  TARGET_DIR="$TARGET_ROOT/relay"
  ENV_NAME="Codex"
elif [ -d "$HOME/.claude/skills" ]; then
  TARGET_ROOT="$HOME/.claude/skills"
  TARGET_DIR="$TARGET_ROOT/relay"
  ENV_NAME="Claude Code"
else
  # Default to Codex location
  TARGET_ROOT="${HOME}/.codex/skills"
  TARGET_DIR="$TARGET_ROOT/relay"
  ENV_NAME="Codex"
fi

if [ ! -f "$SOURCE_DIR/SKILL.md" ]; then
  echo "Relay skill not found at $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_ROOT"

if [ -L "$TARGET_DIR" ] && [ "$(readlink "$TARGET_DIR")" = "$SOURCE_DIR" ]; then
  echo "Relay is already installed at $TARGET_DIR"
  exit 0
fi

if [ -e "$TARGET_DIR" ] || [ -L "$TARGET_DIR" ]; then
  echo "Refusing to overwrite existing path: $TARGET_DIR" >&2
  exit 2
fi

ln -s "$SOURCE_DIR" "$TARGET_DIR"
echo "✓ Installed Relay for $ENV_NAME at $TARGET_DIR"
echo ""
echo "Usage:"
if [ "$ENV_NAME" = "Codex" ]; then
  echo "  Start a new Codex task and use: \$relay"
else
  echo "  In Claude Code, use: /relay"
fi
echo ""
echo "For Claude Code users:"
echo "  Make sure Kimi WebBridge is running:"
echo "  ~/.kimi-webbridge/bin/kimi-webbridge start"

