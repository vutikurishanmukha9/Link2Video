import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Features, Platforms, HowItWorks } from "@/components/site/Sections";
import { FaqSection } from "@/components/site/FaqSection";
import { Downloader } from "@/components/downloader/Downloader";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import {
  JSON_LD_WEBAPP,
  JSON_LD_FAQ,
  JSON_LD_HOWTO,
  JSON_LD_WEBSITE,
  SITE_URL,
} from "@/lib/seo-schema";

const TITLE = "Link2Download - Download Any Video, Anywhere";
const DESCRIPTION =
  "Free online public media downloader. Save HD videos (1080p/4K), Instagram Reels, YouTube Shorts, X/Twitter clips, Facebook videos, and MP3 audio tracks directly with zero ads or watermarks.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "video downloader, youtube video downloader, instagram reel downloader, x video saver, twitter video downloader, reddit video with sound, facebook reel downloader, linkedin video downloader, download mp4, extract mp3 audio, media downloader online, free video saver, youtube shorts download, 1080p video downloader",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      // Open Graph / Facebook
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Link 2 Download" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/logo.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Link 2 Download - Fast Video Downloader" },
      { property: "og:locale", content: "en_US" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/logo.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "icon", href: "/favicon.svg?v=3", type: "image/svg+xml" },
      { rel: "shortcut icon", href: "/favicon.svg?v=3", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg?v=3" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(JSON_LD_WEBAPP),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(JSON_LD_FAQ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(JSON_LD_HOWTO),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(JSON_LD_WEBSITE),
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.location.hash || window.location.hash === "#top") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
    }
  }, []);

  return (
    <div id="top" className="min-h-screen">
      <Nav />

      <main className="pb-4">
        {/* Compact Product-First Hero */}
        <section id="downloader" className="shell scroll-mt-16 pt-8 pb-2 sm:pt-12">
          <div className="mx-auto max-w-[840px] text-center flex flex-col items-center">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xs border-2 border-black bg-primary px-3.5 py-1 font-head text-xs font-bold text-black shadow-xs">
                MULTI-PLATFORM MEDIA DOWNLOADER
              </span>
            </div>
            <h1 className="mt-4 mb-2 flex items-center justify-center leading-none">
              <BrandWordmark size="hero" className="mx-auto" />
            </h1>
            <p className="mt-3 text-center text-base sm:text-lg font-medium leading-relaxed text-foreground/80 max-w-[620px]">
              One link. Everywhere. Paste any public post URL to extract HD videos, reels, audio
              tracks, and photos directly with zero watermarks.
            </p>
          </div>

          <div className="mt-5 sm:mt-6">
            <Downloader />
          </div>
        </section>

        {/* Compact Product Sections with Controlled Rhythm */}
        <Features />
        <Platforms />
        <HowItWorks />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
