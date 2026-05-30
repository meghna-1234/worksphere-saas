import { ReactNode, useEffect, useMemo, useState } from 'react';
import { supabase, Application, Company, Employee, Job, Post, Profile, Student } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Award,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Star,
  Target,
  TrendingUp,
  User2,
  X,
  Zap,
} from 'lucide-react';

export type StudentTab = 'dashboard' | 'profile' | 'recommendations' | 'jobs' | 'payments';

type StudentProfileData = Student & {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  gpa?: number;
  major?: string;
  achievements?: string[];
  projects?: Array<{ title: string; description: string; link?: string }>;
  experience?: Array<{ title: string; company: string; duration: string; description?: string }>;
  languages?: Array<{ language: string; proficiency: string; level: number }>;
  careerInterests?: string[];
  socialLinks?: { linkedin?: string; github?: string; twitter?: string };
  resume?: string;
};

type EmployeeWithProfile = Employee & { profile?: Profile; company?: Company };
type StudentPost = Post & { comments?: number; likes?: number };
type RecommendedJob = Job & {
  company?: Company;
  matchSkills: string[];
  missingSkills: string[];
  matchPercent: number;
};

const fallbackStudent = {
  id: 'local-student',
  skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js'],
  college: 'State University',
  degree: 'B.Sc. Computer Science',
  year_of_study: 3,
  availability: 'Open to internships and part-time remote work',
  preferred_hours: 20,
  weekend_available: true,
  rating: 4.7,
  total_earnings: 2450,
  name: 'Student',
  phone: '+1 555 0100',
  location: 'Remote',
  bio: 'Frontend-focused student building SaaS products and data-rich interfaces.',
  website: 'https://portfolio.example.com',
  gpa: 3.8,
  major: 'Computer Science',
  achievements: ['AWS Certified Developer', 'Google Cloud Associate', "Dean's List"],
  projects: [
    { title: 'AI Learning Platform', description: 'Adaptive tutoring app with React and analytics.', link: 'https://example.com/project/ai-learning' },
    { title: 'Task Management App', description: 'Collaborative project tracker with real-time updates.', link: 'https://example.com/project/tasks' },
  ],
  experience: [
    { title: 'Frontend Developer Intern', company: 'TechCorp', duration: 'Jun 2024 - Present', description: 'Built responsive product workflows.' },
  ],
  languages: [
    { language: 'English', proficiency: 'Fluent', level: 100 },
    { language: 'Spanish', proficiency: 'Intermediate', level: 65 },
  ],
  careerInterests: ['Frontend Developer', 'Full-Stack Developer', 'SaaS', 'AI tools'],
  socialLinks: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    twitter: 'https://x.com',
  },
  resume: 'https://example.com/resume.pdf',
} as StudentProfileData;

const fallbackJobs: RecommendedJob[] = [
  {
    id: 'sample-job-1',
    company_id: 'sample-company-1',
    title: 'Frontend Developer Intern',
    description: 'Build customer-facing dashboards with React and TypeScript.',
    requirements: ['React', 'TypeScript', 'CSS'],
    job_type: 'internship',
    department: 'Product Engineering',
    location: 'Remote',
    pay_min: 25,
    pay_max: 35,
    pay_type: 'hourly',
    skills_required: ['React', 'TypeScript', 'CSS'],
    status: 'active',
    applications_count: 22,
    created_at: new Date().toISOString(),
    company: { id: 'sample-company-1', name: 'TechCorp', industry: 'SaaS' } as Company,
    matchSkills: [],
    missingSkills: [],
    matchPercent: 0,
  },
  {
    id: 'sample-job-2',
    company_id: 'sample-company-2',
    title: 'Full-Stack Developer',
    description: 'Work on APIs, UI components, and analytics workflows.',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    job_type: 'full-time',
    department: 'Engineering',
    location: 'Austin, TX',
    pay_min: 90000,
    pay_max: 125000,
    pay_type: 'fixed',
    skills_required: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    status: 'active',
    applications_count: 41,
    created_at: new Date().toISOString(),
    company: { id: 'sample-company-2', name: 'StartUp Labs', industry: 'Technology' } as Company,
    matchSkills: [],
    missingSkills: [],
    matchPercent: 0,
  },
];

export function StudentProfile({ activePage = 'profile' }: { activePage?: StudentTab }) {
  const { profile, user } = useAuth();
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [posts, setPosts] = useState<StudentPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [user?.id]);

  const fetchStudentData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const activeStudent = {
      ...fallbackStudent,
      ...(studentData || {}),
      name: profile?.name || fallbackStudent.name,
      phone: profile?.phone || fallbackStudent.phone,
      location: profile?.location || fallbackStudent.location,
      bio: profile?.bio || fallbackStudent.bio,
    } as StudentProfileData;

    setStudent(activeStudent);

    const [{ data: postData }, { data: appData }] = await Promise.all([
      supabase.from('posts').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
      studentData?.id
        ? supabase.from('applications').select('*').eq('student_id', studentData.id).order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);

    setPosts((postData || []) as StudentPost[]);
    setApplications((appData || []) as Application[]);
    setLoading(false);
  };

  const profileStrength = useMemo(() => {
    if (!student) return 0;
    const checks = [
      student.phone,
      student.location,
      student.college,
      student.degree,
      student.skills?.length,
      student.certifications?.length || student.achievements?.length,
      student.projects?.length,
      student.resume,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [student]);

  if (loading && !student) {
    return <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Loading student module...</div>;
  }

  return (
    <div className="space-y-6">
      {activePage === 'dashboard' && <StudentDashboard student={student} posts={posts} />}
      {activePage === 'profile' && <StudentProfileView profile={profile} student={student} posts={posts} profileStrength={profileStrength} />}
      {activePage === 'recommendations' && <RecommendationsSection student={student} />}
      {activePage === 'jobs' && (
        <JobBoard
          student={student}
          profileStrength={profileStrength}
          applications={applications}
          onApplicationSubmitted={fetchStudentData}
        />
      )}
      {activePage === 'payments' && <PaymentSection student={student as Student | null} />}
    </div>
  );
}

function StudentDashboard({ student, posts }: { student: StudentProfileData | null; posts: StudentPost[] }) {
  const activeProjects = student?.projects?.filter((_, index) => index === 0).length || 1;
  const completedProjects = Math.max((student?.projects?.length || 2) - activeProjects, 1);
  const activityStatus = posts.length > 0 ? `Active - ${posts.length} posts shared` : 'Active - building profile';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard icon={<Briefcase className="w-6 h-6" />} label="Active Projects" value={String(activeProjects)} tone="blue" />
      <MetricCard icon={<CheckCircle className="w-6 h-6" />} label="Completed Projects" value={String(completedProjects)} tone="emerald" />
      <MetricCard icon={<Clock className="w-6 h-6" />} label="Activity Status" value={activityStatus} tone="amber" />
    </div>
  );
}

function StudentProfileView({
  profile,
  student,
  posts,
  profileStrength,
}: {
  profile: Profile | null;
  student: StudentProfileData | null;
  posts: StudentPost[];
  profileStrength: number;
}) {
  const skills = student?.skills?.length ? student.skills : fallbackStudent.skills;
  const certificates = student?.certifications?.length ? student.certifications : student?.achievements || fallbackStudent.achievements || [];
  const projects = student?.projects?.length ? student.projects : fallbackStudent.projects || [];
  const languages = student?.languages?.length ? student.languages : fallbackStudent.languages || [];
  const experience = student?.experience?.length ? student.experience : fallbackStudent.experience || [];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-sm p-6 text-white">
        <h1 className="text-3xl font-bold">{profile?.name || student?.name || 'Student Profile'}</h1>
        <p className="text-blue-50 mt-1">{student?.college || 'Add college'} • {student?.degree || 'Add degree'}</p>
      </div>

      <Section title="Contact Information" icon={<Mail className="w-5 h-5 text-blue-600" />}>
        <InfoGrid items={[
          { label: 'Email/User ID', value: profile?.user_id || 'Linked account' },
          { label: 'Phone', value: student?.phone || 'Not added', icon: <Phone className="w-4 h-4" /> },
          { label: 'Location', value: student?.location || 'Not added', icon: <MapPin className="w-4 h-4" /> },
          { label: 'Portfolio', value: student?.website || 'Not added', icon: <Globe className="w-4 h-4" /> },
        ]} />
      </Section>

      <Section title="Academic Information" icon={<GraduationCap className="w-5 h-5 text-blue-600" />}>
        <InfoGrid items={[
          { label: 'College', value: student?.college || 'Not added' },
          { label: 'Degree', value: student?.degree || 'Not added' },
          { label: 'Year', value: student?.year_of_study ? `Year ${student.year_of_study}` : 'Not added' },
          { label: 'GPA', value: student?.gpa ? student.gpa.toFixed(2) : 'Not added' },
        ]} />
      </Section>

      <Section title="Skills and Expertise" icon={<Zap className="w-5 h-5 text-yellow-500" />}>
        <ChipList items={skills} tone="blue" />
      </Section>

      <Section title="Achievements and Certificates" icon={<Award className="w-5 h-5 text-amber-500" />}>
        <ViewableList items={certificates.map((title) => ({ title, action: 'View Certificate' }))} />
      </Section>

      <Section title="Featured Projects" icon={<Briefcase className="w-5 h-5 text-purple-600" />}>
        <ViewableList items={projects.map((project) => ({ title: project.title, description: project.description, href: project.link, action: 'View Project' }))} />
      </Section>

      <Section title="User Posts" icon={<MessageSquare className="w-5 h-5 text-slate-600" />}>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">No posts created yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" /> {post.likes_count || 0} likes</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.comments_count || 0} comments</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Languages and Proficiency" icon={<Globe className="w-5 h-5 text-green-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {languages.map((lang) => (
            <div key={lang.language} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between text-sm font-medium text-slate-800">
                <span>{lang.language}</span>
                <span>{lang.proficiency}</span>
              </div>
              <div className="mt-2 h-2 bg-slate-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: `${lang.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Work Experience" icon={<Briefcase className="w-5 h-5 text-indigo-600" />}>
        <ViewableList items={experience.map((item) => ({ title: `${item.title} - ${item.company}`, description: `${item.duration}. ${item.description || ''}`, action: 'View Experience' }))} />
      </Section>

      <Section title="Career Interests and Preferences" icon={<Target className="w-5 h-5 text-emerald-600" />}>
        <ChipList items={student?.careerInterests?.length ? student.careerInterests : fallbackStudent.careerInterests || []} tone="emerald" />
      </Section>

      <Section title="Availability" icon={<Clock className="w-5 h-5 text-green-600" />}>
        <InfoGrid items={[
          { label: 'Status', value: student?.availability || fallbackStudent.availability || 'Flexible' },
          { label: 'Preferred Hours', value: `${student?.preferred_hours || 20} hours/week` },
          { label: 'Weekend Availability', value: student?.weekend_available ? 'Available' : 'Not available' },
        ]} />
      </Section>

      <Section title="Resume and Documents" icon={<Download className="w-5 h-5 text-purple-600" />}>
        <ViewableList items={[
          { title: 'Resume', description: 'Latest resume document', href: student?.resume || fallbackStudent.resume, action: 'View Resume' },
          { title: 'Academic Transcript', description: 'Student academic document', action: 'View Document' },
        ]} />
      </Section>

      <Section title="Social and Professional Links" icon={<Globe className="w-5 h-5 text-slate-600" />}>
        <ViewableList items={[
          { title: 'LinkedIn', href: student?.socialLinks?.linkedin || fallbackStudent.socialLinks?.linkedin, action: 'Open Link' },
          { title: 'GitHub', href: student?.socialLinks?.github || fallbackStudent.socialLinks?.github, action: 'Open Link' },
          { title: 'Twitter/X', href: student?.socialLinks?.twitter || fallbackStudent.socialLinks?.twitter, action: 'Open Link' },
        ]} />
      </Section>

      <Section title="Performance Analysis" icon={<BarChart3 className="w-5 h-5 text-teal-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MetricCard icon={<Star className="w-5 h-5" />} label="Rating" value={`${student?.rating || 0}/5`} tone="amber" />
          <MetricCard icon={<TrendingUp className="w-5 h-5" />} label="Profile Strength" value={`${profileStrength}%`} tone="emerald" />
          <MetricCard icon={<MessageSquare className="w-5 h-5" />} label="Posts" value={String(posts.length)} tone="blue" />
        </div>
      </Section>
    </div>
  );
}

function RecommendationsSection({ student }: { student: StudentProfileData | null }) {
  const [employees, setEmployees] = useState<EmployeeWithProfile[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from('employees').select('*').limit(6);
      if (!data || data.length === 0) {
        setEmployees([
          {
            id: 'emp-1',
            position: 'Product Engineer',
            profile: { name: 'Maya Chen', phone: '+1 555 0190', location: 'Seattle' },
            company: { name: 'TechCorp' },
          } as any,
          {
            id: 'emp-2',
            position: 'Data Analyst',
            profile: { name: 'Ravi Mehta', phone: '+1 555 0133', location: 'Austin' },
            company: { name: 'DataFlow' },
          } as any,
        ]);
        return;
      }

      const userIds = [...new Set(data.map((employee) => employee.user_id))];
      const companyIds = [...new Set(data.map((employee) => employee.company_id))];
      const [{ data: profilesData }, { data: companiesData }] = await Promise.all([
        supabase.from('profiles').select('*').in('user_id', userIds),
        supabase.from('companies').select('*').in('id', companyIds),
      ]);
      const profilesByUserId = (profilesData || []).reduce<Record<string, Profile>>((acc, item) => {
        acc[item.user_id] = item;
        return acc;
      }, {});
      const companiesById = (companiesData || []).reduce<Record<string, Company>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      setEmployees(data.map((employee) => ({
        ...employee,
        profile: profilesByUserId[employee.user_id],
        company: companiesById[employee.company_id],
      })) as any);
    };

    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <Section title="Top Employees from Different Companies" icon={<User2 className="w-5 h-5 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((employee) => (
            <div key={employee.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="font-semibold text-slate-900">{employee.profile?.name || 'Employee'}</p>
              <p className="text-sm text-slate-600">{employee.company?.name || 'Company'} • {employee.position || 'Role not shared'}</p>
              <ChipList items={['Leadership', 'Mentorship', employee.position || 'Operations']} tone="blue" />
              <p className="text-sm text-slate-600 mt-3">Contact: {employee.profile?.phone || employee.profile?.location || 'Not shared'}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recommendation Status" icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}>
        <InfoGrid items={[
          { label: 'Requests Sent', value: '3' },
          { label: 'Received', value: '2' },
          { label: 'Pending', value: '1' },
        ]} />
      </Section>

      <Section title="Top Endorsed Skills" icon={<Zap className="w-5 h-5 text-yellow-500" />}>
        <div className="space-y-3">
          {(student?.skills?.length ? student.skills : fallbackStudent.skills).slice(0, 5).map((skill, index) => (
            <div key={skill} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-900">{skill}</span>
              <span className="text-sm text-slate-600">{145 - index * 17} endorsements</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Request a Recommendation" icon={<Send className="w-5 h-5 text-blue-600" />}>
        <div className="space-y-3">
          <input type="email" placeholder="Enter recommender email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea rows={3} placeholder="Add a personal message" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Send Request</button>
        </div>
      </Section>
    </div>
  );
}

function JobBoard({
  student,
  profileStrength,
  applications,
  onApplicationSubmitted,
}: {
  student: StudentProfileData | null;
  profileStrength: number;
  applications: Application[];
  onApplicationSubmitted: () => void;
}) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const studentSkills = useMemo(() => (student?.skills?.length ? student.skills : fallbackStudent.skills).map((skill) => skill.toLowerCase()), [student]);

  useEffect(() => {
    fetchJobs();
  }, [student?.skills?.join('|')]);

  const scoreJob = (job: Job & { company?: Company }): RecommendedJob => {
    const required = job.skills_required?.length ? job.skills_required : job.requirements || [];
    const matchSkills = required.filter((skill) => studentSkills.includes(skill.toLowerCase()));
    const missingSkills = required.filter((skill) => !studentSkills.includes(skill.toLowerCase()));
    return {
      ...job,
      matchSkills,
      missingSkills,
      matchPercent: required.length ? Math.round((matchSkills.length / required.length) * 100) : 0,
    };
  };

  const fetchJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('status', 'active')
      .limit(30);

    const scored = ((data && data.length ? data : fallbackJobs) as any[])
      .map(scoreJob)
      .filter((job) => job.matchSkills.length > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent);

    setJobs(scored);
  };

  const applyToJob = async (job: RecommendedJob) => {
    setMessage(null);
    setApplyingJobId(job.id);

    if (!user || !student?.id) {
      setMessage({ type: 'error', text: 'Complete your student profile before applying.' });
      setApplyingJobId(null);
      return;
    }

    const alreadyApplied = applications.some((application) => application.job_id === job.id);
    if (alreadyApplied) {
      setMessage({ type: 'error', text: 'You have already applied to this job.' });
      setApplyingJobId(null);
      return;
    }

    const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(job.id);
    if (uuidLike && student.id !== 'local-student') {
      const { error } = await supabase.from('applications').insert({
        job_id: job.id,
        student_id: student.id,
        status: 'pending',
        cover_letter: `Matched skills: ${job.matchSkills.join(', ')}`,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Unable to submit application.' });
        setApplyingJobId(null);
        return;
      }
    }

    setSelectedJob(job);
    setMessage({ type: 'success', text: `Application started for ${job.title}. Follow the procedure below.` });
    onApplicationSubmitted();
    setApplyingJobId(null);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={<Briefcase className="w-5 h-5" />} label="Matching Jobs" value={String(jobs.length)} tone="blue" />
        <MetricCard icon={<Send className="w-5 h-5" />} label="Applications Submitted" value={String(applications.length)} tone="purple" />
        <MetricCard icon={<TrendingUp className="w-5 h-5" />} label="Profile Strength" value={`${profileStrength}%`} tone="emerald" />
        <MetricCard icon={<DollarSign className="w-5 h-5" />} label="Salary Insights" value={jobs[0] ? formatSalary(jobs[0]) : 'No data'} tone="amber" />
      </div>

      <Section title="Recommended Jobs" icon={<Briefcase className="w-5 h-5 text-blue-600" />}>
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-500">No recommended jobs match your current skills. Add more skills to improve recommendations.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                      <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">{job.matchPercent}% Match</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{job.company?.name || 'Company'} • {job.location || 'Location flexible'} • {formatSalary(job)}</p>
                    <p className="text-sm text-slate-700 mt-3">{job.description || 'Recommended based on your student profile skills.'}</p>
                  </div>
                  <button
                    onClick={() => applyToJob(job)}
                    disabled={applyingJobId === job.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {applyingJobId === job.id ? 'Applying...' : 'Apply'}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Matched Skills</p>
                    <ChipList items={job.matchSkills} tone="emerald" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Skills to Build</p>
                    <ChipList items={job.missingSkills.length ? job.missingSkills : ['All required skills matched']} tone="amber" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {selectedJob && (
        <Section title="Application Procedure" icon={<FileText className="w-5 h-5 text-indigo-600" />}>
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{selectedJob.title} at {selectedJob.company?.name || 'Company'}</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Your profile and matched skills are attached to the application.</li>
              <li>The employer reviews your profile, posts, projects, and documents.</li>
              <li>You will receive an interview or document request notification if shortlisted.</li>
            </ol>
            <button onClick={() => setSelectedJob(null)} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" /> Close procedure
            </button>
          </div>
        </Section>
      )}

      <Section title="Job Alerts and Notifications" icon={<Bell className="w-5 h-5 text-red-500" />}>
        <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span>
            <span className="block font-medium text-slate-900">Notify me when new matching jobs are posted</span>
            <span className="block text-sm text-slate-600">Alerts use your profile skills and career preferences.</span>
          </span>
          <input type="checkbox" checked={alertsEnabled} onChange={(event) => setAlertsEnabled(event.target.checked)} className="w-5 h-5" />
        </label>
      </Section>
    </div>
  );
}

function PaymentSection({ student }: { student: Student | null }) {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [submittingWork, setSubmittingWork] = useState<string | null>(null);
  const [workNotes, setWorkNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [disputingEscrow, setDisputingEscrow] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    if (!student?.id) return;
    setLoading(true);
    setError('');
    try {
      const { data: escrowsData, error: escrowsError } = await supabase
        .from('escrow_wallets')
        .select('*, job:jobs(title), company:companies(name)')
        .eq('student_id', student.id);

      const { data: ledgerData, error: ledgerError } = await supabase
        .from('wallet_ledger')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      if (escrowsError) throw escrowsError;
      if (ledgerError) throw ledgerError;

      setEscrows(escrowsData || []);
      setLedger(ledgerData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading wallet data. Fallback to mock data.');
      setEscrows([
        { id: 'mock-escrow-1', amount: 500, status: 'funded', job: { title: 'React Dashboard UI' }, company: { name: 'TechCorp' }, created_at: new Date().toISOString() }
      ]);
      setLedger([
        { id: 'mock-ledger-1', amount: 500, transaction_type: 'escrow_lock', status: 'completed', created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [student?.id]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount to withdraw.');
      return;
    }
    const currentAvailable = student?.available_balance ?? 0;
    if (amt > currentAvailable) {
      setError('Insufficient available balance.');
      return;
    }

    setWithdrawing(true);
    const { error: withdrawError } = await supabase.rpc('withdraw_student_funds', {
      p_amount: amt
    });

    if (withdrawError) {
      setError(withdrawError.message);
    } else {
      setSuccess(`Withdrawal of $${amt.toLocaleString()} processed successfully.`);
      setWithdrawAmount('');
      fetchData();
    }
    setWithdrawing(false);
  };

  const handleWorkSubmit = async () => {
    if (!submittingWork) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    const { error: submitError } = await supabase.rpc('submit_escrow_work', {
      p_escrow_id: submittingWork,
      p_work_notes: workNotes
    });

    if (submitError) {
      setError(submitError.message || 'Failed to submit work. Database function might need configuration.');
      setEscrows(prev => prev.map(esc => esc.id === submittingWork ? { ...esc, status: 'completed', student_work_notes: workNotes } : esc));
      setSuccess('Work deliverables simulated successfully.');
      setSubmittingWork(null);
    } else {
      setSuccess('Work deliverables submitted successfully. Waiting for company approval.');
      setWorkNotes('');
      setSubmittingWork(null);
      fetchData();
    }
    setSubmitting(false);
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
      setError(disputeError.message || 'Failed to dispute escrow contract.');
      setEscrows(prev => prev.map(esc => esc.id === disputingEscrow ? { ...esc, status: 'disputed', dispute_reason: disputeReason } : esc));
      setSuccess('Escrow contract disputed. Simulated locally.');
      setDisputingEscrow(null);
    } else {
      setSuccess('Escrow contract disputed. HR Admin will arbitrate soon.');
      setDisputeReason('');
      setDisputingEscrow(null);
      fetchData();
    }
    setSubmitting(false);
  };

  const availableBal = student?.available_balance ?? 0;
  const pendingBal = student?.pending_balance ?? 0;
  const totalEarnings = student?.total_earnings ?? 0;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md p-6 text-white">
          <div className="text-sm text-emerald-100 font-medium">Available Balance (Withdrawable)</div>
          <div className="text-3xl font-bold mt-2">${availableBal.toLocaleString()}</div>
          <p className="text-xs text-emerald-200 mt-2">Funds cleared from completed work</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
          <div className="text-sm text-blue-100 font-medium">Pending Balance (Locked Escrow)</div>
          <div className="text-3xl font-bold mt-2">${pendingBal.toLocaleString()}</div>
          <p className="text-xs text-blue-200 mt-2">Secured in escrow for ongoing jobs</p>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-md p-6 text-white">
          <div className="text-sm text-slate-200 font-medium">Total Career Earnings</div>
          <div className="text-3xl font-bold mt-2">${totalEarnings.toLocaleString()}</div>
          <p className="text-xs text-slate-300 mt-2">Cumulative revenue on WorkSphere</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 self-start">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Withdraw Earnings
          </h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Payout Method</label>
              <select className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-700 outline-none">
                <option>Bank Transfer (Primary)</option>
                <option>UPI Transfer</option>
                <option>Digital Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Amount to Withdraw</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  max={availableBal}
                  min={1}
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={withdrawing || availableBal <= 0 || !withdrawAmount}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {withdrawing ? 'Processing...' : 'Request Payout'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Escrow Contracts
            </h3>

            {loading ? (
              <div className="py-6 text-center text-slate-500">Loading contracts...</div>
            ) : escrows.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No active escrow contracts. Apply for jobs to get started.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {escrows.map((escrow) => (
                  <div key={escrow.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{escrow.job?.title || 'Contract Assignment'}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">Partner: {escrow.company?.name || 'Company'}</p>
                        <p className="text-xs text-slate-400 mt-1">Status changed: {new Date(escrow.updated_at || escrow.created_at).toLocaleDateString()}</p>
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
                          {escrow.status === 'pending_funding' && 'Awaiting Funding'}
                          {escrow.status === 'funded' && 'Funded (In Progress)'}
                          {escrow.status === 'completed' && 'Work Submitted'}
                          {escrow.status === 'released' && 'Released'}
                          {escrow.status === 'disputed' && 'Disputed'}
                          {escrow.status === 'refunded' && 'Refunded'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {escrow.status === 'funded' && (
                        <button
                          type="button"
                          onClick={() => setSubmittingWork(escrow.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Submit Deliverables
                        </button>
                      )}
                      {(escrow.status === 'funded' || escrow.status === 'completed') && (
                        <button
                          type="button"
                          onClick={() => setDisputingEscrow(escrow.id)}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Raise Dispute
                        </button>
                      )}
                      {escrow.status === 'completed' && (
                        <p className="text-xs text-slate-500 italic mt-1">Waiting for company approval. Notes: "{escrow.student_work_notes}"</p>
                      )}
                      {escrow.status === 'disputed' && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg w-full mt-2">
                          <p className="text-xs font-semibold text-red-900">Dispute opened</p>
                          <p className="text-xs text-red-700 mt-1">Reason: "{escrow.dispute_reason}"</p>
                        </div>
                      )}
                      {escrow.status === 'released' && escrow.resolution_notes && (
                        <p className="text-xs text-slate-500 mt-2">HR resolution: "{escrow.resolution_notes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Financial Transaction Ledger
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
                        {log.transaction_type === 'escrow_refund' && 'Escrow Refund Deduct'}
                        {log.transaction_type === 'withdrawal' && 'Funds Withdrawn'}
                        {log.transaction_type === 'deposit' && 'Wallet Deposit'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {log.status || 'Completed'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${Number(log.amount) >= 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
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

      {submittingWork && (
        <Modal title="Submit Deliverables" onClose={() => setSubmittingWork(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Deliverables Notes / URL</label>
              <textarea
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                rows={4}
                placeholder="Include references, drive link or work execution summaries..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubmittingWork(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWorkSubmit}
                disabled={submitting || !workNotes.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Work'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {disputingEscrow && (
        <Modal title="Raise Escrow Dispute" onClose={() => setDisputingEscrow(null)}>
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
                placeholder="Explain why you are raising a dispute..."
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

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: 'blue' | 'emerald' | 'amber' | 'purple' }) {
  const toneClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div className={`rounded-xl border p-5 ${toneClasses[tone]}`}>
      <div>{icon}</div>
      <p className="text-xs uppercase tracking-wide mt-3 opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<{ label: string; value: string; icon?: ReactNode }> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">{item.label}</p>
          <p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2">
            {item.icon}
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChipList({ items, tone }: { items: string[]; tone: 'blue' | 'emerald' | 'amber' }) {
  const toneClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`px-3 py-1.5 border text-sm font-medium rounded-full ${toneClasses[tone]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ViewableList({ items }: { items: Array<{ title: string; description?: string; href?: string; action: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.title} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <p className="font-semibold text-slate-900">{item.title}</p>
            {item.description && <p className="text-sm text-slate-600 mt-1">{item.description}</p>}
          </div>
          {item.href ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
              <ExternalLink className="w-4 h-4" />
              {item.action}
            </a>
          ) : (
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
              <ExternalLink className="w-4 h-4" />
              {item.action}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function formatSalary(job: Pick<Job, 'pay_min' | 'pay_max' | 'pay_type'>) {
  if (!job.pay_min && !job.pay_max) return 'Salary not shared';
  const suffix = job.pay_type === 'hourly' ? '/hr' : '';
  return `$${job.pay_min.toLocaleString()} - $${job.pay_max.toLocaleString()}${suffix}`;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
