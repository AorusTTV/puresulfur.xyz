
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBanCheck } from '@/hooks/useBanCheck';

interface BanGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const BanGuard: React.FC<BanGuardProps> = ({ children, fallback }) => {
  const { user } = useAuth();
  const { isBanned } = useBanCheck();

  // If user is not authenticated, don't show the ban guard - let the component handle auth state
  if (!user) {
    return <>{children}</>;
  }

  // If user is banned, show fallback
  if (isBanned) {
    return <>{fallback || <div className="text-center text-muted-foreground text-sm p-3">Access restricted</div>}</>;
  }

  return <>{children}</>;
};
