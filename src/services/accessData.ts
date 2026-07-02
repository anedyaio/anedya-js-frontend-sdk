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
  AnedyaGetLatestDataResp,
} from "../models";
import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders, _ITimeSeriesData } from "../common";

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
  accessDataReq: IAnedyaGetDataReq
): Promise<AnedyaGetDataResp> => {
  const url = `${baseUrl}/data/getData`;

    // Request payload expected by Anedya backend
    const requestData = {
      nodes: nodes,
      variable: accessDataReq.variable,
      from: Math.floor(accessDataReq.from / 1000),
      to: Math.floor(accessDataReq.to / 1000),
      limit: accessDataReq.limit ?? 10000,
      order: accessDataReq.order ?? "desc",
    };


  // Generate request signature for secure communication
  const currentTime = Math.floor(Date.now() / 1000);
  const combinedHash = await anedyaSignature(
    requestData,
    configHeaders,
    currentTime
  );

  try {
    // Required request headers for authentication & integrity
    const reqHeaders = {
      Authorization: configHeaders.authorizationMode,
      "x-Anedya-SignatureVersion": configHeaders.signatureVersion,
      "X-Anedya-Tokenid": configHeaders.tokenId,
      "X-Anedya-Timestamp": currentTime.toString(),
      "X-Anedya-Signature": combinedHash,
      "Content-Type": "application/json",
    };

    // Perform the request
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: reqHeaders,
      body: JSON.stringify(requestData),
    });
    // Initialize SDK response object
    let res: IAnedyaGetDataResp =
      new AnedyaGetDataResp();
    try {
      // Parse raw backend response
      let responseData: _AnedyaGetDataResp = await response.json();
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      res.isDataAvailable = false;
      res.data = null;
      // Map backend response into SDK response structure
      if (responseData.success) {
        let data: _ITimeSeriesData | null = responseData.data;
        if (
          data == undefined ||
          data == null ||
          Object.keys(data).length === 0
        ) {
          res.isDataAvailable = false;
        } else if (nodes.length === 1) {
          data = data[nodes.toString()] as _ITimeSeriesData;
          res.data = data;
          res.isDataAvailable = true;
        } else {
          res.data = data;
          res.isDataAvailable = true;
        }
      }
      res.count = responseData.count;
      res.startTime = responseData.startTime;
      res.endTime = responseData.endTime;
      return res;
    } catch (error) {
      // Handle malformed JSON or parsing issues
      res.isSuccess = false;
      res.error.reasonCode = response.status.toString();
      res.error.errorMessage = response.statusText;
      return res;
    }
  } catch (error) {
    console.error("Error during Get data request:", error);
    throw error;
  }
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
 * Fetch the most recent data point for a given node and variable.
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
   accessDataReq: IAnedyaGetLatestDataReq
 ): Promise<AnedyaGetLatestDataResp> => {

  const url = `${baseUrl}/data/latest`;

  // Request payload for latest data
  const requestData = {
    nodes: nodes,
    variable: accessDataReq.variable,
  };
  const currentTime = Math.floor(Date.now() / 1000); // time in seconds
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
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: reqHeaders,
      body: JSON.stringify(requestData),
    });
    let res: IAnedyaGetLatestDataResp = new AnedyaGetLatestDataResp();
    try {
      const responseData: _AnedyaGetLatestDataResp =
        await response.json();
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      res.isDataAvailable = false;
      res.data = null;
              // Map latest data into SDK response
      if (responseData.success) {
        let data: _ITimeSeriesData | null = responseData.data;
        if (
          data == undefined ||
          data == null ||
          Object.keys(data).length === 0
        ) {
          res.isDataAvailable = false;
        } else if (nodes.length === 1) {
          data = data[nodes.toString()] as _ITimeSeriesData;
          res.data = data;
          res.isDataAvailable = true;
        } else {
          res.data = data;
          res.isDataAvailable = true;
        }
      }
      return res;
    } catch (error) {
      res.isSuccess = false;
      res.error.reasonCode = response.status.toString();
      res.error.errorMessage = response.statusText;
      return res;
    }
  } catch (error) {
    console.error("Error during get latest data request:", error);
    throw error;
  }
};

