# INFRA STACK — AWS Overview
## DeployKaro: Complete AWS Services Map

---

## AWS Services Used

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────────┐
│                    CLOUDFRONT (CDN)                                 │
│  - Static assets (JS, CSS, animations) cached at edge               │
│  - SSL termination                                                  │
│  - WAF (Web Application Firewall) attached                          │
└──────────┬───────────────────────────────────┬──────────────────────┘
           │ Dynamic requests                  │ Static assets
┌──────────▼──────────────┐        ┌───────────▼──────────────────────┐
│    API GATEWAY           │        │         S3 BUCKET                │
│  - REST API              │        │  - Next.js static export         │
│  - JWT auth via Cognito  │        │  - Animation assets (SVG/Lottie) │
│  - Rate limiting         │        │  - Badge images                  │
│  - Request routing       │        │  - Certificate PDFs              │
└──────────┬───────────────┘        └──────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────────┐
│                    ECS FARGATE CLUSTER                              │
│                                                                     │
│  ┌─────────────────────┐    ┌──────────────────────────────────┐   │
│  │  Mentor AI Service  │    │       Content Service            │   │
│  │  Python + FastAPI   │    │       Node.js + Express          │   │
│  │  2 vCPU, 4GB RAM    │    │       1 vCPU, 2GB RAM            │   │
│  │  Min: 2, Max: 20    │    │       Min: 2, Max: 10            │   │
│  └──────────┬──────────┘    └──────────────┬─────────────────┘   │
│             │                              │                       │
└─────────────┼──────────────────────────────┼───────────────────────┘
              │                              │
┌─────────────▼──────────────────────────────▼───────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────┐                      │
│  │   RDS PostgreSQL  │    │  ElastiCache     │                      │
│  │   db.t3.medium    │    │  Redis           │                      │
│  │   Multi-AZ        │    │  cache.t3.micro  │                      │
│  └──────────────────┘    └──────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│  NVIDIA NIM API (integrate.api.nvidia.com)                          │
│  AWS Cognito (auth)                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## AWS Services Summary Table

| Service | Purpose | Tier (MVP) |
|---|---|---|
| CloudFront | CDN + SSL + WAF | Standard |
| S3 | Static assets, animations, certificates | Standard |
| API Gateway | Unified API entry, auth, rate limiting | REST API |
| ECS Fargate | Container hosting (both services) | Fargate |
| ECR | Docker image registry | Standard |
| RDS PostgreSQL | Primary database | db.t3.medium Multi-AZ |
| ElastiCache Redis | Caching + sessions | cache.t3.micro |
| Cognito | User authentication | Standard (50K MAU free) |
| CloudWatch | Logs, metrics, alarms | Standard |
| X-Ray | Distributed tracing | Standard |
| SNS | Alerts and notifications | Standard |
| Secrets Manager | API keys, DB passwords | Standard |
| VPC | Network isolation | Standard |
| ALB | Load balancer for ECS | Standard |
| Route 53 | DNS management | Standard |
| ACM | SSL certificates | Free |
| WAF | Web application firewall | Standard |

---

## Estimated Monthly AWS Cost (MVP — 1K users)

| Service | Monthly Cost (USD) |
|---|---|
| ECS Fargate (4 tasks) | ~$80 |
| RDS db.t3.medium | ~$60 |
| ElastiCache cache.t3.micro | ~$25 |
| CloudFront + S3 | ~$15 |
| API Gateway | ~$10 |
| Other (CloudWatch, SNS, etc.) | ~$20 |
| **Total** | **~$210/month** |

At 10K users: ~$800/month (with auto-scaling)
At 100K users: ~$4,000/month (with reserved instances, ~40% cheaper)
