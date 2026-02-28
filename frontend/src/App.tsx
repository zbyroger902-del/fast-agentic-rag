import React, { useState } from "react";
import {
  Activity,
  Database,
  GitBranch,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingAgentSidebar } from "./features/agent/FloatingAgentSidebar";
import { KnowledgeBasePage } from "./features/kb/KnowledgeBasePage";
import { WorkflowCanvasPage } from "./features/workflow/WorkflowCanvasPage";
import { TracingPage } from "./features/tracing/TracingPage";

type MainView = "chat" | "kb" | "workflow" | "tracing";

export const App: React.FC = () => {
  const [view, setView] = useState<MainView>("chat");

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="flex h-screen">
        {/* Main column */}
        <div className="flex flex-1 flex-col">
          {/* Top navigation */}
          <header className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Fast Agentic RAG
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                UI Alpha
              </Badge>
            </div>
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as MainView)}
              className="w-auto"
            >
              <TabsList className="rounded-full bg-muted p-1">
                <TabsTrigger
                  value="chat"
                  className="gap-1.5 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="kb"
                  className="gap-1.5 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <Database className="h-3.5 w-3.5" />
                  Knowledge Base
                </TabsTrigger>
                <TabsTrigger
                  value="workflow"
                  className="gap-1.5 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  Workflow Canvas
                </TabsTrigger>
                <TabsTrigger
                  value="tracing"
                  className="gap-1.5 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <Activity className="h-3.5 w-3.5" />
                  Tracing
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
        <aside
          style={{ display: "flex", width: "320px", flexShrink: 0 }}
          className="border-l border-border bg-background/95 backdrop-blur-sm"
        >
          <FloatingAgentSidebar />
        </aside>
      </div>
    </div>
  );
};

const SectionShell: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div className="flex h-full items-center justify-center">
    <div className="max-w-xl text-center space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  </div>
);

const ChatLanding: React.FC = () => (
  <SectionShell
    title="Floating Agent & Chat"
    subtitle="Chat with the agent while other tools run in the main canvas. The right sidebar will host the floating agent experience."
  />
);
