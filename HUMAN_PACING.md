# Human Pacing - 人类节奏操作规范

## ⚠️ 核心安全要求 - 不可绕过

**这不是可选建议，是必须遵守的安全边界。违反此规范可能导致账号被封禁。**

Relay 在控制浏览器操作网页 AI 时，**必须模拟真实人类的操作节奏和行为模式**。这是保护用户账号安全的第一要务。

---

## 为什么必须模拟人类？

1. **平台风控检测**：所有主流 AI 平台（X/Grok、Google、OpenAI、字节）都有反机器人检测
2. **账号安全**：机械式操作会触发限流、CAPTCHA 或永久封禁
3. **用户责任**：Relay 使用用户已登录的账号，账号安全是最高优先级
4. **法律合规**：自动化操作需符合平台服务条款

**记住：Relay 的目标是"让 AI 帮你完成任务"，不是"让机器人伪装成你"。**

---

## 强制执行的人类行为模式

### 1. 导航等待（Navigation）

```typescript
// ❌ 错误：立即操作
navigate(url);
click(button);

// ✅ 正确：等待页面稳定
navigate(url);
await humanDelay(1500, 2500);  // 1.5-2.5秒
await waitForPageReady();
click(button);
```

**要求**：
- 导航后等待 1.5-2.5 秒
- 检查页面加载完成状态
- 等待关键元素出现

### 2. 文本输入（Typing）

```typescript
// ❌ 错误：一次性粘贴大段文字
fill(textarea, longText);  // 瞬间填充 -> 触发风控

// ✅ 正确：分段输入，模拟打字
const chunks = splitIntoNaturalChunks(longText, 50-100);
for (const chunk of chunks) {
  type(chunk);
  await humanDelay(300, 800);  // 每段之间停顿
}
```

**要求**：
- 长文本分段输入（每段 50-100 字符）
- 段间延迟 300-800ms
- 使用 `key_type` 而非 `fill`（除非是单行短文本）
- 输入后等待 500-1000ms 再提交

### 3. 点击验证（Click & Verify）

```typescript
// ❌ 错误：连续点击
click(input);
click(submit);

// ✅ 正确：点击后验证
click(input);
await humanDelay(500, 1000);
const verified = await verifyElementState(input, 'focused');
if (!verified) throw new Error('Input not focused');

await humanDelay(800, 1500);
click(submit);
```

**要求**：
- 点击后等待 500-1500ms
- 验证操作效果（元素状态变化）
- 提交前再次停顿

### 4. 响应等待（Response Polling）

```typescript
// ❌ 错误：高频轮询
while (!isComplete()) {
  await sleep(100);  // 每 100ms 检查一次 -> 异常流量
  checkResponse();
}

// ✅ 正确：人类阅读节奏
await humanDelay(3000, 5000);  // 首次等待 3-5 秒
while (!isComplete()) {
  await humanDelay(5000, 8000);  // 后续每 5-8 秒检查
  checkResponse();
  
  // 长时间生成时降低频率
  if (elapsed > 30000) {
    await humanDelay(10000, 15000);  // 10-15 秒
  }
}
```

**要求**：
- 提交后首次等待 3-5 秒（人类反应时间）
- 轮询间隔 5-8 秒（模拟阅读中）
- 长任务降低频率到 10-15 秒
- **禁止**：< 2 秒的轮询间隔

### 5. 多操作间隔（Between Actions）

```typescript
// ❌ 错误：连续批量操作
navigate(url1);
extractData();
navigate(url2);
extractData();

// ✅ 正确：自然切换
navigate(url1);
await humanDelay(2000, 3000);
extractData();
await humanDelay(1500, 2500);  // 思考时间

navigate(url2);
await humanDelay(2000, 3000);
extractData();
```

**要求**：
- 不同任务之间 1.5-3 秒间隔
- 页面切换后 2-3 秒稳定时间
- 数据提取完成后 1-2 秒"阅读"时间

---

## 延迟时间标准

| 操作类型 | 最小延迟 | 推荐延迟 | 最大延迟 | 说明 |
|---------|---------|---------|---------|------|
| 导航后等待 | 1500ms | 2000ms | 3000ms | 页面加载 + 渲染 |
| 输入前停顿 | 500ms | 800ms | 1500ms | 定位元素 + 聚焦 |
| 分段输入间隔 | 300ms | 500ms | 1000ms | 模拟打字思考 |
| 输入后验证 | 500ms | 800ms | 1200ms | 检查内容正确 |
| 提交前停顿 | 800ms | 1200ms | 2000ms | 最后检查 |
| 首次响应等待 | 3000ms | 4000ms | 5000ms | 提交 + 服务器处理 |
| 轮询间隔（正常） | 5000ms | 6000ms | 8000ms | 生成中检查 |
| 轮询间隔（长任务） | 10000ms | 12000ms | 15000ms | 降低检测概率 |
| 任务切换 | 1500ms | 2000ms | 3000ms | 完成 + 思考 + 开始 |

**关键原则**：
- **绝对禁止** < 500ms 的连续操作
- **绝对禁止** < 2000ms 的轮询间隔
- **绝对禁止** 批量无停顿操作

---

## 实现工具函数

### `humanDelay(min, max)`

```typescript
/**
 * 人类节奏延迟 - 带随机抖动
 * @param min 最小延迟（毫秒）
 * @param max 最大延迟（毫秒）
 */
export async function humanDelay(min: number = 500, max: number = 1500): Promise<void> {
  // 加入微小的随机性，避免固定模式
  const jitter = Math.random() * 200 - 100; // ±100ms
  const delay = Math.floor(Math.random() * (max - min + 1)) + min + jitter;
  const clampedDelay = Math.max(min, Math.min(max + 200, delay));
  
  await new Promise(resolve => setTimeout(resolve, clampedDelay));
}
```

### `typeAsHuman(text)`

```typescript
/**
 * 模拟人类分段输入
 */
export async function typeAsHuman(text: string, selector: string): Promise<void> {
  // 分段策略
  const chunks = splitIntoChunks(text, 50, 100);
  
  for (let i = 0; i < chunks.length; i++) {
    await mcp__webbridge__key_type({ text: chunks[i] });
    
    if (i < chunks.length - 1) {
      // 段间停顿，越往后停顿越短（模拟熟悉任务）
      const baseDelay = 500;
      const decay = Math.max(0.3, 1 - i * 0.1);
      await humanDelay(baseDelay * decay * 0.6, baseDelay * decay * 1.4);
    }
  }
  
  // 输入完成后验证
  await humanDelay(500, 1000);
}
```

### `waitForResponse()`

```typescript
/**
 * 人类节奏等待响应生成
 */
export async function waitForResponse(
  checkComplete: () => Promise<boolean>,
  maxWaitMs: number = 120000
): Promise<void> {
  const startTime = Date.now();
  
  // 首次等待
  await humanDelay(3000, 5000);
  
  while (Date.now() - startTime < maxWaitMs) {
    if (await checkComplete()) return;
    
    const elapsed = Date.now() - startTime;
    
    // 动态调整轮询间隔
    if (elapsed < 30000) {
      await humanDelay(5000, 8000);  // 前30秒：5-8秒
    } else if (elapsed < 60000) {
      await humanDelay(8000, 12000); // 30-60秒：8-12秒
    } else {
      await humanDelay(12000, 18000); // 60秒后：12-18秒
    }
  }
  
  throw new Error('Response timeout');
}
```

---

## 检测清单

在每次 browser dispatch 执行前，检查：

- [ ] 导航后是否等待页面稳定？
- [ ] 长文本是否分段输入？
- [ ] 输入后是否验证内容？
- [ ] 提交前是否有停顿？
- [ ] 轮询间隔是否 ≥ 5 秒？
- [ ] 操作之间是否有自然间隔？
- [ ] 是否避免了固定的时间模式？

**如果任何一项是 "否"，立即修改代码。**

---

## 禁止的反模式

### ❌ 反模式 1：机械循环

```typescript
for (const url of urls) {
  navigate(url);
  extract();  // 立即操作，无延迟
}
```

### ❌ 反模式 2：高频轮询

```typescript
setInterval(checkStatus, 1000);  // 每秒检查 -> 触发风控
```

### ❌ 反模式 3：批量填充

```typescript
fill('#input1', data1);
fill('#input2', data2);  // 连续填充，无间隔
fill('#input3', data3);
```

### ❌ 反模式 4：固定延迟

```typescript
await sleep(1000);  // 每次都是精确 1000ms -> 可检测的模式
await sleep(1000);
await sleep(1000);
```

### ❌ 反模式 5：无验证操作

```typescript
click(button);
// 没有检查按钮是否真的被点击
extractData();  // 假设操作成功
```

---

## 平台特定注意事项

### X/Grok
- **最严格**：Twitter 的风控系统极其敏感
- 操作间隔必须 > 2 秒
- 避免在短时间内访问大量推文
- Grok 输入建议分 2-3 段

### Google/Gemini
- 检测重复模式
- 搜索后等待 2-3 秒再点击结果
- Gemini 长文本建议分段

### OpenAI/ChatGPT
- 检测输入速度
- 避免 < 1 秒内提交
- 轮询建议 6-10 秒

### 豆包 (Doubao)
- 国内平台风控标准
- 操作间隔建议 1.5-3 秒
- 避免连续大量请求

---

## 开发者责任声明

当你为 Relay 贡献代码或使用 Relay 时，你承诺：

1. ✅ 我已阅读并理解本文档
2. ✅ 我的代码遵守人类节奏操作规范
3. ✅ 我不会故意绕过延迟机制
4. ✅ 我理解这是账号安全的核心要求
5. ✅ 我不会因追求速度而牺牲安全

**违反此规范导致的账号问题，由违反者自行承担责任。**

---

## 测试与验证

### 手动测试清单

执行任何 worker dispatch 前：
1. 使用 `console.log` 记录每个操作的时间戳
2. 计算相邻操作的实际间隔
3. 确认所有间隔 ≥ 最小标准
4. 在实际账号测试前，先用测试账号验证

### 自动化检查

```typescript
// 添加到 browser_adapter.ts
class OperationTimer {
  private lastOperation: number = 0;
  
  async beforeOperation(name: string, minDelay: number): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastOperation;
    
    if (elapsed < minDelay) {
      const warning = `⚠️ SAFETY: ${name} too fast (${elapsed}ms < ${minDelay}ms)`;
      console.error(warning);
      throw new Error(warning);
    }
    
    this.lastOperation = now;
  }
}
```

---

## 更新日志

- 2026-07-31: 初始版本，定义核心安全规范
- 未来更新将基于实际使用反馈调整延迟标准

---

**记住：速度不是目标，完成任务并保护账号才是目标。宁可慢 10 秒，不要被封号。**
