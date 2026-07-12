import { DocType } from "@/lib/types";

const STYLES: Record<DocType, string> = {
  "Deviation Report": "bg-amber-50 text-amber-800 border-amber-300",
  "Batch Record": "bg-blue-50 text-blue-800 border-blue-300",
  CAPA: "bg-emerald-50 text-emerald-800 border-emerald-300",
  "Change Control": "bg-violet-50 text-violet-800 border-violet-300",
};

const LABELS: Record<DocType, string> = {
  "Deviation Report": "偏差报告（Deviation Report）",
  "Batch Record": "批次记录（Batch Record）",
  CAPA: "纠正与预防措施（CAPA）",
  "Change Control": "变更控制（Change Control）",
};

export function DocTypeTag({ docType }: { docType: DocType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[docType]}`}
    >
      {LABELS[docType]}
    </span>
  );
}
