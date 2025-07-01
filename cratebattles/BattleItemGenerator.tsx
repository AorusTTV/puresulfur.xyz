import { CrateItem } from './types';

// Server-side weighted selection remains unchanged
export const selectWinningItem = (items: any[]): CrateItem => { /* ... unchanged ... */ };

export const generateFinalItems = (battleData: any): { [playerId: string]: CrateItem } => { /* ... unchanged ... */ };

/* -------------------------------------------------------------
   Winner logic rewritten: highest TOTAL value wins (handles ties)
------------------------------------------------------------- */
export const determineWinner = (
  finalItems: { [playerId: string]: CrateItem },
  battleData: any
): string => {
  const gameMode = battleData?.gameMode || 'default';
  // team‑mode always handled in one place below
  const isTeamMode = battleData?.teamMode === '2v2' || battleData?.teamMode === '3v3';

  if (isTeamMode) return determineTeamWinner(finalItems, battleData, gameMode);

  switch (gameMode) {
    case 'unlucky':
      return determineLowestValueWinner(finalItems);     // lowest single value wins
    case 'jackpot':
      return determineJackpotWinner(finalItems, battleData); // probability based
    case 'puresulfur':
      return determinePureSulfurWinner(finalItems, battleData);
    default:               // 'default' | 'terminal' or unknown
      return determineHighestValueWinner(finalItems);    // highest single value wins
  }
};

/* ---------------- TEAM WINNER (2v2 / 3v3) ------------------- */
const determineTeamWinner = (
  finalItems: { [playerId: string]: CrateItem },
  battleData: any,
  gameMode: string
): string => {
  // 1. accumulate totals per team
  const teamTotals: Record<'team1' | 'team2', { total: number; players: string[] }> = {
    team1: { total: 0, players: [] },
    team2: { total: 0, players: [] },
  };
  battleData.players.forEach((p: any) => {
    const item = finalItems[p.id];
    if (!item) return;
    let value = item.value;
    if (gameMode === 'puresulfur' && item.name.toLowerCase().includes('sulfur')) value *= 1.5;
    teamTotals[p.team].total += value;
    teamTotals[p.team].players.push(p.id);
  });
  // 2. decide winning team (lowest for unlucky, else highest)
  const winningTeamKey =
    gameMode === 'unlucky'
      ? teamTotals.team1.total <= teamTotals.team2.total
        ? 'team1'
        : 'team2'
      : teamTotals.team1.total >= teamTotals.team2.total
      ? 'team1'
      : 'team2';
  // 3. within winning team, pick player whose item value is highest (not random)
  const winningPlayers = teamTotals[winningTeamKey].players;
  let topPlayer = winningPlayers[0];
  winningPlayers.forEach((pid) => {
    if (finalItems[pid].value > finalItems[topPlayer].value) topPlayer = pid;
  });
  return topPlayer;
};

/* ------------- single‑player winner helpers ----------------- */
const determineHighestValueWinner = (finalItems: { [playerId: string]: CrateItem }): string => {
  return Object.entries(finalItems).reduce((best, [pid, item]) =>
    item.value > (finalItems[best]?.value ?? -Infinity) ? pid : best,
  Object.keys(finalItems)[0]);
};

const determineLowestValueWinner = (finalItems: { [playerId: string]: CrateItem }): string => {
  return Object.entries(finalItems).reduce((best, [pid, item]) =>
    item.value < (finalItems[best]?.value ?? Infinity) ? pid : best,
  Object.keys(finalItems)[0]);
};

const determineJackpotWinner = (finalItems: { [playerId: string]: CrateItem }, battleData: any): string => {
  const entries = Object.entries(finalItems);
  const total = entries.reduce((s, [, i]) => s + i.value, 0) || 1;
  let threshold = Math.random() * total;
  for (const [pid, item] of entries) {
    threshold -= item.value;
    if (threshold <= 0) return pid;
  }
  return entries[0][0];
};

const determinePureSulfurWinner = (finalItems: { [playerId: string]: CrateItem }, battleData: any): string => {
  return Object.entries(finalItems).reduce((best, [pid, item]) => {
    let val = item.value;
    if (item.name.toLowerCase().includes('sulfur')) val *= 1.5;
    const bestVal = finalItems[best]?.name.toLowerCase().includes('sulfur')
      ? finalItems[best].value * 1.5
      : finalItems[best]?.value ?? 0;
    return val > bestVal ? pid : best;
  }, Object.keys(finalItems)[0]);
};
