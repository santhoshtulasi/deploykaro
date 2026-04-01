# INFRA STACK — Containers
## DeployKaro: ECS Fargate + Docker Configuration

---

## ECS Cluster Setup

```
Cluster Name: deploykaro-cluster
Launch Type:  Fargate (serverless containers — no EC2 to manage)
Region:       ap-south-1 (Mumbai)
```

---

## Mentor AI Service — ECS Task Definition

```json
{
  "family": "deploykaro-mentor-ai",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/deploykaroMentorTaskRole",
  "containerDefinitions": [
    {
      "name": "mentor-ai",
      "image": "ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/deploykaro-mentor-ai:latest",
      "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
      "environment": [
        {"name": "ENVIRONMENT", "value": "production"},
        {"name": "REDIS_HOST", "value": "deploykaro-redis.xxxxx.cache.amazonaws.com"}
      ],
      "secrets": [
        {"name": "NVIDIA_API_KEY", "valueFrom": "arn:aws:secretsmanager:ap-south-1:ACCOUNT:secret:deploykaro/nvidia-api-key"},
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:ap-south-1:ACCOUNT:secret:deploykaro/db-url"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/deploykaro-mentor-ai",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## Content Service — ECS Task Definition

```json
{
  "family": "deploykaro-content",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "content",
      "image": "ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/deploykaro-content:latest",
      "portMappings": [{"containerPort": 3001, "protocol": "tcp"}],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:ap-south-1:ACCOUNT:secret:deploykaro/db-url"},
        {"name": "REDIS_URL", "valueFrom": "arn:aws:secretsmanager:ap-south-1:ACCOUNT:secret:deploykaro/redis-url"},
        {"name": "COGNITO_USER_POOL_ID", "valueFrom": "arn:aws:secretsmanager:ap-south-1:ACCOUNT:secret:deploykaro/cognito-pool-id"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/deploykaro-content",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## Auto Scaling Configuration

```
Mentor AI Service:
  Min tasks:    2 (always on, no cold start)
  Max tasks:    20
  Scale OUT:    CPU > 70% for 2 minutes → add 2 tasks
  Scale IN:     CPU < 30% for 10 minutes → remove 1 task

Content Service:
  Min tasks:    2
  Max tasks:    10
  Scale OUT:    CPU > 60% for 2 minutes → add 2 tasks
  Scale IN:     CPU < 25% for 10 minutes → remove 1 task
```

---

## Dockerfiles

### Mentor AI Service Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY prompts/ ./prompts/

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

### Content Service Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

USER appuser
EXPOSE 3001

CMD ["node", "dist/index.js"]
```

---

## CI/CD Pipeline for Container Builds

```
Trigger: Push to main branch
Steps:
  1. Run tests
  2. Build Docker image
  3. Push to ECR with tags: latest + git SHA
  4. Update ECS service (rolling deployment)
  5. Health check — wait for new tasks to be healthy
  6. Rollback automatically if health check fails
```
