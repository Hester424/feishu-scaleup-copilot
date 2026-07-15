import { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
        <span>示例案例，仅供演示</span>
        <span className="text-amber-600">非真实海正数据</span>
      </div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-3xl text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
