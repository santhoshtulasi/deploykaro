"""
Interview Router — DeployKaro Mentor AI
Endpoints: POST /interview/start, POST /interview/answer, GET /interview/summary/{session_id}

Domain-separated: every session is tagged as "DevOps" or "MLOps".
Questions are fetched from the Content Service (/v1/interview/*).
Falls back to hardcoded offline questions if Content Service is unavailable.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import httpx
import os
import json
import re
from openai import AsyncOpenAI

router = APIRouter(prefix="/interview", tags=["Interview"])

CONTENT_SERVICE_URL = os.getenv("CONTENT_SERVICE_URL", "http://localhost:3001")

# ─── Schemas ──────────────────────────────────────────────────────────────────

class StartInterviewRequest(BaseModel):
    user_id: str
    domain: str            # "DevOps" | "MLOps" — REQUIRED, never mixed
    experience_level: str  # beginner | intermediate | senior
    duration_min: int      # 10 | 30 | 60


class QuestionOut(BaseModel):
    id: int
    question: str
    category: str
    difficulty: str
    domain: str


class StartInterviewResponse(BaseModel):
    session_id: str
    domain: str
    questions: List[QuestionOut]
    total_questions: int
    duration_min: int


class AnswerRequest(BaseModel):
    session_id: str
    question_id: int
    answer_text: str
    question_text: str = ""   # passed by frontend for model-answer lookup


class AnswerResponse(BaseModel):
    debrief_rating: str   # excellent | good | needs_work
    debrief_badge: str    # emoji badge
    feedback: str
    model_answer: str     # always returned — ideal answer for learning


class SummaryResponse(BaseModel):
    session_id: str
    domain: str
    total_questions: int
    answered: int
    rating_counts: Dict[str, int]
    score_pct: float
    feedback_summary: str


# ─── Offline Fallback Questions ────────────────────────────────────────────────

OFFLINE_DEVOPS = [
    {"id": 1001, "question": "Walk me through how you would design a zero-downtime deployment pipeline for a Node.js API.", "category": "CI/CD", "difficulty": "hard", "domain": "DevOps"},
    {"id": 1002, "question": "A pod is stuck in CrashLoopBackOff in production. What are your first 3 commands?", "category": "Kubernetes", "difficulty": "hard", "domain": "DevOps"},
    {"id": 1003, "question": "Your Terraform state is corrupted. How do you recover without destroying production?", "category": "Terraform", "difficulty": "hard", "domain": "DevOps"},
    {"id": 1004, "question": "Explain how you would implement a canary deployment on Kubernetes.", "category": "Kubernetes", "difficulty": "hard", "domain": "DevOps"},
    {"id": 1005, "question": "How do you implement GitOps with ArgoCD? Walk through the full flow.", "category": "GitOps", "difficulty": "medium", "domain": "DevOps"},
    {"id": 1006, "question": "Your S3 bucket just became public. What do you do in the next 10 minutes?", "category": "Security", "difficulty": "hard", "domain": "DevOps"},
    {"id": 1007, "question": "Design a multi-region DR strategy for an RDS database with 15 min RPO.", "category": "AWS", "difficulty": "hard", "domain": "DevOps"},
    {"id": 1008, "question": "Explain the three pillars of observability and which tools you use for each.", "category": "Observability", "difficulty": "easy", "domain": "DevOps"},
    {"id": 1009, "question": "A GitHub Actions pipeline is flaky and fails 30% of the time. How do you fix it?", "category": "CI/CD", "difficulty": "medium", "domain": "DevOps"},
    {"id": 1010, "question": "What is a Kubernetes PodDisruptionBudget and when do you need one?", "category": "Kubernetes", "difficulty": "hard", "domain": "DevOps"},
]

OFFLINE_MLOPS = [
    {"id": 2001, "question": "What is model drift and how do you detect it in an ML system?", "category": "Monitoring & Drift", "difficulty": "medium", "domain": "MLOps"},
    {"id": 2002, "question": "Design the CI/CD pipeline for training and deploying an ML model.", "category": "ML Pipelines", "difficulty": "hard", "domain": "MLOps"},
    {"id": 2003, "question": "What is the difference between batch inference and real-time inference? Give tradeoffs.", "category": "MLOps Fundamentals", "difficulty": "medium", "domain": "MLOps"},
    {"id": 2004, "question": "How do you containerize a PyTorch model for production serving?", "category": "Tools & Ecosystem", "difficulty": "medium", "domain": "MLOps"},
    {"id": 2005, "question": "Your model's accuracy dropped by 8% after 3 weeks in production. Walk me through your response.", "category": "Monitoring & Drift", "difficulty": "hard", "domain": "MLOps"},
    {"id": 2006, "question": "How do you design a feature store for ML? What problems does it solve?", "category": "System Design", "difficulty": "hard", "domain": "MLOps"},
    {"id": 2007, "question": "What is Continuous Training (CT) in MLOps and when should you trigger a retrain?", "category": "MLOps Fundamentals", "difficulty": "hard", "domain": "MLOps"},
    {"id": 2008, "question": "How do you ensure reproducibility of ML experiments across environments?", "category": "Data & Reproducibility", "difficulty": "easy", "domain": "MLOps"},
    {"id": 2009, "question": "Explain canary deployment for ML — how do you safely roll out a new model version?", "category": "Deployment Strategies", "difficulty": "medium", "domain": "MLOps"},
    {"id": 2010, "question": "How do you use MLflow for experiment tracking and model registry? Walk through the workflow.", "category": "Tools & Ecosystem", "difficulty": "medium", "domain": "MLOps"},
]


# ─── Model Answers ────────────────────────────────────────────────────────────
# Keyed by lowercase keywords found in the question text.
# First match wins. Used for learning reinforcement.

def _offline_questions(domain: str, count: int) -> List[Dict]:
    source = OFFLINE_MLOPS if domain == "MLOps" else OFFLINE_DEVOPS
    import random
    selected = random.sample(source, min(count, len(source)))
    return selected

MODEL_ANSWERS: list[tuple[str, str]] = [
    # ── DevOps: CI/CD ───────────────────────────────────────────────────────────
    ("zero-downtime deployment pipeline", "I'd use blue-green or rolling deployments. The pipeline stages: lint → unit tests → build Docker image → integration tests → deploy to staging → smoke tests → shift traffic (canary 10% → 100%) → monitor error rate for 5 min → auto-rollback if p99 latency spikes. Feature flags gate risky changes."),
    ("blue-green deployment", "Blue-green maintains two identical prod environments. New code ships to 'green', while 'blue' is live. After green passes smoke tests, the load balancer flips traffic (1 DNS change or ALB target group swap). Rollback = flip back. Zero downtime, instant rollback, but doubles infrastructure cost temporarily."),
    ("canary deployment", "Route a small % of traffic (e.g., 5%) to the new version using weighted target groups in ALB or Kubernetes Argo Rollouts. Monitor error rates, latency, and business metrics for 15–30 min. If healthy, increment to 25% → 50% → 100%. Rollback by setting weight to 0."),
    ("rollback strategy","For Kubernetes: `kubectl rollout undo deployment/<name>`. For blue-green: flip the load balancer back. For Helm: `helm rollback <release> <revision>`. Always keep the previous Docker image pinned and test rollback in staging regularly."),
    ("github actions workflow.*45 minutes", "Identify bottlenecks with `--debug` logs. Common fixes: cache npm/pip/docker layers with `actions/cache`, parallelize test jobs using `matrix`, use Docker layer caching with `--cache-from`, skip unnecessary jobs with `if:` conditions, and switch heavy test steps to self-hosted runners."),
    ("feature flags", "Feature flags decouple deployment from release. Use LaunchDarkly or a simple Redis-backed toggle. Deploy the new code behind `if (flags.myFeature)`, then enable per user segment without a redeploy. They also enable kill switches for hotfixes and A/B testing."),
    ("gitflow strategy", "For 20 engineers: main (production), develop, feature/*, release/*, hotfix/*. Feature branches merge to develop via PRs. A release branch is cut when ready, tested, then merged to main and tagged. Hotfixes branch from main, merge back to both main and develop. Use branch protection rules and require 1 review."),
    ("secrets.*ci/cd", "Never hardcode secrets. Use the platform's secret store: GitHub Actions Secrets → GITHUB_ENV, AWS Secrets Manager for runtime secrets (accessed via IAM role, no key needed), Vault with AppRole auth for short-lived tokens. Rotate secrets on merge and audit access logs. Never print env vars in CI logs."),
    # ── DevOps: Docker ──────────────────────────────────────────────────────────
    ("docker image.*4gb", "Use multi-stage builds: stage 1 (builder) installs deps and compiles; stage 2 copies only the compiled artefact using a slim base (alpine or distroless). Also: .dockerignore to exclude node_modules/tests, use specific tags not `latest`, merge RUN commands to reduce layers."),
    ("multi-stage docker", "Stage 1 (builder): `FROM node:20 AS builder`, install deps, compile TypeScript. Stage 2: `FROM node:20-alpine`, copy only `dist/` and `node_modules` from builder. The final image has no compilers/dev deps. Typically shrinks images from 1.2 GB to under 200 MB."),
    ("container exits immediately", "Debug with `docker logs <id>`, then `docker run -it --entrypoint sh <image>` to inspect. Check: is the CMD process exiting 0? Is a required env var missing? Is the port already bound? Use `docker inspect` for exit code. Fix the entrypoint or add `tail -f /dev/null` temporarily for debugging."),
    ("containers as root", "Root in a container maps to UID 0 on the host if the namespace is broken. Fix: add `USER 1001` in Dockerfile, set `securityContext.runAsNonRoot: true` in Kubernetes, use `--read-only` filesystem, and drop all Linux capabilities except those needed (`capabilities.drop: [ALL]`)."),
    # ── DevOps: Kubernetes ──────────────────────────────────────────────────────
    ("crashloopbackoff", "Run: `kubectl describe pod <name>` (check Events), `kubectl logs <name> --previous` (last crash output). Common causes: missing env var/secret, failing readiness probe, OOM kill (check `lastState.reason`), wrong image tag. Fix the root cause, not just the restart policy."),
    ("hpa.*kubernetes", "HPA scales pods based on metrics (CPU, memory, or custom). `kubectl autoscale deployment <name> --cpu-percent=70 --min=2 --max=10`. Metrics Server must be installed. For custom metrics (e.g., request queue depth), use KEDA or Prometheus Adapter. Always set requests/limits so HPA has a denominator."),
    ("oomkilled", "OOMKilled means the container exceeded its memory limit. Fix: profile actual usage with `kubectl top pod`, set `requests.memory` to p95 usage and `limits.memory` to 1.5x that. Never set limits much higher than requests — it hides leaks. For JVM apps, set `-Xmx` to 80% of the limit."),
    ("node is notready", "Run: `kubectl describe node <name>` → check Conditions and Events. SSH to node, check: `systemctl status kubelet`, `journalctl -u kubelet -n 50`. Common causes: disk pressure (check `df -h`), network plugin crash, certificate expiry. Cordon → drain → fix → uncordon."),
    ("kubernetes rbac", "Create a ServiceAccount for the CI agent. Create a Role (namespace-scoped) with only `verbs: [get, list, create, update]` on `resources: [deployments, pods]`. Bind with RoleBinding. Test with `kubectl auth can-i create deployment --as=system:serviceaccount:<ns>:<sa>`. Never give ClusterAdmin to CI."),
    ("poddisruptionbudget", "PDB guarantees a minimum number of pods stay running during voluntary disruptions (node drains, rolling updates). Example: `minAvailable: 1` ensures at least 1 pod is up during a drain. Critical for stateful apps or services where going to 0 replicas would cause an outage."),
    ("helm chart.*debug", "Run `helm template <release> .` or `helm upgrade --dry-run --debug` to see rendered YAML. Check if `values.yaml` keys match the template references. Use `helm get values <release>` to see what's actually deployed. Validate schema with `helm lint`."),
    # ── DevOps: Terraform ────────────────────────────────────────────────────────
    ("terraform state.*locally", "Local state has no locking → two engineers can corrupt it simultaneously. No backup. Fix: use S3 backend with DynamoDB locking: `terraform { backend \"s3\" { bucket=\"...\", key=\"terraform.tfstate\", dynamodb_table=\"terraform-locks\" } }`. State is now shared, locked, versioned."),
    ("terraform.*rds.*replacement", "Add `lifecycle { prevent_destroy = true }` to the RDS resource. This causes `terraform apply` to error rather than destroy. Also run `terraform plan` in CI and require human approval for any `Plan: X to destroy`. Use `terraform state mv` to handle renames without replacements."),
    ("terraform import", "`terraform import aws_instance.web i-1234567` maps an existing cloud resource into the Terraform state file without re-creating it. Use when adopting manually-created infra into IaC. After import, run `terraform plan` — it should show no changes if your config matches reality."),
    ("terraform.*state corruption", "To prevent: use S3 + DynamoDB locking so only one `apply` runs at a time. If corrupt: restore from S3 versioned backup. Never edit `.tfstate` manually. Use `terraform state` subcommands (`mv`, `rm`, `pull`, `push`) for safe manipulation."),
    # ── DevOps: AWS ──────────────────────────────────────────────────────────────
    ("ec2 bill spiked", "Check Cost Explorer grouped by service and tag. Look for: runaway Lambda invocations, undeleted NAT gateways, S3 egress, forgotten dev instances. Set AWS Budgets alerts. Use Compute Optimizer for rightsizing. Enable Savings Plans or RIs for predictable workloads."),
    ("s3 bucket.*public", "Run: `aws s3api put-bucket-acl --bucket <name> --acl private`. Enable S3 Block Public Access at account level. Check CloudTrail for who changed it and when. Rotate any credentials that may have been exposed. Enable S3 Object Ownership and disable ACLs entirely going forward."),
    ("lambda.*timing out", "Add `X-Ray` tracing to find where time is spent. Check: cold start (use Provisioned Concurrency for latency-sensitive functions), downstream DB timeout (use RDS Proxy), or payload too large. Increase timeout in config, but fix root cause. Lambda max timeout is 15 min."),
    ("disaster recovery.*rds.*rpo", "For 15 min RPO: enable automated backups (retained 7 days) + transaction log backups every 5 min. Use Multi-AZ for instant failover (RTO ~60s). For cross-region: AWS Backup cross-region copy or RDS read replica → promote. Test restore quarterly."),
    ("iam.*least-privilege", "Create an IAM role for the application (no static keys). Attach a policy with only the specific S3 bucket ARN and DynamoDB table ARN needed. Use `aws:RequestedRegion` condition to restrict to one region. Use IAM Access Analyzer to verify no overly permissive policies. Rotate nothing — roles are keyless."),
    # ── DevOps: Observability ────────────────────────────────────────────────────
    ("three pillars of observability", "Logs: structured JSON logs → Loki/ELK. Metrics: time-series counters/gauges → Prometheus + Grafana. Traces: distributed request spans → Jaeger/Zipkin (via OpenTelemetry). The goal: from a Grafana alert, click through to traces to find the slow service, then to its logs to find the error."),
    ("sli.*slo.*sla", "SLI = the metric (e.g., % requests < 200ms). SLO = the target (e.g., 99.5% of requests < 200ms over 30d). SLA = contractual promise (e.g., 99.9% uptime, refund if breached). Start by defining SLOs with engineering, then build SLIs to measure them, alert on error budget burn rate."),
    ("p99 latency spiking", "Check Grafana for correlation with deployments, traffic spikes, or DB query time. Use `kubectl top pods` for CPU/memory. Enable slow query log in Postgres. Add distributed tracing to find which service/DB call is the bottleneck. Check GC pauses for JVM apps (`-XX:+PrintGCDetails`)."),
    # ── DevOps: Security ─────────────────────────────────────────────────────────
    ("rce vulnerability", "Immediately: pin the dependency to the last safe version and deploy. Scan all other services for the same library with `trivy fs .`. Check WAF logs for exploit attempts. Run `git log --all -S '<vulnerable-function>'` to confirm no exploit already in code. Post-incident: add CVE scanning to CI with `trivy image`."),
    ("aws secret key.*github", "Immediately: deactivate the key in IAM console (`aws iam delete-access-key`). Check CloudTrail for any API calls made with that key in the last 24h. Rotate any resources the key had access to. Enable GitHub secret scanning and AWS GuardDuty to detect future leaks automatically."),
    ("sast.*dast", "SAST (Static): runs in CI on source code — find SQL injection, XSS, hardcoded secrets before deployment. Tools: SonarQube, Semgrep, Bandit. DAST (Dynamic): runs against a live app — finds runtime vulnerabilities. Tools: OWASP ZAP, Burp Suite. Run SAST on every PR, DAST on staging before each release."),
    ("owasp top 10", "The 3 most relevant for DevOps: 1) Injection (SQL/command) — use parameterised queries and avoid `eval`. 2) Broken Access Control — enforce least-privilege and test with `kubectl auth can-i`. 3) Security Misconfiguration — use IaC so no manual config, run `tfsec`/`checkov` in CI."),
    # ── DevOps: GitOps & SRE ────────────────────────────────────────────────────
    ("gitops.*argocd", "GitOps: Git is the single source of truth. ArgoCD watches a Git repo and reconciles the cluster to match. Push a new Helm chart version → ArgoCD detects the diff → applies it automatically. Rollback = `git revert` + push. No `kubectl apply` in CI — instead `git push` triggers the deploy."),
    ("error budget", "Error budget = 100% - SLO. If SLO is 99.9%, error budget is 0.1% (≈43 min/month). If budget is being consumed fast, freeze new features and focus on reliability. If budget is healthy, ship faster. This makes reliability a shared engineering goal, not just ops."),
    ("blameless post-mortem", "Sections: 1) Summary & timeline. 2) Root cause (5 Whys — stop at systemic issue, not the person). 3) Impact (customers affected, duration, revenue). 4) What went well. 5) Action items with owner + due date. Goal: improve systems, not punish people. Publish within 5 business days."),
    ("chaos engineering", "Start with GameDays (planned drills), not random chaos in prod. Steps: define steady state → form hypothesis → inject failure (kill a pod, throttle network, fill disk) using Chaos Monkey/Litmus → observe → roll back → share findings. Always start in staging. Get sign-off from SRE lead before prod."),
    # ── MLOps: Fundamentals ──────────────────────────────────────────────────────
    ("model drift", "Model drift = model performance degrades over time. Data drift: input distribution shifts (e.g., user demographics change). Concept drift: relationship between input and output changes (e.g., fraud patterns evolve). Detect with: Evidently AI, Whylogs, or custom PSI/KL-divergence monitoring on prediction distributions. Trigger retrain when drift score crosses threshold."),
    ("continuous training.*mlops", "CT automatically retrains a model when new labeled data arrives, or when drift is detected. Pipeline: data validation → feature engineering → training → evaluation (metric gate: don't promote if accuracy drops >2%) → shadow deployment → promote. Orchestrate with Airflow or Kubeflow Pipelines, trigger via cron or event."),
    ("batch inference.*real-time inference", "Batch: process large datasets offline (e.g., nightly recommendations). Low latency requirement, high throughput. Use Spark/Ray. Real-time: serve predictions via REST/gRPC API (e.g., fraud detection at checkout). Sub-100ms latency. Use FastAPI + model server (Triton, BentoML, TorchServe). Choose based on SLA, not convenience."),
    ("mlops.*devops", "DevOps manages code → CI/CD pipelines. MLOps adds: data versioning (DVC), experiment tracking (MLflow), model registry, CT (triggering retraining), model monitoring (drift detection), and A/B testing of model versions. The extra challenge is data and model artefacts are large and non-deterministic."),
    ("training-serving skew", "Training-serving skew = the model sees different features at training vs inference time. Causes: different preprocessing code paths, raw vs normalised features, time-based features computed differently. Fix: use the same feature pipeline (feature store) for both training and serving. Test with `assert train_features == serve_features`."),
    ("feature store", "A feature store centralises feature computation and serving. Offline store (S3/BigQuery) for training. Online store (Redis/DynamoDB) for low-latency serving. This eliminates training-serving skew and allows feature reuse across teams. Tools: Feast, Tecton, Hopsworks."),
    # ── MLOps: Pipelines & Tools ─────────────────────────────────────────────────
    ("mlflow", "MLflow tracks: params (hyperparameters), metrics (accuracy, loss per epoch), artefacts (model binaries, plots). Model Registry promotes models through Staging → Production stages. Run `mlflow.log_metric('val_accuracy', 0.94)` and `mlflow.sklearn.log_model(model, 'model')` inside your training script."),
    ("dvc", "DVC (Data Version Control) versions large files (data, models) by storing a `.dvc` pointer in Git and the actual content in remote storage (S3, GCS). `dvc add data.csv` → creates `data.csv.dvc` (tiny, committed to Git). `dvc push` → uploads content to remote. `dvc repro` → reruns the pipeline only for changed stages."),
    ("kubeflow.*airflow", "Airflow: Python DAG-based scheduler. Great for data pipelines and ETL. Not ML-native. Kubeflow Pipelines: Kubernetes-native, each step runs as a container, built for ML workflows with artefact passing and metadata tracking. Use Airflow for orchestrating data prep, Kubeflow for ML training + serving."),
    ("containerize.*pytorch", "Dockerfile: `FROM pytorch/pytorch:2.2.0-cuda11.8-cudnn8-runtime`. Copy model weights + inference script. Install only inference deps (not training ones). Expose port 8080. Use TorchServe or FastAPI as the server. Set `ENTRYPOINT [\"python\", \"-m\", \"inference_server\"]`. Use multi-stage to strip build tools."),
    # ── MLOps: Deployment Strategies ────────────────────────────────────────────
    ("canary deployment.*ml", "Route 5% of traffic to the new model via weighted routing in the serving layer (e.g., Seldon Core, KServe, or an Nginx split). Compare new vs old on business metrics (CTR, conversion, AUC) — not just accuracy. If metrics are stable after 24h, increment traffic. Use automated rollback if error rate spikes."),
    ("shadow deployment", "Shadow mode: route 100% of live traffic to the old model AND mirror it to the new model, but only return the old model's response to users. Log both outputs and compare offline. Zero user impact. Use to validate a new model before any traffic shift."),
    ("rollback.*ml model", "Rollback strategy: keep the previous model version in the model registry as 'staging'. If new model underperforms, point the serving layer back to the old version (single config change or tag update). Automate with alerts on AUC/precision drop > threshold triggering a rollback action in the deployment pipeline."),
    # ── MLOps: Monitoring ────────────────────────────────────────────────────────
    ("monitor.*ml model.*production", "Track: prediction distribution (PSI for drift), input feature distributions, output confidence scores, business metrics (CTR, conversion), model latency (p99), and error rate. Use Evidently AI or Whylogs dashboards. Alert when drift score > 0.2 or business metric drops >5% week-over-week."),
    ("model.*accuracy dropped", "Investigation: check if data pipeline feeding the model changed (schema drift, null rates). Compare current vs training feature distributions (PSI). Check if a new user segment or time period is now dominant. If concept drift confirmed: queue a retrain with fresh labeled data. Short-term: fall back to rule-based system or previous model version."),
    ("reproducibility.*ml", "Pin: Python version (pyenv), library versions (requirements.txt + hash), random seeds (`np.random.seed(42)`, `torch.manual_seed(42)`), data version (DVC commit hash), hardware (same GPU type). Log all of these in MLflow. A reproduction should give ±0.1% of the original metric."),
]


def _get_model_answer(question_text: str) -> str:
    """Look up a curated model answer based on keywords in the question."""
    q_lower = question_text.lower()
    import re
    for pattern, answer in MODEL_ANSWERS:
        if re.search(pattern, q_lower):
            return answer
    return ("A strong answer would: 1) Define the concept clearly, 2) Explain *why* it matters, "
            "3) Give a concrete real-world example or tool you've used, "
            "4) Mention a tradeoff or gotcha. Structure: Situation → Action → Result.")


async def _rate_answer(text: str, question_text: str = "") -> tuple[str, str, str, str]:
    """
    Calls NVIDIA NIM LLM to evaluate the user's answer and return a professional grade and feedback.
    """
    if len(text.strip()) < 10:
        return "needs_work", "❌", "Answer too brief to evaluate. Please provide a detailed technical response.", "Too short to compare."
        
    client = AsyncOpenAI(
        base_url=os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"),
        api_key=os.environ.get("NVIDIA_API_KEY", "missing_key")
    )
    
    prompt = (
        f"You are a Principal DevOps Architect conducting a final-round technical interview.\n"
        f"Question: \"{question_text}\"\n"
        f"Candidate Answer: \"{text}\"\n\n"
        f"Evaluate the answer based on:\n"
        f"1. Technical Accuracy (Is the concept correct?)\n"
        f"2. Practicality (Does it mention real-world tools/scenarios?)\n"
        f"3. Clarity (Is it easy to understand?)\n\n"
        f"STRICTLY return a JSON object with:\n"
        f"- 'rating': 'excellent' | 'good' | 'needs_work'\n"
        f"- 'feedback': 1-2 sentences of actionable, senior-level feedback.\n"
        f"- 'ideal_answer': A 3-sentence 'Perfect Answer' that the candidate should learn from.\n"
    )

    try:
        target_model = os.environ.get("NVIDIA_MENTOR_MODEL", "meta/llama-3.1-70b-instruct")
        response = await client.chat.completions.create(
            model=target_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500,
        )
        content = response.choices[0].message.content
        
        # Robust JSON extraction
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            rating = data.get("rating", "good")
            feedback = data.get("feedback", "Good effort, but could be more specific.")
            ideal = data.get("ideal_answer", _get_model_answer(question_text))
            
            badge = "✅" if rating == "excellent" else "❌" if rating == "needs_work" else "🟡"
            return rating, badge, feedback, ideal
            
        raise ValueError("No JSON found")
        
    except Exception as e:
        print(f"LLM Professional Grade Error: {e}")
        model_answer = _get_model_answer(question_text)
        length = len(text.strip())
        if length >= 150: return "excellent", "✅", "Strong, detailed answer. You show good depth.", model_answer
        elif length >= 75: return "good", "🟡", "Decent overview. Try to mention specific tools or failure modes.", model_answer
        return "needs_work", "❌", "A bit shallow. Explain the 'why' and give an example.", model_answer


def _question_count_for_duration(duration_min: int, experience: str) -> int:
    base = {10: 10, 30: 30, 60: 45}
    count = base.get(duration_min, 10)
    if experience == "senior" and duration_min >= 30:
        count = min(count + 5, 50)
    return count


def _difficulty_filter(experience: str) -> List[str]:
    if experience == "beginner":
        return ["easy", "easy", "medium"]
    elif experience == "intermediate":
        return ["easy", "medium", "medium", "hard"]
    else:  # senior
        return ["medium", "hard", "hard", "hard"]


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(req: StartInterviewRequest):
    """Start a domain-specific interview session — DevOps OR MLOps, never mixed."""
    if req.duration_min not in (10, 30, 60):
        raise HTTPException(status_code=400, detail="duration_min must be 10, 30, or 60")

    if req.domain not in ("DevOps", "MLOps"):
        raise HTTPException(status_code=400, detail="domain must be 'DevOps' or 'MLOps'")

    count = _question_count_for_duration(req.duration_min, req.experience_level)
    difficulties = _difficulty_filter(req.experience_level)
    session_id = "offline-session"

    # ── 1. Fetch questions from Content Service ────────────────────────────────
    questions = []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{CONTENT_SERVICE_URL}/v1/interview/questions",
                params={
                    "domain": req.domain,
                    "count": count,
                    "difficulties": ",".join(difficulties),
                },
                timeout=10.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                questions = data.get("questions", [])
    except httpx.RequestError:
        pass  # Fall through to offline fallback

    if not questions:
        questions = _offline_questions(req.domain, count)

    # ── 2. Create session in Content Service ──────────────────────────────────
    try:
        async with httpx.AsyncClient() as client:
            session_resp = await client.post(
                f"{CONTENT_SERVICE_URL}/v1/interview/sessions",
                json={
                    "userId": req.user_id,
                    "domain": req.domain,
                    "experienceLevel": req.experience_level,
                    "durationMin": req.duration_min,
                },
                timeout=10.0,
            )
            if session_resp.status_code in (200, 201):
                session_id = session_resp.json().get("id", session_id)
    except httpx.RequestError:
        pass  # Use offline session id

    return StartInterviewResponse(
        session_id=session_id,
        domain=req.domain,
        questions=[QuestionOut(**q) for q in questions[:count]],
        total_questions=len(questions[:count]),
        duration_min=req.duration_min,
    )


@router.post("/answer", response_model=AnswerResponse)
async def submit_answer(req: AnswerRequest):
    """Submit an answer and receive an AI debrief."""
    rating, badge, feedback, model_answer = await _rate_answer(req.answer_text, req.question_text)

    # Persist to Content Service (non-blocking)
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{CONTENT_SERVICE_URL}/v1/interview/answers",
                json={
                    "sessionId": req.session_id,
                    "questionId": req.question_id,
                    "answerText": req.answer_text,
                    "debriefRating": badge,
                },
                timeout=10.0,
            )
    except httpx.RequestError:
        pass  # Non-blocking — still return debrief

    return AnswerResponse(debrief_rating=rating, debrief_badge=badge, feedback=feedback, model_answer=model_answer)


@router.get("/summary/{session_id}", response_model=SummaryResponse)
async def get_summary(session_id: str):
    """Return performance summary for a completed session."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{CONTENT_SERVICE_URL}/v1/interview/sessions/{session_id}/summary",
                timeout=10.0,
            )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Session not found")
            data = resp.json()
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Content service unavailable")

    rating_counts = data.get("ratingCounts", {"✅": 0, "🟡": 0, "❌": 0})
    total = sum(rating_counts.values())
    excellent = rating_counts.get("✅", 0)
    score_pct = round((excellent / total * 100) if total > 0 else 0, 1)
    domain = data.get("domain", "DevOps")

    if score_pct >= 80:
        feedback_summary = f"Excellent performance! You're ready for senior {domain} interviews."
    elif score_pct >= 60:
        feedback_summary = "Good effort. Focus on elaborating with real examples and tooling."
    else:
        feedback_summary = "Keep practicing. Review the flagged areas and try again."

    return SummaryResponse(
        session_id=session_id,
        domain=domain,
        total_questions=data.get("totalQuestions", total),
        answered=total,
        rating_counts=rating_counts,
        score_pct=score_pct,
        feedback_summary=feedback_summary,
    )
