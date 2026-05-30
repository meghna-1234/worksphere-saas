import { ReactNode, useEffect, useMemo, useState } from 'react';
import { supabase, Company, Employee, Job, MarketAnalytics, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Briefcase, Building, Calendar, CheckCircle, ChevronDown, Clipboard, Clock, DollarSign, Handshake, Play, Send, Users, X } from 'lucide-react';

type CompanyPage = 'dashboard' | 'jobs' | 'employees' | 'payments';
type MetricKey = 'revenue' | 'spending' | 'market_share' | 'customer_satisfaction' | 'employee_satisfaction' | 'growth_rate';
type EmployeeRow = Employee & { profile?: Profile };

const colors = ['#0f766e', '#2563eb', '#d97706', '#16a34a', '#dc2626'];
const metricLabels: Record<MetricKey, string> = {
  revenue: 'Revenue',
  spending: 'Spending',
  market_share: 'Market Share',
  customer_satisfaction: 'Customer Satisfaction',
  employee_satisfaction: 'Employee Satisfaction',
  growth_rate: 'Growth Rate',
};
const metricSuffix: Record<MetricKey, string> = {
  revenue: 'M',
  spending: 'M',
  market_share: '%',
  customer_satisfaction: '',
  employee_satisfaction: '',
  growth_rate: '%',
};

const jobPolicyFixSql = `CREATE OR REPLACE FUNCTION public.post_company_job(
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
  USING (true);`;

export function CompanyModule({ page }: { page: CompanyPage }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      const { data } = await supabase.from('companies').select('*').limit(1).maybeSingle();
      setCompany(data || ({ id: 'sample-company', name: 'Your Company', industry: 'Technology', description: '', website: '' } as Company));
      setLoading(false);
    };

    if (user) fetchCompany();
  }, [user?.id]);

  if (loading) return <LoadingBlock label="Loading company module..." />;

  return (
    <div className="space-y-6">
      {page === 'dashboard' && <CompanyDashboard company={company} />}
      {page === 'jobs' && <CompanyJobs company={company} />}
      {page === 'employees' && <CompanyEmployees company={company} />}
      {page === 'payments' && <CompanyPayments company={company} />}
    </div>
  );
}

function CompanyDashboard({ company }: { company: Company | null }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={<Building className="w-5 h-5" />} label="Company" value={company?.name || 'Company'} />
        <MetricCard icon={<Users className="w-5 h-5" />} label="Employees" value={String(company?.size || 0)} />
        <MetricCard icon={<Briefcase className="w-5 h-5" />} label="Active Jobs" value="0" />
        <MetricCard icon={<Handshake className="w-5 h-5" />} label="Tie-Up Requests" value="0" />
      </div>

      <CompanyComparison />
      <SuggestedTieUps company={company} />
      <CompanyMeetings />
    </div>
  );
}

function CompanyComparison() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [analytics, setAnalytics] = useState<MarketAnalytics[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedCompanyIds);
  }, [selectedCompanyIds.join('|')]);

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error: companyError } = await supabase.from('companies').select('*').limit(20);
    if (companyError) {
      setError(companyError.message || 'Unable to load companies.');
      setLoading(false);
      return;
    }

    const fallback = [
      { id: 'sample-1', name: 'TechCorp Inc.', industry: 'Technology' },
      { id: 'sample-2', name: 'GlobalSoft', industry: 'Software' },
      { id: 'sample-3', name: 'DataDriven Co.', industry: 'Analytics' },
    ] as Company[];
    const loaded = data && data.length > 0 ? data : fallback;
    setCompanies(loaded);
    setSelectedCompanyIds(loaded.slice(0, 3).map((item) => item.id));
    setLoading(false);
  };

  const fetchAnalytics = async (companyIds: string[]) => {
    if (companyIds.length === 0) {
      setAnalytics([]);
      return;
    }

    const { data } = await supabase
      .from('market_analytics')
      .select('*')
      .in('company_id', companyIds)
      .order('date', { ascending: true });
    setAnalytics(data && data.length > 0 ? data : generateSampleAnalytics(companyIds));
  };

  const toggleCompany = (companyId: string) => {
    setSelectedCompanyIds((current) => {
      if (current.includes(companyId)) return current.length === 1 ? current : current.filter((id) => id !== companyId);
      if (current.length >= 5) return current;
      return [...current, companyId];
    });
  };

  const selectedCompanies = companies.filter((item) => selectedCompanyIds.includes(item.id));

  return (
    <Section title="Company Comparison" icon={<BarChart3 className="w-5 h-5 text-teal-600" />}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <p className="text-sm text-slate-500">Choose companies and criteria to compare performance trends.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              className="w-full sm:w-64 flex items-center justify-between gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span>Companies ({selectedCompanyIds.length}/5)</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-72 overflow-auto">
                {companies.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCompanyIds.includes(item.id)}
                      onChange={() => toggleCompany(item.id)}
                      disabled={!selectedCompanyIds.includes(item.id) && selectedCompanyIds.length >= 5}
                      className="w-4 h-4"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{item.name}</span>
                      <span className="block text-xs text-slate-500">{item.industry || 'Industry not set'}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value as MetricKey)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            {(Object.keys(metricLabels) as MetricKey[]).map((key) => (
              <option key={key} value={key}>{metricLabels[key]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading company comparison..." />
      ) : error ? (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      ) : selectedCompanies.length === 0 ? (
        <LoadingBlock label="Select at least one company to compare." />
      ) : (
        <>
          <LineGraph data={analytics.filter((item) => selectedCompanyIds.includes(item.company_id))} companies={selectedCompanies} metric={metric} />
          <GraphLegend companies={selectedCompanies} />
        </>
      )}
    </Section>
  );
}

function SuggestedTieUps({ company }: { company: Company | null }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTieUps();
  }, [company?.id]);

  const fetchTieUps = async () => {
    setLoading(true);
    const { data: companyData } = await supabase.from('companies').select('*').neq('id', company?.id || '').limit(6);
    const suggestions = companyData && companyData.length > 0
      ? companyData
      : [
          { id: 'sample-2', name: 'GlobalSoft', industry: 'Software', description: 'Shared customer base' },
          { id: 'sample-3', name: 'DataDriven Co.', industry: 'Analytics', description: 'Strategic partnership potential' },
        ] as Company[];
    setCompanies(suggestions);

    if (company?.id) {
      const { data: tieups } = await supabase
        .from('company_tieups')
        .select('*')
        .eq('company_id_1', company.id);
      setRequestedIds((tieups || []).map((item: any) => item.company_id_2));
    }
    setLoading(false);
  };

  const connect = async (target: Company) => {
    setMessage(null);
    if (!company?.id || !user) {
      setMessage({ type: 'error', text: 'Company profile is required before sending tie-up requests.' });
      return;
    }

    const { error } = await supabase.from('company_tieups').insert({
      company_id_1: company.id,
      company_id_2: target.id,
      proposed_by: user.id,
      status: 'pending',
    });

    if (error && !error.message.toLowerCase().includes('duplicate')) {
      setMessage({ type: 'error', text: error.message || 'Unable to send tie-up request.' });
      return;
    }

    setRequestedIds((ids) => [...new Set([...ids, target.id])]);
    setMessage({ type: 'success', text: `Tie-up request sent to ${target.name}.` });
  };

  return (
    <Section title="Suggested Tie-Ups" icon={<Handshake className="w-5 h-5 text-amber-600" />}>
      {message && <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}
      {loading ? (
        <LoadingBlock label="Loading suggested tie-ups..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map((item) => {
            const requested = requestedIds.includes(item.id);
            return (
              <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-600 mt-1">{item.industry || 'Industry not set'}</p>
                <p className="text-xs text-blue-600 mt-2">{item.description || 'Potential business collaboration'}</p>
                <button
                  onClick={() => connect(item)}
                  disabled={requested}
                  className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    requested ? 'bg-emerald-50 text-emerald-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {requested ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  {requested ? 'Requested' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function CompanyMeetings() {
  const [joinCode, setJoinCode] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [meetings, setMeetings] = useState([
    { id: 'm1', title: 'Employee all-hands', date: 'Today', time: '4:00 PM' },
  ]);

  const joinMeeting = () => {
    setMessage(joinCode.trim() ? { type: 'success', text: `Joining meeting ${joinCode.trim()}...` } : { type: 'error', text: 'Enter a meeting code or link.' });
  };

  const startMeeting = () => {
    setMessage({ type: 'success', text: 'New meeting room generated and started.' });
  };

  const scheduleMeeting = () => {
    if (!title.trim() || !date || !time) {
      setMessage({ type: 'error', text: 'Add a title, date, and time before scheduling.' });
      return;
    }
    setMeetings((items) => [{ id: String(Date.now()), title: title.trim(), date, time }, ...items]);
    setTitle('');
    setDate('');
    setTime('');
    setMessage({ type: 'success', text: 'Meeting scheduled with employees.' });
  };

  return (
    <Section title="Meetings" icon={<Calendar className="w-5 h-5 text-blue-600" />}>
      {message && <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-3">Join Existing Meeting</p>
          <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="Meeting code or link" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={joinMeeting} className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Join</button>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-3">Generate/Start New Meeting</p>
          <p className="text-sm text-slate-600">Create a live room for company employees.</p>
          <button onClick={startMeeting} className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><Play className="w-4 h-4" /> Start Meeting</button>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-3">Schedule With Employees</p>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Meeting title" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={scheduleMeeting} className="mt-3 w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Schedule</button>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
            <span className="font-medium text-slate-800">{meeting.title}</span>
            <span className="text-sm text-slate-500 inline-flex items-center gap-2"><Clock className="w-4 h-4" /> {meeting.date} {meeting.time}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CompanyJobs({ company }: { company: Company | null }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [policyBlocked, setPolicyBlocked] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (activeTab === 'applicants') {
      fetchApplications();
    }
  }, [company?.id, activeTab]);

  const fetchJobs = async () => {
    if (!company?.id || company.id.startsWith('sample')) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });
    setJobs((data || []) as Job[]);
    setLoading(false);
  };

  const fetchApplications = async () => {
    if (!company?.id || company.id.startsWith('sample')) {
      setApplications([]);
      return;
    }
    setLoadingApps(true);
    try {
      const { data: jobIdsData } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', company.id);

      const jobIds = (jobIdsData || []).map((j) => j.id);
      if (jobIds.length === 0) {
        setApplications([]);
        setLoadingApps(false);
        return;
      }

      const { data: appsData, error } = await supabase
        .from('applications')
        .select('*, job:jobs(title, pay_min, pay_max), student:students(*)')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for these student user_ids
      const userIds = [...new Set((appsData || []).map((app) => app.student?.user_id).filter(Boolean))];
      const { data: profiles } = userIds.length
        ? await supabase.from('profiles').select('*').in('user_id', userIds)
        : { data: [] };

      const profilesByUserId = (profiles || []).reduce<Record<string, Profile>>((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      setApplications(
        (appsData || []).map((app) => ({
          ...app,
          profile: app.student ? profilesByUserId[app.student.user_id] : undefined,
        }))
      );
    } catch (err: any) {
      console.error(err);
      // Fallback sample applications if error
      setApplications([
        {
          id: 'mock-app-1',
          status: 'pending',
          cover_letter: 'Experienced in React/TS design systems.',
          created_at: new Date().toISOString(),
          job: { title: 'React Dashboard UI', pay_min: 500, pay_max: 800 },
          profile: { name: 'Aarav Mehta' },
        },
      ]);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApplicationStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    setMessage(null);
    const isMock = appId.startsWith('mock');
    if (isMock) {
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      );
      setMessage({
        type: 'success',
        text: `Application status updated to ${status} (Simulated locally).`,
      });
      return;
    }

    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId);

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to update status.' });
    } else {
      setMessage({
        type: 'success',
        text: `Application ${status} successfully. Escrow contract generated.`,
      });
      fetchApplications();
    }
  };

  const postJob = async () => {
    const content = description.trim();
    setMessage(null);
    setPolicyBlocked(false);
    if (!content) {
      setMessage({ type: 'error', text: 'Enter a job description before posting.' });
      return;
    }
    if (!company?.id || company.id.startsWith('sample')) {
      setMessage({
        type: 'error',
        text: 'Create or connect a company profile before posting jobs.',
      });
      return;
    }

    const jobPayload = {
      company_id: company.id,
      title: content.slice(0, 80),
      description: content,
      status: 'active',
      job_type: 'full-time',
      requirements: [],
      skills_required: [],
    };

    setPosting(true);
    const { error: rpcError } = await supabase.rpc('post_company_job', {
      p_company_id: company.id,
      p_description: content,
    });
    const functionMissing =
      rpcError &&
      (rpcError.code === 'PGRST202' ||
        rpcError.message?.toLowerCase().includes('could not find the function') ||
        rpcError.message?.toLowerCase().includes('function public.post_company_job'));
    const { error } = functionMissing
      ? await supabase.from('jobs').insert(jobPayload)
      : { error: rpcError };

    if (error) {
      const isRlsError = error.message?.toLowerCase().includes('row-level security');
      const needsMigration = functionMissing || isRlsError;
      const errorText = needsMigration
        ? 'Job posting is blocked by the live Supabase database setup. Copy and run the SQL fix in Supabase SQL Editor, then refresh.'
        : error.message || 'Unable to post job.';
      setPolicyBlocked(needsMigration);
      setMessage({ type: 'error', text: errorText });
      setPosting(false);
      return;
    }
    setDescription('');
    setPolicyBlocked(false);
    setMessage({ type: 'success', text: 'Job posted successfully.' });
    await fetchJobs();
    setPosting(false);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs selectors */}
      <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Manage Jobs
        </button>
        <button
          onClick={() => setActiveTab('applicants')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'applicants' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Candidate Applications
        </button>
      </div>

      {activeTab === 'jobs' ? (
        <>
          <Section title="Post a Job" icon={<Briefcase className="w-5 h-5 text-blue-600" />}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Total jobs posted by {company?.name || 'company'}:{' '}
                <span className="font-semibold text-slate-800">{jobs.length}</span>
              </p>
            </div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Type the job description..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm text-slate-700"
            />
            {policyBlocked && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  The live database needs the job-posting SQL applied.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(jobPolicyFixSql);
                      setMessage({
                        type: 'success',
                        text: 'SQL fix copied. Paste it into Supabase SQL Editor and run it once.',
                      });
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
                  >
                    <Clipboard className="w-4 h-4" />
                    Copy SQL Fix
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={postJob}
              disabled={posting || !description.trim()}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {posting ? 'Posting...' : 'Post Job'}
            </button>
          </Section>

          <Section title="Posted Jobs" icon={<FileListIcon />}>
            {loading ? (
              <LoadingBlock label="Loading posted jobs..." />
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No jobs posted yet.</div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{company?.name || 'Company'}</p>
                        <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                          {job.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-3">
                          Posted {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      ) : (
        <Section title="Applications Review" icon={<Users className="w-5 h-5 text-blue-600" />}>
          {loadingApps ? (
            <LoadingBlock label="Loading applicants..." />
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No applications submitted yet for your job postings.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-900 text-base">
                        {app.profile?.name || 'Applicant'}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          app.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700'
                            : app.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {app.status === 'pending' ? 'Reviewing' : app.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">
                      Applied for: {app.job?.title || 'Job contract'}
                    </p>
                    <p className="text-sm text-slate-600 font-medium">
                      Target Salary: $
                      {app.job
                        ? `${app.job.pay_min?.toLocaleString()} - ${app.job.pay_max?.toLocaleString()}`
                        : '1,000'}
                    </p>
                    <p className="text-sm text-slate-600 bg-white p-3 border border-slate-100 rounded-lg mt-2">
                      Cover Letter: "{app.cover_letter}"
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Received: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex gap-2 self-start flex-shrink-0">
                      <button
                        onClick={() => handleApplicationStatus(app.id, 'accepted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Accept & Lock Escrow
                      </button>
                      <button
                        onClick={() => handleApplicationStatus(app.id, 'rejected')}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

function CompanyEmployees({ company }: { company: Company | null }) {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [company?.id]);

  const fetchEmployees = async () => {
    if (!company?.id || company.id.startsWith('sample')) {
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('employees').select('*').eq('company_id', company.id);
    const userIds = [...new Set((data || []).map((item) => item.user_id))];
    const { data: profiles } = userIds.length ? await supabase.from('profiles').select('*').in('user_id', userIds) : { data: [] };
    const profilesByUserId = (profiles || []).reduce<Record<string, Profile>>((acc, item) => {
      acc[item.user_id] = item;
      return acc;
    }, {});
    setEmployees((data || []).map((item) => ({ ...item, profile: profilesByUserId[item.user_id] })) as EmployeeRow[]);
    setLoading(false);
  };

  return (
    <Section title="Employees" icon={<Users className="w-5 h-5 text-blue-600" />}>
      {loading ? (
        <LoadingBlock label="Loading employees..." />
      ) : employees.length === 0 ? (
        <div className="p-8 text-center text-slate-500">No employees found for this company.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Department</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Position</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Rating</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 font-medium text-slate-800">{employee.profile?.name || 'Employee'}</td>
                  <td className="py-3 px-4 text-slate-600">{employee.department || 'Not set'}</td>
                  <td className="py-3 px-4 text-slate-600">{employee.position || 'Not set'}</td>
                  <td className="py-3 px-4 text-slate-600">{(employee.rating || 0).toFixed(1)}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setSelectedEmployee(employee)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedEmployee && (
        <Modal title={selectedEmployee.profile?.name || 'Employee Details'} onClose={() => setSelectedEmployee(null)}>
          <InfoGrid items={[
            { label: 'Employee Code', value: selectedEmployee.employee_code || 'Not set' },
            { label: 'Department', value: selectedEmployee.department || 'Not set' },
            { label: 'Position', value: selectedEmployee.position || 'Not set' },
            { label: 'Rating', value: `${(selectedEmployee.rating || 0).toFixed(1)} / 5` },
            { label: 'Sales Target', value: `${selectedEmployee.sales_target || 0}%` },
            { label: 'Sales Achieved', value: `${selectedEmployee.sales_achieved || 0}%` },
            { label: 'Phone', value: selectedEmployee.profile?.phone || 'Not shared' },
            { label: 'Location', value: selectedEmployee.profile?.location || 'Not shared' },
          ]} />
        </Modal>
      )}
    </Section>
  );
}

function CompanyPayments({ company }: { company: Company | null }) {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [disputingEscrow, setDisputingEscrow] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    if (!company?.id) return;
    setLoading(true);
    setError('');
    try {
      // Fetch escrows
      const { data: escrowsData, error: escrowsError } = await supabase
        .from('escrow_wallets')
        .select('*, job:jobs(title), student:students(user_id, college)')
        .eq('company_id', company.id);

      if (escrowsError) throw escrowsError;

      // Fetch student profiles for escrows
      const userIds = [...new Set((escrowsData || []).map(esc => esc.student?.user_id).filter(Boolean))];
      const { data: studentProfiles } = userIds.length
        ? await supabase.from('profiles').select('*').in('user_id', userIds)
        : { data: [] };

      const profilesByUserId = (studentProfiles || []).reduce<Record<string, Profile>>((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      setEscrows((escrowsData || []).map(esc => ({
        ...esc,
        studentProfile: esc.student ? profilesByUserId[esc.student.user_id] : undefined
      })));

      // Fetch ledger
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('wallet_ledger')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (ledgerError) throw ledgerError;
      setLedger(ledgerData || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading payments details. Running in local simulation mode.');
      setEscrows([
        { id: 'mock-escrow-1', amount: 500, status: 'completed', job: { title: 'React Dashboard UI' }, studentProfile: { name: 'Aarav Mehta' }, student_work_notes: 'Code uploaded to repo.' }
      ]);
      setLedger([
        { id: 'mock-ledger-1', amount: 10000, transaction_type: 'deposit', status: 'completed', created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [company?.id]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount to deposit.');
      return;
    }
    if (!company?.id) return;

    setDepositing(true);
    const { error: depositError } = await supabase.rpc('deposit_company_funds', {
      p_company_id: company.id,
      p_amount: amt
    });

    if (depositError) {
      setError(depositError.message || 'Mock deposit failed.');
      // Local simulation top up
      if (company) {
        company.balance = (company.balance ?? 10000) + amt;
      }
      setSuccess(`Deposit of $${amt.toLocaleString()} simulated successfully.`);
      setDepositAmount('');
      fetchData();
    } else {
      setSuccess(`Deposit of $${amt.toLocaleString()} processed successfully.`);
      setDepositAmount('');
      // Force page update
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
    setDepositing(false);
  };

  const handleFundEscrow = async (escrowId: string) => {
    setError('');
    setSuccess('');
    const escrowToFund = escrows.find(esc => esc.id === escrowId);
    if (!escrowToFund) return;

    const currentBalance = company?.balance ?? 10000;
    if (currentBalance < escrowToFund.amount) {
      setError('Insufficient available balance. Deposit funds first.');
      return;
    }

    const { error: fundError } = await supabase.rpc('fund_escrow_wallet', {
      p_escrow_id: escrowId
    });

    if (fundError) {
      setError(fundError.message || 'Failed to fund escrow contract.');
      // Local simulation
      setEscrows(prev => prev.map(esc => esc.id === escrowId ? { ...esc, status: 'funded' } : esc));
      if (company) {
        company.balance = (company.balance ?? 10000) - escrowToFund.amount;
      }
      setSuccess('Fund locked contract simulated successfully.');
    } else {
      setSuccess('Contract funded successfully. Amount locked in escrow.');
      fetchData();
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    setError('');
    setSuccess('');
    const { error: releaseError } = await supabase.rpc('approve_escrow_release', {
      p_escrow_id: escrowId
    });

    if (releaseError) {
      setError(releaseError.message || 'Failed to release escrow contract.');
      // Local simulation
      setEscrows(prev => prev.map(esc => esc.id === escrowId ? { ...esc, status: 'released' } : esc));
      setSuccess('Escrow release simulated successfully.');
    } else {
      setSuccess('Funds released to student wallet available balance.');
      fetchData();
    }
  };

  const handleDispute = async () => {
    if (!disputingEscrow) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    const { error: disputeError } = await supabase.rpc('dispute_escrow_wallet', {
      p_escrow_id: disputingEscrow,
      p_reason: disputeReason
    });

    if (disputeError) {
      setError(disputeError.message || 'Failed to dispute contract.');
      // Local simulation
      setEscrows(prev => prev.map(esc => esc.id === disputingEscrow ? { ...esc, status: 'disputed', dispute_reason: disputeReason } : esc));
      setSuccess('Dispute raised. Simulated locally.');
      setDisputingEscrow(null);
    } else {
      setSuccess('Dispute raised successfully. Arbitrated by HR Administrator.');
      setDisputeReason('');
      setDisputingEscrow(null);
      fetchData();
    }
    setSubmitting(false);
  };

  const corporateBalance = company?.balance ?? 10000;
  const lockedInEscrow = escrows
    .filter(esc => esc.status === 'funded' || esc.status === 'completed' || esc.status === 'disputed')
    .reduce((sum, esc) => sum + Number(esc.amount), 0);
  const totalPaid = ledger
    .filter(log => log.transaction_type === 'escrow_release')
    .reduce((sum, log) => sum + Math.abs(Number(log.amount)), 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {/* Corporate Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="text-sm text-teal-100 font-medium">Corporate Balance (Available)</div>
          <div className="text-3xl font-bold mt-2">${corporateBalance.toLocaleString()}</div>
          <p className="text-xs text-teal-200 mt-2">Funds available for contract funding</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <div className="text-sm text-indigo-100 font-medium">Locked in Escrow</div>
          <div className="text-3xl font-bold mt-2">${lockedInEscrow.toLocaleString()}</div>
          <p className="text-xs text-indigo-200 mt-2">Held securely for candidate jobs</p>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-md p-6 text-white">
          <div className="text-sm text-slate-200 font-medium">Total Released Payouts</div>
          <div className="text-3xl font-bold mt-2">${totalPaid.toLocaleString()}</div>
          <p className="text-xs text-slate-300 mt-2">Settled contracts payment total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit simulated funds */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 self-start">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Corporate Wallet Deposit
          </h3>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Simulate depositing additional funds into your SaaS Corporate balance.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Deposit Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="1000"
                  min={1}
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={depositing || !depositAmount}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {depositing ? 'Processing...' : 'Deposit Funds'}
            </button>
          </form>
        </div>

        {/* Corporate Escrows List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Corporate Escrow Contracts
            </h3>

            {loading ? (
              <div className="py-6 text-center text-slate-500">Loading escrow contracts...</div>
            ) : escrows.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No active contracts for your job postings. Accept applicants to start.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {escrows.map((escrow) => (
                  <div key={escrow.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{escrow.job?.title || 'Contract Assignment'}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">Candidate: {escrow.studentProfile?.name || 'Applicant'}</p>
                        <p className="text-xs text-slate-400 mt-1">Updated: {new Date(escrow.updated_at || escrow.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800">${Number(escrow.amount).toLocaleString()}</p>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-1.5 ${
                          escrow.status === 'released' ? 'bg-emerald-50 text-emerald-700' :
                          escrow.status === 'funded' ? 'bg-blue-50 text-blue-700' :
                          escrow.status === 'completed' ? 'bg-indigo-50 text-indigo-700' :
                          escrow.status === 'disputed' ? 'bg-red-50 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {escrow.status === 'pending_funding' && 'Funding Needed'}
                          {escrow.status === 'funded' && 'Funded (In Progress)'}
                          {escrow.status === 'completed' && 'Work Review Pending'}
                          {escrow.status === 'released' && 'Released'}
                          {escrow.status === 'disputed' && 'Disputed'}
                          {escrow.status === 'refunded' && 'Refunded'}
                        </span>
                      </div>
                    </div>

                    {/* Escrow Work Deliverables Display */}
                    {escrow.student_work_notes && (
                      <div className="mt-3 bg-white p-3 border border-slate-200 rounded-lg text-xs">
                        <p className="font-semibold text-slate-700">Submitted Work notes:</p>
                        <p className="text-slate-600 mt-1">"{escrow.student_work_notes}"</p>
                      </div>
                    )}

                    {/* Action buttons based on status */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {escrow.status === 'pending_funding' && (
                        <button
                          type="button"
                          onClick={() => handleFundEscrow(escrow.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Lock & Fund Contract (${Number(escrow.amount).toLocaleString()})
                        </button>
                      )}
                      {escrow.status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleReleaseEscrow(escrow.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Approve & Release Funds
                        </button>
                      )}
                      {(escrow.status === 'funded' || escrow.status === 'completed') && (
                        <button
                          type="button"
                          onClick={() => setDisputingEscrow(escrow.id)}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Dispute Deliverables
                        </button>
                      )}
                      {escrow.status === 'disputed' && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg w-full mt-2 text-xs">
                          <p className="font-semibold text-red-900">Disputed Reason</p>
                          <p className="text-red-700 mt-1">"{escrow.dispute_reason}"</p>
                          <p className="text-slate-500 mt-2">Awaiting HR/Admin arbitration resolution.</p>
                        </div>
                      )}
                      {escrow.status === 'released' && (
                        <p className="text-xs text-emerald-700 font-medium">Funds successfully transferred to Student available balance.</p>
                      )}
                      {escrow.status === 'refunded' && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg w-full mt-2 text-xs">
                          <p className="font-semibold text-slate-800">Contract Refunded</p>
                          <p className="text-slate-600 mt-1">Arbitration Notes: "{escrow.resolution_notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Ledger for Company */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Corporate Ledger History
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left py-2.5 px-4 text-slate-500 font-semibold">Transaction Type</th>
                    <th className="text-left py-2.5 px-4 text-slate-500 font-semibold">Date</th>
                    <th className="text-left py-2.5 px-4 text-slate-500 font-semibold">Status</th>
                    <th className="text-right py-2.5 px-4 text-slate-500 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledger.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {log.transaction_type === 'escrow_lock' && 'Escrow Fund Locked'}
                        {log.transaction_type === 'escrow_release' && 'Escrow Release Credit'}
                        {log.transaction_type === 'escrow_refund' && 'Escrow Refund Credit'}
                        {log.transaction_type === 'withdrawal' && 'Funds Withdrawn'}
                        {log.transaction_type === 'deposit' && 'Wallet Deposit'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {log.status || 'Completed'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${Number(log.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {Number(log.amount) >= 0 ? `+$${Number(log.amount).toLocaleString()}` : `-$${Math.abs(Number(log.amount)).toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {disputingEscrow && (
        <Modal title="Dispute Contract Deliverables" onClose={() => setDisputingEscrow(null)}>
          <div className="space-y-4">
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-700">This locks the contract amount in dispute. An HR Administrator will arbitrate by evaluating submitted notes.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Reason for Dispute</label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
                placeholder="Explain why you are disputing the work quality or deliverables..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisputingEscrow(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispute}
                disabled={submitting || !disputeReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Raising Dispute...' : 'Confirm Dispute'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}




function LineGraph({ data, companies, metric }: { data: MarketAnalytics[]; companies: Company[]; metric: MetricKey }) {
  const chart = useMemo(() => {
    const width = 900;
    const height = 320;
    const padding = { top: 24, right: 24, bottom: 42, left: 58 };
    const values = data.map((item) => Number(item[metric]) || 0);
    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);
    const range = max - min || 1;
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const dates = [...new Set(data.map((item) => item.date))].sort();
    const companyData = companies.map((company) => ({
      company,
      points: data
        .filter((item) => item.company_id === company.id)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((item, index, items) => {
          const x = padding.left + (index * innerWidth) / Math.max(items.length - 1, 1);
          const y = padding.top + innerHeight * (1 - ((Number(item[metric]) || 0) - min) / range);
          return { x, y, value: Number(item[metric]) || 0 };
        }),
    }));
    return { width, height, padding, innerWidth, innerHeight, min, max, dates, companyData };
  }, [data, companies, metric]);

  if (data.length === 0) return <LoadingBlock label="No analysis data available for this selection." />;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="min-w-[720px] w-full h-80">
        {[0, 1, 2, 3, 4].map((line) => {
          const y = chart.padding.top + (line * chart.innerHeight) / 4;
          const value = chart.max - ((chart.max - chart.min) * line) / 4;
          return (
            <g key={line}>
              <line x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={y} y2={y} stroke="#e2e8f0" />
              <text x={chart.padding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[12px]">{value.toFixed(1)}{metricSuffix[metric]}</text>
            </g>
          );
        })}
        {chart.companyData.map(({ company, points }, companyIndex) => (
          <g key={company.id}>
            <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={colors[companyIndex % colors.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r="5" fill="#fff" stroke={colors[companyIndex % colors.length]} strokeWidth="2" />
            ))}
          </g>
        ))}
        {chart.dates.slice(0, 6).map((date, index, labels) => {
          const x = chart.padding.left + (index * chart.innerWidth) / Math.max(labels.length - 1, 1);
          return <text key={date} x={x} y={chart.height - 14} textAnchor="middle" className="fill-slate-400 text-[12px]">{new Date(date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</text>;
        })}
      </svg>
    </div>
  );
}

function GraphLegend({ companies }: { companies: Company[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 mt-5 pt-5 border-t border-slate-100">
      {companies.map((company, index) => (
        <div key={company.id} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
          <span className="text-sm text-slate-600">{company.name}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">{icon}{title}</h3>
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">{icon}</div>
      <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Close"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return <div className="h-64 flex items-center justify-center text-slate-500">{label}</div>;
}

function FileListIcon() {
  return <Briefcase className="w-5 h-5 text-blue-600" />;
}

function generateSampleAnalytics(companyIds: string[]) {
  const now = new Date();
  const out: MarketAnalytics[] = [];
  companyIds.forEach((companyId, companyIndex) => {
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const base = companyIndex * 8 + (6 - i) * 3;
      out.push({
        id: `sample-${companyId}-${i}`,
        company_id: companyId,
        date: date.toISOString(),
        revenue: 18 + base + Math.round(Math.random() * 5),
        spending: 8 + base / 2 + Math.round(Math.random() * 4),
        market_share: 4 + companyIndex * 2 + (6 - i) * 0.5,
        customer_satisfaction: 72 + companyIndex * 3 + (6 - i) * 1.8,
        employee_satisfaction: 70 + companyIndex * 2 + (6 - i) * 1.6,
        growth_rate: 2 + companyIndex + (6 - i) * 0.8,
      } as MarketAnalytics);
    }
  });
  return out;
}
