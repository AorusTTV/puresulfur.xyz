
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AffiliateCodeManagerForm } from './AffiliateCodeManagerForm';

interface AffiliateCodeManagerProps {
  affiliateCode: string | null;
  onCodeCreated: (code: string) => void;
}

export const AffiliateCodeManager: React.FC<AffiliateCodeManagerProps> = ({
  affiliateCode,
  onCodeCreated
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Affiliate link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    if (affiliateCode) {
      const url = `https://5504134f-c31d-4d3f-804d-f210ad0f0546.lovableproject.com?ref=${affiliateCode}`;
      copyToClipboard(url);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditCode(affiliateCode || '');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditCode('');
  };

  const updateAffiliateCode = async () => {
    if (!editCode.trim()) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.rpc('update_affiliate_code', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_new_code: editCode.trim()
      });

      if (error) throw error;

      const response = data as { success: boolean; code?: string; error?: string };

      if (response.success && response.code) {
        onCodeCreated(response.code);
        setIsEditing(false);
        setEditCode('');
        toast({
          title: "Success",
          description: "Your affiliate code has been updated!",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update affiliate code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating affiliate code:', error);
      toast({
        title: "Error",
        description: "Failed to update affiliate code",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // If user has an affiliate code, show the management interface
  if (affiliateCode) {
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Affiliate Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  placeholder="Enter new code (6-12 characters)"
                  className="font-mono"
                  maxLength={12}
                  disabled={isUpdating}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={updateAffiliateCode}
                  disabled={isUpdating || !editCode.trim()}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={cancelEditing}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Input
                  value={affiliateCode}
                  readOnly
                  className="font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(affiliateCode)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={startEditing}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Input
                value={`https://5504134f-c31d-4d3f-804d-f210ad0f0546.lovableproject.com?ref=${affiliateCode}`}
                readOnly
                className="font-mono bg-muted text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={shareCode}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            {isEditing 
              ? "Enter a custom code (6-12 characters, letters and numbers only)"
              : "Share your affiliate link with friends! When they sign up using your link, your affiliate code will be automatically applied to their account."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  // If user doesn't have an affiliate code, show the creation form
  return <AffiliateCodeManagerForm onCodeCreated={onCodeCreated} />;
};
