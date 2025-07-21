import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Loader2 } from 'lucide-react';

export const RedeemCodeDialog: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  const handleRedeemCode = async () => {
    if (!code.trim()) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a valid code',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('redeem_promotional_code', {
        p_code: code.trim()
      });

      if (error) {
        console.error('Error redeeming code:', error);
        toast({
          title: 'Error',
          description: 'Failed to redeem code. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      const result = data as { success: boolean; balance_received?: number; error?: string };
      
      if (result.success) {
        toast({
          title: 'Code Redeemed!',
          description: `Successfully added $${result.balance_received} to your account!`,
        });
        
        // Refresh profile to update balance
        await refreshProfile();
        
        // Close dialog and reset form
        setIsOpen(false);
        setCode('');
      } else {
        toast({
          title: 'Failed to Redeem',
          description: result.error || 'Code redemption failed',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error redeeming code:', error);
      toast({
        title: 'Error',
        description: 'Failed to redeem code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:from-primary/20 hover:to-accent/20"
        >
          <Gift className="h-4 w-4" />
          Redeem a Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Redeem Promotional Code
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter a promotional code to receive free balance or rewards
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-foreground">
              Promotional Code
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your code here..."
              className="bg-input border-border text-foreground mt-2"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setCode('');
            }}
            disabled={isLoading}
            className="border-border text-foreground hover:bg-accent/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRedeemCode}
            disabled={isLoading || !code.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redeeming...
              </>
            ) : (
              'Redeem Code'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};