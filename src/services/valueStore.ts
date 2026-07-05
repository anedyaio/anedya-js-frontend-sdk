/**
 * Access Data from the Anedya platform side api.
 */
import {
  IAnedyaSetKeyReq,
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
import { validateResponse } from "../error_handler";
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
  reqConfig: IAnedyaSetKeyReq
): Promise<AnedyaSetKeyResp> => {
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

    const responseData: _AnedyaSetKeyResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(responseData.error, responseData.reasonCode, response.status);
    }

    const res = new AnedyaSetKeyResp();
    res.isSuccess = true;
    return res;
  };

  return executeRequest();
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
): Promise<AnedyaGetKeyResp> => {
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

    const responseData: _AnedyaGetKeyResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(responseData.error, responseData.reasonCode, response.status);
    }

    const res = new AnedyaGetKeyResp();
    res.isSuccess = true;
    res.namespace = responseData.namespace;
    res.key = responseData.key;
    res.value = responseData.value;
    res.type = responseData.type;
    res.size = responseData.size;
    res.modified = responseData.modified;
    res.created = responseData.created;
    return res;
  };

  return executeRequest();
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
): Promise<AnedyaDeleteKeyResp> => {
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

    const responseData: _AnedyaDeleteKeyResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(responseData.error, responseData.reasonCode, response.status);
    }

    const res = new AnedyaDeleteKeyResp();
    res.isSuccess = true;
    return res;
  };

  return executeRequest();
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
): Promise<AnedyaScanKeysResp> => {
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
    order: reqConfig.order ?? "desc",
    limit: reqConfig.limit ?? 100,
    offset: reqConfig.offset ?? 0,
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

    const responseData: _AnedyaScanKeysResp = await response.json();

    if (!responseData.success) {
      throw new AnedyaError(responseData.error, responseData.reasonCode, response.status);
    }

    const res = new AnedyaScanKeysResp();
    res.isSuccess = true;
    res.count = responseData.count;
    res.totalCount = responseData.totalCount;
    res.data = responseData.data;
    res.next = responseData.next;
    return res;
  };

  return executeRequest();
};
