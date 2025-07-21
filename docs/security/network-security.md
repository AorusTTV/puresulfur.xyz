
# Network & Perimeter Security

This document covers the network-level security configurations including Cloudflare WAF, DDoS protection, and firewall setup.

## Cloudflare WAF + DDoS Protection

### Terraform Configuration

```hcl
# terraform/cloudflare.tf
resource "cloudflare_zone" "main" {
  zone = var.domain_name
  plan = "pro" # Required for advanced WAF features
}

resource "cloudflare_zone_settings_override" "main" {
  zone_id = cloudflare_zone.main.id
  
  settings {
    always_online = "on"
    automatic_https_rewrites = "on"
    ssl = "strict"
    security_level = "high"
    challenge_ttl = 1800
    
    # Under Attack Mode (can be enabled via API when needed)
    security_level = "under_attack"
  }
}

# WAF Rules for Gambling & Gaming
resource "cloudflare_ruleset" "waf_gambling" {
  zone_id = cloudflare_zone.main.id
  name    = "Gambling and Gaming WAF Rules"
  kind    = "zone"
  phase   = "http_request_firewall_managed"

  rules {
    action = "managed_challenge"
    expression = "(cf.zone.name eq \"${var.domain_name}\")"
    
    action_parameters {
      id = "efb7b8c949ac4650a09736fc376e9aee" # Cloudflare Managed Ruleset
      overrides {
        rules {
          id = "5de7edfa648c4d6891dc3e7f84534fdc" # OWASP Core Rule Set
          action = "log"
        }
        categories {
          category = "wordpress"
          action = "block"
        }
      }
    }
  }
}

# Bot Management
resource "cloudflare_bot_management" "main" {
  zone_id                = cloudflare_zone.main.id
  enable_js              = true
  fight_mode            = true
  using_latest_model    = true
  optimize_wordpress    = false
  suppress_session_score = false
}

# Rate Limiting Rules
resource "cloudflare_rate_limit" "api_protection" {
  zone_id   = cloudflare_zone.main.id
  threshold = 100
  period    = 60
  match {
    request {
      url_pattern = "${var.domain_name}/api/*"
      schemes     = ["HTTPS"]
      methods     = ["GET", "POST"]
    }
  }
  action {
    mode    = "challenge"
    timeout = 86400
  }
}
```

### Manual Cloudflare Configuration Checklist

- [ ] Enable "Gambling & Gaming" WAF ruleset in Security > WAF > Managed Rules
- [ ] Set Security Level to "High" in Security > Settings
- [ ] Enable Bot Fight Mode in Security > Bots
- [ ] Configure rate limiting for API endpoints (100 req/min per IP)
- [ ] Enable "Under Attack Mode" toggle for DDoS events
- [ ] Set up Page Rules for caching static assets
- [ ] Configure SSL/TLS to "Full (strict)" mode

**Note: Geographic restrictions have been removed as per business requirements.**

## Firewall Configuration (UFW)

```bash
#!/bin/bash
# Firewall setup script

# Reset firewall
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (change port as needed)
ufw allow 22/tcp

# Allow HTTP/HTTPS only to reverse proxy
ufw allow in on eth0 to any port 80 proto tcp
ufw allow in on eth0 to any port 443 proto tcp

# Restrict outbound to essential services only
ufw allow out 443/tcp  # HTTPS
ufw allow out 587/tcp  # SMTP submission
ufw allow out 53       # DNS

# Enable firewall
ufw --force enable

# Log all denied connections
ufw logging on
```

## Security Headers

Ensure proper security headers are implemented at the application level:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
