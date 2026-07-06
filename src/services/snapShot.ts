import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders } from "../common";
import {
  IAnedyaGetSnapshotReq,
  IAnedyaGetSnapshotResp,
  AnedyaGetSnapshotResp,
  NodeVariableValue,
  NodeVariableValues,
} from "../models";
import { validateResponse } from "../error_handler";
import { AnedyaError } from "../errors";

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
  getSnapshotReq: IAnedyaGetSnapshotReq
): Promise<AnedyaGetSnapshotResp> => {
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

    const responseData: _AnedyaGetSnapshotResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(
        responseData.error,
        responseData.reasonCode,
        response.status
      );
    }

    const res = new AnedyaGetSnapshotResp();
    res.isSuccess = true;

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
  };

  return executeRequest();
};
