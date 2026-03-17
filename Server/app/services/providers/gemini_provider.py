"""
Google Gemini AI provider.
Uses the google-generativeai SDK.
"""

import asyncio
import logging

import google.generativeai as genai

from app.services.providers.base import BaseProvider

logger = logging.getLogger(__name__)


class GeminiProvider(BaseProvider):
    """Google Gemini AI provider."""

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Send prompts to Gemini and return the raw response text."""
        genai.configure(api_key=self.api_key)

        model = genai.GenerativeModel(
            model_name=self.model,
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                temperature=self.temperature,
                max_output_tokens=self.max_output_tokens,
                response_mime_type="application/json",
            ),
        )

        logger.info("Sending request to Gemini model '%s'...", self.model)
        # generate_content is synchronous — run in a thread pool to
        # avoid blocking FastAPI's async event loop.
        response = await asyncio.to_thread(model.generate_content, user_prompt)

        if not response.text:
            from app.services.ai_service import AIServiceError
            raise AIServiceError(
                "Gemini returned an empty response. This may be due to "
                "content safety filters. Please review your inputs and try again."
            )

        logger.info("Received %d characters from Gemini.", len(response.text))
        return response.text
