import Link from "next/link";
import { KNOWLEDGE_BASE, STEP_TYPE_OPTIONS } from "@/lib/knowledgeBase";

const FUTURE_STEPS = [
  { title: "定义问题", desc: "工程师通过结构化表单录入放大场景", time: "2 min" },
  { title: "收集证据", desc: "系统自动检索语义相关的历史案例，跨文档类型关联", time: "即时" },
  { title: "比较相似案例", desc: "系统分析历史案例与当前场景的关键差异", time: "1 min" },
  { title: "生成调查初稿", desc: "结构化分析报告，附证据引用、置信度分层、盲区提示", time: "1 min" },
  { title: "专家确认", desc: "资深工程师审阅、确认/修正", time: "按需" },
  { title: "知识沉淀", desc: "确认后的结论回写知识库，供后续项目复用", time: "自动" },
];

const CURRENT_STEPS = [
  { title: "发现问题", desc: "如中试收率从91%降至83%", time: "" },
  { title: "翻阅SOP和工艺规程", desc: "确认当前产品的既定工艺范围", time: "30min–1h" },
  { title: "DMS关键词搜索历史偏差报告", desc: "结果多且不精准", time: "1–2h" },
  { title: "人工筛选相关案例", desc: "依赖个人判断", time: "1–2h" },
  { title: "跨系统调取批次记录做对比", desc: "多个系统间来回核对", time: "1–2h" },
  { title: "请教资深工程师", desc: "需等待排期", time: "0.5–2天" },
  { title: "手写调查报告初稿", desc: "整理引用、组织结论", time: "2–4h" },
];

const DOC_TYPE_COUNT = new Set(KNOWLEDGE_BASE.map((c) => c.docType)).size;

const STATS = [
  { label: "历史案例", value: String(KNOWLEDGE_BASE.length) },
  { label: "文档类型", value: String(DOC_TYPE_COUNT) },
  { label: "覆盖工序类型", value: String(STEP_TYPE_OPTIONS.length) },
  { label: "调查流程", value: "6 步" },
];

const CORE_CAPABILITIES = ["案例检索", "差异分析", "证据引用", "调查报告"];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          基于证据链的工艺放大调查系统
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          帮工艺工程师更快完成放大调查——检索历史案例、比较关键差异、生成带证据引用的调查报告
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          系统自动检索相关案例、比较关键差异，并生成带证据引用的调查报告，辅助工程师完成调查分析。
          最终技术决策仍由工程师确认。
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {CORE_CAPABILITIES.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
            >
              <span className="text-emerald-600">•</span>
              {c}
            </span>
          ))}
        </div>
        <Link
          href="/investigation"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          新建调查 →
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white px-5 py-4">
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TimelinePanel
          heading="当前工作流"
          subheading="检索 → 筛选 → 对比 耗时最长，高度依赖个人经验"
          steps={CURRENT_STEPS}
          accent="slate"
        />
        <TimelinePanel
          heading="未来工作流（引入系统之后）"
          subheading="分钟级完成检索与比较，证据链全程可追溯"
          steps={FUTURE_STEPS}
          accent="emerald"
        />
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">知识飞轮</h2>
        <p className="mt-1 text-sm text-slate-500">
          文档 → 系统分析 → 专家确认 → 知识库 → 下一个项目
        </p>
      </div>
    </div>
  );
}

function TimelinePanel({
  heading,
  subheading,
  steps,
  accent,
}: {
  heading: string;
  subheading: string;
  steps: { title: string; desc: string; time: string }[];
  accent: "slate" | "emerald";
}) {
  const isEmerald = accent === "emerald";
  return (
    <div
      className={`rounded-lg border p-5 ${
        isEmerald
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-slate-200 bg-white"
      }`}
    >
      <h2 className="text-sm font-semibold text-slate-900">{heading}</h2>
      <p
        className={`mt-1 text-xs ${
          isEmerald ? "text-emerald-700" : "text-slate-400"
        }`}
      >
        {subheading}
      </p>
      <ol className="mt-4">
        {steps.map((s, i) => (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[9px] top-5 h-full w-px ${
                  isEmerald ? "bg-emerald-200" : "bg-slate-200"
                }`}
              />
            )}
            <span
              className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                isEmerald
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-900">
                  {s.title}
                </span>
                {s.time && (
                  <span
                    className={`shrink-0 text-[11px] font-medium ${
                      isEmerald ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {s.time}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
