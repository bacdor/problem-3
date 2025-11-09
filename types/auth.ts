/**
 * Authentication-related types
 */

import type { User } from '@supabase/supabase-js';
import type { Profile } from './database';

export interface AuthUser extends User {}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

