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

export function Platforms() {
  return (
    <section
      id="platforms"
      aria-labelledby="platforms-title"
      className="shell mt-10 scroll-mt-16 sm:mt-12"
    >
      <div className="flex items-baseline justify-between gap-6 border-b border-border pb-3">
        <h2 id="platforms-title" className="display-tight text-[24px] sm:text-[28px]">
          Supported platforms
        </h2>
        <span className="mono-meta text-text-muted">{PLATFORMS.length} sources</span>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PLATFORMS.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3.5 transition-all duration-150 hover:border-border-strong"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-sunken">
              <PlatformMark platform={p.id} size={15} className="text-text-secondary" />
            </span>
            <div>
              <p className="text-[14px] font-medium text-text">{p.name}</p>
              <p className="mono-meta mt-0.5 text-[11.5px] text-text-muted">{p.media}</p>
            </div>
          </li>
        ))}
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
