import type { ConnectionStatus } from "../types";

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting…",
};

export function Header({ status }: { status: ConnectionStatus }) {
  const dotClass = status === "connected" ? "on" : status === "reconnecting" ? "blink" : "";

  return (
    <header className="header">
      <div className="logo">
        <i className="ti ti-broadcast" />
      </div>
      <div>
        <div className="header-title">Anedya Stream SDK Demo</div>
        <div className="header-sub">React · AnedyaStreamClient</div>
      </div>
      <div className="hspacer" />
      <div className={`badge-pill ${status}`}>
        <div className={`dot ${dotClass}`} />
        <span>{STATUS_LABEL[status]}</span>
      </div>
    </header>
  );
}
