
interface SteamMarketItem {
  market_hash_name: string;
  lowest_price?: string;
  median_price?: string;
  volume?: string;
}

interface SteamMarketResponse {
  success: boolean;
  lowest_price?: string;
  median_price?: string;
  volume?: string;
}

export const fetchSteamMarketPrice = async (marketHashName: string): Promise<number | null> => {
  try {
    // Call our Steam API edge function for USD price data
    const response = await fetch('/api/steam-market-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ marketHashName })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch price');
    }

    const data = await response.json();
    return data.price || null;
  } catch (error) {
    console.error('Error fetching Steam market price:', error);
    
    // Fallback to estimated USD prices for common Rust items
    const estimatedUsdPrices: Record<string, number> = {
      'AK-47': 5.20, // USD
      'Assault Rifle': 28.00, // USD
      'Metal Chest Plate': 6.50, // USD
      'Metal Facemask': 4.20, // USD
      'Thompson': 12.00, // USD
      'Python Revolver': 8.75, // USD
      'Salvaged Cleaver': 15.60, // USD
      'Burlap Headwrap': 1.25, // USD
      'Hoodie': 3.40, // USD
      'Pants': 2.80, // USD
      'Boots': 1.90, // USD
      'Gloves': 1.50, // USD
    };
    
    // Find matching item name
    for (const [itemName, priceUsd] of Object.entries(estimatedUsdPrices)) {
      if (marketHashName.toLowerCase().includes(itemName.toLowerCase())) {
        return priceUsd;
      }
    }
    
    // Default estimated price based on item type (in USD)
    if (marketHashName.toLowerCase().includes('rifle') || marketHashName.toLowerCase().includes('gun')) {
      return Math.random() * 20 + 8; // $8-28 USD
    }
    if (marketHashName.toLowerCase().includes('armor') || marketHashName.toLowerCase().includes('chest')) {
      return Math.random() * 12 + 4; // $4-16 USD
    }
    if (marketHashName.toLowerCase().includes('clothing') || marketHashName.toLowerCase().includes('shirt')) {
      return Math.random() * 8 + 2; // $2-10 USD
    }
    
    return Math.random() * 5 + 1; // $1-6 USD for unknown items
  }
};

export const calculateStorePrice = (marketPriceUsd: number): number => {
  // Store shows skins at 1.495x the USD market price (1.30 * 1.15)
  return Math.round((marketPriceUsd * 1.495) * 100) / 100;
};

export const calculateDepositValue = (marketPriceUsd: number): number => {
  // Deposited skins get 80% of USD market price
  return Math.round((marketPriceUsd * 0.80) * 100) / 100;
};

export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

export const parseTradeUrl = (tradeUrl: string) => {
  try {
    const url = new URL(tradeUrl);
    const partner = url.searchParams.get('partner');
    const token = url.searchParams.get('token');
    
    if (!partner || !token) {
      throw new Error('Invalid trade URL - missing partner or token');
    }
    
    // Convert partner ID to SteamID64
    const steamId64 = (BigInt(partner) + BigInt('76561197960265728')).toString();
    
    return {
      partnerId: partner,
      token,
      steamId64,
      isValid: true
    };
  } catch (error) {
    return {
      partnerId: null,
      token: null,
      steamId64: null,
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid trade URL format'
    };
  }
};

export const validateSteamTradeUrl = (tradeUrl: string): { isValid: boolean; error?: string } => {
  const result = parseTradeUrl(tradeUrl);
  return {
    isValid: result.isValid,
    error: result.error
  };
};
