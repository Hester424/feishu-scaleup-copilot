import { HistoricalCase, InvestigationInput, RetrievedCase } from "./types";

// Illustrative Case data — inspired by publicly known scale-up pain points of
// fluorination chemistry (e.g. Favipiravir-type synthesis routes), but the
// scenarios, parameters, and outcomes below are fabricated for demo purposes
// and do not represent any real company's data.
export const KNOWLEDGE_BASE: HistoricalCase[] = [
  {
    id: "CASE-001",
    docType: "Deviation Report",
    productType: "某抗病毒原料药，多步合成，含关键氟化步骤",
    stage: "Pilot",
    scale: "200L reactor",
    scenario: "小试→中试放大时氟化步骤出现收率下降，杂质谱中二聚体杂质升高",
    rootCause: "氟化步骤温控偏差导致局部过热，副反应增加",
    resolution: "降低投料速率至原来的70%，增加中间控制检测频次，优化夹套换热面积利用",
    outcome: "收率恢复至89%，副产物降至可接受范围（<0.5%）",
    keyParameters: {
      reaction_temp: "65°C → 实际72°C",
      feed_rate: "2.5 L/h → 调整为1.75 L/h",
      reaction_time: "4.5h",
      cooling_capacity: "夹套换热面积不足，局部热点",
    },
    tags: [
      "fluorination",
      "temperature_control",
      "scale-up",
      "yield_drop",
      "impurity_dimer",
      "10L_to_200L",
      "exothermic",
    ],
  },
  {
    id: "CASE-002",
    docType: "Batch Record",
    productType: "某抗病毒原料药，多步合成，含酰胺化步骤",
    stage: "Pilot",
    scale: "150L reactor",
    scenario: "中试放大时酰胺化步骤转化率不足，反应时间延长仍未达终点",
    rootCause: "搅拌桨型号未随放大调整，传质效率下降导致混合不均",
    resolution: "将锚式搅拌桨更换为斜叶式搅拌桨，转速由80rpm提升至120rpm",
    outcome: "转化率由82%提升至96%，反应时间缩短30%",
    keyParameters: {
      agitator_type: "锚式 → 斜叶式",
      agitation_rate: "80 rpm → 120 rpm",
      reaction_time: "8h → 5.5h",
    },
    tags: [
      "amidation",
      "mixing",
      "scale-up",
      "agitator_design",
      "mass_transfer",
      "conversion_drop",
    ],
  },
  {
    id: "CASE-003",
    docType: "CAPA",
    productType: "某抗病毒原料药，多步合成，含关键氟化步骤",
    stage: "Commercial",
    scale: "500L reactor",
    scenario: "商业化生产放大后氟化步骤杂质超标，触发OOS调查",
    rootCause: "放大后搅拌功率密度下降，氟化试剂局部富集导致副反应路径增加",
    resolution: "调整搅拌桨间距与挡板设计，将氟化试剂改为分段缓慢加入（原单次加入改为3段）",
    outcome: "杂质含量由1.2%降至0.3%，符合放行标准",
    keyParameters: {
      power_density: "放大后下降约40%",
      addition_mode: "单次加入 → 3段分批加入",
      baffle_design: "增加挡板数量至4块",
    },
    tags: [
      "fluorination",
      "scale-up",
      "impurity_control",
      "agitator_design",
      "power_density",
      "OOS",
      "200L_to_500L",
    ],
  },
  {
    id: "CASE-004",
    docType: "Change Control",
    productType: "某抗病毒原料药，多步合成，氟化试剂供应商变更",
    stage: "Pilot",
    scale: "200L reactor",
    scenario: "氟化试剂更换供应商后，同一放大条件下收率出现批间波动",
    rootCause: "新供应商氟化试剂中微量水分含量高于原供应商，影响反应选择性",
    resolution: "增加原料入厂水分检测（KF法），设定水分上限≤0.05%，供应商变更后追加3批确认批",
    outcome: "批间收率标准差由4.2%降至1.1%，波动消除",
    keyParameters: {
      raw_material_moisture: "0.15% → 控制至≤0.05%",
      confirmation_batches: "3批",
    },
    tags: [
      "fluorination",
      "raw_material_variability",
      "supplier_change",
      "batch_to_batch_variation",
      "yield_drop",
    ],
  },
  {
    id: "CASE-005",
    docType: "Deviation Report",
    productType: "某抗病毒原料药，多步合成，含关键氟化步骤",
    stage: "Pilot",
    scale: "500L reactor",
    scenario: "50L放大至500L时氟化反应出现瞬时超温报警，冷却系统响应滞后",
    rootCause: "放大后反应放热总量增加，而冷却系统换热能力未同比例提升，导致降温响应滞后",
    resolution: "改为分批投料并延长滴加时间（由2h延长至4h），同时下调初始反应温度5°C作为安全余量",
    outcome: "未再出现超温报警，收率维持在90%，较小试无明显损失",
    keyParameters: {
      addition_time: "2h → 4h",
      initial_temp_setpoint: "65°C → 60°C",
      cooling_response: "滞后约8分钟",
    },
    tags: [
      "fluorination",
      "temperature_control",
      "scale-up",
      "exothermic",
      "cooling_capacity",
      "50L_to_500L",
      "process_safety",
    ],
  },
];

// --- Simple, deterministic keyword/tag retrieval (no embeddings needed) ---
// Extracts a rough keyword set from the free-text investigation input and
// scores each historical case by tag overlap + structural similarity
// (doc scale jump, stage, equipment/step keywords). This keeps Page 2 fast,
// explainable, and independent of the LLM call used later for reasoning.

const KEYWORD_TAG_MAP: { pattern: RegExp; tag: string }[] = [
  { pattern: /fluorinat/i, tag: "fluorination" },
  { pattern: /amidat/i, tag: "amidation" },
  { pattern: /temp|温控|超温|过热/i, tag: "temperature_control" },
  { pattern: /yield|收率/i, tag: "yield_drop" },
  { pattern: /impurity|杂质|dimer|二聚体/i, tag: "impurity_dimer" },
  { pattern: /mix|agitat|搅拌|传质/i, tag: "mixing" },
  { pattern: /cooling|冷却|换热/i, tag: "cooling_capacity" },
  { pattern: /exotherm|放热/i, tag: "exothermic" },
  { pattern: /supplier|供应商|raw material|原料/i, tag: "raw_material_variability" },
  { pattern: /oos|超标/i, tag: "OOS" },
  { pattern: /scale.?up|放大/i, tag: "scale-up" },
];

function extractTagsFromText(...texts: string[]): string[] {
  const joined = texts.join(" ");
  const found = new Set<string>();
  for (const { pattern, tag } of KEYWORD_TAG_MAP) {
    if (pattern.test(joined)) found.add(tag);
  }
  return Array.from(found);
}

function scaleJumpBucket(scale: string): string | null {
  const match = scale.match(/(\d+)\s*L.*?(\d+)\s*L/i);
  if (!match) return null;
  const from = parseInt(match[1], 10);
  const to = parseInt(match[2], 10);
  if (to <= 250) return "small";
  if (to <= 600) return "mid";
  return "large";
}

export function retrieveRelevantCases(
  input: InvestigationInput,
  topN = 5
): RetrievedCase[] {
  const queryTags = extractTagsFromText(
    input.synthesisRoute,
    input.problemDescription,
    input.equipment
  );
  const queryBucket = scaleJumpBucket(input.scale);

  const scored = KNOWLEDGE_BASE.map((c) => {
    const matchedTags = c.tags.filter((t) => queryTags.includes(t));
    let score = matchedTags.length * 18;

    if (c.stage === input.currentStage) score += 8;

    const caseBucket = scaleJumpBucket(c.scale);
    if (queryBucket && caseBucket && queryBucket === caseBucket) score += 10;

    // Small deterministic tie-breaker so scores aren't clustered.
    score += c.tags.length * 0.5;

    score = Math.max(5, Math.min(98, Math.round(score)));

    const explanationParts: string[] = [];
    if (matchedTags.length > 0) {
      explanationParts.push(`共享关键条件：${matchedTags.join(", ")}`);
    }
    if (c.stage === input.currentStage) {
      explanationParts.push(`同为 ${c.stage} 阶段`);
    }
    if (queryBucket && caseBucket && queryBucket === caseBucket) {
      explanationParts.push("放大规模量级相近");
    }
    if (explanationParts.length === 0) {
      explanationParts.push("与当前场景的直接关键词重叠较少，供参考排除");
    }

    return {
      ...c,
      relevanceScore: score,
      matchedTags,
      relevanceExplanation: explanationParts.join("；"),
    } satisfies RetrievedCase;
  });

  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topN);
}
