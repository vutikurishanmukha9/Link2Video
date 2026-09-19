import { BrandWordmark } from "@/components/brand/BrandWordmark";

const NAV_LINKS = [
  { label: "Downloader", href: "#downloader" },
  { label: "Supported platforms", href: "#platforms" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Footer() {
  return (
    <footer className="mt-16 sm:mt-24 border-t-2 border-black bg-background py-8">
      <div className="shell flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
        {/* Left: Brand Wordmark */}
        <div className="shrink-0">
          <BrandWordmark size="sm" />
        </div>

        {/* Center: Fair use disclaimer */}
        <p className="max-w-[55ch] text-xs font-medium leading-relaxed text-muted-foreground lg:max-w-none">
          Link 2 Download retrieves publicly accessible media only. Respect copyright and the rights
          of original creators.
        </p>

        {/* Right: Neobrutalist Nav Links */}
        <nav aria-label="Footer navigation" className="shrink-0">
          <ul className="flex items-center gap-4 sm:gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-head text-xs uppercase text-foreground transition-colors hover:text-black hover:underline"
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
