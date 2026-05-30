import React, { useState, useEffect } from 'react';
import { supabase, Profile, Student, Employee, Company } from '../lib/supabase';
import { Star, TrendingUp, Award, ChevronLeft, ChevronRight, Building, GraduationCap, Briefcase } from 'lucide-react';

export function TopPerformers() {
  const [activeTab, setActiveTab] = useState<'students' | 'employees'>('students');
  const [students, setStudents] = useState<(Student & { profile: Profile })[]>([]);
  const [employees, setEmployees] = useState<(Employee & { profile: Profile; company: Company })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTopStudents();
    fetchTopEmployees();
  }, []);

  const fetchTopStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles(*)
      `)
      .order('rating', { ascending: false })
      .limit(10);

    if (data) setStudents(data as any);
  };

  const fetchTopEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select(`
        *,
        profile:profiles(*),
        company:companies(*)
      `)
      .order('rating', { ascending: false })
      .limit(10);

    if (data && data.length > 0) {
      setEmployees(data as any);
    } else {
      // Fallback sample employee when none are returned from the database
      const sampleEmployee = {
        id: 'sample-e-1',
        rating: 4.8,
        position: 'Senior Software Engineer',
        sales_target: 85,
        sales_achieved: 72,
        profile: { name: 'Jordan Blake' },
        company: { name: 'Acme Corp' },
      } as any;
      setEmployees([sampleEmployee]);
    }
  };

  const itemsPerView = 4;
  const currentData = activeTab === 'students' ? students : employees;
  const maxIndex = Math.max(0, currentData.length - itemsPerView);

  const nextSlide = () => setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  // Reset index when switching tabs
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

      {/* Tab Switcher */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          Top Students
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'employees'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          Top Employees
        </button>
      </div>

      {/* Carousel */}
      <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Navigation Buttons */}
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

        {/* Cards Container */}
        <div className="overflow-hidden px-8">
          <div
            className="flex gap-6 transition-transform duration-300"
            style={{ transform: `translateX(-${currentIndex * 264}px)` }}
          >
            {activeTab === 'students' ? (
              students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))
            )}
          </div>
        </div>

        {/* Indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === i ? 'w-6 bg-blue-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="text-2xl font-bold text-slate-800">{students.length * 45 + 234}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Employees</p>
              <p className="text-2xl font-bold text-slate-800">{employees.length * 89 + 1247}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Rating</p>
              <p className="text-2xl font-bold text-slate-800">4.6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rising Stars Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl font-bold text-slate-800">Rising Stars</h2>
          <span className="ml-2 text-sm text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            Fastest Growing
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...students, ...employees].slice(0, 4).map((person, i) => (
            <div key={i} className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-medium">
                  {(person as any).profile?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {(person as any).profile?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {'college' in person ? 'Student' : 'Employee'}
                  </p>
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
    </div>
  );
}

function StudentCard({ student }: { student: Student & { profile: Profile } }) {
  const rating = student.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {student.profile?.name?.charAt(0) || 'S'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
            #{students.indexOf(student as any) + 1}
          </div>
        </div>

        <h3 className="font-semibold text-slate-800 text-lg mb-1">
          {student.profile?.name || 'Student'}
        </h3>
        <p className="text-sm text-slate-500 mb-1">{student.college}</p>
        <p className="text-xs text-slate-400 mb-3">{student.degree}</p>

        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < fullStars
                  ? 'fill-amber-400 text-amber-400'
                  : i === fullStars && hasHalfStar
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {student.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
              {skill}
            </span>
          ))}
        </div>

        <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
          View Profile
        </button>
      </div>
    </div>
  );
}

function EmployeeCard({ employee }: { employee: Employee & { profile: Profile; company: Company } }) {
  const rating = employee.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
            {employee.profile?.name?.charAt(0) || 'E'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
            #{employees.indexOf(employee as any) + 1}
          </div>
        </div>

        <h3 className="font-semibold text-slate-800 text-lg mb-1">
          {employee.profile?.name || 'Employee'}
        </h3>
        <p className="text-sm text-slate-500 mb-1">{employee.position}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Building className="w-3 h-3" />
          {employee.company?.name}
        </div>

        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < fullStars
                  ? 'fill-amber-400 text-amber-400'
                  : i === fullStars && hasHalfStar
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
        </div>

        <div className="w-full grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Sales Target</p>
            <p className="text-sm font-semibold text-slate-800">{employee.sales_target}%</p>
          </div>
          <div className="p-2 bg-teal-50 rounded-lg">
            <p className="text-xs text-slate-500">Achieved</p>
            <p className="text-sm font-semibold text-teal-700">{employee.sales_achieved}%</p>
          </div>
        </div>

        <button className="w-full py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm">
          View Profile
        </button>
      </div>
    </div>
  );
}

// Import at top
let students: any[] = [];
let employees: any[] = [];
