import { useState, useEffect, useRef } from "react";
import { Download, Grid, Compass, FolderOpen, Smartphone } from "lucide-react";
import { InstallAppSheet } from "./InstallAppSheet";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";

interface Tab {
  id: string;
  label: string;
  icon: typeof Download;
  href?: string;
}

const TABS: Tab[] = [
  { id: "downloader", label: "Downloader", icon: Download, href: "#top" },
  { id: "library", label: "Library", icon: FolderOpen, href: "#library" },
  { id: "platforms", label: "Platforms", icon: Grid, href: "#platforms" },
  { id: "how-it-works", label: "Guide", icon: Compass, href: "#how-it-works" },
  { id: "app", label: "Get App", icon: Smartphone },
];

export function MobileTabBar() {
  const [activeTab, setActiveTab] = useState("downloader");
  const [showInstallSheet, setShowInstallSheet] = useState(false);
  const { count } = useDownloadHistory();
  const isClickScrollingRef = useRef(false);

  // Sync active tab with scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      const scrollY = window.scrollY;
      const libraryEl = document.getElementById("library");
      const howEl = document.getElementById("how-it-works");
      const platformsEl = document.getElementById("platforms");

      if (howEl && scrollY >= howEl.offsetTop - 200) {
        setActiveTab("how-it-works");
      } else if (libraryEl && scrollY >= libraryEl.offsetTop - 200) {
        setActiveTab("library");
      } else if (platformsEl && scrollY >= platformsEl.offsetTop - 200) {
        setActiveTab("platforms");
      } else {
        setActiveTab("downloader");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabClick = (tab: Tab) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {
        /* ignore */
      }
    }

    if (tab.id === "app") {
      setShowInstallSheet(true);
      return;
    }

    setActiveTab(tab.id);
    isClickScrollingRef.current = true;
    setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 800);

    if (tab.id === "downloader") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const input = document.getElementById("post-url");
      if (input) {
        setTimeout(() => input.focus(), 300);
      }
      return;
    }

    if (tab.href) {
      const id = tab.href.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.id === activeTab),
  );

  return (
    <>
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-black/10 dark:border-white/15 bg-surface/92 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 pb-[max(env(safe-area-inset-bottom,0px),8px)]"
      >
        <div className="relative flex h-14 items-center justify-around">
          {/* Animated Sliding Pill Track Indicator (Exact 20% per tab) */}
          <div
            className="pointer-events-none absolute top-1.5 left-0 flex h-7 items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              width: "20%",
              transform: `translateX(${activeIndex * 100}%)`,
            }}
            aria-hidden="true"
          >
            <div className="h-7 w-12 rounded-full bg-zinc-900 shadow-sm dark:bg-white transition-all duration-200" />
          </div>

          {/* Interactive Navigation Tab Buttons */}
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className="native-tap relative z-10 flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center transition-transform duration-150 active:scale-95 focus:outline-none"
              >
                <div className="relative flex h-7 w-12 items-center justify-center rounded-full">
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    className={`transition-all duration-200 ${
                      isActive
                        ? "scale-105 text-white dark:text-zinc-900"
                        : "text-text-muted hover:text-text"
                    }`}
                  />
                  {tab.id === "library" && count > 0 && (
                    <span className="absolute -top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white shadow-xs">
                      {count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10.5px] font-medium leading-none tracking-tight transition-colors duration-200 ${
                    isActive ? "text-zinc-900 dark:text-white font-semibold" : "text-text-muted"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <InstallAppSheet
        open={showInstallSheet}
        onClose={() => {
          setShowInstallSheet(false);
        }}
      />
    </>
  );
}
