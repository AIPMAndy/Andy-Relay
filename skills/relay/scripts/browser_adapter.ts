/**
 * Browser Adapter - Environment-agnostic browser control
 * Automatically detects Codex vs Claude Code and routes to appropriate implementation
 */

export type Environment = 'codex' | 'claude-code' | 'unknown';

export interface BrowserAdapter {
  readonly environment: Environment;
  navigate(url: string): Promise<void>;
  getPageContent(): Promise<string>;
  waitForElement(selector: string, timeout?: number): Promise<void>;
  click(selector: string): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  evaluate(code: string): Promise<any>;
  screenshot(): Promise<string>;
  extractText(selector?: string): Promise<string>;
}

/**
 * Detect current AI environment
 */
export function detectEnvironment(): Environment {
  // Check environment variable first
  const envVar = process.env.AI_ENVIRONMENT;
  if (envVar === 'codex' || envVar === 'claude-code') {
    return envVar;
  }

  // Check for WebBridge MCP tools (Claude Code indicator)
  // In actual Claude Code context, tools would be available via the tool registry
  // This is a placeholder - actual detection happens at runtime

  // For now, we use heuristics:
  // 1. Check if we're in a Claude Code session (has specific env markers)
  // 2. Check if WebBridge tools are available

  if (process.env.CLAUDE_CODE_SESSION || process.env.KIMI_WEBBRIDGE_PORT) {
    return 'claude-code';
  }

  // Check for Codex-specific markers
  if (process.env.CODEX_SESSION || process.env.OPENCLAW_WORKSPACE) {
    return 'codex';
  }

  return 'unknown';
}

/**
 * Create appropriate browser adapter based on environment
 */
export function createBrowserAdapter(): BrowserAdapter {
  const env = detectEnvironment();

  switch (env) {
    case 'claude-code':
      return new WebBridgeAdapter();
    case 'codex':
      return new CodexBrowserAdapter();
    default:
      throw new Error(
        'Unable to detect environment. Set AI_ENVIRONMENT=codex or AI_ENVIRONMENT=claude-code'
      );
  }
}

/**
 * WebBridge adapter for Claude Code
 */
class WebBridgeAdapter implements BrowserAdapter {
  readonly environment: Environment = 'claude-code';
  private session: string = 'default';

  async navigate(url: string): Promise<void> {
    // In actual Claude Code context, this would invoke mcp__webbridge__navigate
    console.log(`[WebBridge] Navigate to ${url}`);
    // Tool invocation would happen here via Claude Code's tool system
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async getPageContent(): Promise<string> {
    // Use snapshot + evaluate to get content
    console.log('[WebBridge] Getting page content');
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    console.log(`[WebBridge] Waiting for ${selector}`);
    // Use evaluate with polling
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async click(selector: string): Promise<void> {
    console.log(`[WebBridge] Click ${selector}`);
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async fill(selector: string, value: string): Promise<void> {
    console.log(`[WebBridge] Fill ${selector} with "${value}"`);
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async evaluate(code: string): Promise<any> {
    console.log(`[WebBridge] Evaluate: ${code.substring(0, 50)}...`);
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async screenshot(): Promise<string> {
    console.log('[WebBridge] Taking screenshot');
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async extractText(selector?: string): Promise<string> {
    console.log(`[WebBridge] Extract text from ${selector || 'body'}`);
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }
}

/**
 * Codex CDP browser adapter
 */
class CodexBrowserAdapter implements BrowserAdapter {
  readonly environment: Environment = 'codex';

  async navigate(url: string): Promise<void> {
    console.log(`[Codex CDP] Navigate to ${url}`);
    // Delegate to Codex's browser skill
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }

  async getPageContent(): Promise<string> {
    console.log('[Codex CDP] Getting page content');
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }

  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    console.log(`[Codex CDP] Waiting for ${selector}`);
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }

  async click(selector: string): Promise<void> {
    console.log(`[Codex CDP] Click ${selector}`);
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }

  async fill(selector: string, value: string): Promise<void> {
    console.log(`[Codex CDP] Fill ${selector}`);
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }

  async evaluate(code: string): Promise<any> {
    console.log(`[Codex CDP] Evaluate: ${code.substring(0, 50)}...`);
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }

  async screenshot(): Promise<string> {
    console.log('[Codex CDP] Taking screenshot');
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }

  async extractText(selector?: string): Promise<string> {
    console.log(`[Codex CDP] Extract text from ${selector || 'body'}`);
    throw new Error('Codex browser skills must be invoked through Codex tool system');
  }
}

/**
 * Helper: Generate human-paced delay
 */
export function humanDelay(min: number = 500, max: number = 1500): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}
