
# Monitoring & Observability

This document covers Grafana dashboards, alert management, and security monitoring configuration.

## Grafana Dashboard Configuration

### Security Monitoring Dashboard (monitoring/grafana-dashboard.json)

```json
{
  "dashboard": {
    "id": null,
    "title": "Rust Skins Security Monitoring",
    "tags": ["security", "gambling", "monitoring"],
    "timezone": "UTC",
    "panels": [
      {
        "id": 1,
        "title": "Authentication Failures",
        "type": "graph",
        "targets": [
          {
            "expr": "increase(auth_failures_total[5m])",
            "legendFormat": "Failed Logins"
          }
        ],
        "alert": {
          "name": "High Auth Failures",
          "conditions": [
            {
              "query": {"queryType": "", "refId": "A"},
              "reducer": {"params": [], "type": "last"},
              "evaluator": {"params": [10], "type": "gt"}
            }
          ],
          "executionErrorState": "alerting",
          "noDataState": "no_data",
          "frequency": "10s"
        }
      },
      {
        "id": 2,
        "title": "Betting Volume Anomalies",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(bet_amount_total[5m])",
            "legendFormat": "Bet Volume (5min rate)"
          }
        ],
        "alert": {
          "name": "Unusual Betting Volume",
          "conditions": [
            {
              "query": {"queryType": "", "refId": "A"},
              "reducer": {"params": [], "type": "avg"},
              "evaluator": {"params": [1000], "type": "gt"}
            }
          ]
        }
      },
      {
        "id": 3,
        "title": "5xx Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx Rate"
          }
        ],
        "alert": {
          "name": "High Error Rate",
          "conditions": [
            {
              "query": {"queryType": "", "refId": "A"},
              "reducer": {"params": [], "type": "avg"},
              "evaluator": {"params": [0.1], "type": "gt"}
            }
          ]
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

## Alert Manager Configuration

### Alert Manager Setup (monitoring/alertmanager.yml)

```yaml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@rustskins.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'security-team'
  routes:
  - match:
      severity: critical
    receiver: 'security-critical'

receivers:
- name: 'security-team'
  email_configs:
  - to: 'security@rustskins.com'
    subject: '[SECURITY] {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ range .Labels.SortedPairs }}
        - {{ .Name }}: {{ .Value }}{{ end }}
      {{ end }}

- name: 'security-critical'
  email_configs:
  - to: 'security@rustskins.com,cto@rustskins.com'
    subject: '[CRITICAL SECURITY] {{ .GroupLabels.alertname }}'
  slack_configs:
  - api_url: '{{ .SlackWebhookURL }}'
    channel: '#security-alerts'
    title: 'Critical Security Alert'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

## Security Metrics and KPIs

### Key Security Indicators

- **Authentication Failures**: > 10 failures per 5 minutes
- **Betting Volume Anomalies**: > 1000 bets per 5 minutes
- **Error Rate**: > 10% 5xx errors
- **Response Time**: > 2 seconds average
- **Failed Logins**: Geographic clustering detection
- **Bot Activity**: Unusual user agent patterns

### Monitoring Endpoints

- `/health` - Application health check
- `/metrics` - Prometheus metrics endpoint  
- `/security/events` - Security event logging
- `/api/status` - API status and performance

## Log Management

### Centralized Logging with Loki

- **Security Events**: Authentication, authorization, suspicious activity
- **Application Logs**: Errors, warnings, performance metrics
- **Access Logs**: HTTP requests, API calls, user actions
- **Database Logs**: Query performance, connection issues

### Log Retention Policy

- **Security Logs**: 1 year retention
- **Application Logs**: 90 days retention
- **Access Logs**: 30 days retention
- **Debug Logs**: 7 days retention

## Incident Response

### Alert Severity Levels

1. **Critical**: Immediate response required (< 15 minutes)
2. **High**: Response within 1 hour
3. **Medium**: Response within 4 hours
4. **Low**: Response within 24 hours

### Escalation Matrix

- **Level 1**: Security team notification
- **Level 2**: Management notification + Slack alert
- **Level 3**: Executive notification + Phone call
- **Level 4**: External security consultant engagement
