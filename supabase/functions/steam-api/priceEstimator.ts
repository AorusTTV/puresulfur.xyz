
export function getEstimatedPrice(itemName: string | undefined): number {
  if (!itemName) return 0;
  
  // Simple price estimation based on item name patterns
  const lowerName = itemName.toLowerCase();
  
  if (lowerName.includes('ak-47') || lowerName.includes('m4a4') || lowerName.includes('awp')) {
    return Math.random() * 50 + 10; // $10-60
  }
  if (lowerName.includes('knife') || lowerName.includes('gloves')) {
    return Math.random() * 200 + 50; // $50-250
  }
  if (lowerName.includes('rare') || lowerName.includes('legendary')) {
    return Math.random() * 30 + 5; // $5-35
  }
  
  return Math.random() * 10 + 1; // $1-11 for common items
}
