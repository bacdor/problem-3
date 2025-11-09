/**
 * TypeScript types for database tables
 */

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type StepType =
  | 'referral_received'
  | 'appointment_scheduled'
  | 'tests_labs'
  | 'specialist_consultation'
  | 'follow_up_care';

export type RoadmapStatus = 'active' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface CareRoadmap {
  id: string;
  patient_id: string;
  title: string;
  status: RoadmapStatus;
  created_at: string;
  updated_at: string;
}

export interface CareStep {
  id: string;
  roadmap_id: string;
  step_type: StepType;
  title: string;
  description: string | null;
  status: StepStatus;
  scheduled_date: string | null; // ISO timestamp
  completed_date: string | null; // ISO timestamp
  due_date: string | null; // ISO timestamp
  prep_instructions: string | null;
  provider_name: string | null;
  provider_phone: string | null;
  provider_specialty: string | null;
  location_name: string | null;
  location_address: string | null;
  location_phone: string | null;
  clinic_approved: boolean | null;
  previous_data_received: boolean | null;
  appointment_confirmation_code: string | null;
  estimated_duration: number | null;
  notes: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  patient_id: string;
  role: 'user' | 'assistant';
  content: string;
  roadmap_id: string | null;
  step_id: string | null;
  created_at: string;
}

