
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateAffiliateCodeResponse } from '@/types/affiliate';

interface AffiliateCodeManagerFormProps {
  onCodeCreated: (code: string) => void;
}

export const AffiliateCodeManagerForm: React.FC<AffiliateCodeManagerFormProps> = ({
  onCodeCreated
}) => {
  const [customCode, setCustomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createAffiliateCode = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_affiliate_code', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_custom_code: customCode.trim() || null
      });

      if (error) throw error;

      const response = data as unknown as CreateAffiliateCodeResponse;

      if (response.success && response.code) {
        onCodeCreated(response.code);
        toast({
          title: "Success",
          description: "Your affiliate code has been created!",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create affiliate code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating affiliate code:', error);
      toast({
        title: "Error",
        description: "Failed to create affiliate code",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Create Your Affiliate Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="custom-code">Custom Code (Optional)</Label>
          <Input
            id="custom-code"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            placeholder="Enter your custom code (6-12 characters)"
            className="font-mono"
            maxLength={12}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to generate a random code. Only letters and numbers allowed.
          </p>
        </div>
        <Button
          onClick={createAffiliateCode}
          disabled={isCreating}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          {isCreating ? 'Creating...' : 'Create Affiliate Code'}
        </Button>
      </CardContent>
    </Card>
  );
};
