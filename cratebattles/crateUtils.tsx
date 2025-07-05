
import { Star, Award, Crown, Gem, Zap } from 'lucide-react';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const getRarityColor = (rarity: string): string => {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'border-gray-500';
    case 'uncommon':
      return 'border-green-500';
    case 'rare':
      return 'border-blue-500';
    case 'epic':
      return 'border-purple-500';
    case 'legendary':
      return 'border-orange-500';
    default:
      return 'border-gray-500';
  }
};

export const getRarityIcon = (rarity: string) => {
  const iconProps = { className: "h-3 w-3" };
  
  switch (rarity?.toLowerCase()) {
    case 'common':
      return <Star className="h-3 w-3 text-gray-400" />;
    case 'uncommon':
      return <Award className="h-3 w-3 text-green-400" />;
    case 'rare':
      return <Crown className="h-3 w-3 text-blue-400" />;
    case 'epic':
      return <Gem className="h-3 w-3 text-purple-400" />;
    case 'legendary':
      return <Zap className="h-3 w-3 text-orange-400" />;
    default:
      return <Star className="h-3 w-3 text-gray-400" />;
  }
};

export const getRarityBgColor = (rarity: string): string => {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'bg-gray-500/20';
    case 'uncommon':
      return 'bg-green-500/20';
    case 'rare':
      return 'bg-blue-500/20';
    case 'epic':
      return 'bg-purple-500/20';
    case 'legendary':
      return 'bg-orange-500/20';
    default:
      return 'bg-gray-500/20';
  }
};
