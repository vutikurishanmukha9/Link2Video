/**
 * Frontend-only domain model for the media downloader.
 * Everything here is API-ready: swap `analyzeUrl` for a server call later.
 */

export type PlatformId = "instagram" | "x" | "facebook" | "linkedin" | "reddit";

export type MediaKind = "image" | "video";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  format: string;
  width: number;
  height: number;
  bytes: number;
  durationSeconds?: number | undefined;
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
  | "extraction-failed";

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
  { id: "x", name: "X", media: "Photos · Videos · GIFs", hosts: ["x.com", "twitter.com"] },
  { id: "facebook", name: "Facebook", media: "Photos · Videos", hosts: ["facebook.com", "fb.watch"] },
  { id: "linkedin", name: "LinkedIn", media: "Photos · Videos", hosts: ["linkedin.com", "lnkd.in"] },
  { id: "reddit", name: "Reddit", media: "Photos · Videos · GIFs", hosts: ["reddit.com", "redd.it"] },
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

/** Deterministic mock extraction. Replace with a server function when the backend lands. */
export function mockExtract(platform: Platform, url: string): PostResult | FailureCode {
  const path = url.toLowerCase();
  if (path.includes("/private")) return "private-content";
  if (path.includes("/text") || path.includes("/status/000")) return "no-media";
  if (path.includes("/fail")) return "extraction-failed";

  const seed = Array.from(url).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 9973, 7);
  const count = (seed % 4) + 1;

  const media: MediaItem[] = Array.from({ length: count }, (_, i) => {
    const isVideo = (seed + i) % 3 === 0;
    const portrait = (seed + i) % 2 === 0;
    return {
      id: `${platform.id}-${seed}-${i}`,
      kind: isVideo ? "video" : "image",
      format: isVideo ? "MP4" : "JPG",
      width: portrait ? 1080 : 1440,
      height: portrait ? 1920 : 1080,
      bytes: isVideo ? 4_800_000 + ((seed * (i + 3)) % 9_000_000) : 380_000 + ((seed * (i + 2)) % 2_400_000),
      durationSeconds: isVideo ? 9 + ((seed + i) % 48) : undefined,
    };
  });

  const authors: Record<PlatformId, string> = {
    instagram: "@northfield.studio",
    x: "@rasmus_hale",
    facebook: "Northfield Studio",
    linkedin: "Ines Okafor",
    reddit: "u/quiet_carpenter",
  };

  return {
    platform: platform.id,
    author: authors[platform.id],
    postedAt: "Aug 28, 2026",
    caption: "Workshop notes from the second build week.",
    media,
  };
}
