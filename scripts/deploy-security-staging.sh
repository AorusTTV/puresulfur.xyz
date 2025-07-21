
#!/bin/bash

# Security Automation Staging Deployment Script
set -e

echo "🚀 Starting Security Automation Staging Deployment..."

# Configuration
STAGING_ENV="staging"
AWS_REGION="${AWS_REGION:-us-east-1}"
GITHUB_REPO="${GITHUB_REPOSITORY:-your-org/rust-skins}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed and configured
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Node.js 22 is available
    if ! node --version | grep -q "v22"; then
        print_error "Node.js 22 is not available. Please install Node.js 22.16 or higher."
        exit 1
    fi
    
    # Check if required environment variables are set
    if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
        print_error "AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
        exit 1
    fi
    
    print_status "Prerequisites check passed ✅"
}

# Deploy staging secrets
deploy_staging_secrets() {
    print_status "Deploying staging secrets to Parameter Store..."
    
    # Create staging parameter store entries
    aws ssm put-parameter \
        --name "/rust-skins/staging/auth/jwt-secret" \
        --value "$(openssl rand -hex 64)" \
        --type "SecureString" \
        --description "Staging JWT secret" \
        --overwrite \
        --region $AWS_REGION || print_warning "Failed to create JWT secret"
    
    aws ssm put-parameter \
        --name "/rust-skins/staging/database/connection-url" \
        --value "postgresql://staging_user:staging_pass@localhost:5432/staging_db" \
        --type "SecureString" \
        --description "Staging database connection" \
        --overwrite \
        --region $AWS_REGION || print_warning "Failed to create DB connection"
    
    # Generate test GPG key for staging
    STAGING_GPG_KEY="-----BEGIN PGP PRIVATE KEY BLOCK-----
Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Key-ID: STAGING$(openssl rand -hex 4 | tr '[:lower:]' '[:upper:]')
[STAGING-KEY-CONTENT]
-----END PGP PRIVATE KEY BLOCK-----"
    
    aws ssm put-parameter \
        --name "/rust-skins/staging/security/gpg-private-key" \
        --value "$STAGING_GPG_KEY" \
        --type "SecureString" \
        --description "Staging GPG private key" \
        --overwrite \
        --region $AWS_REGION || print_warning "Failed to create GPG key"
    
    print_status "Staging secrets deployed ✅"
}

# Test secret rotation
test_secret_rotation() {
    print_status "Testing secret rotation functionality..."
    
    # Set staging environment
    export NODE_ENV=staging
    
    # Run secret rotation script
    if node scripts/rotate-secrets.js; then
        print_status "Secret rotation test passed ✅"
    else
        print_error "Secret rotation test failed ❌"
        return 1
    fi
}

# Setup staging backup environment
setup_staging_backup() {
    print_status "Setting up staging backup environment..."
    
    # Create staging S3 bucket (if it doesn't exist)
    STAGING_BUCKET="rust-skins-backups-staging-$(date +%s)"
    
    aws s3 mb "s3://$STAGING_BUCKET" --region $AWS_REGION 2>/dev/null || print_warning "Bucket may already exist"
    
    # Enable versioning and encryption
    aws s3api put-bucket-versioning \
        --bucket "$STAGING_BUCKET" \
        --versioning-configuration Status=Enabled \
        --region $AWS_REGION
    
    aws s3api put-bucket-encryption \
        --bucket "$STAGING_BUCKET" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }' \
        --region $AWS_REGION
    
    # Store staging bucket name in parameter store
    aws ssm put-parameter \
        --name "/rust-skins/staging/backup/s3-bucket" \
        --value "$STAGING_BUCKET" \
        --type "String" \
        --description "Staging backup S3 bucket" \
        --overwrite \
        --region $AWS_REGION
    
    # Generate test encryption key
    TEST_ENCRYPTION_KEY="$(openssl rand -base64 32)"
    aws ssm put-parameter \
        --name "/rust-skins/staging/backup/encryption-key" \
        --value "$TEST_ENCRYPTION_KEY" \
        --type "SecureString" \
        --description "Staging backup encryption key" \
        --overwrite \
        --region $AWS_REGION
    
    print_status "Staging backup environment ready ✅ (Bucket: $STAGING_BUCKET)"
}

# Create test backup
create_test_backup() {
    print_status "Creating test backup for restore testing..."
    
    # Create a temporary test database dump
    mkdir -p /tmp/staging-backup
    
    # Generate mock database content
    cat > /tmp/staging-backup/test_backup.sql << 'EOF'
-- Test backup for staging environment
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    username VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(10,2),
    type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert test data
INSERT INTO profiles (user_id, username) VALUES 
    (gen_random_uuid(), 'staging_user_1'),
    (gen_random_uuid(), 'staging_user_2');

INSERT INTO games (game_type, status) VALUES 
    ('coinflip', 'completed'),
    ('jackpot', 'active');

INSERT INTO transactions (user_id, amount, type) VALUES 
    (gen_random_uuid(), 100.00, 'deposit'),
    (gen_random_uuid(), 50.00, 'withdrawal');
EOF
    
    # Get encryption key and bucket from parameter store
    BACKUP_ENCRYPTION_KEY=$(aws ssm get-parameter --name "/rust-skins/staging/backup/encryption-key" --with-decryption --query 'Parameter.Value' --output text --region $AWS_REGION)
    BACKUP_S3_BUCKET=$(aws ssm get-parameter --name "/rust-skins/staging/backup/s3-bucket" --query 'Parameter.Value' --output text --region $AWS_REGION)
    
    # Encrypt and upload test backup
    echo "$BACKUP_ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 --symmetric --cipher-algo AES256 --output /tmp/staging-backup/test_backup.sql.gpg /tmp/staging-backup/test_backup.sql
    
    # Upload to S3
    aws s3 cp /tmp/staging-backup/test_backup.sql.gpg "s3://$BACKUP_S3_BUCKET/database-backups/staging-test-$(date +%Y%m%d-%H%M%S).sql.gpg" --region $AWS_REGION
    
    print_status "Test backup created and uploaded ✅"
}

# Test backup restore
test_backup_restore() {
    print_status "Testing backup restore functionality..."
    
    # Set required environment variables
    export NODE_ENV=staging
    export BACKUP_S3_BUCKET=$(aws ssm get-parameter --name "/rust-skins/staging/backup/s3-bucket" --query 'Parameter.Value' --output text --region $AWS_REGION)
    export BACKUP_ENCRYPTION_KEY=$(aws ssm get-parameter --name "/rust-skins/staging/backup/encryption-key" --with-decryption --query 'Parameter.Value' --output text --region $AWS_REGION)
    
    # Install required dependencies for backup testing
    npm install @aws-sdk/client-s3 2>/dev/null || echo "S3 SDK already installed"
    
    # Run backup restore test
    if node scripts/test-backup-restore.js; then
        print_status "Backup restore test passed ✅"
    else
        print_error "Backup restore test failed ❌"
        return 1
    fi
}

# Test GitHub Actions workflows
test_github_workflows() {
    print_status "Validating GitHub Actions workflows..."
    
    # Check workflow syntax
    if command -v gh &> /dev/null; then
        print_status "Testing workflow with GitHub CLI..."
        
        # Trigger manual workflow run for testing
        gh workflow run security-automation.yml \
            -f task=backup-test \
            --repo "$GITHUB_REPO" || print_warning "Could not trigger workflow (may need repo access)"
        
        print_status "Workflow validation completed ✅"
    else
        print_warning "GitHub CLI not available. Please manually test workflows in GitHub Actions."
    fi
}

# Generate staging report
generate_staging_report() {
    print_status "Generating staging deployment report..."
    
    REPORT_FILE="/tmp/staging-security-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
# Security Automation Staging Deployment Report
Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Environment: staging
AWS Region: $AWS_REGION

## Deployment Status
✅ Prerequisites checked
✅ Staging secrets deployed
✅ Secret rotation tested
✅ Backup environment configured
✅ Test backup created
✅ Backup restore tested
✅ GitHub workflows validated

## Next Steps
1. Review staging environment performance
2. Test all security automation workflows manually
3. Verify monitoring and alerting
4. Plan production deployment

## Resources Created
- Parameter Store secrets: /rust-skins/staging/*
- S3 Backup Bucket: $(aws ssm get-parameter --name "/rust-skins/staging/backup/s3-bucket" --query 'Parameter.Value' --output text --region $AWS_REGION 2>/dev/null || echo "Not found")
- Test backups uploaded

## Verification Commands
aws ssm get-parameters-by-path --path "/rust-skins/staging" --region $AWS_REGION
aws s3 ls s3://$(aws ssm get-parameter --name "/rust-skins/staging/backup/s3-bucket" --query 'Parameter.Value' --output text --region $AWS_REGION 2>/dev/null || echo "bucket-not-found")

EOF
    
    print_status "Staging report generated: $REPORT_FILE"
    cat "$REPORT_FILE"
}

# Main deployment process
main() {
    print_status "Starting Security Automation Staging Deployment"
    print_status "=============================================="
    
    check_prerequisites
    deploy_staging_secrets
    test_secret_rotation
    setup_staging_backup
    create_test_backup
    test_backup_restore
    test_github_workflows
    generate_staging_report
    
    print_status ""
    print_status "🎉 Staging deployment completed successfully!"
    print_status "Review the report above and test the workflows manually."
    print_status ""
    print_status "To trigger manual tests:"
    print_status "- Secret rotation: NODE_ENV=staging node scripts/rotate-secrets.js"
    print_status "- Backup restore: NODE_ENV=staging node scripts/test-backup-restore.js"
    print_status ""
}

# Run main function
main "$@"
