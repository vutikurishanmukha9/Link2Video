import { useState } from "react";
import { Link2, Layers, DownloadCloud } from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { PLATFORMS } from "@/lib/downloader";

const FEATURES = [
  {
    n: "01",
    title: "One Link Everywhere",
    body: "Paste a supported public post URL. Link2Download resolves the platform as you type — no account, no extension, no queue.",
    icon: Link2,
    accentBorder: "border-blue-500/20",
    accentGradient: "bg-surface",
    iconBg: "bg-blue-600 text-white shadow-xs",
    numColor: "text-blue-600",
  },
  {
    n: "02",
    title: "Clean Master Extraction",
    body: "Every asset in the post is listed with its real format, resolution, and exact file size, so you know exactly what you are saving.",
    icon: Layers,
    accentBorder: "border-purple-500/20",
    accentGradient: "bg-surface",
    iconBg: "bg-purple-600 text-white shadow-xs",
    numColor: "text-purple-600",
  },
  {
    n: "03",
    title: "Direct CDN Streaming",
    body: "Pick one media item or take the whole carousel set. Files stream straight from the source CDN; nothing is stored on our servers.",
    icon: DownloadCloud,
    accentBorder: "border-emerald-500/20",
    accentGradient: "bg-surface",
    iconBg: "bg-emerald-600 text-white shadow-xs",
    numColor: "text-emerald-600",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Paste URL",
    body: "Paste any public post URL from supported platforms into the top command bar or tap 1-tap Paste.",
    stepColor: "bg-blue-600 text-white shadow-xs",
    badgeBorder: "border-blue-500/20",
    cardBg: "bg-surface",
  },
  {
    n: "02",
    title: "Instant Analysis",
    body: "Our engine detects the origin network, strips watermarks, parses bitrates, and presents clean streams.",
    stepColor: "bg-purple-600 text-white shadow-xs",
    badgeBorder: "border-purple-500/20",
    cardBg: "bg-surface",
  },
  {
    n: "03",
    title: "Download HD Media",
    body: "Save 1080p videos, photo carousels, or extracted MP3 audio tracks directly to your camera roll or PC.",
    stepColor: "bg-emerald-600 text-white shadow-xs",
    badgeBorder: "border-emerald-500/20",
    cardBg: "bg-surface",
  },
];

export function Features() {
  return (
    <section aria-label="Product features" className="shell mt-10 sm:mt-12">
      <ul className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <li
              key={f.n}
              className={`flex min-h-[170px] flex-col justify-between rounded-2xl border border-black dark:border-white/15 ring-1 ring-black/15 dark:ring-white/10 bg-surface p-5.5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-black/30 dark:hover:ring-white/30 sm:min-h-[185px]`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`mono-meta text-[12px] font-bold ${f.numColor}`}>{f.n}</span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${f.iconBg}`}
                  >
                    <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mt-3.5 text-[18px] font-semibold tracking-[-0.015em] text-text">
                  {f.title}
                </h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{f.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface PlatformDetail {
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  hoverBorder: string;
  cardBg: string;
  tags: string[];
  tagStyle: string;
  description: string;
  qualityBadge: string;
  qualityBadgeStyle: string;
  btnStyle: string;
  btnLabel: string;
  sampleUrl: string;
}

const PLATFORM_DETAILS: Record<string, PlatformDetail> = {
  instagram: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Reels", "Carousels", "Posts", "Stories"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Extract public Reels, carousel photos, and video posts at native 1080p fidelity.",
    qualityBadge: "1080p HD",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Instagram Reel",
    sampleUrl: "https://www.instagram.com/reel/C8v9z8_L_2m/",
  },
  tiktok: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["No Watermark", "HD 1080p", "Soundtrack", "Original MP4"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Clean HD downloads with bouncing watermark removal and isolated soundtrack capture.",
    qualityBadge: "No Watermark",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try TikTok Clip",
    sampleUrl: "https://www.tiktok.com/@creator/video/71234567890",
  },
  youtube: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Shorts", "1080p HD", "720p", "Audio Track"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "High-speed video stream resolution for Shorts & full videos with audio track extraction.",
    qualityBadge: "Up to 1080p",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try YouTube Shorts",
    sampleUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  x: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["High-FPS Video", "Photos", "Looped GIFs"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Instant grab of native video bitrates, multi-image posts, and animated GIFs.",
    qualityBadge: "Original Bitrate",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try X Post Video",
    sampleUrl: "https://x.com/user/status/12345",
  },
  facebook: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Watch Videos", "Reels", "Public Posts"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Retrieve public video streams, reel clips, and multi-photo media sets.",
    qualityBadge: "HD Streams",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Facebook Reel",
    sampleUrl: "https://www.facebook.com/watch/?v=12345",
  },
  pinterest: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Video Pins", "HD Photos", "Story Pins", "Idea Pins"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Extract high-resolution craft, recipe, and design video pins at full master quality.",
    qualityBadge: "Full Res",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Video Pin",
    sampleUrl: "https://www.pinterest.com/pin/12345/",
  },
  threads: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Carousels", "Clips", "Full Bitrate", "Photos"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Seamlessly extract video clips, carousel images, and updates from threads.net.",
    qualityBadge: "Lossless",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Threads Post",
    sampleUrl: "https://www.threads.net/@user/post/12345",
  },
  soundcloud: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["HQ Audio", "Tracks", "DJ Sets", "Artwork"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Direct audio stream extraction with high fidelity, album artwork, and track tags.",
    qualityBadge: "HQ Audio",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try SoundCloud Track",
    sampleUrl: "https://soundcloud.com/artist/song-title",
  },
  bandcamp: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Studio Audio", "Full Albums", "Original Artwork"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Download independent artist tracks, whole album sets, and hi-res cover art.",
    qualityBadge: "Studio Audio",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Bandcamp Release",
    sampleUrl: "https://artist.bandcamp.com/track/cool-song",
  },
  twitch: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["60 FPS", "Gaming Clips", "Highlights", "1080p60"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Ultra smooth 60 frames-per-second gaming highlights and live clip captures.",
    qualityBadge: "1080p 60FPS",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Twitch Clip",
    sampleUrl: "https://clips.twitch.tv/AmazingClip123",
  },
  linkedin: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Presentations", "Clips", "Post Media"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Download professional presentations, clips, and video attachments.",
    qualityBadge: "Direct CDN",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try LinkedIn Video",
    sampleUrl: "https://www.linkedin.com/posts/user-12345",
  },
  reddit: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["DASH Audio Mux", "Galleries", "MP4"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Automatic audio-video muxing for native Reddit video and gallery albums.",
    qualityBadge: "Muxed 1080p",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Reddit Video",
    sampleUrl: "https://www.reddit.com/r/funny/comments/abc123/",
  },
  terabox: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["1080p CDN", "App Lock Bypass", "Direct MP4", "High Speed"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Bypasses mobile app lock. Extracts direct 1080p CDN video streams for browser playback and fast downloading.",
    qualityBadge: "1080p CDN",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try TeraBox Link",
    sampleUrl: "https://terabox.com/s/1d0aBCd_E123",
  },
  mega: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Zero Apps", "Decrypted Stream", "Progressive", "Browser Save"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Resolves shared file metadata and streams raw decrypted bytes directly to browser storage without Mega desktop/mobile app.",
    qualityBadge: "Decrypted",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Mega Link",
    sampleUrl: "https://mega.nz/file/abc12345#key_secret_1234567890123456789012",
  },
  gdrive: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["1-Tap Direct", "Virus Warning Bypass", "No Interstitial", "Full Speed"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Bypasses 'file exceeds maximum scan size' virus check interstitial with 1-tap direct download stream.",
    qualityBadge: "Scan Bypass",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Google Drive Link",
    sampleUrl: "https://drive.google.com/file/d/1B2C3D4E5F6G7H8I9J0K1L2M/view",
  },
  mediafire: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Ad-Free", "Direct CDN", "Instant Stream", "Raw Bytes"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description: "Bypasses ad-heavy download landing pages for instant raw CDN byte streams.",
    qualityBadge: "Ad-Free CDN",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try MediaFire Link",
    sampleUrl: "https://www.mediafire.com/file/abc123xyz/sample_video.mp4/file",
  },
  dropbox: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["Direct dl=1", "Progressive Stream", "Ad-Free", "Raw Binary"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Instant direct resolution to progressive binary streams (dl=1) without ads or friction.",
    qualityBadge: "Direct dl=1",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Dropbox Link",
    sampleUrl: "https://www.dropbox.com/s/abc123xyz/sample_video.mp4?dl=0",
  },
  web: {
    cardBorder: "border-black ring-1 ring-black/15 hover:ring-black/30",
    badgeBg: "bg-zinc-800/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    hoverBorder: "hover:border-zinc-500",
    cardBg: "bg-surface",
    tags: ["BCCI Cricket", "IPL Highlights", "Google Drive", "Universal Web"],
    tagStyle: "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    description:
      "Download match highlights from BCCI, IPL, Google Drive, and 1,750+ video websites.",
    qualityBadge: "Universal MP4",
    qualityBadgeStyle:
      "border-zinc-300 bg-zinc-800/5 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200",
    btnStyle: "bg-zinc-900 text-white hover:bg-black shadow-xs",
    btnLabel: "Try Web Video",
    sampleUrl: "https://www.bcci.tv/videos/556677/match-highlights",
  },
};

export function Platforms() {
  const [filter, setFilter] = useState<"all" | "cloud" | "video" | "social" | "audio">("all");

  const handleTry = (sampleUrl: string) => {
    const input = document.getElementById("post-url") as HTMLInputElement | null;
    if (input) {
      input.value = sampleUrl;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(15);
        } catch {
          /* ignore */
        }
      }
    }
  };

  const filteredPlatforms = PLATFORMS.filter((p) => {
    if (filter === "all") return true;
    if (filter === "cloud") {
      return ["terabox", "mega", "gdrive", "mediafire", "dropbox"].includes(p.id);
    }
    if (filter === "audio") return p.id === "soundcloud" || p.id === "bandcamp";
    if (filter === "social") {
      return [
        "instagram",
        "tiktok",
        "x",
        "facebook",
        "pinterest",
        "threads",
        "linkedin",
        "reddit",
      ].includes(p.id);
    }
    if (filter === "video") {
      return [
        "youtube",
        "tiktok",
        "instagram",
        "x",
        "facebook",
        "pinterest",
        "threads",
        "twitch",
        "reddit",
        "terabox",
        "mega",
        "gdrive",
        "dropbox",
        "web",
      ].includes(p.id);
    }
    return true;
  });

  return (
    <section
      id="platforms"
      aria-labelledby="platforms-heading"
      className="shell mt-12 scroll-mt-16 sm:mt-16"
    >
      {/* Header with live operational count */}
      <div className="flex flex-col gap-2.5 border-b border-border/80 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <h2
              id="platforms-heading"
              className="text-[20px] font-semibold tracking-tight text-text sm:text-[26px]"
            >
              Supported Platforms
            </h2>
            <span className="mono-meta inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 sm:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              1,750+ Sites
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary sm:text-[14px]">
            Engineered extraction adapters tuned for every major platform with tailored color
            profiles and direct CDN bitrates.
          </p>
        </div>
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <span className="mono-meta inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[12px] font-semibold text-emerald-600 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Universal + 1,750+ Sites
          </span>
        </div>
      </div>

      {/* Category Filter Pills (Horizontal chip scroll on mobile, wrap on desktop) */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
        {(
          [
            { id: "all", label: "All Platforms", count: 18 },
            { id: "cloud", label: "Cloud Storage", count: 5 },
            { id: "video", label: "Video Streams", count: 14 },
            { id: "social", label: "Social Media", count: 8 },
            { id: "audio", label: "Hi-Res Audio", count: 2 },
          ] as const
        ).map((cat) => {
          const isSelected = filter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                  try {
                    navigator.vibrate(8);
                  } catch {
                    /* ignore */
                  }
                }
                setFilter(cat.id);
              }}
              className={`native-tap flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all duration-150 active:scale-95 ${
                isSelected
                  ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                  : "border border-black/15 bg-surface text-text-secondary hover:border-black hover:text-text"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`mono-meta rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900"
                    : "bg-black/5 text-text-muted"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sleek Branded Platform Logo Cards */}
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        {filteredPlatforms.map((p) => {
          const meta = PLATFORM_DETAILS[p.id];
          const displayName =
            p.id === "twitch"
              ? "Twitch"
              : p.id === "web"
                ? "Web"
                : p.id === "gdrive"
                  ? "Drive"
                  : p.name;

          return (
            <li key={p.id}>
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
                  if (meta?.sampleUrl) {
                    handleTry(meta.sampleUrl);
                  } else {
                    const input = document.getElementById("post-url");
                    if (input) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setTimeout(() => input.focus(), 300);
                    }
                  }
                }}
                className="native-tap group flex h-[66px] w-[74px] sm:h-[72px] sm:w-[82px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0d0d10] p-1 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-[#16161b] hover:shadow-lg hover:shadow-black/60 active:scale-95 text-center"
                title={`Extract media from ${p.name} (${p.hosts[0]})`}
              >
                {/* Centered Brand Logo Mark */}
                <div className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] transition-transform duration-200 group-hover:scale-110 shadow-xs">
                  <PlatformMark platform={p.id} size={22} />
                </div>

                {/* Platform Name */}
                <span className="mt-1 text-[10px] sm:text-[10.5px] font-medium tracking-tight text-zinc-300 transition-colors duration-150 leading-none truncate max-w-[94%] group-hover:text-white">
                  {displayName}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="shell mt-12 scroll-mt-16 sm:mt-16"
    >
      <div className="border-b border-border/80 pb-3">
        <h2
          id="how-title"
          className="display-tight text-[24px] sm:text-[28px] font-semibold text-text"
        >
          How It Works
        </h2>
        <p className="mt-1 text-[13.5px] text-text-secondary">
          Three simple steps to extract and download high-definition media without third-party apps.
        </p>
      </div>

      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className={`flex flex-col justify-between rounded-2xl border border-black dark:border-white/15 ring-1 ring-black/15 dark:ring-white/10 bg-surface p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-black/30 dark:hover:ring-white/30`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-[13px] font-bold ${s.stepColor}`}
                >
                  {s.n}
                </span>
                <span className="mono-meta text-[11px] font-medium text-text-muted">
                  Step {s.n}
                </span>
              </div>
              <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.015em] text-text">
                {s.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
