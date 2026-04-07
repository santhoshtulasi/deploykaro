import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
import os

# Set dummy env vars for testing
os.environ["NVIDIA_USE_MOCK"] = "true"
os.environ["NVIDIA_BASE_URL"] = "http://localhost:8000"
os.environ["NVIDIA_API_KEY"] = "fake-key"

@pytest.mark.asyncio
async def test_handle_mentor_chat_streaming():
    """Test that the chat endpoint returns a streaming response."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "persona": "buddy-english",
            "message": "What is Docker?",
            "history": [],
            "context": {
                "cloud_context": "AWS",
                "architect_mode": False
            }
        }
        response = await ac.post("/mentor/chat", json=payload)
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream"

@pytest.mark.asyncio
async def test_persona_fallback():
    """Test that it defaults to buddy-english if persona is unknown."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "persona": "non-existent-persona",
            "message": "Hello",
            "history": [],
            "context": {
                "cloud_context": "General",
                "architect_mode": False
            }
        }
        response = await ac.post("/mentor/chat", json=payload)
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream"
