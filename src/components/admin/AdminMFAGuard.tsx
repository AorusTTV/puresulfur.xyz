
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminMFASetup } from './AdminMFASetup';
import { supabase } from '@/integrations/supabase/client';

interface AdminMFAGuardProps {
  children: React.ReactNode;
}

export const AdminMFAGuard: React.FC<AdminMFAGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const [mfaVerified, setMfaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkMFAStatus();
  }, [user]);

  const checkMFAStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const hasVerifiedMFA = data?.totp?.some(factor => factor.status === 'verified') || false;
      setMfaVerified(hasVerifiedMFA);
    } catch (error) {
      console.error('Error checking MFA status:', error);
      setMfaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerified = () => {
    setMfaVerified(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking security status...</p>
        </div>
      </div>
    );
  }

  if (!mfaVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <AdminMFASetup onMFAVerified={handleMFAVerified} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
