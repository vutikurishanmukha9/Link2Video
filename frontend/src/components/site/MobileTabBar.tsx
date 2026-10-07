import { useState, useEffect, useRef } from "react";
import { Download, Grid, Compass, HelpCircle, Smartphone } from "lucide-react";
import { InstallAppSheet } from "./InstallAppSheet";

interface Tab {
  id: string;
  label: string;
  icon: typeof Download;
  href?: string;
}

const TABS: Tab[] = [
  { id: "downloader", label: "Downloader", icon: Download, href: "#top" },
  { id: "platforms", label: "Platforms", icon: Grid, href: "#platforms" },
  { id: "how-it-works", label: "How It Works", icon: Compass, href: "#how-it-works" },
  { id: "faq", label: "FAQ", icon: HelpCircle, href: "#faq" },
  { id: "app", label: "Get App", icon: Smartphone },
];

export function MobileTabBar() {
  const [activeTab, setActiveTab] = useState("downloader");
  const [showInstallSheet, setShowInstallSheet] = useState(false);
  const isClickScrollingRef = useRef(false);

  // Sync active tab with scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      const scrollY = window.scrollY;
      const platformsEl = document.getElementById("platforms");
      const howEl = document.getElementById("how-it-works");
      const faqEl = document.getElementById("faq");

      if (faqEl && scrollY >= faqEl.offsetTop - 200) {
        setActiveTab("faq");
      } else if (howEl && scrollY >= howEl.offsetTop - 200) {
        setActiveTab("how-it-works");
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
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t-2 border-black bg-surface/98 backdrop-blur-xl shadow-[0_-6px_24px_rgba(0,0,0,0.08)] transition-all duration-300 pb-[max(env(safe-area-inset-bottom,0px),8px)]"
      >
        <div className="relative flex h-14 items-center justify-around px-2">
          {/* Animated Sliding Pill Track Indicator */}
          <div
            className="pointer-events-none absolute top-1.5 left-2 flex h-7 items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              width: "calc((100% - 16px) / 5)",
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
                <div className="flex h-7 w-12 items-center justify-center rounded-full">
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    className={`transition-all duration-200 ${
                      isActive
                        ? "scale-105 text-white dark:text-zinc-900"
                        : "text-text-muted hover:text-text"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10.5px] font-medium leading-none tracking-tight transition-colors duration-200 ${
                    isActive
                      ? "text-zinc-900 dark:text-white font-semibold"
                      : "text-text-muted"
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
          const scrollY = window.scrollY;
          const platformsEl = document.getElementById("platforms");
          const howEl = document.getElementById("how-it-works");
          const faqEl = document.getElementById("faq");
          if (faqEl && scrollY >= faqEl.offsetTop - 200) {
            setActiveTab("faq");
          } else if (howEl && scrollY >= howEl.offsetTop - 200) {
            setActiveTab("how-it-works");
          } else if (platformsEl && scrollY >= platformsEl.offsetTop - 200) {
            setActiveTab("platforms");
          } else {
            setActiveTab("downloader");
          }
        }}
      />
    </>
  );
}
