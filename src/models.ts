/*
 * This file contains the models for the Anedya SDK.
 * It exports interfaces and classes that are used to represent the data
 * and requests for the Anedya API.
 *
 */
import { _ITimeSeriesData, _IError } from "./common";

// ============================== Data Access ==============================
// ------------ Get Data ------------
export interface IAnedyaGetDataReq {
  variable: string;
  from: number;
  to: number;
  limit: number;
  order: "asc" | "desc";
}
/**
 * Request object for fetching data.
 */
export class AnedyaGetDataReq implements IAnedyaGetDataReq {
  constructor(
    public variable: string,
    public from: number,
    public to: number,
    public limit: number = 10000,
    public order: "asc" | "desc" = "desc"
  ) {
    if (order !== "asc" && order !== "desc") {
      throw new Error(
        "Invalid order value. It should be either 'asc' or 'desc'."
      );
    }
    if (limit < 1) {
      throw new Error("Invalid limit value. It should be at least 1.");
    }
    if (from > to) {
      throw new Error(
        "Invalid time range. 'from' should be less than or equal to 'to'."
      );
    }
  }
}

export interface IAnedyaGetDataResp {
  isSuccess: boolean;
  error: _IError;
  isDataAvailable: boolean;
  data: _ITimeSeriesData | null;
  count: number;
  startTime: number;
  endTime: number;
}
/**
 * Response object for fetching data.
 */
export class AnedyaGetDataResp
  implements IAnedyaGetDataResp
{
  isSuccess: boolean;
  error: _IError;
  isDataAvailable: boolean;
  data: _ITimeSeriesData | null;
  count: number;
  startTime: number;
  endTime: number;
  constructor() {
    this.isSuccess = false;
    this.error = { errorMessage: "", reasonCode: "" };
    this.isDataAvailable = false;
    this.data = null;
    this.count = 0;
    this.startTime = 0;
    this.endTime = 0;
  }
}

// ----------------------------- Get Latest Data -------------------------------------------
export interface IAnedyaGetLatestDataResp {
  isSuccess?: boolean;
  error: _IError;
  isDataAvailable?: boolean;
  data?: _ITimeSeriesData | null;
}

export class AnedyaGetLatestDataResp implements IAnedyaGetLatestDataResp {
  isSuccess?: boolean;
  error: _IError;
  isDataAvailable?: boolean;
  data?: _ITimeSeriesData | null;
  constructor() {
    this.isSuccess = false;
    this.error = { errorMessage: "", reasonCode: "" };
    this.isDataAvailable = false;
    this.data = null;
  }
}

// ================================ Value Store ================================
// ------------ Set Value-Store ------------
export interface IAnedyaSetKeyReq{
  namespace: {
    scope: "global" | "node";
    id?: string;
  };
  key: string;
  value: string | number | boolean;
  type: "string" | "binary" | "float" | "boolean";
}

export class AnedyaSetKeyReq implements IAnedyaSetKeyReq {
  constructor(
    public namespace: {
      scope: "global" | "node";
      id?: string;
    },
    public key: string,
    public value: string | number | boolean,
    public type: "string" | "binary" | "float" | "boolean"
  ) {
    if (this.namespace.scope !== "global" && this.namespace.scope !== "node") {
      throw new Error(
        "Invalid namespace scope. It should be either 'global' or 'node'."
      );
    }
    if (
      this.type !== "string" &&
      this.type !== "binary" &&
      this.type !== "float" &&
      this.type !== "boolean"
    ) {
      throw new Error(
        "Invalid type value. It should be either 'string', 'binary', 'float', or 'boolean'."
      );
    }
  }
}

export interface IAnedyaSetKeyResp {
  isSuccess: boolean;
  error: _IError;
}

export class AnedyaSetKeyResp implements IAnedyaSetKeyResp {
  isSuccess: boolean;
  error: _IError;
  constructor() {
    this.isSuccess = false;
    this.error = { errorMessage: "", reasonCode: "" };
  }
}

// ------------ Get Value-Store ------------
export interface IAnedyaGetKeyReq {
  namespace: {
    scope: "global" | "node";
    id?: string;
  };
  key: string;
}

export class AnedyaGetKeyReq implements IAnedyaGetKeyReq {
  constructor(
    public namespace: {
      scope: "global" | "node";
      id?: string;
    },
    public key: string
  ) {
    if (this.namespace.scope !== "global" && this.namespace.scope !== "node") {
      throw new Error(
        "Invalid namespace scope. It should be either 'global' or 'node'."
      );
    }
  }
}

export interface IAnedyaGetKeyResp {
  isSuccess: boolean;
  error: _IError;
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

export class AnedyaGetKeyResp implements IAnedyaGetKeyResp {
  isSuccess: boolean;
  error: _IError;
  namespace: {
    scope: string;
    id: string;
  };
  key: string;
  value: string | number | boolean | any;
  type: string;
  size: number;
  modified: number;
  created: number;
  constructor() {
    this.isSuccess = false;
    this.error = { errorMessage: "", reasonCode: "" };
    this.namespace = { scope: "", id: "" };
    this.key = "";
    this.value = undefined;
    this.type = "";
    this.size = 0;
    this.modified = 0;
    this.created = 0;
  }
}

// ------------ Delete Value-Store ------------

export interface IAnedyaDeleteKeyReq {
  namespace: {
    scope: "global" | "node";
    id?: string;
  };
  key: string;
}
export class AnedyaDeleteKeyReq implements IAnedyaDeleteKeyReq {
  constructor(
    public namespace: {
      scope: "global" | "node";
      id?: string;
    },
    public key: string
  ) {
    if (this.namespace.scope !== "global" && this.namespace.scope !== "node") {
      throw new Error(
        "Invalid namespace scope. It should be either 'global' or 'node'."
      );
    }
  }
}

export interface IAnedyaDeleteKeyResp {
  isSuccess: boolean;
  error: _IError;
}

export class AnedyaDeleteKeyResp implements IAnedyaDeleteKeyResp{
  isSuccess: boolean;
  error: _IError;
  constructor() {
    this.isSuccess = false;
    this.error = { errorMessage: "", reasonCode: "" };
  }
}

// ---------------- Value Store Scan ----------------

export interface IAnedyaScanKeysReq {
  filter: {
    namespace: {
      scope: "global" | "node";
      id?: string;
    };
  };
  orderby: "namespace" | "key" | "created";
  order: "asc" | "desc";
  limit: number;
  offset: number;
}

export class AnedyaScanKeysReq
  implements IAnedyaScanKeysReq
{
  constructor(
    public filter: {
      namespace: {
        scope: "global" | "node";
        id?: string;
      };
    },
    public orderby: "namespace" | "key" | "created",
    public order: "asc" | "desc",
    public limit: number,
    public offset: number
  ) {
    if (
      this.filter.namespace.scope !== "global" &&
      this.filter.namespace.scope !== "node"
    ) {
      throw new Error(
        "Invalid namespace scope. It should be either 'global' or 'node'."
      );
    }
  }
}

export interface IAnedyaScanKeysResp {
  isSuccess: boolean;
  error: _IError;
  count: number;
  totalCount: number;
  data: any;
  next: number;
}

export class AnedyaScanKeysResp
  implements IAnedyaScanKeysResp
{
  isSuccess: boolean;
  error: _IError;
  count: number;
  totalCount: number;
  data: any;
  next: number;
  constructor() {
    this.isSuccess = false;
    this.error = { errorMessage: "", reasonCode: "" };
    this.count = 0;
    this.totalCount = 0;
    this.data = undefined;
    this.next = 0;
  }
}

// ---------------- Device Status ----------------

export interface IAnedyaGetDeviceStatusResp {
  isSuccess: boolean;
  error: _IError;
  data: any;
}

export class AnedyaGetDeviceStatusResp
  implements IAnedyaGetDeviceStatusResp
{
  isSuccess: boolean;
  error: _IError;
  data: any;
  constructor() {
    this.isSuccess = false;
    this.error = { errorMessage: "", reasonCode: "" };
    this.data = undefined;
  }
}

// ---------------- Get Snapshot----------------
export interface IAnedyaGetSnapshotReq {
  time: number;
  variable: string;
}

export class AnedyaGetSnapshotReq implements IAnedyaGetSnapshotReq {
  constructor(
    public time: number,
    public variable: string,

  ) {
     // Validate timestamp
    if (!Number.isFinite(time) || time <= 0) {
      throw new Error("Invalid time: must be a positive number (UNIX timestamp).");
    }
     const currentUnixTime = Math.floor(Date.now() / 1000);
    if (time > currentUnixTime) {
      throw new Error("Invalid time: timestamp cannot be in the future.");
    }

    // Validate variable
    if (!variable || typeof variable !== "string") {
      throw new Error("Invalid variable: must be a non-empty string.");
    }
  }
}


export interface NodeVariableValue {
  node: string;        // Node ID
  value: number | string | boolean | Uint8Array; // Variable value
  timestamp: number;   // Unix timestamp
}

export type NodeVariableValues = NodeVariableValue[];

export interface IAnedyaGetSnapshotResp {
  isSuccess: boolean;
    error: _IError;
  count: number;
  data: NodeVariableValues;
}

export class AnedyaGetSnapshotResp
  implements IAnedyaGetSnapshotResp
{
  isSuccess: boolean;
  error: _IError;
  count: number;
  data: NodeVariableValues;
  constructor() {
     this.error = { errorMessage: "", reasonCode: "" };
    this.isSuccess = false;
    this.count = 0;
    this.data = []; 
  }
}
