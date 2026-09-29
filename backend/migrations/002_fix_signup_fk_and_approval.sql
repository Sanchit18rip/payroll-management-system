-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Drop the foreign key constraint that blocks signup
--    (employee_profiles.id references auth.users.id, which fails when
--     email confirmation is enabled because the user isn't in auth.users yet)
ALTER TABLE employee_profiles
  DROP CONSTRAINT IF EXISTS employee_profiles_id_fkey;

-- 2. Add approval_status column for the admin approval system
ALTER TABLE employee_profiles
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- 3. Mark existing profiles as 'approved'
UPDATE employee_profiles
SET approval_status = 'approved';

-- 4. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_employee_profiles_approval_status
  ON employee_profiles (approval_status);
