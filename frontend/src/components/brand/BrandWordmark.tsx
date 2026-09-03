interface Props {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}

/**
 * Pure code-based brand wordmark: "Link 2 Download"
 *
 * Font: Poppins 700
 * "Link" and "Download": deep navy (#101A2E), adapts via CSS variable for dark contexts
 * "2": 3-stop blue gradient (160deg) matching the brand identity
 *
 * Replaces the old PNG-based wordmark -- no more dark mode artifacts.
 */
export function BrandWordmark({ className = "", size = "md" }: Props) {
  const config = {
    sm: { fontSize: "15px", spacing: "-0.5px", margin: "0 2px" },
    md: { fontSize: "19px", spacing: "-0.8px", margin: "0 2.5px" },
    lg: { fontSize: "26px", spacing: "-1.2px", margin: "0 3.5px" },
    hero: { fontSize: "clamp(28px, 5vw, 44px)", spacing: "-1.5px", margin: "0 5px" },
  } as const;

  const s = config[size];

  const baseStyle: React.CSSProperties = {
    fontFamily: "'Poppins', 'Century Gothic', 'Segoe UI', sans-serif",
    fontWeight: 700,
    fontSize: s.fontSize,
    letterSpacing: s.spacing,
    lineHeight: 1.1,
    display: "inline-flex",
    alignItems: "baseline",
    whiteSpace: "nowrap",
  };

  const darkStyle: React.CSSProperties = {
    color: "var(--text, #101A2E)",
  };

  const twoStyle: React.CSSProperties = {
    background: "linear-gradient(160deg, #4FA6FF 0%, #2277F5 55%, #0A3FE0 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    margin: s.margin,
  };

  return (
    <span
      className={`select-none ${className}`}
      style={baseStyle}
      aria-label="Link 2 Download"
    >
      <span style={darkStyle}>Link</span>
      <span style={twoStyle}>2</span>
      <span style={darkStyle}>Download</span>
    </span>
  );
}
