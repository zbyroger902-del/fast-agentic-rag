import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
    <Card className="flex h-full flex-col overflow-hidden border-border bg-card text-xs">
      <CardHeader className="border-b border-border py-3">
        <CardTitle className="text-sm">Tracing</CardTitle>
        <CardDescription>
          Sessions grouped by ID, expandable into LangGraph-style steps. Data is
          currently mocked; later this will be powered by Langfuse.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Session</TableHead>
              <TableHead className="text-[11px]">Created</TableHead>
              <TableHead className="text-[11px]">Model</TableHead>
              <TableHead className="text-[11px]">Steps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              return (
                <React.Fragment key={session.id}>
                  <TableRow
                    className="cursor-pointer text-[11px] hover:bg-muted/50"
                    onClick={() =>
                      setExpandedSessionId(isExpanded ? null : session.id)
                    }
                  >
                    <TableCell>
                      <span className="font-medium text-foreground">
                        {session.id}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {session.userLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.createdAt}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.model}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.steps.length}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="bg-muted/30 px-6 py-3"
                      >
                        <NestedSteps steps={session.steps} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

interface NestedStepsProps {
  steps: TraceStep[];
}

const stepTypeBadgeClass: Record<TraceStep["type"], string> = {
  user: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  retrieve: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  llm: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  tool: "bg-amber-500/10 text-amber-300 border-amber-500/30",
};

const NestedSteps: React.FC<NestedStepsProps> = ({ steps }) => (
  <div className="space-y-2">
    {steps.map((step) => (
      <Card
        key={step.id}
        className="flex items-start justify-between border-border bg-card/80 px-3 py-2"
      >
        <div className="min-w-0 flex-1">
          <Badge
            variant="outline"
            className={cn("text-[10px]", stepTypeBadgeClass[step.type])}
          >
            {step.type.toUpperCase()}
          </Badge>
          <p className="mt-1 text-foreground">{step.label}</p>
        </div>
        <span className="ml-4 shrink-0 text-[11px] text-muted-foreground">
          {step.timestamp}
        </span>
      </Card>
    ))}
  </div>
);
