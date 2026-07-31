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

Wait once more, then capture any stable partial output. Retry once in a fresh conversation only when duplicate work has no external side effect.

### UI changed

Re-inspect the visible page and interactive elements. Do not guess selectors or repeatedly click uncertain controls.

### Output is truncated

Ask the worker to continue from the exact last complete heading or request the missing response-contract fields. Do not resubmit the entire task unless necessary.

### Provider refuses or lacks a feature

Record the limitation, choose the next provider from the routing matrix, or complete the task locally. Do not weaken safety constraints to obtain an answer.
