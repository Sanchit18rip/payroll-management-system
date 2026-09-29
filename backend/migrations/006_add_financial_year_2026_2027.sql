-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Ensures the current and next financial years exist.

-- Create table if it doesn't exist (matches backend auto-create)
CREATE TABLE IF NOT EXISTS financial_years (
  id SERIAL PRIMARY KEY,
  year_label TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert current & next financial years (Indian FY: Apr → Mar)
-- ON CONFLICT keeps it safe to re-run
INSERT INTO financial_years (year_label)
VALUES ('2026-2027'), ('2027-2028')
ON CONFLICT (year_label) DO NOTHING;

-- Also include past years for historical data
INSERT INTO financial_years (year_label)
VALUES ('2024-2025'), ('2025-2026')
ON CONFLICT (year_label) DO NOTHING;
