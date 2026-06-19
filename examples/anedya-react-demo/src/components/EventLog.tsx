import { useEffect, useRef } from "react";
import type { LogEntry, LogType } from "../types";

const DOT_CLASS: Record<LogType, string> = {
  var: "d-var",
  vs: "d-vs",
  event: "d-event",
  status: "d-status",
  error: "d-error",
};
const TEXT_CLASS: Record<LogType, string> = {
  var: "c-var",
  vs: "c-vs",
  event: "c-event",
  status: "c-status",
  error: "c-error",
};

export function EventLog({ logs, onClear }: { logs: LogEntry[]; onClear: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [logs.length]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>
          <i className="ti ti-terminal" />
          Event log
        </div>
        <div className="spacer" />
        <button className="btn btn-sm" onClick={onClear}>
          <i className="ti ti-trash" /> Clear
        </button>
      </div>
      <div className="log-box" ref={boxRef}>
        {logs.length === 0 ? (
          <div className="log-empty">
            <i className="ti ti-waves-electricity" style={{ fontSize: 22, display: "block", marginBottom: 8 }} />
            Waiting for stream…
          </div>
        ) : (
          logs.map((l) => (
            <div className="log-entry" key={l.id}>
              <span className="log-ts">{l.ts}</span>
              <div className={`log-dot ${DOT_CLASS[l.type]}`} />
              <span className={`log-msg ${TEXT_CLASS[l.type]}`}>{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
