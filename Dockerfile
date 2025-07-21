
# Multi-stage Dockerfile with Node 22 LTS and enhanced security
FROM node:22.16-alpine AS base

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Security: Install security updates and required packages
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    curl \
    aws-cli \
    gnupg \
    && rm -rf /var/cache/apk/*

# Security: Set secure defaults
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=production
ENV NPM_CONFIG_AUDIT=true
ENV NPM_CONFIG_AUDIT_LEVEL=high

WORKDIR /app

# Dependencies installation stage
FROM base AS deps
COPY package*.json ./
COPY bun.lockb ./

# Security: Run npm audit and install dependencies
RUN npm ci --only=production --audit && \
    npm audit fix --force && \
    npm cache clean --force

# Build stage
FROM base AS builder
COPY package*.json ./
COPY bun.lockb ./

# Install all dependencies for build
RUN npm ci --audit && npm audit fix --force

# Copy source code
COPY . .

# Security: Remove any potential secrets from source
RUN find . -name "*.env*" -delete || true && \
    find . -name "*secret*" -type f -delete || true && \
    find . -name "*key*" -type f -not -path "./node_modules/*" -delete || true

# Build application
RUN npm run build && \
    npm run security:audit

# Security: Scan build output for potential secrets
RUN echo "Scanning build output for potential secrets..." && \
    (find dist/ -type f -name "*.js" -exec grep -l -i "password\|secret\|key\|token" {} \; || echo "No obvious secrets found in build output")

# Production stage
FROM base AS runner

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy secrets initialization script
COPY --from=builder /app/scripts/start-with-secrets.js ./scripts/start-with-secrets.js

# Security: Set ownership and permissions
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
RUN chmod +x ./scripts/start-with-secrets.js

# Security: Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Security: Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application with secrets initialization
CMD ["node", "scripts/start-with-secrets.js"]
