import { PlatformMark } from "@/components/platform/PlatformMark";
import { PLATFORMS } from "@/lib/downloader";

const FEATURES = [
  {
    n: "01",
    title: "One link",
    body: "Paste a supported public post URL. Conduit resolves the platform as you type — no account, no extension, no queue.",
  },
  {
    n: "02",
    title: "Clean extraction",
    body: "Every asset in the post is listed with its real format, resolution and file size, so you know exactly what you are taking.",
  },
  {
    n: "03",
    title: "Ready to download",
    body: "Pick one item or take the whole set. Files stream straight from the source; nothing is stored on our side.",
  },
];

const STEPS = [
  { n: "01", title: "Paste", body: "Paste the public post URL into the command bar." },
  { n: "02", title: "Analyze", body: "The platform and every available media item are detected." },
  { n: "03", title: "Download", body: "Choose the media you need and download it." },
];

export function Features() {
  return (
    <section aria-label="What Conduit does" className="shell mt-16">
      <ul className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <li key={f.n} className="rounded-xl border border-border bg-surface p-6">
            <span className="mono-meta text-text-muted">{f.n}</span>
            <h3 className="mt-3 text-[18px] font-medium tracking-[-0.012em]">{f.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Platforms() {
  return (
    <section id="platforms" aria-labelledby="platforms-title" className="shell mt-16 scroll-mt-20">
      <div className="flex items-baseline justify-between gap-6 border-b border-border pb-4">
        <h2 id="platforms-title" className="display-tight text-[28px]">
          Supported platforms
        </h2>
        <span className="mono-meta text-text-muted">5 sources</span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {PLATFORMS.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 border-b border-border py-4 lg:flex-col lg:items-start lg:gap-2 lg:border-b-0 lg:border-r lg:px-5 lg:py-5 lg:last:border-r-0 lg:first:pl-0"
          >
            <PlatformMark platform={p.id} size={18} className="text-text-secondary" />
            <div>
              <p className="text-[15px] font-medium">{p.name}</p>
              <p className="mono-meta mt-0.5 text-text-muted">{p.media}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="shell mt-16 scroll-mt-20">
      <div className="border-b border-border pb-4">
        <h2 id="how-title" className="display-tight text-[28px]">
          How it works
        </h2>
      </div>
      <ol className="grid md:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="border-b border-border py-5 md:border-b-0 md:border-r md:px-6 md:last:border-r-0 md:first:pl-0"
          >
            <span className="mono-meta text-text-muted">{s.n}</span>
            <h3 className="mt-2 text-[18px] font-medium tracking-[-0.012em]">{s.title}</h3>
            <p className="mt-1.5 max-w-[42ch] text-[14px] leading-relaxed text-text-secondary">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
