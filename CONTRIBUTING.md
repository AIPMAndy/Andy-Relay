# Contributing to Relay 🤝

First off, thank you for considering contributing to Relay! It's people like you that make open source thrive.

## 🌟 Ways to Contribute

### 1. Add New Provider Adapters
We're always looking to support more AI platforms:
- Perplexity (for research)
- DeepSeek (for coding)
- Claude Web (when API available)
- Your favorite AI platform!

### 2. Update Selectors
AI platform UIs change frequently. Help us keep selectors up-to-date:
- Test existing providers
- Report broken selectors
- Submit fixes with updated CSS selectors

### 3. Share Use Cases
Your real-world scenarios help others:
- Add examples to [EXAMPLES.md](EXAMPLES.md)
- Share workflow patterns
- Document edge cases and solutions

### 4. Fix Bugs
Every bug report and fix helps:
- Check [existing issues](https://github.com/AIPMAndy/Relay/issues)
- Reproduce and document edge cases
- Submit fixes with tests

### 5. Improve Documentation
Clear docs make everyone's life easier:
- Fix typos and unclear explanations
- Add diagrams and screenshots
- Translate to other languages

---

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Relay.git
cd Relay
```

### 2. Install Dependencies

```bash
# For TypeScript components (Claude Code)
cd skills/andy-relay/scripts
bun install  # or npm install

# For Python components (Codex)
cd ../../codex-pm
pip install -r requirements.txt
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## 📝 Development Guidelines

### Code Standards

#### TypeScript/JavaScript
- Use TypeScript for type safety
- Follow existing code style (run linter)
- Add JSDoc comments for public APIs
- Keep functions small and focused

#### Python
- Follow PEP 8 style guide
- Add type hints where applicable
- Use descriptive variable names
- Add docstrings for functions

### Commit Messages

Use clear, descriptive commit messages:

```
✅ Good:
- feat: Add Perplexity provider adapter
- fix: Update ChatGPT input selector
- docs: Clarify human pacing requirements

❌ Bad:
- update stuff
- fix bug
- changes
```

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

---

## ⚠️ Critical Requirements

### 1. Human Pacing (Mandatory)

**All browser operations MUST follow [HUMAN_PACING.md](HUMAN_PACING.md):**

```typescript
// ✅ Correct
await humanDelay(500, 800);  // Random delay 500-800ms
await typeAsHuman(text);      // Chunked with delays

// ❌ Wrong
await page.fill(selector, text);  // Instant, mechanical
for (let i = 0; i < 100; i++) {   // Tight loop, no delays
  await click(button);
}
```

**Why this matters**: Mechanical operations risk account bans. This is non-negotiable.

### 2. Privacy Boundaries

Never:
- Send passwords, API keys, or payment data to workers
- Implement auto-login or CAPTCHA solving
- Publish/delete/modify without user confirmation

Always:
- Keep auth in user control
- Verify worker outputs before using
- Add safety warnings for sensitive operations

### 3. Environment Compatibility

Test in both environments:
- **Codex**: CDP/in-app Browser
- **Claude Code**: Kimi WebBridge MCP

```typescript
// Use the adapter abstraction
const browser = await BrowserAdapter.create();
// Works in both environments automatically
```

---

## 🧪 Testing

### Before Submitting PR

1. **Test both environments** (if applicable)
   ```bash
   # Test in Claude Code
   /relay <your-test-task>
   
   # Test in Codex
   $relay <your-test-task>
   ```

2. **Verify human pacing**
   - Watch the browser automation
   - Ensure delays are visible
   - No mechanical bursts of actions

3. **Run linters**
   ```bash
   # TypeScript
   bun run lint
   
   # Python
   flake8 . --max-line-length=100
   ```

4. **Test edge cases**
   - What if the element doesn't exist?
   - What if the page loads slowly?
   - What if the selector changed?

### Writing Tests

Add tests for new features:

```typescript
// Example: Test provider selection
describe('Provider Selection', () => {
  it('should select Gemini for long-context tasks', () => {
    const task = { capabilities: ['long-context'] };
    const provider = selectProvider(task);
    expect(provider).toBe('gemini');
  });
});
```

---

## 📋 Pull Request Checklist

Before submitting:

- [ ] **Code Quality**
  - [ ] Follows existing code style
  - [ ] No linter errors
  - [ ] Functions have clear names and comments
  
- [ ] **Human Pacing**
  - [ ] All browser ops use `humanDelay`
  - [ ] Text input uses `typeAsHuman`
  - [ ] No tight loops without delays
  
- [ ] **Testing**
  - [ ] Tested in relevant environment(s)
  - [ ] Edge cases considered
  - [ ] No account ban risk
  
- [ ] **Documentation**
  - [ ] Updated README (if user-facing change)
  - [ ] Updated QUICKSTART/EXAMPLES (if new feature)
  - [ ] Added code comments
  - [ ] Updated HUMAN_PACING (if timing changes)
  
- [ ] **Safety**
  - [ ] No hardcoded credentials
  - [ ] Privacy boundaries respected
  - [ ] Error handling added

---

## 🎯 Adding a New Provider

Step-by-step guide:

### 1. Add Provider Config

Edit `skills/relay/scripts/providers.ts`:

```typescript
export const PROVIDERS: Record<string, ProviderConfig> = {
  // ... existing providers
  
  yourprovider: {
    name: 'YourProvider',
    url: 'https://yourprovider.com/chat',
    capabilities: ['capability1', 'capability2'],
    priority: 5,  // 1 (highest) to 10 (lowest)
    selectors: {
      input: 'textarea[data-id="chat-input"]',
      submit: 'button[aria-label="Send"]',
      response: 'div.response-message',
      waiting: 'div.loading-indicator'
    },
    timing: {
      pageLoad: 2000,      // ms to wait after navigation
      beforeType: 500,     // ms before starting to type
      afterSubmit: 1500,   // ms after clicking submit
      pollInterval: 5000   // ms between response checks
    }
  }
};
```

### 2. Test the Selectors

Use browser dev tools:
```javascript
// In the provider's chat page, open console:
document.querySelector('textarea[data-id="chat-input"]')
// Should return the input element
```

### 3. Create Example

Add to [EXAMPLES.md](EXAMPLES.md):

```markdown
### YourProvider Example

**Task**: Specific use case

\`\`\`
/relay let YourProvider <describe task>
\`\`\`

**Why YourProvider**: Explain its unique strength
```

### 4. Update Documentation

- Add to README provider table
- Update QUICKSTART with example
- Add troubleshooting tips if needed

### 5. Test Thoroughly

```bash
# Test basic operation
/relay let YourProvider summarize this article: <URL>

# Test error handling
/relay let YourProvider <task that might fail>

# Test human pacing
# Watch the automation - should look natural
```

---

## 🐛 Reporting Issues

### Before Opening an Issue

1. Check [existing issues](https://github.com/AIPMAndy/Relay/issues)
2. Verify it's not a provider UI change (easy fix)
3. Test in the latest version

### When Reporting

Include:
- **Environment**: Codex or Claude Code
- **Provider**: Which AI platform
- **Steps to reproduce**: Detailed, step-by-step
- **Expected vs actual**: What should vs did happen
- **Logs/screenshots**: Error messages, console output
- **Account safety**: Did it cause unusual behavior?

---

## 💬 Community

- **Questions**: [GitHub Discussions](https://github.com/AIPMAndy/Relay/discussions)
- **Bugs**: [GitHub Issues](https://github.com/AIPMAndy/Relay/issues)
- **Twitter**: [@AIPMAndy](https://twitter.com/AIPMAndy)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make Relay better for everyone.

**Questions?** Don't hesitate to ask in [Discussions](https://github.com/AIPMAndy/Relay/discussions).

---

<div align="center">

**[🔝 Back to Top](#contributing-to-relay-)**

Made with ❤️ by contributors like you

</div>
