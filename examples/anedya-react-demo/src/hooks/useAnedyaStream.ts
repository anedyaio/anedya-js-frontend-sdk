import { useCallback, useRef, useState } from "react";
import { Anedya } from "@anedyasystems/anedya-frontend-sdk";
import { STREAM_ID, STREAM_URL, TOKEN_ID, TOKEN, NODE_ID } from "../config";
import type { ConnectionStatus, LogEntry, LogType, Stats, SubHandle, SubRecord, SubType } from "../types";

/**
 * ── ANEDYA STREAM SDK — HOW THIS HOOK USES IT ───────────────────────────────
 *
 * The core flow, every time, is:
 *
 *   1. const anedya = new Anedya()                            entry point
 *   2. const config = anedya.NewConfig(tokenId, token)        your auth credentials
 *   3. const client = anedya.NewClient(config)                an authenticated client
 *   4. const node   = anedya.NewNode(client, nodeId)          scopes calls to ONE device
 *   5. const stream = anedya.NewStream(client, node, streamId, streamUrl)
 *   6. stream.onVariable(key, cb) / onValueStore(key, cb) / onEvent(cb)
 *        — register subscriptions. Each returns a handle with
 *          .pause() / .resume() / .cancel() for managing just that one sub.
 *   7. await stream.connect()                                  opens the WebSocket
 *
 * See connect() and the addXSub() functions below for where each step happens.
 *
 * GOTCHA: onEvent() is a catch-all, but it only catches VARIABLE messages —
 * it does NOT fire for value-store updates. To react to value-store changes
 * you must call onValueStore(key, cb) per key; there's no catch-all for those.
 */

// Minimal shape of what we actually call on the stream instance returned by
// anedya.NewStream(...). Typed locally rather than imported, since the
// package's public type exports may differ from the internal stream-client.ts
// names — adjust this if your package exports its own types and you'd
// rather import them directly.
interface AnedyaStreamLike {
  connect(): Promise<void>;
  disconnect(): void;
  pause(): void;
  resume(): void;
  onStatus(cb: (status: ConnectionStatus) => void): void;
  onError(cb: (err: unknown) => void): void;
  onVariable(key: string, cb: (data: { variable: string; value: unknown }) => void): SubHandle;
  onValueStore(key: string, cb: (data: { key: string; value: unknown }) => void): SubHandle;
  onEvent(cb: (data: { variable: string; value: unknown }) => void): SubHandle;
}

const EMPTY_STATS: Stats = {
  varCount: 0,
  lastVar: "waiting…",
  vsCount: 0,
  lastVs: "waiting…",
  evCount: 0,
  lastEv: "waiting…",
};

function nowTs() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function formatValue(value: unknown): string {
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function useAnedyaStream() {
  // UI-facing state. None of this belongs to the SDK — it's this demo's own
  // bookkeeping, rebuilt from whatever the SDK's callbacks hand us.
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [subs, setSubs] = useState<SubRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [globalPaused, setGlobalPaused] = useState(false);

  // streamRef holds the real AnedyaStreamClient instance once connect() runs.
  // It's a ref (not state) because we never want a re-render just because the
  // stream object itself was assigned — only the state above should drive renders.
  const streamRef = useRef<AnedyaStreamLike | null>(null);
  const subIdRef = useRef(0);
  const logIdRef = useRef(0);

  const pushLog = useCallback((message: string, type: LogType) => {
    setLogs((prev) => [
      ...prev,
      { id: ++logIdRef.current, ts: nowTs(), type, message },
    ]);
  }, []);

  // Shared by all three subscription callbacks below (variable / value-store /
  // event) — updates that one subscription's running count + last value, bumps
  // the matching top-level stat, and writes a log line. `tag` is whichever
  // field identifies the update (the variable name, or the value-store key).
  const recordHit = useCallback(
    (subId: number, kind: "var" | "vs" | "event", tag: string, value: unknown) => {
      const valueStr = formatValue(value);

      setSubs((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, count: s.count + 1, lastValue: valueStr } : s))
      );

      setStats((prev) => {
        if (kind === "var") return { ...prev, varCount: prev.varCount + 1, lastVar: `${tag} = ${valueStr}` };
        if (kind === "vs") return { ...prev, vsCount: prev.vsCount + 1, lastVs: `${tag} = ${valueStr}` };
        return { ...prev, evCount: prev.evCount + 1, lastEv: `${tag} · ${nowTs()}` };
      });

      const fn = kind === "var" ? "onVariable" : kind === "vs" ? "onValueStore" : "onEvent";
      pushLog(`${fn}(${tag}) → ${valueStr}`, kind);
    },
    [pushLog]
  );

  /**
   * Builds the SDK object chain (steps 1–5 from the file-level comment above)
   * and opens the connection. Subscriptions are NOT queued here — in this
   * demo, the "Add" inputs are disabled until status === "connected", so
   * addVariableSub/addValueStoreSub/addEventSub always run against a live
   * `stream`, unlike the HTML demo which supports queueing subs pre-connect.
   */
  const connect = useCallback(async () => {
    const anedya = new Anedya();
    const config = anedya.NewConfig(TOKEN_ID, TOKEN);   // holds your auth credentials
    const client = anedya.NewClient(config);             // an authenticated client built from those credentials
    const node = anedya.NewNode(client, NODE_ID);        // scopes the client to one device/node
    const stream = anedya.NewStream(client, node, STREAM_ID, STREAM_URL) as AnedyaStreamLike; // the stream object everything else talks to
    streamRef.current = stream;

    // Fires on every connection lifecycle change: "connected" | "disconnected" | "reconnecting".
    stream.onStatus((s) => {
      setStatus(s);
      pushLog(`Status: ${s}`, "status");
    });
    // Fires on transport-level errors (socket errors) — not per-message decode failures.
    stream.onError((err) => pushLog(`Error: ${String(err)}`, "error"));

    pushLog("Connecting via AnedyaStreamClient.connect()…", "status");
    // This is the only call that actually touches the network — everything
    // above just builds local JS objects and registers callbacks.
    await stream.connect();
  }, [pushLog]);

  /**
   * Closes the WebSocket PERMANENTLY for this stream instance — no
   * auto-reconnect will be attempted afterwards. For a temporary pause
   * without closing the socket, use toggleGlobalPause() instead.
   */
  const disconnect = useCallback(() => {
    streamRef.current?.disconnect();
    streamRef.current = null;
    setStatus("disconnected");
    pushLog("Disconnected by user", "status");
  }, [pushLog]);

  /**
   * stream.pause()/resume() suspends delivery of EVERY subscription's
   * callback at once, without closing the connection. Compare to
   * togglePauseSub() below, which only affects one subscription.
   */
  const toggleGlobalPause = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    setGlobalPaused((paused) => {
      if (paused) {
        stream.resume();
        pushLog("Global delivery resumed", "status");
      } else {
        stream.pause();
        pushLog("Global delivery paused", "status");
      }
      return !paused;
    });
  }, [pushLog]);

  // Pushes a new entry into the UI-facing `subs` list. `handle` is the real
  // object the SDK returned from onVariable/onValueStore/onEvent — pause(),
  // resume(), and cancel() below all call straight through to it.
  const addSub = useCallback(
    (type: SubType, key: string | null, handle: SubHandle) => {
      const id = ++subIdRef.current;
      setSubs((prev) => [
        ...prev,
        { id, type, key, paused: false, active: true, count: 0, lastValue: "—", handle },
      ]);
      return id;
    },
    []
  );

  // stream.onVariable(key, cb): cb fires ONLY for updates to that specific variable.
  const addVariableSub = useCallback(
    (key: string) => {
      const stream = streamRef.current;
      if (!stream || !key.trim()) return;
      // Reserve the id before the handle exists so the callback can close over it.
      const id = subIdRef.current + 1;
      const handle = stream.onVariable(key, (data) => recordHit(id, "var", data.variable, data.value));
      addSub("variable", key, handle);
      pushLog(`Subscribed → onVariable("${key}")`, "status");
    },
    [addSub, pushLog, recordHit]
  );

  // stream.onValueStore(key, cb): cb fires ONLY for updates to that specific value-store key.
  const addValueStoreSub = useCallback(
    (key: string) => {
      const stream = streamRef.current;
      if (!stream || !key.trim()) return;
      const id = subIdRef.current + 1;
      const handle = stream.onValueStore(key, (data) => recordHit(id, "vs", data.key, data.value));
      addSub("valuestore", key, handle);
      pushLog(`Subscribed → onValueStore("${key}")`, "status");
    },
    [addSub, pushLog, recordHit]
  );

  // stream.onEvent(cb): catch-all for VARIABLE messages regardless of which
  // variable they're for. Does NOT receive value-store updates — see the
  // gotcha note at the top of this file.
  const addEventSub = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const id = subIdRef.current + 1;
    const handle = stream.onEvent((data) => recordHit(id, "event", data.variable, data.value));
    addSub("event", null, handle);
    pushLog("Subscribed → onEvent()", "status");
  }, [addSub, pushLog, recordHit]);

  /**
   * Per-subscription pause: stops just THIS callback from firing. Does NOT
   * close the connection and does NOT affect any other subscription.
   */
  const togglePauseSub = useCallback(
    (id: number) => {
      setSubs((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          if (s.paused) s.handle.resume();
          else s.handle.pause();
          pushLog(`"${s.key ?? "events"}" ${s.paused ? "resumed" : "paused"}`, "status");
          return { ...s, paused: !s.paused };
        })
      );
    },
    [pushLog]
  );

  /**
   * .cancel() permanently removes this subscription — unlike pause/resume,
   * there's no coming back from this without calling onVariable/onValueStore/
   * onEvent again to create a fresh one.
   */
  const cancelSub = useCallback(
    (id: number) => {
      setSubs((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          s.handle.cancel();
          pushLog(`Subscription "${s.key ?? "events"}" cancelled`, "status");
          return { ...s, active: false };
        })
      );
    },
    [pushLog]
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  return {
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
  };
}
