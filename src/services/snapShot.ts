import { Anedya } from "../anedya";
import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders } from "../common";
import {
  AnedyaGetSnapshotReq,
  AnedyaGetSnapshotResp,
  AnedyaGetSnapshotResponse,
  NodeVariableValue,
  NodeVariableValues,
} from "../models";

// ------------------------ Device Status -------------------------
interface _AnedyaGetSnapshotResp {
  success: boolean;
  error: string;
  errorcode: number;
  reasonCode: string;
  count: number;
  data: NodeVariableValues;
}

export const getSnapshot = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  getSnapshotReq: AnedyaGetSnapshotReq
): Promise<any> => {
  const url = `${baseUrl}/data/snapshot`;

  const requestData = {
    nodes: nodes,
    time: getSnapshotReq?.time,
    variable: getSnapshotReq?.variable,
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
    let res: AnedyaGetSnapshotResp = new AnedyaGetSnapshotResponse();
    try {
      const responseData: _AnedyaGetSnapshotResp =
        await response.json();
      // console.log(responseData);
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      if (!res.isSuccess) {
        return res;
      }

      // If only one node was requested → filter array for that node
      if (nodes.length === 1) {
        res.data = responseData.data.filter(
          (item: NodeVariableValue) => item.node === nodes[0]
        );
      } else {
        // If multiple nodes → just return the full array
        res.data = responseData.data;
      }
      res.count = responseData.count; // keep count in sync
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

//checks if it works in js
//add req, comments for req
//enums
//remove anedya from names
