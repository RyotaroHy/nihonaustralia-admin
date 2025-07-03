#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    print_success "All dependencies are installed."
}

# Check AWS credentials
check_aws_credentials() {
    print_status "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS credentials are configured."
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    cd terraform
    terraform init
    print_success "Terraform initialized."
}

# Plan deployment
plan_deployment() {
    print_status "Planning deployment..."
    terraform plan -out=tfplan
    print_success "Deployment plan created."
}

# Apply deployment
apply_deployment() {
    print_status "Applying deployment..."
    terraform apply tfplan
    rm tfplan
    print_success "Deployment completed!"
}

# Get outputs
show_outputs() {
    print_status "Deployment outputs:"
    terraform output
}

# Estimate costs
estimate_costs() {
    print_warning "MINIMAL COST ESTIMATION:"
    echo "Based on AWS pricing (ap-southeast-2) - BASIC SETUP ONLY:"
    echo "- Lambda requests (100k/month): ~$0.02"
    echo "- Lambda compute (256MB, minimal usage): ~$0.50"
    echo "- CloudFront requests (100k/month): ~$0.08"
    echo "- CloudFront data transfer (1GB/month): ~$0.09"
    echo "- S3 storage (100MB): ~$0.002"
    echo ""
    echo "ESTIMATED TOTAL: $2-5/month for light admin usage"
    echo "Note: No monitoring, secrets manager, or warmup included"
    echo ""
}

# Main deployment function
main() {
    echo "========================================"
    echo "  NihonAustralia Admin Panel Deployment"
    echo "========================================"
    echo ""
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform/terraform.tfvars" ]; then
        print_error "terraform.tfvars file not found!"
        print_warning "Please copy terraform.tfvars.example to terraform.tfvars and configure your values."
        exit 1
    fi
    
    estimate_costs
    
    # Ask for confirmation
    read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled."
        exit 0
    fi
    
    check_dependencies
    check_aws_credentials
    init_terraform
    plan_deployment
    
    # Final confirmation
    echo ""
    print_warning "This will create AWS resources that may incur costs."
    read -p "Are you sure you want to apply this plan? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled."
        exit 0
    fi
    
    apply_deployment
    show_outputs
    
    echo ""
    print_success "🎉 Admin panel deployed successfully!"
    print_status "Your admin panel is now available at the CloudFront URL shown above."
    print_warning "It may take 5-10 minutes for CloudFront to fully deploy."
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "destroy")
        print_warning "This will destroy all AWS resources!"
        read -p "Are you sure? Type 'yes' to confirm: " -r
        if [[ $REPLY == "yes" ]]; then
            cd terraform
            terraform destroy
            print_success "Resources destroyed."
        else
            print_warning "Destruction cancelled."
        fi
        ;;
    "plan")
        check_dependencies
        check_aws_credentials
        init_terraform
        plan_deployment
        ;;
    "output")
        cd terraform
        terraform output
        ;;
    *)
        echo "Usage: $0 [deploy|destroy|plan|output]"
        exit 1
        ;;
esac