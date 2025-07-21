
# AWS Systems Manager Parameter Store for Secrets Management
# Terraform configuration for secure secrets storage

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
  default     = "prod"
}

# KMS Key for parameter encryption
resource "aws_kms_key" "secrets_key" {
  description             = "KMS key for encrypting application secrets"
  deletion_window_in_days = 7

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "rust-skins-secrets-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "secrets_key_alias" {
  name          = "alias/rust-skins-secrets"
  target_key_id = aws_kms_key.secrets_key.key_id
}

data "aws_caller_identity" "current" {}

# Database credentials
resource "aws_ssm_parameter" "db_url" {
  name        = "/rust-skins/${var.environment}/database/connection-url"
  description = "Supabase database connection URL"
  type        = "SecureString"
  value       = "postgresql://[REDACTED]@[REDACTED].supabase.co:5432/postgres"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "database"
  }
}

resource "aws_ssm_parameter" "supabase_anon_key" {
  name        = "/rust-skins/${var.environment}/supabase/anon-key"
  description = "Supabase anonymous key"
  type        = "SecureString"
  value       = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[REDACTED]"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "supabase"
  }
}

resource "aws_ssm_parameter" "supabase_service_role_key" {
  name        = "/rust-skins/${var.environment}/supabase/service-role-key"
  description = "Supabase service role key"
  type        = "SecureString"
  value       = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[REDACTED]"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "supabase"
  }
}

# JWT secrets
resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/rust-skins/${var.environment}/auth/jwt-secret"
  description = "JWT signing secret"
  type        = "SecureString"
  value       = "[REDACTED-256-BIT-SECRET]"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "auth"
  }
}

# Steam API credentials
resource "aws_ssm_parameter" "steam_api_key" {
  name        = "/rust-skins/${var.environment}/steam/api-key"
  description = "Steam Web API key"
  type        = "SecureString"
  value       = "[REDACTED-STEAM-API-KEY]"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "steam"
  }
}

# Payment gateway secrets
resource "aws_ssm_parameter" "stripe_secret_key" {
  name        = "/rust-skins/${var.environment}/payments/stripe-secret"
  description = "Stripe secret key"
  type        = "SecureString"
  value       = "sk_live_[REDACTED]"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "payments"
  }
}

resource "aws_ssm_parameter" "paypal_client_secret" {
  name        = "/rust-skins/${var.environment}/payments/paypal-secret"
  description = "PayPal client secret"
  type        = "SecureString"
  value       = "[REDACTED-PAYPAL-SECRET]"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "payments"
  }
}

# GPG keys for secure communications
resource "aws_ssm_parameter" "gpg_private_key" {
  name        = "/rust-skins/${var.environment}/security/gpg-private-key"
  description = "GPG private key for secure operations"
  type        = "SecureString"
  value       = "-----BEGIN PGP PRIVATE KEY BLOCK-----\n[REDACTED]\n-----END PGP PRIVATE KEY BLOCK-----"
  key_id      = aws_kms_key.secrets_key.arn

  tags = {
    Environment = var.environment
    Service     = "security"
  }
}

# IAM role for application to access secrets
resource "aws_iam_role" "app_secrets_role" {
  name = "rust-skins-secrets-access-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = ["ec2.amazonaws.com", "ecs-tasks.amazonaws.com"]
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
  }
}

resource "aws_iam_policy" "secrets_read_policy" {
  name        = "rust-skins-secrets-read-${var.environment}"
  description = "Policy to read secrets from Parameter Store"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/rust-skins/${var.environment}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = [
          aws_kms_key.secrets_key.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "app_secrets_policy" {
  role       = aws_iam_role.app_secrets_role.name
  policy_arn = aws_iam_policy.secrets_read_policy.arn
}

# Outputs
output "kms_key_id" {
  description = "KMS key ID for secrets encryption"
  value       = aws_kms_key.secrets_key.key_id
  sensitive   = true
}

output "parameter_store_paths" {
  description = "Parameter Store paths created"
  value = [
    aws_ssm_parameter.db_url.name,
    aws_ssm_parameter.supabase_anon_key.name,
    aws_ssm_parameter.supabase_service_role_key.name,
    aws_ssm_parameter.jwt_secret.name,
    aws_ssm_parameter.steam_api_key.name,
    aws_ssm_parameter.stripe_secret_key.name,
    aws_ssm_parameter.paypal_client_secret.name,
    aws_ssm_parameter.gpg_private_key.name
  ]
}

output "secrets_access_role_arn" {
  description = "IAM role ARN for accessing secrets"
  value       = aws_iam_role.app_secrets_role.arn
}
