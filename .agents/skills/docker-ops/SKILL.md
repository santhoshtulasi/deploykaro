---
name: docker-ops
description: How to manage Docker services for DeployKaro local development — start, stop, restart, view logs, and troubleshoot containers.
---

## Overview

DeployKaro's local infrastructure runs entirely via Docker Compose. The `docker-compose.yml` is at the project root `d:\deploykaro\`. The `.env.local` file at the same level holds all environment variables.

## Key Services

| Container | Purpose | Port |
|---|---|---|
| `deploykaro-postgres` | Primary database (PostgreSQL 16 + pgvector) | 5432 |
| `deploykaro-redis` | Cache + sessions | 6379 |
| `deploykaro-minio` | S3-compatible object storage | 9000 / 9001 |
| `deploykaro-keycloak` | Auth (replaces AWS Cognito) | 8080 |
| `deploykaro-nginx` | API Gateway / reverse proxy | 80 |
| `deploykaro-prometheus` | Metrics | 9090 |
| `deploykaro-grafana` | Dashboards | 4000 |
| `deploykaro-loki` | Log aggregation | 3100 |
| `deploykaro-jaeger` | Distributed tracing | 16686 |
| `deploykaro-alertmanager` | Alerts | 9093 |

## Commands

### Start all services (always use --env-file)
```bash
docker compose --env-file .env.local up -d
```

### Stop all services
```bash
docker compose down
```

### Restart a single service
```bash
docker compose restart <service-name>
# Example:
docker compose restart deploykaro-postgres
```

### View logs for a service
```bash
docker compose logs -f <service-name>
# Example:
docker compose logs -f deploykaro-postgres
```

### View logs for all services
```bash
docker compose logs -f
```

### Rebuild and restart a service
```bash
docker compose up -d --build <service-name>
```

### Check status of all containers
```bash
docker compose ps
```

### Full reset (removes volumes = wipes DB data)
```bash
docker compose down -v
docker compose --env-file .env.local up -d
```

## Troubleshooting

- **Port already in use:** Run `netstat -ano | findstr :<port>` to find the PID and kill it.
- **Container keeps restarting:** Run `docker compose logs <service>` to see the error.
- **Database connection refused:** Make sure `deploykaro-postgres` is healthy — `docker compose ps`.
- **Keycloak not starting:** It needs ~30-60 seconds on first boot. Wait and retry.
