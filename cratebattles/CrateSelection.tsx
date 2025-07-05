
import React from 'react';
import { CrateGrid } from './CrateGrid';
import { BattleConfigForm } from './BattleConfigForm';
import { CrateSelectionButton } from './CrateSelectionButton';
import { useCrateBattle } from './useCrateBattle';
import { rustCrates } from './rustCrateData';
import { useToast } from '@/hooks/use-toast';

interface CrateSelectionProps {
  onStartBattle: (battle: any) => void;
}

interface CrateData {
  id: string;
  name: string;
  price: number;
  category: string[];
  rarity: string;
  image: string;
  items: Array<{
    name: string;
    chance: number;
    img: string;
  }>;
}

export const CrateSelection: React.FC<CrateSelectionProps> = ({
  onStartBattle
}) => {
  const [selectedCrate, setSelectedCrate] = React.useState<any>(null);
  const [battleCrates, setBattleCrates] = React.useState<Array<{crate: any, quantity: number}>>([]);
  const [modalSelectedCrates, setModalSelectedCrates] = React.useState<CrateData[]>([]);
  const { toast } = useToast();
  
  const { 
    playerCount, 
    setPlayerCount, 
    gameMode, 
    setGameMode, 
    teamMode, 
    setTeamMode, 
    createBattle 
  } = useCrateBattle();

  const handleCrateSelect = (crate: any) => {
    setSelectedCrate(crate);
  };

  const handleAddToBattle = (crate: any, quantity: number) => {
    setSelectedCrate(crate);
    
    // Check if crate already exists in battle
    const existingIndex = battleCrates.findIndex(item => item.crate.id === crate.id);
    
    if (existingIndex >= 0) {
      // Update existing crate quantity
      const updatedCrates = [...battleCrates];
      updatedCrates[existingIndex].quantity += quantity;
      setBattleCrates(updatedCrates);
    } else {
      // Add new crate to battle
      setBattleCrates(prev => [...prev, { crate, quantity }]);
    }

    toast({
      title: 'Added to Battle',
      description: `Added ${quantity}x ${crate.name} to your battle.`,
    });
  };

  const handleModalCratesSelected = (crates: CrateData[]) => {
    setModalSelectedCrates(crates);
    
    // Convert modal crates to battle crates format
    const newBattleCrates = crates.map(crate => ({
      crate: {
        id: crate.id,
        name: crate.name,
        price: crate.price,
        image: crate.image,
        rarity: crate.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        items: crate.items.length,
        minValue: Math.min(...crate.items.map(item => item.chance * 10)),
        maxValue: Math.max(...crate.items.map(item => item.chance * 100)),
        contents: crate.items.map(item => ({
          name: item.name,
          image: item.img,
          value: item.chance * 10,
          dropChance: item.chance * 100,
          rarity: item.chance > 0.1 ? 'common' : item.chance > 0.05 ? 'rare' : 'epic'
        }))
      },
      quantity: 1
    }));

    // Merge with existing battle crates
    const mergedCrates = [...battleCrates];
    
    newBattleCrates.forEach(newCrate => {
      const existingIndex = mergedCrates.findIndex(item => item.crate.id === newCrate.crate.id);
      if (existingIndex >= 0) {
        mergedCrates[existingIndex].quantity += newCrate.quantity;
      } else {
        mergedCrates.push(newCrate);
      }
    });

    setBattleCrates(mergedCrates);
    
    // Set the first crate as selected if none selected
    if (!selectedCrate && newBattleCrates.length > 0) {
      setSelectedCrate(newBattleCrates[0].crate);
    }

    toast({
      title: 'Crates Added',
      description: `Added ${crates.length} crates to your battle.`,
    });
  };

  const handleStartBattle = () => {
    if (battleCrates.length === 0) {
      toast({
        title: 'No Crates Added',
        description: 'Please add at least one crate to start the battle.',
        variant: 'destructive'
      });
      return;
    }

    createBattle(selectedCrate, onStartBattle, battleCrates);
  };

  return (
    <div className="space-y-6">
      {/* Crate Selection with Modal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Select Your Crates</h2>
        <CrateSelectionButton onCratesSelected={handleModalCratesSelected} />
      </div>

      {/* Original Crate Selection */}
      <CrateGrid 
        selectedCrate={selectedCrate}
        onCrateSelect={handleCrateSelect}
        onAddToBattle={handleAddToBattle}
      />

      {/* Battle Configuration */}
      {(selectedCrate || battleCrates.length > 0) && (
        <BattleConfigForm
          selectedCrate={selectedCrate || battleCrates[0]?.crate}
          battleCrates={battleCrates}
          playerCount={playerCount}
          gameMode={gameMode}
          teamMode={teamMode}
          onPlayerCountChange={setPlayerCount}
          onGameModeChange={setGameMode}
          onTeamModeChange={setTeamMode}
          onStartBattle={handleStartBattle}
        />
      )}
    </div>
  );
};
