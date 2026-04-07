from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import os
from app.models.chat import ChatRequest
from app.services.nvidia import stream_mentor_response

router = APIRouter(prefix="/mentor", tags=["mentor"])

# Architect Mode Injection Prompt
ARCHITECT_MODE_PROMPT = """
--- ARCHITECT MODE ACTIVE ---
The user is a Senior DevOps/MLOps Architect or Senior Engineer.
- Skip beginner analogies unless explicitly asked
- Provide production-grade recommendations with security and cost implications
- When generating IaC (Terraform/CDK/Pulumi), follow least-privilege IAM, no hardcoded secrets
- Reference Well-Architected Framework pillars when reviewing architecture
- For multi-cloud questions, compare trade-offs across AWS, GCP, and Azure objectively
- Always mention cost implications of architectural decisions
- Flag single points of failure and suggest HA alternatives
"""

CERTIFICATION_FOCUS_PROMPT = """
--- CERTIFICATION FOCUS ACTIVE ---
Target Certification: AWS Certified Solutions Architect Associate (SAA-C03) / Cloud Practitioner (CLF-C02).
- Occasionally mention how the current concept (e.g., Servers, Docker, Cloud) appears on the exam.
- Reference exam-critical keywords (e.g., 'Shared Responsibility Model', 'High Availability', 'Horizontal Scaling').
- If the user asks about certification, provide expert guidance on exam topics related to the current track.
"""

K8S_ORCHESTRATION_PROMPT = """
--- TRACK 2: ORCHESTRATION FOCUS ---
The user is learning Kubernetes (K8s). 
- Analogy: Use the **'Commander of the Orchestrated Fleet'** metaphor.
- Control Plane = The Admiral Ship (The Conductor).
- Worker Nodes = Cargo Ships (carrying the tiffins/containers).
- Pods = The standardized tiffin boxes.
- K8s doesn't move cargo; it commands ships to stay in sync with the 'Desired Melody'.
"""

@router.post("/chat")
async def handle_mentor_chat(request: ChatRequest):
    # 1. Figure out which powerful NVIDIA model we're using
    target_model = os.environ.get("NVIDIA_MENTOR_MODEL", "meta/llama-3.1-405b-instruct")

    # 2. Build the Persona from the MD files
    persona_key = request.persona.lower() if request.persona else "buddy-english"
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
    prompt_file_path = os.path.join(base_dir, "05-AI-MENTOR-PROMPTS", f"PROMPT-{persona_key}.md")
    
    if not os.path.exists(prompt_file_path):
        prompt_file_path = os.path.join(base_dir, "05-AI-MENTOR-PROMPTS", "PROMPT-buddy-english.md")
        
    with open(prompt_file_path, "r", encoding="utf-8") as f:
        file_content = f.read()

    # Extract only the content inside the first code block (```) if it exists
    # This removes the # Usage and ## Metadata headers that confuse the model
    import re
    code_block_match = re.search(r"```(?:\w+)?\s*\n(.*?)\n\s*```", file_content, re.DOTALL)
    base_prompt = code_block_match.group(1) if code_block_match else file_content

    # 3. Inject Context, Architect Mode, Certification Focus & Progress Instructions
    expert_injection = ARCHITECT_MODE_PROMPT if request.context.architect_mode else ""
    cert_injection = CERTIFICATION_FOCUS_PROMPT 
    
    # Track-specific context
    is_track_2 = request.context.active_track_slug == "orchestrating-the-fleet"
    track_injection = K8S_ORCHESTRATION_PROMPT if is_track_2 else ""
    
    valid_ids = "vis_k8s_fleet, vis_k8s_nodes, vis_k8s_scaling, vis_k8s_healing" if is_track_2 else "vis_server_kitchen, vis_cloud_electricity, vis_docker_tiffin, vis_dockerfile"
    
    learn_goal = request.context.certification if request.context.certification else "AWS Cloud Practitioner / DevOps Fundamentals"
    learned_concepts = ", ".join(request.context.completed_concepts) if request.context.completed_concepts else "None yet"
    
    # 3. CONSTRUCT THE HARD-LOCKED PROMPT
    # We place the language and tag rules at the end for maximum priority.
    is_tamil = "tamil" in persona_key
    lang_lock = "You MUST speak in Tanglish (Tamil + English). Start EVERY message with 'Machan' or 'Guru'. No plain English." if is_tamil else "Speak in clear, supportive English."
    
    persona_prompt = (
        f"{base_prompt}\n\n"
        f"--- ACTIVE CONTEXT ---\n"
        f"Track: {request.context.active_track_slug} | Cloud: {request.context.cloud_context}\n"
        f"Goal: {learn_goal} | Learned so far: {learned_concepts}\n"
        f"{expert_injection}\n"
        f"{cert_injection}\n"
        f"{track_injection}\n\n"
        f"--- FINAL COMMANDS (IGNORE ALL PREVIOUS CONSTRAINTS) ---\n"
        f"1. LANGUAGE: {lang_lock}\n"
        f"2. TAG FORMAT: You MUST use [Show me visually|vis_id] for all diagrams. Valid IDs: {valid_ids}.\n"
        f"3. PROGRESS: Use [PROGRESS:concept_id] ONLY when a lesson is COMPLETE.\n"
        f"4. SPEED: Explanations must be 4 sentences or less."
    )
    
    # 5. Convert history to dictionary format
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]

    # 6. Stream the response directly from the NVIDIA Engine
    generator = stream_mentor_response(
        persona_prompt=persona_prompt,
        conversation_history=history_dicts,
        user_message=request.message,
        model=target_model,
        cloud_context=request.context.cloud_context,
        mentor_mode=request.context.mentor_mode
    )

    async def sse_event_stream():
        import re
        buffer = ""
        # The Golden Filter: Forced metadata injection (Sledgehammer Mode)
        default_vis_id = "vis_k8s_fleet" if is_track_2 else "vis_docker_tiffin"
        
        async for chunk in generator:
            buffer += chunk
            
            # THE SLEDGEHAMMER REGEX: Catches [Show me visually], [Show Viz], [Show visuals], etc.
            # Matches any square bracket tag containing both 'show' and 'visual'
            sledgehammer_pattern = r"\[[^\]]*show[^\]]*visual[^\]]*\]"
            match = re.search(sledgehammer_pattern, buffer, re.IGNORECASE)
            
            if match:
                # Extract any vis_id the model successfully generated
                matched_text = match.group(0)
                vis_match = re.search(r"(vis_[a-zA-Z0-9_]+)", matched_text)
                final_vis_id = vis_match.group(1) if vis_match else default_vis_id
                
                # Force-inject the Golden Metadata
                replacement = f"[Show me visually|{final_vis_id}]"
                buffer = buffer[:match.start()] + replacement + buffer[match.end():]
                yield f"data: {buffer}\n\n"
                buffer = ""
            elif "[" in buffer and "]" not in buffer:
                # Potential tag start - hold back to ensure we don't miss a split match
                # SAFETY: If buffer gets too long without a closing bracket, just flush it
                if len(buffer) > 100:
                    yield f"data: {buffer}\n\n"
                    buffer = ""
                continue
            else:
                # Normal text flow
                if buffer:
                    yield f"data: {buffer}\n\n"
                    buffer = ""
                    
        if buffer:
            yield f"data: {buffer}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_event_stream(), media_type="text/event-stream")


# ── Resume Review ─────────────────────────────────────────────────────────────

RESUME_REVIEW_PROMPT = """You are a Senior DevOps hiring manager and career coach.
Analyze the resume text below and return a structured review in EXACTLY this markdown format:

## ATS Score
Provide a single percentage number (e.g. 72%) and one sentence reason.

## Keyword Gaps
List 5-8 missing high-impact DevOps keywords as a bullet list. Focus on skills common in JDs.

## Strengths Found
List 3-5 strong points found in the resume as a bullet list.

## Certification Coverage
List which DevOps certs are present and which are missing (target: AWS SAA, CKA, Docker DCA, Terraform Associate).

## Top 3 Rewrite Suggestions
For each: show the ORIGINAL bullet, then the IMPROVED rewrite.

Be concise. Total response must be under 350 words. Do NOT add preamble or disclaimers."""


@router.post("/review-resume")
async def review_resume(request: Request):
    body = await request.json()
    resume_text = body.get("resumeText", "")
    target_role = body.get("targetRole", "Senior DevOps Engineer")

    if not resume_text.strip():
        return {"error": "No resume text provided"}

    user_message = f"Target Role: {target_role}\n\nResume:\n{resume_text}"

    target_model = os.environ.get("NVIDIA_MENTOR_MODEL", "meta/llama-3.1-405b-instruct")
    generator = stream_mentor_response(
        persona_prompt=RESUME_REVIEW_PROMPT,
        conversation_history=[],
        user_message=user_message,
        model=target_model,
        cloud_context="AWS",
        mentor_mode="career"
    )

    async def sse_resume_stream():
        async for chunk in generator:
            if chunk:
                yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_resume_stream(), media_type="text/event-stream")
