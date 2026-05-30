import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/supabase';
import { Building, GraduationCap, Briefcase, Users, Mail, Lock, User, ArrowRight } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password, name, role);
      if (error) setError(error.message);
      else {
        setError('Check your email to confirm your account');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">EnterpriseConnect</h1>
            <p className="text-slate-500 mt-2">Connect, Collaborate, Grow</p>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                isLogin ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !isLogin ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        role === 'student'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <GraduationCap className={`w-6 h-6 ${role === 'student' ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${role === 'student' ? 'text-blue-600' : 'text-slate-600'}`}>
                        Student
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('employee')}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        role === 'employee'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Briefcase className={`w-6 h-6 ${role === 'employee' ? 'text-teal-500' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${role === 'employee' ? 'text-teal-600' : 'text-slate-600'}`}>
                        Employee
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('hr')}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        role === 'hr'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Users className={`w-6 h-6 ${role === 'hr' ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${role === 'hr' ? 'text-amber-600' : 'text-slate-600'}`}>
                        HR/Admin
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('company_admin')}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        role === 'company_admin'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Building className={`w-6 h-6 ${role === 'company_admin' ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${role === 'company_admin' ? 'text-emerald-600' : 'text-slate-600'}`}>
                        Company
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
