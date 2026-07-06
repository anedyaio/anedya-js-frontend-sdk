/**
 *  Access Data from the Anedya platform side api.
 *
 * Provides functions to fetch historical and latest time-series data
 * from the Anedya platform API. These functions handle request signing,
 * header construction, error handling, and response normalization.
 */

import {
  IAnedyaGetDataReq,
  IAnedyaGetDataResp,
  AnedyaGetDataResp,
  IAnedyaGetLatestDataReq,
  IAnedyaGetLatestDataResp,
  AnedyaGetLatestDataResp,
} from "../models";
import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders, _ITimeSeriesData } from "../common";
import { validateResponse } from "../error_handler";
import { AnedyaError } from "../errors";

// ------------------------------ Get Data -----------------------------

/**
 * Internal interface for the raw response structure of the `getData` API.
 * This matches the Anedya backend format before mapping into SDK response objects.
 */

interface _AnedyaGetDataResp {
  success: boolean;
  data: _ITimeSeriesData | null;
  errorcode: number;
  error: string;
  reasonCode: string;
  count: number;
  startTime: number;
  endTime: number;
}

/**
 * Fetch time-series data for a given node and variable from the Anedya platform.
 *
 * @param baseUrl - Base URL of the Anedya API endpoint.
 * @param configHeaders - Authentication + signature headers configuration.
 * @param nodes - Array of node IDs to fetch data for.
 * @param accessDataReq - Request parameters (variable name, time range, limit, order).
 * @returns Promise resolving to a structured response object.
 *
 * @example
 * ```ts
 * const req = new AnedyaGetDataReq("temperature", from, to, 100);
 * const res = await getData(baseUrl, headers, ["node123"], req);
 * if (res.isSuccess && res.isDataAvailable) {
 *   //console.log(res.data);
 * }
 * ```
 */

export const getData = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  accessDataReq: IAnedyaGetDataReq,
): Promise<AnedyaGetDataResp> => {
  const url = `${baseUrl}/data/getData`;

  const requestData = {
    nodes: nodes,
    variable: accessDataReq.variable,
    from: Math.floor(accessDataReq.from / 1000),
    to: Math.floor(accessDataReq.to / 1000),
    limit: accessDataReq.limit ?? 1000,
    order: accessDataReq.order ?? "desc",
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

    const responseData: _AnedyaGetDataResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(
        responseData.error,
        responseData.reasonCode,
        response.status,
      );
    }

    const res = new AnedyaGetDataResp();
    res.isSuccess = true;
    res.isDataAvailable = false;
    res.data = null;

    let data: any = responseData.data;
    if (data && Object.keys(data).length > 0) {
      if (nodes.length === 1) {
        data = data[nodes.toString()];
      }
      res.data = data;
      res.isDataAvailable = true;
    }

    res.count = responseData.count;
    res.startTime = responseData.startTime;
    res.endTime = responseData.endTime;
    return res;
  };

  return executeRequest();
};

// ------------------------------ Get Latest Data -----------------------------

/**
 * Internal interface for the raw response structure of the `latest` API.
 */
interface _AnedyaGetLatestDataResp {
  success: boolean;
  data: _ITimeSeriesData | null;
  errorcode: number;
  error: string;
  reasonCode: string;
  count: number;
}

/**
 * Fetch the most recent data point from the given node and variable.
 *
 * @param baseUrl - Base URL of the Anedya API endpoint.
 * @param configHeaders - Authentication + signature headers configuration.
 * @param nodes - Array of node IDs to fetch latest data for.
 * @param accessDataReq - Request parameters (contains variable identifier).
 * @returns Promise resolving to a structured response object.
 *
 * @example
 * ```ts
 * const req = { variable: "temperature" };
 * const res = await fetchLatestData(baseUrl, headers, ["node123"], req);
 * if (res.isSuccess && res.isDataAvailable) {
 *   //console.log("Latest Data:", res.data);
 * }
 * ```
 */

export const fetchLatestData = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  accessDataReq: IAnedyaGetLatestDataReq,
): Promise<AnedyaGetLatestDataResp> => {
  const url = `${baseUrl}/data/latest`;

  const requestData = {
    nodes: nodes,
    variable: accessDataReq.variable,
  };
  const currentTime = Math.floor(Date.now() / 1000); // time in seconds
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

    const responseData: _AnedyaGetLatestDataResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(
        responseData.error,
        responseData.reasonCode,
        response.status,
      );
    }

    const res = new AnedyaGetLatestDataResp();
    res.isSuccess = true;
    res.isDataAvailable = false;
    res.data = null;

    let data: any = responseData.data;
    if (data && Object.keys(data).length > 0) {
      if (nodes.length === 1) {
        data = data[nodes.toString()];
      }
      res.data = data;
      res.isDataAvailable = true;
    }
    return res;
  };

  return executeRequest();
};
