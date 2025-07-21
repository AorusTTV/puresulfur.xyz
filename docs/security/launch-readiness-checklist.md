
# Launch Readiness Security Checklist

## 🚨 Launch-Blocking Requirements (MUST BE COMPLETE)

### B-2: Automated Key Rotation ✅
- **Status**: IMPLEMENTED
- **Evidence**: 
  - Script: `scripts/rotate-secrets.js`
  - CI Schedule: `.github/workflows/security-automation.yml` (every 60 days)
  - Rotation includes: JWT secrets, GPG keys
  - Last rotation: Check Parameter Store version history
- **Testing**: Run `node scripts/rotate-secrets.js` in staging
- **Monitoring**: CloudWatch logs + Slack notifications

### C-3: Weekly Backup Restore Testing ✅
- **Status**: IMPLEMENTED
- **Evidence**:
  - Script: `scripts/test-backup-restore.js`
  - CI Schedule: `.github/workflows/security-automation.yml` (weekly Sundays 3 AM)
  - Tests: Download, decrypt, restore to test DB, verify data integrity
  - Results stored in: GitHub Actions artifacts (30-day retention)
- **Validation**: Check weekly CI job success in Actions tab

### D-1: Cloudflare WAF with Gambling & Gaming Ruleset ✅
- **Status**: IMPLEMENTED
- **Evidence**:
  - Terraform config: `infrastructure/terraform/cloudflare-waf.tf`
  - Managed ruleset: Cloudflare Gambling & Gaming protection enabled
  - Custom rules: Gaming-specific attack pattern blocking
  - Rate limiting: 5 auth attempts/15min, 100 API requests/min
- **Dashboard**: https://dash.cloudflare.com/[zone]/security/waf
- **Test**: Trigger blocked request and capture request ID

### F-1: Node.js 22 LTS in Production ✅
- **Status**: IMPLEMENTED
- **Evidence**:
  - Dockerfile: Uses `node:22.16-alpine` base image
  - Package.json: Engine requirement `>=22.16.0`
  - CI: All workflows use Node.js 22.16
- **Verification**: `docker run [image] node -v` should show `v22.16.x`

### H-1/H-2/H-3: Host Hardening ✅
- **Status**: IMPLEMENTED
- **Evidence**:
  - Script: `scripts/server-hardening.sh`
  - Firewall: UFW configured (80,443 IN; 443,587 OUT only)
  - SSH: Key-based auth only, no root login, MFA ready
  - Fail2Ban: SSH, HTTP auth, and rate-limit protection
- **Verification**: Run `/root/verify-hardening.sh` on server
- **Report**: Generated at `/root/hardening-report.txt`

## 🟡 High-Priority Follow-ups (Post-Launch Sprint 1)

### A-4: Granular RBAC
- **Status**: NOT STARTED
- **Requirement**: Admin/Moderator/Player roles with permission matrix
- **Target**: Week 2 post-launch

### D-2/D-3: DDoS Testing & Bot Management
- **Status**: PLANNED
- **Requirement**: Synthetic DDoS test + enhanced bot rules
- **Target**: Week 2 post-launch

### E-1: Rate Limiting Alignment
- **Status**: PARTIAL
- **Current**: Basic rate limits implemented
- **Required**: 5 auth/15min, 100 game/min enforcement
- **Target**: Week 1 post-launch

### G-2: Alert Rules
- **Status**: NOT STARTED
- **Requirement**: 5×5xx in 5min, auth-fail spike alerts
- **Target**: Week 1 post-launch

### J-1/J-2/J-3: External Security Assessment
- **Status**: PLANNED
- **Requirement**: Pen-test, bug bounty, unit tests for payout logic
- **Target**: Week 3-4 post-launch

## Deployment Checklist

### Pre-Deployment
- [ ] All launch-blocking tasks marked ✅
- [ ] Security automation CI jobs passing
- [ ] Cloudflare WAF rules active and tested
- [ ] Server hardening script executed successfully
- [ ] Node.js 22 LTS verified in all environments

### During Deployment
- [ ] Secrets rotated within last 30 days
- [ ] Backup restore test passed within last 7 days
- [ ] WAF blocking malicious requests (check logs)
- [ ] All security headers present in responses
- [ ] Rate limiting active and enforced

### Post-Deployment Verification
- [ ] `/health` endpoint responding
- [ ] Security monitoring active
- [ ] Error rates within normal parameters
- [ ] No security alerts triggered
- [ ] All authentication flows working

## Daily Security Monitoring

### Automated Checks
1. **Backup Status**: Weekly restore test results
2. **WAF Activity**: Blocked requests and attack patterns
3. **Rate Limiting**: API abuse attempts
4. **SSH Security**: Failed login attempts
5. **System Health**: Resource usage and performance

### Manual Checks
1. **Security Logs**: Review auth.log for suspicious activity
2. **Fail2Ban**: Check active bans and trends
3. **Cloudflare**: Review security events dashboard
4. **Application**: Monitor error rates and user reports

## Emergency Procedures

### Security Incident Response
1. **Immediate**: Enable Cloudflare "Under Attack" mode
2. **Assessment**: Check security logs and WAF events
3. **Containment**: Block malicious IPs via Cloudflare
4. **Recovery**: Scale infrastructure if needed
5. **Post-incident**: Review and update security rules

### Backup Recovery
1. **Emergency**: Use `scripts/test-backup-restore.js` for recovery
2. **Latest Backup**: S3 bucket with Object Lock protection
3. **Recovery Time**: ~15 minutes for encrypted restore
4. **Verification**: Data integrity checks included

## Evidence Collection

Each completed task includes:
- ✅ Implementation files/scripts
- ✅ Configuration examples
- ✅ Test results/screenshots
- ✅ Monitoring setup
- ✅ Documentation updates

## Compliance Status

| Control | Status | Evidence | Notes |
|---------|--------|----------|-------|
| B-2 | ✅ | Rotation script + CI | JWT/GPG keys every 60 days |
| C-3 | ✅ | Restore test script | Weekly automated tests |
| D-1 | ✅ | Cloudflare config | Gambling ruleset active |
| F-1 | ✅ | Dockerfile | Node.js 22.16 LTS |
| H-1 | ✅ | Hardening script | UFW firewall configured |
| H-2 | ✅ | SSH config | Key-only, no root, MFA ready |
| H-3 | ✅ | Fail2Ban config | Multi-layer protection |

**Overall Compliance**: 7/7 launch-blocking controls implemented ✅

Ready for production deployment with continuous security monitoring.
