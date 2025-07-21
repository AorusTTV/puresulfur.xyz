
import { supabase } from '@/integrations/supabase/client';
import { User } from './userManagementTypes';

export const fetchUsers = async (): Promise<User[]> => {
  console.log('[USER-MGMT] Fetching users for admin panel...');
  
  // Fetch all profiles using the new RLS policies
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[USER-MGMT] Error fetching users:', error);
    throw error;
  }

  console.log('[USER-MGMT] Successfully fetched users:', data?.length);
  return data || [];
};
