import type { Stats } from "../types";

export function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid-3">
      <div className="stat">
        <div className="stat-label">Variable updates</div>
        <div className="stat-value">{stats.varCount}</div>
        <div className="stat-sub">{stats.lastVar}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Value store updates</div>
        <div className="stat-value">{stats.vsCount}</div>
        <div className="stat-sub">{stats.lastVs}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Events (catch-all)</div>
        <div className="stat-value">{stats.evCount}</div>
        <div className="stat-sub">{stats.lastEv}</div>
      </div>
    </div>
  );
}
