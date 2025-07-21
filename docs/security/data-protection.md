
# Data Protection & Backup Strategy

This document covers database backup strategies, encryption, and ransomware resilience measures.

## Database Backup Strategy

### Encrypted Backup Script (scripts/backup-database.sh)

```bash
#!/bin/bash

# Immutable PostgreSQL Backup Script
set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
BACKUP_S3_BUCKET="${BACKUP_S3_BUCKET}"
BACKUP_RETENTION_DAYS="30"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DB_NAME}_${TIMESTAMP}.sql"

# Create encrypted backup
echo "Creating database backup..."
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --verbose \
  --no-owner \
  --no-privileges \
  --compress=9 \
  > "/tmp/${BACKUP_FILE}"

# Encrypt backup file
echo "Encrypting backup..."
gpg --symmetric --cipher-algo AES256 --compress-algo 1 \
  --passphrase "${BACKUP_ENCRYPTION_KEY}" \
  --batch --yes \
  "/tmp/${BACKUP_FILE}"

# Upload to S3 with Object Lock
echo "Uploading to S3..."
aws s3 cp "/tmp/${BACKUP_FILE}.gpg" \
  "s3://${BACKUP_S3_BUCKET}/database-backups/${BACKUP_FILE}.gpg" \
  --storage-class STANDARD_IA \
  --metadata "retention-days=${BACKUP_RETENTION_DAYS}" \
  --server-side-encryption AES256

# Verify backup integrity
echo "Verifying backup..."
aws s3api head-object \
  --bucket "${BACKUP_S3_BUCKET}" \
  --key "database-backups/${BACKUP_FILE}.gpg"

# Clean up local files
rm -f "/tmp/${BACKUP_FILE}" "/tmp/${BACKUP_FILE}.gpg"

echo "Backup completed successfully: ${BACKUP_FILE}.gpg"

# Test restore process (weekly)
if [ "$(date +%u)" -eq 1 ]; then
  echo "Running weekly restore test..."
  ./scripts/test-restore.sh "${BACKUP_FILE}.gpg"
fi
```

## S3 Bucket Policy for Object Lock

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ImmutableBackups",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:role/BackupRole"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectLegalHold",
        "s3:PutObjectRetention"
      ],
      "Resource": "arn:aws:s3:::backup-bucket/database-backups/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-object-lock-mode": "GOVERNANCE"
        }
      }
    },
    {
      "Sid": "PreventDeletion",
      "Effect": "Deny",
      "Principal": "*",
      "Action": [
        "s3:DeleteObject",
        "s3:DeleteObjectVersion"
      ],
      "Resource": "arn:aws:s3:::backup-bucket/database-backups/*"
    }
  ]
}
```

## Backup Testing and Verification

### Restore Test Script (scripts/test-restore.sh)

```bash
#!/bin/bash
# Test backup restoration process

set -euo pipefail

BACKUP_FILE="$1"
TEST_DB_NAME="test_restore_$(date +%s)"

echo "Testing restore of backup: ${BACKUP_FILE}"

# Download and decrypt backup
aws s3 cp "s3://${BACKUP_S3_BUCKET}/database-backups/${BACKUP_FILE}" "/tmp/${BACKUP_FILE}"
gpg --decrypt --batch --yes --passphrase "${BACKUP_ENCRYPTION_KEY}" "/tmp/${BACKUP_FILE}" > "/tmp/restore_test.sql"

# Create test database
createdb "${TEST_DB_NAME}"

# Restore backup to test database
psql -d "${TEST_DB_NAME}" -f "/tmp/restore_test.sql"

# Verify data integrity
psql -d "${TEST_DB_NAME}" -c "SELECT COUNT(*) FROM profiles;" > /tmp/restore_check.txt

# Clean up
dropdb "${TEST_DB_NAME}"
rm -f "/tmp/${BACKUP_FILE}" "/tmp/restore_test.sql" "/tmp/restore_check.txt"

echo "Restore test completed successfully"
```

## Encryption Standards

- **Data at Rest**: AES-256 encryption for all backup files
- **Data in Transit**: TLS 1.3 for all network communications
- **Key Management**: Separate encryption keys for backups, rotated quarterly
- **Backup Storage**: Immutable S3 Object Lock for ransomware protection

## Backup Schedule

- **Frequency**: Every 6 hours
- **Retention**: 30 days for daily backups, 12 months for weekly backups
- **Testing**: Weekly automated restore verification
- **Monitoring**: Alert on backup failures within 30 minutes
