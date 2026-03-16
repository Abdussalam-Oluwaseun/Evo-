"""
Pydantic models for request validation and response serialization.
"""

from pydantic import BaseModel, Field


class TailoredOutput(BaseModel):
    """
    Structured output returned by the AI.
    Contains the tailored resume and a matching cover letter.
    """

    tailored_resume: str = Field(
        ...,
        description="The ATS-optimized, tailored resume text.",
    )
    cover_letter: str = Field(
        ...,
        description="The personalized cover letter text.",
    )


class ProcessResumeResponse(BaseModel):
    """
    API response wrapper for the /process-resume endpoint.
    """

    success: bool = Field(
        default=True,
        description="Indicates whether the processing was successful.",
    )
    data: TailoredOutput = Field(
        ...,
        description="The tailored resume and cover letter.",
    )


class ErrorResponse(BaseModel):
    """
    Standardized error response for the API.
    """

    success: bool = Field(default=False)
    error: str = Field(
        ...,
        description="A human-readable error message.",
    )
    detail: str | None = Field(
        default=None,
        description="Additional technical details about the error.",
    )
