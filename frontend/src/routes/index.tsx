import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Features, Platforms, HowItWorks } from "@/components/site/Sections";
import { Downloader } from "@/components/downloader/Downloader";
import { BrandWordmark } from "@/components/brand/BrandWordmark";

const TITLE = "Link 2 Download";
const DESCRIPTION =
  "Universal public media downloader for Instagram, YouTube, X, Facebook, LinkedIn, and Reddit.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div id="top" className="min-h-screen">
      <Nav />

      <main className="pb-4">
        {/* Compact Product-First Hero (Directive Sec 10 & 37) */}
        <section id="downloader" className="shell scroll-mt-16 pt-7 pb-1 sm:pt-9">
          <div className="max-w-[680px]">
            <div className="flex items-center gap-2">
              <p className="mono-meta tracking-[0.08em] text-text-muted uppercase text-[11px]">
                Multi-Platform Media Downloader
              </p>
            </div>
            <h1 className="mt-2.5 mb-1 leading-[1.08]">
              <BrandWordmark size="hero" />
            </h1>
            <p className="mt-2.5 max-w-[50ch] text-[15px] leading-relaxed text-text-secondary sm:text-[16px]">
              One link. Everywhere. Paste a public post URL to retrieve available photos and videos.
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
      </main>

      <Footer />
    </div>
  );
}
