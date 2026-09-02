interface Props {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
  withLogo?: boolean;
}

export function BrandWordmark({ className = "", size = "md", withLogo = false }: Props) {
  const heights = {
    sm: "h-[18px]",
    md: "h-[24px]",
    lg: "h-[30px]",
    hero: "h-9 sm:h-12 lg:h-[48px]",
  }[size];

  const src = withLogo ? "/logo.png" : "/wordmark.png";

  return (
    <img
      src={src}
      alt="Link 2 Download"
      className={`${heights} w-auto object-contain select-none max-w-full ${className}`}
      loading="eager"
    />
  );
}
