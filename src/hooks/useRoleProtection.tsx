
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, UserRole } from '@/middleware/RoleMiddleware';
import { useAuth } from '@/contexts/AuthContext';

export const useRoleProtection = (requiredRole: UserRole, redirectTo: string = '/') => {
  const { user, loading } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/');
        return;
      }

      if (!hasRole(requiredRole)) {
        console.warn(`Access denied: User lacks ${requiredRole} role`);
        navigate(redirectTo);
        return;
      }
    }
  }, [user, loading, hasRole, requiredRole, navigate, redirectTo]);

  return {
    isAuthorized: user && hasRole(requiredRole),
    isLoading: loading
  };
};
