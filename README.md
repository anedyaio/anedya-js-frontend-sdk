# Anedya Frontend SDK

A JavaScript/TypeScript SDK for interacting with the [Anedya](https://anedya.io) IoT platform. It covers fetching time-series data, managing a key-value store, checking device status, and receiving live data over a WebSocket stream.

---

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Node Methods](#node-methods)
  - [getNodeId](#getnodeid)
  - [getData](#getdata)
  - [getLatestData](#getlatestdata)
  - [getSnapshot](#getsnapshot)
  - [setKey](#setkey)
  - [getKey](#getkey)
  - [deleteKey](#deletekey)
  - [scanKeys](#scankeys)
  - [getDeviceStatus](#getdevicestatus)
- [Live Streaming](#live-streaming)
  - [Setup](#stream-setup)
  - [onVariable](#onvariable)
  - [onValueStore](#onvaluestore)
  - [onAllMessages](#onallmessages)
  - [Subscription control — pause, resume, cancel](#subscription-control--pause-resume-cancel)
  - [Global pause & resume](#global-pause--resume)
  - [Connection status & errors](#connection-status--errors)
  - [Reconnection](#reconnection)
  - [Data Shapes](#data-shapes)


---

## Installation

```bash
npm install @anedyasystems/anedya-frontend-sdk
```

---

## Setup

Every SDK operation starts by initialising a client and a node. Use environment variables to keep credentials out of your source code. The package ships both CommonJS and ESM builds, so the import syntax depends on your environment:

**Node.js (CommonJS)** — `require`:

```js
const { Anedya } = require("@anedyasystems/anedya-frontend-sdk");


const anedya = new Anedya();
const config = anedya.newConfig("YOUR_TOKEN_ID", "YOUR_TOKEN");
const client = anedya.newClient(config);
const node   = anedya.newNode(client, "YOUR_NODE_ID");
```

**React, Vite, Next.js, or any other bundler** — `import`:

```js
import { Anedya } from "@anedyasystems/anedya-frontend-sdk";

const anedya = new Anedya();
const config = anedya.newConfig("YOUR_TOKEN_ID", "YOUR_TOKEN");
const client = anedya.newClient(config);
const node   = anedya.newNode(client, "YOUR_NODE_ID");
```

**Plain browser `<script>` tag (no bundler)** — load the pre-built IIFE bundle, which exposes everything on `window.AnedyaSDK`:

```html
<script src="sdk-bundle.js"></script>
<script>
  const { Anedya } = window.AnedyaSDK;

const anedya = new Anedya();
const config = anedya.newConfig("YOUR_TOKEN_ID", "YOUR_TOKEN");
const client = anedya.newClient(config);
const node   = anedya.newNode(client, "YOUR_NODE_ID");

</script>
```

> There's no safe way to keep secrets out of plain client-side `<script>` code — anything in it is visible to anyone who views the page source. Only use hardcoded tokens here for local testing, not in anything you ship publicly.

`client` holds your credentials and signs every request automatically. `node` is the entry point for all data and value store operations.

---

## Node Methods

### `getNodeId`

Returns the node ID string this instance was created with.

```js
const id = node.getNodeId();
```

---

### `getData`

Fetches time-series data for a variable within a time range.

```js
const { AnedyaGetDataReq, AnedyaGetDataResp } = require("@anedyasystems/anedya-frontend-sdk");

const now  = Date.now();
const req  = new AnedyaGetDataReq("temperature", now - 86400_000, now, 100);
const res  = await node.getData(req);

if (res.isSuccess && res.isDataAvailable) {
  console.log(res.data);
}
```

| Parameter | Type     | Description                              |
|-----------|----------|------------------------------------------|
| variable  | `string` | Variable identifier                      |
| from      | `number` | Start timestamp in **milliseconds**      |
| to        | `number` | End timestamp in **milliseconds**        |
| limit     | `number` | Max data points to return (default 10000)|

---

### `getLatestData`

Returns the single most recent data point for a variable.

```js
const res = await node.getLatestData("temperature");

if (res.isSuccess && res.isDataAvailable) {
  console.log(res.data);
}
```

---

### `getSnapshot`

Returns the value of a variable at a specific point in time. If no data point exists at exactly that timestamp, the nearest one **before** it is returned.

```js
const { AnedyaGetSnapshotReq } = require("@anedyasystems/anedya-frontend-sdk");

const req = new AnedyaGetSnapshotReq(Math.floor(Date.now() / 1000), "temperature");
const res = await node.getSnapshot(req);

if (res.isSuccess && res.data.length > 0) {
  console.log(res.data[0].value, res.data[0].timestamp);
}
```

> Timestamps for `getSnapshot` are in **Unix seconds**, not milliseconds.

---

### `setKey`

Stores a key-value pair in the value store.

```js
const { AnedyaSetKeyReq, AnedyaSetKeyResp, AnedyaScope, AnedyaDataType } = require("@anedyasystems/anedya-frontend-sdk");

const req = new AnedyaSetKeyReq({ scope: AnedyaScope.NODE }, "threshold", 75, AnedyaDataType.FLOAT);
const res = await node.setKey(req);

if (res.isSuccess) console.log("Key set");
```

**Scopes:**

| Scope              | Description                                      |
|--------------------|--------------------------------------------------|
| `AnedyaScope.NODE` | Key is local to this node only                   |
| `AnedyaScope.GLOBAL` | Key is shared across all nodes in the account  |

**Supported data types:** `STRING`, `BINARY`, `FLOAT`, `BOOLEAN`

---

### `getKey`

Retrieves a stored value by key.

```js
const { AnedyaGetKeyReq, AnedyaGetKeyResp, AnedyaScope } = require("@anedyasystems/anedya-frontend-sdk");

const req = new AnedyaGetKeyReq({ scope: AnedyaScope.NODE }, "threshold");
const res = await node.getKey(req);

if (res.isSuccess) console.log(res.data);
```

---

### `deleteKey`

Deletes a key from the value store. The scope must match the one used when the key was created.

```js
const { AnedyaGetKeyReq, AnedyaDeleteKeyResp, AnedyaScope } = require("@anedyasystems/anedya-frontend-sdk");

const req = new AnedyaGetKeyReq({ scope: AnedyaScope.NODE }, "threshold");
const res = await node.deleteKey(req);

if (res.isSuccess) console.log("Key deleted");
```

---

### `scanKeys`

Lists keys in the value store for a given namespace, with ordering and pagination. Returns up to 100 keys per call.

```js
const { AnedyaScanKeysReq, AnedyaScanKeysResp, AnedyaScope } = require("@anedyasystems/anedya-frontend-sdk");

const req = new AnedyaScanKeysReq(
  { namespace: { scope: AnedyaScope.NODE } },
  "namespace",  // scan type
  "asc",        // order
  10,           // limit
  0             // offset
);
const res = await node.scanKeys(req);

if (res.isSuccess) console.log(res.data);
```

---

### `getDeviceStatus`

Checks whether the node is online based on when it last sent a heartbeat.

```js
const res = await node.getDeviceStatus(60); // online if heartbeat within last 60 seconds

if (res.isSuccess) {
  const status = res.data[node.getNodeId()];
  console.log("Online:", status.online);
  console.log("Last heartbeat:", new Date(status.lastHeartbeat * 1000));
}
```

Pass a `lastContactThreshold` in seconds. If the device sent a heartbeat within that window, it is considered online.

---

## Live Streaming

The stream client opens a WebSocket connection and delivers incoming data to subscriber callbacks in real time.

### Stream Setup

```js
const stream = anedya.newStream(
  client,
  node,
  "your-stream-id",
  "wss://ZxBpErVPCj.acs-r1.ap-in-1.anedya.io/v1/streams/connect"
);

stream.onStatus((status) => console.log("Status:", status));
stream.onError((err)   => console.error("Error:", err));

await stream.connect();
```

To close the stream permanently:

```js
stream.disconnect(); // no reconnect will happen after this
```

---

### `onVariable`

Fires whenever a message arrives for a specific variable identifier.

```js
const sub = stream.onVariable("temperature", (data) => {
  console.log(data.value, data.timestamp);
});
```

---

### `onValueStore`

Fires whenever a value store update arrives for a specific key.

```js
const sub = stream.onValueStore("threshold", (data) => {
  console.log("New threshold:", data.value);
});
```

---

### `onAllMessages`

Fires for **every** incoming message on the stream — both variable messages and value store messages, regardless of variable name or key. Useful for logging everything or building generic handlers.

Each delivered object carries a `kind` field so you can tell which shape you received: `"variable"` (a `VariableData`) or `"valuestore"` (a `ValueStoreData`).

```js
const sub = stream.onAllMessages((data) => {
  if (data.kind === "variable") {
    console.log("Variable:", data.variable, data.value, data.nodeId);
  } else {
    console.log("Value store:", data.key, data.value, data.nodeId);
  }
});
```

---

### Subscription control — pause, resume, cancel

Every subscription method returns a handle with three controls. They affect only that one subscription — the connection and all other subscriptions are unaffected.

```ts
interface IStreamSubscription {
  pause(): void;   // stop delivering to this callback (connection stays open)
  resume(): void;  // re-enable delivery (messages during pause are not replayed)
  cancel(): void;  // permanently remove this subscription
}
```

**pause / resume** — temporarily stop and restart a subscription:

```js
const sub = stream.onVariable("temperature", (data) => {
  if (data.value > 90) {
    sub.pause();
    setTimeout(() => sub.resume(), 10_000);
  }
});
```

**cancel** — permanently unsubscribe whenever your logic decides it's done. The example below cancels after the very first message, but you could just as easily cancel after the 10th, after a value crosses some threshold, or on any other condition:

```js
const sub = stream.onValueStore("config", (data) => {
  // applyConfig is your own function — do whatever you need with the value here
  applyConfig(data.value);
  sub.cancel();
});
```

---

### Global pause & resume

Pauses or resumes delivery to **all** callbacks at once without closing the connection.

```js
stream.pause();   // all callbacks stop receiving
stream.resume();  // all callbacks start receiving again
```

> If a subscription was individually paused before `stream.pause()`, calling `stream.resume()` will not un-pause it — you still need to call `sub.resume()` on that subscription separately.

---

### Connection status & errors

```js
stream.onStatus((status) => {
  // "connected" | "disconnected" | "reconnecting"
});

stream.onError((err) => {
  console.error(err);
});
```

---

### Reconnection

If the connection drops unexpectedly, the stream automatically retries with a 3-second delay, up to 5 attempts. Calling `disconnect()` cancels all future reconnect attempts. Subscriptions survive reconnects and resume firing once the connection is restored.

---

### Data Shapes

**VariableData** — delivered by `onVariable`, and by `onAllMessages` (tagged with `kind: "variable"`):

```ts
{
  nodeId:    string | undefined  // source node (hex string)
  variable:  string              // variable identifier
  value:     any                 // current value
  timestamp: number              // Unix seconds
  dataType:  number              // data type byte
}
```

**ValueStoreData** — delivered by `onValueStore`, and by `onAllMessages` (tagged with `kind: "valuestore"`):

```ts
{
  nodeId:    string | undefined  // source node (hex string)
  scope:     string | undefined  // store scope
  key:       string              // key name
  value:     any                 // stored value
  timestamp: number              // Unix seconds
  type:      any                 // type metadata
}
```

**AllMessagesData** — the union type delivered by `onAllMessages`. It's either of the above shapes plus a `kind` discriminant:

```ts
type AllMessagesData =
  | (VariableData & { kind: "variable" })
  | (ValueStoreData & { kind: "valuestore" });
```






