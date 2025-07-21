
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within MaintenanceProvider');
  }
  return context;
};

interface MaintenanceProviderProps {
  children: ReactNode;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const { profile } = useAuth();

  // Check if user is admin
  const isAdmin = profile?.nickname === 'admin';

  useEffect(() => {
    // Load maintenance mode state from localStorage
    const storedMaintenanceMode = localStorage.getItem('maintenanceMode');
    if (storedMaintenanceMode === 'true') {
      setIsMaintenanceMode(true);
    }
  }, []);

  const setMaintenanceMode = (enabled: boolean) => {
    setIsMaintenanceMode(enabled);
    localStorage.setItem('maintenanceMode', enabled.toString());
  };

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, setMaintenanceMode }}>
      {children}
    </MaintenanceContext.Provider>
  );
};
