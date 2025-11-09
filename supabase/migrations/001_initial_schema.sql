-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create care_roadmaps table
CREATE TABLE care_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create care_steps table
CREATE TABLE care_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID NOT NULL REFERENCES care_roadmaps(id) ON DELETE CASCADE,
  step_type TEXT NOT NULL CHECK (step_type IN ('referral_received', 'appointment_scheduled', 'tests_labs', 'specialist_consultation', 'follow_up_care')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  prep_instructions TEXT,
  provider_name TEXT,
  provider_phone TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  roadmap_id UUID REFERENCES care_roadmaps(id) ON DELETE SET NULL,
  step_id UUID REFERENCES care_steps(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_care_roadmaps_patient_id ON care_roadmaps(patient_id);
CREATE INDEX idx_care_steps_roadmap_id ON care_steps(roadmap_id);
CREATE INDEX idx_care_steps_status ON care_steps(status);
CREATE INDEX idx_chat_messages_patient_id ON chat_messages(patient_id);
CREATE INDEX idx_chat_messages_roadmap_id ON chat_messages(roadmap_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for care_roadmaps
CREATE POLICY "Users can view own roadmaps"
  ON care_roadmaps FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can create own roadmaps"
  ON care_roadmaps FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own roadmaps"
  ON care_roadmaps FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can delete own roadmaps"
  ON care_roadmaps FOR DELETE
  USING (auth.uid() = patient_id);

-- RLS Policies for care_steps
CREATE POLICY "Users can view own care steps"
  ON care_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM care_roadmaps
      WHERE care_roadmaps.id = care_steps.roadmap_id
      AND care_roadmaps.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own care steps"
  ON care_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_roadmaps
      WHERE care_roadmaps.id = care_steps.roadmap_id
      AND care_roadmaps.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own care steps"
  ON care_steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM care_roadmaps
      WHERE care_roadmaps.id = care_steps.roadmap_id
      AND care_roadmaps.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own care steps"
  ON care_steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM care_roadmaps
      WHERE care_roadmaps.id = care_steps.roadmap_id
      AND care_roadmaps.patient_id = auth.uid()
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can create own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE
  USING (auth.uid() = patient_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_care_roadmaps_updated_at
  BEFORE UPDATE ON care_roadmaps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_care_steps_updated_at
  BEFORE UPDATE ON care_steps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable real-time for care_steps (optional, for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE care_steps;

