import { Anedya } from "../anedya";
import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders } from "../common";
import {
  AnedyaDeviceStatusRespInterface,
  AnedyaDeviceStatusResponse,
} from "../models";

// ------------------------ Device Status -------------------------
interface _AnedyaDeviceStatusRespInterface {
  success: boolean;
  errcode: number;
  error: string;
  reasonCode: string;
  data: any;
}

export const deviceStatus = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  lastContactThreshold: number
): Promise<any> => {
  const url = `${baseUrl}/health/status`;

  const requestData = {
    nodes: nodes,
    lastContactThreshold: lastContactThreshold,
  };
  const currentTime = Math.floor(Date.now() / 1000);
  const combinedHash = await anedyaSignature(
    requestData,
    configHeaders,
    currentTime
  );
  try {
    const reqHeaders = {
      Authorization: configHeaders.authorizationMode,
      "x-Anedya-SignatureVersion": configHeaders.signatureVersion,
      "X-Anedya-Tokenid": configHeaders.tokenId,
      "X-Anedya-Timestamp": currentTime.toString(),
      "X-Anedya-Signature": combinedHash,
      "Content-Type": "application/json",
    };
    // console.log(reqHeaders);

    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: reqHeaders,
      body: JSON.stringify(requestData),
    });
    let res: AnedyaDeviceStatusRespInterface = new AnedyaDeviceStatusResponse();
    try {
      const responseData: _AnedyaDeviceStatusRespInterface =
        await response.json();
      // console.log(responseData);
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      if (!res.isSuccess) {
        return res;
      }
      if (nodes.length === 1) {
        res.data = responseData.data[nodes[0]];
      } else {
        res.data = responseData.data;
      }
      return res;
    } catch (error) {
      res.isSuccess = false;
      res.error.errorMessage = response.statusText;
      res.error.reasonCode = response.status.toString();
      return res;
    }
  } catch (error) {
    console.error("Error during fetch operation:", error);
    throw error;
  }
};
