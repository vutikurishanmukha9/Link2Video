import { BrandWordmark } from "@/components/brand/BrandWordmark";

const NAV_LINKS = [
  { label: "Product", href: "#downloader" },
  { label: "Supported platforms", href: "#platforms" },
  { label: "How it works", href: "#how-it-works" },
];

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border bg-surface-sunken/30 py-3.5 sm:mt-10 sm:py-4">
      <div className="shell flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        {/* Left: Brand Wordmark */}
        <div className="shrink-0">
          <BrandWordmark size="sm" />
        </div>

        {/* Center: Fair use disclaimer on the same line */}
        <p className="max-w-[55ch] text-[11.5px] leading-relaxed text-text-muted lg:max-w-none">
          Link 2 Download retrieves publicly accessible media only. Respect copyright and the rights
          of original creators.
        </p>

        {/* Right: Clean Nav Links */}
        <nav aria-label="Footer navigation" className="shrink-0">
          <ul className="flex items-center gap-4 sm:gap-5">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[12px] font-medium text-text-secondary transition-colors duration-150 hover:text-text sm:text-[12.5px]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
