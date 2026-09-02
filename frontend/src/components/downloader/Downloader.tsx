import { useCallback, useRef, useState } from "react";
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
  const detection = detect(url);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setUrl("");
    setPhase({ kind: "idle" });
  }, []);

  const runAnalyze = useCallback((targetUrl: string) => {
    if (timer.current) clearTimeout(timer.current);
    const currentDetection = detect(targetUrl);

    if (currentDetection.status === "invalid" || currentDetection.status === "empty") {
      setPhase({ kind: "error", code: "invalid-url" });
      return;
    }
    if (currentDetection.status === "unsupported") {
      setPhase({ kind: "error", code: "unsupported-platform", hint: currentDetection.host });
      return;
    }

    setPhase({ kind: "analyzing" });
    timer.current = setTimeout(async () => {
      const outcome = await extractMedia(currentDetection.platform, targetUrl);
      setPhase(
        typeof outcome === "string"
          ? { kind: "error", code: outcome }
          : { kind: "result", result: outcome },
      );
    }, 500);
  }, []);

  return (
    <div className="space-y-4">
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

      {/* Dynamic Product State Container (Directive Sec 13 & 35) */}
      <div aria-live="polite">
        {/* State 4: Restrained Loading State (Directive Sec 22) */}
        {phase.kind === "analyzing" && (
          <div className="fade-rise rounded-xl border border-border bg-surface px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium text-text">Analyzing URL</p>
              <span className="mono-meta text-text-muted">Resolving origin stream…</span>
            </div>
            <p className="mono-meta mt-1 text-[12px] text-text-muted">
              Detecting available video streams and image assets
            </p>
            <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-surface-sunken">
              <div className="indeterminate-bar h-full w-1/3 rounded-full bg-accent" />
            </div>
          </div>
        )}

        {/* States 8, 9, 10, 11: Error States (Directive Sec 21) */}
        {phase.kind === "error" && (
          <StatusNote
            code={phase.code}
            hint={phase.hint}
            onDismiss={() => setPhase({ kind: "idle" })}
          />
        )}

        {/* States 5, 6, 7: Main Application Result Workspace (Directive Sec 13 & 14) */}
        {phase.kind === "result" && <Workspace result={phase.result} />}
      </div>
    </div>
  );
}
