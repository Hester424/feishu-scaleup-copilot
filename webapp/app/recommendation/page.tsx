"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { DocTypeTag } from "@/components/DocTypeTag";
import { useInvestigation } from "@/lib/investigationContext";

export default function RecommendationPage() {
  const router = useRouter();
  const { input, analysis, retrievedCases } = useInvestigation();

  useEffect(() => {
    if (!input) {
      router.replace("/investigation");
    } else if (!analysis) {
      router.replace("/analysis");
    }
  }, [input, analysis, router]);

  // Flatten every retrieved case's recorded key parameters into one
  // traceable evidence table. This is a direct extract of what's actually
  // in the retrieved cases -- no cross-case numeric aggregation or curve
  // fitting, since the underlying fields aren't standardized enough across
  // cases (different naming, mixed before/after values in free text) to
  // average honestly. What you see here is exactly what's in the KB.
  const parameterRows = useMemo(
    () =>
      retrievedCases.flatMap((c) =>
        Object.entries(c.keyParameters).map(([name, value]) => ({
          caseId: c.id,
          docType: c.docType,
          relevanceScore: c.relevanceScore,
          name,
          value,
        }))
      ),
    [retrievedCases]
  );

  if (!input || !analysis) return null;

  return (
    <PageShell
      eyebrow="第 4 步 / 共 6 步"
      title="历史工艺参数"
      description="本次检索案例中实际记录的工艺参数，逐条可追溯至具体案例。"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            检索案例工艺参数记录
          </h2>
          <span className="text-xs text-slate-400">
            来自本次 {retrievedCases.length} 条检索案例，按相关性排序
          </span>
        </div>

        {parameterRows.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-400">
            检索到的案例未记录结构化关键参数，暂无可展示的证据。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="pb-2 pr-4 font-medium">案例</th>
                  <th className="pb-2 pr-4 font-medium">文档类型</th>
                  <th className="pb-2 pr-4 font-medium">参数</th>
                  <th className="pb-2 font-medium">记录值</th>
                </tr>
              </thead>
              <tbody>
                {parameterRows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 align-top">
                    <td className="py-2 pr-4 font-mono text-xs text-slate-500">
                      {r.caseId}
                    </td>
                    <td className="py-2 pr-4">
                      <DocTypeTag docType={r.docType} />
                    </td>
                    <td className="py-2 pr-4 font-medium text-slate-700">
                      {r.name}
                    </td>
                    <td className="py-2 text-slate-600">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">
          以上为逐案例的原始记录，供工程师横向比对参考。不同案例使用的参数字段命名可能不同（如反应温度在不同案例中可能记为
          reaction_temp / initial_temp_setpoint 等），系统按案例原样展示，保留数据的真实边界。
        </p>
      </div>

      <div className="mt-5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/60 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">
            产品演进方向：机器学习驱动的参数区间预测
          </p>
          <span className="shrink-0 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            规划能力
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          当知识库积累足够数量且参数字段完成标准化后，系统可基于历史数据训练模型，自动生成参数推荐区间及置信度。
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
