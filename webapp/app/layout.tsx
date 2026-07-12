import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { InvestigationProvider } from "@/lib/investigationContext";
import { StepperNav } from "@/components/StepperNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "工艺放大调查助手 · Scale-up Investigation Copilot",
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
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-sm font-bold text-slate-900">
                Sc
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  工艺放大调查助手（Scale-up Investigation Copilot）
                </p>
                <p className="text-xs text-slate-500">
                  有据可查 · 可解释 · 可追溯 · 可审计（Evidence-based · Explainable · Traceable · Auditable）
                </p>
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
