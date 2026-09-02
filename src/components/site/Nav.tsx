import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Downloader", href: "#downloader" },
  { label: "Supported platforms", href: "#platforms" },
  { label: "How it works", href: "#how-it-works" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur-[6px]">
      <nav className="shell flex h-14 items-center justify-between" aria-label="Primary">
        <a href="#top" className="flex items-center gap-2 rounded-sm text-[15px] font-medium tracking-[-0.01em]">
          <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-text text-[10px] font-semibold text-surface">
            C
          </span>
          Conduit
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-sm px-3 py-1.5 text-[14px] text-text-secondary transition-colors duration-150 hover:text-text"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="https://github.com"
            className="rounded-md px-3 py-1.5 text-[14px] text-text-secondary transition-colors duration-150 hover:text-text"
          >
            Documentation
          </a>
          <a
            href="#downloader"
            className="rounded-md bg-text px-3 py-1.5 text-[14px] font-medium text-surface transition-opacity duration-150 hover:opacity-90"
          >
            Open downloader
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:text-text md:hidden"
        >
          {open ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <ul className="shell flex flex-col py-2">
            {[...LINKS, { label: "Documentation", href: "https://github.com" }].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center text-[15px] text-text-secondary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
