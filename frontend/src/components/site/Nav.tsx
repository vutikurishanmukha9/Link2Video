import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";

const LINKS = [
  { label: "Downloader", href: "#downloader" },
  { label: "Supported platforms", href: "#platforms" },
  { label: "How it works", href: "#how-it-works" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur-md">
      <nav className="shell flex h-14 items-center justify-between" aria-label="Primary navigation">
        <a
          href="#top"
          className="flex items-center rounded-sm transition-opacity hover:opacity-90"
          aria-label="Link 2 Download Home"
        >
          <BrandWordmark size="md" />
        </a>

        {/* Center links */}
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-md px-3 py-1.5 text-[13.5px] text-text-secondary transition-colors duration-150 hover:text-text"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right action */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a
            href="#downloader"
            className="flex h-9 items-center rounded-lg bg-text px-3.5 text-[13px] font-medium text-surface transition-opacity duration-150 hover:opacity-90 active:scale-[0.99]"
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
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center text-[14px] text-text-secondary transition-colors hover:text-text"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2 mt-1 border-t border-border">
              <a
                href="#downloader"
                onClick={() => setOpen(false)}
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
