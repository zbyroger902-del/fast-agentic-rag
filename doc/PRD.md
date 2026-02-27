
PRD for Fast Agentic RAG
---
## 1. Project Overview & Goal
We are building a custom RAG (Retrieval-Augmented Generation) system and Agentic Workflow orchestrator. It serves as an open-source, flexible alternative to Dify. The system excels at handling complex unstructured documents (like multi-column PDFs) and provides a highly observable, interactive UI.

## 2. Tech Stack Definition
*   **Frontend:** React (Next.js App Router or Vite), TailwindCSS, Shadcn/UI, React Flow.
*   **Backend:** FastAPI (Python), fully async endpoints, Server-Sent Events (SSE) for chat streaming.
*   **Agent Logic:** LangGraph (State machine architecture).
*   **RAG Engine:** LlamaIndex (Local Python codebase handling embeddings and chunking).
*   **Vector Store:** Qdrant (Cloud/Local API).
*   **LLM:** Qwen-3.5-Plus (Multimodal, via DashScope/OpenAI-compatible API).
*   **Observability:** Langfuse (Open source, excellent trace grouping, easy to pull data via API for our custom tab).

## 3. The Two-Tier File Parsing Engine & Image Retention
The backend must implement a `DocumentParserService` with a Factory pattern. Crucially, **images must not be discarded**.
*   **Image Storage Strategy (Low Complexity):** 
    *   Extracted images are saved to a local FastAPI `/static/images/` directory (served via `StaticFiles`).
    *   The relative URL path (e.g., `/static/images/doc123_page4_img1.png`) is injected directly into the **Metadata** of the text chunk that immediately precedes or surrounds the image.
*   **Tier 1: Default/Free (Local Processing)**
    *   *PDFs:* `PyMuPDF` (Fast text extraction. Use `fitz` to extract page images/figures and link to chunk metadata).
    *   *DOCX:* `python-docx`.
    *   *Excel/CSV:* `pandas` (Convert to Markdown tables).
    *   *PPTX:* `python-pptx`.
*   **Tier 2: Advanced/Layout-Aware (API Processing)**
    *   *All complex formats:* **LlamaParse API**. Configured to extract images, save them locally, and map the image paths to the Markdown nodes.

## 4. UI/UX Architecture & Layout Specifications

**Global Layout Concept:** 
Use Shadcn's `SidebarProvider` or a `ResizablePanelGroup`. The app has a main central viewing area with a persistent floating agent on the right side.

### Interface 1: The Floating Agent Sidebar (Reference: Cursor's own sidebar / Claude)
*   **Visuals:** A collapsible right-side panel (`w-96`). When collapsed, it’s a floating chat icon.
*   **Components:** 
    *   Chat history view.
    *   Input box with a `Paperclip` icon for file uploads.
*   **Behavior Flow:**
    *   *Upload <10MB:* Automatically uploaded to a temporary `session_kb`.
    *   *Upload behavior:* If a file is uploaded but no text is typed, the Agent responds: *"I see you uploaded `file.pdf`. Do you want me to add this to the Knowledge Base, or just answer questions about it?"*
    *   *Tool Execution:* If the user says "Add to KB", the agent executes the `ingest_document_tool`.

### Interface 2: Knowledge Base Manager(Reference: Vercel Dashboard / Supabase Table View)
*   **Visuals:** A clean dashboard table using Shadcn `DataTable`.
*   **Components & Features:**
    *   **Upload Area:** Drag & drop zone.
    *   **Configuration Drawer:** Slide-out panel for selecting Engine, Chunking, and Rerank.
    *   **Document Detail View:** Clicking a document shows its parsed chunks, metadata, and **renders the extracted images** attached to those chunks.
    *   **Recall Tester:** Left side: Input query. Right side: Shows top 5 retrieved chunks. **If a retrieved chunk has an image path in its metadata, the UI must render the image below the text.**

### Interface 3: Workflow Canvas(Reference: Standard React Flow / Zapier Canvas)
*   **Visuals:** Full-screen grid background using `React Flow`.
*   **Components:** Minimalist custom Nodes (Shadcn `Card`) for LangGraph steps. Clicking a node opens a right-side settings panel.

### Interface 4: Integrated Tracing Tab(Reference: LangSmith / Posthog)
*   **Visuals:** A nested table layout pulling data via Langfuse API.
*   **Features:** Group logs by Session ID. Expand to show LangGraph steps (User Input -> Retrieve -> Final LLM Generation).

## 5. Core Backend Behaviors & APIs
1.  **Async/Await:** All endpoints (`/chat`, `/ingest`, `/retrieve`) must be `async def`.
2.  **Streaming:** `/chat` returns `StreamingResponse` using Server-Sent Events (SSE).
3.  **RAG Logic (LlamaIndex):** Runs locally. During retrieval, when a `NodeWithScore` is returned, the backend ensures any `image_path` in the node's metadata is passed to the frontend alongside the text.
4.  **Tool Calling:** The Qwen LLM uses tools like `search_knowledge_base` and `ingest_file`.

## 6. Deployment & Infrastructure (Railway + Docker)
The application must be designed from Day 1 to be deployed on **Railway.app** using Docker. The architecture relies on external managed APIs (Qdrant, Langfuse, LLMs) to keep the compute containers lightweight.

*   **Containerization Strategy:**
    *   **Backend (`/backend/Dockerfile`):** Use a slim Python 3.11 image. Expose port 8000. Start via `uvicorn`.
    *   **Frontend (`/frontend/Dockerfile`):** Use a Node multi-stage build. Expose port 3000. Start via Next.js standalone output.
    *   **Local Dev:** Include a `docker-compose.yml` in the root directory that spins up both the frontend and backend together for local testing.

*   **Stateful File Management (CRITICAL):**
    *   Railway containers are ephemeral. On redeployment, the local filesystem is wiped.
    *   The backend MUST be configured to read/write images to `/app/static/images`. 
    *   *Railway Config:* When deployed to Railway, we will attach a **Railway Volume** mapped to `/app/static/images`. The code must create this directory on startup if it does not exist (`os.makedirs`).

*   **Environment Variables (`.env`):**
    The backend must strictly use `pydantic-settings` or `os.environ` to load:
    *   `QDRANT_URL` and `QDRANT_API_KEY`
    *   `LLM_API_KEY` (DashScope / OpenAI)
    *   `LLAMA_CLOUD_API_KEY` (For LlamaParse backup engine)
    *   `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST`
    *   *(No DB credentials needed since we use Qdrant Cloud).*
---
*(End of PRD)*



