"use client";

import { useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { DocTypeTag } from "@/components/DocTypeTag";
import { DocType, Stage } from "@/lib/types";

interface ParsedCaseDraft {
  docType: DocType;
  product: string;
  stepType: string;
  stage: Stage;
  scale: string;
  problemDescription: string;
  rootCause: string;
  resolution: string;
  keyParameters: { name: string; value: string }[];
}

// Hardcoded "AI-parsed" result — this is a static demo, no real document
// parsing happens. Represents a new case not already in the mock KB
// (extraction/phase-separation step) to make the ingestion feel additive.
const MOCK_PARSED_RESULT: ParsedCaseDraft = {
  docType: "Deviation Report",
  product: "API-X（抗病毒原料药，占位名称）",
  stepType: "萃取 / 分液（Extraction & Phase Separation）",
  stage: "Pilot",
  scale: "从30L放大至300L萃取罐",
  problemDescription:
    "中试放大后萃取分液步骤分相时间显著延长，有机相夹带水相导致下一步收率下降。",
  rootCause:
    "放大后液液两相接触面积/体积比下降，且搅拌强度未同步提高，导致分相平衡时间延长。",
  resolution:
    "延长静置分相时间并优化搅拌桨型式，同时增设界面检测（电导率）辅助判断分相终点。",
  keyParameters: [
    { name: "搅拌速率", value: "120 rpm → 90 rpm（优化后）" },
    { name: "静置分相时间", value: "20 min → 45 min" },
    { name: "分相终点判断", value: "目测 → 电导率在线监测" },
  ],
};

type Step = "idle" | "parsing" | "review" | "success";

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

export default function UploadPage() {
  const [step, setStep] = useState<Step>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [draft, setDraft] = useState<ParsedCaseDraft>(MOCK_PARSED_RESULT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function startParsing(name: string) {
    setFileName(name);
    setStep("parsing");
    setDraft(MOCK_PARSED_RESULT);
    setTimeout(() => setStep("review"), 900);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) startParsing(file.name);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) startParsing(file.name);
  }

  function updateDraft<K extends keyof ParsedCaseDraft>(
    key: K,
    value: ParsedCaseDraft[K]
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateParam(index: number, field: "name" | "value", value: string) {
    setDraft((d) => ({
      ...d,
      keyParameters: d.keyParameters.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  }

  function reset() {
    setStep("idle");
    setFileName(null);
    setDraft(MOCK_PARSED_RESULT);
  }

  return (
    <PageShell
      eyebrow="知识库管理（Knowledge Base Management）"
      title="知识录入（Knowledge Ingestion）"
      description="上传历史案例，AI自动解析结构化入库，持续扩充知识库。"
    >
      {step === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center transition-colors ${
            dragActive
              ? "border-slate-900 bg-slate-50"
              : "border-slate-300 bg-white hover:border-slate-400"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            ⬆
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">
            拖拽文件到此处，或点击上传
          </p>
          <p className="mt-1 text-xs text-slate-400">
            支持 .pdf / .docx（偏差报告、批次记录、CAPA、变更控制等文档）
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {step === "parsing" && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          正在解析文档「{fileName}」…（AI Parsing in progress）
        </div>
      )}

      {step === "review" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                已从「{fileName}」解析出结构化字段
              </p>
              <p className="mt-1 text-xs text-slate-500">
                请核对并按需修正以下内容，确认无误后入库
              </p>
            </div>
            <DocTypeTag docType={draft.docType} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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

            <Field label="产品名称（Product / API）" full>
              <input
                className="input"
                value={draft.product}
                onChange={(e) => updateDraft("product", e.target.value)}
              />
            </Field>

            <Field label="工序类型（Process Step Type）">
              <input
                className="input"
                value={draft.stepType}
                onChange={(e) => updateDraft("stepType", e.target.value)}
              />
            </Field>

            <Field label="放大规模（Scale）">
              <input
                className="input"
                value={draft.scale}
                onChange={(e) => updateDraft("scale", e.target.value)}
              />
            </Field>

            <Field label="问题描述（Problem Description）" full>
              <textarea
                className="input min-h-20 resize-y"
                value={draft.problemDescription}
                onChange={(e) => updateDraft("problemDescription", e.target.value)}
              />
            </Field>

            <Field label="根因分析（Root Cause）" full>
              <textarea
                className="input min-h-20 resize-y"
                value={draft.rootCause}
                onChange={(e) => updateDraft("rootCause", e.target.value)}
              />
            </Field>

            <Field label="处理措施（Resolution）" full>
              <textarea
                className="input min-h-20 resize-y"
                value={draft.resolution}
                onChange={(e) => updateDraft("resolution", e.target.value)}
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
                      placeholder="参数名"
                    />
                    <input
                      className="input flex-[2]"
                      value={p.value}
                      onChange={(e) => updateParam(i, "value", e.target.value)}
                      placeholder="参数值"
                    />
                  </div>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <button
              onClick={reset}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← 重新上传
            </button>
            <button
              onClick={() => setStep("success")}
              className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              确认入库（Confirm & Add to Knowledge Base）
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-800">
              ✓ 已入库 — 该案例将在后续调查中被检索到
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              {draft.product} · {draft.stepType}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">新增知识条目</h3>
            <div className="mt-3 rounded-md border border-dashed border-slate-300 p-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">CASE-NEW</span>
                <DocTypeTag docType={draft.docType} />
                <span className="text-xs text-slate-400">
                  {STAGE_LABELS[draft.stage]} · {draft.scale}
                </span>
              </div>
              <p className="mt-2 text-slate-700">{draft.problemDescription}</p>
              <p className="mt-1 text-xs text-slate-500">
                根因：{draft.rootCause}
              </p>
            </div>
          </div>

          <button
            onClick={reset}
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            继续录入下一条案例
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-400">
        Demo演示流程，实际部署将对接企业DMS/LIMS系统自动导入
      </p>

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
