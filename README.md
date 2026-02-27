# Fast Agentic RAG

Fast Agentic RAG is an open-source Retrieval-Augmented Generation (RAG) system and agentic workflow orchestrator, inspired by tools like Dify. It is designed to handle complex unstructured documents (including multi-column PDFs) and provide a highly observable, interactive UI.

## High-Level Architecture

- **Frontend**: React (Next.js App Router or Vite), TailwindCSS, Shadcn/UI, React Flow.
- **Backend**: FastAPI (Python, fully async), with Server-Sent Events (SSE) for chat streaming.
- **Agent Logic**: LangGraph for state-machine style orchestration.
- **RAG Engine**: LlamaIndex for embeddings, indexing, and retrieval.
- **Vector Store**: Qdrant (cloud/local).
- **LLM**: Qwen-3.5-Plus via DashScope/OpenAI-compatible API.
- **Observability**: Langfuse for tracing and analytics.

## Project Layout (Initial)

- `backend/` — FastAPI backend, LangGraph/LlamaIndex logic, document parsers, and static image handling.
- `frontend/` — React-based UI (floating agent, KB manager, workflow canvas, tracing views).
- `requirements.txt` — Python backend dependencies.

Docker and Railway deployment configuration will live alongside the backend and frontend, with a root-level `docker-compose.yml` to support local development.

## Backend: Local Python Environment

The backend is designed to run on **Python 3.11**, matching the `python:3.11-slim` base image used by `backend/Dockerfile`.

### One-time setup (local)

From the project root:

```bash
python3.11 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Running the backend locally

With the virtual environment activated, start the FastAPI app:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

This mirrors the command used in the Docker image (minus `--reload`) so local behavior is close to what runs in Railway.
