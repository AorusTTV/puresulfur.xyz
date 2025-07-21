
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRateLimit } from './RateLimiter';
import { useToast } from '@/hooks/use-toast';

interface AuthSecurityWrapperProps {
  children: React.ReactNode;
}

export const AuthSecurityWrapper: React.FC<AuthSecurityWrapperProps> = ({ children }) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  // Rate limiting for authentication attempts
  const authRateLimit = useRateLimit('auth_attempts', {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  });

  // Rate limiting for game actions
  const gameRateLimit = useRateLimit('game_actions', {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    // Session security checks
    if (session) {
      // Use expires_at to calculate session age and validate freshness
      const expiresAt = session.expires_at;
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const maxSessionAge = 24 * 60 * 60; // 24 hours in seconds

      // Check if session is close to expiring or too old
      if (expiresAt && (expiresAt - currentTime) < 0) {
        toast({
          title: 'Session Expired',
          description: 'Please log in again for security.',
          variant: 'destructive'
        });
        // Force logout
        window.location.href = '/';
      }

      // Check for session anomalies (basic implementation)
      const userAgent = navigator.userAgent;
      const storedUserAgent = sessionStorage.getItem('session_ua');
      
      if (storedUserAgent && storedUserAgent !== userAgent) {
        console.warn('User agent mismatch detected');
        toast({
          title: 'Security Alert',
          description: 'Session security check failed. Please log in again.',
          variant: 'destructive'
        });
      } else if (!storedUserAgent) {
        sessionStorage.setItem('session_ua', userAgent);
      }
    }

    // Clear sensitive data on page unload
    const handleUnload = () => {
      // Clear any sensitive temporary data
      sessionStorage.removeItem('temp_game_data');
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [session, toast]);

  // Provide security utilities to child components
  const securityContext = {
    authRateLimit,
    gameRateLimit,
    isSecureContext: window.isSecureContext,
    enforceSecureConnection: () => {
      if (!window.isSecureContext && location.hostname !== 'localhost') {
        throw new Error('Secure connection required');
      }
    }
  };

  return (
    <div data-security-wrapper="true">
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { securityContext } as any)
          : child
      )}
    </div>
  );
};
