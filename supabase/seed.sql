-- Seed data for testing
-- Requirements:
--   1. At least one user exists in auth.users (so a profile row can be found or created)
--   2. The handle_new_user trigger from the initial migration is in place (creates profiles automatically)

DO $$
DECLARE
  v_patient_id uuid;
  v_cardiology_roadmap_id uuid;
  v_orthopedic_roadmap_id uuid;
BEGIN
  -- Use the first profile we can find as the patient for sample data
  SELECT p.id
  INTO v_patient_id
  FROM public.profiles p
  ORDER BY p.created_at
  LIMIT 1;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Seed aborted: no profiles found in public.profiles. Create a user via Supabase Auth before running this script.';
  END IF;

  -- Ensure there is a cardiology roadmap for this patient
  IF NOT EXISTS (
    SELECT 1
    FROM care_roadmaps cr
    WHERE cr.patient_id = v_patient_id
      AND cr.title = 'Cardiology Referral Journey'
  ) THEN
    INSERT INTO care_roadmaps (patient_id, title, status, created_at, updated_at)
    VALUES (
      v_patient_id,
      'Cardiology Referral Journey',
      'active',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '7 days'
    );
  END IF;

  SELECT cr.id
  INTO v_cardiology_roadmap_id
  FROM care_roadmaps cr
  WHERE cr.patient_id = v_patient_id
    AND cr.title = 'Cardiology Referral Journey'
  ORDER BY cr.created_at
  LIMIT 1;

  IF v_cardiology_roadmap_id IS NULL THEN
    RAISE EXCEPTION 'Seed aborted: unable to locate Cardiology Referral Journey roadmap.';
  END IF;

  -- Cardiology steps
  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_cardiology_roadmap_id AND cs."order" = 1
  ) THEN
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
    VALUES (
      v_cardiology_roadmap_id,
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
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_cardiology_roadmap_id AND cs."order" = 2
  ) THEN
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
    VALUES (
      v_cardiology_roadmap_id,
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
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_cardiology_roadmap_id AND cs."order" = 3
  ) THEN
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
    VALUES (
      v_cardiology_roadmap_id,
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
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_cardiology_roadmap_id AND cs."order" = 4
  ) THEN
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
    VALUES (
      v_cardiology_roadmap_id,
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
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_cardiology_roadmap_id AND cs."order" = 5
  ) THEN
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
    VALUES (
      v_cardiology_roadmap_id,
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
    );
  END IF;

  -- Ensure there is an orthopedic roadmap for this patient
  IF NOT EXISTS (
    SELECT 1
    FROM care_roadmaps cr
    WHERE cr.patient_id = v_patient_id
      AND cr.title = 'Knee Injury Consultation'
  ) THEN
    INSERT INTO care_roadmaps (patient_id, title, status, created_at, updated_at)
    VALUES (
      v_patient_id,
      'Knee Injury Consultation',
      'active',
      NOW() - INTERVAL '3 days',
      NOW() - INTERVAL '3 days'
    );
  END IF;

  SELECT cr.id
  INTO v_orthopedic_roadmap_id
  FROM care_roadmaps cr
  WHERE cr.patient_id = v_patient_id
    AND cr.title = 'Knee Injury Consultation'
  ORDER BY cr.created_at
  LIMIT 1;

  IF v_orthopedic_roadmap_id IS NULL THEN
    RAISE EXCEPTION 'Seed aborted: unable to locate Knee Injury Consultation roadmap.';
  END IF;

  -- Orthopedic steps
  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_orthopedic_roadmap_id AND cs."order" = 1
  ) THEN
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
    VALUES (
      v_orthopedic_roadmap_id,
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
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_orthopedic_roadmap_id AND cs."order" = 2
  ) THEN
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
    VALUES (
      v_orthopedic_roadmap_id,
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
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM care_steps cs WHERE cs.roadmap_id = v_orthopedic_roadmap_id AND cs."order" = 3
  ) THEN
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
    VALUES (
      v_orthopedic_roadmap_id,
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
    );
  END IF;
END $$;

-- To use:
--   1. Create at least one test user via Supabase Auth (trigger will populate public.profiles).
--   2. Run this script in the Supabase SQL editor or psql with service role access.
--   3. Re-run as needed; the IF NOT EXISTS guards keep it idempotent.
