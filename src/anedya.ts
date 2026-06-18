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
  NewConfig(tokenId: string, token: string): NewConfig;
  NewClient(configData: NewConfig): NewClient;
  NewNode(client: NewClient, nodeId: string): NewNode;
  NewStream(
    client: NewClient,
    node: NewNode,
    streamId: string,
    streamUrl: string
  ): AnedyaStreamClient;
}

export class Anedya implements IAnedya {

  NewConfig(tokenId: string, token: string): NewConfig {
    return new NewConfig(tokenId, token);
  }

  NewClient(configData: NewConfig): NewClient {
    return new NewClient(configData);
  }

  NewNode(client: NewClient, nodeId: string): NewNode {
    return new NewNode(client, nodeId);  
  }

  NewStream(
    client: NewClient,
    node: NewNode,
    streamId: string,
    streamUrl: string
  ): AnedyaStreamClient {
    return new AnedyaStreamClient(client, node, streamId, streamUrl);
  }
}