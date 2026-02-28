import React, { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
        <Card className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <DocumentTable
            documents={mockDocuments}
            selectedId={selectedDocId}
            onSelect={setSelectedDocId}
          />
        </Card>

        <div className="flex w-[420px] flex-col gap-4">
          <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <DocumentDetailView document={selectedDoc} chunks={selectedChunks} />
          </Card>
          <Card className="h-64 flex flex-col overflow-hidden">
            <RecallTester
              query={recallQuery}
              onQueryChange={setRecallQuery}
              results={mockRecallResults}
            />
          </Card>
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
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <Card className="flex-1 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload documents
        </CardTitle>
        <CardDescription>
          Drag &amp; drop files here, or click to choose. Files under 10MB will
          be ingested into a temporary session knowledge base.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onUploadChange}
          aria-hidden
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Browse files to upload"
        >
          Browse files
        </Button>
        {uploadedFiles.length > 0 && (
          <ul className="mt-3 max-h-24 space-y-1 overflow-y-auto text-xs text-muted-foreground">
            {uploadedFiles.map((file) => (
              <li key={file.name} className="truncate">
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

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
  <Card className="w-64">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm">Configuration</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={show ? "Hide configuration" : "Show configuration"}
          className="text-xs text-muted-foreground"
        >
          {show ? "Hide" : "Show"}
        </Button>
      </div>
    </CardHeader>
    {show && (
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <Label className="text-xs">Engine</Label>
          <Select value={engine} onValueChange={onEngineChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Local (PyMuPDF + DOCX)">
                Local (PyMuPDF + DOCX)
              </SelectItem>
              <SelectItem value="LlamaParse">LlamaParse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Chunking</Label>
          <Select value={chunking} onValueChange={onChunkingChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semantic">Semantic</SelectItem>
              <SelectItem value="fixed-512">Fixed (512 tokens)</SelectItem>
              <SelectItem value="page">Per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Rerank</Label>
          <Select value={rerank} onValueChange={onRerankChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="cross-encoder">Cross-encoder</SelectItem>
              <SelectItem value="llm">LLM rerank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    )}
  </Card>
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
    <div className="flex items-center justify-between border-b border-border px-3 py-2">
      <p className="font-medium text-foreground">Documents</p>
      <p className="text-[11px] text-muted-foreground">
        {documents.length} loaded
      </p>
    </div>
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px]">Name</TableHead>
            <TableHead className="text-[11px]">Engine</TableHead>
            <TableHead className="text-[11px]">Size</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="text-[11px]">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const isSelected = doc.id === selectedId;
            return (
              <TableRow
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={cn(
                  "cursor-pointer text-[11px]",
                  isSelected && "bg-muted",
                )}
              >
                <TableCell className="text-foreground">{doc.name}</TableCell>
                <TableCell className="text-muted-foreground">{doc.engine}</TableCell>
                <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                <TableCell>
                  <Badge
                    variant={doc.status === "ready" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {doc.status === "ready" ? "Ready" : "Processing"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{doc.createdAt}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
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
    <CardHeader className="border-b border-border py-3">
      <CardTitle className="text-sm">
        {document ? document.name : "No document selected"}
      </CardTitle>
      <CardDescription>
        Parsed chunks and image attachments for the selected document.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex-1 overflow-auto py-3 space-y-2">
      {document ? (
        chunks.map((chunk) => (
          <div
            key={chunk.id}
            className="rounded-md border border-border bg-muted/30 p-2"
          >
            <p className="text-foreground">{chunk.text}</p>
            {chunk.imagePath && (
              <div className="mt-2 rounded-md border border-border bg-card p-2 text-center text-[11px] text-muted-foreground">
                Image placeholder for <code>{chunk.imagePath}</code>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">
          Select a document from the table to inspect its chunks and images.
        </p>
      )}
    </CardContent>
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
    <CardHeader className="border-b border-border py-3">
      <CardTitle className="text-sm">Recall tester</CardTitle>
      <CardDescription>
        Enter a query to preview how retrieved chunks (and their images) might
        look once backend retrieval is wired up.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-1 gap-2 py-3 min-h-0">
      <div className="w-1/2 flex flex-col gap-2 min-h-0">
        <Label htmlFor="recall-query" className="sr-only">
          Recall query
        </Label>
        <Textarea
          id="recall-query"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="e.g. Show me how images are linked to chunks in the architecture docs."
          className="flex-1 min-h-0 resize-none text-xs"
        />
      </div>
      <div className="w-1/2 space-y-2 overflow-auto">
        {results.map((chunk) => (
          <div
            key={chunk.id}
            className="rounded-md border border-border bg-muted/30 p-2"
          >
            <p className="text-foreground">{chunk.text}</p>
            {chunk.imagePath && (
              <div className="mt-2 rounded-md border border-border bg-card p-2 text-center text-[11px] text-muted-foreground">
                Image placeholder for <code>{chunk.imagePath}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </div>
);
