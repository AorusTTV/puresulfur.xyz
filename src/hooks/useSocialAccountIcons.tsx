import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SocialAccount {
  platform: string;
}

interface SocialAccountsMap {
  [userId: string]: SocialAccount[];
}

export const useSocialAccountIcons = (userIds: string[]) => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccountsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialAccounts = async () => {
      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_social_accounts')
          .select('user_id, platform')
          .in('user_id', userIds)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching social accounts:', error);
          return;
        }

        // Group by user_id
        const grouped = data?.reduce((acc, account) => {
          if (!acc[account.user_id]) {
            acc[account.user_id] = [];
          }
          acc[account.user_id].push({ platform: account.platform });
          return acc;
        }, {} as SocialAccountsMap) || {};

        setSocialAccounts(grouped);
      } catch (error) {
        console.error('Error in fetchSocialAccounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialAccounts();
  }, [userIds.join(',')]);

  return { socialAccounts, loading };
};