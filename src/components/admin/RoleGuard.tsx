
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

type UserRole = 'admin' | 'moderator' | 'player';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallback
}) => {
  const { user } = useAuth();

  // For now, check if user email contains 'admin' (temporary implementation)
  // In production, this would check against a roles table in Supabase
  const getUserRole = (): UserRole => {
    if (!user?.email) return 'player';
    
    // Temporary role assignment based on email
    if (user.email.includes('admin') || user.email.includes('shaybuskila999@gmail.com')) {
      return 'admin';
    }
    if (user.email.includes('mod')) {
      return 'moderator';
    }
    return 'admin';
  };

  const hasRequiredRole = (): boolean => {
    if (!user) return false;
    
    const userRole = getUserRole();
    
    if (requiredRole) {
      return userRole === requiredRole || (requiredRole === 'moderator' && userRole === 'admin');
    }
    
    if (requiredRoles) {
      return requiredRoles.includes(userRole) || 
             (requiredRoles.includes('moderator') && userRole === 'admin');
    }
    
    return true;
  };

  if (!user) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Please log in to access this area.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasRequiredRole()) {
    return fallback || (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. Required role: {requiredRole || requiredRoles?.join(' or ')}.
          Your role: {getUserRole()}.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
