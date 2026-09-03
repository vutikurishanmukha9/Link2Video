import type { PlatformId } from "@/lib/downloader";

const PATHS: Record<PlatformId, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  x: <path d="M4 4l7.2 9.1L4.4 20M20 4l-7.4 8.1M9.8 4H4l10.4 16H20L9.8 4z" />,
  facebook: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M14.6 21v-6.6h2.1l.4-2.6h-2.5v-1.6c0-.8.3-1.3 1.4-1.3h1.2V6.6a15 15 0 0 0-1.9-.1c-2 0-3.3 1.2-3.3 3.4v2h-2.2v2.6H12V21" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7.5 10.4V17M7.5 7.4v.1M11.6 17v-3.6c0-1.6 1-2.5 2.3-2.5s2.2.9 2.2 2.6V17" />
    </>
  ),
  reddit: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="13.4" rx="5.4" ry="3.8" />
      <circle cx="9.9" cy="12.9" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14.1" cy="12.9" r="0.8" fill="currentColor" stroke="none" />
      <path d="M10.1 15.6c1.2.7 2.6.7 3.8 0" />
    </>
  ),
  youtube: (
    <>
      <rect x="2" y="4.5" width="20" height="15" rx="4" />
      <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="3.6" y1="9" x2="20.4" y2="9" />
      <line x1="3.6" y1="15" x2="20.4" y2="15" />
      <path d="M11.5 3a17 17 0 0 0 0 18" />
      <path d="M12.5 3a17 17 0 0 1 0 18" />
    </>
  ),
};

export function PlatformMark({
  platform,
  size = 16,
  className,
}: {
  platform: PlatformId;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[platform]}
    </svg>
  );
}
