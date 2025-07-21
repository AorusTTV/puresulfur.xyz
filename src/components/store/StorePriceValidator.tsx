
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';

interface PriceValidationResult {
  isValid: boolean;
  issues: string[];
  stats: {
    totalItems: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    highValueItems: number;
  };
}

interface StorePriceValidatorProps {
  items: any[];
}

export const StorePriceValidator: React.FC<StorePriceValidatorProps> = ({ items }) => {
  const [validation, setValidation] = useState<PriceValidationResult | null>(null);

  useEffect(() => {
    if (!items || items.length === 0) return;

    console.log('[PRICE-VALIDATOR] Validating store prices...');
    
    const issues: string[] = [];
    const prices = items.map(item => item.price).filter(price => typeof price === 'number');
    
    if (prices.length === 0) {
      issues.push('No valid prices found');
      setValidation({
        isValid: false,
        issues,
        stats: { totalItems: 0, averagePrice: 0, priceRange: { min: 0, max: 0 }, highValueItems: 0 }
      });
      return;
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const highValueItems = prices.filter(price => price > 100).length;

    // Validation rules
    if (minPrice < 0.10) {
      issues.push(`Items with very low prices detected (min: $${minPrice.toFixed(2)})`);
    }
    
    if (maxPrice > 1000) {
      issues.push(`Items with extremely high prices detected (max: $${maxPrice.toFixed(2)})`);
    }

    // Check for suspicious price patterns
    const zeroPriceItems = prices.filter(price => price === 0).length;
    if (zeroPriceItems > 0) {
      issues.push(`${zeroPriceItems} items with zero price found`);
    }

    // Check for duplicates with different prices
    const itemsByName = new Map<string, number[]>();
    items.forEach(item => {
      const cleanName = item.name?.trim();
      if (cleanName) {
        if (!itemsByName.has(cleanName)) {
          itemsByName.set(cleanName, []);
        }
        itemsByName.get(cleanName)!.push(item.price);
      }
    });

    let duplicatesWithDifferentPrices = 0;
    itemsByName.forEach((prices, name) => {
      if (prices.length > 1) {
        const uniquePrices = new Set(prices);
        if (uniquePrices.size > 1) {
          duplicatesWithDifferentPrices++;
        }
      }
    });

    if (duplicatesWithDifferentPrices > 0) {
      issues.push(`${duplicatesWithDifferentPrices} items have inconsistent pricing across duplicates`);
    }

    setValidation({
      isValid: issues.length === 0,
      issues,
      stats: {
        totalItems: items.length,
        averagePrice,
        priceRange: { min: minPrice, max: maxPrice },
        highValueItems
      }
    });

    console.log('[PRICE-VALIDATOR] Validation complete:', {
      isValid: issues.length === 0,
      issuesFound: issues.length,
      priceStats: { minPrice, maxPrice, averagePrice, highValueItems }
    });
  }, [items]);

  if (!validation) {
    return null;
  }

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="font-medium">
              Store Price Validation {validation.isValid ? 'Passed' : 'Issues Found'}
            </span>
          </div>
          
          <Badge variant={validation.isValid ? "default" : "secondary"}>
            {validation.stats.totalItems} items
          </Badge>
        </div>

        {validation.issues.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="text-sm text-yellow-600">
              <p className="font-medium mb-2">Issues detected:</p>
              <ul className="space-y-1">
                {validation.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-muted-foreground">Avg Price</p>
              <p className="font-medium">${validation.stats.averagePrice.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-muted-foreground">Price Range</p>
              <p className="font-medium">
                ${validation.stats.priceRange.min.toFixed(2)} - ${validation.stats.priceRange.max.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              {validation.stats.highValueItems}
            </Badge>
            <div>
              <p className="text-muted-foreground">High Value</p>
              <p className="font-medium">Items {'>'}$100</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{validation.isValid ? 'Valid' : 'Needs Review'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
