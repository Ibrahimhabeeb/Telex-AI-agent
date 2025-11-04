import { timestamp } from "rxjs";

export class A2ARequestDto {
  jsonrpc: string = '2.0';
  method: string;
  params?: any;
  id: string | number;
}

export type MessageRole = 'user' | 'agent';
export type PartKind = 'text' | 'file' | 'data';
export type MessageKind = 'message';
export type TaskKind = 'task';

export interface TextPart {
  kind: 'text';
  text: string;
  metadata?: Record<string, any>;
}

export interface FilePart {
  kind: 'file';
  url: string;
  mimeType: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface DataPart {
  kind: 'data';
  data: any;
  metadata?: Record<string, any>;
}

export type Part = TextPart | FilePart | DataPart;


export interface Message {
  role: MessageRole;
  parts: Part[];
  metadata?: Record<string, any>;
  extensions?: string[];
  referenceTaskIds?: string[];
  messageId: string;
  taskId?: string;
  contextId?: string;
  kind: MessageKind;
}


export enum TaskState {
  Submitted = 'submitted',
  Working = 'working',
  InputRequired = 'input-required',
  Completed = 'completed',
  Canceled = 'canceled',
  Failed = 'failed',
  Rejected = 'rejected',
  AuthRequired = 'auth-required',
  Unknown = 'unknown',
}


export interface TaskStatus {
  state: TaskState;
  message?: Message;
  timestamp?: string;
}



export interface Task {
  id: string;
  contextId: string;
  status: TaskStatus;
  history?: Message[];
  artifacts?: Artifact[];
  metadata?: Record<string, any>;
  kind: TaskKind;
}


export interface Artifact {
  id: string;
  parts: Part[];
  metadata?: Record<string, any>;
}


export class A2AResponseDto {
  jsonrpc: '2.0' = '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}


export interface MessageSendParams {
  message: Message;
}

// For tasks/get method
export interface TaskGetParams {
  taskId: string;
}

// For tasks/cancel method
export interface TaskCancelParams {
  taskId: string;
}

// For tasks/list method
export interface TaskListParams {
  contextId?: string;
  limit?: number;
  offset?: number;
}








