
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AffiliateData {
  affiliateCode: string | null;
  stats: {
    totalReferrals: number;
    totalEarnings: number;
    pendingCommissions: number;
    currentTier: string;
    commissionRate: number;
    totalReferralValue: number;
  };
  commissions: any[];
  referrals: any[];
}

export const useAffiliateData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AffiliateData>({
    affiliateCode: null,
    stats: {
      totalReferrals: 0,
      totalEarnings: 0,
      pendingCommissions: 0,
      currentTier: 'Beginner',
      commissionRate: 0.015,
      totalReferralValue: 0,
    },
    commissions: [],
    referrals: [],
  });
  const [loading, setLoading] = useState(true);

  const getTierInfo = (totalReferralValue: number) => {
    if (totalReferralValue >= 10000) return { name: 'Diamond', rate: 0.20 };
    if (totalReferralValue >= 7500) return { name: 'Platinum', rate: 0.10 };
    if (totalReferralValue >= 5000) return { name: 'Gold', rate: 0.07 };
    if (totalReferralValue >= 2500) return { name: 'Silver', rate: 0.05 };
    if (totalReferralValue >= 1000) return { name: 'Bronze', rate: 0.03 };
    return { name: 'Beginner', rate: 0.015 };
  };

  const fetchAffiliateData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get affiliate code - try with total_referral_value, fall back to basic query
      let affiliateCodeData = null;
      try {
        const { data } = await supabase
          .from('affiliate_codes')
          .select('*, total_referral_value')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
        affiliateCodeData = data;
      } catch (error) {
        // If total_referral_value column doesn't exist, fall back to basic query
        console.log('Falling back to basic affiliate code query');
        const { data } = await supabase
          .from('affiliate_codes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
        affiliateCodeData = data;
      }

      // Get referrals
      const { data: referralsData } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          profiles!affiliate_referrals_referred_user_id_fkey(nickname, steam_username)
        `)
        .eq('referrer_user_id', user.id);

      // Get commissions
      const { data: commissionsData } = await supabase
        .from('affiliate_commissions')
        .select(`
          *,
          affiliate_referrals!inner(referrer_user_id)
        `)
        .eq('affiliate_referrals.referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate stats
      const totalReferrals = referralsData?.length || 0;
      const totalEarnings = affiliateCodeData?.total_earnings || 0;
      
      // Try to get total_referral_value, fall back to 0 if column doesn't exist
      const totalReferralValue = affiliateCodeData?.total_referral_value || 0;
      
      const pendingCommissions = commissionsData?.reduce((sum, commission) => 
        commission.status === 'pending' ? sum + commission.commission_amount : sum, 0
      ) || 0;

      const tierInfo = getTierInfo(totalReferralValue);

      setData({
        affiliateCode: affiliateCodeData?.code || null,
        stats: {
          totalReferrals,
          totalEarnings,
          pendingCommissions,
          currentTier: tierInfo.name,
          commissionRate: tierInfo.rate,
          totalReferralValue,
        },
        commissions: commissionsData || [],
        referrals: referralsData || [],
      });
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, [user]);

  const updateAffiliateCode = (code: string) => {
    setData(prev => ({
      ...prev,
      affiliateCode: code,
    }));
  };

  return {
    data,
    loading,
    refetch: fetchAffiliateData,
    updateAffiliateCode,
  };
};
