
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRateLimit } from '@/components/security/RateLimiter';
import { useToast } from '@/hooks/use-toast';

interface RateLimitContextType {
  attemptAuth: () => boolean;
  attemptGameAction: () => boolean;
  resetLimits: () => void;
  getAuthLimitStatus: () => { isBlocked: boolean; attemptsRemaining: number; timeUntilReset: number };
  getGameLimitStatus: () => { isBlocked: boolean; attemptsRemaining: number; timeUntilReset: number };
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

interface RateLimitProviderProps {
  children: React.ReactNode;
}

export const RateLimitProvider: React.FC<RateLimitProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  // E-1: API rate limits - 5 auth attempts per 15 minutes
  const authRateLimit = useRateLimit('auth_attempts', {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000 // 15 minutes block
  });

  // E-1: API rate limits - 100 game actions per minute
  const gameRateLimit = useRateLimit('game_actions', {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes block for games
  });

  const [rateLimitStats, setRateLimitStats] = useState({
    authBlocked: 0,
    gameBlocked: 0,
    totalAuthAttempts: 0,
    totalGameAttempts: 0
  });

  // Update stats for monitoring/Grafana
  useEffect(() => {
    const updateStats = () => {
      setRateLimitStats(prev => ({
        ...prev,
        authBlocked: authRateLimit.isBlocked ? prev.authBlocked : prev.authBlocked,
        gameBlocked: gameRateLimit.isBlocked ? prev.gameBlocked : prev.gameBlocked
      }));
    };

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [authRateLimit.isBlocked, gameRateLimit.isBlocked]);

  const attemptAuth = (): boolean => {
    const allowed = authRateLimit.attempt();
    if (allowed) {
      setRateLimitStats(prev => ({ ...prev, totalAuthAttempts: prev.totalAuthAttempts + 1 }));
    } else {
      setRateLimitStats(prev => ({ ...prev, authBlocked: prev.authBlocked + 1 }));
      
      // Log security event for monitoring
      console.warn('🔒 AUTH RATE LIMIT EXCEEDED', {
        timestamp: new Date().toISOString(),
        type: 'auth_rate_limit',
        attemptsRemaining: authRateLimit.attemptsRemaining,
        timeUntilReset: authRateLimit.timeUntilReset
      });
    }
    return allowed;
  };

  const attemptGameAction = (): boolean => {
    const allowed = gameRateLimit.attempt();
    if (allowed) {
      setRateLimitStats(prev => ({ ...prev, totalGameAttempts: prev.totalGameAttempts + 1 }));
    } else {
      setRateLimitStats(prev => ({ ...prev, gameBlocked: prev.gameBlocked + 1 }));
      
      // Log security event for monitoring
      console.warn('🔒 GAME RATE LIMIT EXCEEDED', {
        timestamp: new Date().toISOString(),
        type: 'game_rate_limit',
        attemptsRemaining: gameRateLimit.attemptsRemaining,
        timeUntilReset: gameRateLimit.timeUntilReset
      });
    }
    return allowed;
  };

  const resetLimits = () => {
    authRateLimit.reset();
    gameRateLimit.reset();
    setRateLimitStats({
      authBlocked: 0,
      gameBlocked: 0,
      totalAuthAttempts: 0,
      totalGameAttempts: 0
    });
  };

  const getAuthLimitStatus = () => ({
    isBlocked: authRateLimit.isBlocked,
    attemptsRemaining: authRateLimit.attemptsRemaining,
    timeUntilReset: authRateLimit.timeUntilReset
  });

  const getGameLimitStatus = () => ({
    isBlocked: gameRateLimit.isBlocked,
    attemptsRemaining: gameRateLimit.attemptsRemaining,
    timeUntilReset: gameRateLimit.timeUntilReset
  });

  // Expose stats for Grafana monitoring
  useEffect(() => {
    // Make stats available globally for monitoring
    (window as any).__rateLimitStats = rateLimitStats;
  }, [rateLimitStats]);

  const value: RateLimitContextType = {
    attemptAuth,
    attemptGameAction,
    resetLimits,
    getAuthLimitStatus,
    getGameLimitStatus
  };

  return (
    <RateLimitContext.Provider value={value}>
      {children}
    </RateLimitContext.Provider>
  );
};

export const useRateLimitContext = (): RateLimitContextType => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimitContext must be used within a RateLimitProvider');
  }
  return context;
};

// Export stats for external monitoring
export const getRateLimitStats = () => {
  return (window as any).__rateLimitStats || {
    authBlocked: 0,
    gameBlocked: 0,
    totalAuthAttempts: 0,
    totalGameAttempts: 0
  };
};
