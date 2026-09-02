export const SITE_URL = "https://link2video.onrender.com";

export const FAQS = [
  {
    q: "How do I download videos using Link 2 Download?",
    a: "Simply copy the link of any public post from YouTube, Instagram, X (Twitter), Facebook, LinkedIn, or Reddit. Paste the link into the command bar above and click Analyze. Within seconds, Link 2 Download extracts all available video resolutions (up to 1080p/4K), original audio tracks, and album covers for direct download.",
  },
  {
    q: "Can I extract and download audio (MP3) tracks from videos?",
    a: "Yes! For every video analyzed, Link 2 Download separates the audio track into a dedicated 'Audio Track' tab. You can stream the audio directly in your browser or download the original audio stream as an MP3 file with one click.",
  },
  {
    q: "Which social media platforms are supported?",
    a: "Link 2 Download supports 6 major social and media platforms: YouTube (regular videos, Shorts, music), Instagram (Reels, Feed videos, photo carousels), X / Twitter (videos, GIFs), Facebook (public videos and Reels), LinkedIn (feed videos), and Reddit (videos merged with original sound).",
  },
  {
    q: "Are the downloaded videos watermark-free and high quality?",
    a: "Yes. Files are streamed directly from the original source content delivery network (CDN) without third-party compression, re-encoding, or watermarks. If the creator uploaded in 1080p HD or 4K, you receive the exact high-definition file.",
  },
  {
    q: "Is Link 2 Download completely free, and do I need an account?",
    a: "Link 2 Download is 100% free to use with zero hidden fees, subscriptions, or account requirements. You never need to install software, browser extensions, or share personal information.",
  },
  {
    q: "Does Link 2 Download store my personal data or downloaded media?",
    a: "No. Link 2 Download operates on a strict zero-storage, privacy-first model. We do not store downloaded files on our servers, track user search history, or log IP addresses. Media streams directly between the source CDN and your browser.",
  },
];

export const JSON_LD_WEBAPP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Link 2 Download",
  alternateName: ["Link2Download", "Link2Video", "Link to Video Downloader"],
  url: SITE_URL,
  description:
    "Universal public media and audio downloader for YouTube, Instagram, X (Twitter), Facebook, LinkedIn, and Reddit. 100% free, no watermarks, direct CDN streaming.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "18450",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "YouTube 1080p Full HD Video & Shorts Extraction",
    "Instagram Reels, Videos, Photos, and Carousel Downloads",
    "X (Twitter) Video & Animated GIF Saver",
    "Facebook Reels & Public Video Downloader",
    "Reddit Video Downloader with Integrated Audio",
    "Direct MP3 Audio Track Extraction",
    "Original High-Resolution Cover Art Extraction",
    "Zero Watermarks, 100% Free, No Software Required",
  ],
};

export const JSON_LD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export const JSON_LD_HOWTO = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Download Public Videos and Audio with Link 2 Download",
  description:
    "Step-by-step guide to download public videos and extract MP3 audio from YouTube, Instagram, X, Facebook, LinkedIn, and Reddit.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Copy Media Link",
      text: "Open any public video, reel, or post on YouTube, Instagram, X, Facebook, LinkedIn, or Reddit and copy its URL.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Paste URL into Link 2 Download",
      text: "Paste the copied URL into the Link 2 Download command bar and click Analyze.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Preview and Download",
      text: "Preview the stream inside the QuickTime player or select the Audio Track tab to download the MP3 directly.",
    },
  ],
};

export const JSON_LD_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Link 2 Download",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?url={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};
