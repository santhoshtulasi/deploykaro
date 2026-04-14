import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Senior DevOps / MLOps Interview Questions — Domain Separated ─────────────
const DEVOPS_QUESTIONS = [
  // Fundamentals
  { question: "You're onboarding a junior DevOps engineer. Explain in plain terms: what IS DevOps, and why does it matter?", difficulty: "easy", category: "Fundamentals", source: "LinkedIn", domain: "DevOps" },
  // CI/CD & Pipelines
  { question: "Design a CI/CD pipeline for a Python Flask API from commit to production. What stages do you include and why?", difficulty: "medium", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  { question: "An engineer pushes a bug to production at 2am and the site goes down. Walk me through your rollback strategy.", difficulty: "hard", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  { question: "You are asked to implement blue-green deployment for a microservice. Walk through the full architecture.", difficulty: "hard", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  { question: "Canary deployment vs. rolling update: when do you choose each? Describe a real use case for both.", difficulty: "hard", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you implement feature flags in a CI/CD pipeline? Why are they powerful?", difficulty: "medium", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  { question: "A GitHub Actions workflow takes 45 minutes. Walk me through your approach to optimizing it under 10 minutes.", difficulty: "hard", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you handle secrets (API keys, DB passwords) securely in your CI/CD pipelines?", difficulty: "medium", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  { question: "Design a gitflow strategy for a team of 20 engineers shipping features weekly.", difficulty: "medium", category: "CI/CD", source: "LinkedIn", domain: "DevOps" },
  // Docker & Containers
  { question: "Your Docker image is 4GB. Production pull takes 3 minutes per pod. How do you fix this?", difficulty: "medium", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain Docker networking: bridge, host, overlay. When would you use each in a microservices system?", difficulty: "hard", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  { question: "A container exits immediately after starting. Walk me through your debugging process step by step.", difficulty: "medium", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  { question: "You have 5 services that need to communicate. How do you structure a Docker Compose setup for local dev vs. prod?", difficulty: "medium", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain multi-stage Docker builds. Show me a real example and why the final image is smaller.", difficulty: "medium", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  { question: "What is a Docker volume vs. a bind mount? When would production use one over the other?", difficulty: "easy", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you scan Docker images for vulnerabilities in a CI pipeline? What tools do you use?", difficulty: "medium", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  { question: "Your team is running containers as root in production. What is the security risk and how do you fix it?", difficulty: "hard", category: "Docker", source: "LinkedIn", domain: "DevOps" },
  // Kubernetes
  { question: "A pod is stuck in CrashLoopBackOff. Walk me through exactly how you diagnose and fix this.", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain the difference between a Deployment, StatefulSet, and DaemonSet. Give a real use case for each.", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "Your Kubernetes cluster nodes are running out of memory. What is your immediate response and long-term fix?", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "How does Kubernetes HPA work? Describe a scenario where it would save you from an outage.", difficulty: "medium", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "What is a Kubernetes Namespace, and how do you use them to isolate staging from production?", difficulty: "easy", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "Design a zero-downtime deployment strategy using Kubernetes Deployments. What is your rollout config?", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain Kubernetes RBAC. How do you give a CI agent minimal permissions to deploy?", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "How does Kubernetes handle service discovery? Explain DNS within a cluster.", difficulty: "medium", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "What is the difference between a Kubernetes Service type ClusterIP, NodePort, and LoadBalancer? When do you use each?", difficulty: "medium", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "Your pods are getting OOMKilled. Walk me through how you set resource requests and limits correctly.", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain Kubernetes Ingress. How is it different from a LoadBalancer service?", difficulty: "medium", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "What is a Kubernetes PodDisruptionBudget and when should you use it?", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you implement config management in Kubernetes using ConfigMaps vs. Secrets?", difficulty: "medium", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "CKA scenario: a node is NotReady. Walk me through your diagnosis: what commands do you run?", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "What is Helm and why is it used over raw YAML for Kubernetes deployments?", difficulty: "easy", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "You are rolling out a new Helm chart and values are not being applied. How do you debug?", difficulty: "medium", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  { question: "Design a Helm chart structure for a microservice with dev, staging, and prod environments.", difficulty: "hard", category: "Kubernetes", source: "LinkedIn", domain: "DevOps" },
  // Terraform & IaC
  { question: "Your team's Terraform state is stored locally. Why is this dangerous and how do you fix it?", difficulty: "medium", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  { question: "Terraform plan shows a replacement of an RDS instance. How do you prevent accidental destruction of a prod DB?", difficulty: "hard", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  { question: "What is a Terraform module? Design a reusable module for provisioning a VPC with public and private subnets.", difficulty: "hard", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain Terraform workspaces. How do you manage dev, staging, and prod environments?", difficulty: "medium", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  { question: "Two engineers both ran terraform apply at the same time and caused state corruption. How do you prevent this?", difficulty: "hard", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  { question: "What is terraform import and when would you use it in a real migration scenario?", difficulty: "medium", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  { question: "Compare Terraform vs Pulumi vs Ansible for IaC. When would you pick each?", difficulty: "hard", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you test Terraform code before applying to production? What tools exist?", difficulty: "hard", category: "Terraform", source: "LinkedIn", domain: "DevOps" },
  // AWS / Cloud
  { question: "Design a highly available 3-tier web app on AWS with less than 1 percent downtime SLA.", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "Your EC2 bill spiked 300 percent this month. How do you investigate and reduce AWS costs?", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain VPC Peering vs. Transit Gateway. When does Transit Gateway become necessary?", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "Your Lambda function is timing out at 3 seconds. How do you diagnose: is it cold start, code, or downstream?", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "What is the difference between SQS, SNS, and EventBridge? Give a messaging architecture using all three.", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "Design a disaster recovery strategy for an RDS database with RPO of 15 minutes and RTO of 30 minutes.", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you implement IAM least-privilege for an application accessing S3 and DynamoDB?", difficulty: "medium", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "Your S3 bucket accidentally became public. Walk through what you do in the first 10 minutes.", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain ECS vs EKS vs Fargate. Which would you choose for a stateless API?", difficulty: "hard", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "How does AWS Auto Scaling work? Describe a scaling policy for a spiky e-commerce site.", difficulty: "medium", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain S3 storage classes. How do you implement lifecycle policies to reduce cost?", difficulty: "medium", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  { question: "What is the difference between object storage, block storage, and file storage? Give AWS examples.", difficulty: "easy", category: "AWS", source: "LinkedIn", domain: "DevOps" },
  // Monitoring & Observability
  { question: "Production is down. You have Prometheus, Grafana, and Loki. Walk through your incident investigation.", difficulty: "hard", category: "Observability", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain the three pillars of observability: logs, metrics, traces. Give a tool for each.", difficulty: "easy", category: "Observability", source: "LinkedIn", domain: "DevOps" },
  { question: "Design an alerting strategy for a payments API. What metrics matter, and what SLIs/SLOs do you set?", difficulty: "hard", category: "Observability", source: "LinkedIn", domain: "DevOps" },
  { question: "What is distributed tracing and why does it matter in microservices? How does Jaeger or Zipkin work?", difficulty: "hard", category: "Observability", source: "LinkedIn", domain: "DevOps" },
  { question: "Your Grafana dashboard shows p99 latency spiking every hour. Walk through your debugging approach.", difficulty: "hard", category: "Observability", source: "LinkedIn", domain: "DevOps" },
  { question: "What is an SLI, SLO, and SLA? Design these for a search API with 99.9 percent uptime requirement.", difficulty: "medium", category: "Observability", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you implement log aggregation at scale? Compare ELK Stack vs. Loki + Promtail + Grafana.", difficulty: "hard", category: "Observability", source: "LinkedIn", domain: "DevOps" },
  // GitOps
  { question: "What is GitOps? How is it different from traditional CI/CD? Walk through deploying with ArgoCD.", difficulty: "medium", category: "GitOps", source: "LinkedIn", domain: "DevOps" },
  { question: "You rolled out a bad Helm chart. How does ArgoCD help you roll back instantly?", difficulty: "medium", category: "GitOps", source: "LinkedIn", domain: "DevOps" },
  { question: "Compare Flux vs ArgoCD for GitOps. When would you pick one over the other?", difficulty: "hard", category: "GitOps", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you manage environment-specific configs in a GitOps setup without duplicating code?", difficulty: "hard", category: "GitOps", source: "LinkedIn", domain: "DevOps" },
  // Security & DevSecOps
  { question: "You find an RCE vulnerability in a library you depend on. What is your response process in the next 2 hours?", difficulty: "hard", category: "Security", source: "LinkedIn", domain: "DevOps" },
  { question: "What is OWASP Top 10? Which 3 are most relevant to a DevOps engineer?", difficulty: "medium", category: "Security", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you shift security left in a DevOps pipeline? Name 3 tools and where they plug in.", difficulty: "medium", category: "Security", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain SAST vs DAST. Which do you run in CI vs. production?", difficulty: "medium", category: "Security", source: "LinkedIn", domain: "DevOps" },
  { question: "A developer checked in an AWS secret key to GitHub. Walk through your response in the next 15 minutes.", difficulty: "hard", category: "Security", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you implement secret rotation for a production database without downtime?", difficulty: "hard", category: "Security", source: "LinkedIn", domain: "DevOps" },
  { question: "Design network segmentation for a banking app on Kubernetes using Network Policies.", difficulty: "hard", category: "Security", source: "LinkedIn", domain: "DevOps" },
  // System Design
  { question: "Design a URL shortener that handles 100,000 requests per second with less than 50ms latency.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "DevOps" },
  { question: "Design a multi-region active-active setup for a SaaS product. Address latency, data consistency, and failover.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "DevOps" },
  { question: "Design a zero-trust networking architecture for a fintech startup on AWS.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "DevOps" },
  { question: "Your system needs to process 10M events per day. Compare Kafka, Kinesis, and SQS for this workload.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you backup and restore a PostgreSQL database in Kubernetes with zero data loss?", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "DevOps" },
  // SRE & Incident Management
  { question: "Walk me through your ideal incident response process: from alert to post-mortem.", difficulty: "hard", category: "SRE", source: "LinkedIn", domain: "DevOps" },
  { question: "What is a blameless post-mortem and why does it matter? Walk through structuring one.", difficulty: "medium", category: "SRE", source: "LinkedIn", domain: "DevOps" },
  { question: "Define error budget. How does it change how you decide when to ship new features?", difficulty: "medium", category: "SRE", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you implement chaos engineering safely in production? What tools do you use?", difficulty: "hard", category: "SRE", source: "LinkedIn", domain: "DevOps" },
  // Networking
  { question: "A service is returning 503s in production. Walk me through your network-level diagnosis.", difficulty: "hard", category: "Networking", source: "LinkedIn", domain: "DevOps" },
  { question: "What is a service mesh? When would you use Istio vs. Linkerd vs. Consul?", difficulty: "hard", category: "Networking", source: "LinkedIn", domain: "DevOps" },
  { question: "Explain mTLS. How does Istio implement it between services?", difficulty: "hard", category: "Networking", source: "LinkedIn", domain: "DevOps" },
  { question: "How does DNS resolution work inside a Kubernetes cluster? Walk through what happens when Pod A calls service-b.", difficulty: "hard", category: "Networking", source: "LinkedIn", domain: "DevOps" },
  // Leadership
  { question: "Your team resists adopting IaC. How do you drive adoption without creating friction?", difficulty: "medium", category: "Leadership", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you measure the ROI of DevOps transformation in an organization?", difficulty: "hard", category: "Leadership", source: "LinkedIn", domain: "DevOps" },
  { question: "How do you handle a disagreement with a developer about deployment ownership?", difficulty: "medium", category: "Leadership", source: "LinkedIn", domain: "DevOps" },
  { question: "You are the only DevOps engineer in a 50-person company. How do you prioritize your work?", difficulty: "hard", category: "Leadership", source: "LinkedIn", domain: "DevOps" },
];

const MLOPS_QUESTIONS = [
  // Fundamentals
  { question: "A startup CTO asks you: 'What is MLOps and how is it different from DevOps?' Walk them through it.", difficulty: "easy", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "Your ML team trains models independently and deployments keep failing. How do you convince them to adopt MLOps?", difficulty: "medium", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "Explain the full ML lifecycle from data ingestion to model retirement. Where do DevOps principles plug in?", difficulty: "medium", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "What is Continuous Training (CT) in MLOps? When does a model need to be retrained, and how do you automate it?", difficulty: "hard", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "Describe the difference between batch inference and real-time inference. Give architectural tradeoffs for each.", difficulty: "medium", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "A model you deployed last month has dropped in accuracy. Walk me through your investigation and remediation.", difficulty: "hard", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "What is model drift, and how do you detect and respond to it in production?", difficulty: "medium", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "What is the difference between model drift and data drift? Give a real example of each.", difficulty: "easy", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  { question: "What is training-serving skew and how do you detect it?", difficulty: "easy", category: "MLOps Fundamentals", source: "LinkedIn", domain: "MLOps" },
  // Pipelines & CI/CD for ML
  { question: "CI/CD for ML models is different from traditional apps. Explain the key differences and extra gates you'd add.", difficulty: "hard", category: "ML Pipelines", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you ensure reproducibility in ML pipelines? What breaks reproducibility, and how do you fix it?", difficulty: "medium", category: "ML Pipelines", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you implement CI/CD for ML models using tools like MLflow, DVC, and GitHub Actions?", difficulty: "hard", category: "ML Pipelines", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you automate model training and deployment end-to-end?", difficulty: "medium", category: "ML Pipelines", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you orchestrate ML pipelines using Airflow or Kubeflow Pipelines?", difficulty: "medium", category: "ML Pipelines", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you handle rollback for an ML model that degraded after deployment?", difficulty: "medium", category: "ML Pipelines", source: "LinkedIn", domain: "MLOps" },
  // Tools & Ecosystem
  { question: "What tools are commonly used in MLOps workflows? Compare MLflow, Kubeflow, and Metaflow.", difficulty: "easy", category: "Tools & Ecosystem", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you use MLflow in an ML pipeline? Walk through experiment tracking to model registry.", difficulty: "medium", category: "Tools & Ecosystem", source: "LinkedIn", domain: "MLOps" },
  { question: "What is DVC and how does data versioning work with it?", difficulty: "medium", category: "Tools & Ecosystem", source: "LinkedIn", domain: "MLOps" },
  { question: "Explain the .dvc file format and how DVC tracks large dataset changes.", difficulty: "medium", category: "Tools & Ecosystem", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you containerize an ML model for serving? Walk through building a Dockerfile for a PyTorch model.", difficulty: "medium", category: "Tools & Ecosystem", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you deploy ML models on Kubernetes? What resources, probes, and configs do you set up?", difficulty: "medium", category: "Tools & Ecosystem", source: "LinkedIn", domain: "MLOps" },
  // Data & Reproducibility
  { question: "What is data versioning? Why is it critical in ML projects?", difficulty: "easy", category: "Data & Reproducibility", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you version datasets across multiple training runs?", difficulty: "easy", category: "Data & Reproducibility", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you ensure reproducibility of ML experiments end-to-end?", difficulty: "easy", category: "Data & Reproducibility", source: "LinkedIn", domain: "MLOps" },
  { question: "What is data leakage in ML and what are the production consequences?", difficulty: "easy", category: "Data & Reproducibility", source: "LinkedIn", domain: "MLOps" },
  { question: "When you run 'dvc add data.csv', what exactly happens under the hood?", difficulty: "easy", category: "Data & Reproducibility", source: "LinkedIn", domain: "MLOps" },
  // Monitoring & Drift
  { question: "How do you monitor ML models in production? What signals indicate model degradation?", difficulty: "hard", category: "Monitoring & Drift", source: "LinkedIn", domain: "MLOps" },
  { question: "What metrics do you track for a production ML model? How do you set alerting thresholds?", difficulty: "medium", category: "Monitoring & Drift", source: "LinkedIn", domain: "MLOps" },
  { question: "What happens if model performance degrades in production? Walk through your incident response.", difficulty: "hard", category: "Monitoring & Drift", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you handle failed ML training pipelines? What's your retry and notification strategy?", difficulty: "medium", category: "Monitoring & Drift", source: "LinkedIn", domain: "MLOps" },
  { question: "How would you set up a model performance dashboard? What tools and metrics would you display?", difficulty: "medium", category: "Monitoring & Drift", source: "LinkedIn", domain: "MLOps" },
  // Deployment Strategies
  { question: "Explain blue-green deployment for ML models. How does it differ from a web app rollout?", difficulty: "medium", category: "Deployment Strategies", source: "LinkedIn", domain: "MLOps" },
  { question: "What is canary deployment for ML? How do you split traffic between model versions?", difficulty: "medium", category: "Deployment Strategies", source: "LinkedIn", domain: "MLOps" },
  { question: "What is shadow deployment and when would you use it for a new model version?", difficulty: "medium", category: "Deployment Strategies", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you safely deploy a model to production with minimum risk to live users?", difficulty: "medium", category: "Deployment Strategies", source: "LinkedIn", domain: "MLOps" },
  // System Design
  { question: "Design the deployment architecture for a real-time ML recommendation engine.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  { question: "You need to deploy a model that serves 1M requests per day. Design the full MLOps infrastructure.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you design a feature store for ML? What problems does it solve?", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  { question: "Design an end-to-end ML system for a fraud detection use case.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  { question: "How would you build an ML platform for data scientists to self-serve experiments?", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you scale inference across GPUs in production?", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  { question: "How do you handle large-scale distributed training jobs?", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  { question: "Design a real-time recommendation system pipeline with sub-100ms latency.", difficulty: "hard", category: "System Design", source: "LinkedIn", domain: "MLOps" },
  // ML Concepts (for MLOps context)
  { question: "What is overfitting? How do you detect it, and what does it mean for a production deployment decision?", difficulty: "easy", category: "ML Concepts", source: "LinkedIn", domain: "MLOps" },
  { question: "Explain the bias-variance tradeoff and how it affects deployment decisions.", difficulty: "easy", category: "ML Concepts", source: "LinkedIn", domain: "MLOps" },
  { question: "What is model evaluation? What metrics matter most for a classification vs regression model?", difficulty: "easy", category: "ML Concepts", source: "LinkedIn", domain: "MLOps" },
  { question: "What is feature engineering? How do you manage feature pipelines in production?", difficulty: "easy", category: "ML Concepts", source: "LinkedIn", domain: "MLOps" },
  { question: "What is A/B testing for ML models? How does it differ from a standard canary deployment?", difficulty: "medium", category: "ML Concepts", source: "LinkedIn", domain: "MLOps" },
];

const INTERVIEW_QUESTIONS = [...DEVOPS_QUESTIONS, ...MLOPS_QUESTIONS];

async function main() {
  console.log("Seeding Track 1: My First Deploy...");
  await prisma.track.upsert({
    where: { slug: "my-first-deploy" },
    update: {},
    create: {
      slug: "my-first-deploy",
      order: 1,
      durationHrs: 2,
      difficulty: Difficulty.BEGINNER,
      isPublished: true,
      titleEn: "My First Deploy",
      titleTa: "என் முதல் Deploy",
      modules: {
        create: [
          {
            order: 1,
            titleEn: "The Cloud Kitchen",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "What is a Server?", 
                  visualId: "vis_server_kitchen",
                  examDomains: ["SAA: Domain 1 (Resilient Architecture)"],
                  content: { analogy_en: "Kitchen server analogy.", technical_en: "Computing resource." }
                },
                { 
                  order: 2, 
                  titleEn: "What is the Cloud?", 
                  visualId: "vis_cloud_electricity",
                  examDomains: ["SAA: Domain 1 (Resilient Architecture)"],
                  content: { analogy_en: "Electricity analogy.", technical_en: "On-demand resources." }
                },
              ],
            },
          },
          {
            order: 2,
            titleEn: "The Docker Tiffin Box",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "What is Docker?", 
                  visualId: "vis_docker_tiffin",
                  examDomains: ["SAA: Domain 1", "CKA: Architecture"],
                  content: { analogy_en: "Tiffin box analogy.", technical_en: "Containerization." }
                },
                { 
                  order: 2, 
                  titleEn: "Your First Dockerfile", 
                  visualId: "vis_dockerfile",
                  examDomains: ["SAA: Domain 1", "CKA: Architecture"],
                  content: { analogy_en: "Recipe analogy.", technical_en: "Build instructions." }
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeding Track 2: Orchestrating the Fleet...");
  await prisma.track.upsert({
    where: { slug: "orchestrating-the-fleet" },
    update: {},
    create: {
      slug: "orchestrating-the-fleet",
      order: 2,
      durationHrs: 4,
      difficulty: Difficulty.INTERMEDIATE,
      isPublished: true,
      titleEn: "Orchestrating the Fleet",
      titleTa: "கப்பற்படை ஒருங்கிணைப்பு",
      titleKn: "ನೌಕಾದಳದ ಸಮನ್ವಯ",
      modules: {
        create: [
          {
            order: 1,
            titleEn: "The Admiral's Command",
            titleTa: "அட்மிரல் கட்டளை",
            titleKn: "ಅಡ್ಮಿರಲ್ನ ಆಜ್ಞೆ",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "What is Kubernetes?", 
                  titleTa: "Kubernetes என்றால் என்ன?",
                  titleKn: "Kubernetes ಎಂದರೇನು?",
                  visualId: "vis_k8s_fleet",
                  examDomains: ["CKA: Cluster Architecture"],
                  content: { 
                    analogy_en: "Kubernetes is like a Fleet Admiral commanding an orchestrated fleet of ships.",
                    technical_en: "Kubernetes is an open-source container orchestration system."
                  }
                },
                { 
                  order: 2, 
                  titleEn: "Nodes & Pods", 
                  visualId: "vis_k8s_nodes",
                  examDomains: ["CKA: Cluster Architecture"],
                  content: {
                    analogy_en: "Nodes are the ships, and Pods are the tiffin boxes on those ships.",
                    technical_en: "A Node is a worker machine. A Pod is the smallest execution unit in K8s."
                  }
                },
              ],
            },
          },
          {
            order: 2,
            titleEn: "Scaling the Concert",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "ReplicaSets & Scaling", 
                  visualId: "vis_k8s_scaling",
                  examDomains: ["CKA: Workloads & Scheduling"],
                  content: {
                    analogy_en: "Scaling is like adding more speakers to a concert stage as the crowd grows.",
                    technical_en: "ReplicaSets ensure that a specified number of pod replicas are running at any given time."
                  }
                },
                { 
                  order: 2, 
                  titleEn: "Self-Healing (The Phoenix)", 
                  visualId: "vis_k8s_healing",
                  examDomains: ["CKA: Troubleshooting"],
                  content: {
                    analogy_en: "Self-healing is like the Phoenix—if a pod dies, K8s brings it back automatically.",
                    technical_en: "Liveness probes and restart policies allow K8s to automatically replace failed containers."
                  }
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ─── Seed Interview Questions ───────────────────────────────────────────────
  console.log(`Seeding ${INTERVIEW_QUESTIONS.length} interview questions...`);
  let seeded = 0;
  for (const q of INTERVIEW_QUESTIONS) {
    const exists = await prisma.interviewQuestion.findFirst({
      where: { question: q.question },
    });
    if (!exists) {
      await prisma.interviewQuestion.create({ data: q });
      seeded++;
    } else {
      await prisma.interviewQuestion.update({
        where: { id: exists.id },
        data: {
          domain: q.domain,
          difficulty: q.difficulty,
          category: q.category,
        }
      });
    }
  }
  console.log(`Seeded ${seeded} new interview questions (${INTERVIEW_QUESTIONS.length - seeded} already existed).`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
