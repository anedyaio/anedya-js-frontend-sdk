const {
  Anedya,
  AnedyaError,
  AnedyaScope,
  AnedyaDataType,
} = require("@anedyasystems/anedya-frontend-sdk");


const streamId = "019f23ca-b4a6-7aab-8d7e-328a1c0b0372"
const streamUrl = "wss://ZxBpErVPCj.acs-r1.ap-in-1.anedya.io/v1/streams/connect"
const tokenId = "TSM6db7mbI22O245NZH8cSQE"
const token = "e5eWxsGLiOous4abs3Z2wcsmNIwPS2ZtLWlGIRSD0qKo3f1zjKnRnBegX4IDFnps"
const nodeId = "019f1ca6-82bc-7600-bc72-4435f9dd2774"
const variableIdentifier = "humidityfg"
const valueStoreKey = "check-1"

// Initialize Anedya Client
const anedya = new Anedya();
const connect_config = anedya.newConfig(tokenId, token);
const client = anedya.newClient(connect_config);
const node_1 = anedya.newNode(client, nodeId);
const stream = anedya.newStream(client, node_1, streamId, streamUrl);

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
      variable: variableIdentifier,
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
    const res = await node_1.getLatestData(variableIdentifier);
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

// Function to get snapshot
async function getSnapshot() {
  try {
    const currentTime = Math.floor(Date.now() / 1000); //time in seconds
    const res = await node_1.getSnapshot({
      time: currentTime,
      variable: variableIdentifier
    });
    console.log("Snapshot:", res);
  } catch (error) {
    if (error instanceof AnedyaError) {
      console.error(`Anedya Error: ${error.message} (Code: ${error.reasonCode})`);
    } else {
      console.error("Error getting Snapshot:", error);
    }
  }
}


async function getStream() {
  // stream is created at the top of the file

  stream.onStatus((status) => console.log("🔌 Status:", status));
  stream.onError((err) => console.error("Error:", err));

  const tempSub = stream.onVariable(variableIdentifier, (data) => {
    console.log("🌡️ Temp:", data.value, "@", data.timestamp);
    if (data.value > 80) {
      tempSub.pause();
      setTimeout(() => tempSub.resume(), 10_000);
    }
  });

  const thresholdSub = stream.onValueStore(valueStoreKey, (data) => {
    console.log("🗄️ New threshold:", data.value);
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
