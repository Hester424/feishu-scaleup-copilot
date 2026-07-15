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
  {
    id: "CASE-006",
    docType: "Batch Record",
    productType: "某抗病毒原料药，多步合成，终产物结晶步骤（非氟化步骤）",
    stage: "Pilot",
    scale: "从10L放大至200L结晶釜",
    scenario: "小试→中试放大时，终产物结晶步骤收率下降，晶型比例发生变化，母液夹带损失增加",
    rootCause:
      "放大后降温速率显著低于小试（换热面积/体积比下降），晶体生长动力学改变，导致晶型转化不完全、粒径变小、过滤母液夹带损失增加。与氟化步骤的化学副反应机理无关。",
    resolution: "采用程序降温曲线并引入晶种控制，稳定目标晶型",
    outcome: "收率恢复至86%，晶型稳定为目标晶型",
    keyParameters: {
      cooling_rate: "2°C/min（小试）→ 实际0.4°C/min（放大后）",
      seeding: "未加晶种 → 程序降温 + 晶种控制",
      yield: "88% → 79% → 86%（优化后）",
    },
    tags: [
      "crystallization",
      "cooling_rate",
      "yield_drop",
      "scale-up",
      "particle_size",
      "filtration_loss",
    ],
  },
  {
    id: "CASE-007",
    docType: "Deviation Report",
    productType: "某抗病毒原料药，多步合成，末端溶剂置换/减压蒸馏步骤",
    stage: "Commercial",
    scale: "从80L放大至800L蒸馏釜",
    scenario:
      "商业化放大后，减压蒸馏（溶剂置换）步骤耗时显著延长，成品中热降解杂质（Degradation Impurity，RRT 1.52）由小试的0.2%升至1.8%，超出放行标准（≤1.0%）",
    rootCause:
      "放大后釜体换热面积/物料体积比下降，相同真空度和温度设定下蒸馏耗时由小试2h延长至商业化规模的9h，中间体在受热条件下的暴露时间大幅增加，导致热降解副反应累积。与反应步骤本身无关，是单元操作（蒸馏）随规模放大的传热限制问题。",
    resolution:
      "真空度由-0.09MPa提高至-0.098MPa以降低操作温度，釜内增设外循环强制蒸发提高传热效率，蒸馏耗时压缩至4h；同时对该中间体补充热稳定性数据以设定暴露时间上限",
    outcome: "热降解杂质降至0.4%，符合放行标准",
    keyParameters: {
      vacuum_level: "-0.09MPa → -0.098MPa",
      distillation_time: "2h（小试）→ 9h（放大后优化前）→ 4h（优化后）",
      operating_temp: "68°C → 实际72°C（优化后降至60°C）",
    },
    tags: [
      "distillation",
      "solvent_swap",
      "thermal_degradation",
      "scale-up",
      "heat_transfer_ratio",
      "commercial_scale",
      "exposure_time",
    ],
  },
  {
    id: "CASE-008",
    docType: "CAPA",
    productType: "某抗病毒原料药，多步合成，含催化加氢还原步骤",
    stage: "Pilot",
    scale: "从20L放大至300L加氢釜",
    scenario:
      "中试放大后加氢反应转化率不稳定，部分批次残留未反应双键中间体超标，同批次催化剂用量与小试一致但效果下降",
    rootCause:
      "追溯发现放大批次所用起始原料中微量含硫化合物（供应商变更后引入）导致钯碳催化剂中毒失活，而非搅拌或传质问题——小试所用起始原料杂质谱与放大批次不同，掩盖了根因排查方向",
    resolution:
      "增加起始原料入厂硫含量检测（ICP-MS，限度≤10ppm），催化剂更换为对硫更耐受的铂系催化剂并提高催化剂负载量作为过渡方案，供应商变更后追加3批确认批",
    outcome: "转化率恢复至99%以上，未反应中间体降至<0.1%",
    keyParameters: {
      sulfur_content: "未检测 → 控制至≤10ppm",
      catalyst_type: "Pd/C 5% → Pt/C 3%（过渡方案）",
      catalyst_loading: "1.2 wt% → 1.8 wt%（过渡方案）",
    },
    tags: [
      "hydrogenation",
      "catalyst_poisoning",
      "raw_material_variability",
      "supplier_change",
      "scale-up",
      "conversion_drop",
    ],
  },
  {
    id: "CASE-009",
    docType: "Deviation Report",
    productType: "某心血管类原料药（非抗病毒），多步合成，含酰氯化步骤（SOCl2体系）",
    stage: "Pilot",
    scale: "从15L放大至250L反应釜",
    scenario:
      "中试放大后酰氯化反应（SOCl2投料）出现瞬时尾气量激增，HCl/SO2尾气吸收系统短时超负荷报警，同时过氯化副产物增加",
    rootCause:
      "SOCl2投料速率按小试等比例放大后，实际气体释放速率超过尾气吸收塔设计处理能力（吸收塔未按反应放气速率同步放大校核），且局部投料点SOCl2瞬时过量导致过氯化副反应",
    resolution:
      "SOCl2改为计量泵控制的分段慢加（由整体加入改为4段，总加料时间由30min延长至2h），并对尾气吸收系统处理能力做重新校核和预警联锁改造",
    outcome: "尾气吸收系统未再超负荷，过氯化杂质降至0.3%以下，收率维持91%",
    keyParameters: {
      addition_mode: "整体加入 → 4段计量泵慢加",
      addition_time: "30min → 2h",
      off_gas_handling: "吸收塔处理能力校核并改造",
    },
    tags: [
      "chlorination",
      "off_gas_handling",
      "process_safety",
      "scale-up",
      "over_chlorination",
      "different_drug_class",
      "corrosive_reagent",
    ],
  },
  {
    id: "CASE-010",
    docType: "Deviation Report",
    productType:
      "某抗病毒原料药，多步合成，紧接氟化步骤之后的溶剂共沸脱水/蒸馏步骤",
    stage: "Pilot",
    scale: "从15L放大至180L蒸馏釜",
    scenario:
      "中试放大后，氟化反应完成后的共沸脱水（蒸馏）步骤中，HPLC在与二聚体杂质（Dimer Impurity）相近的保留时间处检出一个新增峰，初筛时曾被误判为二聚体杂质增加，直至LC-MS确证后发现实为热降解产物，而非氟化步骤的自缩合二聚体",
    rootCause:
      "该峰实为蒸馏过程中温度/真空度设定下的热降解产物，根因是蒸馏单元操作的传热限制（与CASE-007机理一致），而非氟化反应本身的副反应（与CASE-001机理不同）。两者色谱行为相近导致初期误判，凸显仅凭杂质名称/保留时间做检索匹配的局限性。",
    resolution:
      "补充LC-MS定性以区分二聚体杂质与热降解产物；蒸馏步骤真空度提高、缩短受热时间（做法与CASE-007一致）；氟化步骤本身参数未做任何调整（因根因不在此步骤）",
    outcome: "确认为热降解产物后，通过蒸馏工艺优化控制在报告限以下，氟化步骤收率不受影响",
    keyParameters: {
      hplc_rrt: "与二聚体杂质RRT相近（约1.33 vs 1.34），LC-MS确证为不同物质",
      vacuum_level: "-0.088MPa → -0.096MPa",
      distillation_time: "缩短约40%",
    },
    tags: [
      "distillation",
      "thermal_degradation",
      "impurity_dimer",
      "scale-up",
      "solvent_swap",
      "exposure_time",
    ],
    caveat:
      "⚠ 诊断陷阱：该案例的HPLC杂质峰保留时间与CASE-001的二聚体杂质（Dimer Impurity）非常接近，初期曾被误判为同一类杂质、按氟化步骤问题排查。经LC-MS确证后发现实为蒸馏工序的热降解产物，根因在下游单元操作而非氟化反应本身——两案例症状相似但根因不同，仅靠关键词/色谱保留时间检索会得出错误结论。",
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
  { pattern: /distillat|蒸馏|精馏/i, tag: "distillation" },
  { pattern: /degrad|降解/i, tag: "thermal_degradation" },
  { pattern: /hydrogenat|加氢/i, tag: "hydrogenation" },
  { pattern: /catalyst|催化剂|中毒/i, tag: "catalyst_poisoning" },
  { pattern: /chlorinat|氯化/i, tag: "chlorination" },
  { pattern: /off.?gas|尾气|放气/i, tag: "off_gas_handling" },
  { pattern: /crystalliz|结晶/i, tag: "crystallization" },
];

// Exported (not just used internally by retrieval) so any page that lets an
// engineer add a new case — Upload's AI-parse flow, the Case Library's
// manual-entry form, or Expert Validation writing a confirmed investigation
// back to the KB — can auto-suggest tags from free text instead of asking
// engineers to hand-pick from the internal tag vocabulary.
export function deriveTagsFromText(...texts: string[]): string[] {
  const joined = texts.join(" ");
  const found = new Set<string>();
  for (const { pattern, tag } of KEYWORD_TAG_MAP) {
    if (pattern.test(joined)) found.add(tag);
  }
  return Array.from(found);
}

// Generates the next sequential case ID (CASE-011, CASE-012, ...) given the
// current pool, so newly added cases get a real, stable, citable ID instead
// of a placeholder like "CASE-NEW".
export function nextCaseId(pool: HistoricalCase[]): string {
  const max = pool.reduce((m, c) => {
    const match = /^CASE-(\d+)$/.exec(c.id);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `CASE-${String(max + 1).padStart(3, "0")}`;
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

// Chip options shown on Page 1 — kept here (not hardcoded in the UI) so the
// selectable step types always match the tag vocabulary the scorer actually
// understands.
export const STEP_TYPE_OPTIONS: { label: string; tag: string }[] = [
  { label: "氟化 Fluorination", tag: "fluorination" },
  { label: "蒸馏/溶剂置换 Distillation", tag: "distillation" },
  { label: "加氢 Hydrogenation", tag: "hydrogenation" },
  { label: "结晶 Crystallization", tag: "crystallization" },
  { label: "氯化 Chlorination", tag: "chlorination" },
  { label: "酰胺化 Amidation", tag: "amidation" },
];

export function retrieveRelevantCases(
  input: InvestigationInput,
  casePool: HistoricalCase[] = KNOWLEDGE_BASE,
  topN = 5
): RetrievedCase[] {
  const queryTags = Array.from(
    new Set([
      ...deriveTagsFromText(
        input.synthesisRoute,
        input.problemDescription,
        input.equipment
      ),
      ...(input.suspectedStepTags ?? []),
    ])
  );
  const queryBucket = scaleJumpBucket(input.scale);

  const scored = casePool.map((c) => {
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
