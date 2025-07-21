
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, FileText, Users, Gift } from 'lucide-react';
import { getLevelColorInfo } from '@/utils/levelColorUtils';
import { useState } from 'react';

const DEFAULT_AVATAR_URL = '/lovable-uploads/17b8992d-84fb-420d-b1e3-83c8a25555fa.png';

export const UserProfile: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  if (!user || !profile) return null;

  const displayName = profile.nickname || profile.steam_username || 'User';
  const colorInfo = getLevelColorInfo(profile.level);

  // Use Steam avatar for Steam users, default crystal for non-Steam users
  const avatarUrl = profile.steam_id && !imageError ? profile.avatar_url : DEFAULT_AVATAR_URL;

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleAffiliateClick = () => {
    navigate('/affiliate');
  };

  const handleSitePoliciesClick = () => {
    navigate('/site-policies');
  };

  const handleRedeemCodeClick = () => {
    navigate('/redeem');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleImageError = () => {
    console.error('Profile image failed to load:', profile.avatar_url);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Profile image loaded successfully:', profile.avatar_url);
    setImageError(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={avatarUrl} 
              alt={displayName}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className={`font-medium ${colorInfo.nameColor}`}>{displayName}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <p className={`text-xs ${colorInfo.nameColor}`}>
              Level {profile.level} • {profile.experience || 0} XP
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
          onClick={handleProfileClick}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
          onClick={handleAffiliateClick}
        >
          <Users className="mr-2 h-4 w-4" />
          <span>Affiliate</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
          onClick={handleRedeemCodeClick}
        >
          <Gift className="mr-2 h-4 w-4" />
          <span>Redeem a Code</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
          onClick={handleSettingsClick}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer"
          onClick={handleSitePoliciesClick}
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>Site Policies</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
