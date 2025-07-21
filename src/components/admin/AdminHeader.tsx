
import React, { useState } from 'react';
import { Shield, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMaintenance } from '@/contexts/MaintenanceContext';

export const AdminHeader: React.FC = () => {
  const { toast } = useToast();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const { isMaintenanceMode } = useMaintenance();

  const handleEmergencyMode = () => {
    const newState = !emergencyMode;
    setEmergencyMode(newState);
    
    if (newState) {
      toast({
        title: 'Emergency Mode Activated',
        description: 'All gambling features have been disabled site-wide',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Emergency Mode Deactivated',
        description: 'All gambling features have been re-enabled',
        variant: 'default'
      });
    }
  };

  return (
    <div className={`border-b backdrop-blur-sm ${
      isMaintenanceMode 
        ? 'bg-red-900/50 border-red-700/50' 
        : 'bg-red-900/50 border-red-700/50'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-red-400" />
            <h1 className="text-xl font-bold text-white">Admin Control Panel</h1>
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ADMIN ACCESS
            </span>
            {isMaintenanceMode && (
              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                MAINTENANCE MODE
              </span>
            )}
            {emergencyMode && (
              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
                EMERGENCY MODE ACTIVE
              </span>
            )}
          </div>
          
          <Button
            onClick={handleEmergencyMode}
            variant={emergencyMode ? "default" : "destructive"}
            className={emergencyMode 
              ? "bg-orange-600 hover:bg-orange-700" 
              : "bg-red-600 hover:bg-red-700"
            }
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {emergencyMode ? 'Deactivate Emergency' : 'Emergency Mode'}
          </Button>
        </div>
      </div>
    </div>
  );
};
