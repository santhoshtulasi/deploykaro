from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load the secret keys from the root folder
load_dotenv(dotenv_path="../../.env.local", override=True)

from app.routers import mentor, interview, learning

app = FastAPI(
    title="DeployKaro AI Mentor 🧠",
    description="The brain powering ANNA, BHAI, and DIDI",
    version="1.0.0"
)

# Allow the frontend to talk
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the new AI logic!
app.include_router(mentor.router)
app.include_router(interview.router)
app.include_router(learning.router)

# A simple response when someone hits Port 8000
@app.get("/")
def read_root():
    return {
        "service": "DeployKaro AI Mentor 🧠",
        "status": "Awake and Ready",
        "models_loaded": ["NVIDIA NIM Llama-3.1"]
    }
