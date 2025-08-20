interface INewConfig {
    tokenId: string;
    token: string;
    baseUrl: string;
}
declare class NewConfig implements INewConfig {
    tokenId: string;
    token: string;
    baseUrl: string;
    constructor(tokenId: string, token: string, testMode?: boolean);
}

interface IClient {
    tokenId: string;
    tokenBytes: Uint8Array;
    signatureVersionBytes: Uint8Array;
    signatureVersion: string;
    authorizationMode: string;
    baseUrl: string;
}
/**
 * Class representing a anedya client with configuration details.
 */
declare class NewClient implements IClient {
    tokenId: string;
    tokenBytes: Uint8Array;
    signatureVersionBytes: Uint8Array;
    signatureVersion: string;
    authorizationMode: string;
    baseUrl: string;
    /**
     * Constructs a new instance of NewClient.
     * @param {NewConfig} config - The configuration object.
     */
    constructor(config: NewConfig);
}

interface _ITimeSeriesData {
    [key: string]: object[];
}
interface _errInterface {
    errorMessage: string;
    reasonCode: string;
}

interface AnedyaGetDataBetweenReqInterface {
    variable: string;
    from: number;
    to: number;
    limit: number;
    order: "asc" | "desc";
}
/**
 * Request object for fetching data.
 */
declare class AnedyaGetDataBetweenRequest implements AnedyaGetDataBetweenReqInterface {
    variable: string;
    from: number;
    to: number;
    limit: number;
    order: "asc" | "desc";
    constructor(variable: string, from: number, to: number, limit?: number, order?: "asc" | "desc");
}
interface AnedyaGetDataBetweenRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    isDataAvailable: boolean;
    data: _ITimeSeriesData | null;
    count: number;
    startTime: number;
    endTime: number;
}
/**
 * Response object for fetching data.
 */
declare class AnedyaGetDataBetweenResponse implements AnedyaGetDataBetweenRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    isDataAvailable: boolean;
    data: _ITimeSeriesData | null;
    count: number;
    startTime: number;
    endTime: number;
    constructor();
}
interface AnedyaLatestDataRespInterface {
    isSuccess?: boolean;
    error: _errInterface;
    isDataAvailable?: boolean;
    data?: _ITimeSeriesData | null;
}
declare class AnedyaLatestDataResponse implements AnedyaLatestDataRespInterface {
    isSuccess?: boolean;
    error: _errInterface;
    isDataAvailable?: boolean;
    data?: _ITimeSeriesData | null;
    constructor();
}
interface AnedyaSetKeyRequestInterface {
    namespace: {
        scope: "global" | "node";
        id: string;
    };
    key: string;
    value: string | number | boolean;
    type: "string" | "binary" | "float" | "boolean";
}
declare class AnedyaSetKeyRequest implements AnedyaSetKeyRequestInterface {
    namespace: {
        scope: "global" | "node";
        id: string;
    };
    key: string;
    value: string | number | boolean;
    type: "string" | "binary" | "float" | "boolean";
    constructor(namespace: {
        scope: "global" | "node";
        id: string;
    }, key: string, value: string | number | boolean, type: "string" | "binary" | "float" | "boolean");
}
interface AnedyaSetKeyRespInterface {
    isSuccess: boolean;
    error: _errInterface;
}
declare class AnedyaSetKeyResponse implements AnedyaSetKeyRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    constructor();
}
interface AnedyaGetKeyReqInterface {
    namespace: {
        scope: "global" | "node";
        id: string;
    };
    key: string;
}
declare class AnedyaGetKeyRequest implements AnedyaGetKeyReqInterface {
    namespace: {
        scope: "global" | "node";
        id: string;
    };
    key: string;
    constructor(namespace: {
        scope: "global" | "node";
        id: string;
    }, key: string);
}
interface AnedyaGetKeyRespInterface {
    isSuccess: boolean;
    error: _errInterface;
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
declare class AnedyaGetKeyResponse implements AnedyaGetKeyRespInterface {
    isSuccess: boolean;
    error: _errInterface;
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
    constructor();
}
interface AnedyaDeleteKeyReqInterface {
    namespace: {
        scope: "global" | "node";
        id: string;
    };
    key: string;
}
declare class AnedyaDeleteKeyRequest implements AnedyaDeleteKeyReqInterface {
    namespace: {
        scope: "global" | "node";
        id: string;
    };
    key: string;
    constructor(namespace: {
        scope: "global" | "node";
        id: string;
    }, key: string);
}
interface AnedyaDeleteKeyRespInterface {
    isSuccess: boolean;
    error: _errInterface;
}
declare class AnedyaDeleteKeyResponse implements AnedyaDeleteKeyRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    constructor();
}
interface AnedyaScanValueStoreReqInterface {
    filter: {
        namespace: {
            scope: "global" | "node";
            id: string;
        };
    };
    orderby: "namespace" | "key" | "created";
    order: "asc" | "desc";
    limit: number;
    offset: number;
}
declare class AnedyaScanValueStoreRequest implements AnedyaScanValueStoreReqInterface {
    filter: {
        namespace: {
            scope: "global" | "node";
            id: string;
        };
    };
    orderby: "namespace" | "key" | "created";
    order: "asc" | "desc";
    limit: number;
    offset: number;
    constructor(filter: {
        namespace: {
            scope: "global" | "node";
            id: string;
        };
    }, orderby: "namespace" | "key" | "created", order: "asc" | "desc", limit: number, offset: number);
}
interface AnedyaScanValueStoreRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    count: number;
    totalCount: number;
    data: any;
    next: number;
}
declare class AnedyaScanValueStoreResponse implements AnedyaScanValueStoreRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    count: number;
    totalCount: number;
    data: any;
    next: number;
    constructor();
}
interface AnedyaDeviceStatusRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    data: any;
}
declare class AnedyaDeviceStatusResponse implements AnedyaDeviceStatusRespInterface {
    isSuccess: boolean;
    error: _errInterface;
    data: any;
    constructor();
}

interface INode {
    getNodeId(): string;
    getDataBetween(accessDataReq: AnedyaGetDataBetweenReqInterface): Promise<any>;
}
declare class NewNode implements INode {
    #private;
    constructor(client: NewClient, nodeId: string);
    /**
     * Returns the node ID of the node.
     * @returns {string} The node ID of the node.
     */
    getNodeId(): string;
    /**
     * Fetches data from the node based on the given request.
     * @param {Object} accessDataReq - The request object for fetching data.
     * @param {string} accessDataReq.variable - The variable identifier name to fetch data for.
     * @param {number} accessDataReq.from - The start time of the time range to fetch data from.
     * @param {number} accessDataReq.to - The end time of the time range to fetch data from.
     * @param {number} [accessDataReq.limit=10000] - The maximum number of data points to return.
     * @param {"asc"|"desc"} [accessDataReq.order="desc"] - The order of the data points to return.
     * @returns {Promise<any>} A promise that resolves with the response data.
     */
    getDataBetween(accessDataReq: AnedyaGetDataBetweenReqInterface): Promise<any>;
    /**
     * Fetches the latest data point from the node based on the given variable identifier.
     * @param {string} variableIdentifier - The variable identifier name to fetch the latest data point for.
     * @returns {Promise<any>} A promise that resolves with the response data.
     */
    getLatest(variableIdentifier: string): Promise<any>;
    setKey(reqConfig: AnedyaSetKeyRequestInterface): Promise<any>;
    getKey(reqConfig: AnedyaGetKeyReqInterface): Promise<any>;
    deleteKey(reqConfig: AnedyaDeleteKeyReqInterface): Promise<any>;
    /** */
    scanValueStore(reqConfig: AnedyaScanValueStoreReqInterface): Promise<any>;
    deviceStatus(lastContactThreshold: number): Promise<any>;
}

/**
 * This file contains main entry class for the Anedya SDK.
 *
 * @packageDocumentation
 */

interface IAnedya {
    NewConfig(tokenId: string, token: string): NewConfig;
}
declare class Anedya implements IAnedya {
    NewConfig(tokenId: string, token: string, testMode?: boolean): NewConfig;
    NewClient(configData: NewConfig): any;
    NewNode(client: NewClient, nodeId: string): NewNode;
}

declare const AnedyaScope: {
    readonly GLOBAL: "global";
    readonly NODE: "node";
};
declare enum AnedyaDataType {
    STRING = "string",
    BINARY = "binary",
    FLOAT = "float",
    BOOLEAN = "boolean"
}

declare const AnedyaError: {
    readonly Success: -1;
    readonly Unknown: 0;
    readonly Failure: 1;
    readonly HttpRequestError: 3;
    readonly HttpRequestTimeout: 4;
    readonly keyNotFound: 5;
};

declare function getAnedyaErrorMessage(code: number): string;

export { Anedya, AnedyaDataType, AnedyaDeleteKeyRequest, type AnedyaDeleteKeyRespInterface, AnedyaDeleteKeyResponse, type AnedyaDeviceStatusRespInterface, AnedyaDeviceStatusResponse, AnedyaError, AnedyaGetDataBetweenRequest, AnedyaGetDataBetweenResponse, AnedyaGetKeyRequest, type AnedyaGetKeyRespInterface, AnedyaGetKeyResponse, AnedyaLatestDataResponse, AnedyaScanValueStoreRequest, type AnedyaScanValueStoreRespInterface, AnedyaScanValueStoreResponse, AnedyaScope, AnedyaSetKeyRequest, type AnedyaSetKeyRespInterface, AnedyaSetKeyResponse, getAnedyaErrorMessage };
