-- Run this in Supabase SQL Editor

-- 1. Add email column to employee_profiles (signup stores it here)
ALTER TABLE employee_profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Populate email for existing profiles using their auth user ID
-- (Supabase stores email in auth.users, but we can't query that directly)
-- If you know the emails, update manually, or skip this step.

-- 3. Make sure FK constraint is dropped
ALTER TABLE employee_profiles
  DROP CONSTRAINT IF EXISTS employee_profiles_id_fkey;

-- 4. Make sure approval_status column exists
ALTER TABLE employee_profiles
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- 5. Reset all employee profiles to pending
UPDATE employee_profiles
SET approval_status = 'pending'
WHERE role = 'employee';

-- 6. Mark as approved ONLY those already in employees table
UPDATE employee_profiles ep
SET approval_status = 'approved'
WHERE ep.role = 'employee'
  AND EXISTS (
    SELECT 1 FROM employees e
    WHERE LOWER(TRIM(e.name)) = LOWER(TRIM(ep.full_name))
  );
