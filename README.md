<div align="center">

# CodexPM

### Let Codex manage the work, not do every token of it.

让 Codex 做项目经理，调度 Gemini、Grok、豆包、ChatGPT、Google Search 等网页版 AI，并对结果负责。

[![License: MIT](https://img.shields.io/badge/license-MIT-111111.svg)](LICENSE)
![Works with Codex](https://img.shields.io/badge/works%20with-Codex-0A7C66.svg)

</div>

CodexPM 是一个开源 Codex Skill。它把已登录的网页版 AI 当作受监督的临时 Worker：Codex 负责拆任务、选择模型、控制浏览器、收回结果、核验事实和交付最终答案。

它不是“把问题复制给更多 AI”。它解决的是四件事：

- 把搜索、长文初读、初稿和独立审查交给更合适的网页 AI
- 只发送完成子任务所需的最小上下文，减少主模型上下文消耗
- 默认单 Worker，必要时才做双模型交叉验证，最多三个
- 使用基于页面状态的等待和适度间歇，让浏览器操作稳定、清晰、不连点
- 保留密码、验证码、支付、发布、删除和账号安全的人工边界

## 适合什么任务

```text
用 CodexPM 调度 Gemini 读这份长报告，Google Search 查最新事实，你最后核验并给我结论。

用 CodexPM 把中文初稿交给豆包做口语化，再让 Grok 只检查争议点，你负责定稿。

用 CodexPM 找一个网页版 AI 做独立代码方案审查，不要把私有仓库和密钥发出去。
```

## 安装

```bash
git clone https://github.com/AIPMAndy/CodexPM.git
cd CodexPM
./install.sh
```

安装后新建 Codex 任务，直接说：

```text
用 $codex-pm 调度最合适的网页版 AI 完成这个任务，并由你核验结果：...
```

CodexPM 使用当前 Codex 环境里可用的 in-app Browser、Chrome/Edge 扩展或已安装的 CDP 浏览器 Skill。它不会替你创建付费订阅，也不会绕过登录、验证码或安全验证。

浏览器操作默认采用“人类节奏”：导航后等页面稳定，输入后确认内容，再提交；生成期间降低轮询频率，不连续点击。这里的间歇只用于稳定性和体验，不用于伪装真人、规避限流、验证码、风控或平台检测。

## 工作方式

```text
用户目标
  -> Codex 定义交付物和验收标准
  -> 选择 1-3 个最合适的网页版 AI
  -> 发送最小化任务包
  -> 回收结果和证据
  -> Codex 核验、解决冲突并最终交付
```

核心 Skill 位于 [`skills/codex-pm`](skills/codex-pm)。任务包生成器可以独立使用：

```bash
python3 skills/codex-pm/scripts/task_packet.py --help
python3 skills/codex-pm/scripts/task_packet.py --self-test
```

## 安全边界

- 网页 AI 的回答是候选产物，不是事实真源。
- 不向 Worker 发送凭证、密钥、支付数据或无关隐私。
- 不让 Worker 代替用户发布、付款、删除或修改账号安全设置。
- 涉及重要事实时，Codex 必须打开原始来源或用当前本地证据核验。
- 登录、OTP、CAPTCHA、Passkey 和 2FA 始终交还用户。

## English

CodexPM is an open-source Codex Skill that treats logged-in web AIs as supervised workers. Codex remains the accountable project manager: it defines the deliverable, routes bounded tasks, controls the available browser surface, collects evidence, resolves disagreements, and verifies the final result.

It supports capability-based routing to Gemini, Grok, Doubao, ChatGPT, Google Search, and other web services without hard-coding volatile page selectors. One worker is the default; additional workers are used only when independent work or cross-checking materially improves the outcome. Browser actions use state-aware, human-readable pacing for stability, never impersonation or anti-detection behavior.

## License

[MIT](LICENSE) · Created by Andy ([@AIPMAndy](https://github.com/AIPMAndy))
