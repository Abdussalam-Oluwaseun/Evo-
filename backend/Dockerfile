# Multi-stage Dockerfile for Evo Resume Backend - Optimized for Railway
FROM python:3.13-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Final stage
FROM python:3.13-slim

WORKDIR /app

# Install runtime dependencies (libc for PDF processing)
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Add user local bin to PATH
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . .

# Set Python to run in unbuffered mode (important for Railway logs)
ENV PYTHONUNBUFFERED=1

# Expose port (Railway will use $PORT env variable)
EXPOSE 8000

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/supported-providers')" || exit 1

# Start application (Railway sets PORT env var automatically)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
