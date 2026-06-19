import { Header } from "./components/Header";
import { StatsGrid } from "./components/StatsGrid";
import { SubscriptionsPanel } from "./components/SubscriptionsPanel";
import { EventLog } from "./components/EventLog";
import { useAnedyaStream } from "./hooks/useAnedyaStream";

// This component itself never touches the SDK directly — all of that lives
// in useAnedyaStream() (see src/hooks/useAnedyaStream.ts). App.tsx just wires
// that hook's state and actions into the UI panels below.
export default function App() {
  const {
    status,
    stats,
    subs,
    logs,
    globalPaused,
    connect,
    disconnect,
    toggleGlobalPause,
    addVariableSub,
    addValueStoreSub,
    addEventSub,
    togglePauseSub,
    cancelSub,
    clearLogs,
  } = useAnedyaStream();

  return (
    <>
      <Header status={status} />
      <main className="page">
        <div className="glow" />
        <StatsGrid stats={stats} />
        <div className="grid-2">
          <SubscriptionsPanel
            subs={subs}
            status={status}
            globalPaused={globalPaused}
            onConnect={connect}
            onDisconnect={disconnect}
            onToggleGlobalPause={toggleGlobalPause}
            onAddVariable={addVariableSub}
            onAddValueStore={addValueStoreSub}
            onAddEvent={addEventSub}
            onTogglePauseSub={togglePauseSub}
            onCancelSub={cancelSub}
          />
          <EventLog logs={logs} onClear={clearLogs} />
        </div>
      </main>
    </>
  );
}
