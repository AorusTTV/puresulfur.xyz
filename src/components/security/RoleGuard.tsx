
import React, { ReactNode } from 'react';
import { useRole, UserRole } from '@/middleware/RoleMiddleware';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
  enforce?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallback = <div className="text-center text-muted-foreground p-4">Access denied</div>,
  enforce = false
}) => {
  const { user } = useAuth();
  const { hasRole, hasAnyRole, enforceRole } = useRole();

  // If no user is logged in, show fallback
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role permissions
  let hasPermission = false;

  if (requiredRole) {
    hasPermission = hasRole(requiredRole);
    if (enforce && !hasPermission) {
      enforceRole(requiredRole);
      return <>{fallback}</>;
    }
  }

  if (requiredRoles && requiredRoles.length > 0) {
    hasPermission = hasAnyRole(requiredRoles);
    if (enforce && !hasPermission) {
      // Use the first role for enforcement message
      enforceRole(requiredRoles[0]);
      return <>{fallback}</>;
    }
  }

  // If no role requirements specified, allow access
  if (!requiredRole && (!requiredRoles || requiredRoles.length === 0)) {
    hasPermission = true;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};
