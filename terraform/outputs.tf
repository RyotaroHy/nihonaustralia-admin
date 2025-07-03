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
    lambda_requests_1m     = "$0.20"
    lambda_compute_gb_sec  = "$0.0000166667 per GB-second"
    cloudfront_requests    = "$0.0075 per 10,000 requests"
    cloudfront_data_out    = "$0.085 per GB"
    s3_storage             = "$0.023 per GB"
    total_estimated_low    = "$5-15/month for light usage"
    total_estimated_high   = "$20-50/month for moderate usage"
    note                   = "Actual costs depend on traffic and usage patterns"
  }
}