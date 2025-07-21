
import React, { useEffect } from 'react';
import { SecurityAlerting } from './SecurityAlerting';
import { SecurityMonitor } from './SecurityMonitor';

// Global security monitoring component that tracks various security events
export const GlobalSecurityMonitor: React.FC = () => {
  useEffect(() => {
    // Override fetch to monitor HTTP errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Track 5xx errors for alerting
        if (response.status >= 500) {
          if ((window as any).__recordSecurityMetric) {
            (window as any).__recordSecurityMetric('5xx_error', 1);
          }
        }
        
        return response;
      } catch (error) {
        // Network errors
        if ((window as any).__recordSecurityMetric) {
          (window as any).__recordSecurityMetric('5xx_error', 1);
        }
        throw error;
      }
    };

    // Monitor auth failures
    const monitorAuthFailures = (error: any) => {
      if (error?.message?.includes('Invalid login credentials') || 
          error?.message?.includes('Email not confirmed')) {
        if ((window as any).__recordSecurityMetric) {
          (window as any).__recordSecurityMetric('auth_failure', 1);
        }
      }
    };

    // Listen for auth errors (would need to be integrated with auth context)
    window.addEventListener('auth-error', monitorAuthFailures);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('auth-error', monitorAuthFailures);
    };
  }, []);

  return (
    <>
      <SecurityAlerting />
      <SecurityMonitor />
    </>
  );
};
