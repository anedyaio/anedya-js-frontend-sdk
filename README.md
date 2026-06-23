# AnedyaStreamClient

A TypeScript client for receiving **live, real-time data** from the Anedya platform over a WebSocket connection. It supports subscribing to variable updates, value store changes, and raw events — with fine-grained control over each subscription.

---

## Table of Contents

- [Overview](#overview)
- [Installation & Imports](#installation--imports)
- [Quick Start](#quick-start)
- [Constructor](#constructor)
- [Connecting & Disconnecting](#connecting--disconnecting)
- [Subscriptions](#subscriptions)
  - [onVariable — Subscribe to a specific variable](#onvariable--subscribe-to-a-specific-variable)
  - [onValueStore — Subscribe to a value store key](#onvaluestore--subscribe-to-a-value-store-key)
  - [onEvent — Catch-all listener](#onevent--catch-all-listener)
- [Subscription Handles — pause, resume, cancel](#subscription-handles--pause-resume-cancel)
  - [pause()](#pause)
  - [resume()](#resume)
  - [cancel()](#cancel)
  - [Example: Combining pause, resume, and cancel](#example-combining-pause-resume-and-cancel)
- [Global pause & resume](#global-pause--resume)
- [Error Handling](#error-handling)
- [Connection Status](#connection-status)
- [Reconnection Behaviour](#reconnection-behaviour)
- [Data Types](#data-types)
  - [VariableData](#variabledata)
  - [ValueStoreData](#valuestoredata)
  - [EventData](#eventdata)
- [Full Example](#full-example)

---

## Overview

`AnedyaStreamClient` opens a WebSocket to the Anedya platform and routes incoming binary (CBOR-encoded) messages to the right subscriber callbacks. You register as many subscriptions as you need, and each one can be independently paused, resumed, or cancelled — without affecting others or the connection itself.

---

## Installation & Imports

```ts
import { AnedyaStreamClient } from "./stream";
import { NewClient } from "./client";
import { NewNode } from "./node";
```

You also need a configured `NewClient` (holds your credentials/token) and a `NewNode` (identifies the device/node).

---

## Quick Start

```ts
// 1. Create client and node
const client = NewClient(connectConfig);
const node = NewNode(client, "your-node-id");

// 2. Create the stream client
const stream = new AnedyaStreamClient(
  client,
  node,
  "your-stream-id",
  "wss://stream.anedya.io/..."
);

// 3. Register subscriptions BEFORE connecting
const tempSub = stream.onVariable("temperature", (data) => {
  console.log("Temperature:", data.value, "at", data.timestamp);
});

// 4. Connect — the WebSocket opens here
await stream.connect();
```

---

## Constructor

```ts
new AnedyaStreamClient(
  client: NewClient,
  node: NewNode,
  streamId: string,
  streamUrl: string
)
```

| Parameter   | Type        | Description                                                  |
|-------------|-------------|--------------------------------------------------------------|
| `client`    | `NewClient` | Holds your API credentials and signing keys                  |
| `node`      | `NewNode`   | The device/node you want to stream data from                 |
| `streamId`  | `string`    | The stream identifier provided by Anedya                     |
| `streamUrl` | `string`    | The WebSocket URL for the stream (e.g. `wss://...`)          |

The stream client reads auth credentials from `client` and signs the WebSocket URL automatically — you don't need to handle authentication manually.

---

## Connecting & Disconnecting

### `connect()`

```ts
await stream.connect();
```

Opens the WebSocket connection. Authentication headers are derived from your client config and passed as query parameters (required because browsers don't support custom WebSocket headers).

- If already connected or destroyed, calling `connect()` again is a no-op.
- Reconnection on drop is handled automatically (see [Reconnection Behaviour](#reconnection-behaviour)).

### `disconnect()`

```ts
stream.disconnect();
```

Permanently closes the WebSocket. **No reconnect will happen after this.** Use this when you want to fully tear down the stream (e.g. on component unmount or app shutdown).

---

## Subscriptions

There are three subscription methods. Each returns an **`IStreamSubscription`** handle that lets you control that individual subscription.

---

### `onVariable` — Subscribe to a specific variable

```ts
const sub = stream.onVariable(variableId: string, callback: (data: VariableData) => void): IStreamSubscription
```

Fires `callback` whenever a message arrives for the given `variableId`. The `variableId` must exactly match the `variable` field in the incoming message.

**Example:**

```ts
const tempSub = stream.onVariable("temperature", (data) => {
  console.log(`Node: ${data.nodeId}`);
  console.log(`Value: ${data.value}`);
  console.log(`Timestamp: ${data.timestamp}`);
});
```

---

### `onValueStore` — Subscribe to a value store key

```ts
const sub = stream.onValueStore(key: string, callback: (data: ValueStoreData) => void): IStreamSubscription
```

Fires `callback` whenever a value store update arrives for the given `key`. The `key` must exactly match the `key` field in the incoming message.

**Example:**

```ts
const configSub = stream.onValueStore("threshold", (data) => {
  console.log(`New threshold: ${data.value}`);
  console.log(`Scope: ${data.scope}`);
});
```

---

### `onEvent` — Catch-all listener

```ts
const sub = stream.onEvent(callback: (data: VariableData) => void): IStreamSubscription
```

Fires `callback` for **every** message. Useful for debugging, logging, or building generic handlers that don't care about the specific data.

**Example:**

```ts
const debugSub = stream.onEvent((data) => {
  console.log(`From node ${data.nodeId}: variable=${data.variable}, value=${data.value}`);
});
```

---

## Subscription Handles — pause, resume, cancel

Every subscription method returns an `IStreamSubscription` object:

```ts
interface IStreamSubscription {
  pause(): void;
  resume(): void;
  cancel(): void;
}
```

These let you control **one subscription in isolation** — they have no effect on the WebSocket connection or any other subscription.

---

### `pause()`

Temporarily stops delivering messages to **this** callback. The WebSocket connection stays open, and messages keep arriving — they're just not forwarded to this particular callback while it's paused.

```ts
const sub = stream.onVariable("temperature", (data) => {
  if (data.value > 90) {
    sub.pause(); // stop receiving updates until manually resumed
    triggerAlert();
  }
});
```

---

### `resume()`

Re-enables message delivery to a paused callback. Only messages that arrive **after** `resume()` is called will be delivered — messages that came in while paused are not replayed.

```ts
// Resume delivery after handling the alert
setTimeout(() => {
  sub.resume();
}, 5000);
```

---

### `cancel()`

Permanently removes this subscription. Once cancelled, the callback will never fire again regardless of incoming messages. **This cannot be undone** — to re-subscribe, call `onVariable` / `onValueStore` / `onEvent` again.

```ts
// One-shot: receive one value store update and then stop
const sub = stream.onValueStore("config-key", (data) => {
  applyConfig(data.value);
  sub.cancel(); // unsubscribe after the first hit
});
```

---

### Example: Combining pause, resume, and cancel

```ts
let alertActive = false;

const sub = stream.onVariable("pressure", (data) => {
  if (data.value > 200 && !alertActive) {
    alertActive = true;
    sub.pause();           // stop receiving pressure updates during the alert

    handleAlert().then(() => {
      alertActive = false;
      sub.resume();        // re-enable updates once handled
    });
  }
});

// After 1 minute, tear down entirely
setTimeout(() => sub.cancel(), 60_000);
```

---

## Global pause & resume

In addition to per-subscription control, you can pause and resume **all** callbacks at once. The WebSocket stays connected — messages are discarded at the delivery layer.

```ts
stream.pause();   // all callbacks stop receiving — globally
stream.resume();  // all callbacks start receiving again
```

This is useful when your app goes into a background state and you don't want to process incoming data temporarily, but you also don't want to disconnect and reconnect.

> **Note:** Global pause stacks with per-subscription pause. If a subscription is individually paused, `stream.resume()` will not un-pause it — you need to call `sub.resume()` on that subscription separately.

---

## Error Handling

```ts
stream.onError((err) => {
  console.error("WebSocket error:", err);
});
```

`onError` registers a global listener for WebSocket-level errors. You can register multiple error listeners; all of them will be called on each error event. This does not catch CBOR decoding errors (those are logged to the console internally).

---

## Connection Status

```ts
stream.onStatus((status) => {
  // status is one of: "connected" | "disconnected" | "reconnecting"
  console.log("Stream status:", status);
});
```

Register a callback to be notified whenever the connection state changes. Useful for updating UI indicators or triggering application-level logic on drops.

| Status          | Meaning                                                         |
|-----------------|-----------------------------------------------------------------|
| `"connected"`   | WebSocket is open and receiving messages                        |
| `"disconnected"`| WebSocket closed (will attempt to reconnect unless destroyed)   |
| `"reconnecting"`| A reconnect attempt is scheduled                               |

---

## Reconnection Behaviour

If the WebSocket drops unexpectedly, the client will automatically try to reconnect with a fixed 3-second delay. It will attempt up to **5 reconnects** before giving up and logging an error.

- Calling `disconnect()` stops any future reconnect attempts permanently.
- Subscriptions are preserved across reconnects — your callbacks will resume firing once the connection is re-established.

---

## Data Types

### `VariableData`

Delivered to `onVariable` and `onEvent` callbacks.

```ts
interface VariableData {
  nodeId: string | undefined;  // hex string identifying the source node
  variable: string;            // the variable identifier (e.g. "temperature")
  value: any;                  // the variable's current value
  timestamp: number;           // Unix timestamp (seconds)
  dataType: number;            // raw data type byte from the message header
}
```

---

### `ValueStoreData`

Delivered to `onValueStore` callbacks.

```ts
interface ValueStoreData {
  nodeId: string | undefined;  // hex string identifying the source node
  scope: string | undefined;   // value store scope (if any)
  key: string;                 // the value store key (e.g. "threshold")
  value: any;                  // the stored value
  timestamp: number;           // Unix timestamp (seconds)
  type: any;                   // type metadata from the message
}
```

---

---

## Full Example

```ts
import { AnedyaStreamClient } from "./stream";
import { NewClient } from "./client";
import { NewNode } from "./node";

const client = NewClient({
  // your connection config
});

const node = NewNode(client, "your-node-id");

const stream = new AnedyaStreamClient(
  client,
  node,
  "your-stream-id",
  "wss://stream.anedya.io/your-endpoint"
);

// Listen for connection status changes
stream.onStatus((status) => {
  console.log("[Stream status]:", status);
});

// Handle WebSocket errors
stream.onError((err) => {
  console.error("[Stream error]:", err);
});

// Subscribe to a specific variable
const tempSub = stream.onVariable("temperature", (data) => {
  console.log("Temperature:", data.value);

  if (data.value > 100) {
    tempSub.pause(); // too hot — pause until we cool down
  }
});

// Subscribe to a value store key (one-shot)
const configSub = stream.onValueStore("alert-threshold", (data) => {
  applyThreshold(data.value);
  configSub.cancel(); // only needed once
});

// Catch-all for debugging — fires for every incoming message
const debugSub = stream.onEvent((data) => {
  console.log(`[Any] ${data.variable} = ${data.value} (node: ${data.nodeId})`);
});

// Open the connection
await stream.connect();

// Later: cleanly shut down
// stream.disconnect();
```