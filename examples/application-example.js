const {
  Anedya,
  AnedyaError,
  AnedyaScope,
  AnedyaDataType,
  AnedyaVariableType,
} = require("@anedyasystems/anedya-frontend-sdk");

const streamId = "019f31ed-1ca3-71c9-ac15-84fa01fc905d"
const streamUrl = "wss://ZxBpErVPCj.acs-r1.ap-in-1.anedya.io/v1/streams/connect"
const tokenId = "qUM1uFhwYXB5GF2JMdzVBG6m"
const token = "jL5vBAWk3c4vmgGPUBqzsFKTGk3TSxesF1SSLexCj3ju2A3BIFd6aUjNmPRS8O9w"
const nodeId = ["019f283a-6d5b-7a7e-a445-e6bf024cc051", "019f2839-ed79-7eef-a12c-465c2ce431bb"]
const variables = ["temperature", "status", "location"]
const vsKey = ["vs-test", "test"]

// Initialize Anedya Client
const anedya = new Anedya();
const connect_config = anedya.newConfig(tokenId, token);
const client = anedya.newClient(connect_config);
const node_1 = anedya.newNode(client, nodeId[0]);
const stream = anedya.newStream(client, streamId, streamUrl);

// Example function to get Node ID
async function getNodeId() {
  try {
    const id = node_1.getNodeId();
    console.log("Node Id:", id);
  } catch (error) {
    console.error("Error getting Node Id:", error);
  }
}

// Example function to access data from the Anedya platform
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

// Example function to get the latest data
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

// Function to get device status
async function getDeviceStatus() {
  try {
    const res = await node_1.getDeviceStatus(10);
    console.log("Device Status:", res);
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error getting Device Status:", error);
    }
  }
}

async function getStream() {
  // stream is created at the top of the file

  stream.onStatus((status) => console.log("🔌 Status:", status));
  stream.onError((err) => console.error("Error:", err));

  const tempSub = stream.onVariable(nodeId, variables, (data) => {
    switch (data.dataType) {
      case AnedyaVariableType.FLOAT:
        console.log(`[FLOAT]  ${data.variable} = ${data.value}  (node: ${data.nodeId}, ts: ${data.timestamp})`);
        break;

      case AnedyaVariableType.GEO_COORDINATE: {
        const geo = data.value; // { lat, lng }
        console.log(`[GEO]    ${data.variable} → lat: ${geo.lat}, lng: ${geo.lng}  (node: ${data.nodeId}, ts: ${data.timestamp})`);
        break;
      }

      case AnedyaVariableType.STATUS:
        console.log(`[STATUS] ${data.variable} = "${data.value}"  (node: ${data.nodeId}, ts: ${data.timestamp})`);
        break;

      default:
        console.log(`[TYPE:${data.dataType}] ${data.variable} = ${JSON.stringify(data.value)}  (node: ${data.nodeId}, ts: ${data.timestamp})`);
    }
  });

  const thresholdSub = stream.onValueStore(nodeId, vsKey, (data) => {
    console.log("ValueStore changed Key: ", data.key, "Value:", data.value);
    console.log("  nodeId         :", data.nodeId);
    console.log("  namespace.scope:", data.namespace.scope);
    console.log("  namespace.id   :", data.namespace.id);
    thresholdSub.cancel();
  });


  // Fires for EVERY incoming message — both variable and value store frames.
  // data.kind tells you which shape you got: "variable" or "valuestore".
  const allSub = stream.onAllMessages((data) => {
    if (data.kind === "variable") {
      console.log("📡 All messages → variable:", data.variable, data.value);
    } else {
      console.log("📡 All messages → valuestore:", data.key, data.value);
    }
  });

  await stream.connect();

  // setTimeout(() => { stream.pause(); console.log("⏸️ Global pause"); }, 30_000);
  // setTimeout(() => { stream.resume(); console.log("▶️ Resumed"); }, 40_000);
  // setTimeout(() => stream.disconnect(), 60_000);
}

// Execute functions
(async () => {
  await getNodeId();
  await getData();
  await getLatestData();
  await setKey();
  await getKey();
  await deleteKey();
  await scanKeys();
  await getDeviceStatus();
  await getStream();
})();
