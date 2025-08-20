/*
 Access Data from the Anedya platform side api.
*/
import {
  AnedyaGetDataBetweenReqInterface,
  AnedyaGetDataBetweenRespInterface,
  AnedyaGetDataBetweenResponse,
  AnedyaLatestDataRespInterface,
  AnedyaLatestDataResponse,
} from "../models";
import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders, _ITimeSeriesData } from "../common";

// ------------------------------ Get Data -----------------------------
interface _AnedyaGetDataRespInterface {
  success: boolean;
  data: _ITimeSeriesData | null;
  errorcode: number;
  error: string;
  reasonCode: string;
  count: number;
  startTime: number;
  endTime: number;
}

export const getData = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  accessDataReq: AnedyaGetDataBetweenReqInterface
): Promise<any> => {
  const url = `${baseUrl}/data/getData`;

  const requestData = {
    nodes: nodes,
    variable: accessDataReq.variable,
    from: Math.floor(accessDataReq.from / 1000),
    to: Math.floor(accessDataReq.to / 1000),
    limit: accessDataReq.limit,
    order: accessDataReq.order,
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
    let res: AnedyaGetDataBetweenRespInterface = new AnedyaGetDataBetweenResponse();
    try {
      let responseData: _AnedyaGetDataRespInterface = await response.json();
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      res.isDataAvailable = false;
      res.data = null;

      if (responseData.success) {
        let data: any = responseData.data;
        if (
          data == undefined ||
          data == null ||
          Object.keys(data).length === 0
        ) {
          res.isDataAvailable = false;
        } else if (nodes.length === 1) {
          data = data[nodes.toString()];
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
interface _AnedyaGetLatestDataRespInterface {
  success: boolean;
  data: _ITimeSeriesData | null;
  errorcode: number;
  error: string;
  reasonCode: string;
  count: number;
}

export const fetchLatestData = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  accessDataReq: any
): Promise<any> => {
  const url = `${baseUrl}/data/latest`;

  const requestData = {
    nodes: nodes,
    variable: accessDataReq.variable,
  };
  const currentTime = Math.floor(Date.now() / 1000); // time in sec
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
    let res: AnedyaLatestDataRespInterface = new AnedyaLatestDataResponse();
    try {
      const responseData: _AnedyaGetLatestDataRespInterface =
        await response.json();
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      res.isDataAvailable = false;
      res.data = null;
      if (responseData.success) {
        let data: any = responseData.data;
        if (
          data == undefined ||
          data == null ||
          Object.keys(data).length === 0
        ) {
          res.isDataAvailable = false;
        } else if (nodes.length === 1) {
          data = data[nodes.toString()];
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
