import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles


APP_ROOT = Path(__file__).parent
DEFAULT_STATIC_ROOT = APP_ROOT / "static"
STATIC_ROOT = Path(os.environ.get("STATIC_ROOT", str(DEFAULT_STATIC_ROOT)))
STATIC_IMAGES_DIR = STATIC_ROOT / "images"


def ensure_static_dirs() -> None:
    STATIC_ROOT.mkdir(parents=True, exist_ok=True)
    STATIC_IMAGES_DIR.mkdir(parents=True, exist_ok=True)


ensure_static_dirs()

app = FastAPI(title="Fast Agentic RAG Backend")

app.mount(
    "/static",
    StaticFiles(directory=str(STATIC_ROOT)),
    name="static",
)


@app.get("/health", response_class=JSONResponse)
async def health() -> dict:
    return {"status": "ok"}


@app.get("/", response_class=JSONResponse)
async def root() -> dict:
    return {"message": "Fast Agentic RAG backend skeleton is running."}

