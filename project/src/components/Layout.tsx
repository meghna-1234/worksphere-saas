import React, { ReactNode } from 'react';
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
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { id: 'feed', label: 'Feed', icon: Home },
      { id: 'companies', label: 'Companies', icon: Building },
      { id: 'performers', label: 'Top Performers', icon: TrendingUp },
    ];

    switch (profile?.role) {
      case 'student':
        return [
          ...baseItems,
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
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'meetings', label: 'Meetings', icon: Video },
        ];
      case 'company_admin':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'jobs', label: 'Job Postings', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'employees', label: 'Employees', icon: Users },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">EnterpriseConnect</span>
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
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium">
                {profile?.name?.charAt(0) || 'U'}
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
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-16 bottom-0 bg-white border-r border-slate-200 overflow-y-auto">
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
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
