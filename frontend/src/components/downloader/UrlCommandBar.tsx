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
      {/* Primary Neobrutalist Command Input Container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="group flex flex-col gap-2.5 rounded-xs border-2 sm:border-[3px] border-black bg-card p-2.5 md:h-20 md:flex-row md:items-center md:gap-0 md:p-0 md:pl-5 md:pr-3 shadow-xl transition-all duration-150 focus-within:shadow-2xl"
      >
        <label htmlFor="post-url" className="sr-only">
          Public post URL
        </label>

        <div className="flex min-w-0 flex-1 items-center gap-3 px-2 md:px-0">
          <Link2
            size={22}
            strokeWidth={2.5}
            className="shrink-0 text-foreground transition-colors group-focus-within:text-black"
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
            placeholder="Paste video, reel, or post URL..."
            className="h-12 w-full min-w-0 bg-transparent text-[16px] md:text-[17px] font-medium text-foreground outline-none placeholder:text-muted-foreground md:h-full"
          />

          {value && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear URL"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border-2 border-black bg-muted text-foreground transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:ml-4">
          <kbd className="hidden shrink-0 items-center gap-1 rounded-xs border-2 border-black bg-muted px-2 py-1 font-head text-xs text-foreground shadow-xs lg:flex">
            <span>⌘K</span>
          </kbd>

          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xs border-2 border-black bg-primary px-6 font-head text-[15px] font-bold text-black shadow-md transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {busy ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-black" />
                Analyzing…
              </>
            ) : (
              <>
                Analyze
                <CornerDownLeft
                  size={15}
                  strokeWidth={2.5}
                  className="hidden sm:inline-block opacity-80"
                />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Status / Detection Row */}
      <div className="mt-4 flex items-center justify-center text-center">
        {detection.status === "detected" ? (
          <span className="fade-rise inline-flex items-center gap-2 rounded-xs border-2 border-black bg-primary px-3 py-1.5 font-head text-xs text-black shadow-sm">
            <span className="flex h-4 w-4 items-center justify-center rounded-xs border border-black bg-white text-black">
              <Check size={11} strokeWidth={3} aria-hidden="true" />
            </span>
            <PlatformMark platform={detection.platform.id} size={15} />
            {detection.platform.name} DETECTED
          </span>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-head text-foreground mr-1">SUPPORTED:</span>
            {PLATFORMS.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-xs border-2 border-black/30 bg-card px-2.5 py-1 font-head text-xs text-foreground shadow-xs hover:border-black hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-default"
              >
                <PlatformMark platform={p.id} size={13} />
                <span>{p.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
