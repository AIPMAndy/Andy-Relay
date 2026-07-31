# Browser Dispatch Runbook

Use this runbook together with the browser-control Skill available in the current Codex environment. The browser Skill owns its setup and tool-specific commands; CodexPM owns task routing and verification.

## Choose A Browser Surface

1. Honor an explicit user choice of in-app Browser, Chrome, Edge, or another supported surface.
2. Otherwise prefer an available Codex in-app browser or connected browser extension with the required signed-in session.
3. Use a CDP-based Chrome route only when its Skill is installed and its read-only detection succeeds.
4. Never terminate or restart the user's browser, clear a profile, or reset login state without explicit consent at that moment.
5. If the requested surface is unavailable, report that limitation instead of silently switching when the user's choice was explicit.

Before acting, load and follow the selected surface's browser Skill or complete runtime documentation. Do not copy tool-specific commands from this project when the installed browser integration provides newer instructions.

## Dispatch Sequence

1. Reuse an existing browser binding when valid.
2. Open the provider's canonical site in a fresh tab or use an existing authenticated tab.
3. Verify the provider identity and signed-in state from visible page content.
4. Start a new conversation unless continuity is part of the task.
5. Insert the complete worker packet. Attach only files approved for that provider.
6. Submit once. Poll or wait without duplicating the prompt.
7. Wait until generation completes or the provider exposes a stable final response.
8. Extract the complete response, visible citations, and requested attachments.
9. Return control to Codex for verification and synthesis.

Prefer semantic inspection and current interactive elements over hard-coded selectors. Treat UI labels and DOM structure as volatile.

## Human-Paced Interaction

Operate with deliberate, state-aware pacing so the page can settle and each action remains understandable. This is a reliability and experience rule, not human impersonation or an anti-detection technique.

1. Prefer an observable condition over a blind delay: page load, a unique input becoming ready, submitted text appearing, a stop button appearing, or the final response stabilizing.
2. After navigation or a major UI transition, wait for the relevant state and then allow a brief settling pause, typically about 0.5 to 1.5 seconds.
3. Before typing, confirm the target is unique and ready. Insert the complete packet with the browser surface's supported typing or fill action; do not create dozens of per-character tool calls.
4. After inserting text, pause briefly and verify the expected content is present before submitting. Do not paste and click submit in the same burst.
5. After submission, wait for a visible generation state before checking output. Poll no faster than every 2 to 5 seconds; increase the interval to roughly 5 to 10 seconds for long generations.
6. Between separate provider dispatches, allow the previous action to stabilize before switching tabs. A short 1 to 3 second pause is usually sufficient when no stronger state signal exists.
7. Stop immediately when the user takes control, a confirmation boundary appears, or the page reports throttling. Resume only from the new visible state.

Do not add random mouse movement, intentional mistakes, fingerprint changes, timing jitter intended to look human, or delays intended to bypass platform enforcement. Do not sleep when the required state is already observable and stable; unnecessary waiting makes the experience less smooth.

## Authentication And Safety Handoffs

Stop and hand control to the user for:

- passwords and passkeys
- OTP, CAPTCHA, and two-factor authentication
- recovery codes or secret reveal/copy actions
- subscriptions, purchases, credits, and payment profiles
- account security or permission changes

Never inspect cookies, local storage, saved passwords, browser profiles, or authentication tokens merely to avoid a handoff.

## Failure Recovery

### Logged out

Ask the user to sign in on the selected browser surface and tell you when it is ready. Preserve the task packet.

### Response stalls

Increase the polling interval and wait once more, then capture any stable partial output. Retry once in a fresh conversation only when duplicate work has no external side effect.

### UI changed

Re-inspect the visible page and interactive elements. Do not guess selectors or repeatedly click uncertain controls.

### Output is truncated

Ask the worker to continue from the exact last complete heading or request the missing response-contract fields. Do not resubmit the entire task unless necessary.

### Provider refuses or lacks a feature

Record the limitation, choose the next provider from the routing matrix, or complete the task locally. Do not weaken safety constraints to obtain an answer.
