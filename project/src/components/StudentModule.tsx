import React, { useState, useEffect } from 'react';
import { supabase, Student, Profile, Job, Company, Payment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  Star,
  TrendingUp,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Building,
  MapPin,
  Wallet,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';

export function StudentProfile({ activePage }: { activePage?: 'profile' | 'recommendations' | 'jobs' | 'payments' } = {}) {
  const { profile, user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [activeView, setActiveView] = useState<'profile' | 'recommendations' | 'jobs' | 'payments'>(activePage || 'profile');

  useEffect(() => {
    if (activePage) setActiveView(activePage);
  }, [activePage]);

  useEffect(() => {
    if (user) fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    if (data) setStudent(data);
  };

  const completionPercent = student ? 80 : 30;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-fit">
        {[
          { id: 'profile', label: 'My Profile', icon: GraduationCap },
          { id: 'recommendations', label: 'Recommendations', icon: Briefcase },
          { id: 'jobs', label: 'Jobs', icon: Briefcase },
          { id: 'payments', label: 'Payments', icon: Wallet },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeView === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === 'profile' && <StudentProfileView student={student} profile={profile} />}
      {activeView === 'recommendations' && <CompanyRecommendations student={student} />}
      {activeView === 'jobs' && <JobBoard />}
      {activeView === 'payments' && <PaymentSection student={student} />}
    </div>
  );
}

function StudentProfileView({ student, profile }: { student: Student | null; profile: Profile | null }) {
  const completionPercent = student ? 80 : 30;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold">
              {profile?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile?.name || 'Student'}</h1>
              <p className="text-blue-100 mt-1">{student?.college || 'Add your college'}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-semibold">{student?.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className="text-blue-200">|</span>
                <span className="text-blue-100">{student?.degree || 'Add your degree'}</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Profile Completion</h3>
          <span className="text-sm font-medium text-blue-600">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        {completionPercent < 100 && (
          <p className="text-sm text-slate-500 mt-3">
            Add more details to increase your chances of getting hired!
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Skills Section */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Skills</h3>
          <div className="grid grid-cols-2 gap-4">
            {(student?.skills || ['JavaScript', 'React', 'Python', 'Node.js']).map((skill, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{skill}</span>
                  <span className="text-sm text-blue-600">{['Expert', 'Advanced', 'Intermediate', 'Beginner'][i % 4]}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                    style={{ width: `${[90, 80, 70, 50][i % 4]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Availability</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-slate-700">Preferred Hours</span>
              </div>
              <span className="font-medium text-slate-800">{student?.preferred_hours || 20} hrs/week</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span className="text-slate-700">Weekend</span>
              </div>
              <span className={`font-medium ${student?.weekend_available ? 'text-emerald-600' : 'text-slate-400'}`}>
                {student?.weekend_available ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Earnings Summary</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
            <p className="text-sm text-emerald-600 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-emerald-700">${(student?.total_earnings || 2450).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">This Month</p>
            <p className="text-2xl font-bold text-slate-800">$1,200</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Projects Completed</p>
            <p className="text-2xl font-bold text-slate-800">24</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Avg. Project Value</p>
            <p className="text-2xl font-bold text-slate-800">$102</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyRecommendations({ student }: { student: Student | null }) {
  const recommendations = [
    { id: 1, name: 'TechCorp Inc.', match: 94, role: 'Frontend Developer', skills: ['React', 'TypeScript'], pay: '$25-35/hr' },
    { id: 2, name: 'StartUp Labs', match: 88, role: 'Full Stack Intern', skills: ['Node.js', 'React'], pay: '$20-30/hr' },
    { id: 3, name: 'DataDriven Co.', match: 82, role: 'Junior Developer', skills: ['Python', 'React'], pay: '$22-32/hr' },
    { id: 4, name: 'InnovativeTech', match: 78, role: 'Web Developer', skills: ['JavaScript', 'React'], pay: '$24-34/hr' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-slate-800">Personalized Recommendations</h3>
            <p className="text-sm text-slate-600">Based on your skills and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                  {rec.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{rec.name}</h4>
                  <p className="text-sm text-slate-500">{rec.role}</p>
                </div>
              </div>
              <div className="text-right mt-3 md:mt-0">
                <div className="flex items-center gap-1 md:justify-end">
                  <span className="text-2xl font-bold text-emerald-600">{rec.match}</span>
                  <span className="text-sm text-slate-500">% match</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-2">Matching Skills</p>
                <div className="flex flex-wrap gap-2">
                  {rec.skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">{rec.pay}</span>
                </div>
                <button className="w-full md:w-auto flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Apply
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobBoard() {
  const [filterType, setFilterType] = useState('all');

  const jobs = [
    { id: 1, title: 'Frontend Developer Intern', company: 'TechCorp', type: 'internship', pay: '$25/hr', skills: ['React', 'TypeScript'] },
    { id: 2, title: 'Part-time Developer', company: 'StartUp Labs', type: 'part-time', pay: '$30/hr', skills: ['React', 'Node.js'] },
    { id: 3, title: 'Full Stack Developer', company: 'Innovation Co.', type: 'full-time', pay: '$60K-80K', skills: ['React', 'Node.js', 'Python'] },
    { id: 4, title: 'Junior Developer', company: 'DataDriven', type: 'contract', pay: '$35/hr', skills: ['Python', 'React'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {['all', 'full-time', 'part-time', 'internship', 'contract'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {jobs.filter(j => filterType === 'all' || j.type === filterType).map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    job.type === 'full-time' ? 'bg-emerald-100 text-emerald-700' :
                    job.type === 'part-time' ? 'bg-blue-100 text-blue-700' :
                    job.type === 'internship' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {job.type}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-800">{job.title}</h3>
                </div>
                <p className="text-slate-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {job.company}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 md:text-right flex-shrink-0">
                <p className="text-lg font-semibold text-slate-800">{job.pay}</p>
                <button className="mt-3 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentSection({ student }: { student: Student | null }) {
  const payments = [
    { id: 1, company: 'TechCorp', amount: 350, status: 'completed', date: '2024-01-15', type: 'weekly' },
    { id: 2, company: 'StartUp Labs', amount: 280, status: 'pending', date: '2024-01-20', type: 'weekly' },
    { id: 3, company: 'DataDriven Co.', amount: 420, status: 'processing', date: '2024-01-18', type: 'project' },
  ];

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-100 mb-2">Available Balance</p>
            <h2 className="text-3xl md:text-4xl font-bold">${(student?.total_earnings || 2450).toLocaleString()}</h2>
            <p className="text-emerald-100 mt-2">Pending: $280.00</p>
          </div>
          <div className="w-full md:w-auto">
            <button className="w-full md:inline-block px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Payment Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg text-center">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-blue-700">Daily</p>
            <p className="text-xs text-blue-500">$50 min threshold</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg text-center hover:border-slate-300 transition-colors">
            <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="font-medium text-slate-700">Weekly</p>
            <p className="text-xs text-slate-500">Auto every Friday</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg text-center hover:border-slate-300 transition-colors">
            <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="font-medium text-slate-700">Monthly</p>
            <p className="text-xs text-slate-500">1st of each month</p>
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Company</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-800">{payment.company}</td>
                  <td className="py-4 px-6 text-slate-700">${payment.amount}</td>
                  <td className="py-4 px-6 text-slate-600">{payment.type}</td>
                  <td className="py-4 px-6 text-slate-600">{payment.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
