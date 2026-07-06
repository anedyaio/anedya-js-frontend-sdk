/**
 * This file contains main entry class for the Anedya SDK.
 *
 * @packageDocumentation
 */

import { NewConfig } from "./config";
import { NewClient } from "./client";
import { NewNode } from "./node";
import { AnedyaStreamClient } from "./stream_client";

interface IAnedya {
  newConfig(tokenId: string, token: string): NewConfig;
  newClient(configData: NewConfig): NewClient;
  newNode(client: NewClient, nodeId: string): NewNode;
  newStream(
    client: NewClient,
    streamId: string,
    streamUrl: string,
  ): AnedyaStreamClient;
}

export class Anedya implements IAnedya {

  newConfig(tokenId: string, token: string): NewConfig {

    return new NewConfig(tokenId, token);
  }

  newClient(configData: NewConfig): NewClient {
    return new NewClient(configData);
  }

  newNode(client: NewClient, nodeId: string): NewNode {
    return new NewNode(client, nodeId);
  }

  newStream(
    client: NewClient,
    streamId: string,
    streamUrl: string,
  ): AnedyaStreamClient {
    return new AnedyaStreamClient(client, streamId, streamUrl);

  }
}
