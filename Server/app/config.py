"""
Application configuration and settings.
Loads environment variables with fallback defaults.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    The GEMINI_API_KEY serves as the system-level fallback
    when a user does not provide their own key in the request header.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

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

    # CORS — comma-separated list of allowed origins, e.g.:
    # ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
    # Leave empty (default) to allow all origins during development.
    allowed_origins: str = Field(
        default="",
        description="Comma-separated list of allowed CORS origins. Empty = allow all.",
    )

    @property
    def cors_origins(self) -> list[str]:
        """Returns the parsed list of allowed origins, or ['*'] if unset."""
        if self.allowed_origins.strip():
            return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
        return ["*"]


# Singleton settings instance
settings = Settings()

