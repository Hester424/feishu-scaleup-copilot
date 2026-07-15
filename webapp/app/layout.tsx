import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { InvestigationProvider } from "@/lib/investigationContext";
import { StepperNav } from "@/components/StepperNav";
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";

const LAST_UPDATED = "2026-07-15";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "工艺放大调查助手",
  description:
    "基于证据链的工艺放大决策助手 — 飞书AI人才大赛演示项目（海正药业命题）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <InvestigationProvider>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-sm font-bold text-slate-900">
                  Sc
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    工艺放大调查助手
                  </p>
                  <p className="text-xs text-slate-500">
                    有据可查 · 可解释 · 可追溯 · 可审计
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                  <span>知识库 {KNOWLEDGE_BASE.length} 案例</span>
                  <span className="text-slate-200">|</span>
                  <span>演示版本</span>
                  <span className="text-slate-200">|</span>
                  <span>更新于 {LAST_UPDATED}</span>
                </div>
                <Link
                  href="/cases"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-500 hover:text-slate-900"
                >
                  案例库
                </Link>
              </div>
            </div>
          </header>
          <StepperNav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
            飞书AI人才大赛演示项目（海正药业命题）· 非生产环境使用
          </footer>
        </InvestigationProvider>
      </body>
    </html>
  );
}
