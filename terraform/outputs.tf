output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.nextjs_serverless.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.nextjs_serverless.cloudfront_distribution_id
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.nextjs_serverless.lambda_function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = module.nextjs_serverless.lambda_function_arn
}

output "s3_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = module.nextjs_serverless.s3_bucket_name
}

output "admin_panel_url" {
  description = "Admin panel URL"
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://${module.nextjs_serverless.cloudfront_domain_name}"
}

output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (USD)"
  value = {
    total_estimated = "$2-10/month for typical admin usage"
    note           = "Minimal serverless setup: Lambda + CloudFront + S3 only"
  }
}