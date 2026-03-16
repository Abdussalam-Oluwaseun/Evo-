"""
OpenAI-compatible provider.
Works with OpenAI, DeepSeek, Groq, OpenRouter, Together, Mistral,
and any other provider that exposes an OpenAI-compatible chat completions API.
"""

import logging
from openai import OpenAI

from app.services.providers.base import BaseProvider

logger = logging.getLogger(__name__)

# Base URLs for known OpenAI-compatible providers
PROVIDER_BASE_URLS: dict[str, str] = {
    "openai": "https://api.openai.com/v1",
    "deepseek": "https://api.deepseek.com",
    "groq": "https://api.groq.com/openai/v1",
    "openrouter": "https://openrouter.ai/api/v1",
    "together": "https://api.together.xyz/v1",
    "mistral": "https://api.mistral.ai/v1",
}


class OpenAICompatibleProvider(BaseProvider):
    """
    Provider for OpenAI and any OpenAI-compatible API.

    Args:
        api_key: API key for the provider.
        model: Model name.
        temperature: Sampling temperature.
        max_output_tokens: Max tokens in response.
        provider_key: Key to look up the base URL (e.g. "openai", "deepseek").
        base_url: Explicit base URL override (takes priority over provider_key).
    """

    def __init__(
        self,
        api_key: str,
        model: str,
        temperature: float = 0.7,
        max_output_tokens: int = 8192,
        provider_key: str = "openai",
        base_url: str | None = None,
    ):
        super().__init__(api_key, model, temperature, max_output_tokens)
        self.base_url = base_url or PROVIDER_BASE_URLS.get(
            provider_key, PROVIDER_BASE_URLS["openai"]
        )
        self.provider_key = provider_key

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Send prompts via the OpenAI-compatible chat completions API."""
        client = OpenAI(api_key=self.api_key, base_url=self.base_url)

        logger.info(
            "Sending request to %s model '%s' (base: %s)...",
            self.provider_key,
            self.model,
            self.base_url,
        )

        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=self.temperature,
            max_tokens=self.max_output_tokens,
            response_format={"type": "json_object"},
        )

        raw_text = response.choices[0].message.content

        if not raw_text:
            from app.services.ai_service import AIServiceError
            raise AIServiceError(
                f"{self.provider_key.title()} returned an empty response. "
                "Please review your inputs and try again."
            )

        logger.info(
            "Received %d characters from %s.", len(raw_text), self.provider_key
        )
        return raw_text
