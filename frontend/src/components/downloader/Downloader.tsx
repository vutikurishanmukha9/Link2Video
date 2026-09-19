import { useCallback, useEffect, useRef, useState } from "react";
import { UrlCommandBar } from "./UrlCommandBar";
import { StatusNote } from "./StatusNote";
import { Workspace } from "./Workspace";
import { detect, extractMedia, type FailureCode, type PostResult } from "@/lib/downloader";

type Phase =
  | { kind: "idle" }
  | { kind: "analyzing" }
  | { kind: "result"; result: PostResult }
  | { kind: "error"; code: FailureCode; hint?: string | undefined };

export function Downloader() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const detection = detect(url);

  const reset = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setUrl("");
    setPhase({ kind: "idle" });
  }, []);

  // Listen for global reset (triggered by clicking the logo or pressing ESC)
  useEffect(() => {
    const handleGlobalReset = () => {
      reset();
    };
    window.addEventListener("app:reset", handleGlobalReset);
    return () => window.removeEventListener("app:reset", handleGlobalReset);
  }, [reset]);

  const runAnalyze = useCallback((targetUrl: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const currentDetection = detect(targetUrl);

    if (currentDetection.status === "invalid" || currentDetection.status === "empty") {
      setPhase({ kind: "error", code: "invalid-url" });
      return;
    }
    if (currentDetection.status === "unsupported") {
      setPhase({ kind: "error", code: "unsupported-platform", hint: currentDetection.host });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setPhase({ kind: "analyzing" });
    // Execute extraction immediately on submit with 0ms artificial delay
    (async () => {
      const outcome = await extractMedia(currentDetection.platform, targetUrl, controller.signal);
      if (controller.signal.aborted) return;
      setPhase(
        typeof outcome === "string"
          ? { kind: "error", code: outcome }
          : { kind: "result", result: outcome },
      );
    })();
  }, []);

  return (
    <div className="space-y-6">
      <UrlCommandBar
        value={url}
        detection={detection}
        busy={phase.kind === "analyzing"}
        onChange={(v) => {
          setUrl(v);
          if (phase.kind === "error") setPhase({ kind: "idle" });
        }}
        onSubmit={() => runAnalyze(url)}
        onClear={reset}
      />

      {/* Dynamic Product State Container */}
      <div aria-live="polite">
        {/* Analyzing State */}
        {phase.kind === "analyzing" && (
          <div className="fade-rise rounded-xs border-2 border-black bg-card px-6 py-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="font-head text-base font-bold text-foreground">ANALYZING URL…</p>
              <span className="font-head text-xs bg-primary px-2 py-0.5 border border-black text-black">
                Resolving origin stream
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground/80">
              Detecting available video formats, audio channels, and image assets.
            </p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-xs border-2 border-black bg-muted">
              <div className="indeterminate-bar h-full w-1/3 bg-primary" />
            </div>
          </div>
        )}

        {/* Error States */}
        {phase.kind === "error" && (
          <StatusNote
            code={phase.code}
            hint={phase.hint}
            onDismiss={() => setPhase({ kind: "idle" })}
          />
        )}

        {/* Main Application Result Workspace */}
        {phase.kind === "result" && <Workspace result={phase.result} />}
      </div>
    </div>
  );
}
