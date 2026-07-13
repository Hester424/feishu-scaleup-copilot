"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useInvestigation } from "@/lib/investigationContext";
import { ValidationDecision } from "@/lib/types";

const DECISIONS: { value: ValidationDecision; label: string; desc: string }[] = [
  { value: "confirmed", label: "确认（Confirm）", desc: "分析结论与工程判断一致，可采纳" },
  { value: "revised", label: "修正（Revise）", desc: "部分结论需要修改后才能采纳" },
  { value: "supplemented", label: "补充（Supplement）", desc: "结论基本正确，但需补充遗漏信息" },
];

const LOOP_STEPS = [
  "文档（Document）",
  "Copilot",
  "专家（Expert）",
  "知识库（Knowledge Base）",
  "下一项目（Next Project）",
];

const ROADMAP_ITEMS = [
  {
    name: "工艺参数预测（Parameter Prediction）",
    desc: "基于历史数据给出具体工艺参数（如温度、投料速率）的推荐区间，而非仅提供历史案例参考。",
  },
  {
    name: "工艺优化建议（Process Optimization）",
    desc: "结合历史案例与实时生产数据，主动给出工艺条件的优化调整建议。",
  },
  {
    name: "实时监控数据接入（Real-time Monitoring Integration）",
    desc: "接入中控系统（DCS/SCADA）实时数据，动态更新调查分析与风险提示。",
  },
  {
    name: "跨基地知识联邦（Cross-plant Knowledge Federation）",
    desc: "跨厂区、跨品种知识库联合检索，扩大证据覆盖面，加速新品种的经验复用。",
  },
];

export default function ValidationPage() {
  const router = useRouter();
  const { input, analysis, validation, setValidation } = useInvestigation();
  const [decision, setDecision] = useState<ValidationDecision>("confirmed");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!input) router.replace("/investigation");
    else if (!analysis) router.replace("/analysis");
  }, [input, analysis, router]);

  if (!input || !analysis) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = {
      decision,
      comment,
      validatedBy: name || "Process Engineer",
      validatedAt: new Date().toISOString(),
    };
    setValidation(v);
    setSubmitted(true);
  }

  return (
    <PageShell
      eyebrow="第 6 步 / 共 6 步"
      title="专家确认与知识沉淀（Expert Validation & Knowledge Update）"
      description="人在回路（Human-in-the-loop）：工程师始终对最终技术决策负责。确认后的结论回写知识库，供后续项目复用。"
    >
      {!submitted && !validation ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6"
        >
          <h2 className="text-sm font-semibold text-slate-900">审阅AI生成的调查分析</h2>
          <p className="mt-1 text-sm text-slate-500">{analysis.summary}</p>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-slate-600">工程师判断</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {DECISIONS.map((d) => (
                <label
                  key={d.value}
                  className={`cursor-pointer rounded-md border p-3 text-sm transition-colors ${
                    decision === d.value
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={d.value}
                    checked={decision === d.value}
                    onChange={() => setDecision(d.value)}
                    className="sr-only"
                  />
                  <span className="font-medium text-slate-800">{d.label}</span>
                  <p className="mt-1 text-xs text-slate-500">{d.desc}</p>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">审阅工程师</span>
              <input
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="姓名 / 工号"
              />
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">
              修正 / 补充说明（可选）
            </span>
            <textarea
              className="min-h-24 resize-y rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="如：Step 3放大还需考虑搅拌功率密度变化……"
            />
          </label>

          <button
            type="submit"
            className="mt-5 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            确认并更新知识库（Confirm & Update Knowledge Base）
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-800">
              ✓ 已标记为「已验证」，结论已回写知识库
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              审阅结果：{DECISIONS.find((d) => d.value === (validation?.decision ?? decision))?.label}
              {" · "}
              审阅人：{validation?.validatedBy || name || "Process Engineer"}
            </p>
            {(validation?.comment || comment) && (
              <p className="mt-2 text-sm text-emerald-700">
                补充说明：{validation?.comment || comment}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">新知识条目（模拟回写）</h3>
            <div className="mt-3 rounded-md border border-dashed border-slate-300 p-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">CASE-NEW</span>
                <span className="rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  调查报告（已验证 / Validated）
                </span>
              </div>
              <p className="mt-2 text-slate-700">{input.product} — {input.problemDescription}</p>
              <p className="mt-1 text-xs text-slate-500">
                结论已由 {validation?.validatedBy || name || "Process Engineer"} 于{" "}
                {new Date(validation?.validatedAt ?? Date.now()).toLocaleString()} 确认，供后续项目检索复用。
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">知识飞轮闭环</h3>
            <div className="flex flex-wrap items-center gap-2">
              {LOOP_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    {s}
                  </span>
                  {i < LOOP_STEPS.length - 1 && <span className="text-slate-300">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/"
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              返回首页
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            产品演进路径（Roadmap）
          </h3>
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            当前版本聚焦：证据检索与推理分析
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          以下能力为规划中方向，本demo暂未实现——展示Copilot从&ldquo;证据推理&rdquo;向&ldquo;主动建议&rdquo;演进的产品路径。
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ROADMAP_ITEMS.map((item) => (
            <div
              key={item.name}
              className="rounded-md border border-dashed border-slate-300 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">{item.name}</p>
                <span className="shrink-0 rounded border border-slate-300 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Coming Soon
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
