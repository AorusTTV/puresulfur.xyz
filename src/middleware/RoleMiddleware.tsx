
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'moderator' | 'player';

interface RoleContextType {
  hasRole: (requiredRole: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  enforceRole: (requiredRole: UserRole) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Get user role from profile - default to 'player'
  const getUserRole = (): UserRole => {
    if (!profile) return 'player';
    
    // Check if user is admin (nickname === 'admin')
    if (profile.nickname === 'admin') return 'admin';
    
    // Check for moderator role (you can expand this logic)
    if (profile.role === 'moderator') return 'moderator';
    
    return 'player';
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    const userRole = getUserRole();
    
    // Role hierarchy: admin > moderator > player
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      moderator: 2,
      player: 1
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const enforceRole = (requiredRole: UserRole): boolean => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this feature.',
        variant: 'destructive'
      });
      return false;
    }

    if (!hasRole(requiredRole)) {
      toast({
        title: 'Access Denied',
        description: `You need ${requiredRole} privileges to access this feature.`,
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const value: RoleContextType = {
    hasRole,
    hasAnyRole,
    enforceRole
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
