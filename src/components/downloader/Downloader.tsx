import { useCallback, useRef, useState } from "react";
import { UrlCommandBar } from "./UrlCommandBar";
import { StatusNote } from "./StatusNote";
import { Workspace } from "./Workspace";
import { detect, mockExtract, type FailureCode, type PostResult } from "@/lib/downloader";

type Phase =
  | { kind: "idle" }
  | { kind: "analyzing" }
  | { kind: "result"; result: PostResult }
  | { kind: "error"; code: FailureCode; hint?: string };

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

  const analyze = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (detection.status === "invalid" || detection.status === "empty") {
      setPhase({ kind: "error", code: "invalid-url" });
      return;
    }
    if (detection.status === "unsupported") {
      setPhase({ kind: "error", code: "unsupported-platform", hint: detection.host });
      return;
    }
    setPhase({ kind: "analyzing" });
    timer.current = setTimeout(() => {
      const outcome = mockExtract(detection.platform, url);
      setPhase(
        typeof outcome === "string"
          ? { kind: "error", code: outcome }
          : { kind: "result", result: outcome },
      );
    }, 900);
  }, [detection, url]);

  return (
    <div className="space-y-5">
      <UrlCommandBar
        value={url}
        detection={detection}
        busy={phase.kind === "analyzing"}
        onChange={(v) => {
          setUrl(v);
          if (phase.kind === "error") setPhase({ kind: "idle" });
        }}
        onSubmit={analyze}
        onClear={reset}
      />

      <div aria-live="polite">
        {phase.kind === "analyzing" && (
          <div className="fade-rise rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-[14px] text-text">Analyzing URL</p>
            <p className="mono-meta mt-0.5 text-text-muted">Detecting available media…</p>
            <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-surface-sunken">
              <div className="indeterminate-bar h-full w-1/4 rounded-full bg-accent" />
            </div>
          </div>
        )}
        {phase.kind === "error" && <StatusNote code={phase.code} hint={phase.hint} />}
        {phase.kind === "result" && <Workspace result={phase.result} />}
      </div>
    </div>
  );
}
