/*
  # Company module support

  Adds company contact fields and lets authenticated company users create jobs
  and tie-up requests from the company dashboard.
*/

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS location text DEFAULT '';

DROP POLICY IF EXISTS "Authenticated users can update companies" ON companies;
CREATE POLICY "Authenticated users can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'company_admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'company_admin'
  ));

DROP POLICY IF EXISTS "Company users can create jobs" ON jobs;
CREATE POLICY "Company users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'company_admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated company users can create jobs" ON jobs;
CREATE POLICY "Authenticated company users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'company_admin'
    )
  );

DROP POLICY IF EXISTS "Company users can view own jobs" ON jobs;
CREATE POLICY "Company users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create company tieups" ON company_tieups;
CREATE POLICY "Authenticated users can create company tieups"
  ON company_tieups FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = proposed_by
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'company_admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view company tieups" ON company_tieups;
CREATE POLICY "Authenticated users can view company tieups"
  ON company_tieups FOR SELECT
  TO authenticated
  USING (true);
