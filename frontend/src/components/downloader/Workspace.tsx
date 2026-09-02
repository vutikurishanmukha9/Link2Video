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
  ExternalLink,
  Sparkles,
  Layers,
  Volume2,
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

type AppleTab = "preview" | "audio" | "cover" | "inspector";

export function Workspace({ result }: { result: PostResult }) {
  const [activeId, setActiveId] = useState(result.media[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<AppleTab>("preview");
  const [trafficHover, setTrafficHover] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadedAll, setDownloadedAll] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const active = result.media.find((m) => m.id === activeId) ?? result.media[0];
  if (!active) return null;
  const platform = PLATFORM_BY_ID[result.platform];

  const handleDownloadSingle = (item = active, customFilename?: string) => {
    setDownloadingIds((prev) => [...prev, item.id]);
    triggerDownload(item);

    setTimeout(() => {
      setDownloadingIds((prev) => prev.filter((id) => id !== item.id));
      setDownloadedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    }, 600);
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
    id: AppleTab;
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
            id: "audio" as AppleTab,
            label: "Audio Track",
            icon: Music,
          },
        ]
      : []),
    ...(active.previewUrl
      ? [
          {
            id: "cover" as AppleTab,
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
      className="fade-rise relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-[#121316]/95 text-white shadow-[0_32px_100px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. macOS Window Header Chrome (QuickTime / Finder Window)     */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex h-12 select-none items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-3 sm:px-4">
        {/* Left: macOS Window Traffic Light Buttons */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 shrink-0"
          onMouseEnter={() => setTrafficHover(true)}
          onMouseLeave={() => setTrafficHover(false)}
        >
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F56] border border-black/20 shadow-xs">
            {trafficHover && (
              <span className="text-[8px] font-bold leading-none text-black/60">×</span>
            )}
          </div>
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FFBD2E] border border-black/20 shadow-xs">
            {trafficHover && (
              <span className="text-[8px] font-bold leading-none text-black/60">−</span>
            )}
          </div>
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#27C93F] border border-black/20 shadow-xs">
            {trafficHover && (
              <span className="text-[7px] font-bold leading-none text-black/60">+</span>
            )}
          </div>
        </div>

        {/* Center: macOS Window Document Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[65%] sm:max-w-[50%] md:max-w-[60%] truncate pointer-events-none mx-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          <PlatformMark platform={platform.id} size={13} className="shrink-0 text-white/70" />
          <span className="text-[12px] sm:text-[13px] font-medium tracking-tight text-white/90 truncate">
            {active.title || result.caption || `${platform.name} Media`}
          </span>
          <span className="hidden md:inline text-[12px] text-white/40 font-normal truncate">
            — {result.author || platform.name}
          </span>
        </div>

        {/* Right: Status Pill Badge (hidden on smallest screens to protect title space) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#27C93F] animate-pulse" />
            Direct CDN Stream
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Apple Segmented Control (The "Apple Tab" Bar)             */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex items-center justify-center border-b border-white/[0.08] bg-black/20 px-3 py-2.5 sm:px-5 sm:py-3">
        {/* The Apple Pill Tabs (Center Justified, Scrollable on Mobile) */}
        <div className="inline-flex max-w-full items-center overflow-x-auto rounded-xl border border-white/[0.08] bg-black/40 p-1 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all duration-150 sm:px-3.5 sm:text-[12.5px] ${
                  isSelected
                    ? "border border-white/10 bg-white/[0.14] text-white shadow-xs backdrop-blur-md"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={13} className={isSelected ? "text-white" : "text-white/50"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Batch Download (if multiple assets) - Anchored to right */}
        {result.media.length > 1 && (
          <div className="absolute right-3 hidden sm:block md:right-5">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.06] px-3 text-[12px] font-medium text-white/90 transition-all hover:bg-white/[0.10] active:scale-[0.98] disabled:opacity-50"
            >
              {downloadedAll ? (
                <>
                  <CheckCheck size={13} className="text-[#27C93F]" />
                  All {result.media.length} files saved
                </>
              ) : isDownloadingAll ? (
                <>
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#0071E3]" />
                  Saving ({result.media.length})...
                </>
              ) : (
                <>
                  <Download size={13} />
                  Download All ({result.media.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Main Workspace Area: Dual Equal-Height Closed Apple Cards   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid items-stretch gap-4 p-4 sm:gap-5 sm:p-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Dynamic Apple Tab Canvas (Closed Card) */}
        <div className="flex h-full w-full items-stretch justify-center">
          {/* Tab 1: Video / Photo Preview */}
          {activeTab === "preview" && (
            <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0A0A0C] p-2.5 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-white/[0.10]">
                <MediaFrame item={active} />
              </div>
            </div>
          )}

          {/* Tab 2: Audio Track Player */}
          {activeTab === "audio" && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 text-center shadow-2xl backdrop-blur-xl">
              {/* Artwork / Poster thumbnail */}
              {active.previewUrl ? (
                <div className="relative mb-5 h-36 w-36 overflow-hidden rounded-2xl border border-white/15 shadow-xl">
                  <img
                    src={active.previewUrl}
                    alt={active.title || "Audio Track"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                      <Music size={20} className="text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
                  <Music size={36} className="text-white/60" />
                </div>
              )}

              <h3 className="text-[17px] font-medium tracking-tight text-white">
                {active.title || result.caption || "Synchronized Audio Track"}
              </h3>
              <p className="mt-1 text-[13px] text-white/50">{result.author}</p>

              {/* Sound visualizer wave bars */}
              <div className="mt-6 flex h-8 items-center gap-1">
                {[16, 28, 20, 32, 18, 26, 30, 22, 14, 26, 32, 24, 18, 28, 16].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-[#0071E3] transition-all duration-300"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3 text-[12px] text-white/60">
                <span className="rounded-md bg-white/[0.06] px-2 py-1 font-mono">AAC 48kHz</span>
                <span>Stereo 2.0</span>
                {active.durationSeconds && (
                  <span className="font-mono">{formatDuration(active.durationSeconds)}</span>
                )}
              </div>

              <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(active)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-4 text-[13.5px] font-medium text-white shadow-[0_4px_16px_rgba(0,113,227,0.4)] transition-all hover:bg-[#0077ED] active:scale-[0.98]"
                >
                  <Download size={15} />
                  Download Audio Stream ({formatBytes(active.bytes)})
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Cover Art HD */}
          {activeTab === "cover" && active.previewUrl && (
            <div className="flex h-full w-full flex-col items-center justify-between rounded-2xl border border-white/[0.12] bg-[#0A0A0C] p-6 shadow-2xl">
              <div className="relative flex max-h-[380px] w-full flex-1 items-center justify-center overflow-hidden rounded-xl">
                <img
                  src={active.previewUrl}
                  alt="Cover Art Full Resolution"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-4 flex w-full items-center justify-between px-2">
                <span className="font-mono text-[12px] text-white/60">
                  {active.width} × {active.height} · High Resolution Poster
                </span>
                <button
                  type="button"
                  onClick={handleDownloadCover}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3.5 text-[12.5px] font-medium text-white transition-all hover:bg-white/15 active:scale-[0.98]"
                >
                  <Download size={13} />
                  Save Image
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Inspector Detailed View (Equal Height Closed Card) */}
          {activeTab === "inspector" && (
            <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.12] bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3.5">
                  <Info size={16} className="text-[#0071E3]" />
                  <h4 className="text-[14px] font-medium text-white">Stream Specifications</h4>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      General
                    </p>
                    <div className="mt-2 space-y-1.5 text-[12.5px]">
                      <div className="flex justify-between text-white/70">
                        <span>Kind</span>
                        <span className="font-mono text-white">
                          {active.kind.toUpperCase()} Media
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Container</span>
                        <span className="font-mono text-white">{active.format.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Published</span>
                        <span className="text-white">{result.postedAt}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Source Platform</span>
                        <span className="text-white">{platform.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Video Attributes
                    </p>
                    <div className="mt-2 space-y-1.5 text-[12.5px]">
                      <div className="flex justify-between text-white/70">
                        <span>Dimensions</span>
                        <span className="font-mono text-white">
                          {active.width} × {active.height}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Aspect Ratio</span>
                        <span className="font-mono text-white">
                          {active.width >= active.height ? "16:9 (Landscape)" : "9:16 (Vertical)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Codec</span>
                        <span className="font-mono text-white">H.264 / AVC Progressive</span>
                      </div>
                      {active.durationSeconds && (
                        <div className="flex justify-between text-white/70">
                          <span>Duration</span>
                          <span className="font-mono text-white">
                            {formatDuration(active.durationSeconds)} ({active.durationSeconds}s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Storage & Network
                    </p>
                    <div className="mt-2 space-y-1.5 text-[12.5px]">
                      <div className="flex justify-between text-white/70">
                        <span>File Size</span>
                        <span className="font-mono text-white">{formatBytes(active.bytes)}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Delivery</span>
                        <span className="text-white">Chunked Stream / Direct Attachment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-[11px] text-white/40">
                <span>STATUS: VERIFIED STREAM</span>
                <span className="font-sans font-medium text-[#27C93F]">● Ready to download</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Download Tab (Closed Card, Exact Equal Height) */}
        <aside className="flex h-full w-full flex-col justify-between rounded-2xl border border-white/[0.12] bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
          <div>
            {/* Header: Tab title */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-2">
                <Download size={16} className="text-[#0071E3]" />
                <h4 className="text-[14px] font-medium text-white">Download & Specifications</h4>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0071E3]/20 px-2 py-0.5 text-[10.5px] font-medium text-[#0071E3]">
                Active Stream
              </span>
            </div>

            {/* Caption / Notes Card */}
            {result.caption && (
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 backdrop-blur-md">
                <p className="line-clamp-3 text-[12.5px] leading-relaxed text-white/70">
                  "{result.caption}"
                </p>
              </div>
            )}

            {/* Spec rows */}
            <dl className="mt-4 space-y-2.5 text-[12.5px]">
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
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="text-white/50">{k}</dt>
                  <dd className="font-mono text-white/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Action Center */}
          <div className="mt-6 space-y-2.5 border-t border-white/[0.08] pt-4">
            {/* Primary Action Button: Apple System Blue */}
            <button
              type="button"
              onClick={() => handleDownloadSingle(active)}
              disabled={isCurrentDownloading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-4 text-[13.5px] font-medium text-white shadow-[0_4px_16px_rgba(0,113,227,0.35)] transition-all duration-150 hover:bg-[#0077ED] active:scale-[0.98] disabled:opacity-50"
            >
              {isCurrentDownloading ? (
                <>
                  <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                  Preparing file...
                </>
              ) : isCurrentDownloaded ? (
                <>
                  <Check size={16} strokeWidth={2.2} className="text-white" />
                  Download started
                </>
              ) : (
                <>
                  <Download size={16} strokeWidth={1.8} />
                  Download {active.kind === "video" ? "Video" : "Image"} (
                  {formatBytes(active.bytes)})
                </>
              )}
            </button>

            {/* Secondary Action: Frosted Glass Button */}
            <button
              type="button"
              onClick={() => handleCopyLink()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.06] px-4 text-[12.5px] font-medium text-white/80 transition-all hover:bg-white/[0.10] active:scale-[0.98]"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-[#27C93F]" />
                  Direct URL copied to clipboard
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy direct media URL
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Apple Photos Multi-Media Filmstrip (for carousels)        */}
      {/* ------------------------------------------------------------- */}
      {result.media.length > 1 && (
        <div className="border-t border-white/[0.08] bg-black/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Photos & Clips Filmstrip ({result.media.length})
            </span>
            <span className="text-[11px] text-white/40">Select item to inspect</span>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
                    className={`group cursor-pointer overflow-hidden rounded-xl border transition-all duration-150 ${
                      selected
                        ? "border-[#0071E3] bg-white/[0.10] ring-2 ring-[#0071E3]/50 shadow-md"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="h-28 overflow-hidden bg-black/50">
                      <MediaFrame item={m} compact />
                    </div>

                    <div className="flex items-center justify-between p-2.5">
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] font-medium text-white">
                          #{idx + 1} · {m.format.toUpperCase()}
                        </p>
                        <p className="font-mono text-[10px] text-white/50">
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
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white transition-all hover:bg-white hover:text-black"
                      >
                        {isDownloaded ? (
                          <Check size={12} strokeWidth={2.2} className="text-[#27C93F]" />
                        ) : (
                          <Download size={12} strokeWidth={1.8} />
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
