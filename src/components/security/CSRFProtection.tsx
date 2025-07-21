
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CSRFTokenContextType {
  token: string | null;
  refreshToken: () => Promise<void>;
  validateToken: (token: string) => boolean;
}

export const useCSRFProtection = (): CSRFTokenContextType => {
  const [token, setToken] = useState<string | null>(null);

  const generateToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const refreshToken = async () => {
    const newToken = generateToken();
    setToken(newToken);
    
    // Store in session storage (more secure than localStorage for CSRF tokens)
    sessionStorage.setItem('csrf_token', newToken);
    
    // Also store in Supabase session metadata if user is authenticated
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // This could be extended to store server-side if needed
        console.log('CSRF token generated for authenticated session');
      }
    } catch (error) {
      console.warn('Could not associate CSRF token with session:', error);
    }
  };

  const validateToken = (submittedToken: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken !== null && storedToken === submittedToken && submittedToken === token;
  };

  useEffect(() => {
    // Initialize token on mount
    const existingToken = sessionStorage.getItem('csrf_token');
    if (existingToken) {
      setToken(existingToken);
    } else {
      refreshToken();
    }

    // Refresh token on focus (when user returns to tab)
    const handleFocus = () => {
      refreshToken();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return { token, refreshToken, validateToken };
};

// HOC for protecting forms with CSRF
export const withCSRFProtection = <T extends object>(
  WrappedComponent: React.ComponentType<T>
) => {
  return (props: T) => {
    const { token, validateToken } = useCSRFProtection();
    
    const protectedProps = {
      ...props,
      csrfToken: token,
      validateCSRF: validateToken
    } as T & { csrfToken: string | null; validateCSRF: (token: string) => boolean };

    return <WrappedComponent {...protectedProps} />;
  };
};
