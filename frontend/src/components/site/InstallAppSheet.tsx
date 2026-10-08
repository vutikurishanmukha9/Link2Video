import { useState } from "react";
import { Share2, PlusSquare, X, CheckCircle2, Download, Copy, Smartphone } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const APK_DOWNLOAD_URL =
  "https://github.com/vutikurishanmukha9/Link2Video/releases/download/v1.0/Link2Video-v1.0.apk";

export function InstallAppSheet({ open, onClose }: Props) {
  const { hasPrompt, isIOS, isInstalled, promptInstall } = usePwaInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!open) return null;

  const handleDownloadClick = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {
        /* ignore */
      }
    }
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 3000);
  };

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

  const handleCopyLink = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        /* ignore */
      }
    }
    try {
      await navigator.clipboard.writeText(APK_DOWNLOAD_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      /* ignore */
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
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Link2Video - Fast Media Downloader",
          text: "Download Link2Video native Android app (.apk) directly:",
          url: APK_DOWNLOAD_URL,
        });
        return;
      } catch {
        /* ignore */
      }
    }
    await handleCopyLink();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-t-3xl border-t border-black/15 dark:border-white/15 bg-surface dark:bg-[#121214] p-5 pb-safe shadow-[0_-12px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 text-text max-h-[90vh] overflow-y-auto">
        {/* Handle pill for native drawer feel */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Link2Video"
              className="h-12 w-12 rounded-xl border border-black/15 dark:border-white/15 object-contain shadow-xs select-none"
            />
            <div>
              <h3 className="text-[17px] font-semibold text-text">Link2Video Mobile App</h3>
              <p className="text-[13px] text-text-secondary">
                Direct Android APK & home screen app
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

        <div className="mt-4 space-y-3.5">
          {/* Native Android APK Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Smartphone size={15} />
              </span>
              <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-400">
                Direct Android APK (Recommended)
              </span>
              <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300">
                v1.0 • 4.3 MB
              </span>
            </div>
            <p className="text-[12.5px] text-text-secondary leading-relaxed">
              1-tap direct download for any Android device. No app store needed, no ads, runs fast & offline.
            </p>

            {/* Prominent Direct APK Download CTA */}
            <a
              href={APK_DOWNLOAD_URL}
              download="Link2Video-v1.0.apk"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownloadClick}
              className="native-tap flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-[14px] font-bold text-white shadow-md active:scale-[0.98] transition-all"
            >
              <Download size={17} />
              <span>{downloadStarted ? "Starting APK Download..." : "Download Link2Video (.apk)"}</span>
            </a>

            {/* Secondary actions: Copy link & Share */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleCopyLink}
                className="native-tap flex items-center justify-center gap-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-surface dark:bg-white/[0.06] px-3 py-2 text-[12.5px] font-medium text-text hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Link Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareClick}
                className="native-tap flex items-center justify-center gap-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-surface dark:bg-white/[0.06] px-3 py-2 text-[12.5px] font-medium text-text hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]"
              >
                <Share2 size={14} />
                <span>Share App Link</span>
              </button>
            </div>
          </div>

          {/* Web App / PWA install fallback */}
          {isInstalled ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>You're already running the standalone mobile app experience!</span>
            </div>
          ) : hasPrompt ? (
            <div className="space-y-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-3.5">
              <p className="text-[12.5px] text-text-secondary">
                Or add to home screen directly without downloading files:
              </p>
              <button
                onClick={handleInstallClick}
                className="native-tap flex w-full items-center justify-center gap-2 rounded-xl border border-black/15 dark:border-white/15 bg-surface dark:bg-white/[0.06] py-2 text-[13px] font-semibold text-text hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]"
              >
                <PlusSquare size={16} />
                Add Web App to Home Screen
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.03] p-3 text-[12.5px] text-text">
              <p className="font-semibold text-text">iPhone & iPad (iOS):</p>
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[10px] font-bold text-white dark:text-zinc-900">
                  1
                </span>
                <span>
                  Tap <strong>Share</strong>{" "}
                  <Share2 size={13} className="inline mx-0.5 text-text" /> in Safari's toolbar.
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[10px] font-bold text-white dark:text-zinc-900">
                  2
                </span>
                <span>
                  Tap <strong>Add to Home Screen</strong>{" "}
                  <PlusSquare size={13} className="inline mx-0.5 text-text" />.
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
