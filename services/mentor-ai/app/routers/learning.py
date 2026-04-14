import os
import json
import re
from fastapi import APIRouter
from openai import AsyncOpenAI
from app.services.repo_analyzer import RepoAnalyzer

from app.models.learning import LearningPlanRequest, LearningPlanResponse

router = APIRouter(prefix="/learning", tags=["learning"])

client = AsyncOpenAI(
    base_url=os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"),
    api_key=os.environ.get("NVIDIA_API_KEY", "missing_key")
)

# ── Language Map ──────────────────────────────────────────────────────────────

LANGUAGE_INSTRUCTIONS = {
    "tamil":   "Explain jargon analogies in Tamil/Tanglish (mix of Tamil words + English). Use everyday Tamil comparisons.",
    "kannada": "Explain jargon analogies in Kannada/Kanglish. Use everyday Kannada comparisons.",
    "telugu":  "Explain jargon analogies in Telugu/Tenglish. Use everyday Telugu comparisons.",
    "english": "Explain jargon analogies in simple, everyday English. No technical assumption.",
}

# ── System Prompt ─────────────────────────────────────────────────────────────

LEARNING_PLAN_PROMPT = """
You are a Staff DevOps Architect who is a Master Simplifier. 
You are the Lead Architect. You have been given the raw source code of an app. There is NO existing deployment infra. Based ONLY on the frameworks and dependencies identified, design a professional, scalable deployment plan.
If the code is a microservice city (polyglot), design a complete orchestration cluster (EKS/ECS) even if it's not present in the repo.
Your goal: explain a complex cloud deployment to a 10-year-old child, while maintaining senior-level architectural precision.

STRICT RULES:
1. MASTER SIMPLIFIER STYLE: Every summary and step description MUST use a daily-life analogy (Lego, Pizza shop, Cricket, Magic Treehouse, etc.). No exceptions.
2. NO TECHNICAL JARGON: Never use a technical term (like 'VPC', 'Ingress', 'Pod') without immediately explaining it using a toy or daily object analogy.
3. Logical Order: Infra first → Config → Build → Deploy → Verify.
4. Professional Command Accuracy: Commands and configurations must be 100% accurate and runnable.
5. Preamble-Free: Output only valid JSON. No "Sure, here is your plan."
6. Experience Levels:
   - Beginner: Extreme focus on analogies. 1 analogy per sentence.
   - Intermediate/Senior: Concise, but still maintain the "Master Simplifier" tone.

JARGON DETECTION — FOR EVERY STEP:
Identify acronyms (SSL, VPC, MTTR, etc.) and add them to jargon_terms with:
- term: the technical word
- plain_meaning: what it does in 1 very simple sentence
- analogy: a real-world object comparison (e.g. 'Like a locked cookie jar')

Output ONLY valid JSON — no markdown, no preamble:
{
  "project_title": "String — verb + tech + cloud, e.g. 'Deploy FastAPI on EKS with Docker'",
  "architecture_summary": "String — 2 sentences: what it deploys and why this stack.",
  "steps": [
    {
      "step_number": 1,
      "title": "String — verb-first, e.g. 'Configure VPC and Subnets'",
      "description": "String — WHY this step exists (1 sentence) + HOW it works (1 sentence for beginner). Zero filler.",
      "actionable_command": "String — exact runnable CLI/config. Newline-separated for multiple commands. null if not applicable.",
      "tools_used": ["only tools appearing in this step's command"],
      "jargon_terms": [
        {
          "term": "VPC",
          "plain_meaning": "A private, isolated section of the cloud where your app runs — like a gated apartment complex.",
          "analogy": "Like renting a private floor in an apartment building — other tenants exist but can't walk into your floor."
        }
      ]
    }
  ]
}
"""

# ── Curated offline jargon dictionary (fallback when AI is offline) ────────────

JARGON_DICT = {
    "SSL":    ("Encrypts data sent between your app and the user's browser so nobody can read it in transit.", "Like a sealed, tamper-proof envelope — only the receiver can open it."),
    "TLS":    ("The modern, stronger version of SSL — same idea, better security.", "SSL upgraded, like switching from a padlock to a digital fingerprint lock."),
    "HA":     ("High Availability — designing your system so it keeps running even if one server crashes.", "Like a hospital with backup generators — the lights never go out."),
    "MTTR":   ("Mean Time To Recover — how long on average it takes to fix a broken system.", "If your app crashes and takes 10 minutes to restart, your MTTR is 10 minutes."),
    "RTO":    ("Recovery Time Objective — the maximum downtime you're willing to accept after a disaster.", "You set a rule: 'If something breaks, we must be back in 1 hour.' That's RTO."),
    "RPO":    ("Recovery Point Objective — how much data you're willing to lose after a failure (measured in time).", "If your RPO is 1 hour, you back up every hour. You might lose up to 1 hour of data."),
    "VPC":    ("A private, isolated network inside the cloud where only your app's traffic can flow.", "Like having a private road inside a public city — only your vehicles use it."),
    "IAM":    ("Identity and Access Management — controls who/what can access your cloud resources.", "Like a building keycard system — each person (or app) only opens the doors they're allowed to."),
    "DNS":    ("Domain Name System — translates human-readable names like 'myapp.com' into IP addresses.", "Like a phonebook — you look up a name and get the phone number."),
    "CIDR":   ("A shorthand notation for defining a range of IP addresses, e.g. 10.0.0.0/24.", "Like saying 'all apartments on floor 10' instead of listing every room number."),
    "Pod":    ("The smallest deployable unit in Kubernetes — wraps one or more containers.", "Like a single tiffin box carrying your app. Kubernetes manages thousands of tiffin boxes."),
    "ingress":("A Kubernetes resource that routes external web traffic to the right services inside the cluster.", "Like a hotel receptionist who directs guests to the right room."),
    "load balancer": ("Distributes incoming traffic across multiple servers so no single server gets overwhelmed.", "Like a cashier manager in a supermarket who opens new counters when the lines get long."),
    "orchestration": ("Automatically managing, scheduling, and coordinating many containers/services.", "Like a conductor of an orchestra — tells each musician when to play, at what speed, no one falls out of sync."),
    "canary": ("Sending a small % of real traffic to the new version before rolling it out to everyone.", "Like testing a new menu item with 5 tables before changing the whole restaurant menu."),
    "replica": ("An identical copy of a service running in parallel for reliability and speed.", "Like having two cashiers at a grocery store — if one is busy, the other handles your queue."),
    "SLO":    ("Service Level Objective — an internal target, e.g. '99.9% uptime this month'.", "Your team's promise to itself: 'Our app must be up 99.9% of the time.'"),
    "SLA":    ("Service Level Agreement — a contract with customers promising a minimum quality of service.", "The promise you make TO your customers — if you break it, you may owe a refund."),
    "SLI":    ("Service Level Indicator — the actual metric you measure to check if you're hitting your SLO.", "The speedometer reading — SLO is the speed limit, SLI is how fast you're actually going."),
    "latency": ("The time it takes for a request to travel from the user to your server and back.", "How long it takes from the moment you press 'Order' to seeing 'Order Confirmed'."),
    "throughput": ("How many requests your system can handle per second.", "How many customers a restaurant can serve per hour."),
    "idempotent": ("An operation that produces the same result no matter how many times you run it.", "Like pressing a lift button — pressing it 5 times doesn't make it go faster or arrive 5 times."),
    "immutable infrastructure": ("Never modifying servers after deployment — always replace, never patch.", "Like ordering a fresh pizza instead of trying to fix a cold one."),
    "circuit breaker": ("A pattern that stops calling a failing service so the failure doesn't cascade.", "Like a power surge protector — if voltage spikes, it cuts the circuit before your devices fry."),
    "namespace": ("A logical partition inside Kubernetes to separate resources by team or environment.", "Like separate floors in an office building — Finance and Engineering share the same building but don't mix."),
    "service mesh": ("A dedicated infrastructure layer that handles service-to-service communication — retries, timeouts, tracing.", "Like a private postal system inside your company — handles routing, delivery tracking, and failures automatically."),
    "observability": ("How well you can understand your system's internal state from its outputs — logs, metrics, traces.", "Like a cockpit dashboard — all the dials and indicators that tell the pilot what's happening inside the plane."),
    "autoscaling": ("Automatically adding or removing servers based on traffic demand.", "Like a call centre that hires extra agents during peak hours and sends them home when it's quiet."),
    "rolling update": ("Updating servers one-by-one so the app stays available during the update.", "Like replacing a wheel on a moving train — one at a time, the train never stops."),
    "blue-green deployment": ("Running two identical environments — switch traffic from old (blue) to new (green) instantly.", "Like having two stages at a concert — audience watches one while the other sets up the next act."),
    "fault tolerance": ("The system's ability to keep working even when components fail.", "Like a plane with multiple engines — losing one engine doesn't crash the plane."),
    "sharding": ("Splitting a database into smaller pieces distributed across multiple servers.", "Like splitting a phone directory into A–M and N–Z books so each is lighter and faster to search."),
    "replication": ("Keeping copies of data on multiple servers so it's never lost if one fails.", "Like saving your essay on both your laptop AND USB drive."),
    "sidecar": ("A helper container that runs alongside the main container, handling tasks like logging or security.", "Like a personal assistant who handles all the admin work so the CEO focuses only on decisions."),
}

# ── /plan — Generate deployment plan ─────────────────────────────────────────

@router.post("/plan", response_model=LearningPlanResponse)
async def generate_learning_plan(req: LearningPlanRequest):
    target_model = os.environ.get("NVIDIA_MENTOR_MODEL", "meta/llama-3.1-405b-instruct")
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(req.language.lower(), LANGUAGE_INSTRUCTIONS["english"])

    # 1. Analyze Repo Context if URL provided
    repo_context = ""
    if req.repo_url:
        analysis = await RepoAnalyzer.get_repo_context(req.repo_url)
        if analysis.get("project_name"):
            repo_context = (
                f"\n--- REPOSITORY CONTEXT ---\n"
                f"Project Name: {analysis['project_name']}\n"
                f"Detected Tech: {analysis['detected_tech']}\n"
                f"Description: {analysis['description']}\n"
                f"README Snippet: {analysis['readme_snippet']}\n"
                f"Has Docker: {analysis['has_docker']}\n"
            )

    user_prompt = (
        f"Deploy this: {req.app_type}\n"
        f"Cloud: {req.cloud_provider}\n"
        f"Tools requested: {', '.join(req.tools) if req.tools else 'your best recommendation'}\n"
        f"User experience level: {req.experience_level}\n"
        f"Language for analogies: {req.language} — {lang_instruction}\n"
        f"{repo_context}\n\n"
        f"IMPORTANT: You are a Master Simplifier. Explain this architecture like I am 10. "
        f"Use amazing analogies for every technical concept. "
        f"Output ONLY valid JSON."
    )

    try:
        response = await client.chat.completions.create(
            model=target_model,
            messages=[
                {"role": "system", "content": LEARNING_PLAN_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=3000,
        )

        content = response.choices[0].message.content
        json_match = re.search(r"```(?:json)?\s*\n(.*?)\n\s*```", content, re.DOTALL)
        if json_match:
            content = json_match.group(1)

        data = json.loads(content)

        # Enrich steps with curated jargon if AI missed any
        for step in data.get("steps", []):
            existing_terms = {t["term"].lower() for t in step.get("jargon_terms", [])}
            text = (step.get("title", "") + " " + step.get("description", "")).lower()
            for term, (meaning, analogy) in JARGON_DICT.items():
                if term.lower() in text and term.lower() not in existing_terms:
                    step.setdefault("jargon_terms", []).append({
                        "term": term,
                        "plain_meaning": meaning,
                        "analogy": analogy
                    })

        return LearningPlanResponse(**data)

    except Exception as e:
        print(f"Error generating plan: {e}")
        # Rich offline fallback with jargon examples
        return LearningPlanResponse(
            project_title=f"Deploy {req.app_type} on {req.cloud_provider}",
            architecture_summary=f"Containerise {req.app_type} with Docker, push to a registry, and deploy to {req.cloud_provider}. This stack gives you repeatable, scalable deployments without cloud vendor lock-in.",
            steps=[
                {
                    "step_number": 1,
                    "title": "Configure Cloud Credentials",
                    "description": "Without credentials, no tool can talk to your cloud account. This sets up the authentication layer.",
                    "actionable_command": "aws configure\n# Enter your Access Key ID, Secret, Region (e.g. ap-south-1)",
                    "tools_used": [req.cloud_provider],
                    "jargon_terms": [
                        {"term": "IAM", "plain_meaning": JARGON_DICT["IAM"][0], "analogy": JARGON_DICT["IAM"][1]}
                    ]
                },
                {
                    "step_number": 2,
                    "title": "Write Your Dockerfile",
                    "description": "A Dockerfile is the recipe that packages your app into a portable container. Without it, the app only runs on your machine.",
                    "actionable_command": "# Create Dockerfile in your project root\nFROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
                    "tools_used": ["Docker"],
                    "jargon_terms": []
                },
                {
                    "step_number": 3,
                    "title": "Build and Push Docker Image",
                    "description": "Build the container image locally, then push it to a registry so the cloud can pull it.",
                    "actionable_command": "docker build -t my-app:v1 .\ndocker tag my-app:v1 <your-ecr-url>/my-app:v1\ndocker push <your-ecr-url>/my-app:v1",
                    "tools_used": ["Docker"],
                    "jargon_terms": []
                },
                {
                    "step_number": 4,
                    "title": "Deploy to Cloud and Expose with Load Balancer",
                    "description": "Run the container on the cloud and put a load balancer in front so users can reach it via a URL.",
                    "actionable_command": "kubectl apply -f deployment.yaml\nkubectl expose deployment my-app --type=LoadBalancer --port=80 --target-port=8000",
                    "tools_used": ["Kubernetes"],
                    "jargon_terms": [
                        {"term": "load balancer", "plain_meaning": JARGON_DICT["load balancer"][0], "analogy": JARGON_DICT["load balancer"][1]},
                        {"term": "replica", "plain_meaning": JARGON_DICT["replica"][0], "analogy": JARGON_DICT["replica"][1]}
                    ]
                },
                {
                    "step_number": 5,
                    "title": "Verify Deployment is Healthy",
                    "description": "Confirm pods are running and the app responds to requests before calling it done.",
                    "actionable_command": "kubectl get pods\nkubectl get svc\ncurl http://<EXTERNAL-IP>/health",
                    "tools_used": ["Kubernetes"],
                    "jargon_terms": [
                        {"term": "Pod", "plain_meaning": JARGON_DICT["Pod"][0], "analogy": JARGON_DICT["Pod"][1]}
                    ]
                },
            ]
        )


# ── /explain — Explain any technical term ────────────────────────────────────

from fastapi import Query
from pydantic import BaseModel

class ExplainResponse(BaseModel):
    term: str
    plain_meaning: str
    analogy: str
    in_language: str

@router.get("/explain", response_model=ExplainResponse)
async def explain_term(
    term: str = Query(..., description="The technical term to explain"),
    language: str = Query("english", description="Language for the analogy: english, tamil, kannada, telugu")
):
    """Explain any DevOps/MLOps jargon term in plain language with a real-world analogy."""
    # Check curated dictionary first (instant, no API call)
    for key, (meaning, analogy) in JARGON_DICT.items():
        if key.lower() == term.lower():
            return ExplainResponse(term=term, plain_meaning=meaning, analogy=analogy, in_language=language)

    # Fall back to LLM for unknown terms
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language.lower(), LANGUAGE_INSTRUCTIONS["english"])
    target_model = os.environ.get("NVIDIA_MENTOR_MODEL", "meta/llama-3.1-405b-instruct")

    try:
        response = await client.chat.completions.create(
            model=target_model,
            messages=[
                {"role": "system", "content": f"You are a DevOps/MLOps teacher. {lang_instruction} Always respond with plain JSON only: {{\"plain_meaning\": \"...\", \"analogy\": \"...\"}}"},
                {"role": "user", "content": f"Explain the technical term '{term}' in DevOps/MLOps context. Give a plain_meaning (1 sentence, no jargon) and an analogy using everyday objects or situations. JSON only."}
            ],
            temperature=0.3,
            max_tokens=200,
        )
        content = response.choices[0].message.content
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        data = json.loads(json_match.group(0) if json_match else content)
        return ExplainResponse(term=term, plain_meaning=data["plain_meaning"], analogy=data["analogy"], in_language=language)
    except Exception:
        return ExplainResponse(
            term=term,
            plain_meaning=f"'{term}' is a technical concept in DevOps/MLOps. Ask your mentor for a detailed explanation.",
            analogy="No analogy available offline.",
            in_language=language
        )
