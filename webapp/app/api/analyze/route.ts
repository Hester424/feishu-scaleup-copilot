import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AnalysisResult, InvestigationInput, RetrievedCase } from "@/lib/types";
import { buildFallbackAnalysis } from "@/lib/fallbackAnalysis";

export const runtime = "nodejs";

// In-memory cache, keyed by a hash of the investigation params + the set of
// retrieved case IDs. Good enough for a demo: resets on server restart, and
// only holds real (non-fallback) LLM results so a later API-key fix or a
// transient failure doesn't get "stuck" behind a cached fallback.
const analysisCache = new Map<string, AnalysisResult>();
const CACHE_MAX_ENTRIES = 200;

function buildCacheKey(input: InvestigationInput, cases: RetrievedCase[]): string {
  const canonical = JSON.stringify({
    product: input.product,
    synthesisRoute: input.synthesisRoute,
    currentStage: input.currentStage,
    scale: input.scale,
    equipment: input.equipment,
    targetYield: input.targetYield,
    problemDescription: input.problemDescription,
    suspectedStepTags: [...(input.suspectedStepTags ?? [])].sort(),
    caseIds: cases.map((c) => c.id).sort(),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function cacheSet(key: string, analysis: AnalysisResult) {
  analysisCache.set(key, analysis);
  if (analysisCache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
}

const ANALYSIS_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_analysis",
    description:
      "Submit the structured scale-up investigation analysis derived strictly from the provided historical cases.",
    parameters: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description:
            "2-3 sentence executive summary of the analysis, in Chinese (Simplified), with English technical terms annotated in parentheses on first use, e.g. 收率下降（Yield Drop）.",
        },
        attributions: {
          type: "array",
          description:
            "One entry per retrieved case, forming the FIRST step of the reasoning chain: why is this case relevant, and what happened in it.",
          items: {
            type: "object",
            properties: {
              caseId: { type: "string" },
              whyRelevant: {
                type: "string",
                description:
                  "Explain SPECIFICALLY why this case is relevant to the current scenario (shared step type, shared failure mode, similar scale jump, etc). In Chinese (Simplified).",
              },
              attribution: {
                type: "string",
                description:
                  "Success/failure attribution for this historical case itself (what went right or wrong, and why). In Chinese (Simplified).",
              },
            },
            required: ["caseId", "whyRelevant", "attribution"],
          },
        },
        keyDifferences: {
          type: "array",
          description:
            "SECOND step of the reasoning chain: explicit matched vs. mismatched conditions between the current scenario and each case. Include multiple rows per case where relevant (scale, equipment, stage, reaction step, etc), not just one generic row.",
          items: {
            type: "object",
            properties: {
              sourceCaseId: { type: "string" },
              aspect: { type: "string", description: "In Chinese (Simplified)." },
              current: { type: "string", description: "In Chinese (Simplified)." },
              historical: { type: "string", description: "In Chinese (Simplified)." },
              matched: {
                type: "boolean",
                description:
                  "true if this condition matches / transfers cleanly between current and historical case; false if it's a mismatch requiring caution.",
              },
              note: { type: "string", description: "In Chinese (Simplified)." },
            },
            required: ["sourceCaseId", "aspect", "current", "historical", "matched", "note"],
          },
        },
        transferableLessons: {
          type: "array",
          description:
            "THIRD step of the reasoning chain: which lessons transfer to the current scenario, and which do not.",
          items: {
            type: "object",
            properties: {
              lesson: { type: "string", description: "In Chinese (Simplified)." },
              applicable: { type: "boolean" },
              reason: { type: "string", description: "In Chinese (Simplified)." },
              sourceCaseId: { type: "string" },
            },
            required: ["lesson", "applicable", "reason", "sourceCaseId"],
          },
        },
        recommendedActions: {
          type: "array",
          description:
            "FOURTH and final step of the reasoning chain: concrete recommended investigation directions for the engineer to pursue next, each with a clear rationale tied back to the case evidence. This is the actionable conclusion of the analysis, not a restatement of the summary.",
          items: {
            type: "object",
            properties: {
              action: {
                type: "string",
                description:
                  "A specific, concrete investigation or verification action (not a vague suggestion). In Chinese (Simplified).",
              },
              rationale: {
                type: "string",
                description: "Why this action follows from the evidence above. In Chinese (Simplified).",
              },
              relatedCaseIds: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["action", "rationale", "relatedCaseIds"],
          },
        },
        risks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              risk: { type: "string", description: "In Chinese (Simplified)." },
              likelihood: {
                type: "string",
                enum: ["High", "Medium", "Low"],
                description: "Keep exactly as this English enum value, do not translate.",
              },
              impact: {
                type: "string",
                enum: ["High", "Medium", "Low"],
                description: "Keep exactly as this English enum value, do not translate.",
              },
              rationale: { type: "string", description: "In Chinese (Simplified)." },
              sourceCaseId: { type: "string" },
            },
            required: ["risk", "likelihood", "impact", "rationale"],
          },
        },
        scenarioAnalysis: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sourceCaseId: { type: "string" },
              historicalCondition: { type: "string", description: "In Chinese (Simplified)." },
              historicalOutcome: { type: "string", description: "In Chinese (Simplified)." },
              note: {
                type: "string",
                description:
                  "Must explicitly frame this as a historical analogy, not a prediction. In Chinese (Simplified).",
              },
            },
            required: [
              "sourceCaseId",
              "historicalCondition",
              "historicalOutcome",
              "note",
            ],
          },
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Keep exactly as this English enum value, do not translate.",
        },
        confidenceReason: { type: "string", description: "In Chinese (Simplified)." },
        blindSpots: {
          type: "array",
          items: { type: "string" },
          description:
            "Aspects of the current scenario not covered by the retrieved cases, in Chinese (Simplified).",
        },
      },
      required: [
        "summary",
        "attributions",
        "keyDifferences",
        "transferableLessons",
        "recommendedActions",
        "risks",
        "scenarioAnalysis",
        "confidence",
        "confidenceReason",
        "blindSpots",
      ],
    },
  },
};

function buildPrompt(input: InvestigationInput, cases: RetrievedCase[]) {
  return `You are an evidence-based process scale-up investigation copilot for a pharmaceutical process engineer. You NEVER predict exact process parameters and you NEVER claim physical/chemical simulation. You reason ONLY from the historical cases provided below plus the current scenario. Every claim must be traceable to a specific case ID or explicitly marked as a gap.

Your output must read as an ANALYSIS, not a summary. Follow this exact reasoning chain, in this order, and make each step build on the previous one instead of restating it:
1. WHY RELEVANT — for each retrieved case, explain specifically why it is relevant to the current scenario (attributions[].whyRelevant), then attribute what happened in that case, success or failure (attributions[].attribution).
2. MATCHED / MISMATCHED CONDITIONS — for each case, list the specific conditions that match the current scenario (matched: true) and those that don't (matched: false) — scale, equipment, reaction step, stage, control strategy, etc. Use multiple rows per case if there are multiple distinct conditions worth calling out (keyDifferences).
3. TRANSFERABLE / NOT TRANSFERABLE — given the matched/mismatched conditions above, decide which lessons from each case transfer to the current scenario and which do not, with reasons (transferableLessons). This should follow logically from step 2, not repeat step 1.
4. RECOMMENDED INVESTIGATION DIRECTIONS — the concluding step. Based on everything above, give concrete, specific next steps the engineer should investigate or verify, each with a rationale tied to the evidence (recommendedActions). This is the "so what" — do not just restate the summary.

Then also provide risks (likelihood x impact), scenario analysis (explicitly framed as historical analogy, never as prediction), a confidence assessment, and blind spots not covered by the retrieved cases.

LANGUAGE REQUIREMENT (critical): Write ALL free-text/narrative fields in Chinese (Simplified) — summary, attributions[].whyRelevant/attribution, keyDifferences[].aspect/current/historical/note, transferableLessons[].lesson/reason, recommendedActions[].action/rationale, risks[].risk/rationale, scenarioAnalysis[].historicalCondition/historicalOutcome/note, confidenceReason, and blindSpots. When a technical/professional term first appears in a field, write it in Chinese with the English term in parentheses, e.g. "收率下降（Yield Drop）", "偏差报告（Deviation Report）", "氟化步骤（Fluorination Step）". Do NOT write entire fields in English. The ONLY fields that must stay exactly as the enum values defined in the schema (do not translate these) are: confidence ("high"/"medium"/"low"), risks[].likelihood and risks[].impact ("High"/"Medium"/"Low"). caseId, sourceCaseId, and relatedCaseIds values must stay as the literal case IDs (e.g. "CASE-001").

Assess confidence: "high" if multiple closely relevant cases with consistent resolutions exist, "medium" if partial relevance, "low" if cases are sparse or contradictory — in which case recommend expert review.

Current Investigation Scenario:
- Product/API: ${input.product}
- Synthesis Route: ${input.synthesisRoute}
- Current Stage: ${input.currentStage}
- Scale: ${input.scale}
- Equipment: ${input.equipment}
- Target Yield: ${input.targetYield}
- Problem Description: ${input.problemDescription}

Retrieved Historical Cases (only source of evidence — do not invent facts beyond these):
${cases
  .map(
    (c) => `
[${c.id}] (${c.docType}, relevance ${c.relevanceScore}/100)
- Product/reaction type: ${c.productType}
- Stage/Scale: ${c.stage} / ${c.scale}
- Scenario: ${c.scenario}
- Root cause: ${c.rootCause}
- Resolution: ${c.resolution}
- Outcome: ${c.outcome}
- Key parameters: ${JSON.stringify(c.keyParameters)}
- Tags: ${c.tags.join(", ")}
`
  )
  .join("\n")}

Call the submit_analysis tool with your structured findings, following the 4-step reasoning chain above in order. Reference case IDs (e.g. "CASE-001") wherever you draw on a specific case. Remember: all narrative text fields must be written in Chinese (Simplified), with English technical terms annotated in parentheses on first use.`;
}

export async function POST(req: NextRequest) {
  let input: InvestigationInput;
  let cases: RetrievedCase[];
  try {
    const body = await req.json();
    input = body.input;
    cases = body.cases;
  } catch {
    return NextResponse.json(
      { error: "Malformed request body." },
      { status: 400 }
    );
  }

  if (!input || !cases || cases.length === 0) {
    return NextResponse.json(
      { error: "Missing investigation input or retrieved cases." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const analysis: AnalysisResult = {
      ...buildFallbackAnalysis(input, cases),
      usedFallback: true,
      fallbackReason:
        "OPENAI_API_KEY 未配置。请在 webapp/.env.local 中设置后重启开发服务器以启用真实 LLM 分析。",
    };
    return NextResponse.json({ analysis });
  }

  const cacheKey = buildCacheKey(input, cases);
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({
      analysis: { ...cached, servedFromCache: true },
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: buildPrompt(input, cases) }],
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: "function", function: { name: "submit_analysis" } },
    });

    const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.type !== "function") {
      throw new Error("Model did not return a structured analysis.");
    }

    const analysis: AnalysisResult = {
      ...(JSON.parse(toolCall.function.arguments) as AnalysisResult),
      usedFallback: false,
      servedFromCache: false,
    };
    cacheSet(cacheKey, analysis);
    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const analysis: AnalysisResult = {
      ...buildFallbackAnalysis(input, cases),
      usedFallback: true,
      fallbackReason: `调用 OpenAI API 失败（${message}），已自动切换为预设静态分析。`,
    };
    return NextResponse.json({ analysis });
  }
}
