/*
 Access Data from the Anedya platform side api.
*/
import {
  AnedyaSetKeyReq,
  IAnedyaDeleteKeyResp,
  IAnedyaSetKeyResp,
  IAnedyaGetKeyReq,
  IAnedyaGetKeyResp,
  IAnedyaDeleteKeyReq,
  IAnedyaScanKeysReq,
  IAnedyaScanKeysResp,
  AnedyaDeleteKeyResp,
  AnedyaScanKeysResp,
  AnedyaSetKeyResp,
  AnedyaGetKeyResp,
} from "../models";
import { anedyaSignature } from "../anedya_signature";
import { IConfigHeaders } from "../common";
import { AnedyaError } from "../errors";

// ------------------------------ Set Value-Store -----------------------------
interface _AnedyaSetKeyResp {
  success: boolean;
  errorcode: number;
  error: string;
  reasonCode: string;
}

export const setKey = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  reqConfig: AnedyaSetKeyReq
): Promise<any> => {
  const url = `${baseUrl}/valuestore/setValue`;
  let Id;
  if (reqConfig.namespace.scope === "node") {
    Id = nodes[0];
  } else {
    Id = reqConfig.namespace.id;
  }

  const requestData = {
    namespace: {
      scope: reqConfig.namespace.scope,
      id: Id,
    },
    key: reqConfig.key,
    value: reqConfig.value,
    type: reqConfig.type,
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

    let res: IAnedyaSetKeyResp = new AnedyaSetKeyResp();
    try {
      const responseData: _AnedyaSetKeyResp = await response.json();
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      return res;
    } catch (error) {
      res.isSuccess = false;
      res.error.errorMessage = response.statusText;
      res.error.reasonCode = response.status.toString();
      return res;
    }
  } catch (error) {
    console.error("Error during set key: ", error);
    throw error;
  }
};

// ------------------------------ Get Value-Store -----------------------------
interface _AnedyaGetKeyResp {
  success: boolean;
  errorcode: number;
  error: string;
  reasonCode: string;
  namespace: {
    scope: string;
    id: string;
  };
  key: string;
  value: string | number | boolean;
  type: string;
  size: number;
  modified: number;
  created: number;
}

export const getKey = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  reqConfig: IAnedyaGetKeyReq
): Promise<any> => {
  const url = `${baseUrl}/valuestore/getValue`;
  let Id;
  if (reqConfig.namespace.scope === "node") {
    Id = nodes[0];
  } else {
    Id = reqConfig.namespace.id;
  }

  const requestData = {
    namespace: {
      scope: reqConfig.namespace.scope,
      id: Id,
    },
    key: reqConfig.key,
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
    let res: IAnedyaGetKeyResp = new AnedyaGetKeyResp();

    try {
      const responseData: _AnedyaGetKeyResp = await response.json();
      // console.log(responseData);
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      res.namespace = responseData.namespace;
      res.key = responseData.key;
      res.value = responseData.value;
      res.type = responseData.type;
      res.size = responseData.size;
      res.modified = responseData.modified;
      res.created = responseData.created;
      return res;
    } catch (error) {
      res.isSuccess = false;
      res.error.errorMessage = response.statusText;
      res.error.reasonCode = response.status.toString();
      return res;
    }
  } catch (error) {
    console.error("Error during get key request: ", error);
    throw error;
  }
};

// ------------------------------ Delete Value-Store -----------------------------
interface _AnedyaDeleteKeyResp {
  success: boolean;
  errorcode: number;
  error: string;
  reasonCode: string;
}

export const deleteKey = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  reqConfig: IAnedyaDeleteKeyReq
): Promise<any> => {
  const url = `${baseUrl}/valuestore/delete`;
  let Id;
  if (reqConfig.namespace.scope === "node") {
    Id = nodes[0];
  } else {
    Id = reqConfig.namespace.id;
  }

  const requestData = {
    namespace: {
      scope: reqConfig.namespace.scope,
      id: Id,
    },
    key: reqConfig.key,
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

    let res: IAnedyaDeleteKeyResp = new AnedyaDeleteKeyResp();
    try {
      const responseData: _AnedyaDeleteKeyResp = await response.json();
      // console.log(responseData);
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
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

// ------------------------------  Scan Value-Store -----------------------------
interface _AnedyaScanKeysResp {
  success: boolean;
  errorcode: number;
  error: string;
  reasonCode: string;
  count: number;
  totalCount: number;
  data: any[];
  next: number;
}

export const scanKeys = async (
  baseUrl: string,
  configHeaders: IConfigHeaders,
  nodes: string[],
  reqConfig: IAnedyaScanKeysReq
): Promise<any> => {
  const url = `${baseUrl}/valuestore/scan`;
  let Id;
  if (reqConfig.filter.namespace.scope === "node") {
    Id = nodes[0];
  } else {
    Id = reqConfig.filter.namespace.id;
  }

  const requestData = {
    filter: {
      namespace: {
        scope: reqConfig.filter.namespace.scope,
        id: Id,
      },
    },
    orderby: reqConfig.orderby,
    order: reqConfig.order,
    limit: reqConfig.limit,
    offset: reqConfig.offset,
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
    let res: IAnedyaScanKeysResp =
      new AnedyaScanKeysResp();
    try {
      const responseData: _AnedyaScanKeysResp =
        await response.json();
      res.isSuccess = responseData.success;
      res.error.errorMessage = responseData.error;
      res.error.reasonCode = responseData.reasonCode;
      res.count = responseData.count;
      res.totalCount = responseData.totalCount;
      res.data = responseData.data;
      res.next = responseData.next;
      return res;
    } catch (error) {
      res.isSuccess = false;
      res.error.errorMessage = response.statusText;
      res.error.reasonCode = response.status.toString();
      return res;
    }
  } catch (error) {
    console.error("Error during scan vs operation: ", error);
    throw error;
  }
};
