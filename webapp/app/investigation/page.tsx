"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { useInvestigation } from "@/lib/investigationContext";
import { InvestigationInput, Stage } from "@/lib/types";
import { retrieveRelevantCases, STEP_TYPE_OPTIONS } from "@/lib/knowledgeBase";

interface Scenario {
  id: string;
  buttonLabel: string;
  expectedTopCase: string;
  input: InvestigationInput;
}

const SCENARIOS: Scenario[] = [
  {
    id: "fluorination",
    buttonLabel: "示例① 氟化步骤（默认）",
    expectedTopCase: "预期最相关：CASE-001 — 氟化步骤放大传热限制，二聚体杂质升高",
    input: {
      product: "API-X（抗病毒原料药，占位名称）",
      synthesisRoute: "第3步：氟化反应（Fluorination）",
      currentStage: "Pilot",
      scale: "从10L放大至200L反应釜",
      equipment: "搪玻璃反应釜 → SS316不锈钢反应釜；搅拌桨保持锚式不变",
      targetYield: "≥ 90%",
      problemDescription:
        "中试放大（200L）收率由小试（10L）91%降至83%，HPLC显示较小试批次二聚体杂质（Dimer Impurity）增加。",
      suspectedStepTags: ["fluorination"],
    },
  },
  {
    id: "distillation",
    buttonLabel: "示例② 蒸馏步骤",
    expectedTopCase: "预期最相关：CASE-007 / CASE-010 — 蒸馏单元操作传热限制导致热降解杂质",
    input: {
      product: "API-D（占位名称）",
      synthesisRoute: "末端：减压蒸馏 / 溶剂置换步骤",
      currentStage: "Commercial",
      scale: "从80L放大至800L蒸馏釜",
      equipment: "蒸馏釜 + 真空系统，换热面积随规模未同步提升",
      targetYield: "≥ 92%",
      problemDescription:
        "商业化放大后蒸馏耗时由小试2h延长至9h，成品中热降解杂质（Degradation Impurity）由0.2%升至1.8%，超出放行标准（≤1.0%）。",
      suspectedStepTags: ["distillation"],
    },
  },
  {
    id: "hydrogenation",
    buttonLabel: "示例③ 加氢步骤",
    expectedTopCase: "预期最相关：CASE-008 — 原料硫杂质导致催化剂中毒（非搅拌/传质问题）",
    input: {
      product: "API-H（占位名称）",
      synthesisRoute: "催化加氢还原步骤",
      currentStage: "Pilot",
      scale: "从20L放大至300L加氢釜",
      equipment: "加氢反应釜，Pd/C催化剂",
      targetYield: "≥ 95%",
      problemDescription:
        "中试放大后加氢反应转化率不稳定，部分批次残留未反应双键中间体超标，催化剂用量与小试一致但效果下降。",
      suspectedStepTags: ["hydrogenation"],
    },
  },
  {
    id: "chlorination",
    buttonLabel: "示例④ 酰氯化步骤（不同药物类别）",
    expectedTopCase: "预期最相关：CASE-009 — 心血管类原料药，验证架构跨药物类别的通用性",
    input: {
      product: "API-C（心血管类原料药，占位名称）",
      synthesisRoute: "酰氯化步骤（SOCl2体系）",
      currentStage: "Pilot",
      scale: "从15L放大至250L反应釜",
      equipment: "反应釜 + 尾气（HCl/SO2）吸收系统",
      targetYield: "≥ 90%",
      problemDescription:
        "中试放大后酰氯化反应尾气量瞬时激增，尾气吸收系统超负荷报警，过氯化副产物增加。",
      suspectedStepTags: ["chlorination"],
    },
  },
];

const STAGES: Stage[] = ["Lab", "Pilot", "Commercial"];
const STAGE_LABELS: Record<Stage, string> = {
  Lab: "小试（Lab）",
  Pilot: "中试（Pilot）",
  Commercial: "商业化（Commercial）",
};

export default function InvestigationPage() {
  const router = useRouter();
  const { setInput, setRetrievedCases } = useInvestigation();
  const [form, setForm] = useState<InvestigationInput>(SCENARIOS[0].input);
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0].id);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof InvestigationInput>(
    key: K,
    value: InvestigationInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function loadScenario(s: Scenario) {
    setForm(s.input);
    setActiveScenario(s.id);
  }

  function toggleStepTag(tag: string) {
    setForm((f) => {
      const current = f.suspectedStepTags ?? [];
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      return { ...f, suspectedStepTags: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setInput(form);
    setRetrievedCases(retrieveRelevantCases(form));
    router.push("/evidence");
  }

  const currentExpectation = SCENARIOS.find(
    (s) => s.id === activeScenario
  )?.expectedTopCase;

  return (
    <PageShell
      eyebrow="第 1 步 / 共 5 步"
      title="新建放大调查（New Scale-up Investigation）"
      description="结构化录入放大场景，Copilot将据此检索相关历史案例。这是一个专业调查工具，不是通用AI聊天框。"
    >
      <div className="mb-5 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-800">
          如何使用这个页面（How to use this page）
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          点击下方任一示例按钮，可一键加载不同的放大场景，体验Copilot针对不同工序类型（氟化、蒸馏、加氢、氯化）检索并推荐相关历史案例的能力——不需要具备化学工程背景即可操作。
          若想自行填写，建议在下方&ldquo;疑似相关工序&rdquo;中勾选对应标签，Copilot会据此更准确地匹配历史案例。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadScenario(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeScenario === s.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
              }`}
            >
              {s.buttonLabel}
            </button>
          ))}
        </div>
        {currentExpectation && (
          <p className="mt-2 text-xs text-sky-700">{currentExpectation}</p>
        )}
      </div>

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

          <Field
            label="疑似相关工序（Suspected Process Step）"
            full
            hint='填写你怀疑出问题的具体工序即可，不需要完整合成路线。如"第3步：氟化反应"'
          >
            <input
              className="input"
              value={form.synthesisRoute}
              onChange={(e) => update("synthesisRoute", e.target.value)}
              placeholder='如"第3步：氟化反应（Fluorination）"'
            />
          </Field>

          <Field
            label="工序类型标签（可多选，帮助Copilot精确匹配）"
            full
          >
            <div className="flex flex-wrap gap-2">
              {STEP_TYPE_OPTIONS.map((opt) => {
                const selected = (form.suspectedStepTags ?? []).includes(
                  opt.tag
                );
                return (
                  <button
                    key={opt.tag}
                    type="button"
                    onClick={() => toggleStepTag(opt.tag)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
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

          <Field
            label="问题描述（Problem Description）"
            full
            required
            hint="尽量包含具体现象，如收率变化、杂质类型、耗时变化等——这些关键词也会被用于检索匹配"
          >
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
            示例数据均为虚构（Illustrative Case），非真实企业数据
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
  hint,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}
