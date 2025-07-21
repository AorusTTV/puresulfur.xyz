
# Security Configuration Examples

This document provides ready-to-use security configurations for common services and systems.

## Cloudflare WAF Rules

### Gaming and Gambling Protection Rules
```javascript
// Block common gambling bot patterns
(http.user_agent contains "bot" and not http.user_agent contains "googlebot" and not http.user_agent contains "bingbot") or
(http.user_agent contains "crawler") or
(http.user_agent contains "scraper") or
(http.request.uri.path contains "/api/games" and http.request.method eq "POST" and rate(5m) > 100)

// Protect sensitive API endpoints
(http.request.uri.path contains "/api/user" and http.request.method eq "POST" and rate(1m) > 10) or
(http.request.uri.path contains "/api/deposit" and rate(5m) > 20) or
(http.request.uri.path contains "/api/withdraw" and rate(10m) > 5)

// Geographic restrictions (adjust countries as needed)
(ip.geoip.country in {"CN" "RU" "KP"} and http.request.uri.path contains "/api/")

// Block suspicious SQL injection patterns
(http.request.uri.query contains "union select") or
(http.request.uri.query contains "drop table") or
(http.request.body contains "' or 1=1") or
(http.request.body contains "admin'--")
```

### Rate Limiting Configuration
```javascript
// API Rate Limiting
{
  "match": {
    "request": {
      "url_pattern": "*rustskins.com/api/*",
      "schemes": ["HTTPS"],
      "methods": ["GET", "POST", "PUT", "DELETE"]
    }
  },
  "threshold": 100,
  "period": 60,
  "action": {
    "mode": "challenge",
    "timeout": 3600
  }
}

// Authentication Rate Limiting
{
  "match": {
    "request": {
      "url_pattern": "*rustskins.com/api/auth/*",
      "schemes": ["HTTPS"],
      "methods": ["POST"]
    }
  },
  "threshold": 5,
  "period": 60,
  "action": {
    "mode": "block",
    "timeout": 1800
  }
}
```

## Nginx Security Configuration

### Complete Security Headers
```nginx
server {
    listen 443 ssl http2;
    server_name rustskins.com www.rustskins.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/rustskins.com.crt;
    ssl_certificate_key /etc/ssl/private/rustskins.com.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (2 years)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Content Security Policy for gambling site
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: https: http:;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://api.stripe.com https://www.paypal.com wss:;
        frame-src https://js.stripe.com https://www.paypal.com;
        worker-src 'self' blob:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
    " always;

    # Hide Nginx version
    server_tokens off;

    # Prevent access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;

    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers for API
        add_header X-API-Version "v1" always;
        add_header X-Rate-Limit-Remaining $limit_req_status always;
    }

    # Authentication endpoints with stricter limits
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        limit_req_status 429;
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets with caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Security.txt for responsible disclosure
    location = /.well-known/security.txt {
        add_header Content-Type text/plain;
        return 200 "Contact: security@rustskins.com\nExpires: 2025-12-31T23:59:59.000Z\nCanonical: https://rustskins.com/.well-known/security.txt\nPolicy: https://rustskins.com/security-policy\n";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name rustskins.com www.rustskins.com;
    return 301 https://$server_name$request_uri;
}
```

## Fail2Ban Configuration

### Custom Jails for Gambling Site
```ini
# /etc/fail2ban/jail.local

[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd
usedns = warn
logencoding = auto
enabled = false

# SSH Protection
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600

# Nginx HTTP Auth
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 1800

# Nginx Rate Limiting
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 600

# Custom filter for gambling site attacks
[nginx-gambling-attacks]
enabled = true
filter = nginx-gambling-attacks
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 5
findtime = 300
bantime = 7200

# API abuse protection
[nginx-api-abuse]
enabled = true
filter = nginx-api-abuse
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 20
findtime = 60
bantime = 3600

# WordPress (if used for blog/content)
[nginx-wordpress]
enabled = false
filter = nginx-wordpress
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 3
findtime = 600
bantime = 3600
```

### Custom Fail2Ban Filters
```ini
# /etc/fail2ban/filter.d/nginx-gambling-attacks.conf
[Definition]
failregex = ^<HOST> -.*"(GET|POST).*(union select|drop table|admin'--|' or 1=1|<script|javascript:|eval\(|base64_decode).*" \d+ \d+
            ^<HOST> -.*"(GET|POST).*/api/(deposit|withdraw|user|games).*" 429 \d+
            ^<HOST> -.*"(GET|POST).*(\.php|\.asp|\.jsp|wp-admin|phpmyadmin).*" \d+ \d+

ignoreregex =

# /etc/fail2ban/filter.d/nginx-api-abuse.conf
[Definition]
failregex = ^<HOST> -.*"(GET|POST|PUT|DELETE) /api/.*" 429 \d+
            ^<HOST> -.*"(POST) /api/auth/.*" 401 \d+
            ^<HOST> -.*"(POST) /api/games/.*" 400 \d+

ignoreregex =
```

## PostgreSQL Security Configuration

### Secure postgresql.conf
```conf
# Connection Settings
listen_addresses = 'localhost,10.0.0.0/8'  # Restrict to internal network
port = 5432
max_connections = 100
superuser_reserved_connections = 5

# SSL Settings
ssl = on
ssl_cert_file = '/etc/ssl/certs/postgres.crt'
ssl_key_file = '/etc/ssl/private/postgres.key'
ssl_ca_file = '/etc/ssl/certs/ca-bundle.crt'
ssl_crl_file = ''
ssl_prefer_server_ciphers = on
ssl_ciphers = 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384'
ssl_ecdh_curve = 'prime256v1'

# Authentication
password_encryption = scram-sha-256
krb_server_keyfile = ''
krb_caseins_users = off
db_user_namespace = off

# Security and Authentication
row_security = on
shared_preload_libraries = 'pg_stat_statements,auto_explain'

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_messages = warning
log_min_error_statement = error
log_min_duration_statement = 1000  # Log slow queries (1 second)
log_connections = on
log_disconnections = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_lock_waits = on
log_statement = 'ddl'  # Log schema changes
log_temp_files = 0

# Runtime Statistics
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all
stats_temp_directory = '/var/run/postgresql/stats_temp'
```

### pg_hba.conf Security
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             postgres                                peer
local   all             all                                     scram-sha-256

# IPv4 local connections
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             10.0.0.0/8              scram-sha-256

# SSL-only connections from application servers
hostssl rustskins_db    app_user        10.0.1.0/24            scram-sha-256
hostssl rustskins_db    readonly_user   10.0.2.0/24            scram-sha-256

# Deny all other connections
host    all             all             0.0.0.0/0               reject
```

## Docker Security Configuration

### Secure Dockerfile
```dockerfile
# Use specific version tags, not latest
FROM node:22.16-alpine AS base

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

# Set security environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies with audit
RUN npm ci --only=production && \
    npm audit fix --force && \
    npm cache clean --force

# Copy application code
COPY --chown=nextjs:nodejs . .

# Build application
RUN npm run build && \
    rm -rf /tmp/* /var/tmp/*

# Switch to non-root user
USER nextjs

# Expose only required port
EXPOSE 3000

# Use init system
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1
```

### Docker Compose Security
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: rustskins-app
    restart: unless-stopped
    
    # Security options
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    
    # Network security
    networks:
      - app-network
    
    # Environment variables (use secrets in production)
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    
    # Volume mounts (read-only where possible)
    volumes:
      - ./logs:/app/logs:rw
      - ./config:/app/config:ro
    
    # Port mapping (internal only)
    expose:
      - "3000"

  database:
    image: postgres:15-alpine
    container_name: rustskins-db
    restart: unless-stopped
    
    # Security options
    security_opt:
      - no-new-privileges:true
    
    # Database configuration
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    
    # Volume for persistence
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgresql.conf:/etc/postgresql/postgresql.conf:ro
      - ./pg_hba.conf:/etc/postgresql/pg_hba.conf:ro
    
    # Network isolation
    networks:
      - db-network
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  nginx:
    image: nginx:alpine
    container_name: rustskins-nginx
    restart: unless-stopped
    
    # Security options
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /var/cache/nginx
      - /var/run
    
    # Port mapping
    ports:
      - "80:80"
      - "443:443"
    
    # Configuration
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
      - nginx_logs:/var/log/nginx
    
    # Networks
    networks:
      - app-network
      - external

networks:
  app-network:
    driver: bridge
    internal: true
  db-network:
    driver: bridge
    internal: true
  external:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  nginx_logs:
    driver: local
```

## System Security Scripts

### Automated Security Updates Script
```bash
#!/bin/bash
# /usr/local/bin/security-updates.sh

set -euo pipefail

LOG_FILE="/var/log/security-updates.log"
NOTIFICATION_EMAIL="security@rustskins.com"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Start security update process
log "Starting security updates"

# Update package lists
log "Updating package lists"
apt update

# Check for security updates
SECURITY_UPDATES=$(apt list --upgradable 2>/dev/null | grep -i security || true)

if [ -n "$SECURITY_UPDATES" ]; then
    log "Security updates available:"
    echo "$SECURITY_UPDATES" | tee -a "$LOG_FILE"
    
    # Apply security updates
    log "Applying security updates"
    DEBIAN_FRONTEND=noninteractive apt -y upgrade
    
    # Check if reboot is required
    if [ -f /var/run/reboot-required ]; then
        log "Reboot required after security updates"
        # Notify administrators
        echo "Security updates applied. Reboot required." | \
            mail -s "Security Updates - Reboot Required" "$NOTIFICATION_EMAIL"
    else
        log "Security updates applied successfully"
        echo "Security updates applied successfully" | \
            mail -s "Security Updates Applied" "$NOTIFICATION_EMAIL"
    fi
else
    log "No security updates available"
fi

# Update Docker images
log "Updating Docker images"
docker image prune -f
docker pull postgres:15-alpine
docker pull nginx:alpine
docker pull node:22.16-alpine

# Restart services if needed
log "Checking services"
systemctl restart fail2ban
systemctl reload nginx

log "Security update process completed"
```

### Security Monitoring Script
```bash
#!/bin/bash
# /usr/local/bin/security-monitor.sh

set -euo pipefail

ALERT_EMAIL="security@rustskins.com"
LOG_FILE="/var/log/security-monitor.log"

# Check for failed login attempts
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | grep "$(date '+%b %d')" | wc -l)
if [ "$FAILED_LOGINS" -gt 50 ]; then
    echo "High number of failed login attempts: $FAILED_LOGINS" | \
        mail -s "Security Alert: High Failed Login Attempts" "$ALERT_EMAIL"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "Disk usage is at ${DISK_USAGE}%" | \
        mail -s "Security Alert: High Disk Usage" "$ALERT_EMAIL"
fi

# Check for suspicious processes
SUSPICIOUS_PROCS=$(ps aux | grep -E "(nc|netcat|ncat|wget|curl)" | grep -v grep | wc -l)
if [ "$SUSPICIOUS_PROCS" -gt 5 ]; then
    echo "Suspicious network processes detected" | \
        mail -s "Security Alert: Suspicious Processes" "$ALERT_EMAIL"
fi

# Check SSL certificate expiration
SSL_DAYS=$(openssl x509 -in /etc/ssl/certs/rustskins.com.crt -noout -dates | \
    grep notAfter | cut -d= -f2 | xargs -I {} date -d {} +%s)
CURRENT_DATE=$(date +%s)
DAYS_LEFT=$(( (SSL_DAYS - CURRENT_DATE) / 86400 ))

if [ "$DAYS_LEFT" -lt 30 ]; then
    echo "SSL certificate expires in $DAYS_LEFT days" | \
        mail -s "Security Alert: SSL Certificate Expiring" "$ALERT_EMAIL"
fi

# Log monitoring completion
echo "$(date '+%Y-%m-%d %H:%M:%S') - Security monitoring completed" >> "$LOG_FILE"
```

This configuration examples document provides ready-to-use, production-ready security configurations that can be directly implemented with minimal modifications.
