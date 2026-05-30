import { ReactNode, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  FileText,
  BarChart3,
  Users,
  MessageSquare,
  Video,
  Wallet,
  Briefcase,
  Building,
  Bell,
  Search,
  LogOut,
  Plus,
  User,
  TrendingUp,
  Folder,
  Handshake,
  Scale,
} from 'lucide-react';




interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const bellContainerRef = useRef<HTMLDivElement | null>(null);

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleContainerRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!isNotificationsOpen && !isRoleOpen) return;

    const onDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (isNotificationsOpen && bellContainerRef.current?.contains(target)) return;
      if (isRoleOpen && roleContainerRef.current?.contains(target)) return;

      setIsNotificationsOpen(false);
      setIsRoleOpen(false);
    };

    const onDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false);
        setIsRoleOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      document.removeEventListener('keydown', onDocumentKeyDown);
    };
  }, [isNotificationsOpen, isRoleOpen]);


  const getNavItems = () => {

    const baseItems = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'feed', label: 'Feed', icon: FileText },
      { id: 'companies', label: 'Companies', icon: Building },
      { id: 'performers', label: 'Top Performers', icon: TrendingUp },
    ];

    switch (profile?.role) {
      case 'student':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'recommendations', label: 'Recommendations', icon: Briefcase },
          { id: 'jobs', label: 'Jobs', icon: FileText },
          { id: 'payments', label: 'Payments', icon: Wallet },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'employee':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'documents', label: 'Documents', icon: Folder },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'meetings', label: 'Meetings', icon: Video },
        ];
      case 'hr':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'documents', label: 'Documents', icon: Folder },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'tieups', label: 'Tie-ups', icon: Handshake },
          { id: 'disputes', label: 'Disputes & Escrow', icon: Scale },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'meetings', label: 'Meetings', icon: Video },
        ];
      case 'company_admin':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'company_profile', label: 'Company Profile', icon: Building },
          { id: 'jobs', label: 'Job Postings', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'payments', label: 'Payments', icon: Wallet },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'meetings', label: 'Meetings', icon: Video },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">WorkSphere</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts, companies, people..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('create-post')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
            <div className="relative" ref={bellContainerRef}>

              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isNotificationsOpen}
                onClick={() => {
                  setIsRoleOpen(false);
                  setIsNotificationsOpen((v) => !v);
                }}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >

                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {isNotificationsOpen && (
                <div
                  role="dialog"
                  aria-label="Notifications"
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-[60] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Notifications</p>
                      <p className="text-xs text-slate-500">You have 3 new alerts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-2 -m-2 rounded-lg hover:bg-slate-50 text-slate-600"
                      aria-label="Close notifications"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className="max-h-72 overflow-auto">
                    {[
                      { title: 'New employee joined', desc: 'Sarah Johnson has joined Engineering.', time: '2h ago' },
                      { title: 'Document updated', desc: 'Employee Handbook 2024.docx was updated.', time: '4h ago' },
                      { title: 'Tie-up request sent', desc: 'TechCorp Inc. requested a partnership review.', time: '6h ago' },
                    ].map((n) => (
                      <button
                        key={n.title}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b last:border-b-0"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          // Keeping it non-navigational for now; can be wired to routes later.
                          setIsRoleOpen(false);
                        }}

                      >

                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                        <p className="text-[11px] text-slate-400 mt-2">{n.time}</p>
                      </button>
                    ))}
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => {
                        // Placeholder action
                        setIsNotificationsOpen(false);
                      }}
                    >
                      Mark all as read
                    </button>
                    <button
                      type="button"
                      className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                      onClick={() => {
                        // Placeholder action
                        setIsNotificationsOpen(false);
                      }}
                    >
                      View all
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 relative" ref={roleContainerRef}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={isRoleOpen}
                  onClick={() => setIsRoleOpen((v) => !v)}
                  className="relative px-3 py-2 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
                  title="Role/status"
                >
                  Logged in as:{' '}
                  <span className="font-semibold">
                    {profile?.role === 'student' && 'Student'}
                    {profile?.role === 'employee' && 'Employee'}
                    {profile?.role === 'hr' && 'HR/Admin'}
                    {profile?.role === 'company_admin' && 'Company'}
                    {!profile?.role && 'User'}
                  </span>
                </button>


                {isRoleOpen && (
                  <div
                    role="dialog"
                    aria-label="Account type"
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-[61] overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">Logged in as</p>
                      <p className="text-xs text-slate-500">Role/status</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {profile?.role === 'student' && 'Student'}
                        {profile?.role === 'employee' && 'Employee'}
                        {profile?.role === 'hr' && 'HR/Admin'}
                        {profile?.role === 'company_admin' && 'Company'}
                        {!profile?.role && 'User'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {profile?.name ? `Hello, ${profile.name}` : '—'}
                      </p>
                    </div>

                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setIsRoleOpen(false)}
                        className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
              </div>

              <button
                onClick={signOut}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 sticky top-[65px] h-[calc(100vh-65px)] bg-white border-r border-slate-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'text-blue-500' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
