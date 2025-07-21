import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SocialAccount {
  platform: string;
}

interface SocialAccountIconsProps {
  socialAccounts: SocialAccount[];
}

export const SocialAccountIcons: React.FC<SocialAccountIconsProps> = ({ socialAccounts }) => {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'kick':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <img 
                  src="/lovable-uploads/62ef7cb3-ff74-451c-8515-368d6c4ba591.png" 
                  alt="Kick" 
                  className="w-5 h-5 rounded"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Kick Verified</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'youtube':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <img 
                  src="/lovable-uploads/0797455c-9f90-47b2-b52c-b0f7aa7ca42d.png" 
                  alt="YouTube" 
                  className="w-8 h-8 rounded"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>YouTube Verified</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  if (!socialAccounts || socialAccounts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1">
      {socialAccounts.map((account, index) => (
        <div key={`${account.platform}-${index}`}>
          {getSocialIcon(account.platform)}
        </div>
      ))}
    </div>
  );
};