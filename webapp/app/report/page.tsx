"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { DocTypeTag } from "@/components/DocTypeTag";
import { useInvestigation } from "@/lib/investigationContext";

function buildMarkdownReport(
  input: NonNullable<ReturnType<typeof useInvestigation>["input"]>,
  analysis: NonNullable<ReturnType<typeof useInvestigation>["analysis"]>,
  caseIds: string[]
) {
  const lines: string[] = [];
  lines.push(`# Investigation Report — ${input.product}`);
  lines.push("");
  lines.push(`*Illustrative Case — for demonstration purposes only*`);
  lines.push("");
  lines.push(`## Scenario`);
  lines.push(`- Synthesis route: ${input.synthesisRoute}`);
  lines.push(`- Stage: ${input.currentStage}`);
  lines.push(`- Scale: ${input.scale}`);
  lines.push(`- Equipment: ${input.equipment}`);
  lines.push(`- Target yield: ${input.targetYield}`);
  lines.push(`- Problem: ${input.problemDescription}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push(analysis.summary);
  lines.push("");
  lines.push(`## 1. Why Relevant & Attribution`);
  analysis.attributions.forEach((a) => {
    lines.push(`- [${a.caseId}] Why relevant: ${a.whyRelevant}`);
    lines.push(`  Attribution: ${a.attribution}`);
  });
  lines.push("");
  lines.push(`## 2. Key Differences (Matched / Mismatched)`);
  analysis.keyDifferences.forEach((d) =>
    lines.push(
      `- [${d.sourceCaseId}] ${d.matched ? "✓ Matched" : "✗ Mismatched"} — **${d.aspect}** — current: ${d.current}; historical: ${d.historical}. ${d.note}`
    )
  );
  lines.push("");
  lines.push(`## 3. Transferable Lessons`);
  analysis.transferableLessons.forEach((l) =>
    lines.push(
      `- [${l.sourceCaseId}] (${l.applicable ? "Applicable" : "Not applicable"}) ${l.lesson} — ${l.reason}`
    )
  );
  lines.push("");
  lines.push(`## 4. Recommended Investigation Directions`);
  analysis.recommendedActions.forEach((r) =>
    lines.push(
      `- ${r.action} — ${r.rationale}${
        r.relatedCaseIds.length ? ` [${r.relatedCaseIds.join(", ")}]` : ""
      }`
    )
  );
  lines.push("");
  lines.push(`## Risks`);
  analysis.risks.forEach((r) =>
    lines.push(
      `- ${r.risk} — Likelihood: ${r.likelihood}, Impact: ${r.impact}. ${r.rationale}${
        r.sourceCaseId ? ` [${r.sourceCaseId}]` : ""
      }`
    )
  );
  lines.push("");
  lines.push(`## Scenario Analysis (Historical Analogy)`);
  analysis.scenarioAnalysis.forEach((s) =>
    lines.push(
      `- [${s.sourceCaseId}] Under "${s.historicalCondition}", historical outcome was "${s.historicalOutcome}". ${s.note}`
    )
  );
  lines.push("");
  lines.push(`## Confidence: ${analysis.confidence.toUpperCase()}`);
  lines.push(analysis.confidenceReason);
  lines.push("");
  lines.push(`## Blind Spots`);
  analysis.blindSpots.forEach((b) => lines.push(`- ${b}`));
  lines.push("");
  lines.push(`## Evidence Sources`);
  caseIds.forEach((id) => lines.push(`- ${id}`));
  lines.push("");
  lines.push(`---`);
  lines.push(
    `Engineer remains responsible for the final technical decision. Recommend cross-functional / expert review before implementation.`
  );
  return lines.join("\n");
}

export default function ReportPage() {
  const router = useRouter();
  const { input, analysis, retrievedCases } = useInvestigation();

  useEffect(() => {
    if (!input) {
      router.replace("/investigation");
    } else if (!analysis) {
      router.replace("/analysis");
    }
  }, [input, analysis, router]);

  if (!input || !analysis) return null;

  function handleExport() {
    const md = buildMarkdownReport(input!, analysis!, retrievedCases.map((c) => c.id));
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investigation-report-${input!.product.replace(/\W+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const caseById = Object.fromEntries(retrievedCases.map((c) => [c.id, c]));

  return (
    <PageShell
      eyebrow="第 5 步 / 共 6 步"
      title="调查报告（Investigation Report）"
      description="每条结论均附引用来源——可解释、可追溯、可审计（Explainability & Auditability by Design）。"
    >
      <div className="mb-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {input.product} — 放大调查报告
          </h2>
          <p className="text-xs text-slate-400">
            {input.synthesisRoute} · {input.currentStage} · {input.scale}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          导出为 Markdown
        </button>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        {analysis.usedFallback && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">⚠ 预设静态分析示例（Fallback Mode）</p>
            <p className="mt-1 text-amber-700">{analysis.fallbackReason}</p>
          </div>
        )}

        <p className="text-sm text-slate-700">{analysis.summary}</p>

        <ReportSection title="① 案例相关性与归因（Why Relevant & Attribution）">
          {analysis.attributions.map((a, i) => (
            <Cited key={i} caseId={a.caseId} caseById={caseById}>
              <span className="font-medium">为什么相关：</span>
              {a.whyRelevant}
              <br />
              <span className="font-medium">历史归因：</span>
              {a.attribution}
            </Cited>
          ))}
        </ReportSection>

        <ReportSection title="② 关键条件对比（Key Differences，匹配 ✓ / 不匹配 ✗）">
          {analysis.keyDifferences.map((d, i) => (
            <p key={i} className="text-sm text-slate-700">
              <span className={d.matched ? "text-emerald-600" : "text-red-500"}>
                {d.matched ? "✓" : "✗"}
              </span>{" "}
              <span className="font-medium">{d.aspect}：</span>
              当前 {d.current} vs 历史 {d.historical}。
              <span className="text-slate-500"> {d.note}</span>{" "}
              <span className="font-mono text-xs text-slate-400">[{d.sourceCaseId}]</span>
            </p>
          ))}
        </ReportSection>

        <ReportSection title="③ 可迁移经验 / 不适用经验（Transferable Lessons）">
          {analysis.transferableLessons.map((l, i) => (
            <Cited key={i} caseId={l.sourceCaseId} caseById={caseById}>
              <span
                className={`mr-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                  l.applicable
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {l.applicable ? "可迁移" : "不适用"}
              </span>
              {l.lesson} — {l.reason}
            </Cited>
          ))}
        </ReportSection>

        <ReportSection title="④ 推荐的调查方向（Recommended Investigation Directions）">
          {analysis.recommendedActions.map((r, i) => (
            <p key={i} className="text-sm text-slate-700">
              <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-medium text-white">
                {i + 1}
              </span>
              {r.action}
              <span className="text-slate-500"> — {r.rationale}</span>
              {r.relatedCaseIds.map((id) => (
                <sup key={id} className="ml-1 text-emerald-700">
                  [{id}]
                </sup>
              ))}
            </p>
          ))}
        </ReportSection>

        <ReportSection title="风险项（Risks）">
          {analysis.risks.map((r, i) => (
            <p key={i} className="text-sm text-slate-700">
              {r.risk}（可能性 {LEVEL_LABEL[r.likelihood]} × 影响 {LEVEL_LABEL[r.impact]}）— {r.rationale}
              {r.sourceCaseId && (
                <sup className="ml-1 text-emerald-700">[{r.sourceCaseId}]</sup>
              )}
            </p>
          ))}
        </ReportSection>

        <ReportSection title="历史类比（Scenario Analysis，非预测）">
          {analysis.scenarioAnalysis.map((s, i) => (
            <Cited key={i} caseId={s.sourceCaseId} caseById={caseById}>
              历史条件 “{s.historicalCondition}” → 历史结果 “{s.historicalOutcome}”。{s.note}
            </Cited>
          ))}
        </ReportSection>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">置信度评级（Confidence）</h3>
            <ConfidenceBadge level={analysis.confidence} />
          </div>
          <p className="mt-2 text-sm text-slate-600">{analysis.confidenceReason}</p>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">盲区提示（Blind Spots）</h3>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
            {analysis.blindSpots.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            建议：本报告为AI辅助生成的调查初稿，最终技术决策及实施方案需经资深工程师/跨职能评审确认。
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link href="/recommendation" className="text-sm text-slate-500 hover:text-slate-700">
          ← 返回
        </Link>
        <Link
          href="/validation"
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          发送专家确认 →
        </Link>
      </div>
    </PageShell>
  );
}

const LEVEL_LABEL: Record<"High" | "Medium" | "Low", string> = {
  High: "高",
  Medium: "中",
  Low: "低",
};

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Cited({
  caseId,
  caseById,
  children,
}: {
  caseId: string;
  caseById: Record<string, { docType: string }>;
  children: React.ReactNode;
}) {
  const doc = caseById[caseId];
  return (
    <p className="text-sm text-slate-700">
      {children}{" "}
      <span className="ml-1 inline-flex items-center gap-1 align-middle">
        <sup className="font-mono text-[11px] text-emerald-700">[{caseId}]</sup>
        {doc && (
          <DocTypeTag docType={doc.docType as import("@/lib/types").DocType} />
        )}
      </span>
    </p>
  );
}
