# INFRA STACK — Networking
## DeployKaro: VPC, CDN, DNS, and Security Setup

---

## VPC Design

```
VPC: 10.0.0.0/16  (deploykaro-vpc)
Region: ap-south-1 (Mumbai) — primary for India users
        us-east-1 (N. Virginia) — secondary for global users

Availability Zones: ap-south-1a, ap-south-1b (Multi-AZ)

┌─────────────────────────────────────────────────────────────┐
│                    VPC: 10.0.0.0/16                         │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │  PUBLIC SUBNET       │  │  PUBLIC SUBNET           │    │
│  │  10.0.1.0/24         │  │  10.0.2.0/24             │    │
│  │  AZ: ap-south-1a     │  │  AZ: ap-south-1b         │    │
│  │  → ALB               │  │  → ALB                   │    │
│  │  → NAT Gateway       │  │  → NAT Gateway           │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │  PRIVATE SUBNET      │  │  PRIVATE SUBNET          │    │
│  │  10.0.10.0/24        │  │  10.0.11.0/24            │    │
│  │  AZ: ap-south-1a     │  │  AZ: ap-south-1b         │    │
│  │  → ECS Tasks         │  │  → ECS Tasks             │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │  DATABASE SUBNET     │  │  DATABASE SUBNET         │    │
│  │  10.0.20.0/24        │  │  10.0.21.0/24            │    │
│  │  AZ: ap-south-1a     │  │  AZ: ap-south-1b         │    │
│  │  → RDS Primary       │  │  → RDS Standby           │    │
│  │  → ElastiCache       │  │  → ElastiCache Replica   │    │
│  └──────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Groups

### ALB Security Group (alb-sg)
```
Inbound:
  - Port 443 (HTTPS) from 0.0.0.0/0
  - Port 80 (HTTP) from 0.0.0.0/0 → redirect to 443

Outbound:
  - Port 8000 to ecs-mentor-sg
  - Port 3001 to ecs-content-sg
```

### ECS Mentor AI Security Group (ecs-mentor-sg)
```
Inbound:
  - Port 8000 from alb-sg only

Outbound:
  - Port 443 to 0.0.0.0/0 (NVIDIA API calls)
  - Port 6379 to redis-sg
  - Port 5432 to rds-sg
```

### ECS Content Security Group (ecs-content-sg)
```
Inbound:
  - Port 3001 from alb-sg only

Outbound:
  - Port 5432 to rds-sg
  - Port 6379 to redis-sg
  - Port 8000 to ecs-mentor-sg
```

### RDS Security Group (rds-sg)
```
Inbound:
  - Port 5432 from ecs-mentor-sg
  - Port 5432 from ecs-content-sg

Outbound: None
```

### Redis Security Group (redis-sg)
```
Inbound:
  - Port 6379 from ecs-mentor-sg
  - Port 6379 from ecs-content-sg

Outbound: None
```

---

## CloudFront Configuration

```
Origins:
  1. S3 bucket (static assets) — default origin
  2. API Gateway (dynamic API) — /api/* path pattern

Cache Behaviors:
  /api/*          → No cache, forward all headers
  /animations/*   → Cache 7 days (animations don't change often)
  /badges/*       → Cache 30 days
  /*              → Cache 1 day (Next.js pages)

Price Class: PriceClass_200 (US, Europe, Asia — covers India)

WAF Rules:
  - AWS Managed Rules (common threats)
  - Rate limit: 1000 requests/5min per IP
  - Block known bad IPs (AWS IP reputation list)
```

---

## DNS: Route 53

```
Hosted Zone: deploykaro.com

Records:
  deploykaro.com          → CloudFront distribution (A record, alias)
  www.deploykaro.com      → deploykaro.com (CNAME)
  api.deploykaro.com      → API Gateway (A record, alias)
  status.deploykaro.com   → Status page (external: statuspage.io)
```

---

## SSL: AWS Certificate Manager (ACM)

```
Certificates:
  *.deploykaro.com        → Wildcard cert (covers all subdomains)
  deploykaro.com          → Apex domain cert

Validation: DNS validation (auto-renews)
Attached to: CloudFront + ALB
```
