import React, { useState } from "react";

interface TraceStep {
  id: string;
  type: "user" | "retrieve" | "llm" | "tool";
  label: string;
  timestamp: string;
}

interface TraceSession {
  id: string;
  userLabel: string;
  createdAt: string;
  model: string;
  steps: TraceStep[];
}

const mockSessions: TraceSession[] = [
  {
    id: "sess-1",
    userLabel: "KB: Architecture deep dive",
    createdAt: "2025-02-12 10:23",
    model: "Qwen-3.5-Plus",
    steps: [
      {
        id: "s1",
        type: "user",
        label: "User: How do we keep images aligned with text chunks?",
        timestamp: "10:23:01",
      },
      {
        id: "s2",
        type: "retrieve",
        label: "Retrieve: top-8 chunks from Qdrant (collection: docs_architecture)",
        timestamp: "10:23:02",
      },
      {
        id: "s3",
        type: "llm",
        label: "LLM: Generate answer with inline references and image mentions.",
        timestamp: "10:23:04",
      },
    ],
  },
  {
    id: "sess-2",
    userLabel: "Chat: Summarize latest PRD",
    createdAt: "2025-02-12 11:05",
    model: "Qwen-3.5-Plus",
    steps: [
      {
        id: "t1",
        type: "user",
        label: "User: Summarize the PRD for Fast Agentic RAG.",
        timestamp: "11:05:11",
      },
      {
        id: "t2",
        type: "retrieve",
        label: "Retrieve: top-5 chunks from PRD collection.",
        timestamp: "11:05:12",
      },
      {
        id: "t3",
        type: "tool",
        label: "Tool: ingest_document_tool (doc-PRD.pdf) used earlier in session.",
        timestamp: "11:05:12",
      },
      {
        id: "t4",
        type: "llm",
        label: "LLM: Generate condensed product overview.",
        timestamp: "11:05:14",
      },
    ],
  },
];

export const TracingPage: React.FC = () => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    mockSessions[0]?.id ?? null,
  );

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900/40 text-xs">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="font-medium text-slate-100">Tracing</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Sessions grouped by ID, expandable into LangGraph-style steps. Data is
          currently mocked; later this will be powered by Langfuse.
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-sm">
            <tr className="border-b border-slate-800 text-[11px] text-slate-400">
              <th className="px-4 py-2 font-normal">Session</th>
              <th className="px-4 py-2 font-normal">Created</th>
              <th className="px-4 py-2 font-normal">Model</th>
              <th className="px-4 py-2 font-normal">Steps</th>
            </tr>
          </thead>
          <tbody>
            {mockSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              return (
                <React.Fragment key={session.id}>
                  <tr
                    className="cursor-pointer border-b border-slate-800/60 text-[11px] hover:bg-slate-900"
                    onClick={() =>
                      setExpandedSessionId(
                        isExpanded ? null : session.id,
                      )
                    }
                  >
                    <td className="px-4 py-2 text-slate-100">
                      <span className="font-medium">
                        {session.id}
                      </span>
                      <span className="ml-2 text-slate-400">
                        {session.userLabel}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {session.createdAt}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {session.model}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {session.steps.length}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-slate-950/80 px-6 py-3"
                      >
                        <NestedSteps steps={session.steps} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface NestedStepsProps {
  steps: TraceStep[];
}

const NestedSteps: React.FC<NestedStepsProps> = ({ steps }) => (
  <div className="space-y-1">
    {steps.map((step) => (
      <div
        key={step.id}
        className="flex items-start justify-between rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2"
      >
        <div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
              step.type === "user"
                ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/30"
                : step.type === "retrieve"
                  ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30"
                  : step.type === "llm"
                    ? "bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/30"
                    : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30"
            }`}
          >
            {step.type.toUpperCase()}
          </span>
          <p className="mt-1 text-slate-100">{step.label}</p>
        </div>
        <span className="ml-4 text-[11px] text-slate-500">
          {step.timestamp}
        </span>
      </div>
    ))}
  </div>
);

