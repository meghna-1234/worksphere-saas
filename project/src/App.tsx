import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/Auth';
import { Layout } from './components/Layout';
import { Feed } from './components/Feed';
import { CompanyAnalytics } from './components/CompanyAnalytics';
import { TopPerformers } from './components/TopPerformers';
import { HRDashboard } from './components/HRDashboard';
import { StudentProfile } from './components/StudentModule';
import { EmployeeDashboard } from './components/EmployeeModule';
import { ChatModule, MeetingModule } from './components/CommunicationModule';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('feed');

  useEffect(() => {
    if (!loading && !user) {
      setCurrentPage('auth');
    } else if (user) {
      setCurrentPage('feed');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'feed':
        return (
          <div className="space-y-6">
            <Feed />
            <CompanyAnalytics />
            <TopPerformers />
          </div>
        );
      case 'create-post':
        return <CreatePostPage onBack={() => setCurrentPage('feed')} />;
      case 'companies':
        return <CompanyAnalytics />;
      case 'performers':
        return <TopPerformers />;
      case 'profile':
      case 'recommendations':
      case 'jobs':
      case 'payments':
        return <StudentProfile activePage={currentPage as any} />;
      case 'dashboard':
      case 'employees':
      case 'documents':
      case 'analytics':
      case 'tieups':
        return <HRDashboard activePage={currentPage as any} />;
      case 'performance':
        return <EmployeeDashboard />;
      case 'messages':
        return <ChatModule />;
      case 'meetings':
        return <MeetingModule />;
      default:
        return <Feed />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function CreatePostPage({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Create Post</h2>
          <div className="flex items-center gap-3">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
            >
              <option value="public">Public</option>
              <option value="company">Company Only</option>
            </select>
            <button
              onClick={onBack}
              className="px-4 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Publish
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium flex-shrink-0">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 min-h-[200px] resize-none border-0 focus:ring-0 text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 flex items-center gap-4">
          <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Photo
          </button>
          <button className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            Video
          </button>
          <button className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Document
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
