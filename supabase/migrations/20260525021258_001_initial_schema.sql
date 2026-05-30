/*
  # Initial Database Schema for EnterpriseConnect

  1. New Tables
    - `profiles` - User profile information
    - `companies` - Company information
    - `students` - Student-specific data
    - `employees` - Employee-specific data
    - `hr_profiles` - HR-specific data and permissions
    - `posts` - Public feed posts
    - `comments` - Post comments
    - `likes` - Post likes
    - `documents` - Company documents
    - `jobs` - Job postings
    - `applications` - Job applications
    - `reviews` - Performance reviews
    - `payments` - Student payments
    - `messages` - Chat messages
    - `meetings` - Scheduled meetings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar text DEFAULT '',
  bio text DEFAULT '',
  phone text DEFAULT '',
  location text DEFAULT '',
  role text NOT NULL CHECK (role IN ('student', 'employee', 'hr', 'company_admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text DEFAULT '',
  industry text DEFAULT '',
  size integer DEFAULT 0,
  description text DEFAULT '',
  website text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are viewable by authenticated users"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college text DEFAULT '',
  degree text DEFAULT '',
  year_of_study integer DEFAULT 1,
  skills text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  availability text DEFAULT 'flexible',
  preferred_hours integer DEFAULT 20,
  weekend_available boolean DEFAULT true,
  rating numeric(3,2) DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own data"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own data"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can insert own data"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department text DEFAULT '',
  employee_code text NOT NULL,
  position text DEFAULT '',
  rating numeric(3,2) DEFAULT 0,
  sales_target integer DEFAULT 0,
  sales_achieved integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own data"
  ON employees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Employees can update own data"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- HR Profiles table
CREATE TABLE IF NOT EXISTS hr_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  permissions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hr_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view own data"
  ON hr_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_urls text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'company', 'private')),
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public posts are viewable by all authenticated users"
  ON posts FOR SELECT
  TO authenticated
  USING (visibility = 'public' OR auth.uid() = author_id);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by authenticated users"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  path text DEFAULT '',
  file_url text DEFAULT '',
  file_type text DEFAULT '',
  file_size integer DEFAULT 0,
  version integer DEFAULT 1,
  folder text DEFAULT '',
  access_level text DEFAULT 'company' CHECK (access_level IN ('public', 'company', 'department', 'private')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company documents viewable by company members"
  ON documents FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM employees WHERE user_id = auth.uid()
      UNION
      SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
    )
  );

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  requirements text[] DEFAULT '{}',
  job_type text DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  department text DEFAULT '',
  location text DEFAULT '',
  pay_min integer DEFAULT 0,
  pay_max integer DEFAULT 0,
  pay_type text DEFAULT 'fixed' CHECK (pay_type IN ('fixed', 'hourly', 'project')),
  skills_required text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  applications_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active jobs are viewable by authenticated users"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'active' OR company_id IN (
    SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
  ));

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating_quality integer DEFAULT 0 CHECK (rating_quality >= 0 AND rating_quality <= 5),
  rating_communication integer DEFAULT 0 CHECK (rating_communication >= 0 AND rating_communication <= 5),
  rating_timeliness integer DEFAULT 0 CHECK (rating_timeliness >= 0 AND rating_timeliness <= 5),
  rating_professionalism integer DEFAULT 0 CHECK (rating_professionalism >= 0 AND rating_professionalism <= 5),
  comment text DEFAULT '',
  review_type text DEFAULT 'customer' CHECK (review_type IN ('customer', 'company', 'peer')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by reviewee and company"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reviewee_id
    OR reviewee_id IN (
      SELECT user_id FROM employees WHERE company_id IN (
        SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
      )
    )
    OR reviewee_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_type text DEFAULT 'weekly' CHECK (payment_type IN ('daily', 'weekly', 'monthly', 'instant')),
  scheduled_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  meeting_url text DEFAULT '',
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  participant_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meetings they're part of"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = organizer_id
    OR auth.uid() = ANY(participant_ids)
    OR company_id IN (
      SELECT company_id FROM employees WHERE user_id = auth.uid()
      UNION
      SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

-- Market Analytics table
CREATE TABLE IF NOT EXISTS market_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  revenue numeric DEFAULT 0,
  spending numeric DEFAULT 0,
  market_share numeric DEFAULT 0,
  customer_satisfaction numeric DEFAULT 0,
  employee_satisfaction numeric DEFAULT 0,
  growth_rate numeric DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market analytics viewable by authenticated users"
  ON market_analytics FOR SELECT
  TO authenticated
  USING (true);

-- Company tie-ups
CREATE TABLE IF NOT EXISTS company_tieups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id_1 uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_id_2 uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  proposed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_tieups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tieups viewable by involved companies"
  ON company_tieups FOR SELECT
  TO authenticated
  USING (
    company_id_1 IN (
      SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
    )
    OR company_id_2 IN (
      SELECT company_id FROM hr_profiles WHERE user_id = auth.uid()
    )
  );
