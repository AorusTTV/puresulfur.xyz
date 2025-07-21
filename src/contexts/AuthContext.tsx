
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedProfile } from '@/types/affiliate';
import { useAffiliateCodeFromUrl } from '@/hooks/useAffiliateCodeFromUrl';
import { useAffiliateCodeApplication } from '@/hooks/useAffiliateCodeApplication';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ExtendedProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get affiliate code from URL
  const { affiliateCode } = useAffiliateCodeFromUrl();
  
  // Get affiliate code application hook
  const { applyAffiliateCode } = useAffiliateCodeApplication();

  // Apply affiliate code automatically when user logs in and has no affiliate code used
  useEffect(() => {
    if (user && profile && affiliateCode && !profile.affiliate_code_used) {
      applyAffiliateCode(user.id, affiliateCode);
    }
  }, [user, profile, affiliateCode, applyAffiliateCode]);

  const refreshProfile = async () => {
    if (!user) {
      console.log('[AUTH-CONTEXT] No user, clearing profile');
      setProfile(null);
      return;
    }

    try {
      console.log('[AUTH-CONTEXT] Refreshing profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*, referred_by')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[AUTH-CONTEXT] Error fetching profile:', error);
        return;
      }

      console.log('[AUTH-CONTEXT] Profile refreshed successfully:', {
        id: data.id,
        steam_trade_url: data.steam_trade_url,
        api_key: data.api_key ? 'SET' : 'NOT_SET'
      });

      setProfile(data);
    } catch (error) {
      console.error('[AUTH-CONTEXT] Exception in refreshProfile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH-CONTEXT] Initial session:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH-CONTEXT] Auth state change:', event, session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
        refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const signOut = async () => {
    console.log('[AUTH-CONTEXT] Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
