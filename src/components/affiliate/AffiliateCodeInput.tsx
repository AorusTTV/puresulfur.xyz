
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Clock } from 'lucide-react';
import { useAffiliateCodeApplication } from '@/hooks/useAffiliateCodeApplication';
import { useAffiliateCodeFromUrl } from '@/hooks/useAffiliateCodeFromUrl';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AffiliateCodeInputProps {
  userId: string;
  onCodeApplied: () => void;
  currentCode?: string | null;
  lastChangeDate?: string | null;
}

export const AffiliateCodeInput: React.FC<AffiliateCodeInputProps> = ({
  userId,
  onCodeApplied,
  currentCode,
  lastChangeDate
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [nextChangeAvailable, setNextChangeAvailable] = useState<Date | null>(null);
  const { applyAffiliateCode, isApplying } = useAffiliateCodeApplication();
  const { affiliateCode: urlCode, clearAffiliateCode } = useAffiliateCodeFromUrl();
  const { toast } = useToast();

  // Pre-fill the input with URL code if available
  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
    }
  }, [urlCode]);

  // Calculate next change available date
  useEffect(() => {
    if (lastChangeDate) {
      const lastChange = new Date(lastChangeDate);
      const nextChange = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      setNextChangeAvailable(nextChange);
    }
  }, [lastChangeDate]);

  const canChangeCode = () => {
    if (!nextChangeAvailable) return true;
    return new Date() >= nextChangeAvailable;
  };

  const getTimeUntilNextChange = () => {
    if (!nextChangeAvailable) return '';
    
    const now = new Date();
    const diff = nextChangeAvailable.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleApplyCode = async () => {
    const codeToUse = inputCode.trim() || urlCode;
    
    if (!codeToUse) {
      return;
    }

    const result = await applyAffiliateCode(userId, codeToUse);
    
    if (result.success) {
      clearAffiliateCode();
      onCodeApplied();
    }
  };

  const handleChangeCode = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new affiliate code",
        variant: "destructive",
      });
      return;
    }

    setIsChanging(true);
    
    try {
      const { data, error } = await supabase.rpc('change_affiliate_code', {
        p_user_id: userId,
        p_new_code: inputCode.trim()
      });

      if (error) throw error;

      const response = data as { success: boolean; code?: string; error?: string; next_change_available?: string };

      if (response.success) {
        toast({
          title: "Success!",
          description: "Your affiliate code has been changed successfully!",
        });
        onCodeApplied();
        setInputCode('');
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to change affiliate code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error changing affiliate code:', error);
      toast({
        title: "Error",
        description: "Failed to change affiliate code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  // If user doesn't have an affiliate code, show apply interface
  if (!currentCode) {
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Apply Affiliate Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {urlCode && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We found an affiliate code from your referral link: <span className="font-mono font-semibold">{urlCode}</span>
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="affiliate-code">Affiliate Code</Label>
            <Input
              id="affiliate-code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter affiliate code"
              className="font-mono"
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground">
              Enter a friend's affiliate code to support them and get connected to the community!
            </p>
          </div>
          
          <Button
            onClick={handleApplyCode}
            disabled={isApplying || (!inputCode.trim() && !urlCode)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            {isApplying ? 'Applying...' : 'Apply Affiliate Code'}
          </Button>
          
          {urlCode && (
            <Button
              variant="outline"
              onClick={clearAffiliateCode}
              className="w-full"
            >
              Clear Referral Code
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // If user has an affiliate code, show change interface
  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Change Affiliate Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Current Code</Label>
          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-mono font-semibold text-green-600">{currentCode}</span>
          </div>
        </div>

        {!canChangeCode() && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                You can change your code again in {getTimeUntilNextChange()}
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="new-affiliate-code">New Affiliate Code</Label>
          <Input
            id="new-affiliate-code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="Enter new affiliate code"
            className="font-mono"
            maxLength={12}
            disabled={!canChangeCode()}
          />
          <p className="text-xs text-muted-foreground">
            Enter a new affiliate code (6-12 characters, letters and numbers only). You can change it once per week.
          </p>
        </div>
        
        <Button
          onClick={handleChangeCode}
          disabled={isChanging || !inputCode.trim() || !canChangeCode()}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          {isChanging ? 'Changing...' : 'Change Affiliate Code'}
        </Button>
      </CardContent>
    </Card>
  );
};
