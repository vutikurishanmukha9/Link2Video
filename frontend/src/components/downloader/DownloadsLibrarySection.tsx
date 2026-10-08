import { useState } from "react";
import {
  Download,
  Trash2,
  FolderOpen,
  Clock,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { formatBytes, triggerDownload, type MediaItem } from "@/lib/downloader";
import { useDownloadHistory, type DownloadHistoryEntry } from "@/hooks/useDownloadHistory";

function timeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function DownloadsLibrarySection() {
  const { history, removeHistoryItem, clearHistory } = useDownloadHistory();
  const [filter, setFilter] = useState<"all" | "video" | "image">("all");
  const [reDownloadedId, setReDownloadedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    if (filter === "video") return item.kind === "video";
    if (filter === "image") return item.kind === "image";
    return true;
  });

  const handleReDownload = (entry: DownloadHistoryEntry) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {
        /* ignore */
      }
    }
    const mediaItem: MediaItem = {
      id: entry.mediaId,
      kind: entry.kind,
      format: entry.format,
      previewUrl: entry.previewUrl,
      videoUrl: entry.videoUrl,
      title: entry.title,
      width: 1080,
      height: 1920,
      bytes: entry.bytes,
    };
    triggerDownload(mediaItem);
    setReDownloadedId(entry.id);
    setTimeout(() => setReDownloadedId(null), 2000);
  };

  const handleShare = async (entry: DownloadHistoryEntry) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: entry.title,
          text: `Downloaded with Link 2 Download`,
          url: entry.videoUrl || entry.previewUrl || window.location.href,
        });
      } catch {
        /* ignore */
      }
    }
  };

  const handleScrollToCommandBar = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const input = document.getElementById("post-url");
    if (input) {
      setTimeout(() => input.focus(), 300);
    }
  };

  return (
    <section
      id="library"
      aria-labelledby="library-heading"
      className="shell mt-12 scroll-mt-16 sm:mt-16"
    >
      {/* Header with live item count & clear button */}
      <div className="flex flex-col gap-2.5 border-b border-border/80 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2
              id="library-heading"
              className="text-[20px] font-semibold tracking-tight text-text sm:text-[26px]"
            >
              Media Library
            </h2>
            <span className="mono-meta inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-text shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {history.length} {history.length === 1 ? "File" : "Files"}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary sm:text-[14px]">
            Private offline session storage on your device. Zero telemetry, zero cloud uploads.
          </p>
        </div>

        {/* Clear action */}
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear all download records from this device?")) {
                  clearHistory();
                }
              }}
              className="native-tap inline-flex items-center gap-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-danger hover:text-danger active:scale-95 shadow-xs"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Chips (if items exist) */}
      {history.length > 0 && (
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              { id: "all", label: `All Files (${history.length})` },
              {
                id: "video",
                label: `Videos (${history.filter((i) => i.kind === "video").length})`,
              },
              {
                id: "image",
                label: `Photos (${history.filter((i) => i.kind === "image").length})`,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`native-tap flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all duration-150 active:scale-95 ${
                filter === f.id
                  ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                  : "border border-black/15 dark:border-white/15 bg-surface text-text-secondary hover:border-black dark:hover:border-white hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {history.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-black dark:border-white/15 ring-1 ring-black/15 dark:ring-white/10 bg-surface p-8 sm:p-12 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/10 text-text mb-4 shadow-xs">
            <FolderOpen size={30} strokeWidth={1.8} />
          </div>
          <h3 className="text-[17px] sm:text-[18px] font-bold text-text">
            Your Media Library is Empty
          </h3>
          <p className="mt-2 max-w-[460px] text-[13.5px] leading-relaxed text-text-secondary">
            Whenever you extract and download videos, clips, or photos from Instagram, TikTok, or X,
            they will appear here for 1-tap re-downloading and playback.
          </p>
          <button
            type="button"
            onClick={handleScrollToCommandBar}
            className="native-tap mt-5 inline-flex items-center gap-2 rounded-xl border border-black dark:border-white/20 bg-zinc-900 px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 active:scale-95"
          >
            <Download size={15} />
            <span>Try Downloading a Link</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((item) => {
            const isReDownloaded = reDownloadedId === item.id;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-black dark:border-white/15 ring-1 ring-black/15 dark:ring-white/10 bg-surface p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-black/35"
              >
                {/* Top: Thumbnail & Format tag */}
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/15 dark:border-white/15 bg-black/10">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-muted">
                        {item.kind === "video" ? <Film size={22} /> : <ImageIcon size={22} />}
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded-sm bg-black/80 px-1 text-[9px] font-bold text-white uppercase backdrop-blur-xs">
                      {item.format}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <PlatformMark platform={item.platform} size={13} className="shrink-0" />
                      <span className="mono-meta text-[11px] font-bold uppercase text-text-muted">
                        {item.platform}
                      </span>
                      <span className="text-text-muted text-[10px]">·</span>
                      <span className="mono-meta text-[11px] text-text-muted flex items-center gap-0.5">
                        <Clock size={10} />
                        {timeAgo(item.downloadedAt)}
                      </span>
                    </div>

                    <h4 className="mt-1 text-[13.5px] font-semibold text-text line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-text-secondary">
                      <span>{item.bytes > 0 ? formatBytes(item.bytes) : "Direct Stream"}</span>
                      <span>·</span>
                      <span className="capitalize">{item.kind}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Action buttons */}
                <div className="mt-4 flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-3">
                  <div className="flex items-center gap-1.5">
                    {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                      <button
                        type="button"
                        onClick={() => handleShare(item)}
                        className="native-tap flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 dark:border-white/15 bg-surface text-text-secondary transition-colors hover:border-black hover:text-text active:scale-95"
                        title="Share media"
                        aria-label="Share media"
                      >
                        <Share2 size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeHistoryItem(item.id)}
                      className="native-tap flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 dark:border-white/15 bg-surface text-text-muted transition-colors hover:border-danger hover:text-danger active:scale-95"
                      title="Remove from history"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReDownload(item)}
                    className={`native-tap flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-all active:scale-95 ${
                      isReDownloaded
                        ? "border border-[#27C93F] bg-[#27C93F]/10 text-[#27C93F]"
                        : "border border-black dark:border-white/20 bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-xs"
                    }`}
                  >
                    {isReDownloaded ? (
                      <>
                        <CheckCircle2 size={13} strokeWidth={2.4} />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} strokeWidth={2} />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
