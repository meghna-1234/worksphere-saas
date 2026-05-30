import { ReactNode, useEffect, useMemo, useState } from 'react';
import { supabase, Company, Employee, MarketAnalytics } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Building, ChevronDown, Star, Target, TrendingUp } from 'lucide-react';

type EmployeeView = 'dashboard' | 'performance';
type MetricKey = 'revenue' | 'spending' | 'market_share' | 'customer_satisfaction' | 'employee_satisfaction' | 'growth_rate';

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

const colors = ['#0f766e', '#2563eb', '#d97706', '#16a34a', '#dc2626'];

export function EmployeeDashboard({ initialView = 'dashboard' }: { initialView?: EmployeeView }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<EmployeeView>(initialView);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user) return;
      setLoadingEmployee(true);
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setEmployee(data);
      setLoadingEmployee(false);
    };

    fetchEmployeeData();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as EmployeeView)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeView === tab.id ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loadingEmployee ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Loading employee data...</div>
      ) : activeView === 'dashboard' ? (
        <EmployeeOverview employee={employee} />
      ) : (
        <EmployeePerformance employee={employee} />
      )}
    </div>
  );
}

function EmployeeOverview({ employee }: { employee: Employee | null }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard icon={<Target className="w-6 h-6" />} label="Sales Target" value={`${employee?.sales_achieved || 78}%`} helper={`Target ${employee?.sales_target || 100}%`} />
        <MetricCard icon={<Star className="w-6 h-6" />} label="Customer Rating" value={(employee?.rating || 4.5).toFixed(1)} helper="Latest review average" />
        <MetricCard icon={<TrendingUp className="w-6 h-6" />} label="This Month" value="+15%" helper="Performance movement" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-6">Sales Target Progress</h3>
        <div className="space-y-6">
          {[
            { label: 'Quarterly Target', current: employee?.sales_achieved || 78, target: employee?.sales_target || 100 },
            { label: 'Customer Acquisitions', current: 45, target: 60 },
            { label: 'Pipeline Completion', current: 68, target: 85 },
          ].map((item) => {
            const percent = Math.min(100, Math.round((item.current / item.target) * 100));
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm text-slate-500">{item.current} / {item.target}</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-600 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CompanyComparison title="Company Comparison" description="Compare companies using available market analysis criteria." />
    </div>
  );
}

function EmployeePerformance({ employee }: { employee: Employee | null }) {
  const reviewData = {
    quality: 4.5,
    communication: 4.2,
    timeliness: 4.7,
    professionalism: 4.3,
  };

  const avgRating = Object.values(reviewData).reduce((sum, item) => sum + item, 0) / Object.values(reviewData).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Performance Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(reviewData).map(([key, value]) => (
              <div key={key} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 capitalize">{key}</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{value.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Customer Reviews</h3>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <span className="text-4xl font-bold text-slate-800">{avgRating.toFixed(1)}</span>
              <span className="text-slate-500">/5</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Based on recent reviews</p>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Client A', rating: 5, comment: 'Excellent work on the project.' },
              { name: 'Client B', rating: 4, comment: 'Clear communication and timely delivery.' },
              { name: 'Client C', rating: 5, comment: 'Went above expectations.' },
            ].map((review) => (
              <div key={review.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{review.name}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className={`w-3 h-3 ${index < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CompanyMarketTrend companyId={employee?.company_id} />
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
      { id: 'sample-1', name: 'Acme Corp', industry: 'SaaS' },
      { id: 'sample-2', name: 'BrightWorks', industry: 'Fintech' },
      { id: 'sample-3', name: 'Greenfield', industry: 'Healthcare' },
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
      if (current.includes(companyId)) return current.filter((id) => id !== companyId);
      if (current.length >= 5) return current;
      return [...current, companyId];
    });
  };

  const selectedCompanies = companies.filter((company) => selectedCompanyIds.includes(company.id));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

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
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            {(Object.keys(metricLabels) as MetricKey[]).map((key) => (
              <option key={key} value={key}>{metricLabels[key]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center text-slate-500">Loading company comparison...</div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      ) : selectedCompanies.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-500">Select at least one company to compare.</div>
      ) : (
        <>
          <LineGraph data={analytics.filter((item) => selectedCompanyIds.includes(item.company_id))} companies={selectedCompanies} metric={metric} />
          <GraphLegend companies={selectedCompanies} />
        </>
      )}
    </div>
  );
}

function CompanyMarketTrend({ companyId }: { companyId?: string }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [analytics, setAnalytics] = useState<MarketAnalytics[]>([]);
  const [metric, setMetric] = useState<MetricKey>('growth_rate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketTrend = async () => {
      setLoading(true);
      if (!companyId) {
        const fallbackCompany = { id: 'sample-company', name: 'Your Company', industry: 'Technology' } as Company;
        setCompany(fallbackCompany);
        setAnalytics(generateSampleAnalytics([fallbackCompany.id]));
        setLoading(false);
        return;
      }

      const [{ data: companyData }, { data: analyticsData }] = await Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).maybeSingle(),
        supabase.from('market_analytics').select('*').eq('company_id', companyId).order('date', { ascending: true }),
      ]);

      setCompany(companyData);
      setAnalytics(analyticsData && analyticsData.length > 0 ? analyticsData : generateSampleAnalytics([companyId]));
      setLoading(false);
    };

    fetchMarketTrend();
  }, [companyId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="font-semibold text-slate-800">Company Market Analysis</h3>
          <p className="text-sm text-slate-500 mt-1">{company?.name || 'Company'} performance trends</p>
        </div>
        <select
          value={metric}
          onChange={(event) => setMetric(event.target.value as MetricKey)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        >
          {(Object.keys(metricLabels) as MetricKey[]).map((key) => (
            <option key={key} value={key}>{metricLabels[key]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center text-slate-500">Loading market analysis...</div>
      ) : (
        <LineGraph data={analytics} companies={company ? [company] : []} metric={metric} />
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

  if (data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-slate-500">No market analysis data available for this selection.</div>;
  }

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
          const line = points.map((point) => `${point.x},${point.y}`).join(' ');
          return (
            <g key={company.id}>
              <polyline points={line} fill="none" stroke={colors[companyIndex % colors.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

function MetricCard({ icon, label, value, helper }: { icon: ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-4">{icon}</div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      <p className="text-xs text-slate-400 mt-2">{helper}</p>
    </div>
  );
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
