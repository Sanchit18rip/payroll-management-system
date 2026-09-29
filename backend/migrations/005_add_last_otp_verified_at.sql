-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Adds a timestamp that records when the employee last successfully
-- verified their email OTP.  The login flow checks this to decide
-- whether OTP is required again (24-hour window).

ALTER TABLE employee_profiles
  ADD COLUMN IF NOT EXISTS last_otp_verified_at TIMESTAMPTZ;

-- Index for the common query pattern: WHERE last_otp_verified_at > NOW() - INTERVAL '24 hours'
CREATE INDEX IF NOT EXISTS idx_employee_profiles_last_otp_verified_at
  ON employee_profiles (last_otp_verified_at);
