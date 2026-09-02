/**
 * Frontend-only domain model for the media downloader.
 * Everything here is API-ready: swap `mockExtract` for a server call later.
 */

export type PlatformId = "instagram" | "x" | "facebook" | "linkedin" | "reddit" | "youtube";

export type MediaKind = "image" | "video";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  format: string;
  width: number;
  height: number;
  bytes: number;
  durationSeconds?: number | undefined;
  previewUrl?: string | undefined;
  videoUrl?: string | undefined;
  title?: string | undefined;
}

export interface PostResult {
  platform: PlatformId;
  author: string;
  postedAt: string;
  caption: string;
  media: MediaItem[];
}

export type FailureCode =
  | "invalid-url"
  | "unsupported-platform"
  | "private-content"
  | "no-media"
  | "extraction-failed"
  | "rate-limited"
  | "request-timeout";

export interface Platform {
  id: PlatformId;
  name: string;
  media: string;
  hosts: string[];
}

export const PLATFORMS: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    media: "Photos · Videos · Reels",
    hosts: ["instagram.com", "instagr.am"],
  },
  {
    id: "youtube",
    name: "YouTube",
    media: "Shorts · Videos · 1080p · 720p",
    hosts: ["youtube.com", "youtu.be"],
  },
  {
    id: "x",
    name: "X",
    media: "Photos · Videos · GIFs",
    hosts: ["x.com", "twitter.com"],
  },
  {
    id: "facebook",
    name: "Facebook",
    media: "Photos · Videos",
    hosts: ["facebook.com", "fb.watch"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    media: "Photos · Videos",
    hosts: ["linkedin.com", "lnkd.in"],
  },
  {
    id: "reddit",
    name: "Reddit",
    media: "Photos · Videos · GIFs",
    hosts: ["reddit.com", "redd.it"],
  },
];

export const PLATFORM_BY_ID: Record<PlatformId, Platform> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p]),
) as Record<PlatformId, Platform>;

export type Detection =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "unsupported"; host: string }
  | { status: "detected"; platform: Platform };

function parse(raw: string): URL | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

export function detect(raw: string): Detection {
  if (!raw.trim()) return { status: "empty" };
  const url = parse(raw);
  if (!url || !url.hostname.includes(".")) return { status: "invalid" };
  const host = url.hostname.replace(/^www\./, "");
  const platform = PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  if (!platform) return { status: "unsupported", host };
  return { status: "detected", platform };
}

export const FAILURE_COPY: Record<FailureCode, { title: string; detail: string }> = {
  "invalid-url": {
    title: "Invalid URL",
    detail: "Enter a valid supported post URL.",
  },
  "unsupported-platform": {
    title: "Unsupported platform",
    detail: "This platform isn't supported yet.",
  },
  "private-content": {
    title: "Private content",
    detail: "This post isn't publicly accessible.",
  },
  "no-media": {
    title: "Media unavailable",
    detail: "No downloadable media was found.",
  },
  "extraction-failed": {
    title: "Extraction failed",
    detail: "We couldn't retrieve this post right now.",
  },
  "rate-limited": {
    title: "Rate limit reached",
    detail: "Too many requests. Please wait a moment before trying again.",
  },
  "request-timeout": {
    title: "Request timed out",
    detail: "The upstream server took too long to respond. Please try again.",
  },
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** API base URL: defaults to localhost:8000 or VITE_API_URL in production */
export const API_BASE_URL = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env["VITE_API_URL"]) ||
  "http://localhost:8000"
).replace(/\/+$/, "");

interface BackendMediaItem {
  id: string;
  type: "video" | "image";
  url: string;
  thumbnail_url?: string | null;
  width?: number;
  height?: number;
  duration?: number | null;
  format?: string;
  size?: number;
  title?: string | null;
}

/**
 * Connects frontend to the FastAPI backend at /api/v1/analyze for real media extraction.
 */
export async function extractMedia(
  platform: Platform,
  url: string,
  externalSignal?: AbortSignal,
): Promise<PostResult | FailureCode> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        controller.abort();
      });
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok || !data.success) {
      const code = data?.error?.code;
      if (code === "INVALID_URL") return "invalid-url";
      if (code === "UNSUPPORTED_PLATFORM") return "unsupported-platform";
      if (code === "PRIVATE_CONTENT") return "private-content";
      if (code === "NO_MEDIA_FOUND") return "no-media";
      if (code === "RATE_LIMITED") return "rate-limited";
      return "extraction-failed";
    }

    // Map real backend media response into frontend PostResult model
    const media: MediaItem[] = (data.media || []).map((m: BackendMediaItem) => ({
      id: m.id,
      kind: m.type === "video" ? "video" : "image",
      format: (m.format || "mp4").toUpperCase(),
      width: m.width || 1080,
      height: m.height || 1080,
      bytes: m.size || 0,
      durationSeconds: m.duration || undefined,
      previewUrl: m.thumbnail_url || m.url,
      videoUrl: m.type === "video" ? m.url : undefined,
      title: m.title || `${platform.name} media`,
    }));

    if (media.length === 0) {
      return "no-media";
    }

    return {
      platform: platform.id,
      author: data.author || `@${platform.id}.user`,
      postedAt: data.posted_at || "Recently",
      caption: data.caption || "",
      media,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (externalSignal?.aborted) {
      return "extraction-failed";
    }
    if (err instanceof Error && err.name === "AbortError") {
      return "request-timeout";
    }
    return "extraction-failed";
  }
}

/** Triggers real browser file download using backend streaming attachment */
export function triggerDownload(item: MediaItem) {
  if (typeof document === "undefined") return;

  // Stream via backend endpoint to force download dialog rather than playing in a tab
  const streamUrl = item.id
    ? `${API_BASE_URL}/api/v1/media/${encodeURIComponent(item.id)}/download?stream=true`
    : item.videoUrl || item.previewUrl;

  if (!streamUrl) return;

  const filename = `${item.id}.${item.format.toLowerCase()}`;
  const a = document.createElement("a");
  a.href = streamUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
