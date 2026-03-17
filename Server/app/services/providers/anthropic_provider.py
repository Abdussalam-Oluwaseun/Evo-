"""
Anthropic Claude provider.
Uses the official Anthropic Python SDK (async client).
"""

import logging

import anthropic

from app.services.providers.base import BaseProvider

logger = logging.getLogger(__name__)


class AnthropicProvider(BaseProvider):
    """Anthropic Claude AI provider."""

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Send prompts to Anthropic Claude and return the raw response text."""
        # Use AsyncAnthropic so the API call is properly awaited and never
        # blocks FastAPI's async event loop.
        client = anthropic.AsyncAnthropic(api_key=self.api_key)

        logger.info("Sending request to Anthropic model '%s'...", self.model)

        message = await client.messages.create(
            model=self.model,
            max_tokens=self.max_output_tokens,
            temperature=self.temperature,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt},
            ],
        )

        raw_text = message.content[0].text

        if not raw_text:
            from app.services.ai_service import AIServiceError
            raise AIServiceError(
                "Anthropic returned an empty response. "
                "Please review your inputs and try again."
            )

        logger.info("Received %d characters from Anthropic.", len(raw_text))
        return raw_text
