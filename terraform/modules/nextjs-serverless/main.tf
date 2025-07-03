# Local variables
locals {
  function_name = "${var.app_name}-${var.environment}"
  s3_bucket_name = "${var.app_name}-${var.environment}-static-${random_id.bucket_suffix.hex}"
}

# Random ID for unique bucket naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Build the Next.js application
resource "null_resource" "build_nextjs" {
  triggers = {
    package_json = filemd5("${path.root}/../package.json")
    src_hash     = md5(join("", [for f in fileset("${path.root}/../src", "**") : filemd5("${path.root}/../src/${f}")]))
  }

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.root}/..
      npm ci
      npm run build
      
      # Create deployment package
      mkdir -p .terraform-build
      cp -r .next .terraform-build/
      cp -r public .terraform-build/
      cp package.json .terraform-build/
      cp next.config.ts .terraform-build/
      
      # Install production dependencies
      cd .terraform-build
      npm ci --production
      
      # Create Lambda deployment package
      zip -r ../deployment.zip . -x "*.git*" "node_modules/.cache/*" "*.terraform*"
    EOT
  }
}

# S3 bucket for static assets
resource "aws_s3_bucket" "static_assets" {
  bucket = local.s3_bucket_name
  
  tags = var.tags
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static_assets.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.static_assets]
}

# Upload static assets to S3
resource "null_resource" "upload_static_assets" {
  depends_on = [null_resource.build_nextjs, aws_s3_bucket.static_assets]

  triggers = {
    build_hash = null_resource.build_nextjs.id
  }

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.root}/..
      if [ -d ".next/static" ]; then
        aws s3 sync .next/static s3://${aws_s3_bucket.static_assets.bucket}/_next/static --delete
      fi
      if [ -d "public" ]; then
        aws s3 sync public s3://${aws_s3_bucket.static_assets.bucket} --delete --exclude "*.html"
      fi
    EOT
  }
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${local.function_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# Lambda function
resource "aws_lambda_function" "nextjs_lambda" {
  depends_on = [null_resource.build_nextjs]
  
  filename         = "${path.root}/../deployment.zip"
  function_name    = local.function_name
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size
  
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = merge(var.environment_variables, {
      NEXT_PUBLIC_STATIC_URL = "https://${aws_s3_bucket.static_assets.bucket}.s3.${data.aws_region.current.name}.amazonaws.com"
    })
  }

  tags = var.tags
}

data "archive_file" "lambda_zip" {
  depends_on  = [null_resource.build_nextjs]
  type        = "zip"
  source_dir  = "${path.root}/../.terraform-build"
  output_path = "${path.root}/../deployment.zip"
}

# Lambda function URL (cost-effective alternative to API Gateway)
resource "aws_lambda_function_url" "nextjs_lambda_url" {
  function_name      = aws_lambda_function.nextjs_lambda.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }
}

# CloudFront distribution for global CDN
resource "aws_cloudfront_distribution" "nextjs_distribution" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = var.cloudfront_price_class
  aliases             = var.custom_domain != "" ? [var.custom_domain] : []

  # Origin for Lambda function URL
  origin {
    domain_name = replace(aws_lambda_function_url.nextjs_lambda_url.function_url, "https://", "")
    origin_id   = "lambda-origin"

    custom_origin_config {
      http_port              = 443
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin for S3 static assets
  origin {
    domain_name = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id   = "s3-origin"
  }

  # Default cache behavior (Lambda)
  default_cache_behavior {
    target_origin_id       = "lambda-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "CloudFront-Forwarded-Proto"]
      cookies {
        forward = "all"
      }
    }

    # Minimal caching for dynamic content
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 31536000
  }

  # Cache behavior for static assets
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    # Long caching for static assets
    min_ttl     = 31536000
    default_ttl = 31536000
    max_ttl     = 31536000
  }

  # Cache behavior for public assets
  ordered_cache_behavior {
    path_pattern           = "/images/*"
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 86400
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.custom_domain == ""
    acm_certificate_arn           = var.certificate_arn
    ssl_support_method            = var.custom_domain != "" ? "sni-only" : null
    minimum_protocol_version      = var.custom_domain != "" ? "TLSv1.2_2021" : null
  }

  tags = var.tags
}


# Data sources
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}