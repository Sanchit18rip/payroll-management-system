-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This adds an approval_status column to the employee_profiles table

ALTER TABLE employee_profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- Set existing profiles to 'approved' so HR users are not locked out
UPDATE employee_profiles
SET approval_status = 'approved'
WHERE approval_status IS NULL OR approval_status = '';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_employee_profiles_approval_status
ON employee_profiles (approval_status);
