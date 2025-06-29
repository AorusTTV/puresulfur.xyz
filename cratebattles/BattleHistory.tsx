
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Users, Eye } from 'lucide-react';

interface BattleHistoryItem {
  id: string;
  crate: string;
  players: number;
  winner: string;
  totalValue: number;
  yourWin: boolean;
  timestamp: Date;
  items: Array<{
    player: string;
    item: string;
    value: number;
  }>;
}

export const BattleHistory: React.FC = () => {
  const [selectedBattle, setSelectedBattle] = useState<string | null>(null);

  // Mock battle history data
  const battleHistory: BattleHistoryItem[] = [
    {
      id: '1',
      crate: 'Legend Vault',
      players: 4,
      winner: 'ProGamer_2024',
      totalValue: 100.00,
      yourWin: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      items: [
        { player: 'You', item: 'AK-47 Redline', value: 45.20 },
        { player: 'ProGamer_2024', item: 'AWP Dragon Lore', value: 2400.00 },
        { player: 'Rust_Master', item: 'M4A4 Asiimov', value: 25.50 },
        { player: 'SteelWarrior', item: 'Glock Fade', value: 125.50 }
      ]
    },
    {
      id: '2',
      crate: 'Metal Master',
      players: 2,
      winner: 'You',
      totalValue: 20.00,
      yourWin: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      items: [
        { player: 'You', item: 'USP-S Kill Confirmed', value: 75.30 },
        { player: 'CasualPlayer', item: 'P250 Sand Dune', value: 0.10 }
      ]
    },
    {
      id: '3',
      crate: 'Rust Warrior',
      players: 3,
      winner: 'SkinCollector',
      totalValue: 15.00,
      yourWin: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      items: [
        { player: 'You', item: 'MAC-10 Neon Rider', value: 8.50 },
        { player: 'SkinCollector', item: 'AK-47 Vulcan', value: 65.00 },
        { player: 'RandomUser', item: 'P90 Asiimov', value: 12.00 }
      ]
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Battle History</h2>
        <div className="text-sm text-muted-foreground">
          Showing your recent crate battles
        </div>
      </div>

      {battleHistory.length === 0 ? (
        <Card className="bg-card/60 border-border/50 p-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No battles yet</h3>
          <p className="text-muted-foreground">Start your first crate battle to see your history here!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {battleHistory.map((battle) => (
            <Card 
              key={battle.id}
              className={`border transition-all duration-200 hover:shadow-md ${
                battle.yourWin 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-red-500/50 bg-red-500/5'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Battle Result Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      battle.yourWin 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    
                    {/* Battle Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{battle.crate}</h3>
                        <Badge variant={battle.yourWin ? 'default' : 'secondary'}>
                          {battle.yourWin ? 'WON' : 'LOST'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{battle.players} players</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <img src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" alt="Sulfur" className="h-3 w-3" />
                          <span>${battle.totalValue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(battle.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Winner and Action */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        Winner: {battle.winner}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {battle.yourWin ? 'Congratulations!' : 'Better luck next time'}
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedBattle(selectedBattle === battle.id ? null : battle.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {selectedBattle === battle.id ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {selectedBattle === battle.id && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <h4 className="font-medium text-foreground mb-3">Battle Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {battle.items.map((item, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border ${
                            item.player === 'You' 
                              ? 'border-primary/50 bg-primary/5' 
                              : item.player === battle.winner
                              ? 'border-yellow-500/50 bg-yellow-500/5'
                              : 'border-border/50 bg-card/30'
                          }`}
                        >
                          <div className="text-sm font-medium text-foreground mb-1">
                            {item.player}
                            {item.player === battle.winner && (
                              <Trophy className="h-3 w-3 text-yellow-500 inline ml-1" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {item.item}
                          </div>
                          <div className="text-sm font-bold text-primary">
                            ${item.value.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
