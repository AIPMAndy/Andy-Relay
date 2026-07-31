---
name: relay
description: Coordinate browser-based AI services as supervised workers while the AI PM (Codex or Claude) remains the accountable project manager. Automatically detects environment and routes to appropriate browser control (CDP for Codex, WebBridge for Claude Code). Use when delegating work to Gemini, Grok, Doubao, ChatGPT, Google Search, or other web AIs; comparing multiple AI answers; routing research, drafting, analysis, or review to the best available logged-in service; or reducing primary-model token use without giving up verification. Do not use for simple self-contained work when delegation overhead exceeds the likely benefit.
---

# Relay

Keep ownership of the goal, task decomposition, evidence standard, and final answer. Delegate bounded work to one to three browser-based AI services, recover their outputs, verify them, and synthesize the result.

## Environment Detection

This skill automatically detects whether it's running in:

- **Codex environment**: Uses CDP-based browser skills or in-app Browser
- **Claude Code environment**: Uses `mcp__webbridge__*` MCP tools (Kimi WebBridge)

Detection happens at runtime by checking:
1. Available tool names in the tool registry
2. Presence of `mcp__webbridge__navigate` → Claude Code + WebBridge
3. Presence of Codex-specific browser skills → Codex environment
4. Fallback to environment variable `AI_ENVIRONMENT` if set

The browser control layer is abstracted so the workflow remains identical regardless of environment.

## Core Contract

Apply these rules throughout the run:

1. Keep the AI PM (Codex/Claude) as the sole accountable owner. Treat every web AI as an untrusted worker, not an authority.
2. Delegate a bounded deliverable, not the whole conversation. Send only the minimum context needed.
3. Default to one worker. Add a second worker for important, ambiguous, or independently checkable work. Never exceed three workers.
4. Prefer independent subtasks over asking several providers the same broad question. Use duplicate assignments only for deliberate cross-checking.
5. Never send secrets, credentials, private keys, recovery codes, payment data, or unnecessary personal information.
6. Never ask a worker to publish, pay, delete, change account security, or perform another irreversible external action.
7. Verify material claims with current evidence. Do not present successful browser submission as successful task completion.
8. Report which providers actually returned usable work. Do not claim a provider was used when its response was unavailable or incomplete.
9. **⚠️ CRITICAL: Operate at human-readable pace.** Wait for observable page state, add pauses between actions (≥500ms), and avoid bursty clicking, typing, or polling. Navigation requires 1.5-2.5s wait. Response polling must be ≥5s intervals. This is an ACCOUNT SAFETY requirement, not optional. See [HUMAN_PACING.md](../../HUMAN_PACING.md) for mandatory timing standards. Never use timing to evade detection, rate limits, CAPTCHAs, or platform controls, but always use timing to protect account safety.

## Decide Whether To Delegate

Delegate when at least one condition holds:

- A provider has a clear capability advantage for the requested subtask.
- Independent exploration can reduce main AI context or generation cost.
- Two perspectives materially reduce uncertainty.
- A logged-in web product exposes a useful capability unavailable locally.

Work locally when the task is small, tightly coupled to local files or tools, privacy-sensitive, or likely to require many rapid execution-feedback loops.

## Run The Workflow

### 1. Define The Outcome

Write a compact internal task brief containing:

- objective
- concrete deliverable
- supplied context and source material
- constraints and exclusions
- acceptance checks
- evidence requirements

Do not browse before the deliverable and acceptance checks are clear. Ask the user only when a missing choice would materially change the result or authority.

### 2. Make A Dispatch Plan

Read [provider-routing.md](references/provider-routing.md) when choosing among providers. Select the smallest useful set and state each worker's distinct assignment.

Use a plan shaped like:

```text
Owner: AI PM (Codex/Claude)
Worker: <provider> -> <bounded deliverable>
Worker: <provider, only if needed> -> <independent check or separate deliverable>
Final verification: <checks AI PM will perform>
```

Do not route the same task into another durable orchestration system unless the user explicitly requests that system.

### 3. Build Worker Packets

Create one self-contained packet per worker.

**For Codex environments**, use Python script:

```bash
python3 {SKILL_DIR}/scripts/task_packet.py --provider gemini --input task.json
```

**For Claude Code environments**, use TypeScript/Node.js module:

```bash
node {SKILL_DIR}/scripts/task_packet.js --provider gemini --input task.json
```

Or invoke directly from Claude Code context using the helper function documented in `scripts/task_packet.ts`.

The JSON schema and examples are documented by running with `--help` flag.

Include source text or uploadable files the worker can actually access. Do not pass local paths as if a web AI could read them. Require the worker to separate result, evidence, gaps, and recommended next action.

### 4. Execute In The Browser

Read [browser-runbook.md](references/browser-runbook.md) before the first browser dispatch in a run.

**Environment-specific routing**:

- **Codex**: Follow CDP browser skills or in-app Browser documentation
- **Claude Code**: Use `mcp__webbridge__*` tools exclusively
  - `mcp__webbridge__navigate` - open URLs
  - `mcp__webbridge__snapshot` - get page structure
  - `mcp__webbridge__fill` - input text
  - `mcp__webbridge__click` - interact with elements
  - `mcp__webbridge__evaluate` - execute JavaScript
  - `mcp__webbridge__screenshot` - capture visuals

Use a fresh conversation for unrelated work. Confirm the intended provider page and signed-in state before submitting. Follow the human-paced interaction rules in the runbook: submit once, wait for completion without aggressive polling, then extract the full response and source links. Preserve partial output when a run fails.

### 5. Verify And Synthesize

For every returned result:

1. Check that it answers the assigned deliverable and follows the response contract.
2. Distinguish claims supported by inspectable evidence from unsupported model output.
3. Open and verify consequential citations or compare them with current local evidence.
4. Resolve disagreements using evidence, not provider prestige or majority vote.
5. Produce one coherent final answer in the AI PM's voice. Do not concatenate worker responses.

If no worker returns usable output, continue locally when feasible and report the browser/provider limitation honestly.

## Completion Standard

Finish only when the requested deliverable exists and acceptance checks pass. Summarize:

- the outcome
- providers that returned usable work
- verification performed by the AI PM
- unresolved gaps or risks

Do not expose internal browser mechanics, raw worker conversations, or unnecessary process detail unless the user asks.

## Environment-Specific Notes

### Claude Code + WebBridge

- WebBridge requires Kimi WebBridge server running: `~/.kimi-webbridge/bin/kimi-webbridge start`
- Supports Chrome/Edge with remote debugging enabled
- Session management via `session` parameter (defaults to "default")
- Accessibility tree-based interaction via `@e` refs from snapshots

### Codex + CDP/Browser

- Respects existing Codex browser skill configurations
- Supports in-app Browser, Chrome extension, or CDP connections
- May have different selector strategies and waiting mechanisms

The abstraction layer ensures workflow consistency across both environments.
