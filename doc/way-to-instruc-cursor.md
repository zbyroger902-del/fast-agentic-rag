---

### How to use this PRD with Cursor effectively (The "Vibe Coding" Workflow)

To get the best results, **do not ask Cursor to build the whole PRD at once.** It will lose context and break. Follow this step-by-step sequence in Cursor:

**Step 1: Scaffolding**
> "Cursor, please read `PRD.md`. I want to start by setting up the project structure. Initialize a FastAPI backend in a `/backend` folder and a Next.js/Shadcn project in a `/frontend` folder. Do not implement the logic yet, just set up the basic dependencies and folder structure based on the PRD."

**Step 2: The UI Skeleton**
> "Now, let's build the layout. Using Shadcn `ResizablePanelGroup`, create the main dashboard layout. Implement Interface 1 (The Floating Sidebar Agent) as a collapsible panel on the right. Make it look like Claude's UI with a chat input and paperclip icon."

**Step 3: The Parsing Factory (Backend)**
> "Let's move to the backend. Create the `DocumentParserService` as described in Section 3 of the PRD. Write the logic for Tier 1 (PyMuPDF) and a mock implementation for Tier 2 (LlamaParse). Ensure it runs asynchronously."

**Step 4: The Agent logic**
> "Create the LangGraph state machine. It should have tools for `ingest_document` and `query_kb`. Use Qwen-VL-Plus as the LLM. Expose this via an async `/chat` endpoint that streams SSE responses."

### Why this approach works:
1.  **You solved the Parser dilemma:** Using PyMuPDF + standard python libraries as the "Fast/Free" tier and LlamaParse as the "Advanced" tier is the exact architecture enterprise RAG systems use.
2.  **LlamaIndex is local:** Yes, LlamaIndex is just a Python framework. You keep it in your backend. It handles the vector math locally and only calls the LlamaParse API when instructed.
3.  **Observability without tears:** By explicitly stating you want "Trace -> Spans" drill-down, Cursor will know to structure your logging hierarchically, making Interface 4 much easier to build.

This PRD bridges the gap between your conceptual architecture and Cursor's need for strict, component-level instructions.