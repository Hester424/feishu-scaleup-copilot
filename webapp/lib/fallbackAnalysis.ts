import {
  AnalysisResult,
  ConfidenceLevel,
  InvestigationInput,
  RetrievedCase,
} from "./types";

// Deterministic, rule-based analysis used when OPENAI_API_KEY is not
// configured (or the live API call fails), so the demo flow can still reach
// Page 4/5. This is template-generated from the retrieved cases only — it is
// explicitly NOT an LLM output, and callers must surface `usedFallback`.
// It mirrors the same 4-step reasoning chain the real prompt asks for:
// why relevant -> matched/mismatched conditions -> transferable lessons ->
// recommended investigation directions.

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

  // Step 1: why relevant + attribution, per case.
  const attributions = top.map((c) => ({
    caseId: c.id,
    whyRelevant: `该案例被检索到是因为${c.relevanceExplanation}（相关性评分 ${c.relevanceScore}/100）。`,
    attribution: `${c.rootCause}；处理措施为「${c.resolution}」，最终结果：${c.outcome}。`,
  }));

  // Step 2: matched / mismatched conditions, per case (one row per aspect).
  const keyDifferences = top.flatMap((c) => {
    const sameStage = c.stage === input.currentStage;
    const rows = [
      {
        aspect: "工艺阶段",
        current: input.currentStage,
        historical: `${c.stage}（${c.id}）`,
        matched: sameStage,
        sourceCaseId: c.id,
        note: sameStage
          ? "阶段相同，经验可直接参考。"
          : "阶段不同，历史结论需结合当前阶段的设备与控制水平谨慎迁移。",
      },
      {
        aspect: "放大规模",
        current: input.scale,
        historical: `${c.scale}（${c.id}）`,
        matched: c.matchedTags.length >= 2,
        sourceCaseId: c.id,
        note:
          c.matchedTags.length >= 2
            ? `与当前场景共享关键条件：${c.matchedTags.join(", ")}，放大倍数量级相近。`
            : "放大量级或工序类型重叠有限，需谨慎比较传质/传热差异。",
      },
    ];
    return rows;
  });

  // Step 3: transferable / not, per case.
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

  // Step 4: recommended investigation directions — the actionable conclusion.
  const recommendedActions = top.map((c) => ({
    action: `核实当前场景是否存在与${c.id}相同的根因条件：${c.rootCause}`,
    rationale: `${c.id}中采用「${c.resolution}」后${c.outcome}，若根因条件相符，可作为优先排查方向。`,
    relatedCaseIds: [c.id],
  }));

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
  ];

  return {
    summary: `系统基于相关性最高的 ${top.length} 条历史案例（${top
      .map((c) => c.id)
      .join(", ")}）进行了归纳分析。`,
    attributions,
    keyDifferences,
    transferableLessons,
    recommendedActions,
    risks,
    scenarioAnalysis,
    confidence,
    confidenceReason,
    blindSpots,
    usedFallback: true,
    fallbackReason: "当前展示为示例分析结果，仅用于演示系统流程。",
  };
}
