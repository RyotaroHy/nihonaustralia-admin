# 🚀 NihonAustralia Admin Panel - Serverless Deployment Guide

This guide explains how to deploy the admin panel to AWS using the most cost-effective serverless
architecture.

## 📊 Cost Overview

**Estimated Monthly Costs (Sydney Region):**

- **Light Usage** (100 requests/day): $5-10/month
- **Moderate Usage** (1000 requests/day): $15-25/month
- **Heavy Usage** (5000 requests/day): $30-50/month

### Cost Breakdown:

- **Lambda**: $0.20 per 1M requests + $0.0000166667 per GB-second
- **CloudFront**: $0.75 per 1M requests + $0.085 per GB data transfer
- **S3**: $0.025 per GB storage
- **Secrets Manager**: $0.40 per secret per month

## 🏗️ Architecture

```
Internet → CloudFront (CDN) → Lambda (Next.js) + S3 (Static Assets)
                            ↓
                      Secrets Manager (Env Vars)
                            ↓
                      Supabase (Database)
```

**Components:**

1. **AWS Lambda**: Runs Next.js server-side rendering
2. **CloudFront**: Global CDN for fast content delivery
3. **S3**: Stores static assets (images, CSS, JS)
4. **Secrets Manager**: Secure environment variable storage
5. **Lambda Function URL**: Direct HTTPS endpoint (cheaper than API Gateway)

## 📋 Prerequisites

### Required Tools:

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Install Terraform
brew install terraform

# Verify installations
aws --version
terraform --version
node --version
npm --version
```

### AWS Account Setup:

1. Create AWS account if you don't have one
2. Configure AWS CLI:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret, and region (ap-southeast-2)
   ```

## 🔧 Configuration

### 1. Environment Variables

```bash
# Copy example configuration
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
cp .env.production.example .env.production
```

### 2. Configure terraform.tfvars

```hcl
# AWS Configuration
aws_region = "ap-southeast-2"  # Sydney region
environment = "prod"

# Supabase Configuration
supabase_url = "https://your-project.supabase.co"
supabase_anon_key = "your-anon-key"
supabase_service_role_key = "your-service-role-key"

# Authentication
nextauth_secret = "your-secure-random-string"

# Cost Optimization
lambda_memory_size = 512  # Balance of performance and cost
lambda_timeout = 30
cloudfront_price_class = "PriceClass_100"  # US/Canada/Europe only
enable_lambda_warmup = false  # Disable to save costs
```

### 3. Optional: Custom Domain

If you want to use a custom domain (e.g., admin.yourdomain.com):

1. Request SSL certificate in AWS Certificate Manager (us-east-1 region)
2. Add to terraform.tfvars:
   ```hcl
   custom_domain = "admin.yourdomain.com"
   certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/abc123..."
   ```

## 🚀 Deployment

### Quick Deployment:

```bash
# Make deploy script executable
chmod +x terraform/deploy.sh

# Deploy with interactive prompts
./terraform/deploy.sh
```

### Manual Deployment:

```bash
# 1. Initialize Terraform
cd terraform
terraform init

# 2. Plan deployment
terraform plan

# 3. Apply (creates AWS resources)
terraform apply
```

### Deployment Output:

After successful deployment, you'll see:

```
Outputs:

admin_panel_url = "https://d123456789.cloudfront.net"
cloudfront_domain_name = "d123456789.cloudfront.net"
estimated_monthly_cost = {
  "lambda_requests_1m" = "$0.20"
  "total_estimated_low" = "$5-15/month for light usage"
  ...
}
```

## 🔄 Updates and Maintenance

### Update Application Code:

```bash
# Deploy code changes
./terraform/deploy.sh

# Or manually:
cd terraform
terraform apply
```

### Update Infrastructure:

```bash
# Modify terraform/*.tf files
# Then redeploy:
terraform plan
terraform apply
```

### Monitor Costs:

- Check AWS Cost Explorer monthly
- Set up billing alerts in AWS Console
- Monitor CloudWatch metrics

## 📈 Scaling and Optimization

### Cost Optimization Tips:

1. **Reduce Lambda Memory**:
   - Start with 512MB, reduce to 256MB if performance allows
   - Monitor CloudWatch metrics for optimization

2. **CloudFront Caching**:
   - Enabled by default for static assets
   - Reduces Lambda invocations

3. **Lambda Warmup**:
   - Disabled by default to save costs
   - Enable only if cold starts are problematic

4. **Monitoring**:

   ```bash
   # View current costs
   terraform output estimated_monthly_cost

   # Check Lambda metrics
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/nihonaustralia-admin"
   ```

### Performance Optimization:

1. **Monitor Cold Starts**:

   ```bash
   # Enable warmup if needed (adds ~$3/month)
   enable_lambda_warmup = true
   ```

2. **Memory Tuning**:
   ```bash
   # Increase memory for better performance (increases cost)
   lambda_memory_size = 1024
   ```

## 🛠️ Troubleshooting

### Common Issues:

1. **Deployment Fails**:

   ```bash
   # Check AWS credentials
   aws sts get-caller-identity

   # Check Terraform state
   terraform show
   ```

2. **Lambda Function Errors**:

   ```bash
   # View logs
   aws logs tail /aws/lambda/nihonaustralia-admin-prod --follow
   ```

3. **CloudFront Issues**:

   ```bash
   # Check distribution status
   aws cloudfront list-distributions

   # Invalidate cache if needed
   aws cloudfront create-invalidation --distribution-id E123456789 --paths "/*"
   ```

### Performance Issues:

1. **Slow Cold Starts**:
   - Enable Lambda warmup
   - Reduce bundle size
   - Optimize imports

2. **High Costs**:
   - Review CloudWatch metrics
   - Optimize caching strategies
   - Reduce Lambda memory if possible

## 🗑️ Cleanup

### Destroy Resources:

```bash
# Interactive destruction
./terraform/deploy.sh destroy

# Or manually:
cd terraform
terraform destroy
```

**⚠️ Warning**: This will permanently delete all AWS resources and data.

## 📊 Monitoring Setup

### CloudWatch Dashboards:

The deployment automatically creates:

- Lambda function metrics
- CloudFront metrics
- Error tracking
- Cost monitoring

### Alerts:

Set up billing alerts in AWS Console:

1. Go to AWS Billing Console
2. Create budget alert for monthly spend
3. Set threshold (e.g., $20/month)

## 🔐 Security Best Practices

1. **Environment Variables**: Stored securely in AWS Secrets Manager
2. **IAM Roles**: Least privilege access for Lambda
3. **HTTPS Only**: CloudFront enforces HTTPS
4. **Admin Access**: Supabase handles authentication

## 📚 Additional Resources

- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 💡 Tips for Cost Savings

1. **Use Free Tier**: AWS Free Tier includes 1M Lambda requests/month
2. **Regional Optimization**: Deploy in closest region to users
3. **Caching Strategy**: Maximize CloudFront cache hit ratio
4. **Resource Tagging**: Track costs by environment/project
5. **Regular Reviews**: Monthly cost analysis and optimization
