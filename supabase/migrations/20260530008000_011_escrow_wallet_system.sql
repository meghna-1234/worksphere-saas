-- Alter tables to add wallet balances
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS available_balance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_balance numeric NOT NULL DEFAULT 0;

ALTER TABLE companies 
  ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 10000.00;

-- Create escrow_wallets table
CREATE TABLE IF NOT EXISTS escrow_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  application_id uuid UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('pending_funding', 'funded', 'completed', 'released', 'disputed', 'refunded')),
  student_work_notes text,
  dispute_reason text,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallet_ledger table for auditing
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  escrow_id uuid REFERENCES escrow_wallets(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'escrow_lock', 'escrow_release', 'escrow_refund', 'withdrawal')),
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE escrow_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;

-- Escrow RLS Policies
CREATE POLICY "Students can view own escrows"
  ON escrow_wallets FOR SELECT
  TO authenticated
  USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can view own escrows"
  ON escrow_wallets FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE id IN (
        SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
        UNION
        SELECT company_id FROM employees WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'company_admin'
    )
  );

CREATE POLICY "HR can view all escrows for disputes"
  ON escrow_wallets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'hr'
    )
  );

-- Ledger RLS Policies
CREATE POLICY "Students can view own ledger entries"
  ON wallet_ledger FOR SELECT
  TO authenticated
  USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can view own ledger entries"
  ON wallet_ledger FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE id IN (
        SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
        UNION
        SELECT company_id FROM employees WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'company_admin'
    )
  );

-- Trigger to auto-create escrow wallet when application status becomes 'accepted'
CREATE OR REPLACE FUNCTION auto_create_escrow_on_application_accept()
RETURNS trigger AS $$
DECLARE
  v_job_company_id uuid;
  v_job_pay_min integer;
  v_job_pay_max integer;
  v_escrow_amount numeric;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Get job details
    SELECT company_id, pay_min, pay_max 
    INTO v_job_company_id, v_job_pay_min, v_job_pay_max 
    FROM jobs 
    WHERE id = NEW.job_id;

    -- Determine contract amount
    v_escrow_amount := COALESCE(v_job_pay_max, v_job_pay_min, 1000);
    IF v_escrow_amount <= 0 THEN
      v_escrow_amount := 1000;
    END IF;

    -- Insert escrow contract if it doesn't already exist
    INSERT INTO escrow_wallets (job_id, application_id, student_id, company_id, amount, status)
    VALUES (NEW.job_id, NEW.id, NEW.student_id, v_job_company_id, v_escrow_amount, 'pending_funding')
    ON CONFLICT (application_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_escrow ON applications;
CREATE TRIGGER trigger_auto_create_escrow
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION auto_create_escrow_on_application_accept();


-- TRANSACTIONAL RPC: Fund Escrow Wallet
CREATE OR REPLACE FUNCTION fund_escrow_wallet(p_escrow_id uuid)
RETURNS escrow_wallets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escrow escrow_wallets;
  v_company_balance numeric;
BEGIN
  -- Get escrow wallet details
  SELECT * INTO v_escrow FROM escrow_wallets WHERE id = p_escrow_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow wallet not found.';
  END IF;

  IF v_escrow.status != 'pending_funding' THEN
    RAISE EXCEPTION 'Escrow wallet is already funded or closed.';
  END IF;

  -- Get company balance
  SELECT balance INTO v_company_balance FROM companies WHERE id = v_escrow.company_id;
  IF v_company_balance < v_escrow.amount THEN
    RAISE EXCEPTION 'Insufficient corporate wallet balance. Deposit funds first.';
  END IF;

  -- Deduct from company balance
  UPDATE companies 
  SET balance = balance - v_escrow.amount 
  WHERE id = v_escrow.company_id;

  -- Increment student's pending balance
  UPDATE students 
  SET pending_balance = pending_balance + v_escrow.amount 
  WHERE id = v_escrow.student_id;

  -- Update escrow status
  UPDATE escrow_wallets 
  SET status = 'funded', updated_at = now() 
  WHERE id = p_escrow_id
  RETURNING * INTO v_escrow;

  -- Insert audit ledger entry
  INSERT INTO wallet_ledger (student_id, company_id, escrow_id, amount, transaction_type)
  VALUES (v_escrow.student_id, v_escrow.company_id, v_escrow.id, -v_escrow.amount, 'escrow_lock');

  RETURN v_escrow;
END;
$$;

GRANT EXECUTE ON FUNCTION fund_escrow_wallet(uuid) TO authenticated;


-- TRANSACTIONAL RPC: Submit Escrow Work
CREATE OR REPLACE FUNCTION submit_escrow_work(p_escrow_id uuid, p_work_notes text)
RETURNS escrow_wallets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escrow escrow_wallets;
BEGIN
  -- Check user permissions
  IF NOT EXISTS (
    SELECT 1 FROM students 
    WHERE id = (SELECT student_id FROM escrow_wallets WHERE id = p_escrow_id)
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only the assigned student can submit work for this escrow.';
  END IF;

  -- Update status and notes
  UPDATE escrow_wallets 
  SET status = 'completed', student_work_notes = p_work_notes, updated_at = now() 
  WHERE id = p_escrow_id
  RETURNING * INTO v_escrow;

  RETURN v_escrow;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_escrow_work(uuid, text) TO authenticated;


-- TRANSACTIONAL RPC: Approve Escrow Release
CREATE OR REPLACE FUNCTION approve_escrow_release(p_escrow_id uuid)
RETURNS escrow_wallets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escrow escrow_wallets;
BEGIN
  -- Get escrow
  SELECT * INTO v_escrow FROM escrow_wallets WHERE id = p_escrow_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow not found.';
  END IF;

  IF v_escrow.status != 'completed' AND v_escrow.status != 'funded' THEN
    RAISE EXCEPTION 'Only funded or completed contracts can be approved for release.';
  END IF;

  -- Deduct from student's pending balance, add to available balance & total earnings
  UPDATE students 
  SET pending_balance = pending_balance - v_escrow.amount,
      available_balance = available_balance + v_escrow.amount,
      total_earnings = total_earnings + v_escrow.amount
  WHERE id = v_escrow.student_id;

  -- Update escrow status
  UPDATE escrow_wallets 
  SET status = 'released', updated_at = now() 
  WHERE id = p_escrow_id
  RETURNING * INTO v_escrow;

  -- Insert audit ledger entry (Credit to student)
  INSERT INTO wallet_ledger (student_id, company_id, escrow_id, amount, transaction_type)
  VALUES (v_escrow.student_id, v_escrow.company_id, v_escrow.id, v_escrow.amount, 'escrow_release');

  RETURN v_escrow;
END;
$$;

GRANT EXECUTE ON FUNCTION approve_escrow_release(uuid) TO authenticated;


-- TRANSACTIONAL RPC: Dispute Escrow Wallet
CREATE OR REPLACE FUNCTION dispute_escrow_wallet(p_escrow_id uuid, p_reason text)
RETURNS escrow_wallets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escrow escrow_wallets;
BEGIN
  -- Verify involvement
  IF NOT EXISTS (
    SELECT 1 FROM escrow_wallets 
    WHERE id = p_escrow_id 
      AND (
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        OR company_id IN (
          SELECT id FROM companies WHERE id IN (
            SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
            UNION
            SELECT company_id FROM employees WHERE user_id = auth.uid()
          )
        )
        -- Or company admin
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'company_admin')
      )
  ) THEN
    RAISE EXCEPTION 'Unauthorized to dispute this escrow.';
  END IF;

  -- Update status and reason
  UPDATE escrow_wallets 
  SET status = 'disputed', dispute_reason = p_reason, updated_at = now() 
  WHERE id = p_escrow_id
  RETURNING * INTO v_escrow;

  RETURN v_escrow;
END;
$$;

GRANT EXECUTE ON FUNCTION dispute_escrow_wallet(uuid, text) TO authenticated;


-- TRANSACTIONAL RPC: Resolve Escrow Dispute (HR/Admin Resolution)
CREATE OR REPLACE FUNCTION resolve_escrow_dispute(
  p_escrow_id uuid, 
  p_resolution text, 
  p_notes text
)
RETURNS escrow_wallets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escrow escrow_wallets;
BEGIN
  -- Verify caller is HR/Admin or Company Admin acting as resolver
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
      AND role IN ('hr', 'company_admin')
  ) THEN
    RAISE EXCEPTION 'Only HR Administrators or system admins can arbitrate disputes.';
  END IF;

  -- Get escrow
  SELECT * INTO v_escrow FROM escrow_wallets WHERE id = p_escrow_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow not found.';
  END IF;

  IF v_escrow.status != 'disputed' THEN
    RAISE EXCEPTION 'This escrow contract is not currently in a disputed state.';
  END IF;

  IF p_resolution = 'release' THEN
    -- Release to student
    UPDATE students 
    SET pending_balance = pending_balance - v_escrow.amount,
        available_balance = available_balance + v_escrow.amount,
        total_earnings = total_earnings + v_escrow.amount
    WHERE id = v_escrow.student_id;

    UPDATE escrow_wallets 
    SET status = 'released', resolution_notes = p_notes, updated_at = now() 
    WHERE id = p_escrow_id
    RETURNING * INTO v_escrow;

    INSERT INTO wallet_ledger (student_id, company_id, escrow_id, amount, transaction_type)
    VALUES (v_escrow.student_id, v_escrow.company_id, v_escrow.id, v_escrow.amount, 'escrow_release');

  ELSIF p_resolution = 'refund' THEN
    -- Refund to company
    UPDATE students 
    SET pending_balance = pending_balance - v_escrow.amount 
    WHERE id = v_escrow.student_id;

    UPDATE companies 
    SET balance = balance + v_escrow.amount 
    WHERE id = v_escrow.company_id;

    UPDATE escrow_wallets 
    SET status = 'refunded', resolution_notes = p_notes, updated_at = now() 
    WHERE id = p_escrow_id
    RETURNING * INTO v_escrow;

    INSERT INTO wallet_ledger (student_id, company_id, escrow_id, amount, transaction_type)
    VALUES (v_escrow.student_id, v_escrow.company_id, v_escrow.id, v_escrow.amount, 'escrow_refund');

  ELSE
    RAISE EXCEPTION 'Invalid resolution. Must be release or refund.';
  END IF;

  RETURN v_escrow;
END;
$$;

GRANT EXECUTE ON FUNCTION resolve_escrow_dispute(uuid, text, text) TO authenticated;


-- TRANSACTIONAL RPC: Withdraw Student Funds
CREATE OR REPLACE FUNCTION withdraw_student_funds(p_amount numeric)
RETURNS students
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student students;
BEGIN
  -- Get caller student profile
  SELECT * INTO v_student FROM students WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student profile not found.';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero.';
  END IF;

  IF v_student.available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient available balance.';
  END IF;

  -- Deduct balance
  UPDATE students 
  SET available_balance = available_balance - p_amount 
  WHERE id = v_student.id
  RETURNING * INTO v_student;

  -- Log in ledger
  INSERT INTO wallet_ledger (student_id, amount, transaction_type)
  VALUES (v_student.id, -p_amount, 'withdrawal');

  RETURN v_student;
END;
$$;

GRANT EXECUTE ON FUNCTION withdraw_student_funds(numeric) TO authenticated;


-- TRANSACTIONAL RPC: Deposit Company Funds
CREATE OR REPLACE FUNCTION deposit_company_funds(p_company_id uuid, p_amount numeric)
RETURNS companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company companies;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Deposit amount must be greater than zero.';
  END IF;

  -- Update company balance
  UPDATE companies 
  SET balance = balance + p_amount 
  WHERE id = p_company_id
  RETURNING * INTO v_company;

  -- Log in ledger
  INSERT INTO wallet_ledger (company_id, amount, transaction_type)
  VALUES (p_company_id, p_amount, 'deposit');

  RETURN v_company;
END;
$$;

GRANT EXECUTE ON FUNCTION deposit_company_funds(uuid, numeric) TO authenticated;
