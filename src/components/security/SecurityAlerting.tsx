import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: '5xx_error_spike' | 'auth_failure_spike' | 'ddos_detected' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface SecurityMetrics {
  errorCount5xx: number;
  authFailures: number;
  requestRate: number;
  lastReset: Date;
}

export const SecurityAlerting: React.FC = () => {
  const { toast } = useToast();
  const metricsRef = useRef<SecurityMetrics>({
    errorCount5xx: 0,
    authFailures: 0,
    requestRate: 0,
    lastReset: new Date()
  });
  
  const alertHistoryRef = useRef<SecurityAlert[]>([]);
  const baselineRef = useRef({
    avg5xxRate: 0,
    avgAuthFailRate: 0,
    avgRequestRate: 0
  });

  // G-2: Alert Rules Implementation
  useEffect(() => {
    const alertInterval = setInterval(() => {
      checkSecurityMetrics();
    }, 30000); // Check every 30 seconds

    const resetInterval = setInterval(() => {
      resetMetrics();
    }, 300000); // Reset every 5 minutes

    return () => {
      clearInterval(alertInterval);
      clearInterval(resetInterval);
    };
  }, []);

  const checkSecurityMetrics = () => {
    const metrics = metricsRef.current;
    const now = new Date();
    
    // Check for 5xx error spike (≥5× baseline in 5 min)
    if (metrics.errorCount5xx > 0) {
      const currentRate = metrics.errorCount5xx / 5; // errors per minute
      const threshold = Math.max(baselineRef.current.avg5xxRate * 5, 5); // At least 5 errors
      
      if (currentRate >= threshold) {
        triggerAlert({
          id: `5xx_spike_${now.getTime()}`,
          type: '5xx_error_spike',
          severity: 'critical',
          message: `High 5xx error rate detected: ${currentRate.toFixed(1)} errors/min (threshold: ${threshold.toFixed(1)})`,
          timestamp: now,
          metadata: {
            currentRate,
            threshold,
            errorCount: metrics.errorCount5xx
          }
        });
      }
    }

    // Check for auth failure spike (10 failed logins in 5 min)
    if (metrics.authFailures >= 10) {
      triggerAlert({
        id: `auth_spike_${now.getTime()}`,
        type: 'auth_failure_spike',
        severity: 'high',
        message: `Authentication failure spike detected: ${metrics.authFailures} failures in 5 minutes`,
        timestamp: now,
        metadata: {
          failureCount: metrics.authFailures,
          threshold: 10
        }
      });
    }

    // Update baselines (simple moving average)
    updateBaselines(metrics);
  };

  const updateBaselines = (metrics: SecurityMetrics) => {
    const alpha = 0.1; // Smoothing factor
    baselineRef.current.avg5xxRate = 
      alpha * (metrics.errorCount5xx / 5) + (1 - alpha) * baselineRef.current.avg5xxRate;
    baselineRef.current.avgAuthFailRate = 
      alpha * (metrics.authFailures / 5) + (1 - alpha) * baselineRef.current.avgAuthFailRate;
  };

  const triggerAlert = (alert: SecurityAlert) => {
    // Prevent duplicate alerts within 5 minutes
    const recentAlert = alertHistoryRef.current.find(
      a => a.type === alert.type && 
      (alert.timestamp.getTime() - a.timestamp.getTime()) < 300000
    );
    
    if (recentAlert) return;

    alertHistoryRef.current.push(alert);
    
    // Keep only last 100 alerts
    if (alertHistoryRef.current.length > 100) {
      alertHistoryRef.current = alertHistoryRef.current.slice(-100);
    }

    // Log security event for monitoring
    console.error('🚨 SECURITY ALERT', {
      ...alert,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Show toast notification
    toast({
      title: getAlertTitle(alert.type),
      description: alert.message,
      variant: alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'default'
    });

    // Send to external monitoring (would integrate with Slack/OpsGenie in production)
    sendToMonitoring(alert);
  };

  const getAlertTitle = (type: SecurityAlert['type']): string => {
    switch (type) {
      case '5xx_error_spike': return '🔥 Server Error Spike';
      case 'auth_failure_spike': return '🔒 Authentication Attack';
      case 'ddos_detected': return '⚡ DDoS Activity';
      case 'suspicious_activity': return '👁️ Suspicious Activity';
      default: return '⚠️ Security Alert';
    }
  };

  const sendToMonitoring = async (alert: SecurityAlert) => {
    // In production, this would send to Slack, OpsGenie, etc.
    // For now, we'll just expose it globally for monitoring systems
    if (typeof window !== 'undefined') {
      (window as any).__securityAlerts = (window as any).__securityAlerts || [];
      (window as any).__securityAlerts.push(alert);
    }
  };

  const resetMetrics = () => {
    metricsRef.current = {
      errorCount5xx: 0,
      authFailures: 0,
      requestRate: 0,
      lastReset: new Date()
    };
  };

  // Expose metrics collection functions globally
  useEffect(() => {
    (window as any).__recordSecurityMetric = (type: string, value: number = 1) => {
      const metrics = metricsRef.current;
      switch (type) {
        case '5xx_error':
          metrics.errorCount5xx += value;
          break;
        case 'auth_failure':
          metrics.authFailures += value;
          break;
        case 'request':
          metrics.requestRate += value;
          break;
      }
    };

    return () => {
      delete (window as any).__recordSecurityMetric;
    };
  }, []);

  return null; // This is a monitoring component with no UI
};
