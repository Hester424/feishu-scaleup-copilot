# Evidence-based Process Scale-up Copilot — Web Demo

飞书AI人才大赛 · 海正药业命题 · Demo Web应用

## 这是什么

面向工艺工程师的B端调查分析工具（不是聊天机器人）：帮工程师更快完成放大调查——检索历史案例、比较关键差异、生成带证据引用的调查报告。设计原则：Evidence-based, Explainable, Traceable, Auditable。

完整产品叙事与方案设计见仓库根目录的 `开题方案内容清单_终版.md` 与 `demo_brief_for_claude_code.md`。

## 主要页面

| 路径 | 说明 |
|------|------|
| `/investigation` | 新建放大调查（结构化表单，含5个一键加载的示例场景） |
| `/evidence` | 证据收集（检索到的历史案例 + 相关性解释） |
| `/analysis` | 案例比较与分析（LLM生成的4步推理链） |
| `/recommendation` | 参数推荐（检索案例中的真实参数记录，非预测） |
| `/report` | 调查报告（可导出Markdown，附证据引用） |
| `/validation` | 专家确认与知识沉淀（确认后回写案例库） |
| `/cases` | 案例库（浏览/筛选全部案例，可手动添加） |
| `/upload` | 知识录入（模拟从文档AI解析新增案例） |

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 配置 OpenAI API（可选）

Page 3 的分析默认调用 OpenAI API（gpt-4o-mini）生成结构化推理；未配置 API Key 时会自动降级为基于规则的预设静态分析（仍可走通完整演示流程，界面会明确标注 Fallback Mode）。

```bash
cp .env.local.example .env.local
# 编辑 .env.local 填入 API Key
```

## 技术栈

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- 知识库：静态 mock 数据（`lib/knowledgeBase.ts`），会话内可通过 `/cases` 或 `/upload` 新增案例（存于内存，供检索闭环演示，刷新页面后重置）
- 检索：确定性关键词/标签打分（非向量检索），逻辑透明可解释
- 推理：结构化 tool-calling，强制 LLM 输出遵循「相关性归因 → 匹配/不匹配条件 → 可迁移经验 → 推荐调查方向」的4步推理链

## 已知限制（Demo 范围内）

- 会话状态仅保存在内存中（`InvestigationProvider`），刷新页面或直接访问某一步骤的 URL 会重置流程，需从 `/investigation` 重新开始。
- `/upload` 的文档解析为演示用途固定输出，不做真实的PDF/DOCX结构化提取。
- 所有案例数据均为虚构（Illustrative Case），非海正真实数据。
