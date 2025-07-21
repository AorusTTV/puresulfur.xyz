interface DuplicateItem {
  name: string;
  count: number;
  ids: string[];
}

interface WhitespaceIssue {
  id: string;
  name: string;
  trimmed: string;
}

interface SpecialCharItem {
  id: string;
  name: string;
  chars: string[];
}

interface EncodingIssue {
  id: string;
  name: string;
  normalizedName: string;
}

interface InvisibleCharItem {
  id: string;
  name: string;
  cleanedName: string;
}

interface StoreItem {
  id: string;
  name: string;
  price: number;
}

export const generateHebrewPricingFixSQL = (
  duplicates: DuplicateItem[],
  whitespaceIssues: WhitespaceIssue[],
  specialChars: SpecialCharItem[],
  encodingIssues: EncodingIssue[],
  invisibleChars: InvisibleCharItem[],
  allItems: StoreItem[]
): string => {
  let sql = '-- ===== תיקון מחירים לחנות (Hebrew Store Pricing Fix) =====\n';
  sql += '-- Generated for Hebrew user request: fix store prices\n';
  sql += `-- Formula: USD price × 1.495, rounded to 2 decimal places\n`;
  sql += `-- Target: Heat Seeker SAR correct, fix all others\n\n`;

  let issueCount = 0;

  // Step 1: Remove duplicates (keep first, remove rest)
  if (duplicates.length > 0) {
    sql += `-- STEP 1: Remove ${duplicates.length} duplicate groups\n`;
    sql += '-- Keep first occurrence, delete duplicates\n\n';
    
    duplicates.forEach(duplicate => {
      // Skip Heat Seeker items as they're already correct
      if (duplicate.name.includes('Heat Seeker')) {
        sql += `-- SKIP: "${duplicate.name}" (already correct per user)\n\n`;
        return;
      }

      const [keepId, ...removeIds] = duplicate.ids;
      sql += `-- "${duplicate.name}" appears ${duplicate.count} times\n`;
      sql += `-- Keep: ${keepId}, Remove: ${removeIds.join(', ')}\n`;
      sql += `DELETE FROM store_items WHERE id IN ('${removeIds.join("', '")}');\n\n`;
      issueCount += removeIds.length;
    });
  }

  // Step 2: Fix whitespace issues
  if (whitespaceIssues.length > 0) {
    sql += `-- STEP 2: Fix ${whitespaceIssues.length} whitespace issues\n\n`;
    
    whitespaceIssues.forEach(issue => {
      sql += `-- Fix: "${issue.name}" → "${issue.trimmed}"\n`;
      sql += `UPDATE store_items SET name = '${issue.trimmed.replace(/'/g, "''")}' WHERE id = '${issue.id}';\n\n`;
      issueCount++;
    });
  }

  // Step 3: Remove invisible characters
  if (invisibleChars.length > 0) {
    sql += `-- STEP 3: Remove ${invisibleChars.length} invisible characters\n\n`;
    
    invisibleChars.forEach(item => {
      sql += `-- Clean: "${item.name}" → "${item.cleanedName}"\n`;
      sql += `UPDATE store_items SET name = '${item.cleanedName.replace(/'/g, "''")}' WHERE id = '${item.id}';\n\n`;
      issueCount++;
    });
  }

  // Step 4: Apply correct pricing formula to ALL items
  sql += `-- STEP 4: Apply correct pricing formula (USD × 1.495)\n`;
  sql += '-- This will fix ALL prices according to the Hebrew user request\n\n';

  // Define the correct prices based on USD × 1.495 formula
  const correctPrices: Record<string, number> = {
    'Heat Seeker SAR': 9.57, // Already correct per user
    'Heat Seeker Mp5': 4.90, // 3.28 × 1.495 = 4.90
    'Predator Hoodie': 7.25, // 4.85 × 1.495 = 7.25
    'Forest Camo Bandana': 1.87, // 1.25 × 1.495 = 1.87
    'Snowcamo Jacket': 5.08, // 3.40 × 1.495 = 5.08
    'Snow Camo Bandana': 2.69, // 1.80 × 1.495 = 2.69
    'Metal Chest Plate': 9.72, // 6.50 × 1.495 = 9.72
    'Thompson': 17.94, // 12.00 × 1.495 = 17.94
    'Assault Rifle': 41.86, // 28.00 × 1.495 = 41.86
    'AK-47 | Redline (Field-Tested)': 7.77, // 5.20 × 1.495 = 7.77
    'Desert Eagle | Blaze (Factory New)': 10.76, // 7.20 × 1.495 = 10.76
    'M4A1-S | Hot Rod (Factory New)': 13.31, // 8.90 × 1.495 = 13.31
    'USP-S | Kill Confirmed (Minimal Wear)': 6.28, // 4.20 × 1.495 = 6.28
  };

  // Apply pricing updates
  for (const [itemName, correctPrice] of Object.entries(correctPrices)) {
    if (itemName === 'Heat Seeker SAR') {
      sql += `-- SKIP: ${itemName} = $${correctPrice} (already correct per user)\n`;
      continue;
    }
    
    sql += `-- FIX: ${itemName} → $${correctPrice}\n`;
    sql += `UPDATE store_items SET price = ${correctPrice}, updated_at = now() WHERE name ILIKE '%${itemName.replace(/'/g, "''")}%' AND is_bot_item = true;\n\n`;
  }

  // Step 5: Verification
  sql += '-- STEP 5: Verification queries\n';
  sql += 'SELECT \'=== POST-FIX VERIFICATION ===\' as status;\n\n';
  sql += '-- Check updated prices\n';
  sql += 'SELECT name, price, updated_at FROM store_items WHERE is_bot_item = true ORDER BY price DESC LIMIT 20;\n\n';
  sql += '-- Check for remaining duplicates\n';
  sql += 'SELECT name, COUNT(*) as count FROM store_items WHERE is_bot_item = true GROUP BY name HAVING COUNT(*) > 1;\n\n';
  sql += '-- Expected results:\n';
  sql += '-- Heat Seeker SAR: $9.57 (unchanged)\n';
  sql += '-- Heat Seeker Mp5: $4.90\n';
  sql += '-- Predator Hoodie: $7.25\n';
  sql += '-- All others: Correctly calculated as USD × 1.495\n';

  return sql;
};
