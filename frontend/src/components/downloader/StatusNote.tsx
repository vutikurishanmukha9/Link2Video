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
      className="fade-rise flex items-start justify-between gap-4 rounded-xs border-2 border-black bg-card px-6 py-5 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xs border-2 border-black bg-destructive text-white shadow-xs">
          <AlertCircle size={16} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-head text-base font-bold text-foreground">{copy.title}</p>
          <p className="mt-1 text-sm font-medium text-foreground/80 leading-relaxed">
            {copy.detail}
          </p>
          {hint && (
            <p className="mt-2 inline-block rounded-xs border border-black bg-muted px-2 py-0.5 font-head text-xs text-foreground">
              Host: {hint}
            </p>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xs border-2 border-black bg-muted text-foreground transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:shadow-none"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
