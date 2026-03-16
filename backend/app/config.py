"""
Application configuration and settings.
Loads environment variables with fallback defaults.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    The GEMINI_API_KEY serves as the system-level fallback
    when a user does not provide their own key in the request header.
    """

    app_name: str = "Evo Resume Tailoring API"
    app_version: str = "1.0.0"
    debug: bool = False

    # System-level fallback API key (loaded from .env or environment)
    gemini_api_key: str = Field(
        default="",
        description="System fallback Gemini API key. Used when no user key is provided.",
    )

    # AI model configuration
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        description="The Gemini model to use for generation.",
    )
    max_output_tokens: int = Field(
        default=8192,
        description="Maximum tokens in the AI response.",
    )
    temperature: float = Field(
        default=0.7,
        description="Controls randomness in AI output. Lower = more deterministic.",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton settings instance
settings = Settings()
