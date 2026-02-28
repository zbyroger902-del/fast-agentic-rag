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
  /** Display names for each input port (left handles). */
  inputVariables: string[];
  /** Display names for each output port (right handles). */
  outputVariables: string[];
}

function getDefaultVariablesForType(
  type: WorkflowNodeType
): { inputVariables: string[]; outputVariables: string[] } {
  switch (type) {
    case "input":
      return { inputVariables: [], outputVariables: ["message"] };
    case "retriever":
      return { inputVariables: ["query"], outputVariables: ["chunks"] };
    case "tool":
      return { inputVariables: ["input"], outputVariables: ["result"] };
    case "llm":
      return {
        inputVariables: ["messages", "context"],
        outputVariables: ["response"],
      };
    case "output":
      return { inputVariables: ["response"], outputVariables: [] };
    default:
      return { inputVariables: [], outputVariables: [] };
  }
}

/** Stable handle id for a node's input/output by index. */
export function getInputHandleId(nodeId: string, index: number): string {
  return `${nodeId}-in-${index}`;
}
export function getOutputHandleId(nodeId: string, index: number): string {
  return `${nodeId}-out-${index}`;
}

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: "n-input",
    position: { x: 0, y: 100 },
    data: {
      label: "User Input",
      type: "input",
      description: "Entry point for user messages and tool triggers.",
      ...getDefaultVariablesForType("input"),
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
      ...getDefaultVariablesForType("retriever"),
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
      ...getDefaultVariablesForType("llm"),
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
      ...getDefaultVariablesForType("output"),
    },
    type: "workflowNode",
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-1",
    source: "n-input",
    target: "n-retrieve",
    sourceHandle: getOutputHandleId("n-input", 0),
    targetHandle: getInputHandleId("n-retrieve", 0),
  },
  {
    id: "e-2",
    source: "n-input",
    target: "n-llm",
    sourceHandle: getOutputHandleId("n-input", 0),
    targetHandle: getInputHandleId("n-llm", 0),
  },
  {
    id: "e-3",
    source: "n-retrieve",
    target: "n-llm",
    sourceHandle: getOutputHandleId("n-retrieve", 0),
    targetHandle: getInputHandleId("n-llm", 1),
  },
  {
    id: "e-4",
    source: "n-llm",
    target: "n-output",
    sourceHandle: getOutputHandleId("n-llm", 0),
    targetHandle: getInputHandleId("n-output", 0),
  },
];

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: "#64748b",
  border: "2px solid #1e293b",
  borderRadius: "50%",
};

const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({ id, data }) => {
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

  const inputs = data.inputVariables ?? [];
  const outputs = data.outputVariables ?? [];

  return (
    <>
      {inputs.map((_, index) => (
        <Handle
          key={getInputHandleId(id, index)}
          type="target"
          position={Position.Left}
          id={getInputHandleId(id, index)}
          style={{
            ...handleStyle,
            top: inputs.length > 1 ? `${((index + 1) / (inputs.length + 1)) * 100}%` : "50%",
          }}
        />
      ))}

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

      {outputs.map((_, index) => (
        <Handle
          key={getOutputHandleId(id, index)}
          type="source"
          position={Position.Right}
          id={getOutputHandleId(id, index)}
          style={{
            ...handleStyle,
            top: outputs.length > 1 ? `${((index + 1) / (outputs.length + 1)) * 100}%` : "50%",
          }}
        />
      ))}
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

  /** For a given node and its input handle index, return the source node label and output var name if connected. */
  const getConnectionForInput = useCallback(
    (nodeId: string, inputIndex: number): { sourceLabel: string; outputVar: string } | null => {
      const targetHandle = getInputHandleId(nodeId, inputIndex);
      const edge = edges.find(
        (e) => e.target === nodeId && e.targetHandle === targetHandle
      );
      if (!edge?.sourceHandle || !edge.source) return null;
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return null;
      const outIndex = sourceNode.data.outputVariables
        ? parseInt(edge.sourceHandle.split("-out-")[1] ?? "", 10)
        : 0;
      const outputVar =
        sourceNode.data.outputVariables?.[outIndex] ?? `out-${outIndex}`;
      return { sourceLabel: sourceNode.data.label, outputVar };
    },
    [edges, nodes],
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
          deleteKeyCode={["Backspace", "Delete"]}
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

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Input variables
                </Label>
                <div className="space-y-1.5">
                  {(selectedNode.data.inputVariables ?? []).map((name, index) => {
                    const conn = getConnectionForInput(selectedNode.id, index);
                    return (
                      <div key={index} className="space-y-0.5">
                        <Input
                          value={name}
                          onChange={(event) => {
                            const next = event.target.value;
                            setNodes((current) =>
                              current.map((node) =>
                                node.id === selectedNode.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        inputVariables: (node.data.inputVariables ?? []).map(
                                          (v, i) => (i === index ? next : v)
                                        ),
                                      },
                                    }
                                  : node,
                              ),
                            );
                          }}
                          className="h-8 text-xs"
                          placeholder={`Input ${index + 1}`}
                        />
                        {conn && (
                          <p className="text-[10px] text-muted-foreground">
                            ← {conn.sourceLabel}.{conn.outputVar}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {(selectedNode.data.inputVariables ?? []).length === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      No input variables.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Output variables
                </Label>
                <div className="space-y-1.5">
                  {(selectedNode.data.outputVariables ?? []).map((name, index) => (
                    <Input
                      key={index}
                      value={name}
                      onChange={(event) => {
                        const next = event.target.value;
                        setNodes((current) =>
                          current.map((node) =>
                            node.id === selectedNode.id
                              ? {
                                  ...node,
                                  data: {
                                    ...node.data,
                                    outputVariables: (node.data.outputVariables ?? []).map(
                                      (v, i) => (i === index ? next : v)
                                    ),
                                  },
                                }
                              : node,
                          ),
                        );
                      }}
                      className="h-8 text-xs"
                      placeholder={`Output ${index + 1}`}
                    />
                  ))}
                  {(selectedNode.data.outputVariables ?? []).length === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      No output variables.
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Connect nodes by dragging from an output handle to an input handle.
                Select an edge and press Delete or Backspace to remove it.
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a node to edit its label, description, and input/output variables.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
