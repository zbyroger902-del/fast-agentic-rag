import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type WorkflowNodeType = "input" | "retriever" | "tool" | "llm" | "output";

interface WorkflowNodeData {
  label: string;
  type: WorkflowNodeType;
  description?: string;
}

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: "n-input",
    position: { x: 0, y: 100 },
    data: {
      label: "User Input",
      type: "input",
      description: "Entry point for user messages and tool triggers.",
    },
    type: "workflowNode",
  },
  {
    id: "n-retrieve",
    position: { x: 230, y: 40 },
    data: {
      label: "Retrieve",
      type: "retriever",
      description: "Calls RAG retriever to fetch top-k chunks.",
    },
    type: "workflowNode",
  },
  {
    id: "n-llm",
    position: { x: 230, y: 180 },
    data: {
      label: "LLM Call",
      type: "llm",
      description: "Qwen-3.5-Plus generates the final answer.",
    },
    type: "workflowNode",
  },
  {
    id: "n-output",
    position: { x: 460, y: 100 },
    data: {
      label: "Final Response",
      type: "output",
      description: "Response returned to the chat client.",
    },
    type: "workflowNode",
  },
];

const initialEdges: Edge[] = [
  { id: "e-1", source: "n-input", target: "n-retrieve" },
  { id: "e-2", source: "n-input", target: "n-llm" },
  { id: "e-3", source: "n-retrieve", target: "n-llm" },
  { id: "e-4", source: "n-llm", target: "n-output" },
];

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: "#64748b",
  border: "2px solid #1e293b",
  borderRadius: "50%",
};

const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data }) => {
  const badge = useMemo(() => {
    switch (data.type) {
      case "input":
        return "Input";
      case "retriever":
        return "Retriever";
      case "tool":
        return "Tool";
      case "llm":
        return "LLM";
      case "output":
        return "Output";
      default:
        return "Node";
    }
  }, [data.type]);

  const hasTarget = data.type !== "input";
  const hasSource = data.type !== "output";

  return (
    <>
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyle}
        />
      )}

      <Card className="min-w-[160px] rounded-xl border-border bg-card px-3 py-2 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">{data.label}</p>
            <Badge variant="secondary" className="text-[10px]">
              {badge}
            </Badge>
          </div>
          {data.description && (
            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-3">
              {data.description}
            </p>
          )}
        </CardContent>
      </Card>

      {hasSource && (
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyle}
        />
      )}
    </>
  );
};

const nodeTypes = {
  workflowNode: WorkflowNode,
};

export const WorkflowCanvasPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<WorkflowNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialNodes[0]?.id ?? null,
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) => addEdge(connection, current)),
    [setEdges],
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  return (
    <div className="flex h-full gap-4">
      <Card className="flex-1 min-w-0 overflow-hidden border-border bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        >
          <Background gap={16} color="#334155" />
          <Controls />
        </ReactFlow>
      </Card>

      <Card className="w-80 shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Node settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedNode ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="node-label" className="text-xs text-muted-foreground">
                  Label
                </Label>
                <Input
                  id="node-label"
                  value={selectedNode.data.label}
                  onChange={(event) => {
                    const nextLabel = event.target.value;
                    setNodes((current) =>
                      current.map((node) =>
                        node.id === selectedNode.id
                          ? {
                              ...node,
                              data: { ...node.data, label: nextLabel },
                            }
                          : node,
                      ),
                    );
                  }}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-description" className="text-xs text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="node-description"
                  value={selectedNode.data.description ?? ""}
                  onChange={(event) => {
                    const nextDescription = event.target.value;
                    setNodes((current) =>
                      current.map((node) =>
                        node.id === selectedNode.id
                          ? {
                              ...node,
                              data: { ...node.data, description: nextDescription },
                            }
                          : node,
                      ),
                    );
                  }}
                  rows={4}
                  className="resize-none text-xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                These settings are local-only for now. Later they will map to
                LangGraph node configuration and execution parameters.
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a node on the canvas to edit its label and description.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
