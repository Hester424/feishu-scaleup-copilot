# Evidence-based Process Scale-up Copilot — Demo Brief

## 项目概述
为飞书AI人才大赛（海正药业命题）搭建一个Web Demo，展示"基于证据链的工艺放大决策Copilot"的核心交互逻辑。

## 定位
- 面向工艺工程师的B端调查分析工具，**不是聊天机器人**
- 核心理念：帮工程师更快完成放大调查——检索历史案例、比较差异、生成带证据引用的调查报告
- 设计原则：Evidence-based, Explainable, Traceable, Auditable

## 技术栈
- React + Next.js + Tailwind CSS
- 知识库：静态mock数据（3-5条虚构但逻辑自洽的历史工艺案例）
- 推理：接真实LLM API（Anthropic Claude API）生成结构化分析
- 检索：简单的embedding相似度或关键词匹配即可，逻辑跑通优先

## 页面结构（按优先级排序）

### Page 1: New Scale-up Investigation（新建放大调查）
结构化表单，字段：
- Product / API name
- Synthesis Route Overview（如 "5-step synthesis, key fluorination at Step 3"）
- Current Stage（Lab / Pilot / Commercial）— dropdown
- Scale（如 "from 10L to 200L reactor"）
- Equipment type
- Target Yield
- Problem Description（当前问题，如 "Yield dropped from 91% to 83% at pilot scale"）

预填一组示例数据（具体产品待定，先用placeholder）。

### Page 2: Evidence Collection（证据收集）
- 展示从mock知识库中检索到的3-5条相关历史案例
- 每条显示：文档类型标签（Deviation Report / Batch Record / CAPA等）、案例摘要、相关性解释
- 视觉上要能看出"AI在找证据"而不是"AI在猜答案"

### Page 3: Case Comparison & Analysis（案例比较与分析）
- 调用LLM API，基于Page 2检索到的案例生成结构化分析：
  - 历史案例成功/失败归因
  - 当前场景vs历史案例的关键差异
  - 哪些经验可迁移 / 哪些不适用
  - 风险项（按可能性×影响排列）
  - Scenario Analysis（"历史上类似条件下曾出现XX结果"——标注为历史类比）
- 置信度分层：案例充足→可参考 / 案例不足→建议专家介入

### Page 4: Investigation Report（调查报告）
- 将分析组织成可导出的结构化报告
- 每条结论附引用来源（哪份文档、哪段内容）
- Perplexity风格的引用标注
- 底部：置信度评级 + 盲区提示 + 建议专家复核环节

### Page 5: Expert Validation & Knowledge Update（专家确认与知识沉淀）
- 可为静态展示/简单交互原型
- 展示：确认/修正/补充 → 回写知识库
- 展示闭环：Document → Copilot → Expert → Knowledge Base → Next Project

## Mock知识库数据结构

每条历史案例包含：
```json
{
  "id": "CASE-001",
  "doc_type": "Deviation Report",  // or "Batch Record", "CAPA", "Change Control"
  "product_type": "某抗病毒原料药，多步合成，含关键氟化步骤",
  "stage": "Pilot",
  "scale": "200L reactor",
  "scenario": "小试→中试放大时氟化步骤出现收率下降",
  "root_cause": "氟化步骤温控偏差导致局部过热，副反应增加",
  "resolution": "降低投料速率至原来的70%，增加中间控制检测频次",
  "outcome": "收率恢复至89%，副产物降至可接受范围",
  "key_parameters": {
    "reaction_temp": "65°C → 实际72°C",
    "feed_rate": "2.5 L/h",
    "reaction_time": "4.5h"
  },
  "tags": ["fluorination", "temperature_control", "scale-up", "yield_drop"]
}
```

先用3-5条这样的mock数据。具体产品名称用placeholder（"API-X"或类似），后续再替换。

## 界面设计原则
- 专业、克制、工业工具感——不花哨
- 深色或中性色调，类似B端SaaS工具
- 文档类型用颜色标签区分（Deviation=橙色, Batch Record=蓝色, CAPA=绿色等）
- 置信度用视觉层级区分（高=绿色, 中=黄色, 低/需专家介入=红色）
- 所有页面标注 "Illustrative Case — for demonstration purposes"

## 不做什么
- ❌ 不做聊天框/ChatBot界面
- ❌ 不做"输入参数→输出预测值"的黑盒
- ❌ 不做真正的物理/化学模拟
- ❌ 不用localStorage/sessionStorage
