
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SystemSettings: React.FC = () => {
  const { toast } = useToast();
  const { isMaintenanceMode, setMaintenanceMode } = useMaintenance();
  
  const [settings, setSettings] = useState({
    jackpotEnabled: true,
    minJackpotEntry: '1.00',
    maxJackpotEntry: '1000.00',
    houseFeePercentage: '5',
    registrationEnabled: true,
    chatEnabled: true,
    steamBotEnabled: true,
    storeWithdrawalsEnabled: true,
    maxBalanceDisplay: '999999.99'
  });

  // Load settings from database on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['store_withdrawals_enabled']);

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, string>);

        setSettings(prev => ({
          ...prev,
          storeWithdrawalsEnabled: settingsMap.store_withdrawals_enabled === 'true'
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleMaintenanceModeToggle = (checked: boolean) => {
    setMaintenanceMode(checked);
    toast({
      title: checked ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
      description: checked 
        ? 'The site is now in maintenance mode. Only admins can access the server.' 
        : 'The site is now accessible to all users.',
      variant: checked ? 'destructive' : 'default'
    });
  };

  const saveSettings = async () => {
    try {
      // Update store withdrawals setting in database
      const { error } = await supabase
        .from('game_settings')
        .update({ setting_value: settings.storeWithdrawalsEnabled.toString() })
        .eq('setting_key', 'store_withdrawals_enabled');

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: 'Settings Save Failed',
          description: 'Failed to save system settings. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Settings Saved',
        description: 'System settings have been updated successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Settings Save Failed',
        description: 'Failed to save system settings. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetSettings = () => {
    if (!confirm('Are you sure you want to reset all settings to default?')) return;
    
    setSettings({
      jackpotEnabled: true,
      minJackpotEntry: '1.00',
      maxJackpotEntry: '1000.00',
      houseFeePercentage: '5',
      registrationEnabled: true,
      chatEnabled: true,
      steamBotEnabled: true,
      storeWithdrawalsEnabled: true,
      maxBalanceDisplay: '999999.99'
    });
    
    // Also reset in database
    saveSettings();
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SYSTEM SETTINGS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Site Controls */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Site Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card/30">
                <div>
                  <Label className="text-muted-foreground font-medium">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Block access for non-admin users
                  </p>
                </div>
                <Switch
                  checked={isMaintenanceMode}
                  onCheckedChange={handleMaintenanceModeToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Registration Enabled</Label>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, registrationEnabled: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Chat Enabled</Label>
                <Switch
                  checked={settings.chatEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, chatEnabled: checked})}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card/30">
                <div>
                  <Label className="text-muted-foreground font-medium">Store Withdrawals</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable or disable cart checkout / store withdrawals
                  </p>
                </div>
                <Switch
                  checked={settings.storeWithdrawalsEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, storeWithdrawalsEnabled: checked})}
                />
              </div>
            </div>
          </div>


          {/* Display Settings */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Display Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Max Balance Display ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.maxBalanceDisplay}
                  onChange={(e) => setSettings({...settings, maxBalanceDisplay: e.target.value})}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button onClick={saveSettings} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button onClick={resetSettings} variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
