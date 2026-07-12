import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, InvestigationInput, RetrievedCase } from "@/lib/types";
import { buildFallbackAnalysis } from "@/lib/fallbackAnalysis";

export const runtime = "nodejs";

const ANALYSIS_TOOL = {
  name: "submit_analysis",
  description:
    "Submit the structured scale-up investigation analysis derived strictly from the provided historical cases.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "2-3 sentence executive summary of the analysis.",
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
                "Success/failure attribution for this historical case relevant to the current scenario.",
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
            aspect: { type: "string" },
            current: { type: "string" },
            historical: { type: "string" },
            note: { type: "string" },
          },
          required: ["aspect", "current", "historical", "note"],
        },
      },
      transferableLessons: {
        type: "array",
        items: {
          type: "object",
          properties: {
            lesson: { type: "string" },
            applicable: { type: "boolean" },
            reason: { type: "string" },
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
            risk: { type: "string" },
            likelihood: { type: "string", enum: ["High", "Medium", "Low"] },
            impact: { type: "string", enum: ["High", "Medium", "Low"] },
            rationale: { type: "string" },
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
            historicalCondition: { type: "string" },
            historicalOutcome: { type: "string" },
            note: {
              type: "string",
              description:
                "Must explicitly frame this as a historical analogy, not a prediction.",
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
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      confidenceReason: { type: "string" },
      blindSpots: {
        type: "array",
        items: { type: "string" },
        description:
          "Aspects of the current scenario not covered by the retrieved cases.",
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
};

function buildPrompt(input: InvestigationInput, cases: RetrievedCase[]) {
  return `You are an evidence-based process scale-up investigation copilot for a pharmaceutical process engineer. You NEVER predict exact process parameters and you NEVER claim physical/chemical simulation. You reason ONLY from the historical cases provided below plus the current scenario. Every claim must be traceable to a specific case ID or explicitly marked as a gap.

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

Call the submit_analysis tool with your structured findings. Reference case IDs (e.g. "CASE-001") wherever you draw on a specific case.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const input: InvestigationInput = body.input;
  const cases: RetrievedCase[] = body.cases;

  if (!input || !cases || cases.length === 0) {
    return NextResponse.json(
      { error: "Missing investigation input or retrieved cases." },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const analysis: AnalysisResult = {
      ...buildFallbackAnalysis(input, cases),
      usedFallback: true,
      fallbackReason:
        "ANTHROPIC_API_KEY 未配置。请在 webapp/.env.local 中设置后重启开发服务器以启用真实 LLM 分析。",
    };
    return NextResponse.json({ analysis });
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: "tool", name: "submit_analysis" },
      messages: [{ role: "user", content: buildPrompt(input, cases) }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model did not return a structured analysis.");
    }

    const analysis: AnalysisResult = {
      ...(toolUse.input as AnalysisResult),
      usedFallback: false,
    };
    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const analysis: AnalysisResult = {
      ...buildFallbackAnalysis(input, cases),
      usedFallback: true,
      fallbackReason: `调用 Claude API 失败（${message}），已自动切换为预设静态分析。`,
    };
    return NextResponse.json({ analysis });
  }
}
