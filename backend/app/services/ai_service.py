"""
AI interaction service.
Factory-based dispatcher that routes to the correct AI provider
based on the user's request headers.
"""

import json
import logging
import re

from app.config import settings
from app.models import TailoredOutput
from app.prompts import SYSTEM_PROMPT, build_user_prompt
from app.services.providers.base import BaseProvider

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """Raised when the AI generation fails."""
    pass


# ── Default models per provider ────────────────────────────────────────
DEFAULT_MODELS: dict[str, str] = {
    "gemini": "gemini-2.0-flash",
    "openai": "gpt-4o",
    "anthropic": "claude-sonnet-4-20250514",
    "deepseek": "deepseek-chat",
    "groq": "llama-3.3-70b-versatile",
    "openrouter": "openai/gpt-4o",
    "together": "meta-llama/Llama-3-70b-chat-hf",
    "mistral": "mistral-large-latest",
}

# Providers that use the OpenAI-compatible API
OPENAI_COMPATIBLE_PROVIDERS = {"openai", "deepseek", "groq", "openrouter", "together", "mistral"}

# All supported provider names
SUPPORTED_PROVIDERS = {"gemini", "anthropic"} | OPENAI_COMPATIBLE_PROVIDERS


def _resolve_api_key(user_api_key: str | None, provider: str) -> str:
    """
    Determine which API key to use.

    Priority:
        1. User-provided key from the request header.
        2. System-level key from environment / .env file (only for 'gemini' as fallback).

    Args:
        user_api_key: The key supplied via the `X-API-Key` header, or None.
        provider: The selected AI provider name.

    Returns:
        The resolved API key string.

    Raises:
        AIServiceError: If no API key is available.
    """
    if user_api_key and user_api_key.strip():
        logger.info("Using user-provided API key for '%s'.", provider)
        return user_api_key.strip()

    # System fallback only works for the default provider (Gemini)
    if provider == "gemini" and settings.gemini_api_key:
        logger.info("Falling back to system environment Gemini API key.")
        return settings.gemini_api_key

    raise AIServiceError(
        f"No API key provided for '{provider}'. "
        "Please supply a valid API key via the 'X-API-Key' request header."
    )


def _create_provider(
    provider: str,
    api_key: str,
    model: str | None = None,
) -> BaseProvider:
    """
    Factory function — creates and returns the appropriate AI provider instance.

    Args:
        provider: The provider name (e.g. "gemini", "openai", "anthropic").
        api_key: The resolved API key.
        model: Optional model override. If None, uses the provider's default.

    Returns:
        A BaseProvider instance ready to generate content.

    Raises:
        AIServiceError: If the provider is unsupported.
    """
    resolved_model = model or DEFAULT_MODELS.get(provider, "")

    if provider == "gemini":
        from app.services.providers.gemini_provider import GeminiProvider
        return GeminiProvider(
            api_key=api_key,
            model=resolved_model,
            temperature=settings.temperature,
            max_output_tokens=settings.max_output_tokens,
        )

    if provider == "anthropic":
        from app.services.providers.anthropic_provider import AnthropicProvider
        return AnthropicProvider(
            api_key=api_key,
            model=resolved_model,
            temperature=settings.temperature,
            max_output_tokens=settings.max_output_tokens,
        )

    if provider in OPENAI_COMPATIBLE_PROVIDERS:
        from app.services.providers.openai_provider import OpenAICompatibleProvider
        return OpenAICompatibleProvider(
            api_key=api_key,
            model=resolved_model,
            temperature=settings.temperature,
            max_output_tokens=settings.max_output_tokens,
            provider_key=provider,
        )

    raise AIServiceError(
        f"Unsupported provider: '{provider}'. "
        f"Supported providers: {', '.join(sorted(SUPPORTED_PROVIDERS))}"
    )


def _parse_ai_response(raw_text: str) -> TailoredOutput:
    """
    Parse the raw AI response text into a validated TailoredOutput model.

    The AI is instructed to return raw JSON, but sometimes wraps it in
    markdown fences — this function handles both cases gracefully.

    Args:
        raw_text: The raw string returned by the AI model.

    Returns:
        A validated TailoredOutput instance.

    Raises:
        AIServiceError: If the response cannot be parsed into valid JSON
                        or is missing required keys.
    """
    cleaned = raw_text.strip()

    # Strip markdown code fences if present (handles ```json, ```JSON, ``` etc.)
    # Uses regex to safely handle fences with or without a trailing language tag
    # or newline, avoiding ValueError from .index() on edge cases.
    cleaned = re.sub(r'^```[a-zA-Z]*\n?', '', cleaned)
    cleaned = re.sub(r'\n?```$', '', cleaned).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.error("AI response is not valid JSON:\n%s", raw_text[:500])
        raise AIServiceError(
            "The AI returned an unparseable response. Please try again."
        ) from exc

    # Validate against the Pydantic model
    try:
        return TailoredOutput(**data)
    except Exception as exc:
        logger.error("AI JSON missing required keys: %s", data.keys())
        raise AIServiceError(
            "The AI response is missing required fields "
            "('tailored_resume' and/or 'cover_letter'). Please try again."
        ) from exc


async def generate_tailored_content(
    resume_text: str,
    job_description: str,
    user_api_key: str | None = None,
    provider: str = "gemini",
    model: str | None = None,
) -> TailoredOutput:
    """
    Send the resume and job description to the selected AI provider
    and return a structured TailoredOutput.

    Args:
        resume_text: Plain text extracted from the candidate's resume PDF.
        job_description: The target job description text.
        user_api_key: Optional user-supplied API key.
        provider: AI provider name (default: "gemini").
        model: Optional model name override.

    Returns:
        A TailoredOutput containing the tailored resume and cover letter.

    Raises:
        AIServiceError: On key resolution failure, API errors, or
                        unparseable responses.
    """
    provider = provider.lower().strip()

    if provider not in SUPPORTED_PROVIDERS:
        raise AIServiceError(
            f"Unsupported provider: '{provider}'. "
            f"Supported: {', '.join(sorted(SUPPORTED_PROVIDERS))}"
        )

    api_key = _resolve_api_key(user_api_key, provider)
    ai_provider = _create_provider(provider, api_key, model)

    user_prompt = build_user_prompt(resume_text, job_description)

    try:
        logger.info(
            "Generating content using provider='%s', model='%s'...",
            provider,
            ai_provider.model,
        )
        raw_text = await ai_provider.generate(SYSTEM_PROMPT, user_prompt)
        return _parse_ai_response(raw_text)

    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("AI provider '%s' call failed.", provider)
        raise AIServiceError(
            f"AI generation failed ({provider}): {str(exc)}"
        ) from exc
