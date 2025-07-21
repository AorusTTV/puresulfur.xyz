
import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  type: 'auth_attempt' | 'game_action' | 'balance_change' | 'suspicious_activity';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMetrics {
  authFailures: number;
  gameActions: number;
  balanceChanges: number;
  suspiciousEvents: number;
}

export const SecurityMonitor: React.FC = () => {
  const { toast } = useToast();
  const metricsRef = useRef<SecurityMetrics>({
    authFailures: 0,
    gameActions: 0,
    balanceChanges: 0,
    suspiciousEvents: 0
  });

  // Log security events to console (would integrate with Winston/Loki in production)
  const logSecurityEvent = (event: SecurityEvent) => {
    const logEntry = {
      timestamp: event.timestamp.toISOString(),
      type: event.type,
      severity: event.severity,
      userId: event.userId || 'anonymous',
      ip: getClientIP(),
      userAgent: navigator.userAgent,
      details: event.details
    };

    // In production, this would send to centralized logging
    console.log('[SECURITY]', JSON.stringify(logEntry));

    // Update metrics
    switch (event.type) {
      case 'auth_attempt':
        if (event.details.success === false) {
          metricsRef.current.authFailures++;
        }
        break;
      case 'game_action':
        metricsRef.current.gameActions++;
        break;
      case 'balance_change':
        metricsRef.current.balanceChanges++;
        break;
      case 'suspicious_activity':
        metricsRef.current.suspiciousEvents++;
        break;
    }

    // Trigger alerts for high severity events
    if (event.severity === 'critical' || event.severity === 'high') {
      toast({
        title: 'Security Alert',
        description: `${event.type} detected`,
        variant: 'destructive'
      });
    }
  };

  const getClientIP = (): string => {
    // In production, this would be obtained from headers set by Cloudflare
    return 'client-ip-masked';
  };

  // Monitor for suspicious patterns
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = metricsRef.current;
      
      // Check for unusual patterns (simplified detection)
      if (metrics.authFailures > 10) {
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          details: { pattern: 'excessive_auth_failures', count: metrics.authFailures },
          timestamp: new Date()
        });
      }

      if (metrics.gameActions > 100) {
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: { pattern: 'high_game_activity', count: metrics.gameActions },
          timestamp: new Date()
        });
      }

      // Reset metrics every 5 minutes
      metricsRef.current = {
        authFailures: 0,
        gameActions: 0,
        balanceChanges: 0,
        suspiciousEvents: 0
      };
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Expose logging function globally for use by other components
  useEffect(() => {
    (window as any).logSecurityEvent = logSecurityEvent;
    
    return () => {
      delete (window as any).logSecurityEvent;
    };
  }, []);

  return null; // This is a monitoring component with no UI
};
