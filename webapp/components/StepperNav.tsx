"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInvestigation } from "@/lib/investigationContext";

const STEPS = [
  { href: "/investigation", label: "定义问题" },
  { href: "/evidence", label: "收集证据" },
  { href: "/analysis", label: "比较分析" },
  { href: "/report", label: "调查报告" },
  { href: "/validation", label: "专家确认" },
];

export function StepperNav() {
  const pathname = usePathname();
  const { input, retrievedCases, analysis, validation } = useInvestigation();

  const unlocked = [
    true,
    !!input,
    retrievedCases.length > 0,
    !!analysis,
    !!analysis,
  ];
  const completed = [
    !!input,
    retrievedCases.length > 0,
    !!analysis,
    !!analysis,
    !!validation,
  ];

  const currentIndex = STEPS.findIndex((s) => s.href === pathname);

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3 sm:gap-2 sm:px-6">
        {STEPS.map((step, i) => {
          const isCurrent = i === currentIndex;
          const isDone = completed[i] && !isCurrent;
          const isUnlocked = unlocked[i];

          const base =
            "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
          const state = isCurrent
            ? "bg-slate-900 text-white"
            : isDone
            ? "text-emerald-700 hover:bg-emerald-50"
            : isUnlocked
            ? "text-slate-600 hover:bg-slate-100"
            : "text-slate-300 cursor-not-allowed";

          const content = (
            <>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  isCurrent
                    ? "bg-white text-slate-900"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              {step.label}
            </>
          );

          return (
            <div key={step.href} className="flex items-center gap-1">
              {isUnlocked ? (
                <Link href={step.href} className={`${base} ${state}`}>
                  {content}
                </Link>
              ) : (
                <span className={`${base} ${state}`}>{content}</span>
              )}
              {i < STEPS.length - 1 && (
                <span className="text-slate-300">›</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
