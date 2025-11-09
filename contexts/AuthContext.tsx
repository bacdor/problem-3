/**
 * Authentication Context for managing auth state across the app
 */

import * as authHelpers from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { AuthState, AuthUser, SignInData, SignUpData } from "@/types/auth";
import type { Profile } from "@/types/database";
import type { Session } from "@supabase/supabase-js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType extends AuthState {
  signIn: (data: SignInData) => Promise<{ error: any }>;
  signUp: (data: SignUpData) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user as AuthUser);
      const userProfile = await authHelpers.getProfile(session.user.id);
      setProfile(userProfile);
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await loadUser(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser]);

  const signIn = useCallback(async (data: SignInData) => {
    setLoading(true);
    const result = await authHelpers.signIn(data);
    if (result.user) {
      setUser(result.user);
      setProfile(result.profile);
    }
    setLoading(false);
    return { error: result.error };
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    setLoading(true);
    const result = await authHelpers.signUp(data);
    if (result.user) {
      setUser(result.user);
      setProfile(result.profile);
    }
    setLoading(false);
    return { error: result.error };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await authHelpers.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return await authHelpers.resetPassword(email);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await authHelpers.getProfile(user.id);
      setProfile(userProfile);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
