import { Link2, Layers, DownloadCloud } from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { PLATFORMS } from "@/lib/downloader";

const FEATURES = [
  {
    n: "01",
    title: "ONE LINK",
    body: "Paste a supported public post URL. Link2Download resolves the platform as you type — zero accounts, no extension, no waiting queue.",
    icon: Link2,
  },
  {
    n: "02",
    title: "CLEAN EXTRACTION",
    body: "Every video stream and photo in the post is inspected with real format, resolution, and file size so you know exactly what you get.",
    icon: Layers,
  },
  {
    n: "03",
    title: "DIRECT ATTACHMENT",
    body: "Download single clips or batch-save whole carousel albums. Files stream straight from public CDNs with forced download headers.",
    icon: DownloadCloud,
  },
];

const STEPS = [
  {
    n: "01",
    title: "PASTE LINK",
    body: "Paste any public Instagram, YouTube, X, Reddit, Facebook, or LinkedIn URL.",
  },
  {
    n: "02",
    title: "ANALYZE",
    body: "Our high-speed extraction engine extracts all streams, audio channels, and poster covers.",
  },
  {
    n: "03",
    title: "ONE-CLICK SAVE",
    body: "Select your desired quality or grab the entire set directly to your device.",
  },
];

export function Features() {
  return (
    <section aria-label="Product features" className="shell mt-12 sm:mt-16">
      <ul className="grid gap-5 md:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <li
              key={f.n}
              className="flex min-h-[175px] flex-col justify-between rounded-xs border-2 border-black bg-card p-6 shadow-md transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center rounded-xs border-2 border-black bg-primary px-2.5 py-1 font-head text-xs font-bold text-black shadow-xs">
                    STEP {f.n}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xs border-2 border-black bg-muted text-foreground shadow-2xs">
                    <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mt-4 font-head text-lg font-bold tracking-tight text-foreground">
                  {f.title}
                </h3>
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/80">
                {f.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const PLATFORM_DETAILS: Record<
  string,
  {
    tags: string[];
    description: string;
    qualityBadge: string;
  }
> = {
  instagram: {
    tags: ["Reels", "Carousels", "Posts", "Stories"],
    description: "Extract public Reels, carousel photos, and video posts at native fidelity.",
    qualityBadge: "1080p HD",
  },
  youtube: {
    tags: ["Shorts", "1080p HD", "720p", "Audio Track"],
    description: "High-speed video stream resolution with isolated audio track capture.",
    qualityBadge: "Up to 1080p",
  },
  x: {
    tags: ["High-FPS Video", "Photos", "Looped GIFs"],
    description: "Instant grab of native video bitrates, multi-image posts, and animated GIFs.",
    qualityBadge: "Original Bitrate",
  },
  facebook: {
    tags: ["Watch Videos", "Reels", "Public Posts"],
    description: "Retrieve public video streams, reel clips, and multi-photo media sets.",
    qualityBadge: "HD Streams",
  },
  linkedin: {
    tags: ["Presentations", "Clips", "Post Media"],
    description: "Download professional presentations, clips, and video attachments.",
    qualityBadge: "Direct CDN",
  },
  reddit: {
    tags: ["DASH Audio Mux", "Galleries", "MP4"],
    description: "Automatic audio-video muxing for native Reddit video and gallery albums.",
    qualityBadge: "Muxed 1080p",
  },
  web: {
    tags: ["BCCI Cricket", "IPL Highlights", "Google Drive", "Universal Web"],
    description:
      "Download match highlights from BCCI, IPL, Google Drive, and 1,750+ video websites.",
    qualityBadge: "Universal MP4",
  },
};

export function Platforms() {
  return (
    <section id="platforms" aria-labelledby="platforms-heading" className="shell mt-16 sm:mt-24">
      {/* Header with live operational count */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h2
            id="platforms-heading"
            className="font-head text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground"
          >
            SUPPORTED PLATFORMS
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Engineered extraction adapters tuned for major social platforms and universal web video
            streams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-xs border-2 border-black bg-primary px-3 py-1 font-head text-xs text-black shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
            </span>
            UNIVERSAL + 1,750+ SITES
          </span>
        </div>
      </div>

      {/* Modern Neobrutalist Card Grid */}
      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => {
          const meta = PLATFORM_DETAILS[p.id] ?? {
            tags: ["Photos", "Videos"],
            description: "Direct media extraction from origin post URLs.",
            qualityBadge: "Standard",
          };

          return (
            <li
              key={p.id}
              className="group relative flex flex-col justify-between rounded-xs border-2 border-black bg-card p-6 shadow-md transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                {/* Top Row: Brand squircle badge + Quality Pill */}
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xs border-2 border-black bg-primary text-black shadow-xs transition-transform group-hover:scale-105">
                    <PlatformMark platform={p.id} size={22} />
                  </span>
                  <span className="rounded-xs border border-black bg-muted px-2.5 py-0.5 font-head text-xs text-foreground shadow-2xs">
                    {meta.qualityBadge}
                  </span>
                </div>

                {/* Title & Domain info */}
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-head text-lg font-bold text-foreground">
                      {p.name.toUpperCase()}
                    </h3>
                    <span className="font-head text-xs text-muted-foreground">{p.hosts[0]}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/80">
                    {meta.description}
                  </p>
                </div>
              </div>

              {/* Bottom: Media capability tags */}
              <div className="mt-5 pt-4 border-t-2 border-black/10">
                <div className="flex flex-wrap items-center gap-1.5">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-xs border border-black bg-muted px-2 py-0.5 font-head text-[11px] text-foreground transition-colors hover:bg-primary hover:text-black"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
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
      className="shell mt-16 sm:mt-24 scroll-mt-16"
    >
      <div className="border-b-2 border-black pb-4">
        <h2
          id="how-title"
          className="font-head text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground"
        >
          HOW IT WORKS
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Three simple steps to save any public media cleanly with no watermark.
        </p>
      </div>

      <ol className="mt-6 grid gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="rounded-xs border-2 border-black bg-card p-6 shadow-md transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="inline-flex items-center justify-center rounded-xs border-2 border-black bg-primary px-3 py-1 font-head text-xs font-bold text-black shadow-xs">
              0{s.n}
            </span>
            <h3 className="mt-4 font-head text-lg font-bold text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/80">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
