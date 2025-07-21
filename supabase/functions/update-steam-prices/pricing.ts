
export function calculateFallbackPrice(itemName: string): number {
  // Fallback pricing when RustSkins API is unavailable (in USD)
  // Based on common Rust/CS:GO item categories
  const lowerName = itemName.toLowerCase();
  
  console.log(`[RUSTSKINS] Applying fallback pricing in USD for ${itemName}`);
  
  if (lowerName.includes('knife') || lowerName.includes('karambit') || lowerName.includes('bayonet')) {
    const basePrice = Math.random() * 300 + 100; // $100-400 USD
    const final = Number((basePrice * 1.495).toFixed(2));
    console.log(`[RUSTSKINS] Fallback knife: $${basePrice.toFixed(2)} USD → final $${final}`);
    return final;
  }
  if (lowerName.includes('ak-47') || lowerName.includes('awp') || lowerName.includes('m4a4')) {
    const basePrice = Math.random() * 50 + 25; // $25-75 USD
    const final = Number((basePrice * 1.495).toFixed(2));
    console.log(`[RUSTSKINS] Fallback rifle: $${basePrice.toFixed(2)} USD → final $${final}`);
    return final;
  }
  if (lowerName.includes('glock') || lowerName.includes('usp') || lowerName.includes('p250')) {
    const basePrice = Math.random() * 25 + 5; // $5-30 USD
    const final = Number((basePrice * 1.495).toFixed(2));
    console.log(`[RUSTSKINS] Fallback pistol: $${basePrice.toFixed(2)} USD → final $${final}`);
    return final;
  }
  
  // Default fallback in USD
  const basePrice = Math.random() * 15 + 2; // $2-17 USD
  const final = Number((basePrice * 1.495).toFixed(2));
  console.log(`[RUSTSKINS] Fallback default: $${basePrice.toFixed(2)} USD → final $${final}`);
  return final;
}

export function applyPricingFormula(rustSkinsUsdPrice: number): number {
  // Apply new pricing formula: USD price × 1.495
  // RustSkins.net already provides USD prices, so no currency conversion needed
  const final = Number((rustSkinsUsdPrice * 1.495).toFixed(2));
  
  console.log(`[RUSTSKINS] New pricing formula applied: $${rustSkinsUsdPrice} USD × 1.495 = $${final}`);
  console.log(`[RUSTSKINS] Source: RustSkins.net (USD prices, no conversion needed)`);
  
  return final;
}
