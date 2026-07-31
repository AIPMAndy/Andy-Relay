#!/usr/bin/env python3
"""Build a compact, provider-ready CodexPM worker packet from JSON."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


LIST_FIELDS = ("context", "constraints", "acceptance", "evidence")


def _as_items(value: Any, field: str) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ValueError(f"{field} must be a string or a list of strings")
    return [item.strip() for item in value if item.strip()]


def validate(spec: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(spec, dict):
        raise ValueError("input must be a JSON object")

    normalized = dict(spec)
    for field in ("objective", "deliverable"):
        value = normalized.get(field)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"missing required non-empty string: {field}")
        normalized[field] = value.strip()

    for field in LIST_FIELDS:
        normalized[field] = _as_items(normalized.get(field), field)

    if not normalized["acceptance"]:
        raise ValueError("acceptance must contain at least one check")

    title = normalized.get("title", "Delegated task")
    if not isinstance(title, str) or not title.strip():
        raise ValueError("title must be a non-empty string when provided")
    normalized["title"] = title.strip()
    return normalized


def _section(name: str, items: list[str]) -> list[str]:
    if not items:
        return []
    return [f"## {name}", *[f"- {item}" for item in items], ""]


def build_packet(spec: dict[str, Any], provider: str) -> str:
    data = validate(spec)
    lines = [
        f"# {data['title']}",
        "",
        f"You are the {provider} specialist worker. Codex is the accountable project manager.",
        "Complete only the bounded assignment below; do not expand its scope or perform external actions.",
        "",
        "## Objective",
        data["objective"],
        "",
        "## Deliverable",
        data["deliverable"],
        "",
    ]
    lines.extend(_section("Context", data["context"]))
    lines.extend(_section("Constraints", data["constraints"]))
    lines.extend(_section("Acceptance checks", data["acceptance"]))
    lines.extend(_section("Evidence requirements", data["evidence"]))
    lines.extend(
        [
            "## Response contract",
            "Return exactly these four sections:",
            "1. RESULT - the requested deliverable, ready for Codex to inspect.",
            "2. EVIDENCE - sources, quotations, calculations, or artifacts supporting material claims.",
            "3. GAPS - uncertainty, missing access, unsupported claims, and anything not completed.",
            "4. NEXT - the single most useful verification or follow-up action for Codex.",
            "",
            "Do not claim to have opened a source, used a tool, or completed an action unless you actually did.",
        ]
    )
    return "\n".join(lines)


def load_input(path: str | None) -> dict[str, Any]:
    if path:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    if sys.stdin.isatty():
        raise ValueError("provide --input FILE or pipe a JSON object on stdin")
    return json.load(sys.stdin)


def self_test() -> None:
    packet = build_packet(
        {
            "title": "Market scan",
            "objective": "Find current official pricing.",
            "deliverable": "A comparison table with source links.",
            "context": ["Use public product pages only."],
            "constraints": "Do not infer missing prices.",
            "acceptance": ["Every price has an opened official source."],
            "evidence": ["Include page title and URL."],
        },
        "Gemini",
    )
    for expected in ("# Market scan", "Gemini specialist worker", "## Response contract", "4. NEXT"):
        assert expected in packet
    print("task_packet self-test passed")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build a compact CodexPM task packet from a JSON object."
    )
    parser.add_argument("--provider", default="web AI", help="worker provider name")
    parser.add_argument("--input", help="JSON file; omit to read JSON from stdin")
    parser.add_argument("--self-test", action="store_true", help="run built-in checks")
    args = parser.parse_args()

    try:
        if args.self_test:
            self_test()
            return 0
        spec = load_input(args.input)
        print(build_packet(spec, args.provider.strip() or "web AI"))
        return 0
    except (OSError, json.JSONDecodeError, ValueError, AssertionError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
