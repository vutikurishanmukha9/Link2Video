import { AlertCircle, X } from "lucide-react";
import { FAILURE_COPY, type FailureCode } from "@/lib/downloader";

interface Props {
  code: FailureCode;
  hint?: string | undefined;
  onDismiss?: () => void;
}

export function StatusNote({ code, hint, onDismiss }: Props) {
  const copy = FAILURE_COPY[code];

  return (
    <div
      role="status"
      className="fade-rise flex items-start justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          size={16}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-warning"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-text">{copy.title}</p>
          <p className="mt-0.5 text-[13px] text-text-secondary">{copy.detail}</p>
          {hint && <p className="mono-meta mt-1.5 truncate text-text-muted">Host: {hint}</p>}
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="rounded-xs p-1 text-text-muted transition-colors hover:text-text"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}
