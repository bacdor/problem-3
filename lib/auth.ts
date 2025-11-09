/**
 * Authentication helper functions
 */

import { supabase } from './supabase';
import type { SignInData, SignUpData } from '@/types/auth';
import type { Profile } from '@/types/database';

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn({ email, password }: SignInData): Promise<{
  user: any;
  profile: Profile | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, profile: null, error: { message: error.message, code: error.name } };
    }

    // Fetch user profile
    const profile = await getProfile(data.user.id);

    return { user: data.user, profile, error: null };
  } catch (error: any) {
    return {
      user: null,
      profile: null,
      error: { message: error.message || 'An unexpected error occurred' },
    };
  }
}

/**
 * Sign up with email, password, and name
 */
export async function signUp({ email, password, full_name }: SignUpData): Promise<{
  user: any;
  profile: Profile | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) {
      return { user: null, profile: null, error: { message: error.message, code: error.name } };
    }

    // Profile should be created automatically by trigger, but fetch it
    const profile = await getProfile(data.user?.id || '');

    return { user: data.user, profile, error: null };
  } catch (error: any) {
    return {
      user: null,
      profile: null,
      error: { message: error.message || 'An unexpected error occurred' },
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message, code: error.name } };
    }
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message || 'An unexpected error occurred' } };
  }
}

/**
 * Reset password - sends reset email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_APP_URL || 'exp://localhost:8081'}/reset-password`,
    });

    if (error) {
      return { error: { message: error.message, code: error.name } };
    }
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message || 'An unexpected error occurred' } };
  }
}

/**
 * Get user profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ profile: Profile | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { profile: null, error: { message: error.message, code: error.code } };
    }

    return { profile: data as Profile, error: null };
  } catch (error: any) {
    return { profile: null, error: { message: error.message || 'An unexpected error occurred' } };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

