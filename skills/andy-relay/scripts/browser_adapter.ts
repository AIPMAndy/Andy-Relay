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
  private timer: OperationTimer = new OperationTimer();

  async navigate(url: string): Promise<void> {
    await this.timer.enforceDelay('navigate', 1500);
    console.log(`[WebBridge] Navigate to ${url}`);
    // Tool invocation would happen here via Claude Code's tool system
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async getPageContent(): Promise<string> {
    await this.timer.enforceDelay('getPageContent', 1000);
    console.log('[WebBridge] Getting page content');
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    await this.timer.enforceDelay('waitForElement', 500);
    console.log(`[WebBridge] Waiting for ${selector}`);
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async click(selector: string): Promise<void> {
    await this.timer.enforceDelay('click', 800);
    console.log(`[WebBridge] Click ${selector}`);
    // After click, add verification delay
    await humanDelay(500, 1000);
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.timer.enforceDelay('fill', 500);
    console.log(`[WebBridge] Fill ${selector} with "${value}"`);

    // For long text, warn about chunking
    if (value.length > 100) {
      console.warn('⚠️ Consider using typeAsHuman() for text longer than 100 chars');
    }

    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async evaluate(code: string): Promise<any> {
    await this.timer.enforceDelay('evaluate', 500);
    console.log(`[WebBridge] Evaluate: ${code.substring(0, 50)}...`);
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async screenshot(): Promise<string> {
    await this.timer.enforceDelay('screenshot', 1000);
    console.log('[WebBridge] Taking screenshot');
    throw new Error('WebBridge tools must be invoked through Claude Code tool system');
  }

  async extractText(selector?: string): Promise<string> {
    await this.timer.enforceDelay('extractText', 800);
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
 * Helper: Generate human-paced delay with jitter
 *
 * ⚠️ CRITICAL: This is a SECURITY requirement, not a performance optimization.
 * Mechanical timing patterns WILL trigger platform detection and account bans.
 *
 * @param min Minimum delay in milliseconds (must be >= 500)
 * @param max Maximum delay in milliseconds
 * @returns Promise that resolves after a randomized human-like delay
 */
export function humanDelay(min: number = 500, max: number = 1500): Promise<void> {
  if (min < 500) {
    console.warn(`⚠️ SAFETY WARNING: humanDelay minimum ${min}ms is below safe threshold (500ms)`);
  }

  // Add micro-jitter to avoid fixed patterns (±100ms)
  const jitter = Math.random() * 200 - 100;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min + jitter;
  const clampedDelay = Math.max(min, Math.min(max + 200, delay));

  return new Promise(resolve => setTimeout(resolve, clampedDelay));
}

/**
 * Operation timer to enforce minimum delays between actions
 * Prevents account bans from mechanical operation patterns
 */
class OperationTimer {
  private lastOperation: number = 0;
  private operationLog: Array<{ name: string; timestamp: number }> = [];

  async enforceDelay(operationName: string, minDelayMs: number): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastOperation;

    if (this.lastOperation > 0 && elapsed < minDelayMs) {
      const needed = minDelayMs - elapsed;
      console.log(`⏱️ Safety delay: ${operationName} needs ${needed}ms more (${elapsed}ms elapsed)`);
      await humanDelay(needed, needed + 500);
    }

    this.lastOperation = Date.now();
    this.operationLog.push({ name: operationName, timestamp: this.lastOperation });

    // Keep only last 10 operations
    if (this.operationLog.length > 10) {
      this.operationLog.shift();
    }
  }

  getOperationLog(): Array<{ name: string; timestamp: number }> {
    return [...this.operationLog];
  }
}
