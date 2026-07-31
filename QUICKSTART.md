# Andy-Relay Quick Start

## Installation

```bash
git clone https://github.com/AIPMAndy/Relay.git
cd Relay
./install.sh
```

The installer automatically detects your environment (Codex or Claude Code) and installs to the appropriate location.

## Usage

### Codex

```text
用 $andy-relay 调度 Gemini 分析这份报告，并由你核验结果
```

### Claude Code

```text
用 /andy-relay 调度 ChatGPT 写初稿，豆包做中文润色，你负责最终审核
```

**Prerequisites for Claude Code:**
- Kimi WebBridge must be running: `~/.kimi-webbridge/bin/kimi-webbridge start`
- Chrome/Edge with logged-in AI services

## Task Examples

### Research with verification
```text
/andy-relay 让 Google Search 找到三个权威来源关于量子计算的最新进展，
Gemini 总结核心发现，你打开原始链接核验关键数据并给我最终报告
```

### Multi-model review
```text
/andy-relay 把这段代码交给 ChatGPT 做性能分析，Gemini 做安全审查，
你综合两个视角给我改进建议
```

### Chinese content workflow
```text
/andy-relay 让豆包把这篇英文文章改写成适合中国用户的口语化版本，
你检查事实准确性并修正任何误导性表达
```

### Long document processing
```text
/andy-relay 把这份 PDF（已上传到 Gemini）交给它提取关键结论和数据表格，
你核对引用页码并补充遗漏的重要信息
```

## How It Works

```
You → AI PM (Codex/Claude)
      ↓
   Task decomposition
      ↓
   Worker selection (1-3 web AIs)
      ↓
   Browser control (auto-detected)
      ├─ Codex: CDP / in-app Browser
      └─ Claude Code: WebBridge MCP
      ↓
   Result collection
      ↓
   Evidence verification
      ↓
   Final synthesis → You
```

## Environment Detection

Andy-Relay automatically detects:

1. **Tool availability**: Checks for `mcp__webbridge__*` tools (Claude Code) or Codex browser skills
2. **Environment variables**: `AI_ENVIRONMENT`, `CODEX_HOME`, `CLAUDE_CODE_SESSION`
3. **Directory structure**: `.claude/` or `.codex/` presence

No manual configuration needed.

## Provider Capabilities

| Provider | Best for | Avoid for |
|----------|----------|-----------|
| **Google Search** | Current facts, source discovery | Final analysis without verification |
| **Gemini** | Long documents, multimodal, Google ecosystem | Assuming search results are always current |
| **ChatGPT** | General synthesis, coding, structured analysis | Real-time data or external tool execution |
| **Grok** | Current events, X-centric insights | Factual claims without citations |
| **Doubao (豆包)** | Chinese drafting, local cultural context | Proof of factual accuracy |

## Safety Boundaries

✅ **Andy-Andy-Relay will:**
- Route tasks to appropriate web AIs
- Extract and return results
- Wait for generation completion
- Preserve partial outputs on failure

❌ **Andy-Relay will NOT:**
- Send passwords, API keys, or credentials
- Perform irreversible actions (publish, pay, delete)
- Bypass login, CAPTCHA, or 2FA
- Impersonate human behavior to evade detection
- Trust worker output without AI PM verification

## Troubleshooting

### Claude Code: WebBridge not found
```bash
# Start WebBridge
~/.kimi-webbridge/bin/kimi-webbridge start

# Verify it's running
ps aux | grep kimi-webbridge
```

### Codex: Browser skill not available
Check that you have one of:
- In-app Browser enabled
- Chrome/Edge extension installed
- CDP browser skill installed

### Worker returns incomplete output
Andy-Relay will:
1. Capture partial output
2. Ask worker to continue from last complete section
3. Report limitation to AI PM if retry fails

### Login required
Andy-Relay will pause and ask you to:
1. Open the browser
2. Sign in to the required service
3. Confirm when ready

## Advanced Usage

### Custom task packets

**Python (Codex)**:
```bash
python3 skills/andy-relay/scripts/task_packet.py \
  --provider gemini \
  --input task.json
```

**TypeScript (Claude Code)**:
```bash
node skills/andy-relay/scripts/task_packet.ts \
  --provider chatgpt \
  --input task.json
```

Task JSON schema:
```json
{
  "title": "Market research",
  "objective": "Find current pricing for top 3 competitors",
  "deliverable": "Comparison table with source links",
  "context": ["Use official product pages only"],
  "constraints": ["Do not infer missing data"],
  "acceptance": ["Every price has a verifiable source"],
  "evidence": ["Include page title and URL"]
}
```

### Provider selection logic

Andy-Relay chooses providers based on:
1. **Task language**: Chinese text → Doubao
2. **Task type**: "search" → Google Search, "analyze" → Gemini
3. **Context length**: Long docs → Gemini
4. **Current events**: Recent news → Grok
5. **Default**: ChatGPT for general tasks

Override by explicitly naming the provider:
```text
/andy-relay 用 Gemini 完成这个任务（即使 ChatGPT 更合适）
```

## Architecture

```
skills/andy-relay/
├── SKILL.md                    # Main skill definition
├── references/
│   ├── browser-runbook.md      # Browser control guidelines
│   └── provider-routing.md     # Provider selection matrix
└── scripts/
    ├── task_packet.py          # Python task packet generator (Codex)
    ├── task_packet.ts          # TypeScript task packet generator (Claude Code)
    ├── browser_adapter.ts      # Environment detection & abstraction
    └── providers.ts            # Provider configs & routing logic
```

## License

[MIT](LICENSE) · Created by Andy ([@AIPMAndy](https://github.com/AIPMAndy))
