-- Fix: profiles set to 'approved' by the previous migration
-- but never actually added to the employees table
--
-- Run this in Supabase SQL Editor

-- Step 1: Reset ALL employee-role profiles back to 'pending'
UPDATE employee_profiles
SET approval_status = 'pending'
WHERE role = 'employee';

-- Step 2: Mark as 'approved' ONLY those whose name exists in employees table
UPDATE employee_profiles ep
SET approval_status = 'approved'
WHERE ep.role = 'employee'
  AND EXISTS (
    SELECT 1 FROM employees e
    WHERE LOWER(TRIM(e.name)) = LOWER(TRIM(ep.full_name))
  );
