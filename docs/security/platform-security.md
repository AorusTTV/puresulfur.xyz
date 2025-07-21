
# Platform & Runtime Security

This document covers Node.js version updates, Docker hardening, and CI/CD security pipeline configuration.

## Node.js Version Update

### Dockerfile

```dockerfile
# Use Node 22 LTS (supported until 2027)
FROM node:22.16-alpine AS base

# Security hardening
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set security headers
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies with security audit
RUN npm ci --only=production && npm audit fix --force

# Copy application code
COPY --chown=nextjs:nodejs . .

# Build application
RUN npm run build

USER nextjs

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

## CI/CD Pipeline Security

### GitHub Actions Workflow (.github/workflows/security.yml)

```yaml
name: Security Checks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22.16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: |
          npm audit --audit-level high --production
          npm audit fix --force
          
      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --fail-on=upgradable
          
      - name: GitHub Security Advisory
        run: |
          npm audit --audit-level high --json > audit-results.json
          if [ $(jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' audit-results.json) -gt 0 ]; then
            echo "High or critical vulnerabilities found"
            exit 1
          fi

  dependabot-auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Enable auto-merge for Dependabot PRs
        run: gh pr merge --auto --merge "$PR_URL"
        env:
          PR_URL: ${{github.event.pull_request.html_url}}
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

### Dependabot Configuration (.github/dependabot.yml)

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    assignees:
      - "lead-developer"
    commit-message:
      prefix: "security"
      include: "scope"
    labels:
      - "security"
      - "dependencies"
    # Auto-merge security updates
    auto-merge:
      enabled: true
      merge-method: "merge"
```

## Security Scripts

The following npm scripts should be added to package.json:

```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level high",
    "security:audit-fix": "npm audit fix --force",
    "security:scan": "npm run security:audit && npm run security:dependencies",
    "security:dependencies": "npx @snyk/cli test --severity-threshold=high",
    "security:update": "npx npm-check-updates -u && npm install",
    "prebuild": "npm run security:audit"
  }
}
```

## Runtime Configuration

### Engine Requirements

```json
{
  "engines": {
    "node": ">=22.16.0",
    "npm": ">=10.0.0"
  }
}
```

### NPM Security Configuration

```json
{
  "npmConfig": {
    "audit": true,
    "audit-level": "high",
    "fund": false
  }
}
```
