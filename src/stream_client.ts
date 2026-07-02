import { IConfigHeaders } from "./common";
import { anedyaSignature } from "./anedya_signature";
import { decode } from "cbor-x";
import { NewNode } from "./node";
import { NewClient } from "./client";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface IStreamSubscription {
  pause(): void;
  resume(): void;
  cancel(): void;
}

export interface VariableData {
  nodeId: string | undefined;
  variable: string;
  value: string | number | boolean | Uint8Array;
  timestamp: number;
  dataType: number;
}

export interface ValueStoreData {
  nodeId: string | undefined;
  scope: string | undefined;
  key: string;
  value: string | number | boolean;
  timestamp: number;
  type: string | number;
}

// Messages delivered to onAllMessages() can be either shape — distinguish
// using the `kind` discriminant added at dispatch time.
export type AllMessagesData =
  | (VariableData & { kind: "variable" })
  | (ValueStoreData & { kind: "valuestore" });

type VariableCallback = (data: VariableData) => void;
type ValueStoreCallback = (data: ValueStoreData) => void;
type AllMessagesCallback = (data: AllMessagesData) => void;
type ErrorCallback = (err: Error) => void;
type StatusCallback = (status: "connected" | "disconnected" | "reconnecting") => void;

// ─── Internal subscription records ───────────────────────────────────────────

interface VariableSub {
  id: string;           // unique sub id for dedup/debug
  variableId: string;
  callback: VariableCallback;
  paused: boolean;
  active: boolean;
}

interface ValueStoreSub {
  id: string;
  key: string;
  callback: ValueStoreCallback;
  paused: boolean;
  active: boolean;
}

interface AllMessagesSub {
  id: string;
  callback: AllMessagesCallback;
  paused: boolean;
  active: boolean;
}

// ─── AnedyaStreamClient ──────────────────────────────────────────────────────

/**
 * AnedyaStreamClient manages a live WebSocket stream from the Anedya platform.
 *
 * Usage:
 * ```ts
 * const client = anedya.NewClient(connect_config);
 * const node = anedya.NewNode(client, nodeId);
 * const stream = new AnedyaStreamClient(client, node, streamId, streamUrl);
 *
 * const sub = stream.onVariable("temperature", (data) => {
 *   //console.log(data.value);
 *   if (data.value > 80) sub.pause();   // pause just this subscription
 * });
 *
 * const vsSub = stream.onValueStore("config-key", (data) => {
 *   //console.log(data.value);
 *   vsSub.cancel();                     // one-shot: cancel after first hit
 * });
 *
 * // Fires for EVERY incoming message — both variable and value store frames.
 * const allSub = stream.onAllMessages((data) => {
 *   if (data.kind === "variable") {
 *     //console.log("variable:", data.variable, data.value);
 *   } else {
 *     //console.log("valuestore:", data.key, data.value);
 *   }
 * });
 *
 * await stream.connect();
 * ```
 */
export class AnedyaStreamClient {
  readonly node: NewNode;                    // public — accessible inside callbacks
  private readonly streamUrl: string;
  private readonly configHeaders: IConfigHeaders;
  private readonly streamId: string;

  private ws: WebSocket | null = null;
  private isConnected = false;
  private globalPaused = false;
  private destroyed = false;
  private reconnectAttempts = 0;
  private subCounter = 0; // generates unique sub IDs

  private variableSubs: VariableSub[] = [];
  private valueStoreSubs: ValueStoreSub[] = [];
  private allMessagesSubs: AllMessagesSub[] = [];
  private errorListeners: ErrorCallback[] = [];
  private statusListeners: StatusCallback[] = [];


  constructor(
    client: NewClient,
    node: NewNode,
    streamId: string,
    streamUrl: string,
  ) {
    const {
      tokenId,
      tokenBytes,
      signatureVersion,
      signatureVersionBytes,
      authorizationMode,
    } = client;

    this.node = node;
    this.streamId = streamId;
    this.streamUrl = streamUrl;
    this.configHeaders = {
      tokenId,
      tokenBytes,
      signatureVersion,
      signatureVersionBytes,
      authorizationMode,
    };
  }


  // ─── Connection ─────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (this.isConnected || this.destroyed) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const signature = await anedyaSignature(null, this.configHeaders, currentTime);

    // Browser WebSocket doesn't support custom headers — pass as query params.
    // NewClient already sets authorizationMode = "ANEDYASIGV1" and signatureVersion = "v1"
    const url = new URL(this.streamUrl);
    url.searchParams.set("Authorization", this.configHeaders.authorizationMode);
    url.searchParams.set("x-anedya-streamid", this.streamId);
    url.searchParams.set("x-anedya-tokenid", this.configHeaders.tokenId);
    url.searchParams.set("x-anedya-signature", signature);
    url.searchParams.set("x-anedya-timestamp", currentTime.toString());
    url.searchParams.set("x-anedya-signatureversion", this.configHeaders.signatureVersion);

    this.ws = new WebSocket(url.toString());
    this.ws.binaryType = "arraybuffer"; // ✅ guarantees ArrayBuffer in browser — no Buffer needed

    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      //console.log("✅ Stream connected");
      this.emitStatus("connected");
    };

    this.ws.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      // ✅ Always ArrayBuffer because binaryType = "arraybuffer"
      this.handleRawMessage(new Uint8Array(event.data));
    };

     this.ws.onerror = (event) => {
       this.errorListeners.forEach((cb) => cb(new Error("WebSocket error occurred")));
     };


    this.ws.onclose = (event) => {
       //console.log("WS CLOSED", {
  //   code: event.code,
  //   reason: event.reason,
  //   wasClean: event.wasClean,
  // });
      this.isConnected = false;
      this.emitStatus("disconnected");
      if (!this.destroyed) this.scheduleReconnect();
    };
  }

  /** Pause delivery of ALL callbacks without closing the connection */
  pause() { this.globalPaused = true; }

  /** Resume global delivery */
  resume() { this.globalPaused = false; }

  /** Close the WebSocket permanently — no reconnect will be attempted */
  disconnect() {
    this.destroyed = true;
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }

  // ─── Subscriptions ──────────────────────────────────────────────────────────

  /**
   * Subscribe to variable data for a specific variable identifier.
   *
   * @param variableId  Must match the `variable` field in the decoded message (decoded?.v)
   * @param callback    Receives VariableData on each matching message
   * @returns           IStreamSubscription — call .pause() / .resume() / .cancel() on it
   *
   * @example
   * ```ts
   * const sub = stream.onVariable("temperature", (data) => {
   *   //console.log("Temp:", data.value);
   *   if (data.value > 100) sub.cancel(); // unsubscribe when done
   * });
   * ```
   */
  onVariable(variableId: string, callback: VariableCallback): IStreamSubscription {
    const sub: VariableSub = {
      id: this.nextId(),
      variableId,
      callback,
      paused: false,
      active: true,
    };
    this.variableSubs.push(sub);
    return this.makeHandle(sub);
  }

  /**
   * Subscribe to value store updates for a specific key.
   *
   * @param key       Must match the `key` field in the decoded message (decoded?.key)
   * @param callback  Receives ValueStoreData on each matching message
   * @returns         IStreamSubscription — call .pause() / .resume() / .cancel() on it
   *
   * @example
   * ```ts
   * const sub = stream.onValueStore("threshold", (data) => {
   *   applyNewThreshold(data.value);
   *   sub.pause(); // pause after applying — resume later if needed
   * });
   * ```
   */
  onValueStore(key: string, callback: ValueStoreCallback): IStreamSubscription {
    const sub: ValueStoreSub = {
      id: this.nextId(),
      key,
      callback,
      paused: false,
      active: true,
    };
    this.valueStoreSubs.push(sub);
    return this.makeHandle(sub);
  }

  /**
   * Subscribe to ALL incoming messages on the stream — both variable
   * messages and value store messages — regardless of variable name or key.
   * Useful for debugging or generic handlers that need to see everything.
   *
   * Each delivered object carries a `kind` discriminant so you can tell
   * which shape you got: `"variable"` (VariableData) or `"valuestore"` (ValueStoreData).
   *
   * @param callback  Receives AllMessagesData on every incoming message
   * @returns         IStreamSubscription — call .pause() / .resume() / .cancel() on it
   *
   * @example
   * ```ts
   * const sub = stream.onAllMessages((data) => {
   *   if (data.kind === "variable") {
   *     //console.log("Variable from node:", data.nodeId, data.variable, data.value);
   *   } else {
   *     //console.log("Value store from node:", data.nodeId, data.key, data.value);
   *   }
   * });
   * ```
   */
  onAllMessages(callback: AllMessagesCallback): IStreamSubscription {
    const sub: AllMessagesSub = {
      id: this.nextId(),
      callback,
      paused: false,
      active: true,
    };
    this.allMessagesSubs.push(sub);
    return this.makeHandle(sub);
  }

  /** Register a global error listener */
  onError(callback: ErrorCallback) {
    this.errorListeners.push(callback);
  }

  /** Get notified of connection status changes */
  onStatus(callback: StatusCallback) {
    this.statusListeners.push(callback);
  }

  // ─── Internal: message routing ───────────────────────────────────────────────

private handleRawMessage(buffer: Uint8Array) {
  if (buffer.length < 4) {
    console.warn("Invalid message: too short");
    return;
  }

  const byte1 = buffer[0];
  const byte2 = buffer[1];
  const dataType = buffer[2];

  // Log every raw frame so we can see what's arriving
  //console.log("📥 Raw frame:", Array.from(buffer).map(b => b.toString(16).padStart(2,'0')).join(' '));
  //console.log("Header:", `[0x${byte1.toString(16)}, 0x${byte2.toString(16)}]`, "dataType:", dataType);

  if (byte1 === 0x00 && byte2 === 0x02) {
    //console.log("→ Identified as VALUE STORE, decoding slice(2):", Array.from(buffer.slice(2)).map(b => b.toString(16).padStart(2,'0')).join(' '));
    this.routeValueStore(buffer.slice(2));
  } else if (byte1 === 0x00 && byte2 === 0x01) {
    //console.log("→ Identified as VARIABLE, decoding slice(3):", Array.from(buffer.slice(3)).map(b => b.toString(16).padStart(2,'0')).join(' '));
    this.routeVariableOrEvent(buffer.slice(3), dataType);
  } else {
    console.warn("Unknown message type:", byte1, byte2);
  }
}

private routeValueStore(payload: Uint8Array) {
  try {
    const decoded = decode(payload);

    const data: ValueStoreData = {
      nodeId: decoded?.ns?.id
        ? Array.from(decoded.ns.id as Uint8Array)
            .map((b) => (b as number).toString(16).padStart(2, "0"))
            .join("")
        : undefined,
      scope:     decoded?.ns?.scope,
      key:       decoded?.key,
      value:     decoded?.val,
      timestamp: decoded?.ts,
      type:      decoded?.t,
    };

    if (this.globalPaused) return;

    this.valueStoreSubs
      .filter((s) => s.active && !s.paused && s.key === data.key)
      .forEach((s) => s.callback(data));

    // Catch-all subscribers also receive value store messages, tagged so
    // callers can tell them apart from variable messages.
    this.allMessagesSubs
      .filter((s) => s.active && !s.paused)
      .forEach((s) => s.callback({ ...data, kind: "valuestore" }));
  } catch (err) {
    console.error("❌ ValueStore decode error:", err);
  }
}
  private routeVariableOrEvent(payload: Uint8Array, dataType: number) {
    try {
      const decoded = decode(payload);
      const data: VariableData = {
        nodeId: decoded?.n
          ? Array.from(decoded.n as Uint8Array)
              .map((b) => (b as number).toString(16).padStart(2, "0"))
              .join("")
          : undefined,
        variable:  decoded?.v,
        value:     decoded?.d,
        timestamp: decoded?.ts,
        dataType,
      };

      if (this.globalPaused) return;

      // Per-variable subscribers
      this.variableSubs
        .filter((s) => s.active && !s.paused && s.variableId === data.variable)
        .forEach((s) => s.callback(data));

      // Catch-all subscribers
      this.allMessagesSubs
        .filter((s) => s.active && !s.paused)
        .forEach((s) => s.callback({ ...data, kind: "variable" }));
    } catch (err) {
      console.error("Variable decode error:", err);
    }
  }

  // ─── Internal: reconnect ────────────────────────────────────────────────────

  private scheduleReconnect() {
    if (this.reconnectAttempts >= 5) {
      console.error("❌ Max reconnect attempts reached");
      return;
    }
    this.reconnectAttempts++;
    this.emitStatus("reconnecting");
    setTimeout(() => this.connect(), 3000);
  }

  // ─── Internal: helpers ──────────────────────────────────────────────────────

  private nextId(): string {
    return `sub_${++this.subCounter}`;
  }

  private emitStatus(status: "connected" | "disconnected" | "reconnecting") {
    this.statusListeners.forEach((cb) => cb(status));
  }

  /**
   * Returns a subscription handle. pause/resume/cancel mutate the sub record
   * directly — no extra lookup needed since we close over the object reference.
   */
  private makeHandle(sub: { paused: boolean; active: boolean }): IStreamSubscription {
    return {
      pause:  () => { sub.paused = true; },
      resume: () => { sub.paused = false; },
      cancel: () => { sub.active = false; },
    };
  }
}