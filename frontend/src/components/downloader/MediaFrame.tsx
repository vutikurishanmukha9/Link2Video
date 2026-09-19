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
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
        role="img"
        aria-label={`${item.kind === "video" ? "Video" : "Image"} thumbnail`}
      >
        {item.previewUrl && !imgError ? (
          <img
            src={item.previewUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover opacity-90 transition-opacity duration-150 hover:opacity-100"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-white/70">
            {item.kind === "video" ? (
              <Play size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <ImageIcon size={16} strokeWidth={2} aria-hidden="true" />
            )}
            <span className="font-head text-[10px] uppercase">{item.format}</span>
          </div>
        )}

        {/* Thumbnail micro badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="rounded-xs border border-black bg-primary px-1.5 py-0.5 font-head text-[10px] text-black shadow-xs">
            {item.format.toUpperCase()}
          </span>
        </div>

        {item.kind === "video" && (
          <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-xs border border-black bg-black px-1.5 py-0.5 text-white shadow-xs">
            <Play
              size={10}
              strokeWidth={2.5}
              className="text-primary fill-primary"
              aria-hidden="true"
            />
            {item.durationSeconds && (
              <span className="font-head text-[10px] text-white">
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
      className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xs border-2 border-black bg-black shadow-md"
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

          {/* Top metadata pills */}
          <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none z-10">
            <span className="inline-flex items-center gap-1 rounded-xs border-2 border-black bg-primary px-2.5 py-1 font-head text-xs text-black shadow-xs">
              {item.format.toUpperCase()} ·{" "}
              {item.height >= 1080
                ? "1080p HD"
                : item.height >= 720
                  ? "720p HD"
                  : `${item.height}p`}
            </span>
            {item.durationSeconds && (
              <span className="rounded-xs border-2 border-black bg-card px-2.5 py-1 font-head text-xs text-foreground shadow-xs">
                {formatDuration(item.durationSeconds)}
              </span>
            )}
          </div>

          {/* Center Play/Pause button */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className={`absolute z-10 flex h-16 w-16 items-center justify-center rounded-xs border-2 border-black bg-primary text-black shadow-md transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            }`}
          >
            {isPlaying ? (
              <Pause size={26} strokeWidth={2.5} />
            ) : (
              <Play size={26} strokeWidth={2.5} className="translate-x-0.5 fill-black" />
            )}
          </button>

          {/* Custom bottom playback bar */}
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-8 transition-opacity duration-150 group-hover:opacity-100 opacity-95 z-10">
            {/* Scrubber track */}
            <div
              onClick={handleSeek}
              className="relative h-2 w-full cursor-pointer overflow-hidden rounded-xs border border-black bg-white/20 transition-all hover:h-2.5"
              role="slider"
              aria-label="Video timeline scrubber"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className="h-full bg-primary transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Bottom mini controls */}
            <div className="mt-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-7 w-7 items-center justify-center rounded-xs border border-white/40 bg-black/60 text-white transition-colors hover:bg-primary hover:text-black hover:border-black"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={14} strokeWidth={2.5} />
                  ) : (
                    <Play size={14} strokeWidth={2.5} className="translate-x-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-7 w-7 items-center justify-center rounded-xs border border-white/40 bg-black/60 text-white transition-colors hover:bg-primary hover:text-black hover:border-black"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX size={14} strokeWidth={2.5} />
                  ) : (
                    <Volume2 size={14} strokeWidth={2.5} />
                  )}
                </button>
                {item.durationSeconds && (
                  <span className="font-head text-xs text-white/80">
                    {formatDuration(Math.round(videoRef.current?.currentTime || 0))} /{" "}
                    {formatDuration(item.durationSeconds)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleFullscreen}
                className="flex h-7 w-7 items-center justify-center rounded-xs border border-white/40 bg-black/60 text-white transition-colors hover:bg-primary hover:text-black hover:border-black"
                aria-label="Fullscreen"
              >
                <Maximize2 size={14} strokeWidth={2.5} />
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
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`h-full w-full object-contain transition-opacity duration-200 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/60">
              <ImageIcon size={32} strokeWidth={2} aria-hidden="true" />
              <span className="font-head text-xs">
                {item.width} × {item.height}
              </span>
            </div>
          )}

          {/* Top metadata pill for image */}
          <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none z-10">
            <span className="rounded-xs border-2 border-black bg-primary px-2.5 py-1 font-head text-xs text-black shadow-xs">
              {item.format.toUpperCase()}
            </span>
            <span className="rounded-xs border-2 border-black bg-card px-2.5 py-1 font-head text-xs text-foreground shadow-xs">
              {item.width} × {item.height}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
