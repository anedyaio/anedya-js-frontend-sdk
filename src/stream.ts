import WebSocket from "ws";
import { anedyaSignature } from "./anedya_signature";
import { IConfigHeaders } from "./common";
import * as cbor from "cbor";

type DataCallback = (data: any) => void;
type ErrorCallback = (err: any) => void;

export class AnedyaStream {
  private streamUrl: string;
  private configHeaders: IConfigHeaders;
  private streamId: string;

  private ws: WebSocket | null = null;

  private dataListeners: DataCallback[] = [];
  private errorListeners: ErrorCallback[] = [];

  private isConnected = false;

  constructor(
    streamUrl: string,
    configHeaders: IConfigHeaders,
    streamId: string,
  ) {
    this.streamUrl = streamUrl;
    this.configHeaders = configHeaders;
    this.streamId = streamId;
  }

  // 🔌 Connect to WebSocket
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("⚠️ Already connected");
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    const signature = await anedyaSignature(
      null, // ✅ no payload
      this.configHeaders,
      currentTime,
    );

    this.ws = new WebSocket(this.streamUrl, {
      headers: {
        Authorization: this.configHeaders.authorizationMode,
        "x-anedya-streamid": this.streamId,
        "x-anedya-tokenid": this.configHeaders.tokenId,
        "x-anedya-signature": signature,
        "x-anedya-timestamp": currentTime.toString(),
        "x-anedya-signatureversion": this.configHeaders.signatureVersion,
      },
    });

    this.ws.on("open", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("✅ Stream connected");
    });
    this.ws.on("message", (data: Buffer) => {
      this.handleRawMessage(data);
    });
    this.ws.on("error", (err) => {
      this.errorListeners.forEach((cb) => cb(err));
    });

    this.ws.on("close", () => {
      console.log("⚠️ Stream closed");
      this.isConnected = false;
      this.reconnect(); // 🔁 auto-reconnect
    });
  }

  // 📡 Subscribe to data events
  onData(callback: DataCallback) {
    this.dataListeners.push(callback);
  }

  // ❗ Error listener
  onError(callback: ErrorCallback) {
    this.errorListeners.push(callback);
  }

  // 🔌 Disconnect
  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }

  // 🔁 Auto reconnect
  private reconnectAttempts = 0;

  private reconnect() {
    if (this.reconnectAttempts > 5) {
      console.error("❌ Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(`🔄 Reconnecting (${this.reconnectAttempts})...`);
      this.connect();
    }, 3000);
  }

  private handleRawMessage(buffer: Buffer) {
    if (buffer.length < 3) {
      console.warn("Invalid message: too short");
      return;
    }

    const byte1 = buffer[0];
    const byte2 = buffer[1];

    // Remove first 2 bytes
    const payload = buffer.slice(3);

    if (byte1 === 0x00 && byte2 === 0x01) {
      // ✅ Event data
      this.handleEventData(payload);
    } else if (byte1 === 0x00 && byte2 === 0x02) {
      // ✅ Variable data
      this.handleVariableData(payload);
    } else {
      console.warn("Unknown message type:", byte1, byte2);
    }
  }

  private handleEventData(payload: Buffer) {
    try {
      const decoded = cbor.decodeFirstSync(payload);
      const normalized = this.normalizeEvent(decoded);
      console.log("📡 EVENT:", normalized);
      // later → route to callbacks
      this.eventListeners.forEach((cb) => cb(decoded));
    } catch (err) {
      console.error("Event decode error:", err);
    }
  }

private handleVariableData(payload: Buffer) {
  try {
    console.log(payload.toString("hex"));

    const decodedItems = cbor.decodeAllSync(payload);

    console.log("Decoded Items:", decodedItems);

    const decoded: any = {};

    for (let i = 0; i < decodedItems.length; i += 2) {
      const key = decodedItems[i];
      const value = decodedItems[i + 1];
      decoded[key] = value;
    }

    console.log("📊 VARIABLE RAW:", decoded);

    const normalized = {
      nodeId: decoded?.ns?.id,
      scope: decoded?.ns?.scope,
      key: decoded?.key,
      value: decoded?.val,
      timestamp: decoded?.ts,
      type: decoded?.t,
    };

    console.log("📊 VARIABLE:", normalized);

    this.variableListeners.forEach((cb) => cb(normalized));
  } catch (err) {
    console.error("Variable decode error:", err);
  }
}
private normalizeVariable(decoded: any) {
  return {
    nodeId: decoded?.bns?.id,
    scope: decoded?.bns?.scope,
    key: decoded?.key,
    value: decoded?.val,
    timestamp: decoded?.ts,
    type: decoded?.type,
  };
}

  private normalizeEvent(decoded: any) {
    return {
      nodeId: decoded.n?.toString("hex"), // 👈 clean readable
      value: decoded.d,
      timestamp: decoded.ts,
      variable: decoded.v,
    };
  }

  private eventListeners: ((data: any) => void)[] = [];
  private variableListeners: ((data: any) => void)[] = [];
}


///type mapping in variable data 
//callbacks 