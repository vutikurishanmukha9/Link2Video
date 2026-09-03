import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Link2Download - Download Any Video, Anywhere" },
      {
        name: "description",
        content:
          "Free online public media downloader. Save HD videos (1080p/4K), Instagram Reels, YouTube Shorts, X/Twitter clips, Facebook videos, and MP3 audio tracks directly with zero ads or watermarks.",
      },
      {
        name: "keywords",
        content:
          "video downloader, youtube video downloader, instagram reel downloader, x video saver, twitter video downloader, reddit video with sound, facebook reel downloader, linkedin video downloader, download mp4, extract mp3 audio, media downloader online, free video saver, youtube shorts download",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "theme-color", content: "#08090B" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Link 2 Download" },
      { name: "application-name", content: "Link 2 Download" },
      // Open Graph / Facebook
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Link 2 Download" },
      { property: "og:title", content: "Link2Download - Download Any Video, Anywhere" },
      {
        property: "og:description",
        content:
          "Save videos, reels, and original audio in 1080p Full HD from YouTube, Instagram, X, Facebook, LinkedIn & Reddit with zero quality loss.",
      },
      { property: "og:url", content: "https://link2video.onrender.com/" },
      { property: "og:image", content: "https://link2video.onrender.com/logo.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Link 2 Download Interface Preview" },
      { property: "og:locale", content: "en_US" },
      // Twitter Cards
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Link2Download - Download Any Video, Anywhere" },
      {
        name: "twitter:description",
        content:
          "Direct CDN streams for videos, reels, and MP3 tracks from YouTube, Instagram, X, Facebook, LinkedIn and Reddit.",
      },
      { name: "twitter:image", content: "https://link2video.onrender.com/logo.png" },
    ],
    links: [
      { rel: "canonical", href: "https://link2video.onrender.com/" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.svg?v=3", type: "image/svg+xml" },
      { rel: "shortcut icon", href: "/favicon.svg?v=3", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg?v=3" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Poppins:wght@700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
        <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg?v=3" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=3" />
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var l = document.querySelector("link[rel*='icon']");
                if (l) { l.href = '/favicon.svg?v=' + Date.now(); }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceWorkerRegistrar />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}

function ServiceWorkerRegistrar() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `,
      }}
    />
  );
}
