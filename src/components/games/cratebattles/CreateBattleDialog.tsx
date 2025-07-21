
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Star, Crown, Zap, Target, Users, Lock, Wifi, WifiOff, Bot, Flame } from 'lucide-react';
import { rustCrates } from './rustCrateData';
import { useCrateBattle } from './useCrateBattle';

interface Crate {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface CreateBattleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBattleCreated: (battle: any) => void;
  minEntry: number;
  maxEntry: number;
}

export const CreateBattleDialog: React.FC<CreateBattleDialogProps> = ({
  open,
  onOpenChange,
  onBattleCreated,
  minEntry,
  maxEntry
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    gameMode, 
    setGameMode, 
    teamMode, 
    setTeamMode, 
    createBattle 
  } = useCrateBattle();
  
  const [selectedCrate, setSelectedCrate] = useState<Crate | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the comprehensive crate list from rustCrateData
  const crates: Crate[] = rustCrates.map(rustCrate => ({
    id: rustCrate.id,
    name: rustCrate.name,
    price: rustCrate.price,
    image: rustCrate.image,
    rarity: rustCrate.rarity
  }));

  const gameModes = [
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'Last crate opened determines the winner',
      icon: <Target className="h-4 w-4" />,
      color: 'from-red-400 to-red-600'
    },
    {
      id: 'unlucky',
      name: 'Unlucky',
      description: 'Team with lowest total winnings wins',
      icon: <Zap className="h-4 w-4" />,
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'jackpot',
      name: 'Jackpot',
      description: 'Win probability based on crate values',
      icon: <Crown className="h-4 w-4" />,
      color: 'from-yellow-400 to-orange-600'
    },
    {
      id: 'puresulfur',
      name: 'PureSulfur',
      description: 'Pure sulfur mode with special mechanics',
      icon: <Flame className="h-4 w-4" />,
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const teamModes = ['1v1', '2v2', '3v3', '1v1v1', '2v2v2'];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-orange-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTotalCost = () => {
    if (!selectedCrate) return 0;
    return selectedCrate.price;
  };

  const handleCreateBattle = async () => {
    setError(null);
    if (!selectedCrate) {
      toast({
        title: 'No Crate Selected',
        description: 'Please select a crate type to create the battle.',
        variant: 'destructive'
      });
      return;
    }
    const totalCost = getTotalCost();
    if (totalCost < minEntry || totalCost > maxEntry) {
      setError(`Total cost must be between ${minEntry} and ${maxEntry}`);
      return;
    }
    if (!profile || profile.balance < totalCost) {
      toast({
        title: 'Insufficient Balance',
        description: `You need $${totalCost.toFixed(2)} to create this battle.`,
        variant: 'destructive'
      });
      return;
    }

    // Convert selected crate to RustCrate format
    const rustCrate = rustCrates.find(c => c.id === selectedCrate.id);
    if (!rustCrate) {
      toast({
        title: 'Invalid Crate',
        description: 'Selected crate is not available.',
        variant: 'destructive'
      });
      return;
    }

    const battleCrates = [{ crate: rustCrate, quantity: 1 }];

    console.log('Creating battle with modes:', { gameMode, teamMode });

    // Create battle with exact game mode and team mode preservation
    await createBattle(
      rustCrate,
      onBattleCreated,
      battleCrates,
      2, // playerCount (default to 2, or replace with actual if available)
      gameMode,
      teamMode,
      true // isPersistent
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Create New Online Battle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Display */}
          {profile && (
            <Card className="bg-gradient-to-r from-green-400/10 to-green-600/10 border-green-400/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Your Balance</h3>
                    <p className="text-sm text-muted-foreground">Available funds for battles</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">${profile.balance.toFixed(2)}</div>
                </div>
              </div>
            </Card>
          )}
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

          {/* Crate Selection */}
          <div>
            <Label className="text-lg font-semibold">Select Crate Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 max-h-64 overflow-y-auto">
              {crates.map((crate) => (
                <Card
                  key={crate.id}
                  className={`relative cursor-pointer transition-all duration-300 border-2 ${
                    selectedCrate?.id === crate.id
                      ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCrate(crate)}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center rounded-lg"
                    style={{ backgroundImage: `url(${crate.image})` }}
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-lg" />
                  
                  <div className="relative p-3 space-y-2">
                    <Badge className={`bg-gradient-to-r ${getRarityColor(crate.rarity)} text-white border-none text-xs`}>
                      {crate.rarity}
                    </Badge>
                    <h4 className="text-sm font-bold text-white">{crate.name}</h4>
                    <div className="text-primary font-bold">${crate.price}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Mode */}
          <div>
            <Label className="text-lg font-semibold">Team Mode</Label>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {teamModes.map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setTeamMode(mode)}
                  variant={teamMode === mode ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          {/* Game Mode Selection */}
          <div>
            <Label className="text-lg font-semibold">Game Mode</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
              {gameModes.map((mode) => (
                <Card
                  key={mode.id}
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    gameMode === mode.id
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => setGameMode(mode.id as any)}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${mode.color} rounded-lg flex items-center justify-center`}>
                        {mode.icon}
                      </div>
                      <h3 className="font-bold text-foreground">{mode.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsPrivate(!isPrivate)}
              variant={isPrivate ? 'default' : 'outline'}
              size="sm"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isPrivate ? 'Private Battle' : 'Public Battle'}
            </Button>
          </div>

          {/* Battle Summary */}
          {selectedCrate && (
            <Card className="bg-secondary/30 border-border/50 p-4">
              <h3 className="font-semibold mb-3">Battle Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium flex items-center space-x-1">
                    <Wifi className="h-3 w-3" />
                    <span>Online</span>
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Crate:</span>
                  <span className="ml-2 font-medium">{selectedCrate.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Entry cost:</span>
                  <span className="ml-2 font-medium text-red-400">${selectedCrate.price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Game mode:</span>
                  <span className="ml-2 font-medium capitalize">{gameMode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Team mode:</span>
                  <span className="ml-2 font-medium">{teamMode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Will be charged:</span>
                  <span className="ml-2 font-bold text-red-400">${getTotalCost().toFixed(2)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleCreateBattle}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={!selectedCrate || !profile || profile.balance < getTotalCost()}
            >
              Create Battle (${getTotalCost().toFixed(2)})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
