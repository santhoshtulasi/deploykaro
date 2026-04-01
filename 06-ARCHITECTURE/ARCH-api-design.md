# ARCHITECTURE — API Design
## DeployKaro: API Contracts and Endpoints

---

## API Base URLs

```
Production:   https://api.deploykaro.com/v1
Staging:      https://api-staging.deploykaro.com/v1
Development:  http://localhost:8000/v1 (mentor) | http://localhost:3001/v1 (content) | http://localhost:3002/v1 (cert)
```

---

## Authentication

All endpoints (except /health) require:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

## Mentor AI Service Endpoints

### POST /v1/mentor/chat
Stream a mentor response to a user message.

**Request:**
```json
{
  "message": "Anna, Docker enna da?",
  "session_id": "sess_abc123",
  "persona": "anna",
  "language": "ta",
  "context": {
    "current_track": "container-wizard",
    "current_concept": "what-is-docker",
    "user_level": "beginner",
    "cloud_context": "aws",
    "architect_mode": false,
    "certification_mode": {
      "active": false,
      "certification": null
    }
  }
}
```

**Response (SSE Stream):**
```
data: Machan
data: !
data:  Docker
data:  nu
data:  enna
data:  da
data: ?
data: [VISUAL:vis_docker_tiffin]
data: [CTA:Show me visually,Try it now,Next concept]
data: [DOC_REF:{"platform":"docker","section":"Get Started > Overview","url":"https://docs.docker.com/get-started/overview/"}]
data: [DONE]
```

---

### POST /v1/mentor/chat (Certification Mode)
Same endpoint — certification context changes the response shape.

**Request:**
```json
{
  "message": "Explain S3 storage classes",
  "session_id": "sess_abc123",
  "persona": "buddy",
  "language": "en",
  "context": {
    "cloud_context": "aws",
    "architect_mode": false,
    "certification_mode": {
      "active": true,
      "certification": "SAA-C03",
      "current_domain": "cost_optimized_architectures"
    }
  }
}
```

**Response (SSE Stream):**
```
data: Think of S3 storage classes like different storage spots in your house...
data: [EXAM_TIP:{"cert":"SAA-C03","tip":"When the question says 'infrequently accessed', think S3-IA. When it says 'archive', think Glacier. The trap: One Zone-IA is only for non-critical, reproducible data."}]
data: [DOC_REF:{"platform":"aws","section":"Amazon S3 > User Guide > Storage Classes","url":"https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html"}]
data: [PRACTICE_Q:{"question":"A company stores log files accessed daily for 30 days, then never again. Most cost-effective solution?","options":["A) S3 Standard","B) S3 Intelligent-Tiering","C) S3 Standard-IA with Lifecycle to Glacier","D) S3 One Zone-IA"]}]
data: [DONE]
```

---

### POST /v1/mentor/analyze-repo
Analyze a repository and return architecture classification + guided questions.

**Request:**
```json
{
  "session_id": "sess_abc123",
  "persona": "buddy",
  "repo_input": {
    "type": "url",
    "value": "https://github.com/user/my-app"
  }
}
```

**OR for pasted file tree / code:**
```json
{
  "session_id": "sess_abc123",
  "persona": "anna",
  "repo_input": {
    "type": "file_tree",
    "value": "services/\n  api-gateway/\n    Dockerfile\n    package.json\n  user-service/\n    Dockerfile\n    requirements.txt\n  order-service/\n    Dockerfile\n    pom.xml\ndocker-compose.yml\n.github/workflows/ci.yml"
  }
}
```

**Response:**
```json
{
  "architecture": "microservices_monorepo",
  "confidence": 0.95,
  "services": [
    {
      "name": "api-gateway",
      "language": "javascript",
      "framework": "express",
      "role": "api_gateway"
    },
    {
      "name": "user-service",
      "language": "python",
      "framework": "fastapi",
      "role": "domain_service"
    },
    {
      "name": "order-service",
      "language": "java",
      "framework": "spring_boot",
      "role": "domain_service"
    }
  ],
  "detected": {
    "containerized": true,
    "ci_cd": "github_actions",
    "cloud_target": null,
    "databases": "not_detected",
    "inter_service_comm": "rest_http"
  },
  "gaps_detected": [
    "No cloud deployment config found",
    "No service discovery config",
    "No health check endpoints detected"
  ],
  "mentor_summary": "Here's what I see in your repo: 3-service microservices setup...",
  "confirmation_required": true
}
```

---

### POST /v1/mentor/diagnose-error
Diagnose a pasted error with full repo context.

**Request:**
```json
{
  "session_id": "sess_abc123",
  "persona": "anna",
  "error_text": "Error: getaddrinfo ENOTFOUND order-service\n    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:66:26)",
  "context": {
    "service_name": "user-service",
    "repo_architecture": "microservices_monorepo",
    "runtime": "docker_compose",
    "command_run": "docker-compose up"
  }
}
```

**Response:**
```json
{
  "error_classification": "network_dns",
  "root_cause": "Services are not on the same Docker network — DNS resolution fails across isolated networks",
  "certainty": "high",
  "exact_fix": {
    "description": "Add a shared network to docker-compose.yml and attach both services",
    "code": "networks:\n  app-network:\n    driver: bridge\n\nuser-service:\n  networks: [app-network]\n\norder-service:\n  networks: [app-network]",
    "file_to_edit": "docker-compose.yml"
  },
  "why_it_works": "Docker Compose creates DNS entries per service name only within the same network. Without a shared network, services are isolated and cannot resolve each other by name.",
  "how_to_verify": "Run: docker-compose up, then: docker exec user-service ping order-service — should resolve successfully",
  "next_likely_error": "If order-service crashes on startup, check: docker-compose logs order-service",
  "interview_value": "This is a common Docker networking interview question — knowing this shows real hands-on experience"
}
```

---


**Request:**
```json
{
  "error_text": "Error response from daemon: Cannot connect to the Docker daemon at unix:///var/run/docker.sock",
  "command_run": "docker build -t myapp .",
  "persona": "anna",
  "session_id": "sess_abc123",
  "cloud_context": "aws"
}
```

**Response:**
```json
{
  "explanation": "Machan, Docker daemon run aagala! Simple ah solren — Docker engine start pannanum.",
  "fix_command": "sudo systemctl start docker",
  "why_it_works": "Docker daemon is the background service that runs containers. It needs to be running before any docker commands work.",
  "doc_reference": {
    "platform": "docker",
    "section": "Manuals > Docker Engine > Install",
    "url": "https://docs.docker.com/engine/install/"
  },
  "cta_options": ["Try the fix", "Explain differently", "Skip for now"]
}
```

---

### GET /v1/mentor/session/{session_id}
Get conversation history for a session.

**Response:**
```json
{
  "session_id": "sess_abc123",
  "persona": "anna",
  "cloud_context": "aws",
  "certification_mode": { "active": false },
  "messages": [
    {
      "role": "user",
      "content": "Anna, Docker enna da?",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Machan! Docker nu oru tiffin box maari...",
      "timestamp": "2024-01-15T10:30:02Z",
      "model_used": "mistralai/mistral-nemo-12b-instruct",
      "cached": false,
      "rag_chunks_used": 1
    }
  ],
  "message_count": 2
}
```

---

## Certification Service Endpoints

### POST /v1/cert/diagnostic
Run a diagnostic assessment for a certification.

**Request:**
```json
{
  "certification": "SAA-C03",
  "user_id": "user_xyz"
}
```

**Response:**
```json
{
  "diagnostic_id": "diag_abc123",
  "certification": "SAA-C03",
  "questions": [
    {
      "id": "q_001",
      "domain": "resilient_architectures",
      "question": "A company needs a highly available web application...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."]
    }
  ],
  "question_count": 10,
  "time_limit_mins": 15
}
```

---

### POST /v1/cert/diagnostic/{diagnostic_id}/submit
Submit diagnostic answers and get readiness score.

**Request:**
```json
{
  "answers": {
    "q_001": "B",
    "q_002": "A",
    "q_003": "C"
  }
}
```

**Response:**
```json
{
  "overall_readiness": 0.65,
  "domain_scores": {
    "resilient_architectures": 0.80,
    "high_performing_architectures": 0.70,
    "secure_architectures": 0.55,
    "cost_optimized_architectures": 0.40
  },
  "weak_areas": ["cost_optimized_architectures", "secure_architectures"],
  "study_plan": {
    "weeks": 6,
    "daily_hours": 1.5,
    "week_by_week": [
      { "week": 1, "focus": "Core services: EC2, S3, RDS, VPC" },
      { "week": 2, "focus": "Security: IAM, KMS, Security Groups, NACLs" },
      { "week": 3, "focus": "Cost optimization: Reserved, Spot, Savings Plans" },
      { "week": 4, "focus": "High availability: Multi-AZ, Auto Scaling, ELB" },
      { "week": 5, "focus": "Full mock exam + targeted revision" },
      { "week": 6, "focus": "Rapid-fire weak areas + exam-day prep" }
    ]
  }
}
```

---

### GET /v1/cert/practice/{certification}
Get practice questions for a certification, weighted by user's weak areas.

**Query params:** `domain=cost_optimized_architectures&count=5&difficulty=medium`

**Response:**
```json
{
  "questions": [
    {
      "id": "pq_001",
      "certification": "SAA-C03",
      "domain": "cost_optimized_architectures",
      "difficulty": "medium",
      "question": "A company runs a batch job every Sunday night...",
      "options": ["A) On-Demand", "B) Reserved", "C) Spot", "D) Dedicated"],
      "doc_reference": {
        "platform": "aws",
        "section": "EC2 > User Guide > Instance Purchasing Options",
        "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html"
      }
    }
  ]
}
```

---

### POST /v1/cert/practice/{question_id}/answer
Submit an answer to a practice question.

**Request:**
```json
{ "answer": "C", "time_taken_secs": 45 }
```

**Response:**
```json
{
  "correct": true,
  "correct_answer": "C",
  "explanation": "Spot Instances are ideal for batch jobs that can be interrupted — they're up to 90% cheaper than On-Demand. Think of it like booking a last-minute flight seat at a discount.",
  "analogy": "Spot = last-minute discounted flight seat. If the airline needs the seat back, you get bumped — but for a batch job that can retry, that's fine.",
  "doc_reference": {
    "platform": "aws",
    "section": "EC2 > User Guide > Spot Instances",
    "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html"
  },
  "domain_score_updated": { "cost_optimized_architectures": 0.48 }
}
```

---

### GET /v1/cert/readiness/{certification}
Get current readiness score and study plan progress.

**Response:**
```json
{
  "certification": "SAA-C03",
  "overall_readiness": 0.72,
  "exam_ready": false,
  "readiness_threshold": 0.80,
  "domain_scores": { ... },
  "questions_attempted": 47,
  "questions_correct": 34,
  "study_streak_days": 5,
  "estimated_ready_date": "2024-02-15",
  "recommendation": "Focus on cost optimization — 3 more sessions should push you above 80%"
}
```

---

## Content Service Endpoints

### GET /v1/tracks
List all learning tracks.

**Response:**
```json
{
  "tracks": [
    {
      "id": "track_001",
      "slug": "my-first-deploy",
      "title": "My First Deploy",
      "title_ta": "என் முதல் Deploy",
      "title_kn": "ನನ್ನ ಮೊದಲ Deploy",
      "duration_hrs": 2,
      "module_count": 6,
      "difficulty": "beginner",
      "cloud_variants": ["aws", "gcp", "azure"],
      "achievement_badge": "first-deployer",
      "order": 1
    }
  ]
}
```

---

### GET /v1/concepts/{concept_id}
Get concept content.

**Response:**
```json
{
  "id": "concept_001",
  "title": "What is Docker?",
  "title_ta": "Docker என்னது?",
  "visual_id": "vis_docker_tiffin",
  "content": {
    "analogy_en": "Docker is like a lunchbox...",
    "analogy_ta": "Docker oru tiffin box maari...",
    "analogy_kn": "Docker oru tiffin box tara...",
    "technical_en": "Docker packages your app and its dependencies...",
    "hands_on_command": "docker build -t myapp .",
    "expected_output": "Successfully built abc123",
    "cloud_variants": {
      "aws": { "registry": "ECR", "run_service": "ECS/EKS" },
      "gcp": { "registry": "Artifact Registry", "run_service": "GKE/Cloud Run" },
      "azure": { "registry": "ACR", "run_service": "AKS/ACI" }
    }
  },
  "doc_references": [
    {
      "platform": "docker",
      "section": "Get Started > Overview",
      "url": "https://docs.docker.com/get-started/overview/"
    }
  ],
  "cert_relevance": ["DCA", "CKA", "CKAD"],
  "order": 1
}
```

---

## Error Response Format (All Endpoints)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You've reached your daily message limit. Upgrade to Pro for unlimited messages.",
    "message_ta": "உங்கள் தினசரி செய்தி வரம்பை எட்டிவிட்டீர்கள்.",
    "retry_after_secs": 3600,
    "upgrade_url": "https://deploykaro.com/pricing"
  }
}
```

---

## Rate Limits

| Tier | Mentor Messages/Day | Cert Practice Questions/Day | API Requests/Min |
|---|---|---|---|
| Free | 50 | 10 | 30 |
| Pro | Unlimited | Unlimited | 120 |
| Teams | Unlimited | Unlimited | 300 |
