
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AffiliateStats } from './AffiliateStats';
import { AffiliateCodeManager } from './AffiliateCodeManager';
import { CommissionHistory } from './CommissionHistory';
import { AffiliateTiers } from './AffiliateTiers';
import { useAffiliateData } from '@/hooks/useAffiliateData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users, Trophy, Share2 } from 'lucide-react';
import { PayAffiliateCommissionsResponse } from '@/types/affiliate';

export const AffiliateDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, refetch, updateAffiliateCode } = useAffiliateData();
  const { toast } = useToast();

  const handleClaimCommissions = async () => {
    if (!user) return;

    try {
      const { data: result, error } = await supabase.rpc('pay_affiliate_commissions', {
        p_referrer_id: user.id
      });

      if (error) throw error;

      const response = result as unknown as PayAffiliateCommissionsResponse;

      if (response.success && response.amount_paid && response.amount_paid > 0) {
        toast({
          title: "Success!",
          description: `Claimed $${response.amount_paid.toFixed(2)} in commissions!`,
        });
        refetch();
      } else {
        toast({
          title: "Info",
          description: "No pending commissions to claim",
        });
      }
    } catch (error) {
      console.error('Error claiming commissions:', error);
      toast({
        title: "Error",
        description: "Failed to claim commissions",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading affiliate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Earn commissions by referring new users to our platform
          </p>
        </div>
        {data.stats.pendingCommissions > 0 && (
          <Button
            onClick={handleClaimCommissions}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Claim ${data.stats.pendingCommissions.toFixed(2)}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <AffiliateStats stats={data.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Affiliate Code Manager */}
        <AffiliateCodeManager
          affiliateCode={data.affiliateCode}
          onCodeCreated={updateAffiliateCode}
        />

        {/* Affiliate Tiers */}
        <AffiliateTiers
          currentTier={data.stats.currentTier}
          totalReferralValue={data.stats.totalReferralValue}
        />
      </div>

      {/* Commission History */}
      <CommissionHistory commissions={data.commissions} />

      {/* How It Works */}
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="p-3 rounded-full bg-primary/20 w-fit mx-auto mb-3">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Share Your Code</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique affiliate code or link with friends
              </p>
            </div>
            <div className="text-center p-4">
              <div className="p-3 rounded-full bg-primary/20 w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                New users register using your affiliate code
              </p>
            </div>
            <div className="text-center p-4">
              <div className="p-3 rounded-full bg-primary/20 w-fit mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Earn Commissions</h3>
              <p className="text-sm text-muted-foreground">
                Get a percentage of every bet they make based on your tier
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
