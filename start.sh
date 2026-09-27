#!/bin/bash

# Pre-populate ChromaDB with the existing processed data (so the app works immediately)
python phase3_storage.py

# Start the scheduler in the background (for future updates)
python scheduler.py &

# Start the FastAPI backend
# Fallback to port 8000 if PORT is not set by the environment
uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
