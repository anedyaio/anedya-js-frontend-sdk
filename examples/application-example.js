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
    AnedyaStreamClient, 
} = require("@anedyasystems/anedya-frontend-sdk");

// Your Anedya credentials
// const tokenId = "lsWa9iOl1XWW2ACpvI9Nlx3w";
// const token = "gP6iJf4hcUmoi24lyjLsaIxRw4UuF7wEGah9Fa1qOCnaNjvhohoYvNDf13AU25d1";
// const NodeId = "20deeee8-f8ae-11ee-9dd8-c3aa61afe2fb";
// const variableIdentifier = "temperature";
// const streamId="019d3dbe-f14f-7365-b339-bcefbcc848a0"
// const streamUrl="wss://ZxBpErVPCj.acs-r1.ap-in-1.anedya.io/v1/streams/connect"

const streamId="019ed381-8fd6-706e-8d7b-a0e93312c865"
const streamUrl="wss://ZxBpErVPCj.acs-r1.ap-in-1.anedya.io/v1/streams/connect"
const tokenId="1LoygvNpcfieJOhsKiKkmPaV"
const token="uardIpoF2nIDEa0SB1Uoeii51Jgt8WOqFUt5vnNlESmIUEj1mYEOBTyamC08VmuX"
const variableIdentifier="stream-test"
const nodeId="019ed37e-c9f9-7c0a-a20e-c24520e5d41f"

// Initialize Anedya Client
const anedya = new Anedya();
const connect_config = anedya.NewConfig(tokenId, token);
const client = anedya.NewClient(connect_config);
const node_1 = anedya.NewNode(client, NodeId);
const stream = new AnedyaStreamClient(client, node_1, streamId, streamUrl);

// Example function to get Node ID
async function getNodeId() {
  try {
    const nodeId = node_1.getNodeId();
    //console.log("Node Id:", nodeId);
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
        //console.log("Data:", res.data);
      } else {
        //console.log("No data available in Requested timestamp!!");
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
        //console.log("Latest Data:", res.data);
      } else {
        //console.log("No latest data available!");
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
      //console.log("Key set successfully!");
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
      //console.log("Key fetched successfully!");
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
      //console.log("Key deleted successfully!");
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
      //console.log("Keys scanned successfully!");
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
    //console.log("Device Status:", res);
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

    //console.log("Snapshot:", res);
  } catch (error) {
    console.error("Error getting Snapshot:", error);
  }

}


async function testStream() {
  // stream is created at the top of the file

  stream.onStatus((status) => console.log("🔌 Status:", status));
  stream.onError((err) => console.error("Error:", err));

  const tempSub = stream.onVariable("temperature", (data) => {
    console.log("🌡️ Temp:", data.value, "@", data.timestamp);
    if (data.value > 80) {
      tempSub.pause();
      setTimeout(() => tempSub.resume(), 10_000);
    }
  });

  const thresholdSub = stream.onValueStore("threshold", (data) => {
    //console.log("🗄️ New threshold:", data.value);
    thresholdSub.cancel();
  });

  const eventSub = stream.onEvent((data) => {
    //console.log("📡 Event:", data.variable, data.value);
  });

  await stream.connect();

  setTimeout(() => { stream.pause(); console.log("⏸️ Global pause"); }, 30_000);
  setTimeout(() => { stream.resume(); console.log("▶️ Resumed"); }, 40_000);
  setTimeout(() => stream.disconnect(), 60_000);
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
 await testStream();
})();
