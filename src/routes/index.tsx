import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Features, Platforms, HowItWorks } from "@/components/site/Sections";
import { Downloader } from "@/components/downloader/Downloader";

const TITLE = "Conduit — Download media from any public post";
const DESCRIPTION =
  "Paste a public Instagram, X, Facebook, LinkedIn or Reddit post URL and retrieve the available photos and videos. No account required.";

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

      <main>
        <section id="downloader" className="shell scroll-mt-20 pt-12 pb-2 sm:pt-16">
          <div className="max-w-[720px]">
            <p className="mono-meta tracking-[0.08em] text-text-muted uppercase">Download media</p>
            <h1 className="display-tight mt-3 text-[34px] leading-[1.05] sm:text-[44px] lg:text-[52px]">
              One link.
              <br />
              Everywhere.
            </h1>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-text-secondary">
              Paste a public post URL and retrieve the available photos or videos.
            </p>
          </div>

          <div className="mt-8">
            <Downloader />
          </div>
        </section>

        <Features />
        <Platforms />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
