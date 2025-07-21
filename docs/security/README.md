
# Security Infrastructure Documentation

This directory contains comprehensive security documentation for the Rust-skins gambling site infrastructure.

## Documentation Structure

### Core Security Components
- [Network & Perimeter Security](./network-security.md) - Cloudflare WAF, DDoS protection, and firewall configuration
- [Platform & Runtime Security](./platform-security.md) - Node.js updates, Docker hardening, and CI/CD pipeline
- [Data Protection & Backup](./data-protection.md) - Database backup strategies and ransomware resilience
- [Server Hardening](./server-hardening.md) - SSH, firewall, and operational security configuration
- [Monitoring & Observability](./monitoring.md) - Grafana dashboards, alerting, and incident response

### Deployment & Operations
- [Deployment Checklist](./deployment-checklist.md) - Pre-launch verification and post-launch monitoring
- [Emergency Procedures](./emergency-procedures.md) - Incident response overview and contacts
- [Incident Response Playbook](./incident-response.md) - Detailed response procedures and classifications
- [Business Continuity Plan](./business-continuity.md) - Recovery procedures and communication protocols

### Quick Reference
- [Security Checklists](./quick-reference.md) - Common security tasks and verification steps
- [Configuration Examples](./config-examples.md) - Ready-to-use security configurations

## Quick Start Guide

1. **Initial Setup**: Start with [Network Security](./network-security.md) configuration
2. **Platform Security**: Follow [Platform Security](./platform-security.md) for Node.js and CI/CD setup
3. **Data Protection**: Implement [Data Protection](./data-protection.md) backup and encryption
4. **System Hardening**: Complete [Server Hardening](./server-hardening.md) procedures
5. **Monitoring**: Set up [Monitoring](./monitoring.md) dashboards and alerts
6. **Final Verification**: Use [Deployment Checklist](./deployment-checklist.md) before going live

## Emergency Response Quick Access

- **Incident Reporting**: See [Emergency Procedures](./emergency-procedures.md#emergency-contacts)
- **Response Classification**: Check [Incident Response](./incident-response.md#incident-classification)
- **Recovery Procedures**: Follow [Business Continuity](./business-continuity.md#recovery-procedures)

## Security Requirements

This documentation implements enterprise-grade security suitable for a gambling platform handling real money transactions. All configurations should be reviewed by a qualified security professional before production deployment.

## Cross-Reference Index

- **Cloudflare Configuration**: [Network Security](./network-security.md#cloudflare-waf--ddos-protection)
- **Backup Testing**: [Data Protection](./data-protection.md#backup-testing-and-verification)
- **Alert Configuration**: [Monitoring](./monitoring.md#alert-manager-configuration)
- **SSH Hardening**: [Server Hardening](./server-hardening.md#ssh-configuration)
- **Incident Response**: [Emergency Procedures](./emergency-procedures.md) + [Incident Response](./incident-response.md)
