import { useState } from "react";
import { Download, Check, X } from "lucide-react";
import { type MediaItem } from "@/lib/downloader";

interface Props {
  item: MediaItem;
  isDownloading: boolean;
  isDownloaded: boolean;
  onDownload: () => void;
}

export function FloatingDownloadFab({
  item,
  isDownloading,
  isDownloaded,
  onDownload,
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const resolutionLabel =
    item.height >= 1080 ? "1080p HD" : item.height >= 720 ? "720p HD" : `${item.height}p`;

  const handleClick = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(14);
      } catch {
        /* ignore */
      }
    }
    onDownload();
  };

  return (
    <div
      role="complementary"
      aria-label="Floating media sniffer download action"
      className="fade-rise fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5"
    >
      <div className="relative group">
        <button
          type="button"
          onClick={handleClick}
          disabled={isDownloading}
          className="native-tap relative flex items-center gap-2.5 rounded-full border border-black dark:border-white/20 bg-zinc-950 dark:bg-black px-4 py-2.5 text-white shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Sniffer Status Beacon */}
          <span className="h-2 w-2 rounded-full bg-[#00c853] shrink-0" />

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c853]">
                Direct Stream
              </span>
              <span className="rounded-xs bg-white/15 px-1 py-0.2 text-[9px] font-mono text-white/90">
                {resolutionLabel}
              </span>
            </div>

            <span className="text-[13px] font-semibold text-white tracking-tight leading-snug">
              {isDownloading
                ? "Packaging Stream…"
                : isDownloaded
                  ? "Downloaded ✓"
                  : `Download ${item.kind === "video" ? "Video" : "Photo"}`}
            </span>
          </div>

          <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#00c853] text-black font-bold shadow-xs transition-transform group-hover:rotate-6">
            {isDownloaded ? (
              <Check size={16} strokeWidth={2.6} />
            ) : isDownloading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <Download size={16} strokeWidth={2.4} />
            )}
          </div>
        </button>
      </div>

      {/* Dismiss Sniffer Button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 dark:border-white/20 bg-zinc-900/90 text-white/70 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
        aria-label="Dismiss download shortcut"
        title="Dismiss"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
