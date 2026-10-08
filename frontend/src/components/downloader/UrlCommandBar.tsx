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
        className="group relative flex flex-col gap-2 rounded-2xl border border-black dark:border-white/15 ring-1 ring-black/15 dark:ring-white/10 bg-surface shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md p-2 transition-all duration-200 focus-within:border-black dark:focus-within:border-white/40 focus-within:ring-4 focus-within:ring-black/10 dark:focus-within:ring-white/10 sm:h-16 sm:flex-row sm:items-center sm:gap-0 sm:p-0 sm:pl-4 sm:pr-2"
      >
        <label htmlFor="post-url" className="sr-only">
          Public post URL
        </label>

        <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-0">
          <Link2
            size={18}
            strokeWidth={1.8}
            className="shrink-0 text-text-muted transition-colors group-focus-within:text-black dark:group-focus-within:text-white"
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
            placeholder="Paste Instagram, TikTok, X, Pinterest, Threads, Twitch or media URL"
            className="h-11 w-full min-w-0 bg-transparent text-[16px] text-text outline-none placeholder:text-text-muted sm:h-full sm:text-[15px]"
          />

          {!value ? (
            <button
              type="button"
              onClick={handlePaste}
              aria-label="Paste from clipboard"
              className="native-tap flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-zinc-800/5 dark:bg-white/10 px-3 text-[12.5px] font-semibold text-text transition-all duration-150 hover:bg-zinc-800/10 dark:hover:bg-white/15 hover:border-black/30 dark:hover:border-white/30 active:scale-95 shadow-xs"
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
          <kbd className="mono-meta hidden shrink-0 items-center gap-1 rounded-sm border border-black/15 dark:border-white/15 bg-surface-sunken/60 px-1.5 py-0.5 text-[11px] text-text-muted lg:flex">
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
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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

      {/* Mobile Quick Paste Helper */}
      {!value && !busy && (
        <div className="flex sm:hidden items-center justify-center mt-2">
          <button
            type="button"
            onClick={handlePaste}
            className="native-tap flex items-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 bg-surface px-3.5 py-1 text-[11.5px] font-semibold text-text shadow-xs active:scale-95"
          >
            <Clipboard size={12} className="text-accent" />
            <span>Tap to paste copied link</span>
          </button>
        </div>
      )}

      {/* Status / Detection Row */}
      <div className="mt-3.5 flex items-center justify-center text-center">
        {detection.status === "detected" ? (
          <span className="fade-rise inline-flex items-center gap-2 rounded-full border border-black/15 bg-surface px-3 py-1 shadow-xs text-[13px] font-medium text-text">
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
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.vibrate) {
                    try {
                      navigator.vibrate(8);
                    } catch {
                      /* ignore */
                    }
                  }
                  const target = document.getElementById("platforms");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="native-tap inline-flex items-center gap-1 rounded-md border border-black/15 bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary transition-all hover:border-black hover:text-text active:scale-95"
                title={`View ${p.name} support`}
              >
                <PlatformMark platform={p.id} size={11} />
                <span>{p.name}</span>
              </button>
            ))}
            <a
              href="#platforms"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById("platforms");
                if (target) target.scrollIntoView({ behavior: "smooth" });
              }}
              className="native-tap rounded-md px-1.5 py-0.5 text-[11px] font-mono text-text-muted transition-colors hover:text-text"
            >
              +5 more
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
