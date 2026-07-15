"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { DocTypeTag } from "@/components/DocTypeTag";
import { useInvestigation } from "@/lib/investigationContext";

export default function EvidencePage() {
  const router = useRouter();
  const { input, retrievedCases } = useInvestigation();

  useEffect(() => {
    if (!input) router.replace("/investigation");
  }, [input, router]);

  if (!input) return null;

  return (
    <PageShell
      eyebrow="第 2 步 / 共 6 步"
      title="证据收集"
      description="从历史知识库中检索到以下相关案例，相关性评分与匹配依据均可见。"
    >
      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <span className="font-medium text-slate-900">当前调查场景：</span>{" "}
        {input.product} · {input.synthesisRoute} · {input.currentStage} · {input.scale}
      </div>

      <div className="space-y-4">
        {retrievedCases.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{c.id}</span>
                <DocTypeTag docType={c.docType} />
                {c.isUserAdded && (
                  <span className="rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                    本轮新增
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {c.stage} · {c.scale}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating score={c.relevanceScore} />
                <RelevanceBar score={c.relevanceScore} />
              </div>
            </div>

            <p className="mt-3 text-sm font-medium text-slate-900">
              {c.scenario}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              产品/反应类型：{c.productType}
            </p>

            {c.caveat && (
              <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                {c.caveat}
              </div>
            )}

            <div className="mt-3 rounded-md border border-sky-100 bg-sky-50/50 p-3 text-xs">
              <span className="font-medium text-sky-800">匹配依据：</span>{" "}
              <span className="text-slate-600">{c.relevanceExplanation}</span>
              {c.matchedTags.length > 0 && (
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {c.matchedTags.map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-1.5 text-slate-600"
                    >
                      <span className="text-emerald-600">✓</span>
                      {humanizeTag(t)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                查看案例详情
              </summary>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-400">根因</p>
                  <p className="text-slate-700">{c.rootCause}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">处理措施</p>
                  <p className="text-slate-700">{c.resolution}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">结果</p>
                  <p className="text-slate-700">{c.outcome}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">关键参数</p>
                  <ul className="text-slate-700">
                    {Object.entries(c.keyParameters).map(([k, v]) => (
                      <li key={k}>
                        <span className="text-slate-400">{k}:</span> {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link href="/investigation" className="text-sm text-slate-500 hover:text-slate-700">
          ← 返回
        </Link>
        <Link
          href="/analysis"
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          比较分析 →
        </Link>
      </div>
    </PageShell>
  );
}

function StarRating({ score }: { score: number }) {
  const filled = Math.min(5, Math.max(0, Math.round(score / 20)));
  return (
    <span className="text-xs text-amber-500" aria-hidden>
      {"★".repeat(filled)}
      <span className="text-slate-200">{"★".repeat(5 - filled)}</span>
    </span>
  );
}

function humanizeTag(tag: string): string {
  return tag
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function RelevanceBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">相关性</span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-medium text-slate-600">
        {score}
      </span>
    </div>
  );
}
