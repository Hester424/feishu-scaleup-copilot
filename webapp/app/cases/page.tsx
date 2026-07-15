"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { DocTypeTag } from "@/components/DocTypeTag";
import { useInvestigation } from "@/lib/investigationContext";
import { deriveTagsFromText, STEP_TYPE_OPTIONS } from "@/lib/knowledgeBase";
import { DocType, HistoricalCase, Stage } from "@/lib/types";

const DOC_TYPES: DocType[] = [
  "Deviation Report",
  "Batch Record",
  "CAPA",
  "Change Control",
];

const STAGES: Stage[] = ["Lab", "Pilot", "Commercial"];
const STAGE_LABELS: Record<Stage, string> = {
  Lab: "小试（Lab）",
  Pilot: "中试（Pilot）",
  Commercial: "商业化（Commercial）",
};

interface Draft {
  docType: DocType;
  productType: string;
  stage: Stage;
  scale: string;
  scenario: string;
  rootCause: string;
  resolution: string;
  outcome: string;
  keyParameters: { name: string; value: string }[];
  stepTags: string[];
}

const EMPTY_DRAFT: Draft = {
  docType: "Deviation Report",
  productType: "",
  stage: "Pilot",
  scale: "",
  scenario: "",
  rootCause: "",
  resolution: "",
  outcome: "",
  keyParameters: [{ name: "", value: "" }],
  stepTags: [],
};

export default function CasesPage() {
  const { cases, addCase } = useInvestigation();
  const [docTypeFilter, setDocTypeFilter] = useState<DocType | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      if (docTypeFilter !== "all" && c.docType !== docTypeFilter) return false;
      if (tagFilter !== "all" && !c.tags.includes(tagFilter)) return false;
      if (!q) return true;
      const haystack = `${c.productType} ${c.scenario} ${c.rootCause} ${c.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [cases, docTypeFilter, tagFilter, query]);

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function toggleStepTag(tag: string) {
    setDraft((d) => ({
      ...d,
      stepTags: d.stepTags.includes(tag)
        ? d.stepTags.filter((t) => t !== tag)
        : [...d.stepTags, tag],
    }));
  }

  function updateParam(index: number, field: "name" | "value", value: string) {
    setDraft((d) => ({
      ...d,
      keyParameters: d.keyParameters.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  }

  function addParamRow() {
    setDraft((d) => ({
      ...d,
      keyParameters: [...d.keyParameters, { name: "", value: "" }],
    }));
  }

  function removeParamRow(index: number) {
    setDraft((d) => ({
      ...d,
      keyParameters: d.keyParameters.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const autoTags = deriveTagsFromText(
      draft.scenario,
      draft.rootCause,
      draft.resolution,
      draft.productType
    );
    const tags = Array.from(new Set([...draft.stepTags, ...autoTags]));
    const keyParameters = Object.fromEntries(
      draft.keyParameters
        .filter((p) => p.name.trim() && p.value.trim())
        .map((p) => [p.name.trim(), p.value.trim()])
    );

    const created = addCase({
      docType: draft.docType,
      productType: draft.productType || "未填写产品/反应类型",
      stage: draft.stage,
      scale: draft.scale || "未填写",
      scenario: draft.scenario || "未填写场景描述",
      rootCause: draft.rootCause || "未填写",
      resolution: draft.resolution || "未填写",
      outcome: draft.outcome || "未填写",
      keyParameters,
      tags,
    });

    setJustAddedId(created.id);
    setDraft(EMPTY_DRAFT);
    setShowForm(false);
  }

  return (
    <PageShell
      eyebrow="案例库（Case Library）"
      title="工艺放大案例库（All Historical Cases）"
      description="所有可被Copilot检索的历史案例——包括示例知识库与本轮新增案例。可按文档类型、工序类型筛选，或直接添加新案例。"
    >
      {justAddedId && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <span>
            ✓ 已新增 <span className="font-mono">{justAddedId}</span>
            ，该案例现已可被后续调查检索到——可返回
            <Link href="/investigation" className="mx-1 underline">
              新建放大调查
            </Link>
            验证。
          </span>
          <button
            onClick={() => setJustAddedId(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
            placeholder="搜索产品/场景/根因/标签…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-600"
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value as DocType | "all")}
          >
            <option value="all">全部文档类型</option>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-600"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="all">全部工序类型</option>
            {STEP_TYPE_OPTIONS.map((opt) => (
              <option key={opt.tag} value={opt.tag}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            共 {filtered.length} / {cases.length} 条
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/upload"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-500 hover:text-slate-900"
          >
            从文档解析新增（AI Parse from Document）→
          </Link>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            {showForm ? "取消" : "+ 手动添加案例"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-6"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            添加新案例（Add Case）
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="文档类型（Document Type）">
              <select
                className="input"
                value={draft.docType}
                onChange={(e) => updateDraft("docType", e.target.value as DocType)}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="工艺阶段（Stage）">
              <select
                className="input"
                value={draft.stage}
                onChange={(e) => updateDraft("stage", e.target.value as Stage)}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="产品/反应类型（Product / Reaction Type）" full>
              <input
                className="input"
                value={draft.productType}
                onChange={(e) => updateDraft("productType", e.target.value)}
                placeholder='如"某抗病毒原料药，多步合成，含关键氟化步骤"'
              />
            </Field>
            <Field label="放大规模（Scale）">
              <input
                className="input"
                value={draft.scale}
                onChange={(e) => updateDraft("scale", e.target.value)}
                placeholder='如"从10L放大至200L反应釜"'
              />
            </Field>
            <Field
              label="工序类型标签（帮助后续检索精确匹配）"
              full
            >
              <div className="flex flex-wrap gap-2">
                {STEP_TYPE_OPTIONS.map((opt) => {
                  const selected = draft.stepTags.includes(opt.tag);
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
              <p className="mt-1 text-[11px] text-slate-400">
                提交时还会自动从场景/根因/处理措施文本中补充识别标签。
              </p>
            </Field>
            <Field label="场景描述（Scenario）" full>
              <textarea
                className="input min-h-16 resize-y"
                value={draft.scenario}
                onChange={(e) => updateDraft("scenario", e.target.value)}
              />
            </Field>
            <Field label="根因分析（Root Cause）" full>
              <textarea
                className="input min-h-16 resize-y"
                value={draft.rootCause}
                onChange={(e) => updateDraft("rootCause", e.target.value)}
              />
            </Field>
            <Field label="处理措施（Resolution）" full>
              <textarea
                className="input min-h-16 resize-y"
                value={draft.resolution}
                onChange={(e) => updateDraft("resolution", e.target.value)}
              />
            </Field>
            <Field label="结果（Outcome）" full>
              <textarea
                className="input min-h-16 resize-y"
                value={draft.outcome}
                onChange={(e) => updateDraft("outcome", e.target.value)}
              />
            </Field>
            <Field label="关键工艺参数（Key Parameters）" full>
              <div className="space-y-2">
                {draft.keyParameters.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="input flex-1"
                      value={p.name}
                      onChange={(e) => updateParam(i, "name", e.target.value)}
                      placeholder="参数名，如 reaction_temp"
                    />
                    <input
                      className="input flex-[2]"
                      value={p.value}
                      onChange={(e) => updateParam(i, "value", e.target.value)}
                      placeholder="参数值，如 65°C → 实际72°C"
                    />
                    <button
                      type="button"
                      onClick={() => removeParamRow(i)}
                      className="px-2 text-slate-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addParamRow}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  + 添加参数行
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-400">
              新案例仅保存于本次会话，供演示检索闭环使用
            </p>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              确认入库（Add to Knowledge Base）
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filtered.map((c) => (
          <CaseCard key={c.id} c={c} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            没有匹配的案例，尝试调整筛选条件
          </div>
        )}
      </div>

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

function CaseCard({ c }: { c: HistoricalCase }) {
  return (
    <details className="group rounded-lg border border-slate-200 bg-white p-5">
      <summary className="flex cursor-pointer flex-wrap items-center gap-2">
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
        <span className="ml-auto text-sm font-medium text-slate-800 group-open:text-slate-900">
          {c.scenario}
        </span>
      </summary>

      {c.caveat && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          {c.caveat}
        </div>
      )}

      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-slate-400">产品/反应类型</p>
          <p className="text-slate-700">{c.productType}</p>
        </div>
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
        <div className="sm:col-span-2">
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

      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500"
          >
            {t}
          </span>
        ))}
      </div>
    </details>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
