import { useCallback, useEffect, useState } from "react";
import {
  Menu,
  X,
  FolderOpen,
  Sun,
  Moon,
  Download,
  Layers,
  Compass,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";

const LINKS = [
  { label: "Downloader", href: "#downloader" },
  { label: "Platforms", href: "#platforms" },
  { label: "Library", href: "#library" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

interface MobileNavItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: typeof Download;
  badgeClass: string;
}

const NAV_ITEMS: MobileNavItem[] = [
  {
    id: "downloader",
    label: "Downloader",
    sublabel: "4K video, Reels & high-bitrate MP3",
    href: "#downloader",
    icon: Download,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
  },
  {
    id: "platforms",
    label: "Supported Platforms",
    sublabel: "Instagram, TikTok, YouTube, Reddit & 20+",
    href: "#platforms",
    icon: Layers,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20",
  },
  {
    id: "library",
    label: "Media Library",
    sublabel: "Offline saved files & media history",
    href: "#library",
    icon: FolderOpen,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20",
  },
  {
    id: "how-it-works",
    label: "How It Works",
    sublabel: "3-step link extraction guide",
    href: "#how-it-works",
    icon: Compass,
    badgeClass: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20",
  },
  {
    id: "faq",
    label: "FAQ & Troubleshooting",
    sublabel: "Watermarks, privacy & formats",
    href: "#faq",
    icon: HelpCircle,
    badgeClass: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20",
  },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("downloader");
  const [isDark, setIsDark] = useState(false);
  const { count } = useDownloadHistory();

  // Initialize and sync AMOLED Dark Theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("link2download-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = saved === "dark" || (!saved && prefersDark);
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", "#000000");
    } else {
      document.documentElement.classList.remove("dark");
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", "#d8e2ec");
    }
  }, []);

  const toggleTheme = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {
        /* ignore */
      }
    }
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("link2download-theme", "dark");
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", "#000000");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("link2download-theme", "light");
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", "#d8e2ec");
    }
  };

  // Track active section for navigation highlight
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const platformsEl = document.getElementById("platforms");
      const libraryEl = document.getElementById("library");
      const howEl = document.getElementById("how-it-works");
      const faqEl = document.getElementById("faq");

      if (faqEl && scrollY >= faqEl.offsetTop - 200) {
        setActiveSection("faq");
      } else if (howEl && scrollY >= howEl.offsetTop - 200) {
        setActiveSection("how-it-works");
      } else if (libraryEl && scrollY >= libraryEl.offsetTop - 200) {
        setActiveSection("library");
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
    <header className="sticky top-0 z-40 border-b border-black/15 dark:border-white/15 bg-canvas/90 backdrop-blur-md">
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
                      : "text-text-secondary hover:text-text hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right action */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="native-tap flex h-9 w-9 items-center justify-center rounded-xl border border-black/20 dark:border-white/20 bg-surface text-text shadow-xs transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]"
            title={isDark ? "Switch to Light Mode" : "Switch to AMOLED Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to AMOLED Dark Mode"}
          >
            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-zinc-700" />}
          </button>

          <a
            href="#library"
            onClick={(e) => handleScrollTo(e, "#library")}
            className="native-tap flex h-9 items-center gap-1.5 rounded-xl border border-black/20 dark:border-white/20 bg-surface px-3 text-[13px] font-semibold text-text shadow-xs transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]"
            title="Open recent media downloads library"
          >
            <FolderOpen size={15} />
            <span>Library</span>
            {count > 0 && (
              <span className="mono-meta ml-0.5 rounded-full bg-zinc-900 px-1.5 py-0.2 text-[10.5px] font-bold text-white dark:bg-white dark:text-zinc-900">
                {count}
              </span>
            )}
          </a>
          <a
            href="#downloader"
            onClick={(e) => handleScrollTo(e, "#downloader")}
            className="flex h-9 items-center rounded-xl border border-black dark:border-white/20 bg-zinc-900 px-4 text-[13px] font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Open downloader
          </a>
        </div>

        {/* Mobile top-right actions */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="native-tap flex h-9 w-9 items-center justify-center rounded-xl border border-black/15 dark:border-white/20 bg-surface text-text shadow-xs transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
            title={isDark ? "Switch to Light Mode" : "Switch to AMOLED Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to AMOLED Dark Mode"}
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-zinc-700" />}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-xl border border-black/15 dark:border-white/20 bg-surface text-text shadow-xs transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
          >
            {open ? <X size={17} strokeWidth={2} /> : <Menu size={17} strokeWidth={2} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop Scrim */}
      {open && (
        <div
          className="fixed inset-0 top-14 bg-black/60 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sheet */}
      {open && (
        <div className="fixed top-14 left-0 right-0 z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-black/15 dark:border-white/15 bg-surface/98 dark:bg-[#0c0c0e]/98 backdrop-blur-2xl shadow-2xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="shell py-3.5 flex flex-col gap-3">
            {/* Top Engine Status & Theme Selector */}
            <div className="flex items-center justify-between pb-2.5 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Sniffer Active
                </span>
              </div>

              {/* Segmented Dual Theme Switch */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/[0.06] dark:bg-white/[0.08] border border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (isDark) toggleTheme();
                  }}
                  className={`native-tap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    !isDark
                      ? "bg-white text-zinc-950 shadow-xs"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <Sun size={12} className={!isDark ? "text-amber-500" : ""} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDark) toggleTheme();
                  }}
                  className={`native-tap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    isDark
                      ? "bg-[#18181b] text-emerald-400 shadow-xs border border-emerald-500/30"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <Moon size={12} />
                  <span>AMOLED</span>
                </button>
              </div>
            </div>

            {/* Navigation Card Items */}
            <ul className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  (item.id === "downloader" && activeSection === "downloader") ||
                  item.id === activeSection;
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => handleScrollTo(e, item.href)}
                      className={`group native-tap flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 active:scale-[0.99] ${
                        isActive
                          ? "bg-black/[0.04] dark:bg-white/[0.07] border-black/20 dark:border-white/20 text-text shadow-xs"
                          : "bg-transparent border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-text-secondary hover:text-text"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.badgeClass} transition-transform group-hover:scale-105`}
                        >
                          <Icon size={18} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[13.5px] font-semibold tracking-tight text-text">
                              {item.label}
                            </span>
                            {item.id === "library" && count > 0 && (
                              <span className="mono-meta rounded-full bg-emerald-500 px-1.5 py-0.2 text-[10px] font-bold text-white shadow-xs">
                                {count} {count === 1 ? "file" : "files"}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-muted leading-tight">
                            {item.sublabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        <ChevronRight
                          size={15}
                          className="text-text-muted/60 transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
              <a
                href="#downloader"
                onClick={(e) => {
                  handleScrollTo(e, "#downloader");
                  const input = document.getElementById("post-url");
                  if (input) setTimeout(() => input.focus(), 350);
                }}
                className="native-tap flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-[13.5px] font-semibold text-white shadow-md active:scale-[0.99] dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400 transition-all"
              >
                <Download size={15} />
                <span>Open Downloader & Paste URL</span>
              </a>

              <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] text-text-muted">
                <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                <span>Zero telemetry • Watermark-free downloads • 100% Free</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
