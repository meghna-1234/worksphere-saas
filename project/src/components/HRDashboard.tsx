import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  Edit,
  UserCheck,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Handshake,
  Building,
  Plus,
  Folder,
  File,
  Upload,
  Search,
  MoreVertical,
  Star,
  MessageSquare,
} from 'lucide-react';

type HRSidebarPage = 'dashboard' | 'employees' | 'documents' | 'analytics' | 'tieups';

export function HRDashboard({ activePage }: { activePage?: HRSidebarPage }) {
  // sidebar owns navigation; this component just renders the selected view
  const page: HRSidebarPage = activePage ?? 'dashboard';

  return (
    <div className="space-y-6">
      {page === 'dashboard' && <DashboardOverview />}
      {page === 'documents' && <DocumentVault />}
      {page === 'analytics' && <CompanyAnalyticsView />}
      {page === 'tieups' && <TieUpsPage />}
      {page === 'employees' && <EmployeeReviews />}
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">247</p>
          <p className="text-sm text-slate-500 mt-1">Total Employees</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">18</p>
          <p className="text-sm text-slate-500 mt-1">Active Projects</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +24%
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">$1.2M</p>
          <p className="text-sm text-slate-500 mt-1">Revenue This Month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <Handshake className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              3 Pending
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">12</p>
          <p className="text-sm text-slate-500 mt-1">Active Tie-ups</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue vs Spending */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Revenue vs Spending</h3>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64 flex items-end gap-8 px-4">
            {[85, 72, 92, 68, 95, 88].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300"
                    style={{ height: `${value}%` }}
                  />
                  <div
                    className="w-full bg-gradient-to-t from-red-400 to-red-300 rounded-t transition-all duration-300"
                    style={{ height: `${value * 0.4}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Department Distribution</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View Details</button>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="16" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="16" strokeDasharray="100.53 150.80" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#14B8A6" strokeWidth="16" strokeDasharray="62.83 188.50" strokeDashoffset="-100.53" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray="37.70 213.63" strokeDashoffset="-163.36" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">247</span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
            </div>
            <div className="ml-8 space-y-3">
              {[
                { label: 'Engineering', color: 'bg-blue-500', count: 40 },
                { label: 'Marketing', color: 'bg-teal-500', count: 25 },
                { label: 'Sales', color: 'bg-amber-500', count: 15 },
                { label: 'Others', color: 'bg-slate-300', count: 20 },
              ].map((dept) => (
                <div key={dept.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                  <span className="text-sm text-slate-600">{dept.label}</span>
                  <span className="text-sm font-medium text-slate-800">{dept.count}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tie-up Suggestions & Recent Activity */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Suggested Tie-ups</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'TechCorp Inc.', industry: 'Technology', score: 94, reason: 'Complementary services in AI/ML' },
              { name: 'GlobalSoft', industry: 'Software', score: 88, reason: 'Shared customer base' },
              { name: 'DataDriven Co.', industry: 'Analytics', score: 85, reason: 'Strategic partnership potential' },
            ].map((company, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{company.name}</p>
                    <p className="text-sm text-slate-500">{company.industry}</p>
                    <p className="text-xs text-blue-600 mt-1">{company.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-emerald-600">{company.score}</span>
                      <span className="text-sm text-slate-500">/100</span>
                    </div>
                    <p className="text-xs text-slate-500">Match Score</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { icon: UserCheck, text: 'New employee joined', time: '2h ago', color: 'text-blue-600 bg-blue-50' },
              { icon: FileText, text: 'Document updated', time: '4h ago', color: 'text-teal-600 bg-teal-50' },
              { icon: Handshake, text: 'Tie-up request sent', time: '6h ago', color: 'text-amber-600 bg-amber-50' },
              { icon: DollarSign, text: 'Payment processed', time: '8h ago', color: 'text-emerald-600 bg-emerald-50' },
              { icon: Star, text: 'Review submitted', time: '12h ago', color: 'text-purple-600 bg-purple-50' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentVault() {
  const [currentFolder, setCurrentFolder] = useState('contracts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);

  const folders = [
    { id: 'contracts', name: 'Contracts', icon: Folder, count: 12 },
    { id: 'policies', name: 'Policies', icon: Folder, count: 8 },
    { id: 'financial', name: 'Financial Reports', icon: Folder, count: 15 },
    { id: 'legal', name: 'Legal Documents', icon: Folder, count: 6 },
    { id: 'tieups', name: 'Tie-up Agreements', icon: Folder, count: 9 },
    { id: 'hr', name: 'HR Documents', icon: Folder, count: 14 },
  ];

  const documents = [
    {
      id: 1,
      name: 'Q1 Financial Report 2024.xlsx',
      size: '2.4 MB',
      modified: '2 days ago',
      type: 'excel',
      owner: 'Sarah Johnson',
      collaborators: ['Mike Chen', 'Emily Davis'],
      version: '3.2',
      status: 'active'
    },
    {
      id: 2,
      name: 'Tie-up Agreement - TechCorp Inc.pdf',
      size: '1.2 MB',
      modified: '1 week ago',
      type: 'pdf',
      owner: 'John Smith',
      collaborators: [],
      version: '1.0',
      status: 'signed'
    },
    {
      id: 3,
      name: 'Employee Handbook 2024.docx',
      size: '5.8 MB',
      modified: '2 weeks ago',
      type: 'doc',
      owner: 'HR Department',
      collaborators: ['Sarah Johnson', 'Mike Chen', 'Lisa Wang'],
      version: '2.4',
      status: 'active'
    },
    {
      id: 4,
      name: 'Vendor Contract - ABC Corp.pdf',
      size: '890 KB',
      modified: '3 weeks ago',
      type: 'pdf',
      owner: 'Emily Davis',
      collaborators: [],
      version: '1.0',
      status: 'pending'
    },
    {
      id: 5,
      name: 'Q2 Budget Proposal.xlsx',
      size: '1.8 MB',
      modified: '5 days ago',
      type: 'excel',
      owner: 'Mike Chen',
      collaborators: ['Sarah Johnson'],
      version: '1.5',
      status: 'active'
    },
    {
      id: 6,
      name: 'Non-Disclosure Agreement Template.docx',
      size: '450 KB',
      modified: '1 month ago',
      type: 'doc',
      owner: 'Legal Team',
      collaborators: [],
      version: '1.0',
      status: 'template'
    },
    {
      id: 7,
      name: 'Partnership Terms - DataDriven Co.pdf',
      size: '2.1 MB',
      modified: '4 days ago',
      type: 'pdf',
      owner: 'John Smith',
      collaborators: ['TechCorp Legal'],
      version: '2.1',
      status: 'active'
    },
    {
      id: 8,
      name: 'Market Analysis Report Q1.pdf',
      size: '4.2 MB',
      modified: '1 week ago',
      type: 'pdf',
      owner: 'Analytics Team',
      collaborators: ['Marketing Team'],
      version: '1.0',
      status: 'final'
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return { bg: 'bg-red-50', color: 'text-red-500', label: 'PDF' };
      case 'doc':
        return { bg: 'bg-blue-50', color: 'text-blue-500', label: 'DOC' };
      case 'excel':
        return { bg: 'bg-emerald-50', color: 'text-emerald-500', label: 'XLS' };
      default:
        return { bg: 'bg-slate-50', color: 'text-slate-500', label: 'FILE' };
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
      signed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Signed' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
      template: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Template' },
      final: { bg: 'bg-slate-50', text: 'text-slate-700', label: 'Final' },
    };
    return badges[status] || badges.active;
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        {/* Folder Tree */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Folders</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  currentFolder === folder.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <folder.icon className="w-4 h-4" />
                  <span className="text-sm">{folder.name}</span>
                </div>
                <span className="text-xs text-slate-400">{folder.count}</span>
              </button>
            ))}
          </div>

          {/* Storage Info */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Storage Used</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full" style={{ width: '45%' }} />
            </div>
            <p className="text-xs text-slate-500 mt-2">4.5 GB of 10 GB used</p>
          </div>
        </div>

        {/* Document List */}
        <div className="col-span-3 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm">
                  <option>All Types</option>
                  <option>PDF</option>
                  <option>Documents</option>
                  <option>Spreadsheets</option>
                </select>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-2 gap-4">
            {documents.map((doc) => {
              const icon = getFileIcon(doc.type);
              const badge = getStatusBadge(doc.status);
              return (
                <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${icon.bg} flex items-center justify-center`}>
                        <span className={`text-xs font-bold ${icon.color}`}>{icon.label}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{doc.name}</h4>
                        <p className="text-xs text-slate-500">{doc.owner}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400">{doc.size}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400">v{doc.version}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400">{doc.modified}</span>
                  </div>

                  {/* Collaborators */}
                  {doc.collaborators.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-1">
                        {doc.collaborators.slice(0, 3).map((collab, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                            {collab.charAt(0)}
                          </div>
                        ))}
                        {doc.collaborators.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white">
                            +{doc.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {doc.collaborators.length} collaborator{doc.collaborators.length > 1 ? 's' : ''}
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-slate-500 rotate-45" />
              </button>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-slate-700 font-medium mb-1">Drag and drop files here</p>
              <p className="text-sm text-slate-500">or click to browse</p>
              <p className="text-xs text-slate-400 mt-3">Supports PDF, DOCX, XLSX up to 50MB</p>
              <input type="file" className="hidden" />
            </div>

            {/* Folder Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload to Folder</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            {/* Access Level */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Access Level</label>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 border-2 border-blue-500 bg-blue-50 rounded-lg text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Company</span>
                </button>
                <button className="p-3 border border-slate-200 rounded-lg text-center hover:border-slate-300 transition-colors">
                  <Users className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <span className="text-sm text-slate-600">Department</span>
                </button>
                <button className="p-3 border border-slate-200 rounded-lg text-center hover:border-slate-300 transition-colors">
                  <Eye className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <span className="text-sm text-slate-600">Private</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-teal-600 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work On Document Modal */}
      {showWorkModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${getFileIcon(selectedDoc.type).bg} flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${getFileIcon(selectedDoc.type).color}`}>
                    {getFileIcon(selectedDoc.type).label}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedDoc.name}</h3>
                  <p className="text-xs text-slate-500">Version {selectedDoc.version} | {selectedDoc.modified}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 mr-4">
                  {selectedDoc.collaborators.slice(0, 4).map((collab, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white" title={collab}>
                      {collab.charAt(0)}
                    </div>
                  ))}
                  <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white hover:bg-slate-200 transition-colors">
                    +
                  </button>
                </div>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Save
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
                <button className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Auto-saving
                  </span>
                </div>
              </div>

              {/* Document Content Placeholder */}
              <div className="h-full pt-12 p-8 overflow-auto">
                <div className="bg-white rounded-lg shadow-sm max-w-3xl mx-auto p-12 min-h-full">
                  <h1 className="text-2xl font-bold text-slate-800 mb-4">{selectedDoc.name.replace(/\.[^/.]+$/, '')}</h1>
                  <div className="text-slate-600 space-y-4">
                    <p>This is a preview of the document content. In a real implementation, this would show the actual document content with full editing capabilities.</p>
                    <p>Features available:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Real-time collaboration with team members</li>
                      <li>Version history and rollback</li>
                      <li>Comments and annotations</li>
                      <li>Track changes</li>
                      <li>Export to multiple formats</li>
                    </ul>
                    <p className="text-slate-400 text-sm mt-8">
                      Last edited by {selectedDoc.owner} | {selectedDoc.modified}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Panel Toggle */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Add Comment
                </button>
                <button className="text-sm text-slate-600 hover:text-slate-700">
                  Version History
                </button>
                <button className="text-sm text-slate-600 hover:text-slate-700">
                  Share
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {selectedDoc.collaborators.length + 1} editing
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CompanyAnalyticsView() {
  const [activeMetric, setActiveMetric] = useState('revenue');
  const [selectedCompanies, setSelectedCompanies] = useState(['TechCorp', 'GlobalSoft', 'DataDriven', 'InnovateTech']);

  const metrics = [
    { id: 'popularity', label: 'Consumer Popularity', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue Generated', icon: DollarSign },
    { id: 'hiring', label: 'Most Hiring', icon: Users },
    { id: 'tieups', label: 'Most Tie-ups', icon: Handshake },
  ];

  const chartData = {
    popularity: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      companies: {
        'TechCorp': [85, 88, 92, 89, 94, 96],
        'GlobalSoft': [78, 82, 80, 85, 88, 91],
        'DataDriven': [72, 75, 79, 82, 86, 89],
        'InnovateTech': [68, 71, 74, 78, 82, 85],
      },
    },
    revenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      companies: {
        'TechCorp': [2.1, 2.4, 2.8, 3.2, 3.5, 4.2],
        'GlobalSoft': [1.8, 2.0, 2.3, 2.6, 2.9, 3.1],
        'DataDriven': [1.2, 1.5, 1.8, 2.0, 2.2, 2.5],
        'InnovateTech': [0.9, 1.1, 1.4, 1.7, 2.0, 2.3],
      },
    },
    hiring: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      companies: {
        'TechCorp': [45, 52, 68, 75, 82, 95],
        'GlobalSoft': [38, 42, 55, 62, 70, 78],
        'DataDriven': [25, 30, 38, 45, 52, 60],
        'InnovateTech': [20, 25, 32, 40, 48, 55],
      },
    },
    tieups: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      companies: {
        'TechCorp': [8, 10, 12, 15, 18, 22],
        'GlobalSoft': [6, 7, 9, 11, 14, 16],
        'DataDriven': [4, 5, 7, 9, 11, 13],
        'InnovateTech': [3, 4, 6, 8, 10, 12],
      },
    },
  };

  const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#EF4444'];
  const yAxisLabel = {
    popularity: 'Popularity Score',
    revenue: 'Revenue ($M)',
    hiring: 'New Hires',
    tieups: 'Tie-ups Count',
  };

  return (
    <div className="space-y-6">
      {/* Metric Tabs */}
      <div className="flex gap-3">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setActiveMetric(metric.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeMetric === metric.id
                ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <metric.icon className="w-5 h-5" />
            {metric.label}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{metrics.find(m => m.id === activeMetric)?.label} Comparison</h3>
            <p className="text-sm text-slate-500">6-month trend analysis across companies</p>
          </div>
          <div className="flex items-center gap-4">
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        {/* Line Chart */}
        <div className="relative h-96">
          <CanvasLineChart
            data={chartData[activeMetric as keyof typeof chartData]}
            selectedCompanies={selectedCompanies}
            colors={colors}
            yAxisLabel={yAxisLabel[activeMetric as keyof typeof yAxisLabel]}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-slate-100">
          {selectedCompanies.map((company, index) => (
            <label key={company} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company)}
                onChange={() => {
                  if (selectedCompanies.includes(company)) {
                    if (selectedCompanies.length > 1) {
                      setSelectedCompanies(selectedCompanies.filter(c => c !== company));
                    }
                  } else {
                    setSelectedCompanies([...selectedCompanies, company]);
                  }
                }}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-sm font-medium text-slate-700">{company}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-4 gap-6">
        {selectedCompanies.map((company, index) => {
          const data = chartData[activeMetric as keyof typeof chartData].companies[company as keyof typeof chartData.popularity.companies];
          const latestValue = data[data.length - 1];
          const previousValue = data[data.length - 2];
          const growth = ((latestValue - previousValue) / previousValue * 100).toFixed(1);

          return (
            <div key={company} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colors[index] }}
                >
                  {company.charAt(0)}
                </div>
                <h4 className="font-semibold text-slate-800">{company}</h4>
              </div>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-slate-800">
                  {activeMetric === 'revenue' ? `$${latestValue}M` : latestValue.toLocaleString()}
                </p>
                <span className={`text-sm font-medium ${parseFloat(growth) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                </span>
              </div>
              <div className="h-16 flex items-end gap-1">
                {data.slice(-6).map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all duration-300"
                    style={{
                      height: `${(value / Math.max(...data)) * 100}%`,
                      backgroundColor: colors[index],
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-6">Financial Overview</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-700">$4.8M</p>
            <p className="text-xs text-emerald-600 mt-2">+15% from last quarter</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-1">Total Spending</p>
            <p className="text-2xl font-bold text-red-700">$2.1M</p>
            <p className="text-xs text-red-600 mt-2">-8% from last quarter</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Net Profit</p>
            <p className="text-2xl font-bold text-blue-700">$2.7M</p>
            <p className="text-xs text-blue-600 mt-2">+24% from last quarter</p>
          </div>
        </div>
      </div>

      {/* Spending & Customer Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {[
              { category: 'Salaries', amount: '$1.2M', percent: 57 },
              { category: 'Operations', amount: '$450K', percent: 21 },
              { category: 'Marketing', amount: '$280K', percent: 13 },
              { category: 'R&D', amount: '$170K', percent: 8 },
            ].map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{item.category}</span>
                  <span className="text-sm font-medium text-slate-800">{item.amount}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Customer Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Satisfaction</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">4.6</span>
                <span className="text-sm text-slate-500">/5</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Retention</p>
              <span className="text-2xl font-bold text-slate-800">92%</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">NPS Score</p>
              <span className="text-2xl font-bold text-slate-800">68</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Active Users</p>
              <span className="text-2xl font-bold text-slate-800">15.2K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasLineChart({ data, selectedCompanies, colors, yAxisLabel }: {
  data: { labels: string[]; companies: Record<string, number[]> };
  selectedCompanies: string[];
  colors: string[];
  yAxisLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 30, bottom: 50, left: 70 };

    ctx.clearRect(0, 0, width, height);

    // Calculate all values
    const allValues: number[] = [];
    selectedCompanies.forEach(company => {
      allValues.push(...data.companies[company]);
    });
    const maxVal = Math.max(...allValues);
    const minVal = Math.min(...allValues, 0);
    const valueRange = maxVal - minVal || 1;

    // Draw grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i * (height - padding.top - padding.bottom)) / gridLines;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

// Y-axis labels
      const value = maxVal - (i * valueRange) / gridLines;
      ctx.fillStyle = '#64748B';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding.left - 10, y + 4);
    }

    // Y-axis title
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(yAxisLabel, 0, 0);
    ctx.restore();

    // Draw lines for each company
    selectedCompanies.forEach((company, companyIndex) => {
      const points = data.companies[company].map((value, i) => ({
        x: padding.left + (i * (width - padding.left - padding.right)) / Math.max(data.labels.length - 1, 1),
        y: padding.top + (height - padding.top - padding.bottom) * (1 - (value - minVal) / valueRange),
      }));

      const color = colors[companyIndex % colors.length];

      // Draw gradient area
      ctx.beginPath();
      ctx.fillStyle = color + '15';
      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
      ctx.lineTo(points[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fill();

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      // Draw points
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // X-axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    data.labels.forEach((label, i) => {
      const x = padding.left + (i * (width - padding.left - padding.right)) / Math.max(data.labels.length - 1, 1);
      ctx.fillText(label, x, height - padding.bottom + 25);
    });
  }, [data, selectedCompanies, colors, yAxisLabel]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

function TieUpsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tie-ups</h1>
          <p className="text-slate-500">Connect with companies for partnerships and collaborations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
          <Handshake className="w-4 h-4 text-blue-600" />
          New Request
        </button>
      </div>

      {/* Suggested Companies */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-800">Suggested Companies</h3>
          <div className="flex items-center gap-2">
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-2">
              <option>Top Match</option>
              <option>Trending</option>
              <option>New</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              name: 'TechCorp Inc.',
              industry: 'Technology',
              score: 94,
              reason: 'Complementary services in AI/ML',
              status: 'not_connected' as const,
            },
            {
              name: 'GlobalSoft',
              industry: 'Software',
              score: 88,
              reason: 'Shared customer base',
              status: 'pending' as const,
            },
            {
              name: 'DataDriven Co.',
              industry: 'Analytics',
              score: 85,
              reason: 'Strategic partnership potential',
              status: 'connected' as const,
            },
          ].map((company) => (
            <div key={company.name} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-lg font-bold text-slate-600">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{company.name}</p>
                    <p className="text-sm text-slate-500">{company.industry}</p>
                    <p className="text-xs text-blue-600 mt-1">{company.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{company.score}</p>
                  <p className="text-xs text-slate-500">/100</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                {company.status === 'not_connected' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">Not connected</span>
                )}
                {company.status === 'pending' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">Pending</span>
                )}
                {company.status === 'connected' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">Connected</span>
                )}

                {company.status !== 'connected' ? (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    {company.status === 'pending' ? 'Requested' : 'Connect'}
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                    Manage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tie-up Requests */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Pending Requests</h3>
          <div className="space-y-3">
            {[
              { name: 'GlobalSoft', message: 'Partnership proposal for Q3 collaboration', time: '6h ago' },
              { name: 'InnovateTech', message: 'Co-marketing agreement and shared analytics', time: '1d ago' },
            ].map((r) => (
              <div key={r.name} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{r.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{r.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{r.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                      Accept
                    </button>
                    <button className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Connected Companies</h3>
          <div className="space-y-3">
            {[
              { name: 'TechCorp Inc.', type: 'AI/ML Services' },
              { name: 'DataDriven Co.', type: 'Analytics Platform' },
            ].map((c) => (
              <div key={c.name} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">{c.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{c.type}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeReviews() {
  const employees = [
    { name: 'Sarah Johnson', department: 'Engineering', rating: 4.8, reviews: 24, trend: '+2%' },
    { name: 'Mike Chen', department: 'Marketing', rating: 4.6, reviews: 19, trend: '+5%' },
    { name: 'Emily Davis', department: 'Sales', rating: 4.5, reviews: 31, trend: '+1%' },
    { name: 'James Wilson', department: 'Engineering', rating: 4.4, reviews: 15, trend: '-1%' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Employee Reviews</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search employees..."
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Employee</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Department</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Rating</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Reviews</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Trend</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-800">{emp.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{emp.department}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-slate-800">{emp.rating}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{emp.reviews}</td>
                <td className="py-4 px-6">
                  <span className={`text-sm font-medium ${emp.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {emp.trend}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}