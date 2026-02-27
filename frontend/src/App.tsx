import React, { useState } from "react";
import { FloatingAgentSidebar } from "./features/agent/FloatingAgentSidebar";
import { KnowledgeBasePage } from "./features/kb/KnowledgeBasePage";
import { WorkflowCanvasPage } from "./features/workflow/WorkflowCanvasPage";
import { TracingPage } from "./features/tracing/TracingPage";

type MainView = "chat" | "kb" | "workflow" | "tracing";

export const App: React.FC = () => {
  const [view, setView] = useState<MainView>("chat");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex h-screen">
        {/* Main column */}
        <div className="flex flex-1 flex-col">
          {/* Top navigation */}
          <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-slate-200">
                Fast Agentic RAG
              </span>
              <span className="text-xs rounded-full border border-slate-700 px-2 py-0.5 text-slate-400">
                UI Alpha
              </span>
            </div>
            <nav className="flex items-center gap-1 text-sm rounded-full bg-slate-900/70 p-1 ring-1 ring-slate-800">
              <NavTab
                label="Chat"
                isActive={view === "chat"}
                onClick={() => setView("chat")}
              />
              <NavTab
                label="Knowledge Base"
                isActive={view === "kb"}
                onClick={() => setView("kb")}
              />
              <NavTab
                label="Workflow Canvas"
                isActive={view === "workflow"}
                onClick={() => setView("workflow")}
              />
              <NavTab
                label="Tracing"
                isActive={view === "tracing"}
                onClick={() => setView("tracing")}
              />
            </nav>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-hidden px-6 py-4">
            {view === "chat" && <ChatLanding />}
            {view === "kb" && <KnowledgeBasePage />}
            {view === "workflow" && <WorkflowCanvasPage />}
            {view === "tracing" && <TracingPage />}
          </main>
        </div>

        {/* Right-side agent container */}
        <aside className="hidden md:flex w-80 border-l border-slate-800 bg-slate-950/80 backdrop-blur-sm">
          <FloatingAgentSidebar />
        </aside>
      </div>
    </div>
  );
};

interface NavTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavTab: React.FC<NavTabProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 transition-colors ${
        isActive
          ? "bg-slate-200 text-slate-900"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      }`}
    >
      {label}
    </button>
  );
};

const SectionShell: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div className="flex h-full items-center justify-center">
    <div className="max-w-xl text-center space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-slate-300 text-sm">{subtitle}</p>
    </div>
  </div>
);

const ChatLanding: React.FC = () => (
  <SectionShell
    title="Floating Agent & Chat"
    subtitle="Chat with the agent while other tools run in the main canvas. The right sidebar will host the floating agent experience."
  />
);

const KnowledgeBaseLanding: React.FC = () => (
  <SectionShell
    title="Knowledge Base Manager"
    subtitle="Upload documents, configure parsing, and inspect chunks and images. A data table, detail pane, and recall tester will live here."
  />
);

const WorkflowLanding: React.FC = () => (
  <SectionShell
    title="Workflow Canvas"
    subtitle="Design agentic workflows using a React Flow canvas with LangGraph-inspired nodes and settings."
  />
);

const TracingLanding: React.FC = () => (
  <SectionShell
    title="Tracing & Observability"
    subtitle="Inspect LangGraph runs and Langfuse traces in a nested table view grouped by session."
  />
);

