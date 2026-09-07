/**
 * Unit tests for the core downloader module: URL detection, platform routing,
 * byte formatting, duration formatting, and failure copy completeness.
 */
import { describe, it, expect } from "vitest";
import {
  detect,
  formatBytes,
  formatDuration,
  PLATFORMS,
  PLATFORM_BY_ID,
  FAILURE_COPY,
} from "@/lib/downloader";
import type { FailureCode } from "@/lib/downloader";

// ─────────────────────────────────────────────────────────
// detect()
// ─────────────────────────────────────────────────────────
describe("detect()", () => {
  it("returns 'empty' for blank input", () => {
    expect(detect("").status).toBe("empty");
    expect(detect("   ").status).toBe("empty");
  });

  it("returns 'invalid' for non-URL text", () => {
    expect(detect("not a url").status).toBe("invalid");
    expect(detect("foobar").status).toBe("invalid");
  });

  it("detects Instagram URLs", () => {
    const result = detect("https://www.instagram.com/reel/C8v9z8_L_2m/");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("instagram");
    }
  });

  it("detects YouTube URLs (youtube.com)", () => {
    const result = detect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("youtube");
    }
  });

  it("detects YouTube short URLs (youtu.be)", () => {
    const result = detect("https://youtu.be/dQw4w9WgXcQ");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("youtube");
    }
  });

  it("detects X/Twitter URLs", () => {
    const result = detect("https://x.com/user/status/12345");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("x");
    }
  });

  it("detects twitter.com as X", () => {
    const result = detect("https://twitter.com/user/status/12345");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("x");
    }
  });

  it("detects Facebook URLs", () => {
    const result = detect("https://www.facebook.com/watch/?v=12345");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("facebook");
    }
  });

  it("detects Reddit URLs", () => {
    const result = detect("https://www.reddit.com/r/funny/comments/abc123/");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("reddit");
    }
  });

  it("detects LinkedIn URLs", () => {
    const result = detect("https://www.linkedin.com/posts/user-12345");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("linkedin");
    }
  });

  it("falls back to 'web' for unknown domains", () => {
    const result = detect("https://www.example.com/video/123");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("web");
    }
  });

  it("auto-prepends https:// for bare hostnames", () => {
    const result = detect("instagram.com/reel/abc123");
    expect(result.status).toBe("detected");
    if (result.status === "detected") {
      expect(result.platform.id).toBe("instagram");
    }
  });
});

// ─────────────────────────────────────────────────────────
// formatBytes()
// ─────────────────────────────────────────────────────────
describe("formatBytes()", () => {
  it("returns 'Adaptive Stream' for 0 or negative", () => {
    expect(formatBytes(0)).toBe("Adaptive Stream");
    expect(formatBytes(-1)).toBe("Adaptive Stream");
  });

  it("formats bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(2048)).toBe("2 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(15_000_000)).toBe("14.3 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(2_500_000_000)).toBe("2.33 GB");
  });
});

// ─────────────────────────────────────────────────────────
// formatDuration()
// ─────────────────────────────────────────────────────────
describe("formatDuration()", () => {
  it("formats seconds under a minute", () => {
    expect(formatDuration(45)).toBe("0:45");
  });

  it("formats exact minutes", () => {
    expect(formatDuration(120)).toBe("2:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(192)).toBe("3:12");
  });

  it("pads single-digit seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
  });
});

// ─────────────────────────────────────────────────────────
// PLATFORMS registry
// ─────────────────────────────────────────────────────────
describe("PLATFORMS", () => {
  it("has at least 6 platforms defined", () => {
    expect(PLATFORMS.length).toBeGreaterThanOrEqual(6);
  });

  it("every platform has id, name, media, and hosts", () => {
    for (const p of PLATFORMS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.media).toBeTruthy();
      expect(Array.isArray(p.hosts)).toBe(true);
    }
  });

  it("PLATFORM_BY_ID maps all platforms by id", () => {
    for (const p of PLATFORMS) {
      expect(PLATFORM_BY_ID[p.id]).toBe(p);
    }
  });
});

// ─────────────────────────────────────────────────────────
// FAILURE_COPY completeness
// ─────────────────────────────────────────────────────────
describe("FAILURE_COPY", () => {
  const codes: FailureCode[] = [
    "invalid-url",
    "unsupported-platform",
    "private-content",
    "no-media",
    "extraction-failed",
    "rate-limited",
    "request-timeout",
  ];

  it("has entries for all failure codes", () => {
    for (const code of codes) {
      expect(FAILURE_COPY[code]).toBeDefined();
      expect(FAILURE_COPY[code].title).toBeTruthy();
      expect(FAILURE_COPY[code].detail).toBeTruthy();
    }
  });
});
