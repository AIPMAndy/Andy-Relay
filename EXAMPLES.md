# Andy-Relay 使用示例

本文档展示 Andy-Relay 在真实场景中的完整工作流程。

## ✅ 已完成设置

- ✓ Andy-Relay 已安装到 `~/.claude/skills/andy-relay`
- ✓ Kimi WebBridge 正在运行 (v1.11.3)
- ✓ 环境检测：Claude Code + WebBridge
- ✓ GitHub 仓库：https://github.com/AIPMAndy/Relay

## 示例 1：研究任务与事实核验

**用户请求**：
```
用 /andy-relay 调度 Google Search 查找"Claude Opus 4.8 发布时间和主要特性"，
让 Gemini 总结关键信息，你打开官方来源核验并给我最终报告
```

**Andy-Relay 执行流程**：

1. **任务分解**（AI PM: Claude）
   ```
   Owner: Claude
   Worker 1: Google Search → 找到官方发布公告和技术文档
   Worker 2: Gemini → 总结关键特性和发布时间
   Final verification: Claude 打开主要来源核验事实
   ```

2. **生成任务包**
   ```typescript
   // Worker 1 - Google Search
   {
     title: "Claude Opus 4.8 发布信息搜索",
     objective: "找到 Anthropic 官方发布公告和可信技术报道",
     deliverable: "3-5 个高质量来源链接和摘要",
     acceptance: ["至少一个 Anthropic 官方来源", "包含发布日期"],
     evidence: ["完整 URL", "页面标题"]
   }

   // Worker 2 - Gemini
   {
     title: "Claude Opus 4.8 特性总结",
     objective: "基于提供的来源总结主要特性",
     deliverable: "结构化特性列表和发布时间",
     context: ["<Worker 1 返回的链接和摘要>"],
     acceptance: ["每个特性有来源支撑"],
     evidence: ["引用具体段落和 URL"]
   }
   ```

3. **浏览器执行**（WebBridge）
   ```javascript
   // Worker 1: Google Search
   mcp__webbridge__navigate({ url: "https://www.google.com/search?q=Claude+Opus+4.8+release" })
   // 等待页面加载
   mcp__webbridge__snapshot() // 获取结果列表
   // 提取前5个结果的标题、URL、摘要
   
   // Worker 2: Gemini
   mcp__webbridge__navigate({ url: "https://gemini.google.com" })
   mcp__webbridge__fill({ selector: "textarea", value: "<任务包>" })
   mcp__webbridge__click({ selector: "button[aria-label='Send']" })
   // 等待生成完成
   mcp__webbridge__evaluate({ code: "document.querySelector('.model-response').innerText" })
   ```

4. **核验与综合**（AI PM: Claude）
   - 打开 Anthropic 官方博客链接
   - 对比 Gemini 总结与原文
   - 检查发布日期准确性
   - 修正任何误解或遗漏
   - 产出最终报告

**输出示例**：
```markdown
# Claude Opus 4.8 发布信息（已核验）

## 发布时间
2026年1月（已从 Anthropic 官方博客确认）

## 主要特性
1. **扩展上下文窗口** - 200K tokens（已验证）
2. **改进推理能力** - 在 MMLU 基准测试提升 15%（来源：Anthropic 技术报告）
3. **多语言支持增强** - 特别是中文理解（已确认）

## 来源
- [Anthropic 官方博客](https://www.anthropic.com/...)（已打开核验）
- [技术报告 PDF](https://...)（Gemini 引用正确）

## 核验说明
- Gemini 总结准确，无误导性表达
- 所有数字和日期已对照原始来源
- 未发现遗漏的重要特性
```

---

## 示例 2：中文内容工作流

**用户请求**：
```
用 /andy-relay 把这篇英文技术文章改写成适合中国开发者阅读的版本：
<文章内容>
```

**Andy-Relay 执行流程**：

1. **任务分解**
   ```
   Owner: Claude
   Worker: Doubao → 中文改写和本地化
   Final verification: Claude 检查技术准确性和文化适配性
   ```

2. **任务包**
   ```typescript
   {
     title: "技术文章中文本地化",
     objective: "将英文技术内容改写为中国开发者熟悉的表达",
     deliverable: "中文版文章，保持技术准确性",
     context: ["原文：<文章>", "目标读者：中国开发者"],
     constraints: [
       "不要过度意译",
       "保留原始技术术语",
       "使用中国开发者常用工具举例"
     ],
     acceptance: [
       "技术概念准确",
       "例子贴合中国场景",
       "语言自然流畅"
     ],
     evidence: ["标注重大改动理由"]
   }
   ```

3. **执行与核验**
   - Doubao 生成中文版本
   - Claude 对比原文检查：
     - 技术概念是否准确
     - 是否有误导性本地化
     - 示例是否合适
   - 修正文化差异导致的误解

---

## 示例 3：多模型独立审查

**用户请求**：
```
用 /andy-relay 让两个 AI 独立审查这段代码的安全性和性能，你综合结论
```

**Andy-Relay 执行流程**：

1. **任务分解**（独立并行）
   ```
   Owner: Claude
   Worker 1: ChatGPT → 安全审查
   Worker 2: Gemini → 性能分析
   Final synthesis: Claude 综合建议，解决冲突
   ```

2. **任务包**（两个独立的包）
   ```typescript
   // Worker 1 - 安全审查
   {
     objective: "识别代码中的安全漏洞",
     deliverable: "安全问题清单，按严重程度排序",
     acceptance: ["每个问题有具体位置", "提供修复建议"],
     evidence: ["引用 OWASP 或 CVE 标准"]
   }

   // Worker 2 - 性能分析
   {
     objective: "识别性能瓶颈和优化机会",
     deliverable: "性能问题清单和改进方案",
     acceptance: ["量化性能影响", "提供优化代码"],
     evidence: ["算法复杂度分析"]
   }
   ```

3. **综合与冲突解决**
   - Claude 对比两个审查结果
   - 解决建议冲突（如安全 vs 性能权衡）
   - 排序优先级
   - 产出行动清单

---

## 环境检测示例

**运行时检测逻辑**：
```typescript
// browser_adapter.ts 自动执行

function detectEnvironment(): Environment {
  // 1. 检查环境变量
  if (process.env.AI_ENVIRONMENT) {
    return process.env.AI_ENVIRONMENT; // 'codex' | 'claude-code'
  }

  // 2. 检查 Claude Code 标记
  if (process.env.CLAUDE_CODE_SESSION || process.env.KIMI_WEBBRIDGE_PORT) {
    return 'claude-code';
  }

  // 3. 检查 Codex 标记
  if (process.env.CODEX_SESSION || process.env.OPENCLAW_WORKSPACE) {
    return 'codex';
  }

  // 4. 检查工具可用性（运行时）
  // Claude Code: mcp__webbridge__* 工具存在
  // Codex: CDP browser skills 存在

  return 'unknown';
}
```

**当前环境**：
```json
{
  "detected": "claude-code",
  "browser_control": "mcp__webbridge__*",
  "webbridge_version": "v1.11.3",
  "extension_connected": true,
  "skill_path": "/Users/andy/.claude/skills/andy-relay"
}
```

---

## 测试任务包生成器

**Python (Codex)**:
```bash
cd /Users/andy/.claude/skills/andy-relay
python3 scripts/task_packet.py --self-test
# ✓ task_packet self-test passed

python3 scripts/task_packet.py --provider Gemini --input - <<EOF
{
  "title": "API 价格调研",
  "objective": "找到三大云服务商的 GPU 实例价格",
  "deliverable": "价格对比表",
  "acceptance": ["每个价格有官方来源"],
  "evidence": ["包含页面 URL 和截图时间"]
}
EOF
```

**TypeScript (Claude Code)**:
```bash
cd /Users/andy/.claude/skills/andy-relay
node scripts/task_packet.ts --self-test
# ✓ task_packet self-test passed

echo '{"objective":"测试","deliverable":"结果","acceptance":"完成"}' | \
  node scripts/task_packet.ts --provider ChatGPT
```

---

## 下一步

1. **实际测试**：在 Claude Code 中运行 `/andy-relay` 调度一个简单任务
2. **提供商配置**：确保已登录 Gemini/ChatGPT/Doubao
3. **反馈循环**：根据实际使用优化选择器和等待逻辑

## 已知限制

1. **选择器波动**：Web AI 的 UI 经常变化，可能需要更新 `providers.ts`
2. **生成检测**：需要更智能的"生成完成"判断逻辑
3. **错误恢复**：部分失败场景需要更完善的降级策略

## 贡献

发现问题或改进建议？
- 提 Issue: https://github.com/AIPMAndy/Relay/issues
- 提 PR: https://github.com/AIPMAndy/Relay/pulls
