/*
File contains the class NewClient which is used to create an instance of a anedya client.
*/
import { NewConfig } from "./config";

export interface IClient {
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
export class NewClient implements IClient {
  tokenId: string;
  tokenBytes: Uint8Array;
  signatureVersionBytes: Uint8Array;
  signatureVersion: string = "v1";
  authorizationMode: string = "ANEDYASIGV1";
  baseUrl: string;

  /**
   * Constructs a new instance of NewClient.
   * @param {NewConfig} config - The configuration object.
   */
  constructor(config: NewConfig) {
    const { token, tokenId } = config;
    this.tokenId = tokenId;
    this.signatureVersionBytes = new TextEncoder().encode(
      this.signatureVersion
    );
    this.tokenBytes = new TextEncoder().encode(token);
    this.baseUrl = config.baseUrl;
  }
}
