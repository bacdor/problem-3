-- Add new fields to care_steps table for comprehensive step details
ALTER TABLE care_steps
ADD COLUMN provider_specialty TEXT,
ADD COLUMN location_name TEXT,
ADD COLUMN location_address TEXT,
ADD COLUMN location_phone TEXT,
ADD COLUMN clinic_approved BOOLEAN DEFAULT NULL,
ADD COLUMN previous_data_received BOOLEAN DEFAULT NULL,
ADD COLUMN appointment_confirmation_code TEXT,
ADD COLUMN estimated_duration INTEGER,
ADD COLUMN notes TEXT;

-- Add comment to document the new fields
COMMENT ON COLUMN care_steps.provider_specialty IS 'Doctor''s specialty or medical field';
COMMENT ON COLUMN care_steps.location_name IS 'Name of clinic or facility';
COMMENT ON COLUMN care_steps.location_address IS 'Full address of the location';
COMMENT ON COLUMN care_steps.location_phone IS 'Location or clinic phone number';
COMMENT ON COLUMN care_steps.clinic_approved IS 'Whether clinic has approved the appointment';
COMMENT ON COLUMN care_steps.previous_data_received IS 'Whether all required data from previous doctors has been received';
COMMENT ON COLUMN care_steps.appointment_confirmation_code IS 'Appointment confirmation or reference number';
COMMENT ON COLUMN care_steps.estimated_duration IS 'Estimated appointment duration in minutes';
COMMENT ON COLUMN care_steps.notes IS 'Additional notes or special instructions';

