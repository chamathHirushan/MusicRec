#!/bin/bash

# Start both FastAPI apps on different ports
uvicorn main:app --host 0.0.0.0 --port 8000 &  # run in background
uvicorn mlapi:app --host 0.0.0.0 --port 8001   # run in foreground
