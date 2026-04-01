# LOCAL DEV — Prerequisites & Open-Source Stack
## DeployKaro: Local Build & Test Setup (No AWS, Real NVIDIA API)

**Version:** 1.1
**Status:** Approved for Local Development
**Owner:** Engineering Team

---

## Why No AWS Locally?

Running AWS services locally is expensive, requires credentials setup, and creates friction for new contributors. For local build and test, every AWS dependency is replaced with an open-source equivalent that behaves identically.

> All AWS services are still used in production (Staging / Production environments).
> This guide is **only** for local development and testing on your machine.
> AI inference uses the **real NVIDIA NIM API** — same as production, no mocking needed.

---

## 1. AWS → Open-Source Replacement Map

| AWS Service | Purpose in Production | Local Replacement | Notes |
|---|---|---|---|
| **ECS Fargate** | Container hosting for all services | **Docker + Docker Compose** | Identical containers, local orchestration |
| **RDS PostgreSQL** | Primary relational database | **PostgreSQL 16** (Docker) | Same engine, pgvector extension included |
| **ElastiCache Redis** | Caching + session storage | **Redis 7** (Docker) | Drop-in compatible |
| **ECR** | Docker image registry | **Local Docker / Docker Hub free** | No registry needed locally |
| **API Gateway** | Request routing, rate limiting, auth | **Nginx** (Docker) | Config mirrors production rules |
| **CloudFront CDN** | Static asset delivery + edge caching | **Nginx** (Docker) | Serves static files locally |
| **S3** | Badges, SVG animations, cert PDFs | **MinIO** (Docker) | S3-compatible API, zero code changes |
| **Cognito** | User auth, JWT issuance, social login | **Keycloak 24** (Docker) | OAuth2 / OIDC / JWT compatible |
| **Secrets Manager** | API keys, DB passwords | **`.env` files + dotenv** | Never commit `.env` to Git |
| **CloudWatch Logs** | Structured log aggregation | **Grafana Loki + Promtail** (Docker) | Same log query interface |
| **CloudWatch Metrics** | Metrics + dashboards + alarms | **Prometheus + Grafana** (Docker) | Industry standard equivalent |
| **X-Ray** | Distributed tracing | **Jaeger** (Docker) | OpenTelemetry-compatible |
| **SNS** | Alerts and notifications | **Alertmanager** (Docker) | Works with Prometheus alerts |
| **ALB** | Load balancer for ECS | **Nginx** (Docker) | Upstream config handles routing |
| **Route 53** | DNS management | **`localhost` / `/etc/hosts`** | Direct localhost access |
| **ACM** | SSL/TLS certificates | **mkcert** (local CA) | Optional — HTTP fine for local |
| **WAF** | Web application firewall | ❌ Not needed locally | Dev machines don't need WAF |
| **VPC / Subnets** | Network isolation | **Docker bridge network** | Docker handles network isolation |
| **NVIDIA NIM API** | AI inference (LLM + embeddings) | **NVIDIA NIM API** (real key) | Same API as production — no change needed |

---

## 2. System Requirements

### Minimum

| Component | Requirement |
|---|---|
| **OS** | Windows 10+ / macOS 12+ / Ubuntu 22.04+ |
| **RAM** | 8 GB |
| **CPU** | 4 cores |
| **Disk** | 30 GB free space |
| **GPU** | ❌ Not required (AI runs on NVIDIA cloud) |
| **Internet** | Required (NVIDIA NIM API is a cloud API) |

### Recommended

| Component | Requirement |
|---|---|
| **OS** | Windows 11 / Ubuntu 24.04 LTS |
| **RAM** | 16 GB |
| **CPU** | 8 cores |
| **Disk** | 50 GB free space |

> **Note:** Since AI inference runs on NVIDIA's cloud (not your machine), local hardware requirements are much lighter. No GPU needed at all.

---

## 3. Manual Installation — Required Tools

These must be installed on your machine before running `docker compose up`.

### 3.1 Docker Desktop
**Replaces:** ECS Fargate, ECR, ALB, VPC

```
Download:  https://www.docker.com/products/docker-desktop
Version:   25.0+ (Docker Engine) + Docker Compose v2
```

After install, verify:
```bash
docker --version         # Docker version 25.x.x
docker compose version   # Docker Compose version v2.x.x
```

> **Windows users:** Enable WSL2 backend in Docker Desktop settings for best performance.

---

### 3.2 Node.js v20 LTS
**Used for:** Next.js Frontend, Content Service (Node.js + Express), Prisma CLI

```
Download:  https://nodejs.org/en/download
Version:   v20.x (LTS)
```

After install, verify:
```bash
node --version    # v20.x.x
npm --version     # 10.x.x
```

> Optionally install `pnpm` for faster installs:
> ```bash
> npm install -g pnpm
> ```

---

### 3.3 Python 3.11+
**Used for:** Mentor AI Service (FastAPI + Uvicorn), Docs Ingestion Service, RAG pipeline

```
Download:  https://www.python.org/downloads/
Version:   3.11 or 3.12 (recommended)
```

After install, verify:
```bash
python --version      # Python 3.11.x or 3.12.x
pip --version         # pip 24.x
```

> Optionally install `uv` for faster Python package management:
> ```bash
> pip install uv
> ```

---

### 3.4 NVIDIA API Key
**Used for:** Mentor AI Service — LLM inference, embeddings, reranking (same as production)

Get your free API key from the NVIDIA NIM developer portal:

```
URL:   https://build.nvidia.com
Steps: Sign up → Generate API Key → copy nvapi-xxxxxxxxxxxx
```

> **Free tier:** NVIDIA offers a generous free credit tier for development — enough to build and test the full DeployKaro mentor locally at no cost.

Verify your key works:
```bash
curl https://integrate.api.nvidia.com/v1/models \
  -H "Authorization: Bearer nvapi-xxxxxxxxxxxx"
# Expect: 200 OK with a list of available models
```

Store the key in your `.env.local` file (see Section 6). **Never commit it to Git.**

---

### 3.5 Git
**Used for:** Version control, cloning the repository

```
Download:  https://git-scm.com/downloads
Version:   2.40+
```

After install, verify:
```bash
git --version    # git version 2.4x.x
```

---

### 3.6 mkcert (Optional — for local HTTPS)
**Replaces:** AWS ACM (SSL certificates)

Only needed if you want to test with HTTPS locally. HTTP is sufficient for local dev.

```bash
# Windows (using Chocolatey):
choco install mkcert

# macOS:
brew install mkcert

# Ubuntu:
sudo apt install libnss3-tools
curl -L https://github.com/FiloSottile/mkcert/releases/latest -o mkcert
chmod +x mkcert && sudo mv mkcert /usr/local/bin/
```

Setup after install:
```bash
mkcert -install            # Trust local CA
mkcert localhost           # Generate cert for localhost
```

---

## 4. Services via Docker Compose (Auto-Provisioned)

These do **not** need manual installation — they spin up automatically via `docker compose up`.

| Service | Image | Replaces | Admin UI |
|---|---|---|---|
| **PostgreSQL 16 + pgvector** | `pgvector/pgvector:pg16` | AWS RDS | — |
| **Redis 7** | `redis:7-alpine` | ElastiCache | — |
| **MinIO** | `minio/minio:latest` | AWS S3 | http://localhost:9001 |
| **Keycloak 24** | `quay.io/keycloak/keycloak:24` | AWS Cognito | http://localhost:8080 |
| **Nginx** | `nginx:alpine` | API Gateway + ALB + CloudFront | — |
| **Prometheus** | `prom/prometheus:latest` | CloudWatch Metrics | http://localhost:9090 |
| **Grafana** | `grafana/grafana:latest` | CloudWatch Dashboards | http://localhost:4000 |
| **Loki** | `grafana/loki:latest` | CloudWatch Logs | — |
| **Promtail** | `grafana/promtail:latest` | CloudWatch Log Agent | — |
| **Jaeger** | `jaegertracing/all-in-one:latest` | AWS X-Ray | http://localhost:16686 |
| **Alertmanager** | `prom/alertmanager:latest` | AWS SNS | http://localhost:9093 |

---

## 5. Local Port Reference

```
Port 3000     → Next.js Frontend (UI)
Port 3001     → Content Service (Node.js + Express)
Port 8000     → Mentor AI Service (Python + FastAPI)
Port 5432     → PostgreSQL (primary database)
Port 6379     → Redis (cache + sessions)
Port 9000     → MinIO API (S3-compatible)
Port 9001     → MinIO Console (Web UI)
Port 8080     → Keycloak (Auth / JWT / Admin Console)
Port 80       → Nginx (Local API Gateway — routes to all services)
Port 9090     → Prometheus (Metrics)
Port 4000     → Grafana (Dashboards + Logs)
Port 3100     → Loki (Log aggregation)
Port 16686    → Jaeger (Distributed tracing UI)
Port 9093     → Alertmanager

[External — cloud]
https://integrate.api.nvidia.com/v1  → NVIDIA NIM API (AI inference)
```

---

## 6. Environment Variables (.env.local)

Create a `.env.local` file in the root of the project. **Never commit this file to Git.**

```bash
# ─────────────────────────────────────────────
# AI SERVICE — NVIDIA NIM API (real key)
# ─────────────────────────────────────────────
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx       # Your real NVIDIA API key
NVIDIA_MENTOR_MODEL=meta/llama-3.1-405b-instruct
NVIDIA_FAST_MODEL=mistralai/mistral-nemo-12b-instruct
NVIDIA_EMBED_MODEL=nvidia/nv-embedqa-e5-v5
NVIDIA_RERANK_MODEL=nvidia/rerank-qa-mistral-4b
NVIDIA_USE_MOCK=false

# ─────────────────────────────────────────────
# DATABASE (PostgreSQL — Docker)
# ─────────────────────────────────────────────
DATABASE_URL=postgresql://deploykaro:deploykaro@localhost:5432/deploykaro
POSTGRES_USER=deploykaro
POSTGRES_PASSWORD=deploykaro
POSTGRES_DB=deploykaro

# ─────────────────────────────────────────────
# CACHE (Redis — Docker)
# ─────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─────────────────────────────────────────────
# STORAGE (MinIO — replaces S3)
# ─────────────────────────────────────────────
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=deploykaro-assets
S3_REGION=us-east-1                            # MinIO ignores this but keep for SDK compat

# ─────────────────────────────────────────────
# AUTH (Keycloak — replaces Cognito)
# ─────────────────────────────────────────────
AUTH_ISSUER=http://localhost:8080/realms/deploykaro
AUTH_CLIENT_ID=deploykaro-app
AUTH_CLIENT_SECRET=local-dev-secret

# ─────────────────────────────────────────────
# PAYMENTS (Test keys — external)
# ─────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
DODO_API_KEY=dodo_test_xxxxxxxxxxxx

# ─────────────────────────────────────────────
# OBSERVABILITY
# ─────────────────────────────────────────────
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318  # Jaeger OTLP endpoint
LOG_LEVEL=debug

# ─────────────────────────────────────────────
# RAG CONFIG
# ─────────────────────────────────────────────
RAG_TOP_K=5
RAG_MIN_SIMILARITY=0.7
```

---

## 7. API Keys — What You Need

| Key | Purpose | Where to Get | Free? |
|---|---|---|---|
| **NVIDIA API Key** | AI inference (mentor, embeddings, reranking) | [build.nvidia.com](https://build.nvidia.com) → Sign up → Generate Key | ✅ Free tier available |
| **Razorpay Test Key** | Local payment testing | [razorpay.com](https://razorpay.com) → Dashboard → API Keys | ✅ Free test mode |
| **Dodo Payments Test Key** | International payment testing | [dodopayments.com](https://dodopayments.com) | ✅ Free test mode |
| ~~AWS Credentials~~ | Replaced by Docker services locally | Not needed | ✅ |

---

## 8. Quick Validation Checklist

Before starting development, confirm all tools are working:

```bash
# 1. Docker
docker --version
docker compose version
docker run hello-world

# 2. Node.js
node --version         # Must be v20+
npm --version

# 3. Python
python --version       # Must be 3.11+
pip --version

# 4. NVIDIA API Key
curl https://integrate.api.nvidia.com/v1/models \
  -H "Authorization: Bearer $NVIDIA_API_KEY"
# Expect: 200 OK with list of models

# 5. Git
git --version
```

---

## 9. Cost Comparison: Local vs AWS (MVP)

| Setup | Monthly Cost | Requirement |
|---|---|---|
| **Local (this setup)** | ~₹0 (NVIDIA free tier covers dev usage) | Your machine + internet + NVIDIA API Key |
| **AWS MVP (1K users)** | ~$210/month (~₹17,500) | AWS account |
| **AWS at 10K users** | ~$800/month (~₹66,500) | AWS account |

> Local development has near-zero infrastructure cost. All Docker services are free and open-source.
> NVIDIA NIM API free tier is sufficient for all local development and testing.
> AWS is only needed when deploying to staging or production.

---

## 10. Next Steps After Prerequisites

Once all tools are installed and verified:

1. **`docker compose up -d`** — Start all backing services (PostgreSQL, Redis, MinIO, Keycloak, etc.)
2. **Copy `.env.local`** and fill in your `NVIDIA_API_KEY`
3. **`cd services/mentor-ai && pip install -r requirements.txt && uvicorn app.main:app --reload`** — Start AI service
4. **`cd services/content && npm install && npm run dev`** — Start Content service
5. **`cd frontend && npm install && npm run dev`** — Start Next.js frontend
6. Open **`http://localhost:3000`** — DeployKaro is running locally

---

*This document covers local development setup only. For staging/production AWS deployment, refer to `04-INFRA-STACK/`.*
