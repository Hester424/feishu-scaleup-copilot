import Link from "next/link";

const FUTURE_STEPS = [
  { title: "定义问题（Define Problem）", desc: "工程师通过结构化表单录入放大场景" },
  { title: "收集证据（Collect Evidence）", desc: "Copilot自动检索语义相关的历史案例，跨文档类型关联" },
  { title: "比较相似案例（Compare Similar Cases）", desc: "Copilot分析历史案例与当前场景的关键差异" },
  { title: "生成调查初稿（Generate Investigation Draft）", desc: "结构化分析报告，附证据引用、置信度分层、盲区提示" },
  { title: "专家确认（Expert Validation）", desc: "资深工程师审阅、确认/修正" },
  { title: "知识沉淀（Knowledge Update）", desc: "确认后的结论回写知识库，供后续项目复用" },
];

const CURRENT_STEPS = [
  "发现问题（如中试收率从91%降至83%）",
  "翻阅当前产品SOP和工艺规程（30min–1h）",
  "DMS关键词搜索历史偏差报告（结果多且不精准，1–2h）",
  "人工筛选相关案例（依赖个人判断，1–2h）",
  "跨系统调取批次记录做对比（1–2h）",
  "请教资深工程师（等排期，0.5–2天）",
  "手写调查报告初稿（2–4h）",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          基于证据链的工艺放大决策助手（Evidence-based Process Scale-up Copilot）
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          帮工艺工程师更快完成放大调查——检索历史案例、比较关键差异、生成带证据引用的调查报告
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          这不是一个聊天机器人。它是一个面向工艺工程师的调查分析工具：不预测参数，不做黑盒模拟，
          而是把"检索历史案例 → 比较差异 → 组织证据链 → 生成可审计报告"这套专家推理过程结构化、加速化。
          工程师始终对最终技术决策负责。
        </p>
        <Link
          href="/investigation"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          开始新的放大调查 →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            当前工作流（Current Workflow）
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            检索 → 筛选 → 对比 耗时最长，高度依赖个人经验
          </p>
          <ol className="mt-4 space-y-2">
            {CURRENT_STEPS.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-500">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            未来工作流（Future Workflow，接入Copilot之后）
          </h2>
          <p className="mt-1 text-xs text-emerald-700">
            分钟级完成检索与比较，证据链全程可追溯
          </p>
          <ol className="mt-4 space-y-2">
            {FUTURE_STEPS.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="font-medium text-slate-900">{s.title}</span>
                  <span className="text-slate-500"> — {s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">知识飞轮（Knowledge Flywheel）</h2>
        <p className="mt-1 text-sm text-slate-500">
          文档（Document）→ Copilot → 专家（Expert）→ 知识库（Knowledge Base）→ 下一个项目（Next Project）
        </p>
      </div>
    </div>
  );
}
