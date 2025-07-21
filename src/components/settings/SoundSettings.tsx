import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundPreferences {
  sound_new_trade: boolean;
  sound_jackpot_win: boolean;
  sound_chat_ping: boolean;
  sound_general: boolean;
}

export const SoundSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<SoundPreferences>({
    sound_new_trade: true,
    sound_jackpot_win: true,
    sound_chat_ping: true,
    sound_general: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          sound_new_trade: data.sound_new_trade,
          sound_jackpot_win: data.sound_jackpot_win,
          sound_chat_ping: data.sound_chat_ping,
          sound_general: data.sound_general,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: SoundPreferences) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Your sound preferences have been updated',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sound preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof SoundPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const handleMasterToggle = (enabled: boolean) => {
    const newPreferences = {
      sound_new_trade: enabled,
      sound_jackpot_win: enabled,
      sound_chat_ping: enabled,
      sound_general: enabled,
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const soundSettings = [
    {
      key: 'sound_new_trade' as keyof SoundPreferences,
      title: 'New Trade Sounds',
      description: 'Play sounds when trades are created or completed',
      icon: '💰',
    },
    {
      key: 'sound_jackpot_win' as keyof SoundPreferences,
      title: 'Jackpot Win Sounds',
      description: 'Play sounds when someone wins a jackpot',
      icon: '🎰',
    },
    {
      key: 'sound_chat_ping' as keyof SoundPreferences,
      title: 'Chat Ping Sounds',
      description: 'Play sounds when mentioned in chat or receiving messages',
      icon: '💬',
    },
  ];

  const allSoundsEnabled = Object.values(preferences).every(Boolean);
  const allSoundsDisabled = Object.values(preferences).every(val => !val);

  if (loading) {
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading sound settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          {allSoundsDisabled ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          Sound Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Master Sound Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
              🔊
            </div>
            <div>
              <Label className="text-foreground font-medium">Master Volume</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable all sound effects
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.sound_general}
            onCheckedChange={(checked) => handleToggle('sound_general', checked)}
            disabled={saving}
          />
        </div>

        {/* Individual Sound Settings */}
        <div className="space-y-3">
          {soundSettings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg bg-card/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center text-lg">
                  {setting.icon}
                </div>
                <div>
                  <Label className="text-foreground font-medium">{setting.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences[setting.key] && preferences.sound_general}
                onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                disabled={saving || !preferences.sound_general}
              />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => handleMasterToggle(true)}
            disabled={saving || allSoundsEnabled}
            className="flex-1 px-3 py-2 text-sm bg-primary/20 text-primary rounded-lg hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enable All
          </button>
          <button
            onClick={() => handleMasterToggle(false)}
            disabled={saving || allSoundsDisabled}
            className="flex-1 px-3 py-2 text-sm bg-muted/20 text-muted-foreground rounded-lg hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Disable All
          </button>
        </div>
      </CardContent>
    </Card>
  );
};