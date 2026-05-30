import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'employee' | 'hr' | 'company_admin';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  bio: string;
  phone: string;
  location: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: number;
  description: string;
  website: string;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  college: string;
  degree: string;
  year_of_study: number;
  skills: string[];
  certifications: string[];
  availability: string;
  preferred_hours: number;
  weekend_available: boolean;
  rating: number;
  total_earnings: number;
}

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  department: string;
  employee_code: string;
  position: string;
  rating: number;
  sales_target: number;
  sales_achieved: number;
}

export interface HRProfile {
  id: string;
  user_id: string;
  company_id: string;
  permissions: string[];
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  tags: string[];
  visibility: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  job_type: string;
  department: string;
  location: string;
  pay_min: number;
  pay_max: number;
  pay_type: string;
  skills_required: string[];
  status: string;
  applications_count: number;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  student_id: string;
  status: string;
  cover_letter: string;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating_quality: number;
  rating_communication: number;
  rating_timeliness: number;
  rating_professionalism: number;
  comment: string;
  review_type: string;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  company_id: string;
  amount: number;
  status: string;
  payment_type: string;
  scheduled_at: string;
  processed_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  content: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  organizer_id: string;
  company_id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string;
  status: string;
  participant_ids: string[];
  created_at: string;
}

export interface MarketAnalytics {
  id: string;
  company_id: string;
  revenue: number;
  spending: number;
  market_share: number;
  customer_satisfaction: number;
  employee_satisfaction: number;
  growth_rate: number;
  date: string;
}

export interface Document {
  id: string;
  company_id: string;
  name: string;
  path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  version: number;
  folder: string;
  access_level: string;
  created_by: string;
  created_at: string;
}
