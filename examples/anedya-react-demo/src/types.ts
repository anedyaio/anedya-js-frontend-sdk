export type SubType = "variable" | "valuestore" | "event";

export interface SubHandle {
  pause(): void;
  resume(): void;
  cancel(): void;
}

export interface SubRecord {
  id: number;
  type: SubType;
  key: string | null;
  paused: boolean;
  active: boolean;
  count: number;
  lastValue: string;
  handle: SubHandle;
}

export type LogType = "var" | "vs" | "event" | "status" | "error";

export interface LogEntry {
  id: number;
  ts: string;
  type: LogType;
  message: string;
}

export interface Stats {
  varCount: number;
  lastVar: string;
  vsCount: number;
  lastVs: string;
  evCount: number;
  lastEv: string;
}

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";
