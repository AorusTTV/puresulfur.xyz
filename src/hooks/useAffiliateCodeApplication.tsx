
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ApplyAffiliateCodeResponse } from '@/types/affiliate';

export const useAffiliateCodeApplication = () => {
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const applyAffiliateCode = async (userId: string, code: string) => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter an affiliate code",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsApplying(true);
    
    try {
      console.log('Applying affiliate code:', code, 'for user:', userId);
      
      const { data, error } = await supabase.rpc('apply_affiliate_code', {
        p_user_id: userId,
        p_code: code.trim().toUpperCase()
      });

      if (error) {
        console.error('Error applying affiliate code:', error);
        throw error;
      }

      const response = data as unknown as ApplyAffiliateCodeResponse;
      console.log('Apply affiliate code response:', response);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Affiliate code applied successfully! You'll now help support your friend's earnings.",
        });
        return { success: true };
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to apply affiliate code",
          variant: "destructive",
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error applying affiliate code:', error);
      toast({
        title: "Error",
        description: "Failed to apply affiliate code. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsApplying(false);
    }
  };

  return {
    applyAffiliateCode,
    isApplying,
  };
};
