"""
Evo Resume Tailoring API — Entry Point

A stateless FastAPI backend that accepts a PDF resume and a job description,
then uses a user-selected AI provider (Gemini, OpenAI, Anthropic, DeepSeek,
Groq, OpenRouter, Together, Mistral) to produce an ATS-optimized tailored
resume and a personalized cover letter. No database. No storage. Fresh start
every request.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes.resume import router as resume_router

# ── Logging ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-8s │ %(name)s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── FastAPI Application ─────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "A stateless API that tailors resumes and generates cover letters "
        "using AI. Upload a PDF resume and a job description to receive "
        "ATS-optimized output. No data is stored — every request is a "
        "fresh start."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ─────────────────────────────────────────────────────
# CORS origins are controlled via the ALLOWED_ORIGINS env variable.
# Set it to a comma-separated list of domains in production, e.g.:
# ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
# Leave it unset (or empty) for local development — defaults to ["*"].
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ───────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler to prevent raw stack traces from leaking."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An unexpected internal error occurred.",
            "detail": str(exc) if settings.debug else None,
        },
    )


# ── Register Routes ────────────────────────────────────────────────────
app.include_router(resume_router, tags=["Resume Tailoring"])


# ── Health Check ────────────────────────────────────────────────────────
@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    response_model=dict,
)
async def health_check():
    """Returns service status — useful for uptime monitors and load balancers."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }


# ── Root ────────────────────────────────────────────────────────────────
@app.get("/", tags=["System"])
async def root():
    """Friendly landing message."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }


# ── Run with Uvicorn ───────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
