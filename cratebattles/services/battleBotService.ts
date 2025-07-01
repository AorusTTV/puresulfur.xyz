
export const callBotService = (battleData: any, setBattleData: (battle: any) => void) => {
  const playersJoined = battleData?.players?.length || 1;
  const botsNeeded = (battleData?.playerCount || 2) - playersJoined;
  const newPlayers = [...(battleData?.players || [])];
  
  for (let i = 0; i < botsNeeded; i++) {
    const botNames = ['RustBot Alpha', 'SteelBot Pro', 'MetalBot X', 'IronBot Elite', 'CopperBot Max', 'TitanBot Prime'];
    let team = null;
    
    // For team modes, assign bots to teams ensuring balance
    if (battleData?.teamMode === '2v2') {
      const team1Count = newPlayers.filter(p => p.team === 'team1').length;
      const team2Count = newPlayers.filter(p => p.team === 'team2').length;
      
      // Assign to the team with fewer players, preferring team1 if equal
      team = team1Count <= team2Count ? 'team1' : 'team2';
    } else if (battleData?.teamMode === '3v3') {
      const team1Count = newPlayers.filter(p => p.team === 'team1').length;
      const team2Count = newPlayers.filter(p => p.team === 'team2').length;
      
      // Assign to the team with fewer players, ensuring balanced 3v3 teams
      team = team1Count <= team2Count ? 'team1' : 'team2';
    }
    // For 1v1v1 mode, team remains null (no teams)
    
    newPlayers.push({
      id: `bot-${Date.now()}-${i}`,
      name: botNames[i % botNames.length],
      avatar: null,
      isYou: false,
      isBot: true,
      level: Math.floor(Math.random() * 50) + 1,
      experience: Math.floor(Math.random() * 10000),
      team
    });
  }
  
  const updatedBattle = {
    ...battleData,
    players: newPlayers,
    status: 'ready'
  };
  
  setBattleData(updatedBattle);
  
  return botsNeeded;
};
