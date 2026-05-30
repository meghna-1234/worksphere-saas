/*
  # Company payment visibility

  Lets company admins and HR users view payments made by their company while
  preserving the student self-view policy.
*/

DROP POLICY IF EXISTS "Company users can view company payments" ON payments;
CREATE POLICY "Company users can view company payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'company_admin'
    )
    OR company_id IN (
      SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
      UNION
      SELECT company_id FROM employees WHERE user_id = auth.uid()
    )
  );
