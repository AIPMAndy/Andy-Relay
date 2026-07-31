/**
 * Provider Adapters - AI service specific implementations
 * Handles navigation, input, and output extraction for each web AI
 */

export interface ProviderConfig {
  name: string;
  url: string;
  capabilities: string[];
  inputSelector: string;
  submitSelector: string;
  outputSelector: string;
  newChatSelector?: string;
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  gemini: {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    capabilities: ['long-context', 'multimodal', 'search', 'analysis'],
    inputSelector: 'rich-textarea[aria-label*="prompt" i], textarea[aria-label*="prompt" i], div[contenteditable="true"]',
    submitSelector: 'button[aria-label*="send" i], button[type="submit"]',
    outputSelector: 'message-content, .model-response, [data-test-id="model-response"]',
    newChatSelector: 'button[aria-label*="new chat" i], a[href*="new"]',
  },

  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    capabilities: ['general', 'coding', 'analysis', 'multimodal'],
    inputSelector: '#prompt-textarea, textarea[data-id="root"]',
    submitSelector: 'button[data-testid="send-button"], button[aria-label*="send" i]',
    outputSelector: '.markdown, [data-message-author-role="assistant"]',
    newChatSelector: 'a[href="/"], button[aria-label*="new chat" i]',
  },

  grok: {
    name: 'Grok',
    url: 'https://x.com/i/grok',
    capabilities: ['current-events', 'x-integration', 'contrarian'],
    inputSelector: 'div[contenteditable="true"], textarea[placeholder*="Ask" i]',
    submitSelector: 'button[aria-label*="send" i], button[type="submit"]',
    outputSelector: '.grok-response, [data-testid="grok-message"]',
  },

  doubao: {
    name: 'Doubao',
    url: 'https://www.doubao.com/chat',
    capabilities: ['chinese', 'drafting', 'creative'],
    inputSelector: 'textarea[placeholder*="输入" i], div[contenteditable="true"]',
    submitSelector: 'button[type="submit"], button:has(svg[data-icon="send"])',
    outputSelector: '.message-content, [class*="assistant"]',
    newChatSelector: 'button:has-text("新对话"), a[href*="new"]',
  },

  'google-search': {
    name: 'Google Search',
    url: 'https://www.google.com/search',
    capabilities: ['search', 'facts', 'sources'],
    inputSelector: 'input[name="q"], textarea[name="q"]',
    submitSelector: 'button[type="submit"], input[type="submit"]',
    outputSelector: '#search, #rso',
  },
};

export function getProvider(name: string): ProviderConfig {
  const normalized = name.toLowerCase().replace(/\s+/g, '-');
  const provider = PROVIDERS[normalized];

  if (!provider) {
    throw new Error(
      `Unknown provider: ${name}. Available: ${Object.keys(PROVIDERS).join(', ')}`
    );
  }

  return provider;
}

export function selectProviderForTask(
  task: string,
  capabilities: string[]
): ProviderConfig {
  // Simple capability matching - could be enhanced with more sophisticated logic
  const taskLower = task.toLowerCase();

  // Chinese content detection
  if (/[一-龥]/.test(task) || capabilities.includes('chinese')) {
    return PROVIDERS.doubao;
  }

  // Search/fact finding
  if (taskLower.includes('search') || taskLower.includes('find') || taskLower.includes('source')) {
    return PROVIDERS['google-search'];
  }

  // Long document analysis
  if (taskLower.includes('long') || taskLower.includes('document') || taskLower.includes('analyze')) {
    return PROVIDERS.gemini;
  }

  // Current events
  if (taskLower.includes('current') || taskLower.includes('recent') || taskLower.includes('news')) {
    return PROVIDERS.grok;
  }

  // Default to ChatGPT for general tasks
  return PROVIDERS.chatgpt;
}

/**
 * Provider-specific execution instructions for Claude Code
 */
export function getWebBridgeInstructions(provider: ProviderConfig): string {
  return `
# ${provider.name} Execution Instructions (WebBridge)

Use these exact steps with mcp__webbridge__* tools:

1. **Navigate**:
   \`\`\`
   mcp__webbridge__navigate({ url: "${provider.url}" })
   \`\`\`

2. **Wait for page load** (1-2 seconds for stability)

3. **Get page snapshot**:
   \`\`\`
   mcp__webbridge__snapshot()
   \`\`\`

4. **Start new chat** (if needed):
   ${provider.newChatSelector ? `Click: "${provider.newChatSelector}"` : 'Navigate to root URL'}

5. **Locate input field**:
   Find element matching: \`${provider.inputSelector}\`
   Use snapshot @e refs or CSS selector

6. **Fill input**:
   \`\`\`
   mcp__webbridge__fill({
     selector: "<from-snapshot>",
     value: "<task-packet>"
   })
   \`\`\`

7. **Verify input** (take screenshot or check with evaluate)

8. **Submit**:
   \`\`\`
   mcp__webbridge__click({ selector: "${provider.submitSelector}" })
   \`\`\`

9. **Wait for generation**:
   - Poll every 3-5 seconds
   - Check for completion indicators
   - Use evaluate to detect stable state

10. **Extract response**:
    \`\`\`
    mcp__webbridge__evaluate({
      code: \`
        (function() {
          const output = document.querySelector('${provider.outputSelector}');
          return output ? output.innerText : null;
        })();
      \`
    })
    \`\`\`

11. **Extract citations** (if applicable):
    Look for links, source references, footnotes

12. **Return to AI PM** with structured response following the contract
`;
}

/**
 * Provider-specific execution instructions for Codex
 */
export function getCodexInstructions(provider: ProviderConfig): string {
  return `
# ${provider.name} Execution Instructions (Codex CDP)

Use Codex browser skills with these selectors:

1. Navigate to: ${provider.url}
2. Wait for page ready
3. ${provider.newChatSelector ? `Optional: Click "${provider.newChatSelector}" for fresh conversation` : ''}
4. Input selector: \`${provider.inputSelector}\`
5. Submit selector: \`${provider.submitSelector}\`
6. Output selector: \`${provider.outputSelector}\`

Follow browser-runbook.md for human-paced interaction patterns.
`;
}
