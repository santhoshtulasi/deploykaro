---
name: mentor-ai-dev
description: How to develop, run, and debug the FastAPI Python backend for Mentor AI.
---

## Overview

The Mentor AI service is built with **FastAPI** and **Python 3.11+**. It handles AI inference, the RAG pipeline, and streaming chat responses.

- **Location:** `d:\deploykaro\services\mentor-ai\`
- **Dev URL:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **Package manager:** pip (requirements.txt)

## Environment Setup

You need to establish a virtual environment for Python before you start working on it natively:

```bash
cd d:\deploykaro\services\mentor-ai
python -m venv venv
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Mac/Linux
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

## Running the Service Locally

```bash
cd d:\deploykaro\services\mentor-ai
uvicorn app.main:app --reload --port 8000
```
> The `--reload` flag auto-restarts the server when you save code changes.

## Running Tests

DeployKaro uses `pytest` for the FastAPI service:

```bash
cd d:\deploykaro\services\mentor-ai
python -m pytest tests\ -v
```

## Common Debugging & Issues

### "ModuleNotFoundError: No module named 'app'"
This happens if you run pytest from the wrong directory. Always ensure you are in the `services/mentor-ai` folder when executing tests or uvicorn.

### Uvicorn port already in use (8000)
If you get an error that port 8000 is taken, find the process ID (PID) and kill it, or use a different port `uvicorn app.main:app --reload --port 8001`.

### Missing Environment Variables
If the API fails to connect to NVIDIA NIM, verify your `.env.local` contains `NVIDIA_API_KEY`. The FastAPI service reads this file directly.

### Type Hints and Pydantic
FastAPI relies heavily on Pydantic for request validation. If an endpoint returns `422 Unprocessable Entity`, check the request body against the defined models in `app/models/`.
