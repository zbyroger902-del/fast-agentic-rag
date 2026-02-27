import React, { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeProps,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

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

  return (
    <div className="min-w-[160px] rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-100">{data.label}</p>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
          {badge}
        </span>
      </div>
      {data.description && (
        <p className="mt-1 text-[11px] text-slate-400 line-clamp-3">
          {data.description}
        </p>
      )}
    </div>
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

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 min-w-0 rounded-lg border border-slate-800 bg-slate-900/40">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        >
          <Background gap={16} color="#1f2937" />
          <Controls />
        </ReactFlow>
      </div>

      <div className="w-80 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-3 text-xs">
        <p className="font-medium text-slate-100">Node settings</p>
        {selectedNode ? (
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-[11px] text-slate-400">
                Label
              </label>
              <input
                type="text"
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
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400">
                Description
              </label>
              <textarea
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
                className="mt-1 w-full resize-none rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              These settings are local-only for now. Later they will map to
              LangGraph node configuration and execution parameters.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-slate-500">
            Select a node on the canvas to edit its label and description.
          </p>
        )}
      </div>
    </div>
  );
};

