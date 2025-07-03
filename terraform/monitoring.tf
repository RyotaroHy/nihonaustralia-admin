# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${module.nextjs_serverless.lambda_function_name}"
  retention_in_days = 7  # Keep logs for 7 days to minimize costs
  
  tags = {
    Project     = "NihonAustralia-Admin"
    Environment = var.environment
  }
}

# CloudWatch Dashboard for monitoring
resource "aws_cloudwatch_dashboard" "admin_dashboard" {
  dashboard_name = "${local.app_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", module.nextjs_serverless.lambda_function_name],
            [".", "Errors", ".", "."],
            [".", "Invocations", ".", "."],
            [".", "Throttles", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Lambda Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", module.nextjs_serverless.cloudfront_distribution_id],
            [".", "BytesDownloaded", ".", "."],
            [".", "4xxErrorRate", ".", "."],
            [".", "5xxErrorRate", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"  # CloudFront metrics are in us-east-1
          title   = "CloudFront Metrics"
          period  = 300
        }
      }
    ]
  })
}

# SNS Topic for alerts (optional)
resource "aws_sns_topic" "admin_alerts" {
  count = var.enable_alerts ? 1 : 0
  name  = "${local.app_name}-${var.environment}-alerts"
  
  tags = {
    Project     = "NihonAustralia-Admin"
    Environment = var.environment
  }
}

# CloudWatch Alarm for Lambda errors
resource "aws_cloudwatch_metric_alarm" "lambda_error_rate" {
  count = var.enable_alerts ? 1 : 0
  
  alarm_name          = "${local.app_name}-${var.environment}-lambda-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors lambda error rate"
  insufficient_data_actions = []

  dimensions = {
    FunctionName = module.nextjs_serverless.lambda_function_name
  }

  alarm_actions = [aws_sns_topic.admin_alerts[0].arn]
  
  tags = {
    Project     = "NihonAustralia-Admin"
    Environment = var.environment
  }
}

# CloudWatch Alarm for Lambda duration
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  count = var.enable_alerts ? 1 : 0
  
  alarm_name          = "${local.app_name}-${var.environment}-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = "25000"  # 25 seconds
  alarm_description   = "This metric monitors lambda duration"
  insufficient_data_actions = []

  dimensions = {
    FunctionName = module.nextjs_serverless.lambda_function_name
  }

  alarm_actions = [aws_sns_topic.admin_alerts[0].arn]
  
  tags = {
    Project     = "NihonAustralia-Admin"
    Environment = var.environment
  }
}

# Billing Alert (using CloudWatch in us-east-1)
resource "aws_cloudwatch_metric_alarm" "billing_alert" {
  count = var.enable_billing_alerts ? 1 : 0
  
  provider = aws.us_east_1
  
  alarm_name          = "${local.app_name}-${var.environment}-billing-alert"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "86400"  # 24 hours
  statistic           = "Maximum"
  threshold           = var.billing_alert_threshold
  alarm_description   = "This metric monitors estimated charges"
  insufficient_data_actions = []

  dimensions = {
    Currency = "USD"
  }

  alarm_actions = var.enable_alerts ? [aws_sns_topic.admin_alerts[0].arn] : []
  
  tags = {
    Project     = "NihonAustralia-Admin"
    Environment = var.environment
  }
}

# Provider for us-east-1 (required for billing metrics)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "NihonAustralia-Admin"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}