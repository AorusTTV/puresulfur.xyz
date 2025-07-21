
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface GameSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
}

interface GameConfig {
  fee_percentage: number;
  min_entry: number;
  max_entry: number;
  is_active: boolean;
}

const gameTypes = [
  { key: 'wheel', name: 'Sulfur Wheel', icon: '🎯' },
  { key: 'coinflip', name: 'Coinflip', icon: '🪙' },
  { key: 'jackpot', name: 'Jackpot', icon: '💰' },
  { key: 'crate_battles', name: 'Crate Battles', icon: '📦' },
  { key: 'minefield', name: 'Minefield', icon: '💣' },
  { key: 'plinko', name: 'Plinko', icon: '🎲' },
  { key: 'dual', name: 'Dual', icon: '⚔️' }
];

export const GameSettings: React.FC = () => {
  const [gameSettings, setGameSettings] = useState<Record<string, GameConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGameSettings();
  }, []);

  const loadGameSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*');

      if (error) throw error;

      const settings: Record<string, GameConfig> = {};
      
      // Initialize default settings for each game
      gameTypes.forEach(game => {
        settings[game.key] = {
          fee_percentage: 5,
          min_entry: 1,
          max_entry: 1000,
          is_active: true
        };
      });

      // Apply existing settings from database
      data?.forEach((setting: GameSetting) => {
        const [gameType, settingType] = setting.setting_key.split('_');
        if (settings[gameType]) {
          const value = setting.setting_value;
          switch (settingType) {
            case 'fee':
              settings[gameType].fee_percentage = parseFloat(value);
              break;
            case 'minentry':
              settings[gameType].min_entry = parseFloat(value);
              break;
            case 'maxentry':
              settings[gameType].max_entry = parseFloat(value);
              break;
            case 'active':
              settings[gameType].is_active = value === 'true';
              break;
          }
        }
      });

      setGameSettings(settings);
    } catch (error) {
      console.error('Error loading game settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load game settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGameSetting = (gameKey: string, field: keyof GameConfig, value: number | boolean) => {
    setGameSettings(prev => ({
      ...prev,
      [gameKey]: {
        ...prev[gameKey],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Delete existing settings first
      await supabase
        .from('game_settings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      // Insert new settings
      const settingsToInsert = [];
      
      Object.entries(gameSettings).forEach(([gameKey, config]) => {
        settingsToInsert.push(
          {
            setting_key: `${gameKey}_fee`,
            setting_value: config.fee_percentage.toString(),
            description: `Fee percentage for ${gameKey} game`
          },
          {
            setting_key: `${gameKey}_minentry`,
            setting_value: config.min_entry.toString(),
            description: `Minimum entry price for ${gameKey} game`
          },
          {
            setting_key: `${gameKey}_maxentry`,
            setting_value: config.max_entry.toString(),
            description: `Maximum entry price for ${gameKey} game`
          },
          {
            setting_key: `${gameKey}_active`,
            setting_value: config.is_active.toString(),
            description: `Active status for ${gameKey} game`
          }
        );
      });

      const { error } = await supabase
        .from('game_settings')
        .insert(settingsToInsert);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Game settings saved successfully',
      });

      // Trigger a page reload to refresh game statuses
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save game settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span className="text-foreground">Loading game settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Game Settings</h3>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gameTypes.map((game) => {
          const config = gameSettings[game.key] || {
            fee_percentage: 5,
            min_entry: 1,
            max_entry: 1000,
            is_active: true
          };

          return (
            <Card key={game.key} className="bg-card/60 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{game.icon}</span>
                    <span className="text-sm">{game.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={(checked) => 
                        updateGameSetting(game.key, 'is_active', checked)
                      }
                    />
                    <Label className="text-xs text-muted-foreground">
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fee Percentage (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.fee_percentage}
                    onChange={(e) => 
                      updateGameSetting(game.key, 'fee_percentage', parseFloat(e.target.value) || 0)
                    }
                    className="h-8"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Min Entry</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.min_entry}
                      onChange={(e) => 
                        updateGameSetting(game.key, 'min_entry', parseFloat(e.target.value) || 0)
                      }
                      className="h-8"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Max Entry</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.max_entry}
                      onChange={(e) => 
                        updateGameSetting(game.key, 'max_entry', parseFloat(e.target.value) || 0)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
