import { Link2, Layers, DownloadCloud } from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { PLATFORMS } from "@/lib/downloader";

const FEATURES = [
  {
    n: "01",
    title: "One link",
    body: "Paste a supported public post URL. Link2Download resolves the platform as you type — no account, no extension, no queue.",
    icon: Link2,
  },
  {
    n: "02",
    title: "Clean extraction",
    body: "Every asset in the post is listed with its real format, resolution and file size, so you know exactly what you are taking.",
    icon: Layers,
  },
  {
    n: "03",
    title: "Ready to download",
    body: "Pick one item or take the whole set. Files stream straight from the source; nothing is stored on our side.",
    icon: DownloadCloud,
  },
];

const STEPS = [
  { n: "01", title: "Paste", body: "Paste the public post URL into the command bar." },
  { n: "02", title: "Analyze", body: "The platform and every available media item are detected." },
  { n: "03", title: "Download", body: "Choose the media you need and download it directly." },
];

export function Features() {
  return (
    <section aria-label="Product features" className="shell mt-10 sm:mt-12">
      <ul className="grid gap-3.5 md:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <li
              key={f.n}
              className="flex min-h-[160px] flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-all duration-150 hover:border-border-strong sm:min-h-[175px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="mono-meta text-[11px] text-text-muted">{f.n}</span>
                  <Icon
                    size={15}
                    strokeWidth={1.6}
                    className="text-text-muted"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-3 text-[17px] font-medium tracking-[-0.015em] text-text">
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

const PLATFORM_DETAILS: Record<
  string,
  {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    hoverBorder: string;
    tags: string[];
    description: string;
    qualityBadge: string;
  }
> = {
  instagram: {
    badgeBg: "bg-gradient-to-tr from-amber-500/10 via-rose-500/15 to-purple-600/15",
    badgeText: "text-[#dd2a7b]",
    badgeBorder: "border-[#dd2a7b]/25",
    hoverBorder: "hover:border-[#dd2a7b]/50 hover:shadow-[0_8px_24px_rgba(221,42,123,0.08)]",
    tags: ["Reels", "Carousels", "Posts", "Stories"],
    description: "Extract public Reels, carousel photos, and video posts at native fidelity.",
    qualityBadge: "1080p HD",
  },
  youtube: {
    badgeBg: "bg-red-500/10",
    badgeText: "text-red-600",
    badgeBorder: "border-red-500/25",
    hoverBorder: "hover:border-red-500/50 hover:shadow-[0_8px_24px_rgba(239,68,68,0.08)]",
    tags: ["Shorts", "1080p HD", "720p", "Audio Track"],
    description: "High-speed video stream resolution with isolated audio track capture.",
    qualityBadge: "Up to 1080p",
  },
  x: {
    badgeBg: "bg-zinc-900/10 dark:bg-zinc-100/10",
    badgeText: "text-zinc-900 dark:text-zinc-100",
    badgeBorder: "border-zinc-900/20 dark:border-zinc-100/20",
    hoverBorder: "hover:border-zinc-500/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    tags: ["High-FPS Video", "Photos", "Looped GIFs"],
    description: "Instant grab of native video bitrates, multi-image posts, and animated GIFs.",
    qualityBadge: "Original Bitrate",
  },
  facebook: {
    badgeBg: "bg-blue-600/10",
    badgeText: "text-blue-600",
    badgeBorder: "border-blue-600/25",
    hoverBorder: "hover:border-blue-600/50 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)]",
    tags: ["Watch Videos", "Reels", "Public Posts"],
    description: "Retrieve public video streams, reel clips, and multi-photo media sets.",
    qualityBadge: "HD Streams",
  },
  linkedin: {
    badgeBg: "bg-[#0a66c2]/10",
    badgeText: "text-[#0a66c2]",
    badgeBorder: "border-[#0a66c2]/25",
    hoverBorder: "hover:border-[#0a66c2]/50 hover:shadow-[0_8px_24px_rgba(10,102,194,0.08)]",
    tags: ["Presentations", "Clips", "Post Media"],
    description: "Download professional presentations, clips, and video attachments.",
    qualityBadge: "Direct CDN",
  },
  reddit: {
    badgeBg: "bg-[#ff4500]/10",
    badgeText: "text-[#ff4500]",
    badgeBorder: "border-[#ff4500]/25",
    hoverBorder: "hover:border-[#ff4500]/50 hover:shadow-[0_8px_24px_rgba(255,69,0,0.08)]",
    tags: ["v.redd.it", "Galleries", "GIFs", "Audio Track"],
    description: "Clean extraction of hosted video chunks, audio muxing, and photo sets.",
    qualityBadge: "Direct Mux",
  },
};

export function Platforms() {
  return (
    <section
      id="platforms"
      aria-labelledby="platforms-title"
      className="shell mt-12 scroll-mt-16 sm:mt-16"
    >
      {/* Enhanced Header with Section Badge & Live Uptime Metric */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mono-meta inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-sunken px-2.5 py-0.5 text-[11px] tracking-[0.06em] text-text-muted uppercase">
            Supported Ecosystem
          </span>
          <h2 id="platforms-title" className="display-tight mt-2 text-[26px] sm:text-[30px]">
            Supported platforms & media formats
          </h2>
          <p className="mt-1 text-[14px] text-text-secondary sm:text-[15px]">
            Direct high-speed parsing across every major social platform with no compression.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-text-secondary shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
            </span>
            6 Networks Operational
          </span>
        </div>
      </div>

      {/* Modern 3x2 Card Grid */}
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
        {PLATFORMS.map((p) => {
          const meta = PLATFORM_DETAILS[p.id] ?? {
            badgeBg: "bg-surface-sunken",
            badgeText: "text-text",
            badgeBorder: "border-border",
            hoverBorder: "hover:border-border-strong",
            tags: ["Photos", "Videos"],
            description: "Direct media extraction from origin post URLs.",
            qualityBadge: "Standard",
          };

          return (
            <li
              key={p.id}
              className={`group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${meta.hoverBorder}`}
            >
              <div>
                {/* Top Row: Brand squircle badge + Quality Pill */}
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${meta.badgeBorder} ${meta.badgeBg} ${meta.badgeText}`}
                  >
                    <PlatformMark platform={p.id} size={20} />
                  </span>
                  <span className="mono-meta rounded-full border border-border/80 bg-surface-sunken/80 px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
                    {meta.qualityBadge}
                  </span>
                </div>

                {/* Title & Domain info */}
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-text">
                      {p.name}
                    </h3>
                    <span className="mono-meta text-[11px] text-text-muted">{p.hosts[0]}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                    {meta.description}
                  </p>
                </div>
              </div>

              {/* Bottom: Media capability tags */}
              <div className="mt-5 pt-4 border-t border-border/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-border/70 bg-surface-sunken/60 px-2 py-0.5 text-[11px] font-medium text-text-secondary transition-colors group-hover:border-border group-hover:text-text"
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
      className="shell mt-10 scroll-mt-16 sm:mt-12"
    >
      <div className="border-b border-border pb-3">
        <h2 id="how-title" className="display-tight text-[24px] sm:text-[28px]">
          How it works
        </h2>
      </div>

      <ol className="grid md:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="border-b border-border py-4.5 md:border-b-0 md:border-r md:px-5 md:py-5 md:last:border-r-0 md:first:pl-0"
          >
            <span className="mono-meta text-[11px] text-text-muted">{s.n}</span>
            <h3 className="mt-2 text-[17px] font-medium tracking-[-0.015em] text-text">
              {s.title}
            </h3>
            <p className="mt-1.5 max-w-[40ch] text-[13.5px] leading-relaxed text-text-secondary">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
