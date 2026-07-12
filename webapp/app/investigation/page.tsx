"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { useInvestigation } from "@/lib/investigationContext";
import { InvestigationInput, Stage } from "@/lib/types";
import { retrieveRelevantCases } from "@/lib/knowledgeBase";

const DEFAULT_INPUT: InvestigationInput = {
  product: "API-X（抗病毒原料药，占位名称）",
  synthesisRoute: "五步合成，关键氟化（Fluorination）步骤在第3步",
  currentStage: "Pilot",
  scale: "从10L放大至200L反应釜",
  equipment: "搪玻璃反应釜 → SS316不锈钢反应釜；搅拌桨保持锚式不变",
  targetYield: "≥ 90%",
  problemDescription:
    "中试放大（200L）收率由小试（10L）91%降至83%，HPLC显示较小试批次二聚体杂质（Dimer Impurity）增加。",
};

const STAGES: Stage[] = ["Lab", "Pilot", "Commercial"];
const STAGE_LABELS: Record<Stage, string> = {
  Lab: "小试（Lab）",
  Pilot: "中试（Pilot）",
  Commercial: "商业化（Commercial）",
};

export default function InvestigationPage() {
  const router = useRouter();
  const { setInput, setRetrievedCases } = useInvestigation();
  const [form, setForm] = useState<InvestigationInput>(DEFAULT_INPUT);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof InvestigationInput>(
    key: K,
    value: InvestigationInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setInput(form);
    setRetrievedCases(retrieveRelevantCases(form));
    router.push("/evidence");
  }

  return (
    <PageShell
      eyebrow="第 1 步 / 共 5 步"
      title="新建放大调查（New Scale-up Investigation）"
      description="结构化录入放大场景，Copilot将据此检索相关历史案例。这是一个专业调查工具，不是通用AI聊天框。"
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="产品 / 原料药名称（Product / API）" required>
            <input
              className="input"
              value={form.product}
              onChange={(e) => update("product", e.target.value)}
              required
            />
          </Field>

          <Field label="当前阶段（Current Stage）" required>
            <select
              className="input"
              value={form.currentStage}
              onChange={(e) => update("currentStage", e.target.value as Stage)}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="合成路线概述（Synthesis Route Overview）" full required>
            <input
              className="input"
              value={form.synthesisRoute}
              onChange={(e) => update("synthesisRoute", e.target.value)}
              placeholder='如"五步合成，关键氟化步骤在第3步"'
              required
            />
          </Field>

          <Field label="放大规模（Scale）" required>
            <input
              className="input"
              value={form.scale}
              onChange={(e) => update("scale", e.target.value)}
              placeholder='如"从10L放大至200L反应釜"'
              required
            />
          </Field>

          <Field label="目标收率（Target Yield）" required>
            <input
              className="input"
              value={form.targetYield}
              onChange={(e) => update("targetYield", e.target.value)}
              required
            />
          </Field>

          <Field label="设备类型及变更（Equipment）" full>
            <input
              className="input"
              value={form.equipment}
              onChange={(e) => update("equipment", e.target.value)}
            />
          </Field>

          <Field label="问题描述（Problem Description）" full required>
            <textarea
              className="input min-h-28 resize-y"
              value={form.problemDescription}
              onChange={(e) => update("problemDescription", e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-400">
            示例数据已预填（基于公开已知氟化步骤放大痛点改编，非真实企业数据）
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            收集证据 →
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #0f172a;
          box-shadow: 0 0 0 1px #0f172a;
        }
      `}</style>
    </PageShell>
  );
}

function Field({
  label,
  children,
  full,
  required,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
