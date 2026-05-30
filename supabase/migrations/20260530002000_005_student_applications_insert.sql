/*
  # Student job applications

  Let authenticated students submit their own applications while preserving
  the existing "view own applications" rule.
*/

DROP POLICY IF EXISTS "Students can create own applications" ON applications;

CREATE POLICY "Students can create own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_unique_student_job;

ALTER TABLE applications
  ADD CONSTRAINT applications_unique_student_job UNIQUE (student_id, job_id);
