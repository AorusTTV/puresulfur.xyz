import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SecureProfileEditor } from '@/components/auth/SecureProfileEditor';
import { ProfileImageUpload } from '@/components/auth/profile/ProfileImageUpload';
import { AffiliateCodeInput } from '@/components/affiliate/AffiliateCodeInput';
import { RedeemCodeDialog } from '@/components/profile/RedeemCodeDialog';
import { ExternalLink, Key, Copy, Check, Share2 } from 'lucide-react';
import { getLevelColorInfo } from '@/utils/levelColorUtils';
import { ExtendedProfile } from '@/types/affiliate';
import { useAffiliateData } from '@/hooks/useAffiliateData';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const DEFAULT_AVATAR_URL = '/lovable-uploads/17b8992d-84fb-420d-b1e3-83c8a25555fa.png';

const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { data: affiliateData } = useAffiliateData();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Affiliate link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageError = () => {
    console.error('Profile page image failed to load:', extendedProfile.avatar_url);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Profile page image loaded successfully:', extendedProfile.avatar_url);
    setImageError(false);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cast profile to ExtendedProfile to access affiliate_code_used
  const extendedProfile = profile as ExtendedProfile;
  const displayName = extendedProfile.nickname || extendedProfile.steam_username || 'User';
  const colorInfo = getLevelColorInfo(extendedProfile.level);
  const hasNotUsedAffiliateCode = !extendedProfile.affiliate_code_used;

  // Use Steam avatar for Steam users, default crystal for non-Steam users
  const avatarUrl = extendedProfile.steam_id && !imageError ? extendedProfile.avatar_url : DEFAULT_AVATAR_URL;

  // Debug log for avatar URL
  console.log('ProfilePage - Avatar URL:', avatarUrl);
  console.log('ProfilePage - Image Error State:', imageError);
  console.log('ProfilePage - Is Steam User:', !!extendedProfile.steam_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={avatarUrl} 
                    alt={displayName}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {imageError && extendedProfile.avatar_url && extendedProfile.steam_id && (
                  <p className="text-xs text-destructive mt-2">
                    Steam image failed, using default
                  </p>
                )}
              </div>
              
              <div className="flex-grow text-left">
                <h2 className={`text-xl font-semibold ${colorInfo.nameColor}`}>{displayName}</h2>
                <p className="text-muted-foreground text-left">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 justify-start">
                  <Badge variant="secondary" className={`${colorInfo.nameColor} border-current`}>
                    Level {extendedProfile.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{extendedProfile.experience || 0} XP</span>
                </div>
                
                {/* Show profile image info - no upload option anymore */}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    {extendedProfile.steam_id 
                      ? "Steam profile picture is used automatically" 
                      : "Default profile picture assigned"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Display user's affiliate code if they have one */}
            {affiliateData.affiliateCode && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Your Affiliate Code
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Input
                      value={affiliateData.affiliateCode}
                      readOnly
                      className="font-mono bg-transparent border-none p-0 text-green-600 font-semibold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(affiliateData.affiliateCode)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Input
                      value={`https://5504134f-c31d-4d3f-804d-f210ad0f0546.lovableproject.com?ref=${affiliateData.affiliateCode}`}
                      readOnly
                      className="font-mono bg-transparent border-none p-0 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(`https://5504134f-c31d-4d3f-804d-f210ad0f0546.lovableproject.com?ref=${affiliateData.affiliateCode}`)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Share your affiliate code or link with friends to earn commissions when they sign up and play!
                  </p>
                </div>
              </div>
            )}

            {extendedProfile.steam_trade_url && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Steam Trade URL</h3>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <a
                    href={extendedProfile.steam_trade_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm font-mono break-all"
                  >
                    {extendedProfile.steam_trade_url}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              </div>
            )}

            {extendedProfile.api_key && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key Status
                </h3>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Configured
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    API key is set and ready for inventory sync
                  </span>
                </div>
              </div>
            )}

            {!extendedProfile.api_key && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key Status
                </h3>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Not Configured
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Add an API key to enable inventory sync
                  </span>
                </div>
              </div>
            )}

            {/* Show affiliate code used */}
            {extendedProfile.affiliate_code_used && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Affiliate Code Used</h3>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Badge variant="outline" className="text-green-600 border-green-600 font-mono">
                    {extendedProfile.affiliate_code_used}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    You used this affiliate code during registration
                  </span>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Affiliate Code Input - now supports both applying and changing codes */}
        <AffiliateCodeInput
          userId={user.id}
          onCodeApplied={refreshProfile}
          currentCode={hasNotUsedAffiliateCode ? null : extendedProfile.affiliate_code_used}
          lastChangeDate={extendedProfile.affiliate_code_changed_at}
        />

        <SecureProfileEditor />
      </div>
    </div>
  );
};

export default ProfilePage;
