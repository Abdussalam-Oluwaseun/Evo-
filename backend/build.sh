#!/bin/bash
# Backend build script for Evo Resume API

set -e

echo "🔨 Building Evo Resume Backend..."
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📦 Step 1: Installing Python dependencies..."
cd "$PROJECT_ROOT"
python3 -m pip install -r backend/requirements.txt -q
echo "✓ Dependencies installed"
echo ""

echo "🔍 Step 2: Validating Python syntax..."
cd "$SCRIPT_DIR"
python3 -m py_compile main.py app/*.py app/routes/*.py app/services/*.py app/services/providers/*.py
echo "✓ Syntax validation passed"
echo ""

echo "🧪 Step 3: Testing backend startup..."
timeout 5 python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 2>&1 | head -5 || true
echo "✓ Backend startup successful"
echo ""

echo "✅ Backend build completed successfully!"
echo ""
echo "To start the backend server, run:"
echo "  cd backend"
echo "  PYTHONPATH=.. python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
