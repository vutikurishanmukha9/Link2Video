import { useCallback, useEffect, useRef } from "react";
import { Link2, X, Check, CornerDownLeft, Clipboard } from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { PLATFORMS, detect, type Detection } from "@/lib/downloader";

interface Props {
  value: string;
  detection: Detection;
  busy: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

const PLATFORM_BUTTON_STYLES: Record<
  string,
  {
    bg: string;
    border: string;
    shadow: string;
    text: string;
  }
> = {
  instagram: {
    bg: "bg-[#e1306c] hover:bg-[#c8245b]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  tiktok: {
    bg: "bg-[#fe2c55] hover:bg-[#e0264b]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  youtube: {
    bg: "bg-red-600 hover:bg-red-700",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  x: {
    bg: "bg-zinc-900 hover:bg-black",
    border: "border-zinc-700/60",
    shadow: "shadow-xs",
    text: "text-white",
  },
  facebook: {
    bg: "bg-[#1877f2] hover:bg-[#166fe5]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  pinterest: {
    bg: "bg-[#e60023] hover:bg-[#cc001f]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  threads: {
    bg: "bg-purple-600 hover:bg-purple-700",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  soundcloud: {
    bg: "bg-[#ff5500] hover:bg-[#e04b00]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  bandcamp: {
    bg: "bg-[#1da0c3] hover:bg-[#188ba9]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  twitch: {
    bg: "bg-[#9146ff] hover:bg-[#772ce8]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  linkedin: {
    bg: "bg-[#0a66c2] hover:bg-[#084e96]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  reddit: {
    bg: "bg-[#ff4500] hover:bg-[#e03d00]",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
  web: {
    bg: "bg-emerald-600 hover:bg-emerald-700",
    border: "border-transparent",
    shadow: "shadow-xs",
    text: "text-white",
  },
};

const DEFAULT_BUTTON_STYLE = {
  bg: "bg-blue-600 hover:bg-blue-700",
  border: "border-transparent",
  shadow: "shadow-xs",
  text: "text-white",
};

export function UrlCommandBar({ value, detection, busy, onChange, onSubmit, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const activeBtnTheme =
    detection.status === "detected"
      ? (PLATFORM_BUTTON_STYLES[detection.platform.id] ?? DEFAULT_BUTTON_STYLE)
      : DEFAULT_BUTTON_STYLE;

  const handlePaste = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {
        /* ignore */
      }
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const trimmed = text.trim();
          onChange(trimmed);
          const det = detect(trimmed);
          if (det.status === "detected") {
            setTimeout(() => onSubmit(), 50);
          }
          return;
        }
      }
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  }, [onChange, onSubmit]);

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
      {/* Primary Command Input Container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="group relative flex flex-col gap-2 rounded-2xl border border-border/90 bg-surface/95 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md p-2 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-[0_12px_36px_rgba(59,130,246,0.12)] sm:h-16 sm:flex-row sm:items-center sm:gap-0 sm:p-0 sm:pl-4 sm:pr-2"
      >
        <label htmlFor="post-url" className="sr-only">
          Public post URL
        </label>

        <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-0">
          <Link2
            size={18}
            strokeWidth={1.8}
            className="shrink-0 text-text-muted transition-colors group-focus-within:text-blue-600"
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
            placeholder="Paste Instagram, TikTok, YouTube, X, Pinterest, Threads or Twitch URL"
            className="h-11 w-full min-w-0 bg-transparent text-[16px] text-text outline-none placeholder:text-text-muted sm:h-full sm:text-[15px]"
          />

          {!value ? (
            <button
              type="button"
              onClick={handlePaste}
              aria-label="Paste from clipboard"
              className="native-tap flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 text-[12.5px] font-semibold text-blue-600 transition-all duration-150 hover:bg-blue-500/15 hover:border-blue-500/40 active:scale-95 shadow-xs"
              title="Paste from clipboard"
            >
              <Clipboard size={13.5} strokeWidth={2.2} />
              <span>Paste</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                  try {
                    navigator.vibrate(10);
                  } catch {
                    /* ignore */
                  }
                }
                onClear();
              }}
              aria-label="Clear URL"
              className="native-tap flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-text-muted transition-colors duration-150 hover:text-text"
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:ml-3">
          <kbd className="mono-meta hidden shrink-0 items-center gap-1 rounded-sm border border-border/80 bg-surface-sunken/60 px-1.5 py-0.5 text-[11px] text-text-muted lg:flex">
            <span>⌘K</span>
          </kbd>

          <button
            type="submit"
            disabled={busy || !value.trim()}
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate(15);
                } catch {
                  /* ignore */
                }
              }
            }}
            className={`native-tap flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto ${activeBtnTheme.bg} ${activeBtnTheme.border} ${activeBtnTheme.shadow} ${activeBtnTheme.text}`}
          >
            {busy ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                Analyzing…
              </>
            ) : (
              <>
                {detection.status === "detected" ? `Analyze ${detection.platform.name}` : "Analyze"}
                <CornerDownLeft
                  size={13}
                  strokeWidth={2.2}
                  className="hidden sm:inline-block opacity-80"
                />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Status / Detection Row */}
      <div className="mt-3.5 flex items-center justify-center text-center">
        {detection.status === "detected" ? (
          <span className="fade-rise inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 shadow-xs text-[13px] font-medium text-text">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Check size={12} strokeWidth={2.8} aria-hidden="true" />
            </span>
            <PlatformMark platform={detection.platform.id} size={15} />
            <span className="font-semibold text-text">{detection.platform.name}</span>
            <span className="text-text-muted">ready to extract</span>
          </span>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[12.5px] text-text-muted">
            <span className="font-medium text-text-secondary mr-1">Supported:</span>
            {PLATFORMS.slice(0, 8).map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-surface/80 px-2 py-0.5 text-[11px] font-medium text-text-secondary"
              >
                <PlatformMark platform={p.id} size={11} />
                <span>{p.name}</span>
              </span>
            ))}
            <span className="text-[11px] font-mono text-text-muted">+5 more</span>
          </div>
        )}
      </div>
    </div>
  );
}
