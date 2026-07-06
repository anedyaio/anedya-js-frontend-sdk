import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders } from "../common";
import {
  IAnedyaGetDeviceStatusResp,
  AnedyaGetDeviceStatusResp,
} from "../models";
import { validateResponse } from "../error_handler";
import { AnedyaError } from "../errors";

// ------------------------ Device Status -------------------------
interface _AnedyaGetDeviceStatusResp {
  success: boolean;
  errcode: number;
  error: string;
  reasonCode: string;
  data: Record<string, { online: boolean; lastHeartbeat: number }>;
}

export const getDeviceStatus = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  lastContactThreshold: number,
): Promise<AnedyaGetDeviceStatusResp> => {
  const url = `${baseUrl}/health/status`;
  const requestData = {
    nodes: nodes,
    lastContactThreshold: lastContactThreshold,
  };
  const currentTime = Math.floor(Date.now() / 1000);
  const combinedHash = await anedyaSignature(
    requestData,
    configHeaders,
    currentTime,
  );

  const executeRequest = async () => {
    const reqHeaders = {
      Authorization: configHeaders.authorizationMode,
      "x-Anedya-SignatureVersion": configHeaders.signatureVersion,
      "X-Anedya-Tokenid": configHeaders.tokenId,
      "X-Anedya-Timestamp": currentTime.toString(),
      "X-Anedya-Signature": combinedHash,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: reqHeaders,
      body: JSON.stringify(requestData),
    });

    await validateResponse(response);

    const responseData: _AnedyaGetDeviceStatusResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(
        responseData.error,
        responseData.reasonCode,
        response.status,
      );
    }

    const res = new AnedyaGetDeviceStatusResp();
    res.isSuccess = true;
    if (nodes.length === 1) {
      res.data = responseData.data[nodes[0]];
    } else {
      res.data = responseData.data;
    }
    return res;
  };

  return executeRequest();
};
