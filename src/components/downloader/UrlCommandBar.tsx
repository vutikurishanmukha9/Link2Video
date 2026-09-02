import { useEffect, useRef } from "react";
import { Link2, X, Check } from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { PLATFORMS, type Detection } from "@/lib/downloader";

interface Props {
  value: string;
  detection: Detection;
  busy: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function UrlCommandBar({ value, detection, busy, onChange, onSubmit, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="group flex flex-col gap-2 rounded-xl border border-border-strong bg-surface p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-150 focus-within:border-accent sm:h-16 sm:flex-row sm:items-center sm:gap-0 sm:p-0 sm:pl-4 sm:pr-2"
      >
        <label htmlFor="post-url" className="sr-only">
          Public post URL
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-0">
          <Link2 size={17} strokeWidth={1.6} className="shrink-0 text-text-muted" aria-hidden="true" />
          <input
            id="post-url"
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClear();
            }}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste an Instagram, X, Facebook, LinkedIn or Reddit URL"
            className="h-11 w-full min-w-0 bg-transparent text-[15px] text-text outline-none placeholder:text-text-muted sm:h-full"
          />
          {value && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear URL"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors duration-150 hover:text-text sm:flex"
            >
              <X size={15} strokeWidth={1.6} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:ml-3">
          <kbd className="mono-meta hidden shrink-0 rounded-xs border border-border px-1.5 py-0.5 text-text-muted lg:block">
            ⌘K
          </kbd>
          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 text-[14px] font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {busy ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </form>

      <div className="mt-3 flex min-h-6 flex-wrap items-center gap-x-4 gap-y-2">
        {detection.status === "detected" ? (
          <span className="fade-rise inline-flex items-center gap-2 text-[13px] text-text-secondary">
            <Check size={13} strokeWidth={2} className="text-positive" aria-hidden="true" />
            <PlatformMark platform={detection.platform.id} size={14} />
            {detection.platform.name} detected
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-muted">
            <span>Supported</span>
            {PLATFORMS.map((p, i) => (
              <span key={p.id} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
