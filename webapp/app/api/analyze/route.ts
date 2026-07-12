import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AnalysisResult, InvestigationInput, RetrievedCase } from "@/lib/types";
import { buildFallbackAnalysis } from "@/lib/fallbackAnalysis";

export const runtime = "nodejs";

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
          items: {
            type: "object",
            properties: {
              caseId: { type: "string" },
              attribution: {
                type: "string",
                description:
                  "Success/failure attribution for this historical case relevant to the current scenario, in Chinese (Simplified).",
              },
            },
            required: ["caseId", "attribution"],
          },
        },
        keyDifferences: {
          type: "array",
          items: {
            type: "object",
            properties: {
              aspect: { type: "string", description: "In Chinese (Simplified)." },
              current: { type: "string", description: "In Chinese (Simplified)." },
              historical: { type: "string", description: "In Chinese (Simplified)." },
              note: { type: "string", description: "In Chinese (Simplified)." },
            },
            required: ["aspect", "current", "historical", "note"],
          },
        },
        transferableLessons: {
          type: "array",
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

LANGUAGE REQUIREMENT (critical): Write ALL free-text/narrative fields in Chinese (Simplified) — summary, attributions[].attribution, keyDifferences[].aspect/current/historical/note, transferableLessons[].lesson/reason, risks[].risk/rationale, scenarioAnalysis[].historicalCondition/historicalOutcome/note, confidenceReason, and blindSpots. When a technical/professional term first appears in a field, write it in Chinese with the English term in parentheses, e.g. "收率下降（Yield Drop）", "偏差报告（Deviation Report）", "氟化步骤（Fluorination Step）". Do NOT write entire fields in English. The ONLY fields that must stay exactly as the enum values defined in the schema (do not translate these) are: confidence ("high"/"medium"/"low"), risks[].likelihood and risks[].impact ("High"/"Medium"/"Low"). caseId and sourceCaseId values must stay as the literal case IDs (e.g. "CASE-001").

Your job, mirroring how a senior process engineer reasons:
1. Attribute success/failure of each historical case relevant to this scenario.
2. Identify key differences between the current scenario and each historical case (scale, equipment, stage, conditions).
3. Identify which lessons are transferable and which are NOT applicable due to changed conditions, with reasons.
4. Rank risks by likelihood x impact.
5. Provide scenario analysis explicitly framed as historical analogy ("in similar historical conditions, X occurred") — never as a prediction of what will happen.
6. Assess confidence: "high" if multiple closely relevant cases with consistent resolutions exist, "medium" if partial relevance, "low" if cases are sparse or contradictory — in which case recommend expert review.
7. Explicitly list blind spots: aspects of the current scenario NOT covered by the retrieved cases.

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

Call the submit_analysis tool with your structured findings. Reference case IDs (e.g. "CASE-001") wherever you draw on a specific case. Remember: all narrative text fields must be written in Chinese (Simplified), with English technical terms annotated in parentheses on first use.`;
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
    };
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
