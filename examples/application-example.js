const {
  Anedya,
  AnedyaGetDataReq,
  AnedyaGetDataResp,
  AnedyaGetSnapshotReq,
  AnedyaGetSnapshotResp,
  AnedyaGetLatestDataResp,
  AnedyaSetKeyReq,
  AnedyaGetKeyReq,
  AnedyaScope,
  AnedyaDataType,
  AnedyaScanKeysResp,
  AnedyaScanKeysReq,
  AnedyaSetKeyResp,
  AnedyaGetKeyResp,
  AnedyaDeleteKeyResp,
  AnedyaGetDeviceStatusResp,
} = require("@anedyasystems/anedya-frontend-sdk");

// Your Anedya credentials
const tokenId = "iG91tS7YJ1h3NPU9gepjVrL8";
const token = "7cLzCk3OVcDtVlCJbOBX4DyLWr67ny5ocVv528U2yoK6tenJXiudUJrfhbo1NDnh";
const NodeId = "20deeee8-f8ae-11ee-9dd8-c3aa61afe2fb";
const variableIdentifier = "temperature";
const streamId="019d2e20-655c-74af-ada3-8d4bba3a3305"
const streamUrl="wss://ZxBpErVPCj.acs-r1.ap-in-1.anedya.io/v1/streams/connect"


// Initialize Anedya Client
const anedya = new Anedya();
const connect_config = anedya.NewConfig(tokenId, token);
const client = anedya.NewClient(connect_config);
const node_1 = anedya.NewNode(client, NodeId);

// Example function to get Node ID
async function getNodeId() {
  try {
    const nodeId = node_1.getNodeId();
    console.log("Node Id:", nodeId);
  } catch (error) {
    console.error("Error getting Node Id:", error);
  }
}

// Example function to access data from the Anedya platform
async function getData() {
  try {
    const currentTime = Math.floor(Date.now()); //time in milliseconds
    const twentyFourHoursDelayedTime = currentTime - 86400 * 1000;
    const req = new AnedyaGetDataReq(
      variableIdentifier,
      twentyFourHoursDelayedTime,
      currentTime,
      10
    );
    let res = new AnedyaGetDataResp();
    res = await node_1.getData(req);
    if (res.isSuccess) {
      if (res.isDataAvailable) {
        console.log("Data:", res.data);
      } else {
        console.log("No data available in Requested timestamp!!");
      }
    } else {
      console.error("Error fetching data:", res.error.errorMessage);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Example function to get the latest data
async function getLatestData() {
  try {
    let res = new AnedyaGetLatestDataResp();
    res = await node_1.getLatestData(variableIdentifier);
    if (res.isSuccess) {
      if (res.isDataAvailable) {
        console.log("Latest Data:", res.data);
      } else {
        console.log("No latest data available!");
      }
    } else {
      console.error("Error fetching latest data:", res.error);
    }
  } catch (error) {
    console.error("Error fetching latest data:", error);
  }
}

async function setKey() {
  try {
    let req = new AnedyaSetKeyReq(
      { scope: AnedyaScope.NODE },
      "temperature",
      30,
      AnedyaDataType.FLOAT
    );
    let res = new AnedyaSetKeyResp();
    res = await node_1.setKey(req);

    if (res.isSuccess) {
      console.log("Key set successfully!");
    } else {
      console.error("Error setting key:", res);
    }
  } catch (error) {
    console.error("Error setting key 2:", error);
  }
}

async function getKey() {
  try {
    let req = new AnedyaGetKeyReq({ scope: "node" }, "temperature");
    let res = new AnedyaGetKeyResp();
    res = await node_1.getKey(req);

    if (res.isSuccess) {
      console.log("Key fetched successfully!");
    } else {
      console.error("Error fetching key:", res);
    }
  } catch (error) {
    console.error("Error fetching key 2:", error);
  }
}

async function deleteKey() {
  try {
    let req = new AnedyaGetKeyReq({ scope: "node" }, "temperature");
    let res = new AnedyaDeleteKeyResp();
    res = await node_1.deleteKey(req);

    if (res.isSuccess) {
      console.log("Key deleted successfully!");
    } else {
      console.error("Error deleting key: ", res.error.errorMessage);
    }
  } catch (error) {
    console.error("Error deleting key 2:", error);
  }
}

async function scanKeys() {
  try {
    let req = new AnedyaScanKeysReq(
      { namespace: { scope: AnedyaScope.NODE } },
      "namespace",
      "asc",
      10,
      0
    );
    let res = new AnedyaScanKeysResp();
    res = await node_1.scanKeys(req);

    if (res.isSuccess) {
      console.log("Keys scanned successfully!");
    } else {
      console.error("Error scanning Keys:", res);
    }
  } catch (error) {
    console.error("Error scanning Keys 2:", error);
  }
}

// Function to get device status
async function getDeviceStatus() {
  try {
    let res = new AnedyaGetDeviceStatusResp();
    res = await node_1.getDeviceStatus(10);
    console.log("Device Status:", res);
  } catch (error) {
    console.error("Error getting Device Status:", error);
  }
}

// Function to get snapshot
async function getSnapshot() {
  try {
    const currentTime = Math.floor(Date.now() / 1000); //time in seconds
    let req = new AnedyaGetSnapshotReq(currentTime, variableIdentifier);

    // Initialize Resp object
    let res = new AnedyaGetSnapshotResp();

    // Make the Req
    res = await node_1.getSnapshot(req);

    console.log("Snapshot:", res);
  } catch (error) {
    console.error("Error getting Snapshot:", error);
  }

}


async function testStream() {
  try {

    const stream = node_1.connectStream(streamId, streamUrl);

    // Attach listeners BEFORE connecting
    stream.onData((data) => {
      console.log("📡 STREAM DATA:", data);
    });

    stream.onError((err) => {
      console.error("❌ STREAM ERROR:", err);
    });

    await stream.connect();

    console.log("🚀 Stream connection initiated");
  } catch (error) {
    console.error("Error in stream:", error);
  }
}


// Execute functions
(async () => {
  // await getNodeId();
  // await getData();
  // await getLatestData();
  // await setKey();
  // await getKey();
  // await deleteKey();
  // await scanKeys();
  // await getDeviceStatus();
await testStream()
})();
