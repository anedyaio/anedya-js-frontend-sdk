import { IConfigHeaders } from "./common";

export const anedyaSignature = async (
  requestData: any,
  configHeaders: IConfigHeaders,
  currentTime: number
): Promise<any> => {
  try {
    let bodyBytes: Uint8Array;

    if (requestData === null || requestData === undefined) {
      // ✅ WebSocket case → empty body
      bodyBytes = new Uint8Array(); 
    } else {
      // ✅ REST case → normal payload
      const encoder = new TextEncoder();
      bodyBytes = encoder.encode(JSON.stringify(requestData));
    }

    // SHA-256 of body
const bodyHashBuffer = await crypto.subtle.digest(
  "SHA-256",
  bodyBytes as BufferSource
);
    const bodyHashBytes = new Uint8Array(bodyHashBuffer);

    // Timestamp (same as before)
    const timeBytes = new Uint8Array(8);
    new DataView(timeBytes.buffer).setBigUint64(0, BigInt(currentTime), false);

    // Combine bytes (same as before)
    const combinedBytes = new Uint8Array(
      bodyHashBytes.length +
      timeBytes.length +
      configHeaders.signatureVersionBytes.length +
      configHeaders.tokenBytes.length
    );

    combinedBytes.set(bodyHashBytes, 0);
    combinedBytes.set(timeBytes, bodyHashBytes.length);
    combinedBytes.set(
      configHeaders.signatureVersionBytes,
      bodyHashBytes.length + timeBytes.length
    );
    combinedBytes.set(
      configHeaders.tokenBytes,
      bodyHashBytes.length +
      timeBytes.length +
      configHeaders.signatureVersionBytes.length
    );

    // Final hash
    const combinedHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      combinedBytes
    );

    return Array.from(new Uint8Array(combinedHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  } catch (e) {
    console.log(e);
  }
};