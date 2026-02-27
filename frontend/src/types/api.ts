// Shared frontend-facing types for future backend and Langfuse integration.
// These are intentionally minimal and may evolve as APIs are added.

export type ChatRole = "user" | "agent" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  sizeBytes?: number;
  engine?: string;
  createdAt?: string;
  status?: "ready" | "processing" | "failed";
}

export interface ChunkMetadata {
  id: string;
  documentId: string;
  text: string;
  imagePath?: string;
  score?: number;
}

export interface WorkflowNodeConfig {
  id: string;
  label: string;
  type: "input" | "retriever" | "tool" | "llm" | "output";
  description?: string;
}

export interface TraceStepView {
  id: string;
  type: "user" | "retrieve" | "llm" | "tool";
  label: string;
  timestamp?: string;
}

export interface TraceSessionView {
  id: string;
  userLabel?: string;
  createdAt?: string;
  model?: string;
  steps: TraceStepView[];
}

