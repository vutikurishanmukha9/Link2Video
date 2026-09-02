import { Play, Image as ImageIcon } from "lucide-react";
import { type MediaItem } from "@/lib/downloader";

/**
 * Neutral placeholder frame standing in for retrieved media.
 * When the extraction backend lands, render the real asset here at the same
 * aspect ratio with object-fit: contain.
 */
export function MediaFrame({ item, compact = false }: { item: MediaItem; compact?: boolean }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-panel-elevated"
      style={compact ? undefined : { aspectRatio: `${item.width} / ${item.height}` }}
      role="img"
      aria-label={`${item.kind === "video" ? "Video" : "Image"} preview, ${item.width} by ${item.height}`}
    >
      <div className="flex flex-col items-center gap-2 text-panel-muted">
        {item.kind === "video" ? (
          <Play size={compact ? 16 : 20} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <ImageIcon size={compact ? 16 : 20} strokeWidth={1.5} aria-hidden="true" />
        )}
        {!compact && (
          <span className="mono-meta">
            {item.width} × {item.height}
          </span>
        )}
      </div>
    </div>
  );
}
