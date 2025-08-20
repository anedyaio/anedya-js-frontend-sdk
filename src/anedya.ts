/**
 * This file contains main entry class for the Anedya SDK.
 *
 * @packageDocumentation
 */

import { NewConfig } from "./config";
import { NewClient } from "./client";
import {NewNode} from "./node";

interface IAnedya {
  NewConfig(tokenId: string, token: string): NewConfig;
}

export class Anedya implements IAnedya {

  NewConfig(tokenId: string, token: string, testMode?: boolean): NewConfig {
    return new NewConfig(tokenId, token, testMode);
  }

  NewClient(configData: NewConfig): any {
    return new NewClient(configData);
  }

  NewNode(client: NewClient, nodeId: string): NewNode {
    return new NewNode(client, nodeId);  
  }
}
