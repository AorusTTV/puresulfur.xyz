
# Security Quick Reference Guide

This document provides rapid access to common security tasks, verification steps, and emergency procedures.

## Emergency Quick Actions

### Immediate Threat Response (Under Attack)
```bash
# Enable Cloudflare Under Attack Mode
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/security_level" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"value":"under_attack"}'

# Block IP at firewall level
ufw insert 1 deny from [MALICIOUS_IP]

# Check current connections
netstat -tuln | grep :443
ss -tuln | grep :443
```

### System Health Quick Check
```bash
# System resource usage
df -h                    # Disk space
free -h                  # Memory usage
top -bn1 | head -20     # CPU usage

# Service status
systemctl status nginx postgresql docker
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Security status
ufw status verbose
fail2ban-client status
journalctl -u fail2ban | tail -10
```

### Database Emergency Checks
```bash
# PostgreSQL connection test
pg_isready -h localhost -p 5432

# Check active connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Backup verification
aws s3 ls s3://backup-bucket/database-backups/ | tail -5

# Test restore (use with caution)
./scripts/test-restore.sh latest_backup.sql.gpg
```

## Security Verification Checklists

### Daily Security Checks
- [ ] Review security alert dashboard
- [ ] Check backup completion status
- [ ] Verify SSL certificate validity (>30 days)
- [ ] Review authentication failure logs
- [ ] Check system resource utilization
- [ ] Verify monitoring system health

### Weekly Security Tasks
- [ ] Update security patches
- [ ] Review user access permissions
- [ ] Analyze security event logs
- [ ] Test backup restoration process
- [ ] Verify Cloudflare WAF statistics
- [ ] Review failed login attempt patterns

### Monthly Security Reviews
- [ ] Conduct vulnerability scan
- [ ] Review and update firewall rules
- [ ] Analyze security metrics and KPIs
- [ ] Update security documentation
- [ ] Review vendor security reports
- [ ] Test incident response procedures

## Configuration Quick Commands

### Nginx Security Headers
```nginx
# Add to nginx server block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Test configuration
nginx -t && systemctl reload nginx
```

### Fail2Ban Quick Config
```bash
# Check jail status
fail2ban-client status

# Unban IP address
fail2ban-client set sshd unbanip [IP_ADDRESS]

# Add custom jail for nginx
cat >> /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
EOF

systemctl restart fail2ban
```

### SSL/TLS Quick Test
```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
openssl x509 -in /path/to/cert.pem -text -noout | grep "Not After"

# SSL Labs test (automated)
curl -s "https://api.ssllabs.com/api/v3/analyze?host=yourdomain.com" | jq .
```

## Monitoring Quick Commands

### Log Analysis
```bash
# Check recent authentication failures
grep "Failed password" /var/log/auth.log | tail -20

# Monitor real-time security events
tail -f /var/log/auth.log | grep --line-buffered "Failed\|Invalid\|Break"

# Analyze nginx access patterns
tail -f /var/log/nginx/access.log | grep -v "GET /health"

# Check for suspicious processes
ps aux | awk '{print $11}' | sort | uniq -c | sort -nr | head -20
```

### Database Monitoring
```bash
# Check PostgreSQL slow queries
psql -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Monitor active sessions
psql -c "SELECT pid, usename, application_name, client_addr, state, query_start FROM pg_stat_activity WHERE state = 'active';"

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('your_database'));"
```

### Network Security Monitoring
```bash
# Check open ports
nmap -sT -O localhost

# Monitor network connections
watch -n 5 'netstat -tuln | grep LISTEN'

# Check for unusual outbound connections
netstat -tupln | grep :443 | grep ESTABLISHED

# Monitor bandwidth usage
iftop -i eth0
```

## Incident Response Quick Steps

### Security Incident Triage (First 5 minutes)
1. **Assess Severity**
   - Is system currently under attack?
   - Are user accounts compromised?
   - Is sensitive data exposed?
   - Are financial systems affected?

2. **Immediate Actions**
   - Alert security team (#security-incidents)
   - Enable additional logging
   - Preserve evidence (don't clean up yet)
   - Document everything with timestamps

3. **Initial Containment**
   - Block malicious IPs at firewall
   - Disable compromised accounts
   - Enable Cloudflare Under Attack mode if needed
   - Isolate affected systems if necessary

### Data Breach Quick Response
1. **Stop the breach** (disconnect affected systems)
2. **Assess scope** (what data, how many users)
3. **Notify legal team** immediately
4. **Preserve evidence** (logs, system state)
5. **Begin user impact analysis**
6. **Prepare regulatory notifications** (GDPR 72-hour rule)

### DDoS Attack Quick Response
1. **Enable Cloudflare "Under Attack" mode**
2. **Monitor traffic patterns** in Cloudflare dashboard
3. **Block obvious attack patterns** with WAF rules
4. **Scale infrastructure** if possible
5. **Document attack characteristics** for analysis

## Common Security Commands

### User Account Security
```bash
# Check for suspicious user accounts
awk -F: '($3 >= 1000) {print $1, $3, $7}' /etc/passwd

# Review sudo access
grep -Po '^sudo.+:\K.*$' /etc/group

# Check for accounts with empty passwords
awk -F: '($2 == "") {print $1}' /etc/shadow

# Lock user account
usermod -L username
```

### File System Security
```bash
# Find SUID/SGID files
find / -type f \( -perm -4000 -o -perm -2000 \) -exec ls -l {} \;

# Check for world-writable files
find / -type f -perm -002 -exec ls -l {} \;

# Monitor file changes in critical directories
inotifywait -m -r -e modify,create,delete /etc /var/www /opt/app
```

### Process Security
```bash
# Check for running processes by specific user
ps -U www-data -f

# Monitor process creation
execsnoop-bpfcc

# Check for suspicious network activity by process
lsof -i -P -n | grep LISTEN
```

## Security Tool Quick Reference

### Nmap Security Scanning
```bash
# Basic port scan
nmap -sS -O target_ip

# Vulnerability scan
nmap --script vuln target_ip

# Service version detection
nmap -sV target_ip

# Comprehensive scan
nmap -sS -sV -O -A target_ip
```

### OpenSSL Commands
```bash
# Generate strong password
openssl rand -base64 32

# Test SSL certificate
openssl s_client -connect domain.com:443 -servername domain.com

# Check certificate details
openssl x509 -in certificate.crt -text -noout

# Verify certificate chain
openssl verify -CAfile ca-bundle.crt certificate.crt
```

### GPG Commands for Backup Security
```bash
# Encrypt file
gpg --symmetric --cipher-algo AES256 --compress-algo 1 file.txt

# Decrypt file
gpg --decrypt file.txt.gpg > file.txt

# List keys
gpg --list-keys

# Generate key pair
gpg --gen-key
```

## Emergency Contact Quick Access

### Critical Escalation (P1 Incidents)
- **Security Team**: security@rustskins.com | +1-XXX-XXX-XXXX
- **CTO**: cto@rustskins.com | +1-XXX-XXX-XXXX
- **CEO**: ceo@rustskins.com | +1-XXX-XXX-XXXX

### Technical Support
- **DevOps On-Call**: devops@rustskins.com | +1-XXX-XXX-XXXX
- **Cloudflare Enterprise**: [Support Portal]
- **AWS Business Support**: [Case System]

### Legal and Compliance
- **Legal Counsel**: legal@rustskins.com | +1-XXX-XXX-XXXX
- **Compliance Officer**: compliance@rustskins.com
- **PR/Communications**: pr@rustskins.com | +1-XXX-XXX-XXXX

## Status and Information Resources

### Internal Dashboards
- **Security Dashboard**: https://internal.rustskins.com/security
- **System Monitoring**: https://grafana.rustskins.com
- **Incident Management**: https://incidents.rustskins.com

### External Status Pages
- **Cloudflare Status**: https://www.cloudflarestatus.com
- **AWS Status**: https://status.aws.amazon.com
- **Payment Processor Status**: [Provider Status Page]

This quick reference should be printed and kept accessible for immediate use during security incidents.
