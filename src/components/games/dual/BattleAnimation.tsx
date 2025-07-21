import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Target, Skull, DollarSign, Sword, Bomb } from 'lucide-react';
import fireEffect from '/lovable-uploads/a5ca97e9-f7b8-4c65-99ca-6ecc4bd72fb0.png';
import { useAuth } from '@/contexts/AuthContext';
import { useWeaponSounds } from '@/hooks/useWeaponSounds';

interface BattleAnimationProps {
  battleResult: any;
  onComplete: () => void;
  pending?: boolean;
}

export const BattleAnimation: React.FC<BattleAnimationProps> = ({
  battleResult,
  onComplete,
  pending
}) => {
  const { user, profile } = useAuth();
  const { playWeaponSound } = useWeaponSounds();
  const [animationPhase, setAnimationPhase] = useState<'countdown' | 'battle' | 'result'>('countdown');
  const [countdown, setCountdown] = useState(5); // 5 second countdown as requested
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [currentAttacker, setCurrentAttacker] = useState<'player' | 'opponent'>('player');
  const [attackEffect, setAttackEffect] = useState<string | null>(null);
  const [battleEvents, setBattleEvents] = useState<string[]>([]);
  const [currentPlayerWeapon, setCurrentPlayerWeapon] = useState<any>(null);
  const [currentOpponentWeapon, setCurrentOpponentWeapon] = useState<any>(null);

  const isWinner = battleResult.is_winner;
  const playerName = profile?.nickname || profile?.steam_username || user?.user_metadata?.name || 'You';
  const opponentName = battleResult.is_bot_game ? 'House' : 'Opponent';
  const playerAvatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  
  // Get weapon info from battle result
  const playerWeapon = battleResult.battle_result?.creator_weapon;
  const opponentWeapon = battleResult.battle_result?.joiner_weapon;
  
  const getWeaponIcon = (weaponType: string) => {
    switch (weaponType) {
      case 'explosive': return Bomb;
      case 'melee': return Sword;
      case 'automatic':
      case 'sniper':
      default: return Target;
    }
  };
  
  const getWeaponAction = (weaponType: string) => {
    switch (weaponType) {
      case 'explosive': return 'throws an explosive';
      case 'melee': return 'slashes with sword';
      case 'automatic': return 'fires rapid shots';
      case 'sniper': return 'takes a precise shot';
      default: return 'attacks';
    }
  };

  // Get all available weapons for random selection (using actual database image URLs)
  const availableWeapons = [
    { name: "AK-47", weapon_type: "automatic", image_url: "/lovable-uploads/d6f5aad0-cb14-4b50-b871-4c8e05310fd9.png" },
    { name: "LR-300 Assault Rifle", weapon_type: "automatic", image_url: "/lovable-uploads/14b9ab66-99be-421e-9102-411f61d94a63.png" },
    { name: "Bolt Action Rifle", weapon_type: "sniper", image_url: "/lovable-uploads/eb981590-3c59-46fb-ac9a-8d02341e407d.png" },
    { name: "L96 Rifle", weapon_type: "sniper", image_url: "/lovable-uploads/9e4c07f9-70fd-40af-a63c-67e8d9f704b3.png" },
    { name: "M249 SAW", weapon_type: "sniper", image_url: "/lovable-uploads/ad44ab24-80b9-401e-8163-4e54cd7c735c.png" }
  ];

  const getRandomWeapon = () => {
    return availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
  };

  // Simulate battle sequence based on actual battle result
  useEffect(() => {
    if (animationPhase === 'battle') {
      const battleSequence = async () => {
        // Set initial weapons (from battle result)
        const playerWeaponFromResult = battleResult.battle_result?.creator_weapon;
        const opponentWeaponFromResult = battleResult.battle_result?.joiner_weapon;
        
        if (playerWeaponFromResult) {
          setCurrentPlayerWeapon(playerWeaponFromResult);
        }
        if (opponentWeaponFromResult) {
          setCurrentOpponentWeapon(opponentWeaponFromResult);
        }
        
        let currentPlayerHealth = 100;
        let currentOpponentHealth = 100;
        let turnCount = 0;
        
        // Continue battle until one player reaches 0 health
        while (currentPlayerHealth > 0 && currentOpponentHealth > 0) {
          const attacker = turnCount % 2 === 0 ? 'player' : 'opponent';
          const currentWeapon = attacker === 'player' ? playerWeaponFromResult : opponentWeaponFromResult;
          
          // Calculate realistic damage per turn (15-30 damage with weapon variation)
          let baseDamage = 15 + Math.floor(Math.random() * 16); // 15-30 base damage
          
          // Add weapon-specific damage modifiers
          if (currentWeapon?.weapon_type === 'sniper') {
            baseDamage += 5; // Snipers do more damage
          } else if (currentWeapon?.weapon_type === 'explosive') {
            baseDamage += 8; // Explosives do most damage
          } else if (currentWeapon?.weapon_type === 'automatic') {
            baseDamage += 2; // Automatics do slightly more
          }
          
          // Ensure the correct winner based on backend result
          // If this would be the killing blow, adjust to ensure correct winner
          const wouldKillOpponent = attacker === 'player' && currentOpponentHealth <= baseDamage;
          const wouldKillPlayer = attacker === 'opponent' && currentPlayerHealth <= baseDamage;
          
          // If this would determine the winner, check if it matches backend result
          if (wouldKillOpponent && !isWinner) {
            // Player would win but shouldn't - reduce damage to not kill
            baseDamage = Math.max(1, currentOpponentHealth - 1);
          } else if (wouldKillPlayer && isWinner) {
            // Player would lose but shouldn't - reduce damage to not kill
            baseDamage = Math.max(1, currentPlayerHealth - 1);
          }
          
          setCurrentAttacker(attacker);
          
          // Show attack effect
          setAttackEffect(attacker === 'player' ? 'player-attack' : 'opponent-attack');
          
          // Play weapon-specific sound
          if (currentWeapon?.weapon_type) {
            playWeaponSound(currentWeapon.weapon_type);
          }
          
          // Add battle event
          const weaponAction = getWeaponAction(currentWeapon?.weapon_type || 'rifle');
          setBattleEvents(prev => [...prev, `${attacker === 'player' ? playerName : opponentName} uses ${currentWeapon?.name || 'weapon'} and ${weaponAction} for ${baseDamage} damage!`]);
          
          // Apply damage
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              if (attacker === 'player') {
                currentOpponentHealth = Math.max(0, currentOpponentHealth - baseDamage);
                setOpponentHealth(currentOpponentHealth);
              } else {
                currentPlayerHealth = Math.max(0, currentPlayerHealth - baseDamage);
                setPlayerHealth(currentPlayerHealth);
              }
              setAttackEffect(null);
              resolve();
            }, 800);
          });
          
          turnCount++;
          
          // Break if someone reaches 0 health
          if (currentPlayerHealth <= 0 || currentOpponentHealth <= 0) {
            break;
          }
          
          // Wait between attacks
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Safety break to prevent infinite loops (max 20 turns)
          if (turnCount >= 20) {
            // Force the correct winner based on backend result
            if (isWinner) {
              currentOpponentHealth = 0;
              setOpponentHealth(0);
            } else {
              currentPlayerHealth = 0;
              setPlayerHealth(0);
            }
            break;
          }
        }
        
        // Transition to result phase
        setTimeout(() => {
          setAnimationPhase('result');
        }, 1000);
      };
      
      battleSequence();
    }
  }, [animationPhase, isWinner, playerName, opponentName, battleResult, playWeaponSound]);

  // Countdown effect
  useEffect(() => {
    if (animationPhase === 'countdown') {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setAnimationPhase('battle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [animationPhase]);

  if (pending) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-8">
            <h2 className="text-3xl font-bold text-foreground animate-pulse">Waiting for battle result...</h2>
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground">The battle is starting! Please wait for the result...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Countdown Phase */}
          {animationPhase === 'countdown' && (
            <div className="text-center space-y-8">
              <h2 className="text-3xl font-bold text-foreground">Get Ready!</h2>
              <div className="text-8xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
              <p className="text-muted-foreground">Battle starts in...</p>
            </div>
          )}

          {/* Battle Phase */}
          {animationPhase === 'battle' && (
            <div className="space-y-6">
              {/* Battle Arena */}
              <div className="relative">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10 rounded-lg"></div>
                
                  {/* Players */}
                <div className="flex items-center justify-between p-8 relative z-10">
                  {/* Player */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`relative transition-all duration-300 ${attackEffect === 'player-attack' ? 'scale-110' : ''}`}>
                      <Avatar className="h-24 w-24 border-4 border-blue-500 relative">
                        <AvatarImage src={playerAvatarUrl} />
                        <AvatarFallback className="text-2xl">
                          {playerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Weapon Display - positioned at bottom right of avatar */}
                      {currentPlayerWeapon?.image_url && (
                        <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 z-20">
                          <img 
                            src={currentPlayerWeapon.image_url} 
                            alt={currentPlayerWeapon.name}
                            className={`h-[100px] w-[100px] object-contain transform ${
                              currentPlayerWeapon.name === 'AK-47' ? 'rotate-[38deg]' :
                              currentPlayerWeapon.name === 'LR-300 Assault Rifle' ? 'rotate-[40deg]' :
                              currentPlayerWeapon.name === 'Bolt Action Rifle' ? 'rotate-[27deg]' :
                              currentPlayerWeapon.name === 'L96 Rifle' ? 'rotate-[37deg]' :
                              currentPlayerWeapon.name === 'M249 SAW' ? 'rotate-[39deg]' :
                              'rotate-[35deg]'
                            }`}
                          />
                          {/* Fire Effect at Weapon Muzzle */}
                          {attackEffect === 'player-attack' && (
                            <div className={`absolute ${
                              currentPlayerWeapon.name === 'AK-47' ? 'top-[32px] right-[-28px]' :
                              currentPlayerWeapon.name === 'LR-300 Assault Rifle' ? 'top-[28px] right-[-27px]' :
                              currentPlayerWeapon.name === 'Bolt Action Rifle' ? 'top-[27px] right-[-27px]' :
                              currentPlayerWeapon.name === 'L96 Rifle' ? 'top-[29px] right-[-25px]' :
                              currentPlayerWeapon.name === 'M249 SAW' ? 'top-[30px] right-[-27px]' :
                              'top-[27px] right-[-27px]'
                            }`}>
                              <img 
                                src={fireEffect} 
                                alt="Fire effect" 
                                className="h-6 w-6 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Weapon Icon (when not attacking) */}
                      <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-2">
                        {(() => {
                          const IconComponent = getWeaponIcon(playerWeapon?.weapon_type || 'rifle');
                          return <IconComponent className="h-4 w-4 text-white" />;
                        })()}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-bold text-foreground">{playerName}</p>
                      <div className="w-32 bg-gray-700 rounded-full h-3 mt-2">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${playerHealth}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{playerHealth}%</p>
                    </div>
                  </div>

                  {/* VS in center */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-4xl font-bold text-foreground animate-pulse">VS</div>
                    {currentAttacker && (
                      <Badge variant="secondary" className="animate-bounce">
                        {currentAttacker === 'player' ? `${playerName}'s turn` : `${opponentName}'s turn`}
                      </Badge>
                    )}
                  </div>

                  {/* Opponent */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`relative transition-all duration-300 ${attackEffect === 'opponent-attack' ? 'scale-110' : ''}`}>
                      <Avatar className="h-24 w-24 border-4 border-red-500 relative">
                        <AvatarFallback className="text-2xl">
                          {battleResult.is_bot_game ? 'H' : 'O'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Weapon Display - positioned at bottom left of avatar (mirrored) */}
                      {currentOpponentWeapon?.image_url && (
                        <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 z-20">
                          <img 
                            src={currentOpponentWeapon.image_url} 
                            alt={currentOpponentWeapon.name}
                            className={`h-[100px] w-[100px] object-contain transform scale-x-[-1] ${
                              currentOpponentWeapon.name === 'AK-47' ? '-rotate-[38deg]' :
                              currentOpponentWeapon.name === 'LR-300 Assault Rifle' ? '-rotate-[40deg]' :
                              currentOpponentWeapon.name === 'Bolt Action Rifle' ? '-rotate-[27deg]' :
                              currentOpponentWeapon.name === 'L96 Rifle' ? '-rotate-[37deg]' :
                              currentOpponentWeapon.name === 'M249 SAW' ? '-rotate-[39deg]' :
                              '-rotate-[35deg]'
                            }`}
                          />
                          {/* Fire Effect at Weapon Muzzle */}
                          {attackEffect === 'opponent-attack' && (
                            <div className={`absolute ${
                              currentOpponentWeapon.name === 'AK-47' ? 'top-[32px] left-[-28px]' :
                              currentOpponentWeapon.name === 'LR-300 Assault Rifle' ? 'top-[28px] left-[-28px]' :
                              currentOpponentWeapon.name === 'Bolt Action Rifle' ? 'top-[27px] left-[-27px]' :
                              currentOpponentWeapon.name === 'L96 Rifle' ? 'top-[29px] left-[-25px]' :
                              currentOpponentWeapon.name === 'M249 SAW' ? 'top-[30px] left-[-27px]' :
                              'top-[27px] left-[-27px]'
                            }`}>
                              <img 
                                src={fireEffect} 
                                alt="Fire effect" 
                                className="h-6 w-6 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Weapon Icon (when not attacking) */}
                      <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                        {(() => {
                          const IconComponent = getWeaponIcon(opponentWeapon?.weapon_type || 'rifle');
                          return <IconComponent className="h-4 w-4 text-white" />;
                        })()}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-bold text-foreground">{opponentName}</p>
                      <div className="w-32 bg-gray-700 rounded-full h-3 mt-2">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${opponentHealth}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{opponentHealth}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Battle Events Log */}
              <div className="bg-card/40 rounded-lg p-4 max-h-32 overflow-y-auto">
                <h4 className="text-sm font-semibold text-foreground mb-2">Battle Log</h4>
                {battleEvents.slice(-4).map((event, index) => (
                  <p key={index} className="text-xs text-muted-foreground mb-1">
                    {event}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Result Phase */}
          {animationPhase === 'result' && (
            <div className="space-y-8">
              {/* Winner Announcement */}
              <div className="text-center space-y-4">
                {isWinner ? (
                  <div className="space-y-2">
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                    <h2 className="text-3xl font-bold text-yellow-500">VICTORY!</h2>
                    <p className="text-foreground">You won the battle!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Skull className="h-16 w-16 text-red-500 mx-auto" />
                    <h2 className="text-3xl font-bold text-red-500">DEFEAT</h2>
                    <p className="text-foreground">
                      {battleResult.is_bot_game ? 'The house won this round' : 'Your opponent won the battle!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Battle Summary */}
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Battle Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Player Side */}
                  <div className={`p-4 rounded-lg border-2 ${isWinner ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    <div className="flex items-center gap-3 mb-3">
                       <Avatar className="h-10 w-10">
                         <AvatarImage src={playerAvatarUrl} />
                         <AvatarFallback>
                           {playerName.charAt(0).toUpperCase()}
                         </AvatarFallback>
                       </Avatar>
                        <div>
                          <p className="font-semibold">{playerName}</p>
                         <p className="text-sm text-muted-foreground">
                           {battleResult.battle_result?.creator_weapon?.name || 'Unknown Weapon'}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           Damage Dealt: {battleResult.battle_result?.creator_damage || 'N/A'}
                         </p>
                       </div>
                       {isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
                    </div>
                  </div>

                  {/* Opponent Side */}
                  <div className={`p-4 rounded-lg border-2 ${!isWinner ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {battleResult.is_bot_game ? 'B' : 'O'}
                        </AvatarFallback>
                      </Avatar>
                       <div>
                         <p className="font-semibold">
                           {battleResult.is_bot_game ? 'House' : 'Opponent'}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           {battleResult.battle_result?.joiner_weapon?.name || 'Unknown Weapon'}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           Damage Dealt: {battleResult.battle_result?.joiner_damage || 'N/A'}
                         </p>
                       </div>
                      {!isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
                    </div>
                  </div>
                </div>

                {/* Payout Info */}
                <div className="mt-6 p-4 bg-card/40 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Total Payout:</span>
                    <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                      <DollarSign className="h-4 w-4" />
                      {battleResult.total_payout?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  {isWinner && (
                    <p className="text-sm text-green-600 mt-1">
                      Added to your balance!
                    </p>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <div className="text-center">
                <Button onClick={onComplete} size="lg">
                  Continue Playing
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};