
import { supabase } from '@/integrations/supabase/client';
import { NameAnalysis } from './types';
import { generateHebrewPricingFixSQL } from './sqlGenerator';

export const runNameAnalysis = async (): Promise<NameAnalysis> => {
  console.log('[NAME-ANALYSIS] Starting COMPREHENSIVE Hebrew pricing fix analysis...');
  console.log('[NAME-ANALYSIS] Target: Fix ALL store prices to USD × 1.495 formula');

  // Get all bot items
  const { data: botItems, error } = await supabase
    .from('store_items')
    .select('id, name, is_bot_item, price')
    .eq('is_bot_item', true);

  if (error) throw error;

  console.log(`[NAME-ANALYSIS] Found ${botItems?.length || 0} bot items for pricing analysis`);

  // Analyze duplicates
  const nameCount: Record<string, { count: number; ids: string[] }> = {};
  botItems?.forEach(item => {
    if (!nameCount[item.name]) {
      nameCount[item.name] = { count: 0, ids: [] };
    }
    nameCount[item.name].count++;
    nameCount[item.name].ids.push(item.id);
  });

  const duplicates = Object.entries(nameCount)
    .filter(([name, data]) => data.count > 1)
    .map(([name, data]) => ({ name, count: data.count, ids: data.ids }))
    .sort((a, b) => b.count - a.count);

  console.log(`[NAME-ANALYSIS] Found ${duplicates.length} duplicate groups`);

  // Analyze other issues
  const whitespaceIssues = botItems?.filter(item => {
    const trimmed = item.name.trim();
    return item.name !== trimmed || item.name.length !== trimmed.length;
  }).map(item => ({
    id: item.id,
    name: item.name,
    trimmed: item.name.trim(),
    hasLeading: item.name !== item.name.trimStart(),
    hasTrailing: item.name !== item.name.trimEnd()
  })) || [];

  const specialCharRegex = /[™®©★☆♦♠♣♥]/g;
  const specialChars = botItems?.filter(item => specialCharRegex.test(item.name))
    .map(item => ({
      id: item.id,
      name: item.name,
      chars: [...new Set(item.name.match(specialCharRegex) || [])]
    })) || [];

  const encodingIssues = botItems?.filter(item => {
    const normalizedName = item.name.normalize('NFKC');
    const hasNonAscii = /[^\x00-\x7F]/.test(item.name);
    const hasEncodingIssue = normalizedName !== item.name || hasNonAscii;
    return hasEncodingIssue;
  }).map(item => ({
    id: item.id,
    name: item.name,
    normalizedName: item.name.normalize('NFKC'),
    hasIssue: true
  })) || [];

  const invisibleCharRegex = /[\u200B-\u200D\uFEFF\u00A0\u2060]/g;
  const invisibleChars = botItems?.filter(item => {
    const hasInvisible = invisibleCharRegex.test(item.name);
    return hasInvisible;
  }).map(item => ({
    id: item.id,
    name: item.name,
    cleanedName: item.name.replace(invisibleCharRegex, ''),
    hasInvisible: true
  })) || [];

  // Generate comprehensive cleanup SQL
  const cleanupSql = generateHebrewPricingFixSQL(duplicates, whitespaceIssues, specialChars, encodingIssues, invisibleChars, botItems || []);

  const detailedStats = {
    totalItems: botItems?.length || 0,
    itemsWithWhitespace: whitespaceIssues.length,
    itemsWithSpecialChars: specialChars.length,
    itemsWithEncodingIssues: encodingIssues.length,
    itemsWithInvisibleChars: invisibleChars.length,
    duplicateGroups: duplicates.length,
    totalDuplicateItems: duplicates.reduce((sum, dup) => sum + dup.count - 1, 0)
  };

  const analysisResult: NameAnalysis = {
    duplicates,
    whitespaceIssues,
    specialChars,
    encodingIssues,
    invisibleChars,
    totalBotItems: botItems?.length || 0,
    sampleNames: botItems?.slice(0, 15).map(item => item.name) || [],
    cleanupSqlGenerated: cleanupSql,
    detailedStats
  };

  console.log('[NAME-ANALYSIS] Hebrew pricing analysis complete:', analysisResult);
  return analysisResult;
};
