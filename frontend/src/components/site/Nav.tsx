import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";

const LINKS = [
  { label: "Downloader", href: "#downloader" },
  { label: "Supported platforms", href: "#platforms" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  const triggerHomeReset = useCallback(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
    // Blur any active inputs or buttons
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Signal all components (downloader, analysis, modals) to abort and reset
    window.dispatchEvent(new CustomEvent("app:reset"));
  }, []);

  // Global ESC key listener to abort any action, clear state, and return to home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggerHomeReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerHomeReset]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    if (href === "#top") {
      triggerHomeReset();
      return;
    }
    const id = href.replace("#", "");
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-background/95 backdrop-blur-md">
      <nav className="shell flex h-16 items-center justify-between" aria-label="Primary navigation">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            triggerHomeReset();
          }}
          className="flex items-center gap-2.5 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          aria-label="Link 2 Download Home - Reset (Esc)"
          title="Return home and reset (Esc)"
        >
          <img
            src="/favicon.svg"
            alt="Link 2 Download"
            className="h-8 w-8 rounded-xs border-2 border-black bg-primary object-contain p-0.5 shadow-xs shrink-0 select-none"
          />
          <BrandWordmark size="md" />
        </a>

        {/* Center links */}
        <ul className="hidden items-center gap-1.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => handleScrollTo(e, l.href)}
                className="rounded-xs border-2 border-transparent px-3 py-1 text-sm font-head text-foreground transition-all duration-150 hover:border-black hover:bg-card hover:shadow-xs"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right action */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <a
            href="#downloader"
            onClick={(e) => handleScrollTo(e, "#downloader")}
            className="inline-flex h-9 items-center justify-center rounded-xs border-2 border-black bg-primary px-4 text-xs font-head text-black shadow-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Open downloader
          </a>
        </div>

        {/* Mobile / Tablet menu button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-1 flex h-10 w-10 items-center justify-center rounded-xs border-2 border-black bg-card text-foreground shadow-xs transition-all hover:bg-muted active:shadow-none lg:hidden"
        >
          {open ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
        </button>
      </nav>

      {/* Mobile / Tablet drawer */}
      {open && (
        <div className="border-t-2 border-black bg-background shadow-lg lg:hidden">
          <ul className="shell flex flex-col py-4 gap-2">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={(e) => handleScrollTo(e, l.href)}
                  className="flex h-11 items-center px-3 rounded-xs border-2 border-black bg-card font-head text-sm text-foreground shadow-xs hover:bg-muted"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#downloader"
                onClick={(e) => handleScrollTo(e, "#downloader")}
                className="flex h-11 w-full items-center justify-center rounded-xs border-2 border-black bg-primary font-head text-sm text-black shadow-sm transition-all active:shadow-none"
              >
                Open downloader
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
