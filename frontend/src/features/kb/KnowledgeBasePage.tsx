import React, { useMemo, useState } from "react";

type DocumentStatus = "ready" | "processing";

interface KnowledgeDocument {
  id: string;
  name: string;
  size: string;
  engine: string;
  status: DocumentStatus;
  createdAt: string;
}

interface Chunk {
  id: string;
  text: string;
  imagePath?: string;
}

const mockDocuments: KnowledgeDocument[] = [
  {
    id: "doc-1",
    name: "Product PRD.pdf",
    size: "1.2 MB",
    engine: "LlamaParse",
    status: "ready",
    createdAt: "2025-02-10",
  },
  {
    id: "doc-2",
    name: "Support_Playbook.docx",
    size: "640 KB",
    engine: "Local (PyMuPDF + DOCX)",
    status: "processing",
    createdAt: "2025-02-11",
  },
];

const mockChunksByDocId: Record<string, Chunk[]> = {
  "doc-1": [
    {
      id: "c-1",
      text: "The Fast Agentic RAG system orchestrates document ingestion, retrieval, and agent workflows.",
    },
    {
      id: "c-2",
      text: "This figure shows the end-to-end architecture of the system.",
      imagePath: "/static/images/example_arch.png",
    },
  ],
  "doc-2": [
    {
      id: "c-3",
      text: "Support agents should always confirm the latest context from the Knowledge Base before answering.",
    },
  ],
};

const mockRecallResults: Chunk[] = [
  {
    id: "r-1",
    text: "The RAG pipeline first retrieves top-k chunks and then re-ranks them before calling the LLM.",
  },
  {
    id: "r-2",
    text: "The architecture diagram below illustrates how LangGraph coordinates tools and models.",
    imagePath: "/static/images/example_recall.png",
  },
];

export const KnowledgeBasePage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    mockDocuments[0]?.id ?? null,
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [engine, setEngine] = useState("LlamaParse");
  const [chunking, setChunking] = useState("semantic");
  const [rerank, setRerank] = useState("none");
  const [recallQuery, setRecallQuery] = useState("");

  const selectedDoc = useMemo(
    () => mockDocuments.find((doc) => doc.id === selectedDocId) ?? null,
    [selectedDocId],
  );

  const selectedChunks = useMemo(
    () =>
      selectedDoc ? mockChunksByDocId[selectedDoc.id] ?? [] : [],
    [selectedDoc],
  );

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex gap-4">
        <UploadArea
          uploadedFiles={uploadedFiles}
          onUploadChange={handleUploadChange}
        />
        <ConfigPanel
          show={showConfig}
          onToggle={() => setShowConfig((value) => !value)}
          engine={engine}
          onEngineChange={setEngine}
          chunking={chunking}
          onChunkingChange={setChunking}
          rerank={rerank}
          onRerankChange={setRerank}
        />
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 min-w-0 rounded-lg border border-slate-800 bg-slate-900/40">
          <DocumentTable
            documents={mockDocuments}
            selectedId={selectedDocId}
            onSelect={setSelectedDocId}
          />
        </div>

        <div className="flex w-[420px] flex-col gap-4">
          <div className="flex-1 min-h-0 rounded-lg border border-slate-800 bg-slate-900/40">
            <DocumentDetailView document={selectedDoc} chunks={selectedChunks} />
          </div>
          <div className="h-64 rounded-lg border border-slate-800 bg-slate-900/40">
            <RecallTester
              query={recallQuery}
              onQueryChange={setRecallQuery}
              results={mockRecallResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface UploadAreaProps {
  uploadedFiles: File[];
  onUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  uploadedFiles,
  onUploadChange,
}) => (
  <div className="flex-1 rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-3 text-xs">
    <p className="font-medium text-slate-100">Upload documents</p>
    <p className="mt-1 text-slate-400">
      Drag &amp; drop files here, or click to choose. Files under 10MB will be
      ingested into a temporary session knowledge base.
    </p>
    <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-900 hover:bg-slate-200">
      <span>Browse files</span>
      <input
        type="file"
        multiple
        className="hidden"
        onChange={onUploadChange}
      />
    </label>
    {uploadedFiles.length > 0 && (
      <ul className="mt-3 max-h-24 space-y-1 overflow-y-auto text-[11px] text-slate-300">
        {uploadedFiles.map((file) => (
          <li key={file.name} className="truncate">
            {file.name}
          </li>
        ))}
      </ul>
    )}
  </div>
);

interface ConfigPanelProps {
  show: boolean;
  onToggle: () => void;
  engine: string;
  onEngineChange: (value: string) => void;
  chunking: string;
  onChunkingChange: (value: string) => void;
  rerank: string;
  onRerankChange: (value: string) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  show,
  onToggle,
  engine,
  onEngineChange,
  chunking,
  onChunkingChange,
  rerank,
  onRerankChange,
}) => (
  <div className="w-64 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-3 text-xs">
    <div className="flex items-center justify-between">
      <p className="font-medium text-slate-100">Configuration</p>
      <button
        type="button"
        onClick={onToggle}
        className="text-[11px] text-slate-400 hover:text-slate-100"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
    {show && (
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-[11px] text-slate-400">Engine</label>
          <select
            value={engine}
            onChange={(event) => onEngineChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Local (PyMuPDF + DOCX)">
              Local (PyMuPDF + DOCX)
            </option>
            <option value="LlamaParse">LlamaParse</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400">Chunking</label>
          <select
            value={chunking}
            onChange={(event) => onChunkingChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="semantic">Semantic</option>
            <option value="fixed-512">Fixed (512 tokens)</option>
            <option value="page">Per page</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400">Rerank</label>
          <select
            value={rerank}
            onChange={(event) => onRerankChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="none">None</option>
            <option value="cross-encoder">Cross-encoder</option>
            <option value="llm">LLM rerank</option>
          </select>
        </div>
      </div>
    )}
  </div>
);

interface DocumentTableProps {
  documents: KnowledgeDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedId,
  onSelect,
}) => (
  <div className="flex h-full flex-col text-xs">
    <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
      <p className="font-medium text-slate-100">Documents</p>
      <p className="text-[11px] text-slate-400">
        {documents.length} loaded
      </p>
    </div>
    <div className="flex-1 overflow-auto">
      <table className="min-w-full text-left">
        <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-sm">
          <tr className="border-b border-slate-800 text-[11px] text-slate-400">
            <th className="px-3 py-2 font-normal">Name</th>
            <th className="px-3 py-2 font-normal">Engine</th>
            <th className="px-3 py-2 font-normal">Size</th>
            <th className="px-3 py-2 font-normal">Status</th>
            <th className="px-3 py-2 font-normal">Created</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isSelected = doc.id === selectedId;
            return (
              <tr
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={`cursor-pointer border-b border-slate-800/60 text-[11px] hover:bg-slate-900 ${
                  isSelected ? "bg-slate-900" : ""
                }`}
              >
                <td className="px-3 py-2 text-slate-100">{doc.name}</td>
                <td className="px-3 py-2 text-slate-300">{doc.engine}</td>
                <td className="px-3 py-2 text-slate-300">{doc.size}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                      doc.status === "ready"
                        ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30"
                        : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30"
                    }`}
                  >
                    {doc.status === "ready" ? "Ready" : "Processing"}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-400">{doc.createdAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

interface DocumentDetailViewProps {
  document: KnowledgeDocument | null;
  chunks: Chunk[];
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  chunks,
}) => (
  <div className="flex h-full flex-col text-xs">
    <div className="border-b border-slate-800 px-3 py-2">
      <p className="font-medium text-slate-100">
        {document ? document.name : "No document selected"}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400">
        Parsed chunks and image attachments for the selected document.
      </p>
    </div>
    <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
      {document ? (
        chunks.map((chunk) => (
          <div
            key={chunk.id}
            className="rounded-md border border-slate-800 bg-slate-950/60 p-2"
          >
            <p className="text-slate-100">{chunk.text}</p>
            {chunk.imagePath && (
              <div className="mt-2 rounded-md border border-slate-800 bg-slate-900/80 p-2 text-center text-[11px] text-slate-400">
                Image placeholder for <code>{chunk.imagePath}</code>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-slate-500">
          Select a document from the table to inspect its chunks and images.
        </p>
      )}
    </div>
  </div>
);

interface RecallTesterProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: Chunk[];
}

const RecallTester: React.FC<RecallTesterProps> = ({
  query,
  onQueryChange,
  results,
}) => (
  <div className="flex h-full flex-col text-xs">
    <div className="border-b border-slate-800 px-3 py-2">
      <p className="font-medium text-slate-100">Recall tester</p>
      <p className="mt-0.5 text-[11px] text-slate-400">
        Enter a query to preview how retrieved chunks (and their images) might
        look once backend retrieval is wired up.
      </p>
    </div>
    <div className="flex flex-1 gap-2 px-3 py-2">
      <div className="w-1/2 space-y-2">
        <textarea
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="e.g. Show me how images are linked to chunks in the architecture docs."
          className="h-full w-full resize-none rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div className="w-1/2 space-y-2 overflow-auto">
        {results.map((chunk) => (
          <div
            key={chunk.id}
            className="rounded-md border border-slate-800 bg-slate-950/60 p-2"
          >
            <p className="text-slate-100">{chunk.text}</p>
            {chunk.imagePath && (
              <div className="mt-2 rounded-md border border-slate-800 bg-slate-900/80 p-2 text-center text-[11px] text-slate-400">
                Image placeholder for <code>{chunk.imagePath}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

