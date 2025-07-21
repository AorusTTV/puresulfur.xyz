
import React, { ReactNode } from 'react';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { MaintenancePage } from './MaintenancePage';

interface MaintenanceWrapperProps {
  children: ReactNode;
}

export const MaintenanceWrapper: React.FC<MaintenanceWrapperProps> = ({ children }) => {
  const { isMaintenanceMode } = useMaintenance();
  const { profile } = useAuth();

  // Check if user is admin
  const isAdmin = profile?.nickname === 'admin';

  // Render content with proper top padding to account for fixed navigation
  return (
    <div className="pt-20">
      {isMaintenanceMode && !isAdmin ? <MaintenancePage /> : children}
    </div>
  );
};
