import asyncio
from httpx import AsyncClient
from app.main import app
import os
import os.path

os.environ["NVIDIA_USE_MOCK"] = "true"

async def run_test():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "persona": "buddy-english",
            "message": "What is Docker?",
            "history": [],
            "context": {
                "cloud_context": "AWS",
                "architect_mode": False
            }
        }
        try:
            response = await ac.post("/mentor/chat", json=payload)
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {response.headers.get('content-type')}")
            if response.status_code != 200:
                print(f"Error Body: {response.text}")
        except Exception as e:
            print(f"Caught Exception: {str(e)}")

if __name__ == '__main__':
    asyncio.run(run_test())
