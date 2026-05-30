import { ReactNode, useEffect, useState } from 'react';
import { supabase, Company, Employee, Profile, Student } from '../lib/supabase';
import { Award, Briefcase, Building, ChevronLeft, ChevronRight, GraduationCap, Mail, MapPin, Phone, Star, TrendingUp, X } from 'lucide-react';

type StudentPerformer = Student & { profile: Profile };
type EmployeePerformer = Employee & { profile: Profile; company: Company };
type SelectedPerformer =
  | { type: 'student'; data: StudentPerformer; rank: number }
  | { type: 'employee'; data: EmployeePerformer; rank: number };

export function TopPerformers() {
  const [activeTab, setActiveTab] = useState<'students' | 'employees'>('students');
  const [students, setStudents] = useState<StudentPerformer[]>([]);
  const [employees, setEmployees] = useState<EmployeePerformer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPerformer, setSelectedPerformer] = useState<SelectedPerformer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformers();
  }, []);

  const fetchPerformers = async () => {
    setLoading(true);
    const [studentsResult, employeesResult] = await Promise.all([
      supabase.from('students').select('*').order('rating', { ascending: false }).limit(10),
      supabase.from('employees').select('*').order('rating', { ascending: false }).limit(10),
    ]);

    const profileUserIds = [
      ...new Set([
        ...(studentsResult.data || []).map((student) => student.user_id),
        ...(employeesResult.data || []).map((employee) => employee.user_id),
      ]),
    ];
    const companyIds = [...new Set((employeesResult.data || []).map((employee) => employee.company_id))];

    const [{ data: profilesData }, { data: companiesData }] = await Promise.all([
      profileUserIds.length ? supabase.from('profiles').select('*').in('user_id', profileUserIds) : Promise.resolve({ data: [] }),
      companyIds.length ? supabase.from('companies').select('*').in('id', companyIds) : Promise.resolve({ data: [] }),
    ]);

    const profilesByUserId = (profilesData || []).reduce<Record<string, Profile>>((acc, item) => {
      acc[item.user_id] = item;
      return acc;
    }, {});
    const companiesById = (companiesData || []).reduce<Record<string, Company>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    setStudents(
      studentsResult.data && studentsResult.data.length > 0
        ? studentsResult.data.map((student) => ({
            ...student,
            profile: profilesByUserId[student.user_id],
          })) as any
        : [
            {
              id: 'sample-1',
              rating: 4.9,
              college: 'State University',
              degree: 'B.Sc. Computer Science',
              skills: ['React', 'TypeScript', 'Tailwind CSS'],
              profile: { name: 'Alex Rivera', phone: '+1 555 0148', location: 'Austin, TX' },
            } as any,
          ],
    );

    setEmployees(
      employeesResult.data && employeesResult.data.length > 0
        ? employeesResult.data.map((employee) => ({
            ...employee,
            profile: profilesByUserId[employee.user_id],
            company: companiesById[employee.company_id],
          })) as any
        : [
            {
              id: 'sample-e-1',
              rating: 4.8,
              position: 'Senior Software Engineer',
              sales_target: 85,
              sales_achieved: 72,
              profile: { name: 'Jordan Blake', phone: '+1 555 0182', location: 'Remote' },
              company: { name: 'Acme Corp' },
            } as any,
          ],
    );
    setLoading(false);
  };

  const itemsPerView = 4;
  const currentData = activeTab === 'students' ? students : employees;
  const maxIndex = Math.max(0, currentData.length - itemsPerView);

  const nextSlide = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Top Performers</h1>
          <p className="text-slate-500">Highest-rated students and employees across companies</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          Top Students
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'employees' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          Top Employees
        </button>
      </div>

      <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading performers...</div>
        ) : (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>

            <div className="overflow-hidden px-8">
              <div className="flex gap-6 transition-transform duration-300" style={{ transform: `translateX(-${currentIndex * 264}px)` }}>
                {activeTab === 'students'
                  ? students.map((student, idx) => (
                      <StudentCard
                        key={student.id || `student-${idx}`}
                        student={student}
                        index={idx}
                        onViewProfile={() => setSelectedPerformer({ type: 'student', data: student, rank: idx + 1 })}
                      />
                    ))
                  : employees.map((employee, idx) => (
                      <EmployeeCard
                        key={employee.id || `employee-${idx}`}
                        employee={employee}
                        index={idx}
                        onViewProfile={() => setSelectedPerformer({ type: 'employee', data: employee, rank: idx + 1 })}
                      />
                    ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'w-6 bg-blue-600' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl font-bold text-slate-800">Rising Stars</h2>
          <span className="ml-2 text-sm text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Fastest Growing</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...students, ...employees].slice(0, 4).map((person, i) => (
            <div key={`${(person as any).id}-${i}`} className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-medium">
                  {(person as any).profile?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{(person as any).profile?.name || 'User'}</p>
                  <p className="text-xs text-slate-500">{'college' in person ? 'Student' : 'Employee'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">+15%</span>
                <span className="text-xs text-slate-500 ml-1">this month</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPerformer && <PerformerProfileModal performer={selectedPerformer} onClose={() => setSelectedPerformer(null)} />}
    </div>
  );
}

function StudentCard({ student, index, onViewProfile }: { student: StudentPerformer; index: number; onViewProfile: () => void }) {
  return (
    <PerformerCardShell
      accent="blue"
      rank={index + 1}
      name={student.profile?.name || 'Student'}
      subtitle={student.college || ''}
      detail={student.degree || ''}
      rating={student.rating || 0}
      skills={student.skills || []}
      onViewProfile={onViewProfile}
    />
  );
}

function EmployeeCard({ employee, index, onViewProfile }: { employee: EmployeePerformer; index: number; onViewProfile: () => void }) {
  return (
    <PerformerCardShell
      accent="teal"
      rank={index + 1}
      name={employee.profile?.name || 'Employee'}
      subtitle={employee.position || 'Employee'}
      detail={employee.company?.name || ''}
      rating={employee.rating || 0}
      skills={[`Target ${employee.sales_target || 0}%`, `Achieved ${employee.sales_achieved || 0}%`]}
      onViewProfile={onViewProfile}
    />
  );
}

function PerformerCardShell({
  accent,
  rank,
  name,
  subtitle,
  detail,
  rating,
  skills,
  onViewProfile,
}: {
  accent: 'blue' | 'teal';
  rank: number;
  name: string;
  subtitle: string;
  detail: string;
  rating: number;
  skills: string[];
  onViewProfile: () => void;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const avatarClass = accent === 'blue' ? 'from-blue-400 to-blue-600' : 'from-teal-400 to-teal-600';
  const rankClass = accent === 'blue' ? 'bg-blue-600' : 'bg-teal-600';
  const skillClass = accent === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700';
  const buttonClass = accent === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700';

  return (
    <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarClass} flex items-center justify-center text-white text-2xl font-bold`}>
            {name.charAt(0)}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${rankClass} flex items-center justify-center text-white text-xs font-bold border-2 border-white`}>
            #{rank}
          </div>
        </div>

        <h3 className="font-semibold text-slate-800 text-lg mb-1">{name}</h3>
        <p className="text-sm text-slate-500 mb-1">{subtitle}</p>
        <p className="text-xs text-slate-400 mb-3">{detail}</p>

        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < fullStars ? 'fill-amber-400 text-amber-400' : i === fullStars && hasHalfStar ? 'fill-amber-200 text-amber-400' : 'fill-slate-200 text-slate-200'
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className={`text-xs px-2 py-1 ${skillClass} rounded-full`}>
              {skill}
            </span>
          ))}
        </div>

        <button onClick={onViewProfile} className={`w-full mt-4 py-2 ${buttonClass} text-white rounded-lg font-medium transition-colors text-sm`}>
          View Profile
        </button>
      </div>
    </div>
  );
}

function PerformerProfileModal({ performer, onClose }: { performer: SelectedPerformer; onClose: () => void }) {
  const isStudent = performer.type === 'student';
  const data = performer.data as any;
  const profile = data.profile as Profile | undefined;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className={`p-6 text-white ${isStudent ? 'bg-blue-600' : 'bg-teal-600'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {profile?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm text-white/80">Rank #{performer.rank}</p>
                <h2 className="text-2xl font-bold">{profile?.name || 'Performer'}</h2>
                <p className="text-white/90">{isStudent ? data.college || 'Student' : `${data.position || 'Employee'} at ${data.company?.name || 'Company'}`}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close profile">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoTile icon={<Award className="w-5 h-5" />} label="Rating" value={`${(data.rating || 0).toFixed(1)} / 5`} />
            <InfoTile icon={<MapPin className="w-5 h-5" />} label="Location" value={profile?.location || 'Not shared'} />
            <InfoTile icon={<Phone className="w-5 h-5" />} label="Contact" value={profile?.phone || 'Not shared'} />
          </div>

          <section>
            <h3 className="font-semibold text-slate-900 mb-2">{isStudent ? 'Skills and Academic Details' : 'Role and Performance'}</h3>
            {isStudent ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">{data.degree || 'Degree not shared'} at {data.college || 'college not shared'}</p>
                <div className="flex flex-wrap gap-2">
                  {(data.skills || []).map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoTile icon={<Briefcase className="w-5 h-5" />} label="Sales Target" value={`${data.sales_target || 0}%`} />
                <InfoTile icon={<TrendingUp className="w-5 h-5" />} label="Achieved" value={`${data.sales_achieved || 0}%`} />
              </div>
            )}
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-2">Contact Information</h3>
            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {profile?.user_id || 'User account linked'}</span>
              <span className="inline-flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /> {isStudent ? data.college || 'Student' : data.company?.name || 'Company'}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="text-slate-500">{icon}</div>
      <p className="text-xs uppercase tracking-wide text-slate-500 mt-2">{label}</p>
      <p className="font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
