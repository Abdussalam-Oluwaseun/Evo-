"""
PDF processing service.
Uses pdfplumber to extract text from uploaded resume files.
"""

import io
import logging

import pdfplumber

logger = logging.getLogger(__name__)


class PDFExtractionError(Exception):
    """Raised when text extraction from a PDF fails."""
    pass


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text content from a PDF file.

    Args:
        file_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        A single string containing all extracted text, with pages
        separated by newlines.

    Raises:
        PDFExtractionError: If the file cannot be read as a valid PDF
                            or contains no extractable text.
    """
    try:
        pdf_stream = io.BytesIO(file_bytes)

        with pdfplumber.open(pdf_stream) as pdf:
            if not pdf.pages:
                raise PDFExtractionError(
                    "The uploaded PDF contains no pages."
                )

            pages_text: list[str] = []

            for page_number, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text:
                    pages_text.append(text.strip())
                else:
                    logger.warning(
                        "Page %d yielded no extractable text (possibly an image-based page).",
                        page_number,
                    )

            if not pages_text:
                raise PDFExtractionError(
                    "No extractable text found in the PDF. "
                    "The file may be image-based or corrupted. "
                    "Please upload a text-based PDF resume."
                )

            full_text = "\n\n".join(pages_text)
            logger.info(
                "Successfully extracted %d characters from %d page(s).",
                len(full_text),
                len(pdf.pages),
            )
            return full_text

    except pdfplumber.pdfminer.pdfparser.PDFSyntaxError as exc:
        raise PDFExtractionError(
            "Invalid PDF file. The uploaded file is not a valid PDF document."
        ) from exc
    except PDFExtractionError:
        # Re-raise our own errors as-is
        raise
    except Exception as exc:
        logger.exception("Unexpected error during PDF extraction.")
        raise PDFExtractionError(
            f"Failed to process the PDF file: {str(exc)}"
        ) from exc
