import { Share2, PlusSquare, X, CheckCircle2, Download } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InstallAppSheet({ open, onClose }: Props) {
  const { hasPrompt, isIOS, isInstalled, promptInstall, shareApp, canShare } = usePwaInstall();

  if (!open) return null;

  const handleInstallClick = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {
        /* ignore */
      }
    }
    const success = await promptInstall();
    if (success) {
      onClose();
    }
  };

  const handleShareClick = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        /* ignore */
      }
    }
    await shareApp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border-t border-black/15 dark:border-white/15 bg-surface dark:bg-[#121214] p-5 pb-safe shadow-[0_-12px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 text-text">
        {/* Handle pill for native drawer feel */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Link 2 Download"
              className="h-12 w-12 rounded-xl border border-black/15 dark:border-white/15 object-contain shadow-xs select-none"
            />
            <div>
              <h3 className="text-[17px] font-semibold text-text">Link 2 Download App</h3>
              <p className="text-[13px] text-text-secondary">
                {isInstalled ? "App is already installed" : "Install on your home screen"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="native-tap rounded-full p-1.5 text-text-muted hover:bg-surface-sunken hover:text-text active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {isInstalled ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>You're already running the standalone mobile app experience!</span>
            </div>
          ) : hasPrompt ? (
            <div className="space-y-3">
              <p className="text-[13.5px] leading-relaxed text-text-secondary">
                Add Link 2 Download to your device for instant offline launch, direct OS sharing
                from Instagram & YouTube, and zero browser bars.
              </p>
              <button
                onClick={handleInstallClick}
                className="native-tap flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-[15px] font-semibold text-white shadow-md hover:bg-black active:scale-[0.98] dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                <Download size={18} />
                Install App Now
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-3">
              <p className="text-[13.5px] leading-relaxed text-text-secondary">
                Install Link 2 Download on your iPhone or iPad for the full native app experience:
              </p>
              <div className="space-y-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] p-3.5 text-[13px] text-text">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[11px] font-bold text-white dark:text-zinc-900">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button{" "}
                    <Share2 size={14} className="inline mx-1 text-text" /> in Safari's bottom
                    toolbar.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[11px] font-bold text-white dark:text-zinc-900">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>{" "}
                    <PlusSquare size={14} className="inline mx-1 text-text" />.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13.5px] leading-relaxed text-text-secondary">
                To install, open your browser menu (<span className="font-mono font-bold">⋮</span>)
                and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
              </p>
            </div>
          )}

          {canShare && (
            <button
              onClick={handleShareClick}
              className="native-tap flex w-full items-center justify-center gap-2 rounded-xl border border-black/15 dark:border-white/15 bg-surface dark:bg-white/[0.06] py-2.5 text-[14px] font-semibold text-text hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]"
            >
              <Share2 size={16} />
              Share Link 2 Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
