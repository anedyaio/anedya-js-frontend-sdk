const {
  Anedya,
  AnedyaGetDataRequest,
  AnedyaGetDataResponse,
  AnedyaGetSnapshotRequest,
  AnedyaGetSnapshotResponse,
  AnedyaGetLatestDataResponse,
  AnedyaSetKeyRequest,
  AnedyaGetKeyRequest,
  AnedyaScope,
  AnedyaDataType,
  AnedyaScanKeysResponse,
  AnedyaScanKeysRequest,
  AnedyaSetKeyResponse,
  AnedyaGetKeyResponse,
  AnedyaDeleteKeyResponse,
  AnedyaGetDeviceStatusResponse,
} = require("@anedyasystems/anedya-frontend-sdk");

// Configuration Constants
const tokenId = "";
const token =
  "";
const NodeId = "";
const variableIdentifier = "";

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
    const req = new AnedyaGetDataRequest(
      variableIdentifier,
      twentyFourHoursDelayedTime,
      currentTime,
      10
    );
    let res = new AnedyaGetDataResponse();
    res = await node_1.getData(req);
    if (res.isSuccess) {
      if (res.isDataAvailable) {
        console.log("Data:", res.data);
      } else {
        console.log("No data available in requested timestamp!!");
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
    let res = new AnedyaGetLatestDataResponse();
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
    let req = new AnedyaSetKeyRequest(
      { scope: AnedyaScope.NODE },
      "temperature",
      30,
      AnedyaDataType.FLOAT
    );
    let res = new AnedyaSetKeyResponse();
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
    let req = new AnedyaGetKeyRequest({ scope: "node" }, "temperature");
    let res = new AnedyaGetKeyResponse();
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
    let req = new AnedyaGetKeyRequest({ scope: "node" }, "temperature");
    let res = new AnedyaDeleteKeyResponse();
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
    let req = new AnedyaScanKeysRequest(
      { namespace: { scope: AnedyaScope.NODE } },
      "namespace",
      "asc",
      10,
      0
    );
    let res = new AnedyaScanKeysResponse();
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
    let res = new AnedyaGetDeviceStatusResponse();
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
    let req = new AnedyaGetSnapshotRequest(currentTime, variableIdentifier);

    // Initialize response object
    let res = new AnedyaGetSnapshotResponse();

    // Make the request
    res = await node_1.getSnapshot(req);

    console.log("Snapshot:", res);
  } catch (error) {
    console.error("Error getting Snapshot:", error);
  }
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
  await getSnapshot();
})();
