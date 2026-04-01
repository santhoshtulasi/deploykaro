# TECH STACK — Backend Services
## DeployKaro: Backend Technology Decisions

---

## Service Architecture: Microservices (2 core services for MVP)

```
┌─────────────────────────────────────────────────────────┐
│                    API GATEWAY                          │
│              AWS API Gateway + CloudFront               │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
┌──────────────▼──────┐  ┌────────────▼────────────────┐
│   MENTOR AI SERVICE  │  │     CONTENT SERVICE         │
│   Python + FastAPI   │  │     Node.js + Express       │
│   Port: 8000         │  │     Port: 3001              │
└──────────────────────┘  └─────────────────────────────┘
```

---

## Service 1 — Mentor AI Service (Python + FastAPI)

**Why Python:**
- Native NVIDIA NIM SDK support
- Best ecosystem for AI/ML integrations
- Async support with FastAPI for streaming responses

**Why FastAPI:**
- Native async/await for streaming NVIDIA responses
- Automatic OpenAPI docs generation
- Pydantic models for request/response validation
- Sub-millisecond overhead

### Key Endpoints

```
POST /mentor/chat              → Send message, get mentor response (streaming)
POST /mentor/explain-error     → Explain a terminal error in user's language
POST /mentor/generate-code     → Generate code snippet for user's context
GET  /mentor/session/{id}      → Get conversation history
DELETE /mentor/session/{id}    → Clear session
POST /mentor/feedback          → User rates mentor response (thumbs up/down)
```

### Dependencies

```
fastapi==0.111.0
uvicorn[standard]==0.30.0
openai==1.35.0          # NVIDIA NIM uses OpenAI-compatible API
pydantic==2.7.0
redis==5.0.4            # Session caching
httpx==0.27.0           # Async HTTP client
python-jose==3.3.0      # JWT validation
```

---

## Service 2 — Content Service (Node.js + Express)

**Why Node.js:**
- JSON-native, fast for content APIs
- Excellent PostgreSQL drivers (pg, Prisma)
- Team likely already knows JavaScript from frontend

**Why Express:**
- Minimal, flexible
- Large middleware ecosystem
- Easy to add rate limiting, auth middleware

### Key Endpoints

```
GET  /tracks                   → List all learning tracks
GET  /tracks/:id               → Get track details + modules
GET  /tracks/:id/progress      → Get user progress for a track
POST /tracks/:id/progress      → Update user progress
GET  /concepts/:id             → Get concept content + visual trigger
GET  /achievements             → List user achievements
POST /achievements/:id/claim   → Claim an achievement badge
GET  /users/profile            → Get user profile + settings
PUT  /users/settings           → Update language, persona, difficulty
```

### Dependencies

```json
{
  "express": "^4.19.0",
  "prisma": "^5.15.0",
  "@prisma/client": "^5.15.0",
  "ioredis": "^5.3.0",
  "jsonwebtoken": "^9.0.0",
  "zod": "^3.23.0",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.3.0",
  "cors": "^2.8.5"
}
```

---

## Authentication: AWS Cognito

**Why Cognito:**
- Managed, no auth server to maintain
- Social login (Google) out of the box
- JWT tokens compatible with both services
- Free tier: 50,000 MAU

**Auth Flow:**
```
User signs up/in → Cognito issues JWT
→ JWT sent with every API request
→ API Gateway validates JWT before routing
→ Services trust validated requests
```

---

## Inter-Service Communication

- Services communicate via REST (not gRPC for MVP simplicity)
- Content Service calls Mentor AI Service for context-aware responses
- Both services share Redis for session state

---

## Logging and Observability

```
Logging:    AWS CloudWatch Logs (structured JSON logs)
Tracing:    AWS X-Ray (distributed tracing across services)
Metrics:    CloudWatch Metrics + custom dashboards
Alerting:   CloudWatch Alarms → SNS → Slack/PagerDuty
```

---

## Backend Folder Structure

```
services/
├── mentor-ai/                  # Python FastAPI service
│   ├── app/
│   │   ├── main.py             # FastAPI app entry
│   │   ├── routers/            # Route handlers
│   │   ├── services/           # Business logic
│   │   │   ├── nvidia.py       # NVIDIA NIM client
│   │   │   ├── routing.py      # Model routing logic
│   │   │   └── personas.py     # Persona prompt loader
│   │   ├── models/             # Pydantic models
│   │   └── middleware/         # Auth, rate limit
│   ├── prompts/                # Persona prompt files
│   ├── requirements.txt
│   └── Dockerfile
│
└── content/                    # Node.js Express service
    ├── src/
    │   ├── index.ts            # Express app entry
    │   ├── routes/             # Route handlers
    │   ├── services/           # Business logic
    │   ├── middleware/         # Auth, validation
    │   └── prisma/             # DB schema + migrations
    ├── package.json
    └── Dockerfile
```
