import { ArrowRight, Briefcase, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { profile } = useAuth();

  const profilePage = profile?.role === 'company_admin'
    ? 'company_profile'
    : profile?.role === 'student'
      ? 'profile'
      : 'dashboard';

  return (
    <div className="max-w-5xl mx-auto">
      <section className="overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
        <div
          className="relative min-h-[360px] bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(15,23,42,0.72), rgba(15,23,42,0.36)), url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-slate-900/10" />
          <div className="relative px-8 py-16 sm:px-10 sm:py-20 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Collaborate. Learn. Grow.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
              A unified place for students, employees and companies to connect, share ideas and build better teams.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('feed')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Explore Feed
              </button>
              <button
                type="button"
                onClick={() => onNavigate(profilePage)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/70 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
            </div>

            <div className="mt-10 flex items-center gap-2">
              {[0, 1, 2, 3].map((dot) => (
                <span key={dot} className="w-2 h-2 rounded-full bg-white/80" />
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-7 sm:px-10">
          <h2 className="text-xl font-bold text-slate-900">Why WorkSphere?</h2>
          <p className="mt-2 text-slate-600">
            Share updates, find opportunities, and collaborate across learning and work — all in one place.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('companies')}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Explore companies
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
