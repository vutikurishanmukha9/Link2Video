interface Props {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}

/**
 * Neobrutalism Brand Wordmark: "Link 2 Download"
 *
 * Font: Archivo Black (var(--font-head))
 * High contrast with bold "2" inside a signature yellow pill badge
 */
export function BrandWordmark({ className = "", size = "md" }: Props) {
  const config = {
    sm: {
      text: "text-sm",
      badge: "px-1.5 py-0.5 text-xs border-[1.5px] mx-1 -translate-y-0.5",
    },
    md: {
      text: "text-lg",
      badge: "px-2 py-0.5 text-xs border-2 mx-1.5 -translate-y-0.5",
    },
    lg: {
      text: "text-2xl",
      badge: "px-2.5 py-1 text-sm border-2 mx-2 -translate-y-1",
    },
    hero: {
      text: "text-3xl sm:text-5xl md:text-6xl tracking-tight",
      badge:
        "px-3 sm:px-4 py-0.5 sm:py-1 text-xl sm:text-3xl border-2 sm:border-[3px] mx-2 sm:mx-3 -translate-y-1 shadow-sm",
    },
  } as const;

  const s = config[size];

  return (
    <span
      className={`select-none inline-flex items-center font-head tracking-tight text-foreground ${s.text} ${className}`}
      aria-label="Link 2 Download"
    >
      <span>Link</span>
      <span
        className={`inline-flex items-center justify-center font-head rounded-xs border-black bg-primary text-black shadow-xs font-black ${s.badge}`}
      >
        2
      </span>
      <span>Download</span>
    </span>
  );
}
