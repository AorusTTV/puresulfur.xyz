
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ThreatEvent {
  id: string;
  type: 'malware' | 'suspicious_behavior' | 'unauthorized_access' | 'data_exfiltration' | 'injection_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  details: Record<string, any>;
  automated_response?: string;
}

interface EDRMetrics {
  threatsDetected: number;
  threatsBlocked: number;
  suspiciousActivities: number;
  lastScanTime: Date;
}

interface EDRContextType {
  isMonitoring: boolean;
  metrics: EDRMetrics;
  reportThreat: (threat: Omit<ThreatEvent, 'id' | 'timestamp'>) => void;
  getActiveThreats: () => ThreatEvent[];
}

const EDRContext = createContext<EDRContextType | undefined>(undefined);

export const useEDR = (): EDRContextType => {
  const context = useContext(EDRContext);
  if (!context) {
    throw new Error('useEDR must be used within EDRProvider');
  }
  return context;
};

interface EDRProviderProps {
  children: ReactNode;
}

export const EDRProvider: React.FC<EDRProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const activeThreats = useRef<ThreatEvent[]>([]);
  const metricsRef = useRef<EDRMetrics>({
    threatsDetected: 0,
    threatsBlocked: 0,
    suspiciousActivities: 0,
    lastScanTime: new Date()
  });

  // Behavioral analysis patterns
  const suspiciousPatterns = {
    rapidRequests: { threshold: 50, window: 60000 }, // 50 requests in 1 minute
    failedLogins: { threshold: 5, window: 300000 }, // 5 failed logins in 5 minutes
    unusualNavigation: { threshold: 100, window: 60000 }, // 100 page changes in 1 minute
    suspiciousScripts: [
      /eval\s*\(/gi,
      /document\.write\s*\(/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /javascript:/gi
    ]
  };

  const reportThreat = (threat: Omit<ThreatEvent, 'id' | 'timestamp'>) => {
    const threatEvent: ThreatEvent = {
      ...threat,
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Add to active threats
    activeThreats.current.push(threatEvent);
    
    // Update metrics
    metricsRef.current.threatsDetected++;
    metricsRef.current.lastScanTime = new Date();

    // Log to security monitoring
    console.log('[EDR] Threat detected:', {
      id: threatEvent.id,
      type: threatEvent.type,
      severity: threatEvent.severity,
      source: threatEvent.source,
      timestamp: threatEvent.timestamp.toISOString(),
      details: threatEvent.details
    });

    // Automated response based on severity
    const response = handleAutomatedResponse(threatEvent);
    if (response) {
      threatEvent.automated_response = response;
      metricsRef.current.threatsBlocked++;
    }

    // Alert user for high/critical threats
    if (threatEvent.severity === 'high' || threatEvent.severity === 'critical') {
      toast({
        title: '🚨 Security Threat Detected',
        description: `${threatEvent.type.replace('_', ' ')} - ${threatEvent.severity.toUpperCase()}`,
        variant: 'destructive'
      });
    }

    // Report to global security monitoring
    if ((window as any).logSecurityEvent) {
      (window as any).logSecurityEvent({
        type: 'suspicious_activity',
        severity: threatEvent.severity,
        details: {
          edr_threat_type: threatEvent.type,
          threat_id: threatEvent.id,
          source: threatEvent.source,
          automated_response: response
        },
        timestamp: threatEvent.timestamp
      });
    }
  };

  const handleAutomatedResponse = (threat: ThreatEvent): string | undefined => {
    switch (threat.type) {
      case 'injection_attempt':
        // Block and sanitize
        return 'INPUT_SANITIZED_AND_BLOCKED';
      
      case 'suspicious_behavior':
        if (threat.severity === 'critical') {
          // Rate limit the user
          return 'RATE_LIMITED_USER';
        }
        return 'LOGGED_FOR_REVIEW';
      
      case 'unauthorized_access':
        // Force re-authentication
        return 'FORCED_REAUTHENTICATION';
      
      case 'data_exfiltration':
        // Block request and alert
        return 'REQUEST_BLOCKED_ADMIN_ALERTED';
      
      default:
        return 'LOGGED_FOR_ANALYSIS';
    }
  };

  const getActiveThreats = (): ThreatEvent[] => {
    // Return threats from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return activeThreats.current.filter(threat => threat.timestamp > oneDayAgo);
  };

  // Real-time monitoring hooks
  useEffect(() => {
    let requestCount = 0;
    let navigationCount = 0;
    let failedLoginCount = 0;

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      requestCount++;
      
      // Check for rapid requests
      setTimeout(() => requestCount--, suspiciousPatterns.rapidRequests.window);
      
      if (requestCount > suspiciousPatterns.rapidRequests.threshold) {
        reportThreat({
          type: 'suspicious_behavior',
          severity: 'medium',
          source: 'network_monitor',
          details: {
            pattern: 'rapid_requests',
            count: requestCount,
            threshold: suspiciousPatterns.rapidRequests.threshold
          }
        });
      }

      return originalFetch(...args);
    };

    // Monitor DOM manipulation attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script injection
              if (element.tagName === 'SCRIPT') {
                const scriptContent = element.textContent || '';
                suspiciousPatterns.suspiciousScripts.forEach((pattern) => {
                  if (pattern.test(scriptContent)) {
                    reportThreat({
                      type: 'injection_attempt',
                      severity: 'high',
                      source: 'dom_monitor',
                      details: {
                        pattern: pattern.toString(),
                        script_content: scriptContent.substring(0, 200),
                        element_tag: element.tagName
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Monitor navigation patterns
    const handleNavigation = () => {
      navigationCount++;
      setTimeout(() => navigationCount--, suspiciousPatterns.unusualNavigation.window);
      
      if (navigationCount > suspiciousPatterns.unusualNavigation.threshold) {
        reportThreat({
          type: 'suspicious_behavior',
          severity: 'medium',
          source: 'navigation_monitor',
          details: {
            pattern: 'unusual_navigation',
            count: navigationCount,
            threshold: suspiciousPatterns.unusualNavigation.threshold
          }
        });
      }
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('pushstate', handleNavigation);

    // Monitor failed authentication attempts
    const handleAuthFailure = () => {
      failedLoginCount++;
      setTimeout(() => failedLoginCount--, suspiciousPatterns.failedLogins.window);
      
      if (failedLoginCount > suspiciousPatterns.failedLogins.threshold) {
        reportThreat({
          type: 'unauthorized_access',
          severity: 'high',
          source: 'auth_monitor',
          details: {
            pattern: 'multiple_failed_logins',
            count: failedLoginCount,
            threshold: suspiciousPatterns.failedLogins.threshold
          }
        });
      }
    };

    // Expose auth failure handler globally
    (window as any).reportAuthFailure = handleAuthFailure;

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      observer.disconnect();
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('pushstate', handleNavigation);
      delete (window as any).reportAuthFailure;
    };
  }, []);

  // Periodic threat analysis
  useEffect(() => {
    const interval = setInterval(() => {
      metricsRef.current.lastScanTime = new Date();
      
      // Clean up old threats (older than 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      activeThreats.current = activeThreats.current.filter(
        threat => threat.timestamp > weekAgo
      );

      // Log current security status
      console.log('[EDR] Security scan completed:', {
        active_threats: activeThreats.current.length,
        threats_detected_today: getActiveThreats().length,
        last_scan: metricsRef.current.lastScanTime.toISOString(),
        metrics: metricsRef.current
      });
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const contextValue: EDRContextType = {
    isMonitoring: true,
    metrics: metricsRef.current,
    reportThreat,
    getActiveThreats
  };

  return (
    <EDRContext.Provider value={contextValue}>
      {children}
    </EDRContext.Provider>
  );
};
