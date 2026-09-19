import { useState } from "react";
import {
  Download,
  Check,
  Copy,
  CheckCheck,
  Film,
  Music,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { MediaFrame } from "./MediaFrame";
import {
  PLATFORM_BY_ID,
  formatBytes,
  formatDuration,
  triggerDownload,
  type PostResult,
  type MediaItem,
} from "@/lib/downloader";

type TabKind = "preview" | "audio" | "cover" | "inspector";

export function Workspace({ result }: { result: PostResult }) {
  const [activeId, setActiveId] = useState(result.media[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<TabKind>("preview");
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadedAll, setDownloadedAll] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const active = result.media.find((m) => m.id === activeId) ?? result.media[0];
  if (!active) return null;
  const platform = PLATFORM_BY_ID[result.platform];

  const handleDownloadSingle = (item = active) => {
    const isHls = item.videoUrl?.includes(".m3u8") || result.platform === "web";
    setDownloadingIds((prev) => [...prev, item.id]);
    triggerDownload(item);

    const waitTime = isHls ? 6000 : 800;
    setTimeout(() => {
      setDownloadingIds((prev) => prev.filter((id) => id !== item.id));
      setDownloadedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    }, waitTime);
  };

  const handleDownloadAll = () => {
    setIsDownloadingAll(true);
    result.media.forEach((m, idx) => {
      setTimeout(() => {
        triggerDownload(m);
        setDownloadedIds((prev) => (prev.includes(m.id) ? prev : [...prev, m.id]));
      }, idx * 300);
    });

    setTimeout(
      () => {
        setIsDownloadingAll(false);
        setDownloadedAll(true);
        setTimeout(() => setDownloadedAll(false), 3000);
      },
      result.media.length * 300 + 400,
    );
  };

  const handleCopyLink = (urlToCopy?: string) => {
    const url = urlToCopy || active.videoUrl || active.previewUrl || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadCover = () => {
    if (!active.previewUrl) return;
    const virtualItem: MediaItem = {
      ...active,
      id: `${active.id}-cover`,
      kind: "image",
      format: "jpg",
      videoUrl: undefined,
      previewUrl: active.previewUrl,
    };
    handleDownloadSingle(virtualItem);
  };

  const isCurrentDownloaded = downloadedIds.includes(active.id);
  const isCurrentDownloading = downloadingIds.includes(active.id);

  // Tab definitions
  const tabs: {
    id: TabKind;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    {
      id: "preview",
      label: active.kind === "video" ? "Video (MP4)" : "Photo",
      icon: Film,
    },
    ...(active.kind === "video"
      ? [
          {
            id: "audio" as TabKind,
            label: "Audio Track",
            icon: Music,
          },
        ]
      : []),
    ...(active.previewUrl
      ? [
          {
            id: "cover" as TabKind,
            label: "Cover Art",
            icon: ImageIcon,
          },
        ]
      : []),
    {
      id: "inspector",
      label: "Inspector",
      icon: Info,
    },
  ];

  return (
    <section
      aria-label="Media workspace"
      className="fade-rise relative overflow-hidden rounded-xs border-2 sm:border-[3px] border-black bg-card text-foreground shadow-2xl"
    >
      {/* 1. Header Bar */}
      <div className="relative flex h-14 select-none items-center justify-between border-b-2 border-black bg-muted px-4 sm:px-6">
        {/* Left: Window Dots */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-black bg-[#FF5F56] shadow-2xs" />
          <div className="h-3.5 w-3.5 rounded-full border-2 border-black bg-primary shadow-2xs" />
          <div className="h-3.5 w-3.5 rounded-full border-2 border-black bg-[#27C93F] shadow-2xs" />
        </div>

        {/* Center: Title */}
        <div className="flex items-center gap-2 max-w-[60%] truncate pointer-events-none mx-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          <PlatformMark platform={platform.id} size={15} className="shrink-0" />
          <span className="font-head text-sm font-bold text-foreground truncate">
            {active.title || result.caption || `${platform.name} Media`}
          </span>
          <span className="hidden md:inline font-sans text-xs text-muted-foreground truncate">
            — {result.author || platform.name}
          </span>
        </div>

        {/* Right: Direct Stream Badge */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-xs border-2 border-black bg-primary px-2.5 py-1 font-head text-xs text-black shadow-xs">
            <span className="h-2 w-2 rounded-full border border-black bg-[#27C93F] animate-pulse" />
            DIRECT STREAM
          </span>
        </div>
      </div>

      {/* 2. Neobrutalist Tab Bar */}
      <div className="relative flex items-center justify-between flex-wrap gap-3 border-b-2 border-black bg-background p-3 sm:px-6">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xs border-2 border-black px-3.5 py-1.5 font-head text-xs font-bold transition-all duration-150 ${
                  isSelected
                    ? "bg-primary text-black shadow-sm -translate-y-0.5"
                    : "bg-card text-foreground shadow-xs hover:bg-muted hover:-translate-y-0.5"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-black" : "text-foreground"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Batch Download (if multiple assets) */}
        {result.media.length > 1 && (
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={isDownloadingAll}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xs border-2 border-black bg-primary px-4 font-head text-xs font-bold text-black shadow-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            {downloadedAll ? (
              <>
                <CheckCheck size={14} className="text-black" />
                ALL {result.media.length} SAVED
              </>
            ) : isDownloadingAll ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-black" />
                SAVING ({result.media.length})…
              </>
            ) : (
              <>
                <Download size={14} />
                DOWNLOAD ALL ({result.media.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* 3. Main Workspace Area: Dual Equal-Height Cards */}
      <div className="grid items-stretch gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Dynamic Tab Canvas */}
        <div className="flex h-full w-full items-stretch justify-center">
          {/* Tab 1: Video / Photo Preview */}
          {activeTab === "preview" && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xs border-2 border-black bg-card p-4 sm:p-6 shadow-md">
              <div className="w-full max-w-[640px] overflow-hidden">
                <MediaFrame item={active} />
              </div>
            </div>
          )}

          {/* Tab 2: Audio Track Player */}
          {activeTab === "audio" && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xs border-2 border-black bg-card p-8 text-center shadow-md">
              {active.previewUrl ? (
                <div className="relative mb-5 h-36 w-36 overflow-hidden rounded-xs border-2 border-black shadow-md">
                  <img
                    src={active.previewUrl}
                    alt={active.title || "Audio Track"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xs border-2 border-black bg-primary text-black shadow-xs">
                      <Music size={24} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-xs border-2 border-black bg-primary text-black shadow-md">
                  <Music size={40} />
                </div>
              )}

              <h3 className="font-head text-lg font-bold text-foreground">
                {active.title || result.caption || "Synchronized Audio Track"}
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{result.author}</p>

              {/* Sound visualizer wave bars */}
              <div className="mt-6 flex h-10 items-center gap-1.5 p-2 rounded-xs border-2 border-black bg-muted">
                {[16, 28, 20, 34, 18, 26, 32, 22, 14, 26, 34, 24, 18, 28, 16].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-xs border border-black bg-primary"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3 text-xs font-head text-foreground">
                <span className="rounded-xs border border-black bg-muted px-2 py-1">AAC 48kHz</span>
                <span className="rounded-xs border border-black bg-muted px-2 py-1">
                  Stereo 2.0
                </span>
                {active.durationSeconds && (
                  <span className="rounded-xs border border-black bg-muted px-2 py-1">
                    {formatDuration(active.durationSeconds)}
                  </span>
                )}
              </div>

              <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(active)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xs border-2 border-black bg-primary px-4 font-head text-sm font-bold text-black shadow-md transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <Download size={16} />
                  Download Audio Stream{active.bytes > 0 ? ` (${formatBytes(active.bytes)})` : ""}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Cover Art HD */}
          {activeTab === "cover" && active.previewUrl && (
            <div className="flex h-full w-full flex-col items-center justify-between rounded-xs border-2 border-black bg-card p-6 shadow-md">
              <div className="relative flex max-h-[380px] w-full flex-1 items-center justify-center overflow-hidden rounded-xs border-2 border-black">
                <img
                  src={active.previewUrl}
                  alt="Cover Art Full Resolution"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-5 flex w-full items-center justify-between px-2">
                <span className="font-head text-xs text-foreground">
                  {active.width} × {active.height} · High Resolution Poster
                </span>
                <button
                  type="button"
                  onClick={handleDownloadCover}
                  className="inline-flex h-10 items-center gap-2 rounded-xs border-2 border-black bg-primary px-4 font-head text-xs font-bold text-black shadow-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md active:shadow-none"
                >
                  <Download size={14} />
                  Save Image
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Inspector View */}
          {activeTab === "inspector" && (
            <div className="flex h-full w-full flex-col justify-between rounded-xs border-2 border-black bg-card p-6 shadow-md">
              <div>
                <div className="flex items-center gap-2.5 border-b-2 border-black pb-3">
                  <Info size={18} className="text-black" />
                  <h4 className="font-head text-base font-bold text-foreground">
                    STREAM SPECIFICATIONS
                  </h4>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="font-head text-xs uppercase tracking-wider text-muted-foreground">
                      General Info
                    </p>
                    <div className="mt-2 space-y-2 text-sm font-medium">
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Kind</span>
                        <span className="font-head text-foreground">
                          {active.kind.toUpperCase()} Media
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Container</span>
                        <span className="font-head text-foreground">
                          {active.format.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Published</span>
                        <span className="text-foreground">{result.postedAt}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Source Platform</span>
                        <span className="font-head text-foreground">{platform.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="font-head text-xs uppercase tracking-wider text-muted-foreground">
                      Video Attributes
                    </p>
                    <div className="mt-2 space-y-2 text-sm font-medium">
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className="font-head text-foreground">
                          {active.width} × {active.height}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Aspect Ratio</span>
                        <span className="text-foreground">
                          {active.width >= active.height ? "16:9 (Landscape)" : "9:16 (Vertical)"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Codec</span>
                        <span className="text-foreground">H.264 / AVC Progressive</span>
                      </div>
                      {active.durationSeconds && (
                        <div className="flex justify-between border-b border-black/10 pb-1">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-head text-foreground">
                            {formatDuration(active.durationSeconds)} ({active.durationSeconds}s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="font-head text-xs uppercase tracking-wider text-muted-foreground">
                      Storage & Network
                    </p>
                    <div className="mt-2 space-y-2 text-sm font-medium">
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-head text-foreground">
                          {formatBytes(active.bytes)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 pb-1">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="text-foreground">Direct Stream Attachment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t-2 border-black pt-3 font-head text-xs">
                <span>STATUS: VERIFIED</span>
                <span className="inline-flex items-center gap-1 text-[#16a34a]">
                  ● READY TO DOWNLOAD
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Download Sidebar */}
        <aside className="flex h-full w-full flex-col justify-between rounded-xs border-2 border-black bg-card p-5 sm:p-6 shadow-md">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Download size={18} className="text-black" />
                <h4 className="font-head text-base font-bold text-foreground">DOWNLOAD MEDIA</h4>
              </div>
              <span className="rounded-xs border-2 border-black bg-primary px-2 py-0.5 font-head text-xs text-black shadow-2xs">
                ACTIVE
              </span>
            </div>

            {/* Caption / Notes */}
            {result.caption && (
              <div className="mt-4 rounded-xs border-2 border-black bg-muted p-3 shadow-xs">
                <p className="line-clamp-3 text-xs font-medium leading-relaxed text-foreground">
                  "{result.caption}"
                </p>
              </div>
            )}

            {/* Spec rows */}
            <dl className="mt-4 space-y-2.5 text-sm font-medium">
              {[
                ["Format", active.format.toUpperCase()],
                ["Resolution", `${active.width} × ${active.height}`],
                ["File Size", formatBytes(active.bytes)],
                ...(active.durationSeconds
                  ? ([["Duration", formatDuration(active.durationSeconds)]] as [string, string][])
                  : []),
                ["Media Type", active.kind === "video" ? "Video (H.264)" : "Image (JPEG)"],
                ["Source", "Public CDN Stream"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-1"
                >
                  <dt className="text-muted-foreground text-xs">{k}</dt>
                  <dd className="font-head text-xs text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Action Center */}
          <div className="mt-6 space-y-3 border-t-2 border-black pt-4">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => handleDownloadSingle(active)}
              disabled={isCurrentDownloading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xs border-2 border-black bg-primary px-4 font-head text-sm font-bold text-black shadow-md transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {isCurrentDownloading ? (
                <>
                  <span className="h-2.5 w-2.5 animate-ping rounded-full bg-black" />
                  {active.videoUrl?.includes(".m3u8") || result.platform === "web"
                    ? "Packaging HD Video..."
                    : "Preparing file..."}
                </>
              ) : isCurrentDownloaded ? (
                <>
                  <Check size={18} strokeWidth={2.5} className="text-black" />
                  DOWNLOAD STARTED
                </>
              ) : (
                <>
                  <Download size={18} strokeWidth={2.2} />
                  DOWNLOAD {active.kind === "video" ? "VIDEO" : "IMAGE"}
                  {active.bytes > 0 ? ` (${formatBytes(active.bytes)})` : ""}
                </>
              )}
            </button>

            {isCurrentDownloading &&
              (active.videoUrl?.includes(".m3u8") || result.platform === "web") && (
                <p className="text-center font-head text-xs text-muted-foreground animate-pulse">
                  Packaging video fragments into MP4 container. The download will start shortly.
                </p>
              )}

            {/* Secondary Action */}
            <button
              type="button"
              onClick={() => handleCopyLink()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xs border-2 border-black bg-card px-4 font-head text-xs font-bold text-foreground shadow-xs transition-all hover:bg-muted hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:shadow-none"
            >
              {copiedLink ? (
                <>
                  <Check size={15} strokeWidth={2.5} className="text-[#16a34a]" />
                  COPIED TO CLIPBOARD
                </>
              ) : (
                <>
                  <Copy size={15} strokeWidth={2.2} />
                  COPY DIRECT MEDIA URL
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* 4. Filmstrip (for carousels) */}
      {result.media.length > 1 && (
        <div className="border-t-2 border-black bg-muted/60 p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-head text-xs uppercase tracking-wider text-foreground">
              Photos & Clips Filmstrip ({result.media.length})
            </span>
            <span className="font-head text-xs text-muted-foreground">Select item to inspect</span>
          </div>

          <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {result.media.map((m, idx) => {
              const selected = m.id === active.id;
              const isDownloaded = downloadedIds.includes(m.id);

              return (
                <li key={m.id}>
                  <div
                    onClick={() => {
                      setActiveId(m.id);
                      setActiveTab("preview");
                    }}
                    className={`group cursor-pointer overflow-hidden rounded-xs border-2 border-black transition-all duration-150 ${
                      selected
                        ? "bg-accent shadow-md -translate-y-0.5 ring-2 ring-black"
                        : "bg-card shadow-xs hover:-translate-y-0.5 hover:shadow-sm"
                    }`}
                  >
                    <div className="h-28 overflow-hidden bg-black">
                      <MediaFrame item={m} compact />
                    </div>

                    <div className="flex items-center justify-between p-3 border-t-2 border-black">
                      <div className="min-w-0">
                        <p className="font-head text-xs font-bold text-foreground truncate">
                          #{idx + 1} · {m.format.toUpperCase()}
                        </p>
                        <p className="font-sans text-[11px] font-medium text-muted-foreground">
                          {formatBytes(m.bytes)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(m);
                        }}
                        aria-label={`Download item ${idx + 1}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs border-2 border-black bg-primary text-black transition-all hover:bg-primary-hover shadow-xs active:shadow-none"
                      >
                        {isDownloaded ? (
                          <Check size={14} strokeWidth={2.5} />
                        ) : (
                          <Download size={14} strokeWidth={2.2} />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
