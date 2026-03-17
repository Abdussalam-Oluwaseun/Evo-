"""
Abstract base class for all AI providers.
Every provider must implement the `generate` method.
"""

from abc import ABC, abstractmethod

from app.models import TailoredOutput


class BaseProvider(ABC):
    """
    Contract that every AI provider must follow.

    Args:
        api_key: The resolved API key for this provider.
        model: The model name to use (e.g. "gpt-4o", "gemini-2.0-flash").
        temperature: Controls randomness in output.
        max_output_tokens: Maximum tokens in the AI response.
    """

    def __init__(
        self,
        api_key: str,
        model: str,
        temperature: float = 0.7,
        max_output_tokens: int = 8192,
    ):
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_output_tokens = max_output_tokens

    @abstractmethod
    async def generate(
        self, system_prompt: str, user_prompt: str
    ) -> str:
        """
        Send the prompts to the AI model and return the raw text response.

        Args:
            system_prompt: The system-level instruction prompt.
            user_prompt: The user-facing prompt with resume + JD.

        Returns:
            The raw text response from the AI model.

        Raises:
            AIServiceError: If the API call fails.
        """
        ...

    @property
    def provider_name(self) -> str:
        return self.__class__.__name__
