/*
 * This module defines the NewNode class which represents a logical device node.
 *
 * A Node allows interaction with the Anedya platform, including:
 *  - Fetching historical and latest time-series data
 *  - Managing keys in the value store (set/get/delete/scan)
 *  - Checking device connectivity and status
 */

import { getData, fetchLatestData } from "./services/accessData";
import { setKey, getKey, deleteKey, scanKeys } from "./services/valueStore";
import { getDeviceStatus } from "./services/deviceStatus";
import {
  IAnedyaGetDataReq,
  AnedyaGetDataResp,
  IAnedyaGetKeyReq,
  AnedyaGetKeyResp,
  IAnedyaDeleteKeyReq,
  AnedyaDeleteKeyResp,
  IAnedyaScanKeysReq,
  AnedyaScanKeysResp,
  IAnedyaGetSnapshotReq,
  AnedyaGetSnapshotResp,
  IAnedyaGetLatestDataReq,
  AnedyaGetLatestDataResp,
  IAnedyaSetKeyReq,
  AnedyaSetKeyResp,
  AnedyaGetDeviceStatusResp,
} from "./models";

import { AnedyaScope } from "./anedya_constant";
import { NewClient } from "./client";
import { IConfigHeaders } from "./common";
import { getSnapshot } from "./services/snapShot";



/**
 * INode defines the contract for interacting with a node in Anedya.
 * Each method corresponds to an available operation on a node.
 */

export interface INode {
  /** Returns the unique identifier of this node */
  getNodeId(): string;

  /** Fetch historical time-series data for a given variable */
  getData(accessDataReq: IAnedyaGetDataReq): Promise<AnedyaGetDataResp>;

  /** Fetch the most recent data point for a given variable */
  getLatestData(variableIdentifier: string): Promise<AnedyaGetLatestDataResp>;

  /** Store a key-value pair in the node’s value store */
  setKey(reqConfig: IAnedyaSetKeyReq): Promise<AnedyaSetKeyResp>;


  /** Retrieve a value from the node’s value store */
  getKey(reqConfig: IAnedyaGetKeyReq): Promise<AnedyaGetKeyResp>;

  /** Delete a value from the node’s value store */
  deleteKey(reqConfig: IAnedyaDeleteKeyReq): Promise<AnedyaDeleteKeyResp>;

  /** Scan through the node’s value store with filters */
  scanKeys(reqConfig: IAnedyaScanKeysReq): Promise<AnedyaScanKeysResp>;

  /** Get device status (e.g., last contact timestamp) */
  getDeviceStatus(lastContactThreshold: number): Promise<AnedyaGetDeviceStatusResp>;

  /**
   * Returns value of a variable at a particular time for given set of nodes.
   * Returns nearest datapoint submitted before specified time incase no datapoints found at the exact timestamp.
   */
  getSnapshot(reqConfig: IAnedyaGetSnapshotReq): Promise<AnedyaGetSnapshotResp>;


}

/**
 * NewNode represents a Node in the Anedya platform and is a concrete implementation of INode.
 *
 *
 * A Node is the primary abstraction for interacting with data and value stores
 * belonging to a specific device. This class handles authentication, signing,
 * and structured request/response handling for Node operations.
 */

export class NewNode implements INode {
  #nodeId: string; // Private node identifier
  #baseUrl: string; // API base URL
  #configHeaders: IConfigHeaders; // Authentication + signature headers

  /**
   * Construct a new Node instance.
   *
   * @param client - The initialized Anedya client with configuration details.
   * @param nodeId - Unique identifier of the node to interact with.
   */
  constructor(client: NewClient, nodeId: string) {
    const {
      baseUrl,
      tokenId,
      tokenBytes,
      signatureVersionBytes,
      signatureVersion,
      authorizationMode,
    } = client;
    this.#nodeId = nodeId; // Assign using #
    this.#baseUrl = baseUrl;
    this.#configHeaders = {
      tokenId,
      tokenBytes,
      signatureVersion,
      signatureVersionBytes,
      authorizationMode,
    };
  }

  /**
   * Returns the Node ID.
   *
   * @returns {string} The node ID associated with this instance.
   *
   * @example
   * ```ts
   * //console.log(node.getNodeId()); // "device123"
   * ```
   */
  getNodeId(): string {
    return this.#nodeId;
  }

  /**
   * Fetches time-series data from the node within the given time range.
   *
   * @param {Object} accessDataReq - The request object for fetching data.
   * @param {string} accessDataReq.variable - The variable identifier to fetch data for.
   * @param {number} accessDataReq.from - The start timestamp (in ms) of the query range.
   * @param {number} accessDataReq.to - The end timestamp (in ms) of the query range.
   * @param {number} [accessDataReq.limit=10000] - The maximum number of data points to return.
   * @param {"asc"|"desc"} [accessDataReq.order="desc"] - The order of the data points to return.
   * @returns {Promise<any>} A promise resolving to the response with data availability and payload.
   *
   */
  async getData(accessDataReq: IAnedyaGetDataReq): Promise<AnedyaGetDataResp> {
    return await getData(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      accessDataReq,
    );
  }

  /**
   * Fetches the latest data point from the node for the given variable.
   *
   * @param {string} variableIdentifier - The variable identifier to fetch the latest data point for.
   * @returns {Promise<AnedyaGetLatestDataResp>} A promise resolving to the response with data availability and payload.
   * @throws {AnedyaError} If the request fails.
   *
   * @example
   * ```ts
   * const res = await node.getLatestData("temperature");
   * if (res.isSuccess && res.isDataAvailable) {
   *   //console.log("Latest value:", res.data);
   * }
   * ```
   */
  async getLatestData(variableIdentifier: string): Promise<AnedyaGetLatestDataResp> {
    const accessDataReq: IAnedyaGetLatestDataReq = {
      variable: variableIdentifier,
    };
    return await fetchLatestData(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      accessDataReq,
    );
  }


  /**
   * Sets a key/value pair in the Node's value store.
   *
   * This allows you to persist configuration or metadata at either the
   * `GLOBAL` or `NODE` scope.
   *
   * - `AnedyaScope.GLOBAL`: The key/value is available across all nodes in the account.
   * - `AnedyaScope.NODE`: The key/value is local to this specific node.
   *
   * Supported data types (via {@link AnedyaDataType}):
   * - `STRING` → Stores string values
   * - `BINARY` → Stores binary blobs
   * - `FLOAT` → Stores numeric values with decimals
   * - `BOOLEAN` → Stores true/false flags
   *
    * @param {IAnedyaSetKeyReq} reqConfig - Request config including scope, key name, value, and type.
    * @returns {Promise<AnedyaSetKeyResp>} Response indicating success/failure of the operation.

   *
   * @example
   * ```ts
   * // Store a floating-point threshold value for a node
   * const req = new AnedyaSetKeyReq(
   *   { scope: AnedyaScope.NODE },   // Limit to this node
   *   "temperature",                 // Key name
   *   30,                            // Value
   *   AnedyaDataType.FLOAT           // Data type
   * );
   *
   * const res = await node.setKey(req);
   * if (res.isSuccess) {
   *   //console.log("Key set successfully!");
   * }
   * ```
   */
  async setKey(reqConfig: IAnedyaSetKeyReq): Promise<AnedyaSetKeyResp> {

    return await setKey(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      reqConfig,
    );
  }

  /**
    * @param {IAnedyaGetKeyReq} reqConfig - Config with scope and key name to fetch.
    * @returns {Promise<AnedyaGetKeyResp>} Response containing the value if the key exists.
    * @throws {AnedyaError} If the request fails.
    *
    * @example
    * ```ts
    * // Fetch a temperature threshold key stored on this node
    * const req = new AnedyaGetKeyReq({ scope: AnedyaScope.NODE }, "temperature");
    * const res = await node.getKey(req);
    * if (res.isSuccess && res.data) {
    *   //console.log("Key value:", res.data);
    * }
    * ```
    */
  async getKey(reqConfig: IAnedyaGetKeyReq): Promise<AnedyaGetKeyResp> {
    return await getKey(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      reqConfig,
    );
  }

  /**
   * Deletes a key/value pair from the Node's value store.
   *
   * Scope must match the scope in which the key was originally set:
   * - `AnedyaScope.GLOBAL`: Removes the key from the global store.
   * - `AnedyaScope.NODE`: Removes the key only from this node’s local store.
   *
   * @param {IAnedyaDeleteKeyReq} reqConfig - Config with scope and key name to delete.
   * @returns {Promise<AnedyaDeleteKeyResp>} Response indicating whether deletion succeeded.
   * @throws {AnedyaError} If the request fails.
   *
   * @example
   * ```ts
   * // Remove a temperature threshold key stored on this node
   * const req = new AnedyaDeleteKeyReq({ scope: AnedyaScope.NODE }, "temperature");
   * const res = await node.deleteKey(req);
   * if (res.isSuccess) {
   *   //console.log("Key deleted successfully!");
   * }
   * ```
   */
  async deleteKey(reqConfig: IAnedyaDeleteKeyReq): Promise<AnedyaDeleteKeyResp> {

    return await deleteKey(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      reqConfig,
    );
  }

  /**
   * Scans available items in the node's value store.
   *
   * - Namespace must include a scope (`AnedyaScope.GLOBAL` or `AnedyaScope.NODE`).
   * - Results can be ordered (`asc` or `desc`) and paginated using limit/offset.
   *
   * @param {IAnedyaScanKeysReq} reqConfig - Config including namespace, order, limit, and offset.
   * @returns {Promise<AnedyaScanKeysResp>} Response containing a list of matching keys.
   * @throws {AnedyaError} If the request fails.
   *
   * @example
   * ```ts
   * // Scan all available keys in the NODE namespace, return first 10 in ascending order
   * const req = new AnedyaScanKeysReq(
   *   { namespace: { scope: AnedyaScope.NODE } },
   *   "namespace",
   *   "asc",
   *   10,
   *   0
   * );
   * const res = await node.scanKeys(req);
   * if (res.isSuccess && res.data) {
   *   //console.log("Keys scanned successfully!", res.data);
   * }
   * ```
   */
  async scanKeys(reqConfig: IAnedyaScanKeysReq): Promise<AnedyaScanKeysResp> {
    return await scanKeys(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      reqConfig,
    );
  }

  /**
   * Get device status (e.g., last contact timestamp)
   *
   * The Anedya platform stores the last heartbeat time for each device.
   * By passing `lastContactThreshold` (in seconds), you define how far back
   * the system should look for a heartbeat to consider the device online.
   *
   * - If the last heartbeat occurred within the past `lastContactThreshold` seconds → `online: true`
   * - Otherwise → `online: false`
   *
   * @param {number} lastContactThreshold - The number of past seconds in which the device must have
   *   sent a heartbeat to be considered online. For example, if set to `60`, the node is only online
   *   if its last heartbeat was within the last 60 seconds.
   *
   * @returns {Promise<AnedyaGetDeviceStatusResp>} A promise resolving to the response object containing:
   * - `online` (boolean): whether the node is online
   * - `lastHeartbeat` (number): the last heartbeat timestamp (UNIX seconds)
   *
   * @example
   * ```ts
   * // Consider node online if it sent a heartbeat within the last 60 seconds
   * const res = await node.getDeviceStatus(60);
   * if (res.isSuccess && res.data) {
   *   const status = res.data[node.getNodeId()];
   *   //console.log("Online:", status.online);
   *   //console.log("Last heartbeat at:", new Date(status.lastHeartbeat * 1000));
   * }
   * ```
   *
   * @example
   * ```ts
   * // Use a larger window (300 seconds) if your device reports less frequently
   * const res = await node.getDeviceStatus(300);
   * ```
   */
  async getDeviceStatus(lastContactThreshold: number): Promise<AnedyaGetDeviceStatusResp> {
    return await getDeviceStatus(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      lastContactThreshold,
    );
  }


  /**
   * Retrieves the value of a variable for one or more nodes at a specific timestamp.
   *
   * The snapshot API returns the value of a variable at the requested time.
   * - If a datapoint exists at exactly that timestamp, it is returned.
   * - If no datapoint exists at that exact time, the nearest datapoint submitted
   *   before the specified time will be returned instead.
   *
   * This is useful for reconstructing system state at a given point in time
   * (e.g., "What was the temperature at 10:00 AM for node X?").
   *
   * @param {IAnedyaGetSnapshotReq} reqConfig - The snapshot request configuration.
   * @param {number} reqConfig.time - The target timestamp (in UNIX seconds) to query.
   * @param {string} reqConfig.variable - The variable identifier to fetch (e.g., `"temperature"`).
   *
   * @returns {Promise<any>} A promise resolving to the response object containing:
   * - `node` (string): the node ID
   * - `value` (number): the variable value at or before the given timestamp
   * - `timestamp` (number): the timestamp (UNIX seconds) of the returned datapoint
   *
   * @example
   * ```ts
   * // Get temperature value for node at a specific timestamp
   * const req = new AnedyaGetSnapshotReq(<timestamp>, <variableid>);
   * const res = await node.getSnapshot(req);
   * if (res.isSuccess && res.data.length > 0) {
   *   const snapshot = res.data[0];
   *   //console.log("Temperature at", new Date(snapshot.timestamp * 1000), "was", snapshot.value);
   * }
   * ```
   *
   * @example
   * ```ts
   * // Request snapshots for multiple nodes at the same time
   * const req = new AnedyaGetSnapshotReq(1695084912, "humidity", ["node123", "node456"]);
   * const res = await node.getSnapshot(req);
   * res.data.forEach((entry) => {
   *   //console.log(entry.node, "had humidity", entry.value, "at", new Date(entry.timestamp * 1000));
   * });
   * ```
   */
  async getSnapshot(reqConfig: IAnedyaGetSnapshotReq): Promise<AnedyaGetSnapshotResp> {
    return await getSnapshot(
      this.#baseUrl,
      this.#configHeaders,
      [this.#nodeId],
      reqConfig,
    );
  }



}
