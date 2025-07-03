# AWS Secrets Manager for sensitive configuration
resource "aws_secretsmanager_secret" "admin_secrets" {
  name = "${local.app_name}-${var.environment}-secrets"
  description = "Sensitive configuration for NihonAustralia Admin Panel"
  
  tags = {
    Project     = "NihonAustralia-Admin"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_secretsmanager_secret_version" "admin_secrets" {
  secret_id = aws_secretsmanager_secret.admin_secrets.id
  
  secret_string = jsonencode({
    supabase_service_role_key = var.supabase_service_role_key
    nextauth_secret          = var.nextauth_secret
  })
}

# IAM policy for Lambda to access secrets
resource "aws_iam_policy" "lambda_secrets_policy" {
  name = "${local.app_name}-${var.environment}-secrets-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.admin_secrets.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_secrets_policy" {
  policy_arn = aws_iam_policy.lambda_secrets_policy.arn
  role       = module.nextjs_serverless.lambda_role_name
}

# Output the secret ARN for reference
output "secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.admin_secrets.arn
  sensitive   = true
}