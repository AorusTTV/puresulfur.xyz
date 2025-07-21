
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { SecurityHeaders } from './SecurityHeaders';
import { GlobalSecurityMonitor } from './GlobalSecurityMonitor';

interface SecurityContextType {
  isSecurityEnabled: boolean;
  securityLevel: 'low' | 'medium' | 'high';
  setSecurityLevel: (level: 'low' | 'medium' | 'high') => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(true);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const location = useLocation();

  // Check if we're on an admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Enable security monitoring by default
    setIsSecurityEnabled(true);
  }, []);

  const value = {
    isSecurityEnabled,
    securityLevel,
    setSecurityLevel,
  };

  return (
    <SecurityContext.Provider value={value}>
      <SecurityHeaders />
      {/* Only show GlobalSecurityMonitor on admin pages */}
      {isAdminPage && <GlobalSecurityMonitor />}
      {children}
    </SecurityContext.Provider>
  );
};
