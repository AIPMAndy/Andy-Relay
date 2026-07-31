<div align="center">

# Relay

### Your AI orchestration layer. Route, verify, deliver.

你的 AI 编排层。调度、核验、交付。

[![License: MIT](https://img.shields.io/badge/license-MIT-111111.svg)](LICENSE)
![Works with Codex](https://img.shields.io/badge/works%20with-Codex-0A7C66.svg)
![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-7C3AED.svg)

</div>

## ⚠️ 核心安全要求

**Relay 必须模拟人类操作节奏，这不是可选建议，是账号安全的硬性要求。**

- ✅ 所有操作间隔 ≥ 500ms
- ✅ 页面导航后等待 1.5-2.5 秒
- ✅ 长文本分段输入，段间延迟 300-800ms
- ✅ 响应轮询间隔 ≥ 5 秒
- ❌ 禁止高频操作、批量无延迟、固定时间模式

详见：[HUMAN_PACING.md](HUMAN_PACING.md) - **使用前必读**

---

Relay 是一个开源 AI Skill。它把已登录的网页版 AI 当作受监督的临时 Worker：AI PM（Codex 或 Claude）负责拆任务、选择模型、控制浏览器、收回结果、核验事实和交付最终答案。

**环境支持**：
- **Codex 环境**：使用 CDP 浏览器或 in-app Browser
- **Claude Code 环境**：使用 Kimi WebBridge MCP 工具

它不是“把问题复制给更多 AI”。它解决的是四件事：

- 把搜索、长文初读、初稿和独立审查交给更合适的网页 AI
- 只发送完成子任务所需的最小上下文，减少主模型上下文消耗
- 默认单 Worker，必要时才做双模型交叉验证，最多三个
- 使用基于页面状态的等待和适度间歇，让浏览器操作稳定、清晰、不连点
- 保留密码、验证码、支付、发布、删除和账号安全的人工边界

## 适合什么任务

```text
用 /relay 调度 Gemini 读这份长报告，Google Search 查最新事实，你最后核验并给我结论。

用 /relay 把中文初稿交给豆包做口语化，再让 Grok 只检查争议点，你负责定稿。

用 /relay 找一个网页版 AI 做独立代码方案审查，不要把私有仓库和密钥发出去。
```

## 安装

```bash
git clone https://github.com/AIPMAndy/Relay.git
cd Relay
./install.sh
```

安装后在 Codex 或 Claude Code 中直接调用：

**Codex**:
```text
用 $relay 调度最合适的网页版 AI 完成这个任务，并由你核验结果：...
```

**Claude Code**:
```text
用 /relay 调度最合适的网页版 AI 完成这个任务，并由你核验结果：...
```

Relay 自动检测环境并选择合适的浏览器控制方式。它不会替你创建付费订阅，也不会绕过登录、验证码或安全验证。

浏览器操作默认采用“人类节奏”：导航后等页面稳定，输入后确认内容，再提交；生成期间降低轮询频率，不连续点击。这里的间歇只用于稳定性和体验，不用于伪装真人、规避限流、验证码、风控或平台检测。

## 工作方式

```text
用户目标
  -> AI PM 定义交付物和验收标准
  -> 选择 1-3 个最合适的网页版 AI
  -> 发送最小化任务包
  -> 回收结果和证据
  -> AI PM 核验、解决冲突并最终交付
```

核心 Skill 位于 [`skills/relay`](skills/relay)。任务包生成器可以独立使用：

**Python (Codex)**:
```bash
python3 skills/relay/scripts/task_packet.py --help
python3 skills/relay/scripts/task_packet.py --self-test
```

**TypeScript (Claude Code)**:
```bash
node skills/relay/scripts/task_packet.ts --help
node skills/relay/scripts/task_packet.ts --self-test
```

## 安全边界

- 网页 AI 的回答是候选产物，不是事实真源。
- 不向 Worker 发送凭证、密钥、支付数据或无关隐私。
- 不让 Worker 代替用户发布、付款、删除或修改账号安全设置。
- 涉及重要事实时，AI PM 必须打开原始来源或用当前本地证据核验。
- 登录、OTP、CAPTCHA、Passkey 和 2FA 始终交还用户。

## English

Relay is an open-source AI Skill that treats logged-in web AIs as supervised workers. The AI PM (Codex or Claude) remains the accountable project manager: it defines the deliverable, routes bounded tasks, controls the available browser surface, collects evidence, resolves disagreements, and verifies the final result.

**Environment Support:**
- **Codex**: CDP browser or in-app Browser
- **Claude Code**: Kimi WebBridge MCP tools

It supports capability-based routing to Gemini, Grok, Doubao, ChatGPT, Google Search, and other web services without hard-coding volatile page selectors. One worker is the default; additional workers are used only when independent work or cross-checking materially improves the outcome. Browser actions use state-aware, human-readable pacing for stability, never impersonation or anti-detection behavior.

## License

[MIT](LICENSE) · Created by Andy ([@AIPMAndy](https://github.com/AIPMAndy))
