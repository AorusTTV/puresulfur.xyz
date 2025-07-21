
// Simple Redis-like cache using Map for demo purposes
// In production, you'd use actual Redis
export const priceCache = new Map<string, { price: number; timestamp: number }>();
export const CACHE_TTL = 1900 * 1000; // 1900 seconds in milliseconds

export function getCachedPrice(itemName: string): { price: number; timestamp: number } | null {
  const cacheKey = `price:usd:${itemName}`;
  const cached = priceCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`[CACHE] HIT for ${itemName}: $${cached.price} (age: ${Math.floor((now - cached.timestamp) / 1000)}s)`);
    return cached;
  }
  
  if (cached) {
    console.log(`[CACHE] EXPIRED for ${itemName}: $${cached.price} (age: ${Math.floor((now - cached.timestamp) / 1000)}s > ${CACHE_TTL/1000}s)`);
  } else {
    console.log(`[CACHE] MISS for ${itemName}`);
  }
  
  return null;
}

export function setCachedPrice(itemName: string, price: number): void {
  const cacheKey = `price:usd:${itemName}`;
  const now = Date.now();
  priceCache.set(cacheKey, { price, timestamp: now });
  console.log(`[CACHE] SET ${cacheKey} = $${price}`);
}
