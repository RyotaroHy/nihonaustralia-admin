terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # Optional: Use Terraform Cloud or S3 backend for state management
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "admin-panel/terraform.tfstate"
  #   region = "ap-southeast-2"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "NihonAustralia-Admin"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Get current AWS account ID and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local variables
locals {
  app_name = "nihonaustralia-admin"
  domain_name = var.custom_domain != "" ? var.custom_domain : "${local.app_name}-${var.environment}.${data.aws_caller_identity.current.account_id}.aws"
}

# Use the cost-optimized serverless module
module "nextjs_serverless" {
  source = "./modules/nextjs-serverless"

  app_name                = local.app_name
  environment            = var.environment
  domain_name            = local.domain_name
  custom_domain          = var.custom_domain
  certificate_arn        = var.certificate_arn
  
  # Environment variables for the Next.js app
  environment_variables = {
    NODE_ENV                      = "production"
    NEXT_PUBLIC_SUPABASE_URL     = var.supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = var.supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY    = var.supabase_service_role_key
    NEXTAUTH_SECRET              = var.nextauth_secret
    NEXTAUTH_URL                 = "https://${local.domain_name}"
    NEXT_TELEMETRY_DISABLED      = "1"
  }

  # Minimal cost settings
  lambda_memory_size     = var.lambda_memory_size
  lambda_timeout         = var.lambda_timeout
  cloudfront_price_class = var.cloudfront_price_class
  
  tags = {
    Project     = "NihonAustralia-Admin"
    Environment = var.environment
  }
}