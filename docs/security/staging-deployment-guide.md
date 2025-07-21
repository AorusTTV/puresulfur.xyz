
# Staging Deployment Guide for Security Automation

This guide walks you through deploying and testing the security automation workflows in a staging environment before production deployment.

## Prerequisites

Before starting the staging deployment, ensure you have:

- [ ] AWS CLI installed and configured with appropriate permissions
- [ ] Node.js 22.16+ installed
- [ ] Docker installed (for container testing)
- [ ] GitHub CLI installed (optional, for workflow testing)
- [ ] Access to AWS Parameter Store and S3
- [ ] GPG installed for backup encryption testing

## Quick Start

### 1. Deploy to Staging Environment

Run the automated staging deployment script:

```bash
chmod +x scripts/deploy-security-staging.sh
./scripts/deploy-security-staging.sh
```

This script will:
- ✅ Check all prerequisites
- ✅ Deploy staging secrets to Parameter Store
- ✅ Test secret rotation functionality
- ✅ Set up backup environment with test data
- ✅ Create and test backup restore process
- ✅ Validate GitHub Actions workflows
- ✅ Generate comprehensive deployment report

### 2. Validate Staging Configuration

```bash
node scripts/staging-config.js validate
```

### 3. Run Security Test Suite

```bash
node scripts/test-security-staging.js
```

## Manual Testing Steps

### Test Secret Rotation

```bash
# Set staging environment
export NODE_ENV=staging

# Run secret rotation
node scripts/rotate-secrets.js

# Verify secrets were rotated
aws ssm get-parameters-by-path --path "/rust-skins/staging" --region us-east-1
```

### Test Backup Restore

```bash
# Set required environment variables
export NODE_ENV=staging
export BACKUP_S3_BUCKET=$(aws ssm get-parameter --name "/rust-skins/staging/backup/s3-bucket" --query 'Parameter.Value' --output text)
export BACKUP_ENCRYPTION_KEY=$(aws ssm get-parameter --name "/rust-skins/staging/backup/encryption-key" --with-decryption --query 'Parameter.Value' --output text)

# Run backup restore test
node scripts/test-backup-restore.js
```

### Test Docker Build

```bash
# Build staging container
docker build -t rust-skins-staging:latest .

# Test container startup
docker run --rm -p 8080:8080 \
  -e NODE_ENV=staging \
  -e AWS_REGION=us-east-1 \
  rust-skins-staging:latest
```

### Test GitHub Actions Workflows

```bash
# Trigger manual workflow run (requires GitHub CLI and repo access)
gh workflow run security-automation.yml -f task=backup-test

# Check workflow status
gh run list --workflow=security-automation.yml
```

## Staging Environment Configuration

### AWS Parameter Store Structure

```
/rust-skins/staging/
├── auth/
│   └── jwt-secret
├── database/
│   └── connection-url
├── security/
│   └── gpg-private-key
├── backup/
│   ├── s3-bucket
│   ├── encryption-key
│   └── retention-days
└── monitoring/
    └── alert-webhook
```

### Staging S3 Bucket Structure

```
s3://rust-skins-backups-staging-*/
└── database-backups/
    └── staging-test-YYYYMMDD-HHMMSS.sql.gpg
```

## Testing Checklist

### ✅ Infrastructure Tests
- [ ] AWS credentials configured correctly
- [ ] Parameter Store secrets accessible
- [ ] S3 backup bucket created and accessible
- [ ] Proper IAM permissions in place

### ✅ Application Tests
- [ ] Node.js 22 LTS version confirmed
- [ ] All security scripts present and executable
- [ ] Docker build completes successfully
- [ ] Container starts without errors

### ✅ Security Automation Tests
- [ ] Secret rotation completes successfully
- [ ] Backup creation and upload works
- [ ] Backup restore process functional
- [ ] Test data integrity verification passes

### ✅ CI/CD Tests
- [ ] GitHub Actions workflows validate
- [ ] Manual workflow triggers work
- [ ] Workflow logs show expected behavior
- [ ] Alert notifications sent (if configured)

## Troubleshooting

### Common Issues

**AWS Permission Errors**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify Parameter Store access
aws ssm describe-parameters --region us-east-1
```

**Secret Rotation Failures**
```bash
# Check staging secrets exist
aws ssm get-parameters-by-path --path "/rust-skins/staging" --region us-east-1

# Verify encryption keys
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Backup Restore Issues**
```bash
# Check S3 bucket access
aws s3 ls s3://your-staging-bucket/

# Test GPG decryption
echo "test" | gpg --symmetric --armor --passphrase "your-key"
```

**Docker Build Problems**
```bash
# Check Dockerfile syntax
docker build --no-cache -t rust-skins-staging:debug .

# Verify Node.js version in container
docker run --rm rust-skins-staging:debug node --version
```

## Production Readiness Checklist

After successful staging testing:

- [ ] All staging tests pass consistently
- [ ] Performance metrics acceptable
- [ ] Error rates within expected thresholds
- [ ] Monitoring and alerting functional
- [ ] Documentation updated
- [ ] Team trained on emergency procedures

## Next Steps

1. **Review Results**: Analyze all test reports and logs
2. **Performance Optimization**: Identify any performance issues
3. **Security Review**: Conduct final security assessment
4. **Production Planning**: Schedule production deployment
5. **Rollback Planning**: Prepare rollback procedures

## Automated Reports

The staging deployment generates several reports:

- **Deployment Report**: `/tmp/staging-security-report-*.txt`
- **Test Results**: `/tmp/staging-security-test-report-*.json`
- **Health Check**: Available via `node scripts/staging-config.js health`

## Support

For issues during staging deployment:

1. Check the troubleshooting section above
2. Review generated reports and logs
3. Verify AWS permissions and configuration
4. Test individual components manually
5. Consult the security team if needed

## Security Considerations

### Staging vs Production

- Staging uses separate AWS resources
- Test data only - no real user information
- Shorter retention periods
- Less strict monitoring requirements
- Simplified alert configurations

### Data Protection

- All staging secrets encrypted in Parameter Store
- Test backups use separate encryption keys
- S3 buckets have versioning and encryption enabled
- No production data used in staging tests

---

**Remember**: Staging deployment is a critical step before production. Take time to thoroughly test all components and review results before proceeding to production deployment.
