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
  const [activeSection, setActiveSection] = useState("downloader");

  // Track active section for desktop navigation highlight
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const platformsEl = document.getElementById("platforms");
      const howEl = document.getElementById("how-it-works");
      const faqEl = document.getElementById("faq");

      if (faqEl && scrollY >= faqEl.offsetTop - 200) {
        setActiveSection("faq");
      } else if (howEl && scrollY >= howEl.offsetTop - 200) {
        setActiveSection("how-it-works");
      } else if (platformsEl && scrollY >= platformsEl.offsetTop - 200) {
        setActiveSection("platforms");
      } else {
        setActiveSection("downloader");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (href === "#top" || href === "#downloader") {
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
    <header className="sticky top-0 z-40 border-b border-black/15 bg-canvas/90 backdrop-blur-md">
      <nav className="shell flex h-14 items-center justify-between" aria-label="Primary navigation">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            triggerHomeReset();
          }}
          className="flex items-center gap-2.5 rounded-sm transition-opacity hover:opacity-90 cursor-pointer"
          aria-label="Link 2 Download Home - Reset (Esc)"
          title="Return home and reset (Esc)"
        >
          <img
            src="/favicon.svg"
            alt="Link 2 Download"
            className="h-7 w-7 rounded-lg object-contain shadow-xs shrink-0 select-none"
          />
          <BrandWordmark size="md" />
        </a>

        {/* Center links with active pill */}
        <ul className="hidden items-center gap-1.5 md:flex">
          {LINKS.map((l) => {
            const sectionId = l.href.replace("#", "");
            const isActive =
              (sectionId === "downloader" && activeSection === "downloader") ||
              (sectionId === "top" && activeSection === "downloader") ||
              sectionId === activeSection;

            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => handleScrollTo(e, l.href)}
                  className={`rounded-full px-3.5 py-1 text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                      : "text-text-secondary hover:text-text hover:bg-black/5"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right action */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a
            href="#downloader"
            onClick={(e) => handleScrollTo(e, "#downloader")}
            className="flex h-9 items-center rounded-xl border border-black bg-zinc-900 px-4 text-[13px] font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black active:scale-[0.98]"
          >
            Open downloader
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:text-text md:hidden"
        >
          {open ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <ul className="shell flex flex-col py-3">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={(e) => handleScrollTo(e, l.href)}
                  className="flex h-11 items-center text-[14px] text-text-secondary transition-colors hover:text-text"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2 mt-1 border-t border-border">
              <a
                href="#downloader"
                onClick={(e) => handleScrollTo(e, "#downloader")}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-text text-[13px] font-medium text-surface transition-opacity active:scale-[0.99]"
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
