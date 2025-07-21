
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  steam_username: string;
  nickname: string;
}

interface BanUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBanSuccess: () => void;
}

export const BanUserDialog: React.FC<BanUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onBanSuccess
}) => {
  const [reason, setReason] = useState('');
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('permanent');
  const [duration, setDuration] = useState('7');
  const [customHours, setCustomHours] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const handleBanUser = async () => {
    if (!user || !currentUser) return;

    setLoading(true);
    try {
      let expiresAt = null;
      
      if (banType === 'temporary') {
        const hours = duration === 'custom' ? parseInt(customHours) : parseInt(duration) * 24;
        if (isNaN(hours) || hours <= 0) {
          toast({
            title: 'Error',
            description: 'Please enter a valid duration',
            variant: 'destructive'
          });
          return;
        }
        
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);
      }

      const { data, error } = await supabase.rpc('ban_user', {
        p_user_id: user.id,
        p_banned_by: currentUser.id,
        p_reason: reason.trim() || null,
        p_expires_at: expiresAt?.toISOString() || null
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${user.nickname || user.steam_username} has been banned successfully`
      });

      onBanSuccess();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to ban user',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setBanType('permanent');
    setDuration('7');
    setCustomHours('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Ban User: {user?.nickname || user?.steam_username}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason" className="text-foreground">
              Reason (Optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for ban..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-background/50 border-primary/30 text-foreground"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="banType" className="text-foreground">
              Ban Type
            </Label>
            <Select value={banType} onValueChange={(value: 'permanent' | 'temporary') => setBanType(value)}>
              <SelectTrigger className="bg-background/50 border-primary/30 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Permanent Ban</SelectItem>
                <SelectItem value="temporary">Temporary Ban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {banType === 'temporary' && (
            <div className="grid gap-2">
              <Label htmlFor="duration" className="text-foreground">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-background/50 border-primary/30 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              
              {duration === 'custom' && (
                <div className="mt-2">
                  <Label htmlFor="customHours" className="text-foreground text-sm">
                    Hours
                  </Label>
                  <Input
                    id="customHours"
                    type="number"
                    placeholder="Enter hours..."
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    className="bg-background/50 border-primary/30 text-foreground mt-1"
                    min="1"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleBanUser} 
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? 'Banning...' : 'Ban User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
