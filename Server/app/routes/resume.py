"""
Resume processing endpoint.
Handles file upload, text extraction, and AI-powered tailoring.
"""

import logging

from fastapi import APIRouter, File, Form, Header, UploadFile, HTTPException

from app.models import ProcessResumeResponse, ErrorResponse
from app.services.pdf_service import extract_text_from_pdf, PDFExtractionError
from app.services.ai_service import (
    generate_tailored_content,
    AIServiceError,
    SUPPORTED_PROVIDERS,
    DEFAULT_MODELS,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/supported-providers",
    tags=["Info"],
    summary="List all supported AI providers and their default models",
)
async def list_providers():
    """Returns all supported AI providers with their default model names."""
    return {
        "providers": {
            provider: {
                "default_model": DEFAULT_MODELS.get(provider, ""),
            }
            for provider in sorted(SUPPORTED_PROVIDERS)
        }
    }


@router.post(
    "/process-resume",
    response_model=ProcessResumeResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Server / AI error"},
    },
    summary="Tailor a resume and generate a cover letter",
    description=(
        "Upload a PDF resume and provide a job description. "
        "The system extracts text from the PDF, sends it along with the "
        "job description to the selected AI provider, and returns an "
        "ATS-optimized tailored resume plus a personalized cover letter.\n\n"
        "**Supported providers:** gemini (default), openai, anthropic, "
        "deepseek, groq, openrouter, together, mistral."
    ),
)
async def process_resume(
    resume: UploadFile = File(
        ...,
        description="The candidate's resume as a PDF file.",
    ),
    job_description: str = Form(
        ...,
        min_length=50,
        description="The full job description to tailor the resume for.",
    ),
    x_api_key: str | None = Header(
        default=None,
        alias="X-API-Key",
        description=(
            "API key for the selected AI provider. Required for all "
            "providers except Gemini (which falls back to the server's "
            "configured key)."
        ),
    ),
    x_ai_provider: str = Header(
        default="gemini",
        alias="X-AI-Provider",
        description=(
            "AI provider to use. Options: gemini, openai, anthropic, "
            "deepseek, groq, openrouter, together, mistral. "
            "Default: gemini."
        ),
    ),
    x_ai_model: str | None = Header(
        default=None,
        alias="X-AI-Model",
        description=(
            "Optional model name override. If not provided, the default "
            "model for the selected provider is used. "
            "Examples: gpt-4o, claude-sonnet-4-20250514, gemini-2.0-flash."
        ),
    ),
) -> ProcessResumeResponse:
    """
    Process an uploaded resume against a job description using the
    selected AI provider.

    Steps:
        1. Validate the uploaded file is a PDF.
        2. Extract text from the PDF using pdfplumber.
        3. Send extracted text + job description to the selected AI provider.
        4. Return the tailored resume and cover letter as structured JSON.
    """

    # ── Step 1: Validate file type ──────────────────────────────────────
    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was uploaded.",
        )

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid file type: '{resume.filename}'. "
                "Only PDF files are accepted."
            ),
        )

    if resume.content_type and resume.content_type != "application/pdf":
        logger.warning(
            "File '%s' has unexpected MIME type: %s",
            resume.filename,
            resume.content_type,
        )

    # ── Step 2: Read and extract text ───────────────────────────────────
    try:
        file_bytes = await resume.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        resume_text = extract_text_from_pdf(file_bytes)

    except PDFExtractionError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error reading uploaded file.")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read the uploaded file: {str(exc)}",
        )

    # ── Step 3: Generate tailored content via AI ────────────────────────
    try:
        tailored_output = await generate_tailored_content(
            resume_text=resume_text,
            job_description=job_description,
            user_api_key=x_api_key,
            provider=x_ai_provider,
            model=x_ai_model,
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    # ── Step 4: Return structured response ──────────────────────────────
    return ProcessResumeResponse(success=True, data=tailored_output)
