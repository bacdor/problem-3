# Plan 01: Foundation & Authentication Setup

## Overview
Set up the foundational infrastructure including Supabase configuration, authentication system, database schema, and basic app navigation structure.

## Objectives
- Configure Supabase client and environment variables
- Implement email/password authentication flow
- Design and create database schema for care roadmap data
- Set up basic navigation structure for the healthcare app
- Create authentication screens (login, signup, password reset)

## Implementation Steps

### 1. Environment Configuration
**Files to create/modify:**
- Create `lib/supabase.ts` - Supabase client initialization
- Update `.env` structure (already exists, ensure proper variables)
- Create `lib/env.ts` - Environment variable validation helper

**Details:**
- Initialize Supabase client using `@supabase/supabase-js`
- Read `SUPABASE_URL` and `SUPABASE_ANON_KEY` from environment
- Export configured Supabase client for use across app
- Add TypeScript types for environment variables

### 2. Database Schema Design
**Supabase Tables to create:**

**`profiles` table:**
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `full_name` (text)
- `phone` (text, nullable)
- `date_of_birth` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**`care_roadmaps` table:**
- `id` (uuid, primary key)
- `patient_id` (uuid, references profiles.id)
- `title` (text) - e.g., "Cardiology Referral Journey"
- `status` (text) - "active", "completed", "cancelled"
- `created_at` (timestamp)
- `updated_at` (timestamp)

**`care_steps` table:**
- `id` (uuid, primary key)
- `roadmap_id` (uuid, references care_roadmaps.id, on delete cascade)
- `step_type` (text) - "referral_received", "appointment_scheduled", "tests_labs", "specialist_consultation", "follow_up_care"
- `title` (text) - e.g., "Blood Test - Complete"
- `description` (text, nullable)
- `status` (text) - "pending", "in_progress", "completed", "overdue"
- `scheduled_date` (timestamp, nullable)
- `completed_date` (timestamp, nullable)
- `due_date` (timestamp, nullable)
- `prep_instructions` (text, nullable) - e.g., "Fast for 12 hours before test"
- `provider_name` (text, nullable)
- `provider_phone` (text, nullable)
- `order` (integer) - for sorting steps in timeline
- `created_at` (timestamp)
- `updated_at` (timestamp)

**`chat_messages` table:**
- `id` (uuid, primary key)
- `patient_id` (uuid, references profiles.id)
- `role` (text) - "user" or "assistant"
- `content` (text)
- `roadmap_id` (uuid, nullable, references care_roadmaps.id)
- `step_id` (uuid, nullable, references care_steps.id)
- `created_at` (timestamp)

**Database Setup:**
- Create SQL migration file: `supabase/migrations/001_initial_schema.sql`
- Set up Row Level Security (RLS) policies:
  - Users can only read/write their own profiles
  - Users can only access their own care roadmaps and steps
  - Users can only access their own chat messages
- Enable real-time subscriptions for care_steps updates

### 3. Authentication Implementation
**Files to create:**
- `app/(auth)/login.tsx` - Login screen
- `app/(auth)/signup.tsx` - Signup screen
- `app/(auth)/forgot-password.tsx` - Password reset screen
- `app/(auth)/_layout.tsx` - Auth layout wrapper
- `lib/auth.ts` - Authentication helper functions
- `contexts/AuthContext.tsx` - Auth state management

**Authentication Flow:**
- Login: Email + password → Supabase Auth → Create/update profile → Navigate to app
- Signup: Email + password + name → Supabase Auth → Create profile → Navigate to app
- Password Reset: Email → Supabase reset link → Update password
- Session Management: Check auth state on app start, persist session
- Protected Routes: Redirect to login if not authenticated

**AuthContext Features:**
- `user` - Current authenticated user
- `profile` - User profile data
- `loading` - Auth state loading indicator
- `signIn(email, password)` - Login function
- `signUp(email, password, name)` - Signup function
- `signOut()` - Logout function
- `resetPassword(email)` - Password reset function

### 4. Navigation Structure
**Files to modify:**
- `app/_layout.tsx` - Add AuthContext provider, handle auth state routing
- `app/(tabs)/_layout.tsx` - Update tabs for healthcare app

**New Tab Structure:**
- Home tab → Care Roadmap (main feature)
- Chat tab → AI Guidance (main feature)
- Profile tab → User settings and profile

**Files to create:**
- `app/(tabs)/roadmap.tsx` - Placeholder for roadmap (will be implemented in Plan 02)
- `app/(tabs)/chat.tsx` - Placeholder for chat (will be implemented in Plan 03)
- `app/(tabs)/profile.tsx` - User profile screen

### 5. Type Definitions
**File to create:**
- `types/database.ts` - TypeScript types for database tables
- `types/auth.ts` - Auth-related types

**Types needed:**
- `Profile` - User profile type
- `CareRoadmap` - Roadmap type
- `CareStep` - Step type with status enum
- `ChatMessage` - Chat message type
- `StepStatus` - "pending" | "in_progress" | "completed" | "overdue"
- `StepType` - Step type enum

### 6. Seeding Data (Initial)
**File to create:**
- `supabase/seed.sql` - Initial seed data for testing

**Seed Data:**
- Create 1-2 sample care roadmaps
- Create 5-8 care steps across different statuses
- Include variety: completed, pending, overdue, in-progress steps
- Add realistic dates, provider info, prep instructions

## Dependencies to Install
```bash
npm install @supabase/supabase-js  # Already installed
npm install @react-native-async-storage/async-storage  # For session persistence
npm install expo-secure-store  # For secure credential storage
```

## Testing Checklist
- [ ] Supabase client initializes correctly
- [ ] User can sign up with email/password
- [ ] User can log in with credentials
- [ ] User can reset password
- [ ] Session persists across app restarts
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Profile is created/updated on signup/login
- [ ] Database tables are created with correct schema
- [ ] RLS policies prevent unauthorized access
- [ ] Seed data loads correctly

## Next Steps
After completing this plan, proceed to **PLAN-02-ROADMAP.md** to implement the Personalized Care Roadmap feature.

