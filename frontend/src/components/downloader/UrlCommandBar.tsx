import { useEffect, useRef } from "react";
import { Link2, X, Check, CornerDownLeft } from "lucide-react";
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
      {/* Primary Command Input Container (Directive Sec 11) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="group flex flex-col gap-2 rounded-xl border border-border-strong bg-surface p-2 transition-all duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 sm:h-16 sm:flex-row sm:items-center sm:gap-0 sm:p-0 sm:pl-4 sm:pr-2"
      >
        <label htmlFor="post-url" className="sr-only">
          Public post URL
        </label>

        <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-0">
          <Link2
            size={18}
            strokeWidth={1.6}
            className="shrink-0 text-text-muted transition-colors group-focus-within:text-accent"
            aria-hidden="true"
          />

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
            placeholder="Paste Instagram, YouTube, X, Facebook, LinkedIn or Reddit URL"
            className="h-11 w-full min-w-0 bg-transparent text-[16px] text-text outline-none placeholder:text-text-muted sm:h-full sm:text-[15px]"
          />

          {value && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear URL"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors duration-150 hover:text-text"
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:ml-3">
          <kbd className="mono-meta hidden shrink-0 items-center gap-1 rounded-xs border border-border px-1.5 py-0.5 text-[11px] text-text-muted lg:flex">
            <span>⌘K</span>
          </kbd>

          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-[14px] font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {busy ? (
              <>
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                Analyzing…
              </>
            ) : (
              <>
                Analyze
                <CornerDownLeft
                  size={13}
                  strokeWidth={2}
                  className="hidden sm:inline-block opacity-70"
                />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Status / Detection Row (Center Justified to Link Paster Bar) */}
      <div className="mt-3 flex items-center justify-center text-center">
        {detection.status === "detected" ? (
          <span className="fade-rise inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-positive/10 text-positive">
              <Check size={11} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <PlatformMark platform={detection.platform.id} size={15} />
            {detection.platform.name} detected
          </span>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-text-muted">
            <span className="font-medium text-text-secondary">Supported:</span>
            {PLATFORMS.map((p, i) => (
              <span key={p.id} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                <span className="hover:text-text cursor-default transition-colors">{p.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
