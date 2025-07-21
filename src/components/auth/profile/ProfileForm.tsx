
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { EnhancedInputSanitizer } from '@/components/security/XSSProtection';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SteamTradeUrlField } from './SteamTradeUrlField';
import { ApiKeyField } from './ApiKeyField';
import { BioField } from './BioField';
import { validateTradeUrl } from './validateTradeUrl';

export const ProfileForm: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [steamTradeUrl, setSteamTradeUrl] = useState(profile?.steam_trade_url || '');
  const [apiKey, setApiKey] = useState(profile?.api_key || '');
  const [bio, setBio] = useState(''); // Bio field would need to be added to profiles table
  const [isUpdating, setIsUpdating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSteamTradeUrl, setShowSteamTradeUrl] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate Steam trade URL if provided
    if (steamTradeUrl && !validateTradeUrl(steamTradeUrl)) {
      toast({
        title: 'Invalid Trade URL',
        description: 'Please enter a valid Steam trade URL (e.g., https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=XXXXXXXX)',
        variant: 'destructive'
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      console.log('[PROFILE-FORM] Updating profile with trade URL:', steamTradeUrl);
      
      // Sanitize inputs
      const sanitizedBio = EnhancedInputSanitizer.sanitizeProfileBio(bio);
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          steam_trade_url: steamTradeUrl || null,
          api_key: apiKey || null,
          // bio: sanitizedBio, // Would need to add bio column
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('[PROFILE-FORM] Update error:', updateError);
        throw updateError;
      }
      
      console.log('[PROFILE-FORM] Profile updated successfully');
      
      // Refresh the profile to get the latest data
      await refreshProfile();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully'
      });
      
    } catch (error) {
      console.error('[PROFILE-FORM] Profile update failed:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <SteamTradeUrlField
          value={steamTradeUrl}
          onChange={setSteamTradeUrl}
          showValue={showSteamTradeUrl}
          onToggleVisibility={() => setShowSteamTradeUrl(!showSteamTradeUrl)}
        />

        <ApiKeyField
          value={apiKey}
          onChange={setApiKey}
          showValue={showApiKey}
          onToggleVisibility={() => setShowApiKey(!showApiKey)}
        />
        
        <BioField
          value={bio}
          onChange={setBio}
        />
        
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
};
