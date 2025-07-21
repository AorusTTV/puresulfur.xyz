
import { supabase } from '@/integrations/supabase/client';

interface AvatarDebugTestResult {
  test_name: string;
  test_result: string;
  avatar_count: number;
}

// Define the custom RPC function types that aren't in the auto-generated types
interface CustomRpcFunctions {
  test_leaderboard_avatar_urls: {
    Args: Record<string, never>;
    Returns: AvatarDebugTestResult[];
  };
}

// Create a typed wrapper for RPC calls
export const typedRpc = {
  test_leaderboard_avatar_urls: async () => {
    const { data, error } = await supabase.rpc('test_leaderboard_avatar_urls' as any);
    
    if (error) {
      throw error;
    }
    
    // Type assertion here is safe because we know the function signature
    return data as unknown as AvatarDebugTestResult[];
  }
};

// Export the type for use elsewhere if needed
export type CustomRpcFunction = keyof CustomRpcFunctions;
