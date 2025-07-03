# 🚀 Terraform Infrastructure for NihonAustralia Admin Panel

This Terraform configuration deploys the admin panel using the most cost-effective serverless
architecture on AWS.

## 📊 Cost-Optimized Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   Lambda URL    │────│    Next.js      │
│   (Global CDN)  │    │  (No API GW!)   │    │  (Serverless)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│       S3        │    │ Secrets Manager │    │   Supabase      │
│ (Static Assets) │    │  (Env Variables)│    │  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 💰 Monthly Cost Estimates (Sydney Region):

| Usage Level | Requests/Day | Est. Monthly Cost |
| ----------- | ------------ | ----------------- |
| Light       | 100          | $5-10             |
| Moderate    | 1,000        | $15-25            |
| Heavy       | 5,000        | $30-50            |

## 🏗️ Infrastructure Components

### Core Components:

- **AWS Lambda**: Serverless Next.js runtime (Node.js 20.x)
- **Lambda Function URL**: Direct HTTPS endpoint (cheaper than API Gateway)
- **CloudFront**: Global CDN for fast content delivery
- **S3**: Static asset storage with public read access
- **Secrets Manager**: Secure environment variable storage

### Monitoring (Optional):

- **CloudWatch**: Logs, metrics, and dashboards
- **SNS**: Alert notifications
- **Billing Alerts**: Cost monitoring

### Cost Optimization Features:

- **PriceClass_100**: CloudFront edge locations limited to US/Canada/Europe
- **512MB Lambda**: Balanced performance/cost
- **7-day log retention**: Minimize storage costs
- **Standalone Next.js output**: Optimized bundle size
- **S3 static assets**: Offload from Lambda

## 📁 File Structure

```
terraform/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Input variables
├── outputs.tf             # Output values
├── secrets.tf             # Secrets Manager configuration
├── monitoring.tf          # CloudWatch monitoring (optional)
├── terraform.tfvars.example # Example configuration
├── deploy.sh              # Deployment script
└── modules/
    └── nextjs-serverless/
        ├── main.tf         # Serverless module
        ├── variables.tf    # Module variables
        └── outputs.tf      # Module outputs
```

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install required tools
brew install terraform awscli

# Configure AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (ap-southeast-2), Format (json)
```

### 2. Configuration

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
vim terraform.tfvars
```

### 3. Deploy

```bash
# Quick deployment
chmod +x deploy.sh
./deploy.sh

# Or manual deployment
terraform init
terraform plan
terraform apply
```

## ⚙️ Configuration Options

### terraform.tfvars

```hcl
# Basic Configuration
aws_region = "ap-southeast-2"
environment = "prod"

# Supabase (Required)
supabase_url = "https://your-project.supabase.co"
supabase_anon_key = "your-anon-key"
supabase_service_role_key = "your-service-role-key"

# Authentication (Required)
nextauth_secret = "your-secure-random-string"

# Cost Optimization
lambda_memory_size = 512  # 256-1024 MB
lambda_timeout = 30       # 1-900 seconds
cloudfront_price_class = "PriceClass_100"  # Geographic distribution

# Optional Features
enable_lambda_warmup = false    # $3/month to reduce cold starts
enable_alerts = false          # SNS notifications
enable_billing_alerts = true   # Cost monitoring
billing_alert_threshold = 50   # Alert at $50/month

# Custom Domain (Optional)
# custom_domain = "admin.yourdomain.com"
# certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
```

## 📊 Monitoring & Alerting

### Default Monitoring:

- **CloudWatch Logs**: Lambda execution logs (7-day retention)
- **CloudWatch Dashboard**: Lambda and CloudFront metrics
- **Billing Alerts**: Monthly cost threshold alerts

### Optional Advanced Monitoring:

```hcl
# Enable SNS alerts
enable_alerts = true
alert_email = "admin@yourdomain.com"

# Custom billing threshold
billing_alert_threshold = 25  # Alert at $25/month
```

### Key Metrics:

- Lambda duration, errors, invocations
- CloudFront requests, errors, bytes transferred
- Estimated billing charges

## 🔐 Security Features

### Infrastructure Security:

- **IAM Least Privilege**: Lambda role with minimal permissions
- **Secrets Manager**: Encrypted environment variable storage
- **HTTPS Only**: CloudFront enforces SSL/TLS
- **No API Gateway**: Direct Lambda URL reduces attack surface

### Application Security:

- **Supabase Auth**: Handles user authentication
- **CSRF Protection**: Next.js built-in security
- **Environment Isolation**: Production secrets separation

## 🛠️ Management Commands

### Deployment Management:

```bash
# Deploy changes
./deploy.sh

# Plan only (no changes)
./deploy.sh plan

# View outputs
./deploy.sh output

# Destroy everything
./deploy.sh destroy
```

### Manual Operations:

```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan -var-file="terraform.tfvars"

# Apply changes
terraform apply -var-file="terraform.tfvars"

# View current state
terraform show

# List resources
terraform state list

# Destroy resources
terraform destroy
```

### Lambda Management:

```bash
# View Lambda logs
aws logs tail /aws/lambda/nihonaustralia-admin-prod --follow

# Update function code (after rebuild)
aws lambda update-function-code \
  --function-name nihonaustralia-admin-prod \
  --zip-file fileb://deployment.zip

# Invoke function directly
aws lambda invoke \
  --function-name nihonaustralia-admin-prod \
  --payload '{"warmup": true}' \
  response.json
```

### CloudFront Management:

```bash
# List distributions
aws cloudfront list-distributions

# Create cache invalidation
aws cloudfront create-invalidation \
  --distribution-id E123456789 \
  --paths "/*"

# Get distribution config
aws cloudfront get-distribution --id E123456789
```

## 🔄 Updates & Maintenance

### Application Updates:

1. Update source code
2. Run `./deploy.sh` to rebuild and deploy
3. CloudFront automatically serves new version

### Infrastructure Updates:

1. Modify Terraform files
2. Run `terraform plan` to review changes
3. Run `terraform apply` to deploy changes

### Scaling Considerations:

- **Memory**: Increase `lambda_memory_size` for better performance
- **Timeout**: Increase `lambda_timeout` for complex operations
- **Warmup**: Enable `enable_lambda_warmup` to reduce cold starts
- **Geographic**: Change `cloudfront_price_class` for global coverage

## 🚨 Troubleshooting

### Common Issues:

#### Deployment Fails:

```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify Terraform state
terraform state list

# Check for resource conflicts
terraform plan
```

#### Lambda Errors:

```bash
# View recent logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/nihonaustralia-admin"

# Stream live logs
aws logs tail /aws/lambda/nihonaustralia-admin-prod --follow

# Check function configuration
aws lambda get-function --function-name nihonaustralia-admin-prod
```

#### High Costs:

```bash
# Review CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=nihonaustralia-admin-prod \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-31T23:59:59Z \
  --period 86400 \
  --statistics Sum

# Check billing
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### Performance Optimization:

#### Reduce Cold Starts:

```hcl
# Enable warmup (adds ~$3/month)
enable_lambda_warmup = true
```

#### Improve Response Time:

```hcl
# Increase memory (increases cost proportionally)
lambda_memory_size = 1024
```

#### Optimize Bundle Size:

- Review Next.js bundle analyzer
- Remove unused dependencies
- Use dynamic imports for large libraries

## 📚 Additional Resources

- [AWS Lambda Pricing Calculator](https://calculator.aws/#/addService/Lambda)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Next.js Serverless Deployment](https://nextjs.org/docs/deployment)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## 🆘 Support

For infrastructure issues:

1. Check CloudWatch logs and metrics
2. Review Terraform state and plan
3. Consult AWS documentation
4. Consider posting in AWS forums or Stack Overflow

For application issues:

1. Check application logs in CloudWatch
2. Test locally with same environment variables
3. Review Next.js and Supabase documentation
