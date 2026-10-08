import type { PlatformId } from "@/lib/downloader";

export function PlatformMark({
  platform,
  size = 20,
  className,
}: {
  platform: PlatformId;
  size?: number;
  className?: string;
}) {
  switch (platform) {
    case "instagram":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="ig-rad" cx="20%" cy="105%" r="130%">
              <stop offset="0%" stopColor="#fdf497" />
              <stop offset="10%" stopColor="#fdf497" />
              <stop offset="45%" stopColor="#fd5949" />
              <stop offset="65%" stopColor="#d6249f" />
              <stop offset="90%" stopColor="#285AEB" />
            </radialGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-rad)" />
          <rect
            x="5.5"
            y="5.5"
            width="13"
            height="13"
            rx="3.8"
            stroke="#ffffff"
            strokeWidth="1.8"
            fill="none"
          />
          <circle cx="12" cy="12" r="3.2" stroke="#ffffff" strokeWidth="1.8" fill="none" />
          <circle cx="16.4" cy="7.6" r="1" fill="#ffffff" />
        </svg>
      );

    case "tiktok":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#010101" />
          <path
            d="M16.5 6.2a4.3 4.3 0 0 1-1.2-2.7h-2.5v11.6a2.1 2.1 0 1 1-2.1-2.1c.3 0 .5.1.8.2v-2.7a4.8 4.8 0 1 0 3.8 4.7V8.4a6.8 6.8 0 0 0 3.8 1.2V6.9a4.2 4.2 0 0 1-2.6-.7z"
            fill="#25F4EE"
            transform="translate(-0.7, -0.5)"
          />
          <path
            d="M16.5 6.2a4.3 4.3 0 0 1-1.2-2.7h-2.5v11.6a2.1 2.1 0 1 1-2.1-2.1c.3 0 .5.1.8.2v-2.7a4.8 4.8 0 1 0 3.8 4.7V8.4a6.8 6.8 0 0 0 3.8 1.2V6.9a4.2 4.2 0 0 1-2.6-.7z"
            fill="#FE2C55"
            transform="translate(0.7, 0.5)"
          />
          <path
            d="M16.5 6.2a4.3 4.3 0 0 1-1.2-2.7h-2.5v11.6a2.1 2.1 0 1 1-2.1-2.1c.3 0 .5.1.8.2v-2.7a4.8 4.8 0 1 0 3.8 4.7V8.4a6.8 6.8 0 0 0 3.8 1.2V6.9a4.2 4.2 0 0 1-2.6-.7z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "youtube":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="4.5" fill="#FF0000" />
          <polygon points="10,8.5 16,12 10,15.5" fill="#FFFFFF" />
        </svg>
      );

    case "x":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5.5"
            fill="#000000"
            stroke="#333336"
            strokeWidth="1"
          />
          <path
            d="M16.8 5h2.1l-4.6 5.3 5.4 7.2h-4.3l-3.3-4.4-3.8 4.4H6.2l4.9-5.6L5.9 5h4.4l3 4 3.5-4zm-.7 11.5h1.2L9.8 6.2H8.5l7.6 10.3z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "facebook":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#1877F2" />
          <path
            d="M13.4 21.8v-7.6h2.5l.4-3h-2.9V9.3c0-.9.2-1.5 1.5-1.5h1.6V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.1H8v3h2.3v7.6h3.1z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "pinterest":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#E60023" />
          <path
            d="M12 6.5c-3 0-5 2-5 4.8 0 1.8 1 3.1 2.3 3.6.2.1.3 0 .4-.3.1-.2.2-.7.3-.9 0-.2 0-.3-.2-.5-.5-.6-.7-1.3-.7-2.1 0-2 1.5-3.7 3.9-3.7 2.1 0 3.5 1.4 3.5 3.3 0 2.3-1.1 4.1-2.4 4.1-.8 0-1.4-.7-1.2-1.5.2-.9.7-1.9.7-2.6 0-.6-.3-1.1-.9-1.1-.7 0-1.4.8-1.4 1.8 0 .7.2 1.1.2 1.1l-1 4.1c-.3 1.2 0 2.9 0 3.1 0 .1.1.1.2.1.1 0 .2-.2.3-.4.2-.4.8-1.5 1-2.2l.6-2.3c.3.5 1.1 1 1.9 1 2.5 0 4.3-2.3 4.3-5.2C17.9 9 15.3 6.5 12 6.5z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "threads":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5.5"
            fill="#101012"
            stroke="#333336"
            strokeWidth="1"
          />
          <path
            d="M12.16 6.5c-3.4 0-5.46 2.3-5.46 5.5 0 3.3 2.15 5.5 5.46 5.5 2.5 0 4.2-1.3 4.8-3.1l-1.5-.6c-.4 1.2-1.7 2.1-3.3 2.1-2.3 0-3.8-1.5-3.9-3.7h8.8c.1-.4.1-.8.1-1.2 0-3.1-2.1-4.5-4.9-4.5zm-3.8 4.6c.2-1.8 1.6-3.1 3.7-3.1s3.4 1.3 3.5 3.1H8.36z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "soundcloud":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="18" rx="5" fill="#FF5500" />
          <path
            d="M5.5 14.5v-1M7.5 16v-4M9.5 17v-6M11.5 18v-8M13.5 18v-8M15.5 18a3 3 0 0 0 3-3 3 3 0 0 0-3-3 3.2 3.2 0 0 0-.8.1A4.2 4.2 0 0 0 13.8 7a4.2 4.2 0 0 0-4.2 4.2c0 .3 0 .5.1.7"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "bandcamp":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#1DA0C3" />
          <polygon points="6,15.5 10.5,8.5 18,8.5 13.5,15.5" fill="#FFFFFF" />
        </svg>
      );

    case "twitch":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#9146FF" />
          <path d="M5.5 5h13v9.5l-3.5 3.5h-3l-2 2V18h-4.5V5z" fill="#FFFFFF" />
          <rect x="10" y="8.5" width="1.6" height="4" fill="#9146FF" />
          <rect x="13.5" y="8.5" width="1.6" height="4" fill="#9146FF" />
        </svg>
      );

    case "linkedin":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#0A66C2" />
          <circle cx="6.5" cy="7" r="1.5" fill="#FFFFFF" />
          <rect x="5.2" y="9.8" width="2.6" height="8.2" fill="#FFFFFF" />
          <path
            d="M10.2 9.8h2.5v1.2h.1c.4-.7 1.3-1.4 2.7-1.4 2.8 0 3.3 1.8 3.3 4.2V18h-2.6v-3.7c0-.9 0-2-1.3-2-1.3 0-1.5 1-1.5 2V18h-2.6V9.8z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "reddit":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#FF4500" />
          <circle cx="12" cy="12.5" r="5.2" fill="#FFFFFF" />
          <circle cx="9.8" cy="11.8" r="1" fill="#FF4500" />
          <circle cx="14.2" cy="11.8" r="1" fill="#FF4500" />
          <path
            d="M10.2 14.5c1 .8 2.6.8 3.6 0"
            stroke="#FF4500"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="6" cy="12.5" r="1.5" fill="#FFFFFF" />
          <circle cx="18" cy="12.5" r="1.5" fill="#FFFFFF" />
          <path
            d="M14.5 7.5l-2.2.5-1 3.5"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="15" cy="7.2" r="1" fill="#FFFFFF" />
        </svg>
      );

    case "terabox":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#0086FF" />
          <polygon points="12,5.5 18,9 12,12.5 6,9" fill="#E0F2FE" />
          <polygon points="12,12.5 18,9 18,16 12,19.5" fill="#BAE6FD" />
          <polygon points="12,12.5 6,9 6,16 12,19.5" fill="#FFFFFF" />
          <circle cx="12" cy="12.5" r="1.6" fill="#0086FF" />
        </svg>
      );

    case "mega":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#D9272E" />
          <path d="M7.5 16V8.5l4.5 4.2 4.5-4.2V16h-2v-4.5l-2.5 2.3-2.5-2.3V16h-2z" fill="#FFFFFF" />
        </svg>
      );

    case "gdrive":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5.5"
            fill="#121316"
            stroke="#2B2D33"
            strokeWidth="1"
          />
          <polygon points="8.5,4.8 15.5,4.8 20.2,13 13.2,13" fill="#FFC107" />
          <polygon points="13.2,13 20.2,13 16.7,19.2 9.7,19.2" fill="#2196F3" />
          <polygon points="5,14 8.5,7.8 12,14 8.5,20.2" fill="#4CAF50" />
        </svg>
      );

    case "mediafire":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#1299F3" />
          <path
            d="M12 5.5c.8 2.5 3 4.5 3 7a4 4 0 0 1-8 0c0-2.5 2-5 3-7 .2 1.5 1 3 2 4 1-1.5 0-3 0-4z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "dropbox":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#0061FE" />
          <polygon points="7,6 12,9.2 7,12.4 2,9.2" fill="#FFFFFF" />
          <polygon points="17,6 22,9.2 17,12.4 12,9.2" fill="#FFFFFF" />
          <polygon points="7,12.4 12,15.6 7,18.8 2,15.6" fill="#FFFFFF" />
          <polygon points="17,12.4 22,15.6 17,18.8 12,15.6" fill="#FFFFFF" />
          <polygon points="12,15.8 17,12.6 14.5,10.6 12,12.2 9.5,10.6 7,12.6" fill="#E0EDFF" />
        </svg>
      );

    case "web":
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#00C853" />
          <circle cx="12" cy="12" r="7" stroke="#FFFFFF" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="3.3" ry="7" stroke="#FFFFFF" strokeWidth="1.3" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="#FFFFFF" strokeWidth="1.3" />
        </svg>
      );
  }
}
