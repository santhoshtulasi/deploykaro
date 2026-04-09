---
description: Start all DeployKaro local services — Docker backing services + Mentor AI + Content Service + Frontend
---

# Start All DeployKaro Services

This workflow boots the full local stack in the correct order.

## Steps

1. Verify Docker Desktop is running:
```bash
docker info
```

// turbo
2. Start all Docker backing services (PostgreSQL, Redis, MinIO, Keycloak, Nginx, Prometheus, Grafana, Loki, Jaeger, Alertmanager):
```bash
docker compose --env-file .env.local up -d
```

3. Verify all containers are healthy:
```bash
docker compose ps
```

4. Start the Mentor AI Service (FastAPI) — open a new terminal:
```bash
cd d:\deploykaro\services\mentor-ai && uvicorn app.main:app --reload --port 8000
```

5. Start the Content Service (Node.js + Express) — open a new terminal:
```bash
cd d:\deploykaro\services\content && npm run dev
```

6. Start the Next.js Frontend — open a new terminal:
```bash
cd d:\deploykaro\frontend && npm run dev
```

7. Open the app in browser:
```
http://localhost:3000
```

## Service URLs After Startup

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Content API | http://localhost:3001 |
| Mentor AI | http://localhost:8000 |
| MinIO Console | http://localhost:9001 |
| Keycloak Admin | http://localhost:8080 |
| Grafana | http://localhost:4000 |
| Prometheus | http://localhost:9090 |
| Jaeger UI | http://localhost:16686 |
