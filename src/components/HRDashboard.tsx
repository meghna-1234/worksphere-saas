import { ReactNode, useEffect, useMemo, useState } from 'react';
import { supabase, Company, Employee, MarketAnalytics, Profile } from '../lib/supabase';
import {
  BarChart3,
  Building,
  ChevronDown,
  DollarSign,
  ExternalLink,
  FileText,
  Handshake,
  Star,
  TrendingUp,
  Users,
  X,
  ShieldAlert,
  Scale,
} from 'lucide-react';

type HRSidebarPage = 'dashboard' | 'employees' | 'documents' | 'analytics' | 'tieups' | 'disputes';
type MetricKey = 'revenue' | 'spending' | 'market_share' | 'customer_satisfaction' | 'employee_satisfaction' | 'growth_rate';
type EmployeeRow = Employee & { profile?: Profile; company?: Company };

const colors = ['#2563eb', '#0f766e', '#d97706', '#16a34a', '#dc2626'];
const metricLabels: Record<MetricKey, string> = {
  revenue: 'Revenue',
  spending: 'Spending',
  market_share: 'Market Share',
  customer_satisfaction: 'Customer Satisfaction',
  employee_satisfaction: 'Employee Satisfaction',
  growth_rate: 'Growth Rate',
};
const metricSuffix: Record<MetricKey, string> = {
  revenue: 'M',
  spending: 'M',
  market_share: '%',
  customer_satisfaction: '',
  employee_satisfaction: '',
  growth_rate: '%',
};

export function HRDashboard({ activePage }: { activePage?: HRSidebarPage }) {
  const page: HRSidebarPage = activePage ?? 'dashboard';

  return (
    <div className="space-y-6">
      {page === 'dashboard' && <DashboardOverview />}
      {page === 'documents' && <DocumentVault />}
      {page === 'analytics' && <CompanyAnalyticsView />}
      {page === 'tieups' && <TieUpsPage />}
      {page === 'employees' && <EmployeeReviews />}
      {page === 'disputes' && <DisputesArbitration />}
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard icon={<Users className="w-6 h-6" />} label="Total Employees" value="247" helper="+12% this month" />
        <MetricCard icon={<FileText className="w-6 h-6" />} label="Active Projects" value="18" helper="+8% this month" />
        <MetricCard icon={<DollarSign className="w-6 h-6" />} label="Revenue This Month" value="$1.2M" helper="+24% this month" />
        <MetricCard icon={<Handshake className="w-6 h-6" />} label="Active Tie-ups" value="12" helper="3 pending" />
      </div>

      <RevenueSpendingGraph />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CompanyComparison title="Company Comparison" description="Compare selected companies using HR/Admin analysis criteria." />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}

function RevenueSpendingGraph() {
  const [data, setData] = useState<MarketAnalytics[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      setLoading(true);
      const { data: companies } = await supabase.from('companies').select('*').limit(1);
      const activeCompany = companies?.[0] || ({ id: 'sample-company', name: 'Current Company', industry: 'Technology' } as Company);
      setCompany(activeCompany);

      const { data: analytics } = await supabase
        .from('market_analytics')
        .select('*')
        .eq('company_id', activeCompany.id)
        .order('date', { ascending: true });

      setData(analytics && analytics.length > 0 ? analytics : generateSampleAnalytics([activeCompany.id]));
      setLoading(false);
    };

    fetchFinancials();
  }, []);

  const graphData = useMemo(() => {
    if (!company) return [];
    return data.flatMap((item) => [
      { ...item, company_id: `${company.id}-revenue`, revenue: item.revenue },
      { ...item, company_id: `${company.id}-spending`, revenue: item.spending },
    ]) as MarketAnalytics[];
  }, [company, data]);

  const graphCompanies = company
    ? [
        { ...company, id: `${company.id}-revenue`, name: 'Revenue' },
        { ...company, id: `${company.id}-spending`, name: 'Spending' },
      ]
    : [];

  return (
    <Section title="Revenue vs Spending" icon={<DollarSign className="w-5 h-5 text-emerald-600" />}>
      <p className="text-sm text-slate-500 mb-4">{company?.name || 'Company'} financial trend using available market analytics.</p>
      {loading ? <LoadingBlock label="Loading revenue and spending..." /> : <LineGraph data={graphData} companies={graphCompanies} metric="revenue" />}
    </Section>
  );
}

function RecentActivity() {
  return (
    <Section title="Recent Activity" icon={<TrendingUp className="w-5 h-5 text-blue-600" />}>
      <div className="space-y-4">
        {[
          'New employee joined',
          'Document updated',
          'Tie-up request sent',
          'Payment processed',
          'Review submitted',
        ].map((text, index) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">{index + 1}</div>
            <div>
              <p className="text-sm font-medium text-slate-800">{text}</p>
              <p className="text-xs text-slate-500">{2 + index * 2}h ago</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CompanyAnalyticsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500">Compare companies by selected market criteria.</p>
      </div>
      <CompanyComparison title="Company Analytics Comparison" description="Select multiple companies and one comparison criterion to update the graph dynamically." />
    </div>
  );
}

function CompanyComparison({ title, description }: { title: string; description: string }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [analytics, setAnalytics] = useState<MarketAnalytics[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedCompanyIds);
  }, [selectedCompanyIds.join('|')]);

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    const { data, error: companyError } = await supabase.from('companies').select('*').limit(20);

    if (companyError) {
      setError(companyError.message || 'Unable to load companies.');
      setLoading(false);
      return;
    }

    const fallbackCompanies = [
      { id: 'sample-1', name: 'TechCorp Inc.', industry: 'Technology' },
      { id: 'sample-2', name: 'GlobalSoft', industry: 'Software' },
      { id: 'sample-3', name: 'DataDriven Co.', industry: 'Analytics' },
    ] as Company[];
    const loadedCompanies = data && data.length > 0 ? data : fallbackCompanies;
    setCompanies(loadedCompanies);
    setSelectedCompanyIds(loadedCompanies.slice(0, 3).map((company) => company.id));
    setLoading(false);
  };

  const fetchAnalytics = async (companyIds: string[]) => {
    if (companyIds.length === 0) {
      setAnalytics([]);
      return;
    }

    const { data } = await supabase
      .from('market_analytics')
      .select('*')
      .in('company_id', companyIds)
      .order('date', { ascending: true });

    setAnalytics(data && data.length > 0 ? data : generateSampleAnalytics(companyIds));
  };

  const toggleCompany = (companyId: string) => {
    setSelectedCompanyIds((current) => {
      if (current.includes(companyId)) return current.length === 1 ? current : current.filter((id) => id !== companyId);
      if (current.length >= 5) return current;
      return [...current, companyId];
    });
  };

  const selectedCompanies = companies.filter((company) => selectedCompanyIds.includes(company.id));

  return (
    <Section title={title} icon={<BarChart3 className="w-5 h-5 text-blue-600" />}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <p className="text-sm text-slate-500">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              className="w-full sm:w-64 flex items-center justify-between gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="inline-flex items-center gap-2 text-slate-700">
                <Building className="w-4 h-4 text-slate-500" />
                Companies ({selectedCompanyIds.length}/5)
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-72 overflow-auto">
                {companies.map((company) => (
                  <label key={company.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCompanyIds.includes(company.id)}
                      onChange={() => toggleCompany(company.id)}
                      disabled={!selectedCompanyIds.includes(company.id) && selectedCompanyIds.length >= 5}
                      className="w-4 h-4"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{company.name}</span>
                      <span className="block text-xs text-slate-500">{company.industry || 'Industry not set'}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value as MetricKey)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {(Object.keys(metricLabels) as MetricKey[]).map((key) => (
              <option key={key} value={key}>{metricLabels[key]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading companies..." />
      ) : error ? (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      ) : selectedCompanies.length === 0 ? (
        <LoadingBlock label="Select at least one company to compare." />
      ) : (
        <>
          <LineGraph data={analytics.filter((item) => selectedCompanyIds.includes(item.company_id))} companies={selectedCompanies} metric={metric} />
          <GraphLegend companies={selectedCompanies} />
        </>
      )}
    </Section>
  );
}

function DocumentVault() {
  const documents = [
    { name: 'Q1 Financial Report 2024.xlsx', owner: 'Sarah Johnson', status: 'Active', modified: '2 days ago' },
    { name: 'Tie-up Agreement - TechCorp Inc.pdf', owner: 'John Smith', status: 'Signed', modified: '1 week ago' },
    { name: 'Employee Handbook 2024.docx', owner: 'HR Department', status: 'Active', modified: '2 weeks ago' },
    { name: 'Market Analysis Report Q1.pdf', owner: 'Analytics Team', status: 'Final', modified: '1 week ago' },
  ];

  return (
    <Section title="Document Vault" icon={<FileText className="w-5 h-5 text-blue-600" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((document) => (
          <div key={document.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{document.name}</p>
                <p className="text-sm text-slate-600 mt-1">Owner: {document.owner}</p>
                <p className="text-xs text-slate-500 mt-2">Modified {document.modified}</p>
              </div>
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{document.status}</span>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <ExternalLink className="w-4 h-4" />
              View Document
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TieUpsPage() {
  const [selectedCompany, setSelectedCompany] = useState<{ name: string; industry: string; type: string; score?: number; reason?: string } | null>(null);
  const connected = [
    { name: 'TechCorp Inc.', industry: 'Technology', type: 'AI/ML Services', score: 94, reason: 'Complementary services in AI/ML' },
    { name: 'DataDriven Co.', industry: 'Analytics', type: 'Analytics Platform', score: 85, reason: 'Strategic partnership potential' },
  ];

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Pending Requests" icon={<Handshake className="w-5 h-5 text-amber-600" />}>
          <div className="space-y-3">
            {[
              { name: 'GlobalSoft', message: 'Partnership proposal for Q3 collaboration', time: '6h ago' },
              { name: 'InnovateTech', message: 'Co-marketing agreement and shared analytics', time: '1d ago' },
            ].map((request) => (
              <div key={request.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-800">{request.name}</p>
                <p className="text-sm text-slate-600 mt-1">{request.message}</p>
                <p className="text-xs text-slate-400 mt-2">{request.time}</p>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">Accept</button>
                  <button className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Connected Companies" icon={<Building className="w-5 h-5 text-blue-600" />}>
          <div className="space-y-3">
            {connected.map((company) => (
              <div key={company.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">{company.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{company.type}</p>
                </div>
                <button
                  onClick={() => setSelectedCompany(company)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {selectedCompany && (
        <Modal title={selectedCompany.name} onClose={() => setSelectedCompany(null)}>
          <div className="space-y-4">
            <InfoGrid items={[
              { label: 'Industry', value: selectedCompany.industry },
              { label: 'Partnership Type', value: selectedCompany.type },
              { label: 'Match Score', value: `${selectedCompany.score || 0}/100` },
              { label: 'Status', value: 'Connected' },
            ]} />
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Partnership Rationale</p>
              <p className="text-sm text-blue-700 mt-1">{selectedCompany.reason || 'Long-term connected company relationship.'}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EmployeeReviews() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const { data } = await supabase.from('employees').select('*').limit(20);

      if (!data || data.length === 0) {
        setEmployees([
          { id: 'sample-1', department: 'Engineering', position: 'Senior Engineer', rating: 4.8, sales_target: 100, sales_achieved: 92, profile: { name: 'Sarah Johnson', phone: '+1 555 0120', location: 'New York' }, company: { name: 'TechCorp Inc.' } } as EmployeeRow,
          { id: 'sample-2', department: 'Marketing', position: 'Marketing Lead', rating: 4.6, sales_target: 100, sales_achieved: 88, profile: { name: 'Mike Chen', phone: '+1 555 0150', location: 'Austin' }, company: { name: 'GlobalSoft' } } as EmployeeRow,
        ]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(data.map((employee) => employee.user_id))];
      const companyIds = [...new Set(data.map((employee) => employee.company_id))];
      const [{ data: profiles }, { data: companies }] = await Promise.all([
        supabase.from('profiles').select('*').in('user_id', userIds),
        supabase.from('companies').select('*').in('id', companyIds),
      ]);
      const profilesByUserId = (profiles || []).reduce<Record<string, Profile>>((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {});
      const companiesById = (companies || []).reduce<Record<string, Company>>((acc, company) => {
        acc[company.id] = company;
        return acc;
      }, {});

      setEmployees(data.map((employee) => ({
        ...employee,
        profile: profilesByUserId[employee.user_id],
        company: companiesById[employee.company_id],
      })) as EmployeeRow[]);
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Employee Reviews</h3>
          <div className="flex items-center gap-3">
            <input type="text" placeholder="Search employees..." className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading employees..." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Employee</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Department</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Rating</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Company</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium">
                        {employee.profile?.name?.charAt(0) || 'E'}
                      </div>
                      <span className="font-medium text-slate-800">{employee.profile?.name || 'Employee'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{employee.department || employee.position || 'Not set'}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-slate-800">{(employee.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{employee.company?.name || 'Company'}</td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => setSelectedEmployee(employee)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEmployee && (
        <Modal title={selectedEmployee.profile?.name || 'Employee Profile'} onClose={() => setSelectedEmployee(null)}>
          <InfoGrid items={[
            { label: 'Company', value: selectedEmployee.company?.name || 'Not set' },
            { label: 'Department', value: selectedEmployee.department || 'Not set' },
            { label: 'Position', value: selectedEmployee.position || 'Not set' },
            { label: 'Employee Code', value: selectedEmployee.employee_code || 'Not set' },
            { label: 'Rating', value: `${(selectedEmployee.rating || 0).toFixed(1)} / 5` },
            { label: 'Sales Progress', value: `${selectedEmployee.sales_achieved || 0}% of ${selectedEmployee.sales_target || 0}%` },
            { label: 'Phone', value: selectedEmployee.profile?.phone || 'Not shared' },
            { label: 'Location', value: selectedEmployee.profile?.location || 'Not shared' },
          ]} />
        </Modal>
      )}
    </div>
  );
}

function LineGraph({ data, companies, metric }: { data: MarketAnalytics[]; companies: Company[]; metric: MetricKey }) {
  const chart = useMemo(() => {
    const width = 900;
    const height = 320;
    const padding = { top: 24, right: 24, bottom: 42, left: 58 };
    const values = data.map((item) => Number(item[metric]) || 0);
    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);
    const range = max - min || 1;
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const dates = [...new Set(data.map((item) => item.date))].sort();
    const companyData = companies.map((company) => ({
      company,
      points: data
        .filter((item) => item.company_id === company.id)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((item, index, items) => {
          const x = padding.left + (index * innerWidth) / Math.max(items.length - 1, 1);
          const y = padding.top + innerHeight * (1 - ((Number(item[metric]) || 0) - min) / range);
          return { x, y, value: Number(item[metric]) || 0 };
        }),
    }));

    return { width, height, padding, innerWidth, innerHeight, min, max, dates, companyData };
  }, [data, companies, metric]);

  if (data.length === 0) return <LoadingBlock label="No market analysis data available for this selection." />;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="min-w-[720px] w-full h-80" role="img" aria-label={`${metricLabels[metric]} line graph`}>
        {[0, 1, 2, 3, 4].map((line) => {
          const y = chart.padding.top + (line * chart.innerHeight) / 4;
          const value = chart.max - ((chart.max - chart.min) * line) / 4;
          return (
            <g key={line}>
              <line x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={y} y2={y} stroke="#e2e8f0" />
              <text x={chart.padding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[12px]">
                {value.toFixed(1)}{metricSuffix[metric]}
              </text>
            </g>
          );
        })}

        {chart.companyData.map(({ company, points }, companyIndex) => {
          if (points.length === 0) return null;
          return (
            <g key={company.id}>
              <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={colors[companyIndex % colors.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point, index) => (
                <g key={`${company.id}-${index}`}>
                  <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke={colors[companyIndex % colors.length]} strokeWidth="2" />
                  <title>{company.name}: {point.value.toFixed(2)}{metricSuffix[metric]}</title>
                </g>
              ))}
            </g>
          );
        })}

        {chart.dates.slice(0, 6).map((date, index, labels) => {
          const x = chart.padding.left + (index * chart.innerWidth) / Math.max(labels.length - 1, 1);
          return (
            <text key={date} x={x} y={chart.height - 14} textAnchor="middle" className="fill-slate-400 text-[12px]">
              {new Date(date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function GraphLegend({ companies }: { companies: Company[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 mt-5 pt-5 border-t border-slate-100">
      {companies.map((company, index) => (
        <div key={company.id} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
          <span className="text-sm text-slate-600">{company.name}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">{icon}{title}</h3>
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value, helper }: { icon: ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4">{icon}</div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      <p className="text-xs text-slate-400 mt-2">{helper}</p>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">{item.label}</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return <div className="h-80 flex items-center justify-center text-slate-500">{label}</div>;
}

function generateSampleAnalytics(companyIds: string[]) {
  const now = new Date();
  const out: MarketAnalytics[] = [];

  companyIds.forEach((companyId, companyIndex) => {
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const base = companyIndex * 8 + (6 - i) * 3;
      out.push({
        id: `sample-${companyId}-${i}`,
        company_id: companyId,
        date: date.toISOString(),
        revenue: 18 + base + Math.round(Math.random() * 5),
        spending: 8 + base / 2 + Math.round(Math.random() * 4),
        market_share: 4 + companyIndex * 2 + (6 - i) * 0.5,
        customer_satisfaction: 72 + companyIndex * 3 + (6 - i) * 1.8,
        employee_satisfaction: 70 + companyIndex * 2 + (6 - i) * 1.6,
        growth_rate: 2 + companyIndex + (6 - i) * 0.8,
      } as MarketAnalytics);
    }
  });

  return out;
}

function DisputesArbitration() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionType, setResolutionType] = useState<'release' | 'refund'>('release');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDisputes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('escrow_wallets')
        .select('*, job:jobs(title), company:companies(name), student:students(user_id)')
        .eq('status', 'disputed');

      if (fetchErr) throw fetchErr;

      const userIds = [...new Set((data || []).map(d => d.student?.user_id).filter(Boolean))];
      const { data: studentProfiles } = userIds.length
        ? await supabase.from('profiles').select('*').in('user_id', userIds)
        : { data: [] };

      const profilesByUserId = (studentProfiles || []).reduce<Record<string, Profile>>((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      setDisputes((data || []).map(d => ({
        ...d,
        studentProfile: d.student ? profilesByUserId[d.student.user_id] : undefined
      })));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch disputes. Simulation mode enabled.');
      setDisputes([
        { id: 'mock-dispute-1', amount: 500, dispute_reason: 'Delivered work did not meet code coverage standards.', student_work_notes: 'Uploaded all test suites to repo.', job: { title: 'React Dashboard UI' }, company: { name: 'TechCorp' }, studentProfile: { name: 'Aarav Mehta' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async () => {
    if (!resolvingId) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    const { error: resolveErr } = await supabase.rpc('resolve_escrow_dispute', {
      p_escrow_id: resolvingId,
      p_resolution: resolutionType,
      p_notes: notes
    });

    if (resolveErr) {
      setError(resolveErr.message || 'Failed to resolve dispute.');
      setDisputes(prev => prev.filter(d => d.id !== resolvingId));
      setSuccess(`Dispute resolved in simulation mode: ${resolutionType === 'release' ? 'Released to student' : 'Refunded to company'}`);
      setResolvingId(null);
    } else {
      setSuccess(`Dispute resolved successfully: ${resolutionType === 'release' ? 'Released to student' : 'Refunded to company'}`);
      setResolvingId(null);
      setNotes('');
      fetchDisputes();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disputes & Arbitration Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Review locked contract disputes and resolve them securely as a third-party arbitrator.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} className="font-bold">×</button>
        </div>
      )}

      <Section title="Active Escrow Disputes" icon={<ShieldAlert className="w-5 h-5 text-red-600" />}>
        {loading ? (
          <LoadingBlock label="Loading active disputes..." />
        ) : disputes.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">No active disputes requiring arbitration. All contracts are clear.</div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="p-5 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{dispute.job?.title || 'Contract Assignment'}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Company: <span className="font-medium text-slate-800">{dispute.company?.name || 'Company'}</span> • 
                      Student: <span className="font-medium text-slate-800">{dispute.studentProfile?.name || 'Student'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">${Number(dispute.amount).toLocaleString()}</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 bg-red-100 text-red-700">Awaiting Arbitration</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs">
                    <p className="font-semibold text-red-900 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-600" /> Company Dispute Claim:</p>
                    <p className="text-slate-600 mt-1 whitespace-pre-wrap">"{dispute.dispute_reason || 'No reason specified'}"</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs">
                    <p className="font-semibold text-blue-900 flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-600" /> Student Work Deliverables:</p>
                    <p className="text-slate-600 mt-1 whitespace-pre-wrap">"{dispute.student_work_notes || 'No deliverables submitted yet'}"</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResolvingId(dispute.id);
                      setResolutionType('release');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Scale className="w-4 h-4" />
                    Resolve: Release to Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResolvingId(dispute.id);
                      setResolutionType('refund');
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Scale className="w-4 h-4" />
                    Resolve: Refund Company
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {resolvingId && (
        <Modal title="Confirm Arbitration Resolution" onClose={() => setResolvingId(null)}>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1">
              <p className="font-semibold">Selected Resolution:</p>
              <p className="capitalize font-bold text-sm text-blue-900 font-medium">
                {resolutionType === 'release' ? 'Release Escrow to Student' : 'Refund Escrow to Company'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Arbitration Settlement Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Describe the reasoning and settlement details for this arbitration decision..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolvingId(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={submitting || !notes.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting Resolution...' : 'Apply Settlement'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
