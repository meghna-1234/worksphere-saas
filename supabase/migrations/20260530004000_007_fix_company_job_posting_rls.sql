/*
  # Fix company job posting RLS

  The company module posts jobs directly from company_admin accounts. Some
  databases may still have older jobs policies that only consider HR company
  mappings, so this migration adds an explicit authenticated insert policy for
  the company job posting flow.
*/

DROP POLICY IF EXISTS "Authenticated company users can create jobs" ON jobs;
CREATE POLICY "Authenticated company users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view posted jobs" ON jobs;
CREATE POLICY "Authenticated users can view posted jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);
