const {
  Anedya,
} = require("@anedyasystems/anedya-frontend-sdk");

// ── Your Anedya credentials ─────────────────────────────────────────────────
const tokenId = "lsWa9iOl1XWW2ACpvI9Nlx3w";
const token = "gP6iJf4hcUmoi24lyjLsaIxRw4UuF7wEGah9Fa1qOCnaNjvhohoYvNDf13AU25d1";

// ── Node-specific input ──────────────────────────────────────────────────────
const nodeId = "20deeee8-f8ae-11ee-9dd8-c3aa61afe2fb";

// ── Stream-specific input ────────────────────────────────────────────────────
const streamId = "019d3dbe-f14f-7365-b339-bcefbcc848a0";
const streamUrl = "wss://ZxBpErVPCj.acs-r1.ap-in-1.anedya.io/v1/streams/connect";

// ── Variable / key you want to watch ────────────────────────────────────────
const variableIdentifier = "temperature";
const valueStoreKey = "threshold";

async function main() {
  // 1️⃣ Create the Anedya client (shared auth/config for everything below)
  const anedya = new Anedya();
  const connectConfig = anedya.NewConfig(tokenId, token);
  const client = anedya.NewClient(connectConfig);

  // 2️⃣ Create a node instance — used for normal REST calls AND passed into the stream
  const node = anedya.NewNode(client, nodeId);
  console.log("📦 Node created:", node.getNodeId());

  // 3️⃣ Create the stream client — takes the client, the node instance,
  //    and the stream-specific streamId + streamUrl
  const stream = new AnedyaStreamClient(client, node, streamId, streamUrl);

  // 4️⃣ Register listeners BEFORE connecting

  stream.onStatus((status) => {
    console.log("🔌 Status:", status);
  });

  stream.onError((err) => {
    console.error("❌ Stream error:", err);
  });

  // Fires only for messages matching this exact variable
  const tempSub = stream.onVariable(variableIdentifier, (data) => {
    console.log(`🌡️ ${variableIdentifier}:`, data.value, "@", data.timestamp);

    // Example: use the node instance inside the callback for follow-up queries
    if (data.value > 80) {
      console.warn("⚠️ Over threshold — fetching recent history via node...");
      node.getData({
        variable: variableIdentifier,
        from: Date.now() - 3600 * 1000, // last hour
        to: Date.now(),
        limit: 10,
      }).then((res) => {
        if (res.isSuccess && res.isDataAvailable) {
          console.log("📊 Last hour history:", res.data);
        }
      });

      tempSub.pause();
      setTimeout(() => tempSub.resume(), 10_000); // resume after 10s
    }
  });

  // Fires only for messages matching this exact value store key
  const vsSub = stream.onValueStore(valueStoreKey, (data) => {
    console.log(`🗄️ ${valueStoreKey} updated →`, data.value);
    vsSub.cancel(); // one-shot: stop listening after the first update
  });

  // Fires on every variable/event message regardless of which variable
  const eventSub = stream.onEvent((data) => {
    console.log("📡 Event:", data.variable, "=", data.value);
  });

  // 5️⃣ Connect
  await stream.connect();
  console.log("🚀 Stream connection initiated");

  // ── Optional: demonstrate global controls ──────────────────────────────────
  setTimeout(() => {
    console.log("⏸️ Pausing all stream callbacks");
    stream.pause();
  }, 30_000);

  setTimeout(() => {
    console.log("▶️ Resuming all stream callbacks");
    stream.resume();
  }, 40_000);

  setTimeout(() => {
    console.log("🛑 Disconnecting stream");
    stream.disconnect();
  }, 60_000);
}

main().catch((err) => console.error("Fatal error:", err));