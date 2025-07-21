
# Cloudflare WAF Configuration for Gambling & Gaming Platform
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "rust-skins.com"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Zone configuration
resource "cloudflare_zone" "main" {
  zone = var.domain_name
  plan = "pro" # Required for advanced WAF features
}

# Zone settings with security hardening
resource "cloudflare_zone_settings_override" "security_settings" {
  zone_id = cloudflare_zone.main.id
  
  settings {
    # SSL/TLS settings
    ssl                      = "strict"
    always_use_https        = "on"
    automatic_https_rewrites = "on"
    tls_1_3                 = "on"
    min_tls_version         = "1.2"
    
    # Security settings
    security_level          = "high"
    challenge_ttl          = 1800
    browser_check          = "on"
    hotlink_protection     = "on"
    
    # Performance settings
    always_online          = "on"
    development_mode       = "off"
    
    # DDoS protection
    proxy_read_timeout     = "100"
    
    # Bot management
    bot_management = {
      enable_js              = true
      fight_mode            = true
      using_latest_model    = true
      optimize_wordpress    = false
      suppress_session_score = false
    }
  }
}

# WAF Managed Ruleset - Gambling & Gaming specific
resource "cloudflare_ruleset" "waf_gambling_gaming" {
  zone_id     = cloudflare_zone.main.id
  name        = "Gambling and Gaming WAF Protection"
  description = "Enhanced WAF rules for gambling and gaming platform"
  kind        = "zone"
  phase       = "http_request_firewall_managed"

  rules {
    action = "execute"
    action_parameters {
      id = "efb7b8c949ac4650a09736fc376e9aee" # Cloudflare Managed Ruleset
      
      overrides {
        # Enable OWASP Core Rule Set
        rules {
          id     = "5de7edfa648c4d6891dc3e7f84534fdc"
          action = "block"
          enabled = true
        }
        
        # Block known attack patterns
        categories {
          category = "owasp"
          action   = "block"
          enabled  = true
        }
        
        # Monitor WordPress attacks (not applicable but keeping for completeness)
        categories {
          category = "wordpress"
          action   = "log"
          enabled  = true
        }
        
        # Block malicious bots
        categories {
          category = "malicious-bots"
          action   = "block"
          enabled  = true
        }
      }
    }
    
    expression = "(http.host eq \"${var.domain_name}\")"
    description = "Apply managed rules to main domain"
    enabled = true
  }
}

# Custom WAF Rules for Gaming Platform
resource "cloudflare_ruleset" "custom_gaming_rules" {
  zone_id     = cloudflare_zone.main.id
  name        = "Custom Gaming Platform Rules"
  description = "Custom security rules for gaming platform"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  # Block requests with gambling-related malicious patterns
  rules {
    action = "block"
    expression = "(http.request.body contains \"script\" and http.request.body contains \"gambling\") or (http.request.uri.path contains \"../\" and http.request.uri.path contains \"admin\")"
    description = "Block potential XSS and path traversal attacks targeting gambling sites"
    enabled = true
  }

  # Rate limit API endpoints
  rules {
    action = "challenge"
    expression = "(http.request.uri.path matches \"^/api/(auth|payment|deposit)\" and cf.client.bot) or (http.request.uri.path matches \"^/api/\" and rate(1m) > 100)"
    description = "Challenge suspicious API requests and high-rate requests"
    enabled = true
  }

  # Block known bad user agents
  rules {
    action = "block"
    expression = "(http.user_agent contains \"sqlmap\") or (http.user_agent contains \"nikto\") or (http.user_agent contains \"netsparker\")"
    description = "Block known scanning tools"
    enabled = true
  }

  # Geographic restrictions - DISABLED - Removed geo-blocking control
  # rules {
  #   action = "block"
  #   expression = "(ip.geoip.country in {\"CN\" \"RU\" \"KP\"}) and not cf.client.bot"
  #   description = "Block traffic from restricted countries (DISABLED - geo-blocking removed)"
  #   enabled = false
  # }
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
      methods     = ["GET", "POST", "PUT", "DELETE"]
    }
  }
  
  action {
    mode    = "challenge"
    timeout = 3600
    response {
      content_type = "application/json"
      body         = "{\"error\":\"Rate limit exceeded\",\"retry_after\":3600}"
    }
  }
  
  correlate {
    by = "ip"
  }

  disabled = false
  description = "Protect API endpoints from abuse"
}

# Authentication endpoint rate limiting
resource "cloudflare_rate_limit" "auth_protection" {
  zone_id   = cloudflare_zone.main.id
  threshold = 5
  period    = 900 # 15 minutes
  
  match {
    request {
      url_pattern = "${var.domain_name}/api/auth/*"
      schemes     = ["HTTPS"]
      methods     = ["POST"]
    }
  }
  
  action {
    mode    = "block"
    timeout = 1800
  }
  
  correlate {
    by = "ip"
  }

  disabled = false
  description = "Prevent brute force attacks on authentication"
}

# Page Rules for static content caching
resource "cloudflare_page_rule" "static_content_cache" {
  zone_id  = cloudflare_zone.main.id
  target   = "${var.domain_name}/static/*"
  priority = 1
  
  actions {
    cache_level         = "cache_everything"
    edge_cache_ttl     = 86400
    browser_cache_ttl  = 3600
  }
}

# DNS Records
resource "cloudflare_record" "main" {
  zone_id = cloudflare_zone.main.id
  name    = "@"
  value   = var.server_ip_address
  type    = "A"
  ttl     = 1 # Auto TTL
  proxied = true # Enable Cloudflare proxy for DDoS protection
}

resource "cloudflare_record" "www" {
  zone_id = cloudflare_zone.main.id
  name    = "www"
  value   = var.domain_name
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

# Outputs
output "zone_id" {
  description = "Cloudflare Zone ID"
  value       = cloudflare_zone.main.id
}

output "zone_name_servers" {
  description = "Cloudflare name servers"
  value       = cloudflare_zone.main.name_servers
}

output "waf_ruleset_ids" {
  description = "WAF Ruleset IDs"
  value = {
    gambling_gaming = cloudflare_ruleset.waf_gambling_gaming.id
    custom_rules    = cloudflare_ruleset.custom_gaming_rules.id
  }
}

# Variables for server IP
variable "server_ip_address" {
  description = "Server IP address for DNS records"
  type        = string
  default     = "127.0.0.1"
}
