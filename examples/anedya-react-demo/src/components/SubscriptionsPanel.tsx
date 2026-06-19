import { useState } from "react";
import type { ConnectionStatus, SubRecord, SubType } from "../types";

const TYPE_LABEL: Record<SubType, string> = {
  variable: "variable",
  valuestore: "value store",
  event: "event",
};
const TYPE_BADGE: Record<SubType, string> = {
  variable: "badge-var",
  valuestore: "badge-vs",
  event: "badge-event",
};

interface Props {
  subs: SubRecord[];
  status: ConnectionStatus;
  globalPaused: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleGlobalPause: () => void;
  onAddVariable: (key: string) => void;
  onAddValueStore: (key: string) => void;
  onAddEvent: () => void;
  onTogglePauseSub: (id: number) => void;
  onCancelSub: (id: number) => void;
}

export function SubscriptionsPanel({
  subs,
  status,
  globalPaused,
  onConnect,
  onDisconnect,
  onToggleGlobalPause,
  onAddVariable,
  onAddValueStore,
  onAddEvent,
  onTogglePauseSub,
  onCancelSub,
}: Props) {
  const [varKey, setVarKey] = useState("");
  const [vsKey, setVsKey] = useState("");
  const connected = status === "connected";
  const active = subs.filter((s) => s.active);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="card-title">
        <i className="ti ti-antenna" />
        Subscriptions
      </div>

      <div className="field">
        <div className="field-label">Variable</div>
        <div className="add-row">
          <input
            type="text"
            placeholder="e.g. threshold"
            value={varKey}
            disabled={!connected}
            onChange={(e) => setVarKey(e.target.value)}
          />
          <button
            className="btn btn-sm"
            disabled={!connected || !varKey.trim()}
            onClick={() => {
              onAddVariable(varKey.trim());
              setVarKey("");
            }}
          >
            <i className="ti ti-plus" /> Add
          </button>
        </div>
      </div>

      <div className="field">
        <div className="field-label">Value store key</div>
        <div className="add-row">
          <input
            type="text"
            placeholder="e.g. test-stream"
            value={vsKey}
            disabled={!connected}
            onChange={(e) => setVsKey(e.target.value)}
          />
          <button
            className="btn btn-sm"
            disabled={!connected || !vsKey.trim()}
            onClick={() => {
              onAddValueStore(vsKey.trim());
              setVsKey("");
            }}
          >
            <i className="ti ti-plus" /> Add
          </button>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <div className="field-label">Catch-all events</div>
        <button className="btn btn-sm" disabled={!connected} onClick={onAddEvent}>
          <i className="ti ti-plus" /> Add listener
        </button>
      </div>

      <div className="divider" />

      {active.length === 0 ? (
        <div className="empty-subs">
          <i className="ti ti-antenna-off" style={{ fontSize: 20, display: "block", marginBottom: 6 }} />
          No subscriptions yet
        </div>
      ) : (
        active.map((s) => (
          <div className={`sub-item ${s.paused ? "paused" : ""}`} key={s.id}>
            <span className={`badge ${TYPE_BADGE[s.type]}`}>{TYPE_LABEL[s.type]}</span>
            <span className="sub-name">{s.key ?? "all events"}</span>
            <span className="sub-val">{s.lastValue}</span>
            <span className="sub-cnt">{s.count}</span>
            <button className="btn btn-sm" onClick={() => onTogglePauseSub(s.id)}>
              {s.paused ? "Resume" : "Pause"}
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => onCancelSub(s.id)}>
              <i className="ti ti-x" />
            </button>
          </div>
        ))
      )}

      <div className="divider" />

      <div className="row">
        <button className="btn btn-primary" disabled={connected} onClick={onConnect}>
          <i className="ti ti-player-play" /> Connect
        </button>
        <button className="btn btn-danger" disabled={!connected} onClick={onDisconnect}>
          <i className="ti ti-player-stop" /> Disconnect
        </button>
        <div className="spacer" />
        <button className="btn" disabled={!connected} onClick={onToggleGlobalPause}>
          <i className={`ti ${globalPaused ? "ti-player-play" : "ti-player-pause"}`} />
          <span>{globalPaused ? "Resume all" : "Pause all"}</span>
        </button>
      </div>
    </div>
  );
}
