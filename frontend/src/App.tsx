import React from "react";

export const App: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Fast Agentic RAG
        </h1>
        <p className="text-slate-300">
          Frontend skeleton is running. Next up: floating agent sidebar,
          knowledge base manager, workflow canvas, and tracing views.
        </p>
      </div>
    </main>
  );
};

