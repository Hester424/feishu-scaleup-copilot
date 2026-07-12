import {
  AnalysisResult,
  ConfidenceLevel,
  InvestigationInput,
  RetrievedCase,
} from "./types";

// Deterministic, rule-based analysis used when ANTHROPIC_API_KEY is not
// configured (or the live API call fails), so the demo flow can still reach
// Page 4/5. This is template-generated from the retrieved cases only — it is
// explicitly NOT an LLM output, and callers must surface `usedFallback`.

function likelihoodImpactFromScore(score: number): "High" | "Medium" | "Low" {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function confidenceFromCases(cases: RetrievedCase[]): {
  level: ConfidenceLevel;
  reason: string;
} {
  const top = cases[0];
  const strongMatches = cases.filter((c) => c.relevanceScore >= 60).length;
  if (top && top.relevanceScore >= 70 && strongMatches >= 2) {
    return {
      level: "high",
      reason: `检索到 ${strongMatches} 条高相关性历史案例（最高相关性 ${top.relevanceScore}），处理措施与结果记录完整，可作为参考依据（预设静态分析）。`,
    };
  }
  if (top && top.relevanceScore >= 40) {
    return {
      level: "medium",
      reason: `检索到的历史案例部分相关（最高相关性 ${top?.relevanceScore ?? 0}），建议工程师结合实际工艺条件复核后再采纳（预设静态分析）。`,
    };
  }
  return {
    level: "low",
    reason: "检索到的历史案例与当前场景相关性较低，案例证据不足，建议直接由资深工程师介入判断（预设静态分析）。",
  };
}

export function buildFallbackAnalysis(
  input: InvestigationInput,
  cases: RetrievedCase[]
): AnalysisResult {
  const top = cases.slice(0, 3);
  const { level: confidence, reason: confidenceReason } = confidenceFromCases(cases);

  const attributions = top.map((c) => ({
    caseId: c.id,
    attribution: `${c.rootCause}；处理措施为「${c.resolution}」，最终结果：${c.outcome}。`,
  }));

  const keyDifferences = top.map((c) => ({
    aspect: "放大规模 / 阶段",
    current: `${input.currentStage} · ${input.scale}`,
    historical: `${c.stage} · ${c.scale}（${c.id}）`,
    note:
      c.stage === input.currentStage
        ? "阶段相同，可重点比较放大倍数差异对传质/传热的影响。"
        : "阶段不同，历史结论需结合当前阶段的设备与控制水平谨慎迁移。",
  }));

  const transferableLessons = top.map((c) => {
    const applicable = c.matchedTags.length >= 2;
    return {
      lesson: c.resolution,
      applicable,
      reason: applicable
        ? `与当前场景共享关键条件：${c.matchedTags.join(", ")}，可作为初步应对方向。`
        : "与当前场景的关键工艺条件重叠有限，直接套用前需工程师确认适用性。",
      sourceCaseId: c.id,
    };
  });

  const risks = top.map((c) => {
    const level = likelihoodImpactFromScore(c.relevanceScore);
    return {
      risk: `重演「${c.scenario}」类似问题`,
      likelihood: level,
      impact: level === "Low" ? "Medium" : level,
      rationale: `依据 ${c.id} 的根因分析：${c.rootCause}`,
      sourceCaseId: c.id,
    } as const;
  });

  const scenarioAnalysis = top.map((c) => ({
    sourceCaseId: c.id,
    historicalCondition: c.scenario,
    historicalOutcome: c.outcome,
    note: "此为历史类比（非模型预测），仅供参考，不代表当前场景一定会出现相同结果。",
  }));

  const blindSpots = [
    "设备/搅拌桨具体几何差异对传质效率的量化影响，历史案例未覆盖，建议现场核实。",
    "原料批次（如氟化试剂供应商、水分含量）差异未纳入本次检索范围，如有变更建议单独排查。",
    "当前为预设静态分析（未调用 Claude API），结论覆盖面有限，建议配置 API Key 获取完整 LLM 推理分析。",
  ];

  return {
    summary: `⚠ 当前展示为基于检索案例生成的预设静态分析示例（未配置 Claude API Key，非实时 LLM 推理）。系统基于相关性最高的 ${top.length} 条历史案例（${top
      .map((c) => c.id)
      .join(", ")}）进行了规则化归纳，可用于走通 Page 4/5 演示流程；如需真实推理分析，请在 webapp/.env.local 中配置 ANTHROPIC_API_KEY 后重试。`,
    attributions,
    keyDifferences,
    transferableLessons,
    risks,
    scenarioAnalysis,
    confidence,
    confidenceReason,
    blindSpots,
    usedFallback: true,
    fallbackReason: "ANTHROPIC_API_KEY 未配置，或调用 Claude API 失败，已自动切换为预设静态分析。",
  };
}
