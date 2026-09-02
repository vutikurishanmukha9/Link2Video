import { AlertCircle } from "lucide-react";
import { FAILURE_COPY, type FailureCode } from "@/lib/downloader";

export function StatusNote({ code, hint }: { code: FailureCode; hint?: string | undefined }) {
  const copy = FAILURE_COPY[code];
  return (
    <div
      role="status"
      className="fade-rise flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3"
    >
      <AlertCircle size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-text">{copy.title}</p>
        <p className="mt-0.5 text-[13px] text-text-secondary">{copy.detail}</p>
        {hint && <p className="mono-meta mt-1.5 truncate text-text-muted">{hint}</p>}
      </div>
    </div>
  );
}
