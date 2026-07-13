"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { useInvestigation } from "@/lib/investigationContext";

export default function AnalysisPage() {
  const router = useRouter();
  const { input, retrievedCases, analysis, setAnalysis } = useInvestigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!input || retrievedCases.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, cases: retrievedCases }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis request failed");
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [input, retrievedCases, setAnalysis]);

  useEffect(() => {
    if (!input) {
      router.replace("/investigation");
      return;
    }
    if (!analysis && !loading && !error) {
      runAnalysis();
    }
  }, [input, analysis, loading, error, router, runAnalysis]);

  if (!input) return null;

  return (
    <PageShell
      eyebrow="第 3 步 / 共 6 步"
      title="案例比较与分析（Case Comparison & Analysis）"
      description="基于检索到的历史案例生成结构化分析——不仅是检索，更是推理（Reasoning, not just search）。"
    >
      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          正在调用 GPT-4o mini 分析 {retrievedCases.length} 条历史案例…（Reasoning in progress）
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-medium">分析请求失败</p>
          <p className="mt-1 text-red-600">{error}</p>
          <button
            onClick={runAnalysis}
            className="mt-3 rounded-md bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            重试
          </button>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-5">
          {analysis.usedFallback && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">⚠ 预设静态分析示例（Fallback Mode）</p>
              <p className="mt-1 text-amber-700">{analysis.fallbackReason}</p>
            </div>
          )}
          {analysis.servedFromCache && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-700">
              ⚡ 命中缓存（Cache Hit）— 相同调查参数与证据案例组合此前已分析过，直接返回已有结果，未重复调用 LLM。
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">分析摘要（Summary）</h2>
              <ConfidenceBadge level={analysis.confidence} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{analysis.summary}</p>
            <p className="mt-2 text-xs text-slate-400">{analysis.confidenceReason}</p>
          </div>

          <Section title="① 案例相关性与归因（Why Relevant & Attribution）">
            <div className="space-y-3">
              {analysis.attributions.map((a, i) => (
                <div key={i} className="rounded-md border border-slate-200 p-3 text-sm">
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
                    {a.caseId}
                  </span>
                  <p className="mt-1.5 text-slate-700">
                    <span className="font-medium text-slate-900">为什么相关：</span>
                    {a.whyRelevant}
                  </p>
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium text-slate-900">历史归因：</span>
                    {a.attribution}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="② 关键条件对比（Key Differences）：匹配 ✓ / 不匹配 ✗">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="pb-2 pr-3 font-medium">案例</th>
                    <th className="pb-2 pr-3 font-medium">匹配</th>
                    <th className="pb-2 pr-4 font-medium">对比维度</th>
                    <th className="pb-2 pr-4 font-medium">当前场景</th>
                    <th className="pb-2 pr-4 font-medium">历史案例</th>
                    <th className="pb-2 font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.keyDifferences.map((d, i) => (
                    <tr key={i} className="border-b border-slate-50 align-top">
                      <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                        {d.sourceCaseId}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={
                            d.matched
                              ? "text-emerald-600"
                              : "text-red-500"
                          }
                          title={d.matched ? "匹配" : "不匹配"}
                        >
                          {d.matched ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 font-medium text-slate-700">{d.aspect}</td>
                      <td className="py-2 pr-4 text-slate-600">{d.current}</td>
                      <td className="py-2 pr-4 text-slate-600">{d.historical}</td>
                      <td className="py-2 text-slate-500">{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="③ 经验迁移（Transferable Lessons）：可迁移 / 不适用">
            <div className="space-y-2">
              {analysis.transferableLessons.map((l, i) => (
                <div
                  key={i}
                  className={`rounded-md border p-3 text-sm ${
                    l.applicable
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        l.applicable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {l.applicable ? "可迁移" : "不适用"}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {l.sourceCaseId}
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-700">{l.lesson}</p>
                  <p className="mt-1 text-xs text-slate-500">{l.reason}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-5">
            <h2 className="mb-3 text-sm font-semibold text-emerald-900">
              ④ 推荐的调查方向（Recommended Investigation Directions）
            </h2>
            <ol className="space-y-3">
              {analysis.recommendedActions.map((r, i) => (
                <li key={i} className="rounded-md bg-white p-3 text-sm shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-medium text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{r.action}</p>
                      <p className="mt-1 text-xs text-slate-500">{r.rationale}</p>
                      {r.relatedCaseIds.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {r.relatedCaseIds.map((id) => (
                            <span
                              key={id}
                              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500"
                            >
                              {id}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="pt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            补充信息（Supporting Detail）
          </p>

          <Section title="风险项（Risks，按可能性 × 影响排列）">
            <div className="space-y-2">
              {analysis.risks.map((r, i) => (
                <div key={i} className="rounded-md border border-slate-200 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-800">{r.risk}</span>
                    <RiskTag label={`可能性：${LEVEL_LABEL[r.likelihood]}`} level={r.likelihood} />
                    <RiskTag label={`影响：${LEVEL_LABEL[r.impact]}`} level={r.impact} />
                    {r.sourceCaseId && (
                      <span className="font-mono text-xs text-slate-400">
                        {r.sourceCaseId}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">{r.rationale}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="情景分析（Scenario Analysis，历史类比，非模型预测）">
            <div className="space-y-2">
              {analysis.scenarioAnalysis.map((s, i) => (
                <div key={i} className="rounded-md bg-slate-50 p-3 text-sm">
                  <span className="font-mono text-xs text-slate-400">
                    {s.sourceCaseId}
                  </span>
                  <p className="mt-1 text-slate-700">
                    历史条件：{s.historicalCondition} → 历史结果：{s.historicalOutcome}
                  </p>
                  <p className="mt-1 text-xs italic text-slate-500">{s.note}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="盲区提示（Blind Spots，检索案例未覆盖的方面）">
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
              {analysis.blindSpots.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Link href="/evidence" className="text-sm text-slate-500 hover:text-slate-700">
          ← 返回
        </Link>
        {analysis && !loading && (
          <Link
            href="/recommendation"
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            参数推荐 →
          </Link>
        )}
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

const LEVEL_LABEL: Record<"High" | "Medium" | "Low", string> = {
  High: "高",
  Medium: "中",
  Low: "低",
};

function RiskTag({ label, level }: { label: string; level: "High" | "Medium" | "Low" }) {
  const style =
    level === "High"
      ? "bg-red-50 text-red-700 border-red-200"
      : level === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${style}`}>
      {label}
    </span>
  );
}
