import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Unlink, ExternalLink } from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  platform_username: string;
  avatar_url?: string;
  connected_at: string;
  is_active: boolean;
}

const SUPPORTED_PLATFORMS = [
  { id: 'discord', name: 'Discord', color: 'bg-blue-600', icon: '/lovable-uploads/81f0b2b9-1ea2-4877-8c5f-eb661669a528.png' },
  { id: 'kick', name: 'Kick', color: 'bg-green-600', icon: '/lovable-uploads/82304286-4c0d-4274-91cc-4316ff58699c.png' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600', icon: '/lovable-uploads/adb5aeb2-e7a5-43d7-a96e-c99162991d56.png' },
];

export const SocialAccountsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSocialAccounts();
    }
  }, [user]);

  const loadSocialAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_social_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setSocialAccounts(data || []);
    } catch (error) {
      console.error('Error loading social accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load social accounts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    
    // In a real implementation, this would redirect to OAuth flow
    // For now, we'll simulate it
    toast({
      title: 'Feature Coming Soon',
      description: `${platform} integration will be available soon!`,
    });
    
    setConnecting(null);
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    try {
      const { error } = await supabase
        .from('user_social_accounts')
        .update({ is_active: false })
        .eq('id', accountId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSocialAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      toast({
        title: 'Disconnected',
        description: `Successfully disconnected ${platform} account`,
      });
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect account',
        variant: 'destructive'
      });
    }
  };

  const getConnectedAccount = (platform: string) => {
    return socialAccounts.find(acc => acc.platform === platform);
  };

  if (loading) {
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading social accounts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Link className="h-5 w-5" />
          Social Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SUPPORTED_PLATFORMS.map((platform) => {
          const connectedAccount = getConnectedAccount(platform.id);
          const isConnected = !!connectedAccount;
          
          return (
            <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/30">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white text-lg`}>
                  <img 
                    src={platform.icon} 
                    alt={platform.name} 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="font-medium text-foreground">{platform.name}</div>
                  {isConnected ? (
                    <div className="text-sm text-muted-foreground">
                      Connected as {connectedAccount.platform_username}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Not connected</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connectedAccount.id, platform.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(platform.id)}
                    disabled={connecting === platform.id}
                    className="text-primary hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {connecting === platform.id ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};