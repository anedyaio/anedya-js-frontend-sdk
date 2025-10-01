import { IConfigHeaders } from "./common";

export const anedyaSignature = async (requestData: any, configHeaders: IConfigHeaders, currentTime: number): Promise<any> => {
    try {
      const encoder = new TextEncoder();
      const bodyBytes = encoder.encode(JSON.stringify(requestData));
  
      // Create SHA-256 hash of the bodyBytes
      const bodyHashBuffer = await crypto.subtle.digest("SHA-256", bodyBytes);
      const bodyHashBytes = new Uint8Array(bodyHashBuffer);
  
      const timeBytes = new Uint8Array(8);
      new DataView(timeBytes.buffer).setBigUint64(0, BigInt(currentTime), false); // Big-endian
  
      // Combine [bodyHashBytes, timeBytes, signatureVersionBytes, tokenBytes]
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
  
      // Compute SHA-256 hash of combinedBytes
      const combinedHashBuffer = await crypto.subtle.digest(
        "SHA-256",
        combinedBytes
      );
      const combinedHash = Array.from(new Uint8Array(combinedHashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return combinedHash;
    } catch (e) {
      console.log(e);
    }
  }
  