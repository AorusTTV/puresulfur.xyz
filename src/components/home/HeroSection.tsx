
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LevelProgress } from '@/components/level/LevelProgress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, Store, Gift, Zap, MessageSquare } from 'lucide-react';
import { LevelGiftsModal } from '@/components/level/LevelGiftsModal';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isGiftsModalOpen, setIsGiftsModalOpen] = useState(false);

  const handleDiscordClick = () => {
    window.open('https://discord.gg/xZk7VcbXSG', '_blank');
  };

  return (
    <TooltipProvider>
      <div className="relative overflow-hidden">
        <div className="relative container mx-auto px-6 py-16 text-center">
          <div className="max-w-6xl mx-auto">
            {/* Action Buttons - Fixed container width and spacing */}
            <div className="flex gap-3 justify-center items-center mb-12 px-2 overflow-visible">
              <Button
                onClick={() => navigate('/games')}
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-6 py-4 text-base flex-shrink-0 min-w-fit"
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                Start Playing
              </Button>
              <Button
                onClick={() => navigate('/store')}
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-6 py-4 text-base flex-shrink-0 min-w-fit"
              >
                <Store className="mr-2 h-5 w-5" />
                Browse Store
              </Button>
              
              {/* Discord Server Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDiscordClick}
                    size="lg"
                    variant="outline"
                    className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white font-bold px-6 py-4 text-base flex-shrink-0 min-w-fit"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Discord Server
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Join our Discord community for event updates, announcements, and exclusive content!</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Level Gifts Button */}
              {user && (
                <Button
                  onClick={() => setIsGiftsModalOpen(true)}
                  size="lg"
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold px-6 py-4 text-base relative flex-shrink-0 min-w-fit"
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Level Gifts
                  {/* Notification dot with sulfur icon */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Zap className="h-3 w-3 text-black" />
                  </div>
                </Button>
              )}
            </div>
            
            {/* Feature highlights - Now with updated dimensions */}
            <div className="flex gap-6 mt-12 justify-center">
              <div 
                className="w-[200px] h-[300px] relative bg-cover bg-center bg-no-repeat rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-end"
                style={{ backgroundImage: `url(/lovable-uploads/926c0954-4156-44f2-9d84-e86196128364.png)` }}
                onClick={() => navigate('/store')}
              >
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white">Skins Store</h3>
                </div>
              </div>
              <div 
                className="w-[200px] h-[300px] relative rounded-lg border border-[#5865F2]/30 shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_25px_rgba(88,101,242,0.5)] transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ backgroundImage: `url(/lovable-uploads/da82b546-0f2e-4d8f-bc98-98a14eb4e93e.png)`, backgroundSize: '210%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                onClick={handleDiscordClick}
              >
              </div>
              <div 
                className="w-[200px] h-[300px] relative rounded-lg border border-yellow-500/30 shadow-[0_0_15px_rgba(255,193,7,0.3)] hover:shadow-[0_0_25px_rgba(255,193,7,0.5)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-end"
                style={{ backgroundImage: `url(/lovable-uploads/ec23c802-08f8-4d24-9e9b-e58894ac5816.png)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                onClick={() => navigate('/games')}
              >
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white">Mini Games</h3>
                </div>
              </div>
            </div>

            {/* Level Progress Section - Right below feature cards */}
            {user && profile && (
              <div className="mt-12">
                <div className="max-w-4xl mx-auto">
                  <LevelProgress 
                    experience={profile.experience || 0}
                    level={profile.level || 1}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Level Gifts Modal */}
        <LevelGiftsModal 
          open={isGiftsModalOpen}
          onOpenChange={setIsGiftsModalOpen}
        />
      </div>
    </TooltipProvider>
  );
};
