# Provider Routing

Choose by task fit and live availability, not brand loyalty. Web product capabilities, limits, and UI change frequently; confirm the required feature in the current signed-in session before depending on it.

## Routing Matrix

| Provider | Strong candidate for | Avoid treating as |
| --- | --- | --- |
| Google Search | Source discovery, current facts, official pages, contrasting coverage | A final analyst or a citation by itself |
| Gemini | Long-context reading, multimodal material, Google ecosystem tasks, an independent analytical pass | Automatically correct because it can search |
| ChatGPT | General synthesis, structured analysis, coding discussion, file or image work when available | A substitute for current local execution or source verification |
| Grok | Current public conversation, X-centric signals, contrarian hypotheses | A reliable factual source without opened citations |
| Doubao | Chinese drafting, Chinese audience phrasing, locally oriented creative work, supported media features | Proof that a Chinese-language claim is current or authoritative |
| Other web AI | A bounded task that matches an observed capability | A reason to expand scope or expose more context |

## Selection Order

Evaluate each candidate in this order:

1. **Fit:** Does the provider have a real advantage for this exact deliverable?
2. **Access:** Is the needed signed-in session and feature currently available?
3. **Context:** Can the task packet fit without leaking private or irrelevant material?
4. **Evidence:** Can Codex inspect the sources or artifacts returned?
5. **Cost:** Will delegation save meaningful context, generation, or elapsed time after browser overhead?
6. **Risk:** Could hallucination, stale information, or account actions cause harm?

If the answer fails at access, evidence, or risk, choose another route or work locally.

## Common Patterns

### Current-fact research

Use Google Search for source discovery and one analytical provider for synthesis. Open the important primary sources yourself before finalizing.

### Long source analysis

Use Gemini or another provider with an observed context advantage for the first pass. Give it an explicit extraction schema. Verify quotations and numbers against the source.

### Chinese content

Use Doubao or another Chinese-first provider for audience phrasing, then let Codex enforce the user's facts, voice, and publication constraints.

### Important decision

Assign the proposal to one provider and an explicit challenge or verification task to another. Do not ask both for generic opinions.

### Repository implementation

Keep local Codex as executor because it can inspect files and run tests. Delegate only a sanitized design question, independent review, or documentation lookup that does not require direct repository access.
