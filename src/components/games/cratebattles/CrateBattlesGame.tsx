
import React, { useState } from 'react';
import { GameGuard } from '@/components/games/GameGuard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock, Box, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CrateSelection } from './CrateSelection';
import { BattleRoom } from './BattleRoom';
import { BattleHistory } from './BattleHistory';
import { AvailableBattles } from './AvailableBattles';
import { CreateBattleDialog } from './CreateBattleDialog';

interface CrateBattlesGameProps {
  onBackToGames: () => void;
}

export const CrateBattlesGame: React.FC<CrateBattlesGameProps> = ({ onBackToGames }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'battles' | 'history'>('battles');
  const [selectedCrate, setSelectedCrate] = useState(null);
  const [currentBattle, setCurrentBattle] = useState(null);
  const [isCreateBattleOpen, setIsCreateBattleOpen] = useState(false);

  const handleCreateBattle = () => {
    setIsCreateBattleOpen(true);
  };

  const handleBackToGames = () => {
    if (onBackToGames) {
      onBackToGames();
    } else {
      navigate('/games');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      <GameGuard gameName="Crate Battles">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={handleBackToGames}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(120 80% 55%)' }}>
                  <Box className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
                  CRATE BATTLES
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsCreateBattleOpen(true)}
                className="text-white font-bold"
                style={{ backgroundColor: 'hsl(120 80% 55%)' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                CREATE BATTLE
              </Button>
              
              <div className="bg-card/60 border border-border/50 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4" style={{ color: 'hsl(120 80% 55%)' }} />
                  <span className="text-muted-foreground">Online:</span>
                  <span className="text-foreground font-medium">1,247</span>
                </div>
              </div>
              <div className="bg-card/60 border border-border/50 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4" style={{ color: 'hsl(120 80% 55%)' }} />
                  <span className="text-muted-foreground">Battles Today:</span>
                  <span className="text-foreground font-medium">834</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-card/30 border border-border/50 rounded-lg p-1">
            <Button
              onClick={() => setActiveTab('battles')}
              variant={activeTab === 'battles' ? 'default' : 'ghost'}
              className={`flex-1 ${
                activeTab === 'battles'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={activeTab === 'battles' ? { backgroundColor: 'hsl(120 80% 55%)' } : {}}
            >
              Available Battles
            </Button>
            <Button
              onClick={() => setActiveTab('history')}
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              className={`flex-1 ${
                activeTab === 'history'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={activeTab === 'history' ? { backgroundColor: 'hsl(120 80% 55%)' } : {}}
            >
              Battle History
            </Button>
          </div>

          {/* Content */}
          {currentBattle ? (
            <BattleRoom 
              battle={currentBattle}
              onLeaveBattle={() => setCurrentBattle(null)}
            />
          ) : (
            <>
              {activeTab === 'battles' && (
                <AvailableBattles 
                  onJoinBattle={setCurrentBattle}
                  onCreateBattle={handleCreateBattle}
                />
              )}

              {activeTab === 'history' && (
                <BattleHistory />
              )}
            </>
          )}

          {/* Create Battle Dialog */}
          <CreateBattleDialog
            open={isCreateBattleOpen}
            onOpenChange={setIsCreateBattleOpen}
            onBattleCreated={(battle) => {
              setCurrentBattle(battle);
              setIsCreateBattleOpen(false);
            }}
          />
        </div>
      </GameGuard>
    </div>
  );
};
