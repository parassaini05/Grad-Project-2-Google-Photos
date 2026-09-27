#!/bin/bash

# Database is pre-populated via Git

# Start the scheduler in the background (for future updates)
python scheduler.py &

# Start the FastAPI backend
# Fallback to port 8000 if PORT is not set by the environment
uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
