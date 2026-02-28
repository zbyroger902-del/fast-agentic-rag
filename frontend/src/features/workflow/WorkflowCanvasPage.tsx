import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  Handle,
  Node,
  NodeChange,
  NodeProps,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type WorkflowNodeType = "input" | "retriever" | "tool" | "llm" | "output";

const NODE_TYPE_OPTIONS: {
  type: WorkflowNodeType;
  label: string;
  defaultLabel: string;
}[] = [
  { type: "input", label: "Input", defaultLabel: "User Input" },
  { type: "retriever", label: "Retriever", defaultLabel: "Retrieve" },
  { type: "tool", label: "Tool", defaultLabel: "Tool" },
  { type: "llm", label: "LLM", defaultLabel: "LLM Call" },
  { type: "output", label: "Output", defaultLabel: "Final Response" },
];

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

function createNode(
  type: WorkflowNodeType,
  position: { x: number; y: number },
  id?: string
): Node<WorkflowNodeData> {
  const nodeId = id ?? `n-${type}-${Date.now()}`;
  const option = NODE_TYPE_OPTIONS.find((o) => o.type === type);
  const label = option?.defaultLabel ?? type;
  const defaults = getDefaultVariablesForType(type);
  return {
    id: nodeId,
    position,
    data: {
      label,
      type,
      ...defaults,
    },
    type: "workflowNode",
  };
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

interface WorkflowNodeProps extends NodeProps<WorkflowNodeData> {
  onSourceHandleClick?: (nodeId: string, handleId: string, x: number, y: number) => void;
}

const SourceHandleWithHints: React.FC<{
  nodeId: string;
  index: number;
  handleId: string;
  outputsLength: number;
  onSourceHandleClick?: (nodeId: string, handleId: string, x: number, y: number) => void;
  xPos: number;
  yPos: number;
}> = ({ nodeId, index, handleId, outputsLength, onSourceHandleClick, xPos, yPos }) => {
  const [hover, setHover] = useState(false);
  const onAddClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSourceHandleClick?.(nodeId, handleId, xPos, yPos);
    },
    [nodeId, handleId, onSourceHandleClick, xPos, yPos],
  );
  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        right: 0,
        top: outputsLength > 1 ? `${((index + 1) / (outputsLength + 1)) * 100}%` : "50%",
        transform: "translateY(-50%)",
      }}
    >
      {hover && (
        <div
          className="absolute right-full mr-1 z-10 flex items-center gap-1 rounded-md border border-border bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md whitespace-nowrap"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <span>Click to add</span>
          <span className="text-muted-foreground">·</span>
          <span>Drag to connect</span>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        id={handleId}
        style={handleStyle}
      />
      {hover && onSourceHandleClick && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary hover:bg-primary/25 -mr-2"
          onClick={onAddClick}
          aria-label="Add downstream node"
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ id, data, xPos, yPos, onSourceHandleClick }) => {
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
        <SourceHandleWithHints
          key={getOutputHandleId(id, index)}
          nodeId={id}
          index={index}
          handleId={getOutputHandleId(id, index)}
          outputsLength={outputs.length}
          onSourceHandleClick={onSourceHandleClick}
          xPos={xPos ?? 0}
          yPos={yPos ?? 0}
        />
      ))}
    </>
  );
};

/** Node types are created in the page so they can receive the handle-click callback. */
function makeNodeTypes(onSourceHandleClick: (nodeId: string, handleId: string, x: number, y: number) => void): Record<string, React.FC<NodeProps<WorkflowNodeData>>> {
  return {
    workflowNode: (props) => (
      <WorkflowNode {...props} onSourceHandleClick={onSourceHandleClick} />
    ),
  };
}

export const WorkflowCanvasPage: React.FC = () => {
  const [flowState, setFlowState] = useState<{
    nodes: Node<WorkflowNodeData>[];
    edges: Edge[];
  }>({ nodes: initialNodes, edges: initialEdges });
  const { nodes, edges } = flowState;

  const pastRef = useRef<Array<{ nodes: Node<WorkflowNodeData>[]; edges: Edge[] }>>([]);
  const futureRef = useRef<Array<{ nodes: Node<WorkflowNodeData>[]; edges: Edge[] }>>([]);
  const skipHistoryRef = useRef(false);
  const flowStateRef = useRef(flowState);
  flowStateRef.current = flowState;

  const pushHistoryAnd = useCallback(
    (update: (prev: typeof flowState) => typeof flowState) => {
      setFlowState((prev) => {
        if (!skipHistoryRef.current) {
          pastRef.current.push({ nodes: prev.nodes, edges: prev.edges });
          futureRef.current = [];
        } else {
          skipHistoryRef.current = false;
        }
        return update(prev);
      });
    },
    [],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      pushHistoryAnd((prev) => ({
        ...prev,
        nodes: applyNodeChanges(changes, prev.nodes),
      })),
    [pushHistoryAnd],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      pushHistoryAnd((prev) => ({
        ...prev,
        edges: applyEdgeChanges(changes, prev.edges),
      })),
    [pushHistoryAnd],
  );

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const prev = pastRef.current.pop()!;
    futureRef.current.push({
      nodes: flowStateRef.current.nodes,
      edges: flowStateRef.current.edges,
    });
    skipHistoryRef.current = true;
    setFlowState(prev);
  }, []);
  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    pastRef.current.push({
      nodes: flowStateRef.current.nodes,
      edges: flowStateRef.current.edges,
    });
    skipHistoryRef.current = true;
    setFlowState(next);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialNodes[0]?.id ?? null,
  );
  const [nodePanelOpen, setNodePanelOpen] = useState(false);
  const [nodeSearch, setNodeSearch] = useState("");
  const [pendingAddFromHandle, setPendingAddFromHandle] = useState<{
    sourceNodeId: string;
    sourceHandleId: string;
    sourceX: number;
    sourceY: number;
  } | null>(null);

  const onConnect = useCallback((connection: Connection) => {
    pushHistoryAnd((prev) => ({ ...prev, edges: addEdge(connection, prev.edges) }));
  }, [pushHistoryAnd]);

  const openNodePanel = useCallback((fromHandle?: { sourceNodeId: string; sourceHandleId: string; sourceX: number; sourceY: number }) => {
    setPendingAddFromHandle(fromHandle ?? null);
    setNodePanelOpen(true);
    setNodeSearch("");
  }, []);
  const closeNodePanel = useCallback(() => {
    setNodePanelOpen(false);
    setPendingAddFromHandle(null);
  }, []);

  const addNodeOfType = useCallback(
    (type: WorkflowNodeType) => {
      const source = pendingAddFromHandle;
      const position = source
        ? { x: source.sourceX + 250, y: source.sourceY }
        : (() => {
            const last = nodes.length > 0 ? nodes[nodes.length - 1] : null;
            return last
              ? { x: last.position.x + 220, y: last.position.y }
              : { x: 100, y: 100 };
          })();
      const newNode = createNode(type, position);
      pushHistoryAnd((prev) => {
        const nextNodes = [...prev.nodes, newNode];
        let nextEdges = prev.edges;
        if (source) {
          const targetHandle = getInputHandleId(newNode.id, 0);
          if (newNode.data.inputVariables?.length) {
            nextEdges = addEdge(
              {
                source: source.sourceNodeId,
                sourceHandle: source.sourceHandleId,
                target: newNode.id,
                targetHandle,
              },
              nextEdges,
            );
          }
        }
        return { nodes: nextNodes, edges: nextEdges };
      });
      closeNodePanel();
    },
    [nodes.length, pendingAddFromHandle, pushHistoryAnd, closeNodePanel],
  );

  const handleSourceHandleClick = useCallback(
    (nodeId: string, handleId: string, x: number, y: number) => {
      openNodePanel({ sourceNodeId: nodeId, sourceHandleId: handleId, sourceX: x, sourceY: y });
    },
    [openNodePanel],
  );

  const nodeTypes = useMemo(
    () => makeNodeTypes(handleSourceHandleClick),
    [handleSourceHandleClick],
  );

  const filteredNodeOptions = useMemo(() => {
    const q = nodeSearch.trim().toLowerCase();
    if (!q) return NODE_TYPE_OPTIONS;
    return NODE_TYPE_OPTIONS.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.type.toLowerCase().includes(q) ||
        o.defaultLabel.toLowerCase().includes(q),
    );
  }, [nodeSearch]);

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
      <Card className="w-56 shrink-0 border-border bg-card flex flex-col overflow-hidden">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between gap-1">
            <CardTitle className="text-sm">Add node</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => (nodePanelOpen ? closeNodePanel() : openNodePanel())}
              aria-label={nodePanelOpen ? "Close add node panel" : "Add node to canvas"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        {nodePanelOpen && (
          <CardContent className="pt-0 flex flex-col gap-2 flex-1 min-h-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search node"
                value={nodeSearch}
                onChange={(e) => setNodeSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-0.5 overflow-auto min-h-0">
              {filteredNodeOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="ghost"
                  className="h-8 justify-start text-xs font-normal"
                  onClick={() => addNodeOfType(option.type)}
                >
                  {option.label}
                </Button>
              ))}
              {filteredNodeOptions.length === 0 && (
                <p className="text-[11px] text-muted-foreground py-2">No nodes match.</p>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {pendingAddFromHandle ? "New node will connect from the handle." : "Place new node on canvas."}
            </p>
          </CardContent>
        )}
      </Card>

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
                    pushHistoryAnd((prev) => ({
                      ...prev,
                      nodes: prev.nodes.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, label: nextLabel } }
                          : node,
                      ),
                    }));
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
                    pushHistoryAnd((prev) => ({
                      ...prev,
                      nodes: prev.nodes.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, description: nextDescription } }
                          : node,
                      ),
                    }));
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
                            pushHistoryAnd((prev) => ({
                              ...prev,
                              nodes: prev.nodes.map((node) =>
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
                            }));
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
                        pushHistoryAnd((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((node) =>
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
                        }));
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
                Connect: drag from a handle or click + on a handle to add a downstream node.
                Delete/Backspace removes selected edges or nodes. Undo: Cmd+Z (Mac) or Ctrl+Z (Windows); Redo: Cmd+Shift+Z or Ctrl+Shift+Z.
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
