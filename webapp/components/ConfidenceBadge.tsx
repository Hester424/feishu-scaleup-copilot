import { ConfidenceLevel } from "@/lib/types";

const STYLES: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-50 text-emerald-800 border-emerald-300",
  medium: "bg-amber-50 text-amber-800 border-amber-300",
  low: "bg-red-50 text-red-800 border-red-300",
};

const LABELS: Record<ConfidenceLevel, string> = {
  high: "高置信度（High）— 可参考",
  medium: "中置信度（Medium）— 建议复核",
  low: "低置信度（Low）— 需专家介入",
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium ${STYLES[level]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          level === "high"
            ? "bg-emerald-500"
            : level === "medium"
            ? "bg-amber-500"
            : "bg-red-500"
        }`}
      />
      {LABELS[level]}
    </span>
  );
}
