import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Clock } from 'lucide-react';
import { DualWeapon } from '@/types/dual';

interface WeaponSelectorProps {
  weapons: DualWeapon[];
  selectedWeapon: DualWeapon | null;
  onWeaponSelect: (weapon: DualWeapon) => void;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  weapons,
  selectedWeapon,
  onWeaponSelect
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'bg-gray-500';
      case 'rare':
        return 'bg-blue-500';
      case 'epic':
        return 'bg-purple-500';
      case 'legendary':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Select Your Weapon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weapons.map((weapon) => (
            <div
              key={weapon.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                selectedWeapon?.id === weapon.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card/40 hover:border-primary/50'
              }`}
              onClick={() => onWeaponSelect(weapon)}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{weapon.name}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`${getRarityColor(weapon.rarity)} text-white text-xs`}
                    >
                      {weapon.rarity}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-red-500" />
                      <span className="text-muted-foreground">DMG: {weapon.damage}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-blue-500" />
                      <span className="text-muted-foreground">ACC: {Math.round(weapon.accuracy * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">RPM: {weapon.fire_rate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};