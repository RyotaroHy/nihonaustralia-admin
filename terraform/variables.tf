variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-southeast-2"  # Sydney region for lower latency to Australia
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "custom_domain" {
  description = "Custom domain name (optional). If not provided, will use AWS generated domain"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain (required if custom_domain is set)"
  type        = string
  default     = ""
}

# Supabase Configuration
variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key for admin operations"
  type        = string
  sensitive   = true
}

# Authentication
variable "nextauth_secret" {
  description = "NextAuth.js secret for JWT signing"
  type        = string
  sensitive   = true
}

# Lambda Configuration for Cost Optimization
variable "lambda_memory_size" {
  description = "Lambda memory size in MB (128-10240). Lower = cheaper"
  type        = number
  default     = 256  # Minimal memory for cost savings
  
  validation {
    condition     = var.lambda_memory_size >= 128 && var.lambda_memory_size <= 10240
    error_message = "Lambda memory size must be between 128 and 10240 MB."
  }
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds (1-900)"
  type        = number
  default     = 30  # Most admin operations should complete quickly
  
  validation {
    condition     = var.lambda_timeout >= 1 && var.lambda_timeout <= 900
    error_message = "Lambda timeout must be between 1 and 900 seconds."
  }
}


variable "cloudfront_price_class" {
  description = "CloudFront price class (All, 100, 200)"
  type        = string
  default     = "PriceClass_100"  # Use only US, Canada, Europe edge locations for cost savings
  
  validation {
    condition     = contains(["PriceClass_All", "PriceClass_200", "PriceClass_100"], var.cloudfront_price_class)
    error_message = "CloudFront price class must be one of: PriceClass_All, PriceClass_200, PriceClass_100."
  }
}

