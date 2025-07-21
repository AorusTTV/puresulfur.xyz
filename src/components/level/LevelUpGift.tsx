
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SulfurIcon } from '@/components/ui/SulfurIcon';
import { useAuth } from '@/contexts/AuthContext';

interface LevelUpGiftProps {
  id: string;
  level: number;
  sulfurAmount: number;
  claimed: boolean;
  onClaim: () => void;
}

export const LevelUpGift: React.FC<LevelUpGiftProps> = ({
  id,
  level,
  sulfurAmount,
  claimed,
  onClaim
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  const handleClaimGift = async () => {
    setIsClaiming(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current user balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Start a transaction-like operation
      // First mark gift as claimed
      const { error: giftError } = await supabase
        .from('level_up_gifts')
        .update({ claimed: true })
        .eq('id', id);

      if (giftError) throw giftError;

      // Add sulfur amount to user's balance (treating sulfur as balance for now)
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: (profileData.balance || 0) + sulfurAmount
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Refresh the user profile to update the balance in real-time
      await refreshProfile();

      toast({
        title: 'Gift Claimed!',
        description: (
          <div className="flex items-center gap-2">
            <span>You received</span>
            <SulfurIcon className="h-4 w-4" />
            <span>{sulfurAmount.toFixed(2)} for reaching level {level}!</span>
          </div>
        ),
      });

      onClaim();
    } catch (error) {
      console.error('Error claiming gift:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim gift. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className="gaming-card-enhanced border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Gift className="h-8 w-8 text-primary" />
              {!claimed && (
                <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                Level {level} Reward
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <SulfurIcon className="h-3 w-3" />
                {sulfurAmount.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {claimed ? (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/50">
                Claimed
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={handleClaimGift}
                disabled={isClaiming}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isClaiming ? 'Claiming...' : 'Claim'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
