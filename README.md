[<img alt="PyPI" src="https://img.shields.io/npm/v/%40anedyasystems%2Fanedya-frontend-sdk?style=for-the-badge">](https://www.npmjs.com/package/@anedyasystems/anedya-frontend-sdk)&nbsp;&nbsp;[<img alt="Anedya Documentation" src="https://img.shields.io/badge/Anedya-Documentation-blue?style=for-the-badge">](https://docs.anedya.io?utm_source=github&utm_medium=link&utm_campaign=github-sdk&utm_content=js)


<!---<div style="width:20%; margin:0 auto;margin-bottom:50px;margin-top:50px;">-->
<p align="center">
    <img src="https://cdn.anedya.io/anedya_black_banner.png" alt="Logo">
</p>
<!--</div>-->



# Anedya Frontend SDK

A JavaScript/TypeScript SDK for interacting with the [Anedya](https://anedya.io) IoT platform. It covers all the features required for front-end development, including time-series data, key-value store, device status, and live streaming.

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
async function getData() {
  try {
    const currentTime = Date.now(); // time in milliseconds
    const twentyFourHoursDelayedTime = currentTime - 86400 * 1000;
    const res = await node_1.getData({
      variable: variables[0],
      from: twentyFourHoursDelayedTime,
      to: currentTime,
      limit: 10
    });

    if (res.isDataAvailable) {
      console.log("Data:", res.data);
    } else {
      console.log("No data available in Requested timestamp!!");
    }
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error fetching data:", error);
    }
  }
}
```
 
| Parameter | Type     | Description                              |
|-----------|----------|------------------------------------------|
| variable  | `string` | Variable identifier                      |
| from      | `number` | Start timestamp in **milliseconds**      |
| to        | `number` | End timestamp in **milliseconds**        |
| limit     | `number` | Max data points to return 10K (default 1000)|
| order     | `string` | "asc" or "desc" (default "desc")         |
 
---


### `getLatestData`

Returns the single most recent data point for a variable.

```js
async function getLatestData() {
  try {
    const res = await node_1.getLatestData(variables[0]);
    if (res.isDataAvailable) {
      console.log("Latest Data:", res.data);
    } else {
      console.log("No latest data available!");
    }
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error fetching latest data:", error);
    }
  }
}
```

---


### `setKey`

Stores a key-value pair in the value store.

```js
async function setKey() {
  try {
    await node_1.setKey({
      namespace: { scope: AnedyaScope.NODE },
      key: "temperature",
      value: 30,
      type: AnedyaDataType.FLOAT
    });
    console.log("Key set successfully!");
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error setting key:", error);
    }
  }
}
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
async function getKey() {
  try {
    const res = await node_1.getKey({
      namespace: { scope: AnedyaScope.NODE },
      key: "temperature"
    });
    console.log("Key fetched successfully!", res.value);
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error fetching key:", error);
    }
  }
}
```


---

### `deleteKey`

Deletes a key from the value store. The scope must match the one used when the key was created.

```js
async function deleteKey() {
  try {
    await node_1.deleteKey({
      namespace: { scope: AnedyaScope.NODE },
      key: "temperature"
    });
    console.log("Key deleted successfully!");
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error deleting key:", error);
    }
  }
}
```


---

### `scanKeys`

Lists keys in the value store for a given namespace, with ordering and pagination. Returns up to 100 keys per call.

```js
async function scanKeys() {
  try {
    const res = await node_1.scanKeys({
      filter: { namespace: { scope: AnedyaScope.NODE } },
      orderby: "namespace",
      order: "asc",
      limit: 10,
      offset: 0
    });
    console.log("Keys scanned successfully!", res.data);
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error scanning Keys:", error);
    }
  }
}
```


---

## Node Methods
 
...
 
### `getDeviceStatus`
 
Checks whether the node is online based on when it last sent a heartbeat.
 
```js
try {
    const res = await node_1.getDeviceStatus(10);
    const data = res.data
    console.log("Device Status:", data);
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error getting Device Status:", error);
    }
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
  "your-stream-id",
  "wss://&lt;host&gt;.acs-r1.ap-in-1.anedya.io/v1/streams/connect"
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

Fires whenever a variable message arrives matching the given node IDs and variable identifiers.  
Pass `["*"]` as either argument to match **all** nodes or **all** variables.

```js
const sub = stream.onVariable(
  ["node-uuid-1", "node-uuid-2"],  // node IDs  — ["*"] for all nodes
  ["temperature", "humidity"],      // variables — ["*"] for all variables
  (data) => {
    switch (data.dataType) {
      case AnedyaVariableType.FLOAT:
        console.log(`[FLOAT]  ${data.variable} = ${data.value}`);
        break;

      case AnedyaVariableType.GEO_COORDINATE: {
        const geo = data.value; // GeoCoordinateData { lat, lng }
        console.log(`[GEO]    ${data.variable} → lat: ${geo.lat}, lng: ${geo.lng}`);
        break;
      }

      case AnedyaVariableType.STATUS:
        console.log(`[STATUS] ${data.variable} = "${data.value}"`);
        break;

      default:
        console.log(`[TYPE:${data.dataType}] ${data.variable} =`, data.value);
    }
  }
);
```

---

### `onValueStore`

Fires whenever a value store update arrives matching the given node IDs and keys.  
Pass `["*"]` as either argument to match **all** nodes or **all** keys.

```js
const sub = stream.onValueStore(
  ["node-uuid-1"],   // node IDs — ["*"] for all nodes
  ["threshold"],     // keys     — ["*"] for all keys
  (data) => {
    console.log("Key:", data.key, "Value:", data.value);
    console.log("nodeId:         ", data.nodeId);           // convenience alias
    console.log("namespace.scope:", data.namespace.scope);  // e.g. "node"
    console.log("namespace.id:   ", data.namespace.id);     // same as nodeId
  }
);
```

---

### `onAllMessages`

Fires for **every** incoming message on the stream — both variable and value store — regardless of variable name or key. Useful for logging or building generic handlers.

Each delivered object carries a `kind` discriminant: `"variable"` or `"valuestore"`.

```js
const sub = stream.onAllMessages((data) => {
  if (data.kind === "variable") {
    console.log("Variable:", data.variable, data.value, "node:", data.nodeId);
  } else {
    console.log("ValueStore:", data.key, data.value, "node:", data.nodeId);
  }
});
```

---

### Subscription control — pause, resume, cancel

Every subscription method returns a handle. Controls affect only that one subscription — the connection and all other subscriptions are unaffected.

```ts
interface IStreamSubscription {
  pause(): void;   // stop delivering to this callback (connection stays open)
  resume(): void;  // re-enable delivery (messages during pause are not replayed)
  cancel(): void;  // permanently remove this subscription
}
```

**pause / resume** — temporarily stop and restart a subscription:

```js
const sub = stream.onVariable(["*"], ["temperature"], (data) => {
  if (data.value > 90) {
    sub.pause();
    setTimeout(() => sub.resume(), 10_000);
  }
});
```

**cancel** — permanently unsubscribe after a condition is met:

```js
const sub = stream.onValueStore(["*"], ["config"], (data) => {
  applyConfig(data.value);
  sub.cancel(); // one-shot: remove after first hit
});
```

---

### Global pause & resume

Pauses or resumes delivery to **all** callbacks at once without closing the connection.

```js
stream.pause();   // all callbacks stop receiving
stream.resume();  // all callbacks start receiving again
```

> If a subscription was individually paused before `stream.pause()`, calling `stream.resume()` will not un-pause it — you still need to call `sub.resume()` separately.

---

### Connection status & errors

```js
stream.onStatus((status) => {
  // "connected" | "disconnected" | "reconnecting"
  console.log("Stream status:", status);
});

stream.onError((err) => {
  console.error("Stream error:", err);
});
```

---

### Reconnection

If the connection drops unexpectedly, the stream automatically retries with a 3-second delay, up to 5 attempts. Calling `disconnect()` cancels all future reconnect attempts. Subscriptions survive reconnects and resume firing once the connection is restored.

---

### Variable Data Types — `AnedyaVariableType`

Use the `AnedyaVariableType` constants instead of raw numbers when inspecting `data.dataType`:

| Constant | Value | `data.value` shape |
|---|---|---|
| `AnedyaVariableType.FLOAT` | `1` | `number` |
| `AnedyaVariableType.GEO_COORDINATE` | `2` | `GeoCoordinateData` — `{ lat, lng }` |
| `AnedyaVariableType.STATUS` | `3` | `string` |

```js
const { AnedyaVariableType } = require("@anedyasystems/anedya-frontend-sdk");

stream.onVariable(["*"], ["*"], (data) => {
  if (data.dataType === AnedyaVariableType.GEO_COORDINATE) {
    const geo = data.value; // { lat: number, lng: number }
    console.log(geo.lat, geo.lng);
  }
});
```

---

### Data Shapes

**`VariableData`** — delivered by `onVariable` and `onAllMessages` (tagged `kind: "variable"`):

```ts
{
  nodeId:    string | undefined        // source node UUID
  variable:  string                    // variable identifier (e.g. "temperature")
  value:     number                    // FLOAT
           | string                    // STATUS
           | GeoCoordinateData         // GEO_COORDINATE — { lat: number, lng: number }
  timestamp: number                    // Unix milliseconds
  dataType:  number                    // see AnedyaVariableType
}
```

**`GeoCoordinateData`** — the `value` shape for `AnedyaVariableType.GEO_COORDINATE`:

```ts
{
  lat: number   // latitude
  lng: number   // longitude
}
```

**`ValueStoreData`** — delivered by `onValueStore` and `onAllMessages` (tagged `kind: "valuestore"`):

```ts
{
  nodeId:    string | undefined        // convenience alias — same as namespace.id
  namespace: {
    scope:   string | undefined        // store scope (e.g. "node")
    id:      string | undefined        // node UUID
  }
  key:       string                    // key name
  value:     string | number | boolean // stored value
  timestamp: number                    // Unix seconds
  type:      string | number           // value type metadata
}
```

**`AllMessagesData`** — union delivered by `onAllMessages`:

```ts
type AllMessagesData =
  | (VariableData   & { kind: "variable" })
  | (ValueStoreData & { kind: "valuestore" });
```


