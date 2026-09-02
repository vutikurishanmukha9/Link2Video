import { useState } from "react";
import { Download, Check } from "lucide-react";
import { PlatformMark } from "@/components/platform/PlatformMark";
import { MediaFrame } from "./MediaFrame";
import {
  PLATFORM_BY_ID,
  formatBytes,
  formatDuration,
  type PostResult,
} from "@/lib/downloader";

export function Workspace({ result }: { result: PostResult }) {
  const [activeId, setActiveId] = useState(result.media[0]?.id ?? "");
  const [done, setDone] = useState<string[]>([]);
  const active = result.media.find((m) => m.id === activeId) ?? result.media[0];
  if (!active) return null;
  const platform = PLATFORM_BY_ID[result.platform];

  const markDone = (id: string) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <section
      aria-label="Media workspace"
      className="fade-rise overflow-hidden rounded-2xl bg-panel text-panel-text"
    >
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-panel-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-panel-elevated">
            <PlatformMark platform={platform.id} size={15} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium">
              {platform.name}
              <span className="ml-2 font-normal text-panel-muted">{result.author}</span>
            </p>
            <p className="mono-meta mt-0.5 text-panel-muted">
              {result.media.length} {result.media.length === 1 ? "item" : "items"} ·{" "}
              {result.media.some((m) => m.kind === "video") ? "Video · Image" : "Image"} ·{" "}
              {result.postedAt}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => result.media.forEach((m) => markDone(m.id))}
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-panel-border px-4 text-[14px] font-medium text-panel-text transition-colors duration-150 hover:bg-panel-elevated"
        >
          <Download size={15} strokeWidth={1.6} aria-hidden="true" />
          Download all
        </button>
      </div>

      {/* Preview + details */}
      <div className="grid gap-px bg-panel-border lg:grid-cols-[1fr_320px]">
        <div className="flex items-center justify-center bg-panel p-5">
          <div className="max-h-[520px] w-full max-w-[520px] overflow-hidden rounded-xl border border-panel-border">
            <MediaFrame item={active} />
          </div>
        </div>

        <aside className="bg-panel p-5">
          <h3 className="text-[13px] font-medium tracking-[0.02em] text-panel-muted uppercase">Details</h3>
          <dl className="mt-3 space-y-2.5">
            {[
              ["Format", active.format],
              ["Dimensions", `${active.width} × ${active.height}`],
              ["Size", formatBytes(active.bytes)],
              ...(active.durationSeconds
                ? ([["Duration", formatDuration(active.durationSeconds)]] as [string, string][])
                : []),
              ["Type", active.kind === "video" ? "Video" : "Image"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-panel-muted">{k}</dt>
                <dd className="mono-meta text-panel-text">{v}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => markDone(active.id)}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-panel-text px-4 text-[14px] font-medium text-panel transition-opacity duration-150 hover:opacity-90"
          >
            {done.includes(active.id) ? (
              <>
                <Check size={15} strokeWidth={2} aria-hidden="true" /> Download started
              </>
            ) : (
              <>
                <Download size={15} strokeWidth={1.8} aria-hidden="true" /> Download
              </>
            )}
          </button>
          <p className="mt-2.5 text-[12px] text-panel-muted">
            Files are fetched directly from the source and never stored.
          </p>
        </aside>
      </div>

      {/* Media grid */}
      {result.media.length > 1 && (
        <div className="border-t border-panel-border p-5">
          <h3 className="text-[13px] font-medium tracking-[0.02em] text-panel-muted uppercase">
            All media
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {result.media.map((m) => {
              const selected = m.id === active.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(m.id)}
                    aria-pressed={selected}
                    className={`w-full overflow-hidden rounded-lg border text-left transition-colors duration-150 ${
                      selected
                        ? "border-accent bg-panel-elevated"
                        : "border-panel-border hover:bg-panel-elevated"
                    }`}
                  >
                    <div className="h-28 overflow-hidden bg-panel-raised">
                      <div className="flex h-full items-center justify-center">
                        <MediaFrame item={m} compact />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <span className="mono-meta text-panel-text">{m.format}</span>
                      <span className="mono-meta text-panel-muted">{formatBytes(m.bytes)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
