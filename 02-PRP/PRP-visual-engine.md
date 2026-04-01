# PRP — Visual Learning Engine
## DeployKaro: How Visuals Are Generated and Triggered

---

## Context
This PRP defines how the visual learning engine works — what triggers animations,
how concepts map to visuals, and what the AI must output to drive the frontend
animation system.

The visual system serves two purposes:
1. **Learning:** Make every concept stick through analogy-first animation
2. **Certification:** Visualize how exam concepts relate to each other (concept maps, decision trees)

---

## Visual Concept Map

Every DevOps/MLOps concept has a registered visual ID. When the mentor references
a concept, it emits a `visual_trigger` that the frontend uses to play the animation.

### Core Concept Visuals

| Concept | Visual ID | Analogy Used | Animation Type |
|---|---|---|---|
| What is software? | `vis_software_lego` | Lego blocks | SVG assembly animation |
| What is a server? | `vis_server_kitchen` | Restaurant kitchen | Scene animation |
| What is the internet? | `vis_internet_postoffice` | Post office network | Network flow animation |
| What is Docker? | `vis_docker_tiffin` | Tiffin box | Pack/unpack animation |
| What is a container image? | `vis_image_recipe` | Recipe card | Card flip animation |
| What is Kubernetes? | `vis_k8s_orchestra` | Orchestra conductor | Conductor + musicians |
| What is CI/CD? | `vis_cicd_factory` | Factory assembly line | Conveyor belt animation |
| What is a pod? | `vis_pod_musician` | Musician in orchestra | Spotlight animation |
| What is a service (K8s)? | `vis_service_stage` | Concert stage | Stage reveal animation |
| What is MLOps? | `vis_mlops_factory` | AI model factory | Pipeline flow animation |
| What is a Dockerfile? | `vis_dockerfile_recipe` | Recipe card | Step-by-step reveal |
| What is an API? | `vis_api_waiter` | Restaurant waiter | Request/response flow |
| What is object storage? | `vis_storage_warehouse` | Storage warehouse | File storage animation |
| What is a container registry? | `vis_registry_library` | Library of recipe books | Shelf + checkout animation |
| What is Terraform? | `vis_terraform_remote` | Universal remote control | One remote, many TVs |
| What is IAM? | `vis_iam_keycard` | Office ID card + doors | Access control animation |
| What is a VPC? | `vis_vpc_building` | Private office building | Building + floors animation |
| What is a Load Balancer? | `vis_lb_trafficcop` | Traffic police | Cars routed to lanes |
| What is Serverless? | `vis_serverless_vending` | Vending machine | Coin in → output → sleep |
| What is Helm? | `vis_helm_recipebook` | Recipe book for K8s | Book → deployed app |
| What is ArgoCD? | `vis_argocd_selfheal` | Self-repairing machine | Detect drift → auto-fix |
| What is Prometheus? | `vis_prometheus_monitor` | Health monitor | Vitals dashboard + alert |
| What is a Service Mesh? | `vis_servicemesh_postal` | Internal postal system | Envelopes between services |
| What is GitOps? | `vis_gitops_blueprint` | Blueprint as source of truth | Git commit → infra change |

### Cloud Rosetta Stone Visuals

| Concept | Visual ID | Shows |
|---|---|---|
| Object Storage comparison | `vis_rosetta_storage` | S3 ↔ GCS ↔ Blob Storage ↔ MinIO side-by-side |
| Container Orchestration | `vis_rosetta_k8s` | EKS ↔ GKE ↔ AKS ↔ Vanilla K8s |
| Serverless comparison | `vis_rosetta_serverless` | Lambda ↔ Cloud Run ↔ Azure Functions ↔ Knative |
| Managed Database | `vis_rosetta_database` | RDS ↔ Cloud SQL ↔ Azure DB ↔ PostgreSQL |
| CI/CD comparison | `vis_rosetta_cicd` | CodePipeline ↔ Cloud Build ↔ Azure DevOps ↔ Jenkins |
| Secrets Management | `vis_rosetta_secrets` | Secrets Manager ↔ Secret Manager ↔ Key Vault ↔ Vault |

### Certification Concept Map Visuals

| Cert | Visual ID | Shows |
|---|---|---|
| AWS SAA-C03 domains | `vis_cert_saa_domains` | 4 domains as interconnected pillars |
| AWS Shared Responsibility | `vis_cert_shared_resp` | AWS owns building, you own contents |
| K8s Pod lifecycle | `vis_cert_pod_lifecycle` | Pending → Running → Succeeded/Failed states |
| K8s networking model | `vis_cert_k8s_network` | Pod IPs, Services, Ingress flow |
| Terraform workflow | `vis_cert_tf_workflow` | Write → Plan → Apply → Destroy cycle |
| IAM policy evaluation | `vis_cert_iam_eval` | Explicit deny → Allow → Default deny decision tree |
| S3 storage class decision | `vis_cert_s3_classes` | Access frequency → cost decision tree |
| CKA exam domain map | `vis_cert_cka_domains` | 5 domains as weighted pie chart |

---

## Visual Trigger Output Format

When the mentor wants to show a visual, it must output:

```json
{
  "visual_trigger": "vis_docker_tiffin",
  "visual_mode": "auto_play",
  "highlight_parts": ["container", "image", "runtime"],
  "caption": "Docker packs your app like a tiffin box — same food, anywhere!",
  "cert_overlay": null
}
```

For certification mode, add `cert_overlay`:
```json
{
  "visual_trigger": "vis_cert_s3_classes",
  "visual_mode": "interactive",
  "highlight_parts": ["standard", "standard_ia", "glacier"],
  "caption": "S3 storage classes — pick based on how often you need the data",
  "cert_overlay": {
    "exam_label": "SAA-C03: Cost Optimization Domain",
    "key_distinction": "Standard-IA = infrequent access. One Zone-IA = non-critical only. Glacier = archive."
  }
}
```

### visual_mode Options
- `auto_play` — animation plays immediately
- `interactive` — user clicks to advance each step
- `xray` — hover mode, user explores components
- `comparison` — side-by-side Cloud Rosetta Stone view
- `decision_tree` — interactive decision tree (used for cert exam scenarios)

---

## Layer Progression Rules

```
Layer 1 (Analogy):
  → visual_mode: auto_play
  → No technical terms in caption
  → Duration: 10–15 seconds

Layer 2 (Technical Mapping):
  → visual_mode: interactive
  → Technical terms appear as labels on animation
  → User clicks each part to get mentor explanation
  → For senior users: cert_overlay shown if certification_mode is active

Layer 3 (Hands-On):
  → visual_mode: none (terminal takes over)
  → Mentor provides command
  → Terminal output explained line by line

Layer 4 (Certification — only in cert mode):
  → visual_mode: decision_tree OR comparison
  → Shows how the exam tests this concept
  → Interactive: user picks answer, visual shows why it's right/wrong
```

---

## Visual Generation Prompt (for AI)

When generating a new visual concept description for the frontend team:

```
You are a visual designer explaining a DevOps concept to a 10-year-old in India.
Concept: [CONCEPT_NAME]
Cloud context: [aws | gcp | azure | onprem]
Certification relevance: [cert name or "none"]

Task: Describe an animation in 3–4 layers:
  Layer 1: A real-world analogy animation (no tech words, India-relatable objects)
  Layer 2: How the analogy maps to the technical concept (with labels)
  Layer 3: What the user will type/do in the terminal
  Layer 4 (if cert relevant): Decision tree or comparison showing how exam tests this

Rules:
- Use objects a 10-year-old in India would recognize (tiffin box, auto, cricket, etc.)
- Each layer description must be under 50 words
- Specify: what moves, what appears, what the user interacts with
- For cert layer: show the key distinction the exam tests, not just the concept
```

---

## Frontend Animation Stack

```
Technology:     Framer Motion (React) + D3.js
File Format:    SVG animations for concepts, Lottie for complex scenes
Asset Storage:  MinIO (local dev) / S3 + CloudFront (production)
Trigger System: React context — mentor emits visual_trigger → frontend listens
Fallback:       If animation fails to load, show static diagram image
Cert overlays:  Rendered as React components on top of animations (not baked into SVG)
```
