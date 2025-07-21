
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  isBlocked: boolean;
  blockEnd: number;
}

export const useRateLimit = (key: string, config: RateLimitConfig) => {
  const { toast } = useToast();
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(`rateLimit_${key}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        
        // Check if block has expired
        if (parsed.isBlocked && now > parsed.blockEnd) {
          return { attempts: 0, windowStart: now, isBlocked: false, blockEnd: 0 };
        }
        
        // Check if window has expired
        if (now - parsed.windowStart > config.windowMs) {
          return { attempts: 0, windowStart: now, isBlocked: false, blockEnd: 0 };
        }
        
        return parsed;
      } catch {
        return { attempts: 0, windowStart: Date.now(), isBlocked: false, blockEnd: 0 };
      }
    }
    return { attempts: 0, windowStart: Date.now(), isBlocked: false, blockEnd: 0 };
  });

  useEffect(() => {
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(state));
  }, [key, state]);

  const attempt = (): boolean => {
    const now = Date.now();
    
    // Check if currently blocked
    if (state.isBlocked && now < state.blockEnd) {
      const remainingMs = state.blockEnd - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      toast({
        title: 'Rate Limited',
        description: `Too many attempts. Please wait ${remainingMinutes} minute(s) before trying again.`,
        variant: 'destructive'
      });
      return false;
    }

    // Reset if block expired
    if (state.isBlocked && now >= state.blockEnd) {
      setState({ attempts: 0, windowStart: now, isBlocked: false, blockEnd: 0 });
      return true;
    }

    // Reset window if expired
    if (now - state.windowStart > config.windowMs) {
      setState({ attempts: 1, windowStart: now, isBlocked: false, blockEnd: 0 });
      return true;
    }

    // Check if limit exceeded
    if (state.attempts >= config.maxAttempts) {
      const blockEnd = now + config.blockDurationMs;
      setState(prev => ({ ...prev, isBlocked: true, blockEnd }));
      
      const blockMinutes = Math.ceil(config.blockDurationMs / 60000);
      toast({
        title: 'Rate Limited',
        description: `Too many attempts. You are blocked for ${blockMinutes} minute(s).`,
        variant: 'destructive'
      });
      return false;
    }

    // Increment attempts
    setState(prev => ({ ...prev, attempts: prev.attempts + 1 }));
    return true;
  };

  const reset = () => {
    setState({ attempts: 0, windowStart: Date.now(), isBlocked: false, blockEnd: 0 });
    localStorage.removeItem(`rateLimit_${key}`);
  };

  return {
    attempt,
    reset,
    isBlocked: state.isBlocked,
    attemptsRemaining: Math.max(0, config.maxAttempts - state.attempts),
    timeUntilReset: state.isBlocked ? 
      Math.max(0, state.blockEnd - Date.now()) : 
      Math.max(0, config.windowMs - (Date.now() - state.windowStart))
  };
};
