"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useInvestigation } from "@/lib/investigationContext";

type Confidence = "高" | "中" | "低";

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  高: "bg-emerald-50 text-emerald-700 border-emerald-200",
  中: "bg-amber-50 text-amber-700 border-amber-200",
  低: "bg-slate-100 text-slate-500 border-slate-200",
};

const PARAM_DISTRIBUTION = [
  {
    param: "反应温度（Reaction Temperature）",
    current: "72°C",
    range: "65–70°C",
    supportCount: 8,
    confidence: "高" as Confidence,
  },
  {
    param: "投料速率（Feed Rate）",
    current: "2.5 L/h",
    range: "1.5–2.0 L/h",
    supportCount: 6,
    confidence: "高" as Confidence,
  },
  {
    param: "搅拌速度（Agitation Rate）",
    current: "80 rpm",
    range: "100–130 rpm",
    supportCount: 3,
    confidence: "中" as Confidence,
  },
  {
    param: "反应时间（Reaction Time）",
    current: "4.5 h",
    range: "4–5 h",
    supportCount: 2,
    confidence: "低" as Confidence,
  },
];

const RECOMMENDED_RANGES = [
  {
    param: "反应温度（Reaction Temperature）",
    range: "65–70°C",
    basis: "基于8个历史案例",
    confidence: "高" as Confidence,
    note: "案例支撑充分，可作为参考起点",
  },
  {
    param: "投料速率（Feed Rate）",
    range: "1.5–2.0 L/h",
    basis: "基于6个历史案例",
    confidence: "高" as Confidence,
    note: "案例支撑充分，可作为参考起点",
  },
  {
    param: "搅拌速度（Agitation Rate）",
    range: "100–130 rpm",
    basis: "仅3个历史案例",
    confidence: "中" as Confidence,
    note: "案例较少，建议工程师复核后采纳",
  },
  {
    param: "反应时间（Reaction Time）",
    range: "4–5 h",
    basis: "仅2个历史案例",
    confidence: "低" as Confidence,
    note: "案例不足，建议由工程师判断，不作为参考依据",
  },
];

export default function RecommendationPage() {
  const router = useRouter();
  const { input, analysis } = useInvestigation();

  useEffect(() => {
    if (!input) {
      router.replace("/investigation");
    } else if (!analysis) {
      router.replace("/analysis");
    }
  }, [input, analysis, router]);

  if (!input || !analysis) return null;

  return (
    <PageShell
      eyebrow="第 4 步 / 共 6 步"
      title="参数推荐（Parameter Recommendation）"
      description="展示产品设计方向：当案例积累足够时，系统可基于历史数据生成参数推荐区间。当前尚未启用。"
    >
      <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-slate-300">
        {/* Designed-but-inactive content — kept legible so evaluators can see
            the design; inactivity is signaled by the corner badge + bottom
            banner below, not by hiding the content itself. */}
        <div className="pointer-events-none space-y-6 bg-white p-6 pb-14 opacity-90 grayscale-[15%] select-none">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              关键工艺参数分布（Key Parameter Distribution）
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="pb-2 pr-4 font-medium">参数</th>
                    <th className="pb-2 pr-4 font-medium">当前值</th>
                    <th className="pb-2 pr-4 font-medium">历史推荐范围</th>
                    <th className="pb-2 pr-4 font-medium">案例支撑数</th>
                    <th className="pb-2 font-medium">置信度</th>
                  </tr>
                </thead>
                <tbody>
                  {PARAM_DISTRIBUTION.map((p) => (
                    <tr key={p.param} className="border-b border-slate-50">
                      <td className="py-2 pr-4 font-medium text-slate-700">{p.param}</td>
                      <td className="py-2 pr-4 text-slate-600">{p.current}</td>
                      <td className="py-2 pr-4 text-slate-600">{p.range}</td>
                      <td className="py-2 pr-4 text-slate-600">{p.supportCount}</td>
                      <td className="py-2">
                        <span
                          className={`rounded border px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLE[p.confidence]}`}
                        >
                          {p.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              推荐参数区间（Recommended Parameter Range）
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {RECOMMENDED_RANGES.map((r) => (
                <div key={r.param} className="rounded-md border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{r.param}</span>
                    <span
                      className={`rounded border px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLE[r.confidence]}`}
                    >
                      {r.confidence}置信
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-700">推荐区间：{r.range}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.basis} · {r.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Corner badge — small and unobtrusive so the mock content stays visible */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
          <span>🔒</span>
          Coming Soon
        </div>

        {/* Bottom banner — states inactivity without covering the design */}
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 px-4 py-2 text-center text-xs font-medium text-white">
          需积累更多案例数据解锁此能力 — 以上为设计原型，暂未启用
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">为什么现在不做参数预测？</p>
        <p className="mt-1.5">
          当知识库积累足够案例后，系统将基于历史数据自动生成参数推荐区间。当前示例知识库案例数量有限，不足以支撑可靠的参数推荐——
          与其展示一个数据不足、可能误导工程师的预测结果，Copilot选择明确暴露这一局限（Explainability &
          Auditability by Design 的一部分），而不是给出看似精确实则缺乏证据支撑的数字。
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link href="/analysis" className="text-sm text-slate-500 hover:text-slate-700">
          ← 返回
        </Link>
        <Link
          href="/report"
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          调查报告 →
        </Link>
      </div>
    </PageShell>
  );
}
