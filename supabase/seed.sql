-- Seed data for testing
-- Note: This assumes you have at least one user created in auth.users
-- Replace 'USER_ID_HERE' with an actual user ID after creating a test user

-- Example: Get the first user ID (you'll need to replace this with actual user creation)
-- For testing, create a user first, then run this seed script

-- Insert sample care roadmap (Cardiology Referral Journey)
-- Replace 'USER_ID_HERE' with actual user ID
INSERT INTO care_roadmaps (patient_id, title, status, created_at, updated_at)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'Cardiology Referral Journey',
  'active',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
)
ON CONFLICT DO NOTHING;

-- Get the roadmap ID (you'll need to adjust this based on your setup)
-- For now, we'll use a placeholder. In practice, you'd query for the roadmap_id
-- after inserting the roadmap above.

-- Insert care steps for Cardiology Referral Journey
-- Step 1: Referral Received (Completed)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'referral_received',
  'Cardiology Referral Received',
  'Your primary care physician has referred you to a cardiologist for further evaluation.',
  'completed',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '6 days',
  NULL,
  'Dr. Sarah Johnson',
  '555-0101',
  1,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
FROM care_roadmaps cr
WHERE cr.title = 'Cardiology Referral Journey'
LIMIT 1;

-- Step 2: Blood Test (Completed)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'tests_labs',
  'Complete Blood Test Panel',
  'Comprehensive blood work including cholesterol, triglycerides, and cardiac markers.',
  'completed',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days',
  'Fast for 12 hours before the test. Only water is allowed. No food or drinks after 8 PM the night before.',
  'LabCorp',
  '555-0102',
  2,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '5 days'
FROM care_roadmaps cr
WHERE cr.title = 'Cardiology Referral Journey'
LIMIT 1;

-- Step 3: Cardiologist Appointment (In Progress - Upcoming)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'specialist_consultation',
  'Cardiologist Consultation',
  'Initial consultation with cardiologist to review test results and discuss treatment options.',
  'in_progress',
  NOW() + INTERVAL '2 days',
  NULL,
  NOW() + INTERVAL '2 days',
  'Bring your insurance card, list of current medications, and any previous test results. Arrive 15 minutes early.',
  'Dr. Michael Chen',
  '555-0103',
  3,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '1 day'
FROM care_roadmaps cr
WHERE cr.title = 'Cardiology Referral Journey'
LIMIT 1;

-- Step 4: EKG Test (Pending - Upcoming)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'tests_labs',
  'Electrocardiogram (EKG)',
  'Non-invasive test to check your heart rhythm and electrical activity.',
  'pending',
  NOW() + INTERVAL '5 days',
  NULL,
  NOW() + INTERVAL '5 days',
  'No special preparation needed. Avoid caffeine 2 hours before the test.',
  'Cardiology Clinic',
  '555-0104',
  4,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
FROM care_roadmaps cr
WHERE cr.title = 'Cardiology Referral Journey'
LIMIT 1;

-- Step 5: Follow-up Appointment (Pending)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'follow_up_care',
  'Follow-up with Primary Care Physician',
  'Review cardiologist findings and discuss ongoing care plan.',
  'pending',
  NOW() + INTERVAL '14 days',
  NULL,
  NOW() + INTERVAL '14 days',
  'Bring a summary of your cardiology visit and any new medications.',
  'Dr. Sarah Johnson',
  '555-0101',
  5,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
FROM care_roadmaps cr
WHERE cr.title = 'Cardiology Referral Journey'
LIMIT 1;

-- Insert second sample roadmap (Orthopedic Consultation)
INSERT INTO care_roadmaps (patient_id, title, status, created_at, updated_at)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'Knee Injury Consultation',
  'active',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT DO NOTHING;

-- Step 1: Referral Received (Completed)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'referral_received',
  'Orthopedic Referral Received',
  'Referral to orthopedic specialist for knee injury evaluation.',
  'completed',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  NULL,
  'Dr. Sarah Johnson',
  '555-0101',
  1,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
FROM care_roadmaps cr
WHERE cr.title = 'Knee Injury Consultation'
LIMIT 1;

-- Step 2: X-Ray (Completed)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'tests_labs',
  'Knee X-Ray',
  'X-ray imaging of the knee to assess bone structure and alignment.',
  'completed',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  'No special preparation needed. Remove any metal objects.',
  'Radiology Department',
  '555-0105',
  2,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
FROM care_roadmaps cr
WHERE cr.title = 'Knee Injury Consultation'
LIMIT 1;

-- Step 3: Orthopedic Appointment (Overdue)
INSERT INTO care_steps (
  roadmap_id,
  step_type,
  title,
  description,
  status,
  scheduled_date,
  completed_date,
  due_date,
  prep_instructions,
  provider_name,
  provider_phone,
  "order",
  created_at,
  updated_at
)
SELECT 
  cr.id,
  'specialist_consultation',
  'Orthopedic Specialist Appointment',
  'Consultation with orthopedic specialist to review X-ray results.',
  'overdue',
  NOW() - INTERVAL '1 day',
  NULL,
  NOW() - INTERVAL '1 day',
  'Bring X-ray results and wear comfortable clothing that allows easy access to knee.',
  'Dr. Emily Rodriguez',
  '555-0106',
  3,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
FROM care_roadmaps cr
WHERE cr.title = 'Knee Injury Consultation'
LIMIT 1;

-- Note: To use this seed file:
-- 1. Create a test user in Supabase Auth
-- 2. Replace 'USER_ID_HERE' with the actual user ID
-- 3. Run this SQL script in your Supabase SQL editor
-- 4. Or modify to use a function that gets the first user automatically

