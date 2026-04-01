# INFRA STACK — Terraform Plan
## DeployKaro: Infrastructure as Code Overview

---

## Terraform Project Structure

```
infrastructure/
├── main.tf                 # Root module, provider config
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── terraform.tfvars        # Variable values (gitignored for secrets)
│
└── modules/
    ├── vpc/                # VPC, subnets, security groups
    ├── ecs/                # ECS cluster, services, task definitions
    ├── rds/                # PostgreSQL RDS instance
    ├── elasticache/        # Redis ElastiCache
    ├── s3-cloudfront/      # S3 bucket + CloudFront distribution
    ├── api-gateway/        # API Gateway configuration
    ├── cognito/            # Cognito user pool
    ├── ecr/                # ECR repositories
    └── monitoring/         # CloudWatch, alarms, dashboards
```

---

## main.tf (Root)

```hcl
terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }

  backend "s3" {
    bucket         = "deploykaro-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "deploykaro-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "deploykaro"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module "ecr" {
  source      = "./modules/ecr"
  environment = var.environment
}

module "rds" {
  source            = "./modules/rds"
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.database_subnet_ids
  security_group_id = module.vpc.rds_sg_id
  db_password       = var.db_password
}

module "elasticache" {
  source            = "./modules/elasticache"
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.database_subnet_ids
  security_group_id = module.vpc.redis_sg_id
}

module "ecs" {
  source                = "./modules/ecs"
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  public_subnet_ids     = module.vpc.public_subnet_ids
  mentor_ai_image       = "${module.ecr.mentor_ai_repo_url}:latest"
  content_image         = "${module.ecr.content_repo_url}:latest"
  rds_endpoint          = module.rds.endpoint
  redis_endpoint        = module.elasticache.endpoint
}

module "s3_cloudfront" {
  source      = "./modules/s3-cloudfront"
  environment = var.environment
  domain_name = var.domain_name
}

module "cognito" {
  source      = "./modules/cognito"
  environment = var.environment
  domain_name = var.domain_name
}

module "monitoring" {
  source              = "./modules/monitoring"
  environment         = var.environment
  ecs_cluster_name    = module.ecs.cluster_name
  rds_identifier      = module.rds.identifier
  alert_email         = var.alert_email
}
```

---

## variables.tf

```hcl
variable "aws_region" {
  description = "AWS region for primary deployment"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "deploykaro.com"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "alert_email" {
  description = "Email for CloudWatch alerts"
  type        = string
}
```

---

## Deployment Commands

```bash
# Initialize Terraform
terraform init

# Plan changes (always review before apply)
terraform plan -var-file="production.tfvars" -out=tfplan

# Apply changes
terraform apply tfplan

# Destroy (use with extreme caution)
terraform destroy -var-file="production.tfvars"
```

---

## State Management

- Remote state stored in S3 (encrypted)
- State locking via DynamoDB (prevents concurrent applies)
- State file never committed to Git
- Separate state files per environment (dev/staging/prod)
