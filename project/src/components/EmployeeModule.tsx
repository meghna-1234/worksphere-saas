import React, { useState, useEffect } from 'react';
import { supabase, Employee, Profile, Company, Review, MarketAnalytics } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, TrendingUp, Target, Star, BarChart3, FileText, Users, Download, CreditCard as Edit, Eye, Folder, ChevronRight, MessageSquare, Video } from 'lucide-react';

export function EmployeeDashboard() {
  const { profile, user } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'documents' | 'performance'>('dashboard');
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (user) fetchEmployeeData();
  }, [user]);

  const fetchEmployeeData = async () => {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    if (data) setEmployee(data);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'documents', label: 'Documents', icon: Folder },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeView === tab.id
                ? 'bg-teal-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === 'dashboard' && <EmployeeOverview />}
      {activeView === 'documents' && <EmployeeDocuments />}
      {activeView === 'performance' && <EmployeePerformance />}
    </div>
  );
}

function EmployeeOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              On Track
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">78%</p>
          <p className="text-sm text-slate-500 mt-1">Sales Target</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">4.5</p>
          <p className="text-sm text-slate-500 mt-1">Customer Rating</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">12</p>
          <p className="text-sm text-slate-500 mt-1">Active Documents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">+15%</p>
          <p className="text-sm text-slate-500 mt-1">This Month</p>
        </div>
      </div>

      {/* Sales Target Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-6">Sales Target Progress</h3>
        <div className="space-y-6">
          {[
            { label: 'Q1 Target', current: 78000, target: 100000, color: 'from-teal-500 to-teal-400' },
            { label: 'Monthly Target', current: 18500, target: 25000, color: 'from-blue-500 to-blue-400' },
            { label: 'Customer Acquisitions', current: 45, target: 60, color: 'from-emerald-500 to-emerald-400' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-sm text-slate-500">
                  ${item.current.toLocaleString()} / ${item.target.toLocaleString()}
                </span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500 relative`}
                  style={{ width: `${(item.current / item.target) * 100}%` }}
                >
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                    {Math.round((item.current / item.target) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Analysis Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-800">Market Analysis</h3>
          <button className="text-sm text-teal-600 hover:text-teal-700">View Full Report</button>
        </div>
        <div className="h-64 flex items-end gap-4">
          {[65, 78, 85, 72, 92, 88, 95].map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t transition-all duration-300"
                style={{ height: `${value}%` }}
              />
              <span className="text-xs text-slate-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        <button className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-800">Company Chat</h4>
              <p className="text-sm text-slate-500">3 unread messages</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <Video className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-800">Meetings</h4>
              <p className="text-sm text-slate-500">2 scheduled today</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-800">Documents</h4>
              <p className="text-sm text-slate-500">Work on shared files</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
          </div>
        </button>
      </div>
    </div>
  );
}

function EmployeeDocuments() {
  const [currentFolder, setCurrentFolder] = useState('shared');
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);

  const folders = [
    { id: 'shared', name: 'Shared with Me', count: 5 },
    { id: 'projects', name: 'Projects', count: 12 },
    { id: 'reports', name: 'Reports', count: 8 },
    { id: 'templates', name: 'Templates', count: 3 },
  ];

  const documents = [
    {
      id: 1,
      name: 'Q1 Project Report.docx',
      owner: 'Sarah Johnson',
      modified: '2 hours ago',
      access: 'edit',
      size: '1.2 MB',
      collaborators: ['Mike Chen', 'Emily Davis'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Marketing Strategy Q2.pdf',
      owner: 'Mike Chen',
      modified: '1 day ago',
      access: 'view',
      size: '2.4 MB',
      collaborators: ['Sarah Johnson'],
      status: 'final'
    },
    {
      id: 3,
      name: 'Team Meeting Notes - Jan.docx',
      owner: 'You',
      modified: '3 days ago',
      access: 'edit',
      size: '45 KB',
      collaborators: ['Team'],
      status: 'active'
    },
    {
      id: 4,
      name: 'Budget Analysis FY2024.xlsx',
      owner: 'Emily Davis',
      modified: '1 week ago',
      access: 'view',
      size: '890 KB',
      collaborators: ['Finance Team'],
      status: 'active'
    },
    {
      id: 5,
      name: 'Product Roadmap.pptx',
      owner: 'James Wilson',
      modified: '5 days ago',
      access: 'edit',
      size: '5.2 MB',
      collaborators: ['Product Team'],
      status: 'active'
    },
    {
      id: 6,
      name: 'Employee Onboarding Guide.docx',
      owner: 'HR Department',
      modified: '2 weeks ago',
      access: 'view',
      size: '1.8 MB',
      collaborators: [],
      status: 'template'
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
      final: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Final' },
      template: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Template' },
    };
    return badges[status] || badges.active;
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Folders</h3>
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  currentFolder === folder.id ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-sm">{folder.name}</span>
                <span className="text-xs text-slate-400">{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Document List */}
        <div className="col-span-3 space-y-4">
          {/* Collaborators Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['S', 'M', 'E', 'J'].map((initial, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    >
                      {initial}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white">
                    +3
                  </div>
                </div>
                <span className="text-sm text-slate-600">7 active collaborators</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-2 gap-4">
            {documents.map((doc) => {
              const badge = getStatusBadge(doc.status);
              const getFileType = (name: string) => {
                const ext = name.split('.').pop()?.toLowerCase();
                if (ext === 'pdf') return { bg: 'bg-red-50', color: 'text-red-500', label: 'PDF' };
                if (ext === 'xlsx') return { bg: 'bg-emerald-50', color: 'text-emerald-500', label: 'XLS' };
                if (ext === 'pptx') return { bg: 'bg-orange-50', color: 'text-orange-500', label: 'PPT' };
                return { bg: 'bg-blue-50', color: 'text-blue-500', label: 'DOC' };
              };
              const fileType = getFileType(doc.name);

              return (
                <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${fileType.bg} flex items-center justify-center`}>
                        <span className={`text-xs font-bold ${fileType.color}`}>{fileType.label}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{doc.name}</h4>
                        <p className="text-xs text-slate-500">{doc.owner}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        doc.access === 'edit' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.access === 'edit' ? 'Can Edit' : 'View Only'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <span>{doc.size}</span>
                    <span>|</span>
                    <span>{doc.modified}</span>
                  </div>

                  {/* Collaborators */}
                  {doc.collaborators.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-1">
                        {doc.collaborators.slice(0, 3).map((collab, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xs border border-white" title={collab}>
                            {collab.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {doc.collaborators.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowWorkModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Work On
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Work On Document Modal */}
      {showWorkModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedDoc.name}</h3>
                  <p className="text-xs text-slate-500">Owner: {selectedDoc.owner}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowWorkModal(false);
                    setSelectedDoc(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-slate-500 rotate-45" />
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-slate-50 relative">
              {/* Toolbar */}
              <div className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 p-2 flex items-center gap-1 z-10">
                <button className="p-2 hover:bg-slate-100 rounded transition-colors font-bold text-slate-700">B</button>
                <button className="p-2 hover:bg-slate-100 rounded transition-colors italic text-slate-700">I</button>
                <button className="p-2 hover:bg-slate-100 rounded transition-colors underline text-slate-700">U</button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <button className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13m-13 6h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <button className="p-2 hover:bg-slate-100 rounded transition-colors text-teal-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Auto-saving
                  </span>
                </div>
              </div>

              {/* Document Content */}
              <div className="h-full pt-12 p-8 overflow-auto">
                <div className="bg-white rounded-lg shadow-sm max-w-3xl mx-auto p-12 min-h-full">
                  <h1 className="text-2xl font-bold text-slate-800 mb-4">{selectedDoc.name.replace(/\.[^/.]+$/, '')}</h1>
                  <div className="text-slate-600 space-y-4">
                    <p>Document content would be displayed here with full editing capabilities.</p>
                    <p>Features available to employees:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Real-time collaboration with team members</li>
                      <li>Add comments and suggestions</li>
                      <li>Track changes made by others</li>
                      <li>View revision history</li>
                    </ul>
                    <p className="text-slate-400 text-sm mt-8">
                      Last modified: {selectedDoc.modified} by {selectedDoc.owner}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  Add Comment
                </button>
                <button className="text-sm text-slate-600 hover:text-slate-700">
                  Suggest Edit
                </button>
              </div>
              <span className="text-xs text-slate-500">
                {selectedDoc.access === 'edit' ? 'You have edit access' : 'View only mode'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmployeePerformance() {
  const reviewData = {
    quality: 4.5,
    communication: 4.2,
    timeliness: 4.7,
    professionalism: 4.3,
  };

  const avgRating = (reviewData.quality + reviewData.communication + reviewData.timeliness + reviewData.professionalism) / 4;

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="grid grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Performance Overview</h3>
          <div className="relative">
            <svg viewBox="0 0 200 200" className="w-full max-w-xs mx-auto">
              {/* Background polygons */}
              {[1, 0.75, 0.5, 0.25].map((scale, i) => (
                <polygon
                  key={i}
                  points="100,20 155,55 155,145 100,180 45,145 45,55"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  transform={`scale(${scale})`}
                  transform-origin="center"
                />
              ))}
              {/* Data polygon */}
              <polygon
                points={`${100},${100 - reviewData.quality * 15} ${100 + reviewData.quality * 15 * Math.cos(Math.PI/6)},${100 - reviewData.quality * 15 * Math.sin(Math.PI/6)} ${100 + reviewData.quality * 15 * Math.cos(Math.PI/6)},${100 + reviewData.quality * 15 * Math.sin(Math.PI/6)} ${100},${100 + reviewData.quality * 15} ${100 - reviewData.quality * 15 * Math.cos(Math.PI/6)},${100 + reviewData.quality * 15 * Math.sin(Math.PI/6)} ${100 - reviewData.quality * 15 * Math.cos(Math.PI/6)},${100 - reviewData.quality * 15 * Math.sin(Math.PI/6)}`}
                fill="rgba(20, 184, 166, 0.2)"
                stroke="#14B8A6"
                strokeWidth="2"
              />
              {/* Data points */}
              {[
                { x: 100, y: 100 - reviewData.quality * 15, label: 'Quality' },
                { x: 100 + reviewData.quality * 15, y: 55, label: 'Communication' },
                { x: 100 + reviewData.quality * 15, y: 145, label: 'Timeliness' },
                { x: 100, y: 100 + reviewData.quality * 15, label: 'Professionalism' },
              ].map((point, i) => (
                <circle key={i} cx={point.x} cy={point.y} r="4" fill="#14B8A6" />
              ))}
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.entries(reviewData).map(([key, value]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 capitalize">{key}</p>
                <p className="text-lg font-semibold text-slate-800">{value.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Customer Reviews</h3>
            <span className="text-sm text-slate-500">Last 30 days</span>
          </div>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <span className="text-4xl font-bold text-slate-800">{avgRating.toFixed(1)}</span>
              <span className="text-slate-500">/5</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Based on 24 reviews</p>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Client A', rating: 5, comment: 'Excellent work on the project!' },
              { name: 'Client B', rating: 4, comment: 'Great communication and timely delivery.' },
              { name: 'Client C', rating: 5, comment: 'Went above and beyond expectations.' },
            ].map((review, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{review.name}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`w-3 h-3 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-6">Sales Performance Trend</h3>
        <div className="h-64 flex items-end gap-3">
          {[
            { month: 'Jan', value: 65, target: 70 },
            { month: 'Feb', value: 72, target: 75 },
            { month: 'Mar', value: 68, target: 80 },
            { month: 'Apr', value: 85, target: 85 },
            { month: 'May', value: 78, target: 90 },
            { month: 'Jun', value: 92, target: 95 },
          ].map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col gap-1">
                <div
                  className="w-full bg-slate-200 rounded-t"
                  style={{ height: `${data.target}%` }}
                />
                <div
                  className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t transition-all duration-300"
                  style={{ height: `${data.value}%`, marginTop: '-100%' }}
                />
              </div>
              <span className="text-xs text-slate-500">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-teal-500" />
            <span className="text-sm text-slate-600">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-200" />
            <span className="text-sm text-slate-600">Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
