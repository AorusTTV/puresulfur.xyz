import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RedeemCodePage: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

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
        
        // Reset form
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to redeem codes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
              <Gift className="h-6 w-6 text-primary" />
              Redeem Promotional Code
            </CardTitle>
            <p className="text-muted-foreground">
              Enter a promotional code to receive free balance or rewards
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-foreground text-base font-medium">
                  Promotional Code
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter your code here..."
                  className="bg-input border-border text-foreground mt-2 h-12 text-lg font-mono"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              onClick={handleRedeemCode}
              disabled={isLoading || !code.trim()}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-12 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                <>
                  <Gift className="h-5 w-5 mr-2" />
                  Redeem Code
                </>
              )}
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 Have a promotional code? Enter it above to receive free Sulfur or other rewards!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RedeemCodePage;