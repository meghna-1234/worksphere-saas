import { useState, useEffect, useRef } from 'react';
import { supabase, Company, MarketAnalytics } from '../lib/supabase';
import { TrendingUp, TrendingDown, Building, ChevronDown, Download } from 'lucide-react';

export function CompanyAnalytics() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<MarketAnalytics[]>([]);
  const [timeRange, setTimeRange] = useState('6M');
  const [metric, setMetric] = useState('revenue');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('*').limit(20);
    if (data) {
      setCompanies(data);
      // Select first 3 companies by default
      if (data.length > 0) {
        const defaultIds = data.slice(0, 3).map(c => c.id);
        setSelectedCompanies(defaultIds);
        fetchAnalytics(defaultIds);
      }
    } else {
      // Sample companies fallback
      const sampleCompanies: Company[] = [
        { id: 'sample-c-1', name: 'Acme Corp', industry: 'Tech' } as any,
        { id: 'sample-c-2', name: 'BrightWorks', industry: 'Fintech' } as any,
        { id: 'sample-c-3', name: 'Greenfield', industry: 'Healthcare' } as any,
      ];
      setCompanies(sampleCompanies);
      const defaultIds = sampleCompanies.map(c => c.id);
      setSelectedCompanies(defaultIds);
      fetchAnalytics(defaultIds);
    }
  };

  const fetchAnalytics = async (companyIds: string[]) => {
    const { data } = await supabase
      .from('market_analytics')
      .select('*')
      .in('company_id', companyIds)
      .order('date', { ascending: true });
    if (data && data.length > 0) {
      setAnalytics(data);
    } else {
      // Generate sample analytics when DB returns none
      const generateSample = () => {
        const now = new Date();
        const months = 6;
        const out: MarketAnalytics[] = [];
        for (let c = 0; c < companyIds.length; c++) {
          for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            out.push({
              id: `sample-${companyIds[c]}-${i}`,
              company_id: companyIds[c],
              date: d.toISOString(),
              revenue: Math.round((Math.random() * 50 + 10) * 10) / 10,
              spending: Math.round((Math.random() * 30 + 5) * 10) / 10,
              market_share: Math.round((Math.random() * 10 + 1) * 10) / 10,
              customer_satisfaction: Math.round((Math.random() * 20 + 70) * 10) / 10,
              employee_satisfaction: Math.round((Math.random() * 20 + 70) * 10) / 10,
              growth_rate: Math.round((Math.random() * 5 + 1) * 10) / 10,
            } as any);
          }
        }
        return out;
      };
      setAnalytics(generateSample());
    }
  };

  const toggleCompanySelection = (companyId: string) => {
    if (selectedCompanies.includes(companyId)) {
      const newSelection = selectedCompanies.filter(id => id !== companyId);
      setSelectedCompanies(newSelection);
      if (newSelection.length > 0) fetchAnalytics(newSelection);
    } else if (selectedCompanies.length < 5) {
      const newSelection = [...selectedCompanies, companyId];
      setSelectedCompanies(newSelection);
      fetchAnalytics(newSelection);
    }
  };

  const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#10B981', '#EF4444'];

  const getMetricLabel = (m: string) => {
    const labels: Record<string, string> = {
      revenue: 'Revenue ($M)',
      spending: 'Spending ($M)',
      market_share: 'Market Share (%)',
      customer_satisfaction: 'Customer Satisfaction',
      employee_satisfaction: 'Employee Satisfaction',
      growth_rate: 'Growth Rate (%)',
    };
    return labels[m] || m;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Company Analytics</h1>
          <p className="text-slate-500">Compare companies across multiple metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Company Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Building className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700">Compare Companies ({selectedCompanies.length}/5)</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {showCompanyDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-10 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="py-1">
                    {companies.map((company) => (
                      <label
                        key={company.id}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={() => toggleCompanySelection(company.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          disabled={!selectedCompanies.includes(company.id) && selectedCompanies.length >= 5}
                        />
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{company.name}</div>
                          <div className="text-xs text-slate-500">{company.industry}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Time Range */}
            <div className="flex rounded-lg bg-slate-100 p-1">
              {['1M', '3M', '6M', '1Y', 'All'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Selector */}
          <div className="relative">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-10 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="revenue">Revenue</option>
              <option value="spending">Spending</option>
              <option value="market_share">Market Share</option>
              <option value="customer_satisfaction">Customer Satisfaction</option>
              <option value="employee_satisfaction">Employee Satisfaction</option>
              <option value="growth_rate">Growth Rate</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Chart Container */}
        <p className="text-sm font-medium text-slate-600 mb-3">{getMetricLabel(metric)} comparison</p>
        <div className="relative h-96">
          <LineChart
            data={analytics.filter(a => selectedCompanies.includes(a.company_id))}
            companies={companies.filter(c => selectedCompanies.includes(c.id))}
            metric={metric}
            colors={colors}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-100">
          {selectedCompanies.map((companyId, index) => {
            const company = companies.find(c => c.id === companyId);
            if (!company) return null;
            return (
              <div key={companyId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index] }}
                />
                <span className="text-sm text-slate-600">{company.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-3 gap-6">
        {companies.slice(0, 6).map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, companies, metric, colors }: { data: MarketAnalytics[]; companies: Company[]; metric: string; colors: string[] }) {
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
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Group data by company
    const companyData: Record<string, MarketAnalytics[]> = {};
    data.forEach(d => {
      if (!companyData[d.company_id]) companyData[d.company_id] = [];
      companyData[d.company_id].push(d);
    });

    // Get min/max values
    const values = data.map(d => d[metric as keyof MarketAnalytics] as number || 0);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values);
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
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding.left - 10, y + 4);
    }

    // Draw lines for each company
    companies.forEach((company, companyIndex) => {
      const companyPoints = companyData[company.id] || [];
      if (companyPoints.length === 0) return;

      const color = colors[companyIndex % colors.length];
      const points = companyPoints.map((d, i) => {
        const x = padding.left + (i * (width - padding.left - padding.right)) / Math.max(companyPoints.length - 1, 1);
        const y = padding.top + (height - padding.top - padding.bottom) * (1 - ((d[metric as keyof MarketAnalytics] as number || 0) - minVal) / valueRange);
        return { x, y, value: d[metric as keyof MarketAnalytics] as number || 0 };
      });

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      // Draw area
      ctx.beginPath();
      ctx.fillStyle = color + '20';
      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
      ctx.lineTo(points[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fill();

      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // X-axis labels
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';

    const uniqueDates = [...new Set(data.map(d => d.date))].sort();
    const labelCount = Math.min(6, uniqueDates.length);
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor(i * (uniqueDates.length - 1) / Math.max(labelCount - 1, 1));
      const x = padding.left + (index * (width - padding.left - padding.right)) / Math.max(uniqueDates.length - 1, 1);
      const date = uniqueDates[index];
      ctx.fillText(date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '', x, height - padding.bottom + 20);
    }
  }, [data, companies, metric, colors]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
    />
  );
}

function CompanyCard({ company }: { company: Company }) {
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);

  useEffect(() => {
    const fetchLatestAnalytics = async () => {
      const { data } = await supabase
        .from('market_analytics')
        .select('*')
        .eq('company_id', company.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setAnalytics(data);
    };
    fetchLatestAnalytics();
  }, [company.id]);

  const growth = analytics?.growth_rate || 0;
  const isPositive = growth >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
            {company.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{company.name}</h3>
            <p className="text-sm text-slate-500">{company.industry}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Revenue</p>
          <p className="text-lg font-semibold text-slate-800">
            ${(analytics?.revenue || 0).toFixed(1)}M
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Market Share</p>
          <p className="text-lg font-semibold text-slate-800">
            {(analytics?.market_share || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      <button className="w-full mt-4 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        View Details
      </button>
    </div>
  );
}
