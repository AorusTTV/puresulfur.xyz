
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign } from 'lucide-react';

interface TipDialogProps {
  playerData: {
    id: string;
    username: string;
    nickname?: string;
    avatarUrl?: string;
    level: number;
  };
  children: React.ReactNode;
}

export const TipDialog: React.FC<TipDialogProps> = ({ playerData, children }) => {
  const [tipAmount, setTipAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const displayName = playerData.nickname || playerData.username;

  const handleTip = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send tips",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid tip amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > (profile.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to send this tip",
        variant: "destructive",
      });
      return;
    }

    if (playerData.id === user.id) {
      toast({
        title: "Cannot Tip Yourself",
        description: "You cannot tip yourself",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending tip:', { recipient: playerData.id, amount });
      
      // Call the RPC function directly using the rpc method
      const { data, error } = await supabase.rpc('send_tip', {
        p_recipient_id: playerData.id,
        p_amount: amount
      });

      if (error) {
        console.error('RPC Error:', error);
        throw new Error(error.message || 'Failed to send tip');
      }

      console.log('Tip RPC response:', data);

      // Parse the JSON response from the RPC function
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (result.success) {
        // Refresh the user's profile to get updated balance
        await refreshProfile();
        
        console.log('Tip sent successfully, showing success toast');
        
        toast({
          title: "Tip Sent!",
          description: `Successfully tipped ${displayName} $${amount.toFixed(2)}`,
          variant: "default",
        });
        setTipAmount('');
        setIsOpen(false);
      } else {
        throw new Error(result.error || 'Failed to send tip');
      }
    } catch (error) {
      console.error('Error sending tip:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send tip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTip = (amount: number) => {
    setTipAmount(amount.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span>Tip {displayName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Your balance: ${(profile?.balance || 0).toFixed(2)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tip-amount">Tip Amount ($)</Label>
            <Input
              id="tip-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 25].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => handleQuickTip(amount)}
                disabled={isLoading || amount > (profile?.balance || 0)}
              >
                ${amount}
              </Button>
            ))}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTip}
              disabled={isLoading || !tipAmount || parseFloat(tipAmount) <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Sending...' : 'Send Tip'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
