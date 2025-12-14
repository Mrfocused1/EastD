"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseAuth, UserProfile, UserPreferences } from '@/lib/supabase-auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabaseAuth
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  }

  // Fetch user preferences
  async function fetchPreferences(userId: string) {
    try {
      const { data, error } = await supabaseAuth
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setPreferences(null);
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPreferences(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
          await fetchPreferences(session.user.id);
        } else {
          setProfile(null);
          setPreferences(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  async function signUp(email: string, password: string, fullName: string) {
    try {
      const { error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Sign in
  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Sign out
  async function signOut() {
    await supabaseAuth.auth.signOut();
    setUser(null);
    setProfile(null);
    setPreferences(null);
    setSession(null);
  }

  // Reset password
  async function resetPassword(email: string) {
    try {
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Update password
  async function updatePassword(newPassword: string) {
    try {
      const { error } = await supabaseAuth.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Update profile
  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabaseAuth
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (!error) {
        await fetchProfile(user.id);
      }
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Update preferences
  async function updatePreferences(updates: Partial<UserPreferences>) {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabaseAuth
        .from('user_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (!error) {
        await fetchPreferences(user.id);
      }
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Refresh profile
  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
      await fetchPreferences(user.id);
    }
  }

  const value = {
    user,
    profile,
    preferences,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updatePreferences,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
