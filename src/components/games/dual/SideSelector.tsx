import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Swords } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_AVATAR_URL = '/lovable-uploads/17b8992d-84fb-420d-b1e3-83c8a25555fa.png';

interface SideSelectorProps {
  selectedSide: string;
  onSideSelect: (side: string) => void;
  disabled?: boolean;
}

export const SideSelector: React.FC<SideSelectorProps> = ({
  selectedSide,
  onSideSelect,
  disabled = false
}) => {
  const { profile } = useAuth();
  const [imageError, setImageError] = useState(false);

  const getPlayerName = (player: any) => {
    return player?.nickname || player?.steam_username || 'Player';
  };

  // Use Steam avatar for Steam users, default crystal for non-Steam users
  const avatarUrl = profile?.steam_id && !imageError ? profile?.avatar_url : DEFAULT_AVATAR_URL;

  const handleImageError = () => {
    console.error('Profile image failed to load:', profile?.avatar_url);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Profile image loaded successfully:', profile?.avatar_url);
    setImageError(false);
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-muted-foreground">
          Pick a Side
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8 py-6">
          {/* Left Side */}
          <div
            className={`relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !disabled && onSideSelect('left')}
          >
          <div className={`relative ${selectedSide === 'left' ? 'ring-4 ring-primary ring-offset-4 ring-offset-background rounded-full' : ''}`}>
            {selectedSide === 'left' ? (
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={avatarUrl} 
                  alt={getPlayerName(profile)}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                <AvatarFallback>
                  {getPlayerName(profile).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
              </div>
            )}
          </div>
          </div>

          {/* Center VS */}
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/cf3fd8cd-7299-4f99-84de-f85640d51847.png" 
              alt="VS" 
              className="h-8 w-8 opacity-50" 
            />
          </div>

          {/* Right Side */}
          <div
            className={`relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !disabled && onSideSelect('right')}
          >
          <div className={`relative ${selectedSide === 'right' ? 'ring-4 ring-primary ring-offset-4 ring-offset-background rounded-full' : ''}`}>
            {selectedSide === 'right' ? (
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={avatarUrl} 
                  alt={getPlayerName(profile)}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                <AvatarFallback>
                  {getPlayerName(profile).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
              </div>
            )}
          </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};