-- Run this once in Supabase SQL Editor for the live project used by .env:
-- https://jvlagukmzlsdiwwnmqmr.supabase.co

CREATE OR REPLACE FUNCTION public.post_company_job(
  p_company_id uuid,
  p_description text
)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_job public.jobs;
  clean_description text := btrim(coalesce(p_description, ''));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to post a job.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'company_admin'
  ) THEN
    RAISE EXCEPTION 'Only company admins can post jobs.';
  END IF;

  IF clean_description = '' THEN
    RAISE EXCEPTION 'Enter a job description before posting.';
  END IF;

  INSERT INTO public.jobs (
    company_id,
    title,
    description,
    status,
    job_type,
    requirements,
    skills_required
  )
  VALUES (
    p_company_id,
    left(clean_description, 80),
    clean_description,
    'active',
    'full-time',
    '{}',
    '{}'
  )
  RETURNING * INTO created_job;

  RETURN created_job;
END;
$$;

REVOKE ALL ON FUNCTION public.post_company_job(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.post_company_job(uuid, text) TO authenticated;

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated company users can create jobs" ON jobs;
CREATE POLICY "Authenticated company users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'company_admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view posted jobs" ON jobs;
CREATE POLICY "Authenticated users can view posted jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);
