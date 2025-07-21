import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, AlertTriangle, Monitor, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LoginHistory {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_info: string | null;
  location?: string | null;
  login_at: string;
  is_flagged: boolean;
  flagged_reason?: string | null;
}

export const SecuritySection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      loadLoginHistory();
    }
  }, [user]);

  const loadLoginHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_login_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('login_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLoginHistory((data as LoginHistory[]) || []);
    } catch (error) {
      console.error('Error loading login history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load login history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to log out of all devices? You will need to log in again on all your devices.')) {
      return;
    }

    setLoggingOut(true);
    try {
      const { data, error } = await supabase.rpc('logout_all_devices', {
        p_user_id: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Logged out of all devices successfully',
      });

      // Refresh login history to show the logout action
      loadLoginHistory();
    } catch (error) {
      console.error('Error logging out all devices:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out of all devices',
        variant: 'destructive'
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleFlagLogin = async (loginId: string) => {
    try {
      const { data, error } = await supabase.rpc('flag_login_attempt', {
        p_login_id: loginId,
        p_reason: 'User reported suspicious activity'
      });

      if (error) throw error;

      toast({
        title: 'Flagged',
        description: 'Login attempt has been flagged for review',
      });

      // Refresh login history
      loadLoginHistory();
    } catch (error) {
      console.error('Error flagging login:', error);
      toast({
        title: 'Error',
        description: 'Failed to flag login attempt',
        variant: 'destructive'
      });
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (userAgent?.toLowerCase().includes('mobile')) return '📱';
    if (userAgent?.toLowerCase().includes('tablet')) return '💻';
    return '🖥️';
  };

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Browser';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logout All Devices */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="font-medium text-foreground">Log out all devices</div>
              <div className="text-sm text-muted-foreground">
                This will sign you out of all devices and sessions
              </div>
            </div>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogoutAllDevices}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Log out all'}
          </Button>
        </div>

        {/* Recent Login History */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Login History
          </h3>
          
          {loading ? (
            <div className="text-center text-muted-foreground py-4">Loading login history...</div>
          ) : loginHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No login history found</div>
          ) : (
            <div className="space-y-2">
              {loginHistory.map((login) => (
                <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/20">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {login.device_info === 'LOGOUT_ALL_DEVICES' ? '🚪' : getDeviceIcon(login.user_agent)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {login.device_info === 'LOGOUT_ALL_DEVICES' 
                            ? 'Logged out all devices' 
                            : getBrowserInfo(login.user_agent)}
                        </span>
                        {login.is_flagged && (
                          <Badge variant="destructive" className="text-xs">
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {login.ip_address && (
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {login.ip_address}
                            </span>
                          )}
                          {login.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {login.location}
                            </span>
                          )}
                        </div>
                        <span>{formatDistanceToNow(new Date(login.login_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!login.is_flagged && login.device_info !== 'LOGOUT_ALL_DEVICES' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagLogin(login.id)}
                      className="text-orange-400 hover:text-orange-300"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Wasn't me
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};