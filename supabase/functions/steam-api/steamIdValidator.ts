
export function validateSteamId(steamId: string): { isValid: boolean; error?: string } {
  if (!steamId || !/^\d{17}$/.test(steamId)) {
    return {
      isValid: false,
      error: 'Invalid Steam ID format. Expected 17-digit Steam ID64.'
    };
  }
  
  return { isValid: true };
}
