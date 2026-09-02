import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Image as ImageIcon, Maximize2 } from "lucide-react";
import { type MediaItem, formatDuration } from "@/lib/downloader";

interface Props {
  item: MediaItem;
  compact?: boolean;
}

export function MediaFrame({ item, compact = false }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, pos));
    videoRef.current.currentTime = clamped * (videoRef.current.duration || 0);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Compact mode for grid thumbnails
  if (compact) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-panel-raised"
        role="img"
        aria-label={`${item.kind === "video" ? "Video" : "Image"} thumbnail`}
      >
        {item.previewUrl && !imgError ? (
          <img
            src={item.previewUrl}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover opacity-90 transition-opacity duration-150 hover:opacity-100"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-panel-muted">
            {item.kind === "video" ? (
              <Play size={16} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <ImageIcon size={16} strokeWidth={1.5} aria-hidden="true" />
            )}
            <span className="mono-meta text-[11px]">{item.format}</span>
          </div>
        )}

        {/* Thumbnail micro badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="mono-meta rounded-xs bg-panel/80 px-1.5 py-0.5 text-[10px] text-panel-text backdrop-blur-xs">
            {item.format}
          </span>
        </div>

        {item.kind === "video" && (
          <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-xs bg-panel/80 px-1.5 py-0.5 backdrop-blur-xs">
            <Play size={10} strokeWidth={2} className="text-panel-text" aria-hidden="true" />
            {item.durationSeconds && (
              <span className="mono-meta text-[10px] text-panel-text">
                {formatDuration(item.durationSeconds)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full detailed preview mode
  return (
    <div
      className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-panel-elevated"
      style={{ aspectRatio: `${item.width} / ${item.height}`, maxHeight: "560px" }}
    >
      {/* Video element or Image */}
      {item.kind === "video" ? (
        <>
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={item.previewUrl}
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="h-full w-full cursor-pointer object-contain"
          />

          {/* Top metadata pills (Apple frosted glass) */}
          <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
            <span className="mono-meta rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md border border-white/20 shadow-md">
              {item.format.toUpperCase()} ·{" "}
              {item.height >= 1080
                ? "1080p HD"
                : item.height >= 720
                  ? "720p HD"
                  : `${item.height}p`}
            </span>
            {item.durationSeconds && (
              <span className="mono-meta rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur-md border border-white/20 shadow-md">
                {formatDuration(item.durationSeconds)}
              </span>
            )}
          </div>

          {/* Center Play/Pause button overlay (Apple QuickTime style) */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className={`absolute flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white border border-white/25 backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-110 hover:bg-black/80 active:scale-95 ${
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            }`}
          >
            {isPlaying ? (
              <Pause size={24} strokeWidth={2} />
            ) : (
              <Play size={24} strokeWidth={2} className="translate-x-0.5" />
            )}
          </button>

          {/* Custom bottom playback bar */}
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 pt-6 transition-opacity duration-150 group-hover:opacity-100 opacity-90">
            {/* Scrubber track */}
            <div
              onClick={handleSeek}
              className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20 transition-all hover:h-2"
              role="slider"
              aria-label="Video timeline scrubber"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className="h-full rounded-full bg-[#0071E3] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Bottom mini controls */}
            <div className="mt-2.5 flex items-center justify-between text-panel-text">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-xs p-1 text-panel-muted transition-colors hover:text-panel-text"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={14} strokeWidth={1.8} />
                  ) : (
                    <Play size={14} strokeWidth={1.8} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-xs p-1 text-panel-muted transition-colors hover:text-panel-text"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX size={14} strokeWidth={1.8} />
                  ) : (
                    <Volume2 size={14} strokeWidth={1.8} />
                  )}
                </button>
                {item.durationSeconds && (
                  <span className="mono-meta text-[11px] text-panel-muted">
                    {formatDuration(Math.round(videoRef.current?.currentTime || 0))} /{" "}
                    {formatDuration(item.durationSeconds)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleFullscreen}
                className="rounded-xs p-1 text-panel-muted transition-colors hover:text-panel-text"
                aria-label="Fullscreen"
              >
                <Maximize2 size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {item.previewUrl && !imgError ? (
            <img
              src={item.previewUrl}
              alt={item.title || "Post image preview"}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`h-full w-full object-contain transition-opacity duration-200 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-panel-muted">
              <ImageIcon size={28} strokeWidth={1.5} aria-hidden="true" />
              <span className="mono-meta">
                {item.width} × {item.height}
              </span>
            </div>
          )}

          {/* Top metadata pill for image */}
          <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
            <span className="mono-meta rounded-xs bg-panel/80 px-2 py-1 text-[11px] font-medium text-panel-text backdrop-blur-xs border border-panel-border/50">
              {item.format}
            </span>
            <span className="mono-meta rounded-xs bg-panel/80 px-2 py-1 text-[11px] text-panel-text backdrop-blur-xs border border-panel-border/50">
              {item.width} × {item.height}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
