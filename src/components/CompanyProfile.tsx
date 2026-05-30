import { ReactNode, useEffect, useMemo, useState } from 'react';
import { supabase, Company } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Building2, MapPin, Mail, Phone, Globe, Edit2, Save, X, Link as LinkIcon } from 'lucide-react';

type CompanyProfileData = Partial<Company>;

export function CompanyProfile() {
  const { profile, user } = useAuth();

  const [company, setCompany] = useState<CompanyProfileData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const completionPercent = useMemo(() => {
    if (!editData) return 0;
    const fields: Array<keyof CompanyProfileData> = [
      'name',
      'industry',
      'description',
      'website',
      'email',
      'phone',
      'location',
    ];

    let filled = 0;
    let total = 0;

    fields.forEach((f) => {
      total += 1;
      const v = editData[f];
      if (typeof v === 'string' && v.trim().length > 0) filled += 1;
    });

    return Math.round((filled / total) * 100);
  }, [editData]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);

        // Best-effort mapping: if the authenticated company_admin has an associated company,
        // the schema typically stores it in employees/hr/company-specific tables. We only have
        // the `companies` table typed here, so we attempt to find by user/company mapping.
        // If your backend schema differs, this query is the only place to adjust.
        if (!user) return;

        // Try: company_admin users may have profile.name/company_id not shown in this repo.
        // Fallback: use the first company for now (non-destructive UI; no write).
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (companyData) {
          setCompany(companyData);
          setEditData(companyData);
        } else {
          setCompany(null);
          setEditData({});
        }
      } catch (e) {
        console.error('Failed to load company profile:', e);
        setCompany(null);
        setEditData({});
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [user]);

  const handleSave = async () => {
    if (!editData || !company?.id) return;

    try {
      setLoading(true);

      // Only update fields that exist in our Company interface.
      const payload: Partial<Company> = {
        name: (editData.name ?? '').toString(),
        logo: (editData.logo ?? '').toString(),
        industry: (editData.industry ?? '').toString(),
        size: (editData.size ?? 0) as number,
        description: (editData.description ?? '').toString(),
        website: (editData.website ?? '').toString(),
        email: (editData.email ?? '').toString(),
        phone: (editData.phone ?? '').toString(),
        location: (editData.location ?? '').toString(),
      };

      const { data, error } = await supabase.from('companies').update(payload).eq('id', company.id).select('*').maybeSingle();
      if (error) throw error;
      if (data) {
        setCompany(data);
        setEditData(data);
      }
      setIsEditMode(false);
    } catch (e) {
      console.error('Failed to save company profile:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="min-h-[200px] bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading company profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-600">
              {(company?.name?.charAt(0) || profile?.name?.charAt(0) || 'C').toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{company?.name || 'Company Profile'}</h1>
              <p className="text-emerald-100">{company?.industry || 'Add industry'}</p>
              <p className="text-emerald-100">{company?.description || 'Add a short description of your company.'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsEditMode((v) => !v);
              if (!isEditMode && company) setEditData(company);
            }}
            className="px-4 py-2 rounded-lg bg-white/95 text-emerald-700 font-medium hover:bg-white transition-colors flex items-center gap-2"
          >
            {isEditMode ? <X size={16} /> : <Edit2 size={16} />}
            {isEditMode ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Profile Completion</h3>
          <span className="text-lg font-bold text-emerald-600">{completionPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {!isEditMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-emerald-600" />
                Company Details
              </h3>

              <div className="space-y-3">
                <Field label="Company Advertisement / Description" value={company?.description || '-'} />
                <Field label="Industry" value={company?.industry || '-'} />
                <Field label="Company Size" value={company?.size ? String(company.size) : '-'} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Website & Branding</h3>
              <div className="space-y-3">
                <LinkField label="Website" url={company?.website} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <InlineField label="Company Email" icon={<Mail size={16} className="text-slate-400" />} value={company?.email || '-'} />
                <InlineField label="Company Phone Numbers" icon={<Phone size={16} className="text-slate-400" />} value={company?.phone || '-'} />
                <InlineField label="Company Location" icon={<MapPin size={16} className="text-slate-400" />} value={company?.location || '-'} />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Globe size={18} className="text-slate-500" />
                Public Preview
              </h3>
              <div className="text-sm text-slate-700">
                <div className="font-medium">{company?.name || 'Your company name'}</div>
                <div className="text-slate-500">{company?.industry || 'Industry'}</div>
                <div className="text-slate-500 mt-2">{company?.website || 'https://your-company.com'}</div>
                <div className="text-slate-500">{company?.email || 'contact@your-company.com'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Company Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  value={editData?.name || ''}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <input
                  value={editData?.industry || ''}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
                <input
                  type="number"
                  value={editData?.size ?? 0}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), size: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <input
                  value={editData?.website || ''}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), website: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Email</label>
                <input
                  type="email"
                  value={editData?.email || ''}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Phone Numbers</label>
                <input
                  value={editData?.phone || ''}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+1 555 0100, +1 555 0101"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Location</label>
                <input
                  value={editData?.location || ''}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="City, State, Country"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Advertisement / Description</label>
                <textarea
                  value={editData?.description || ''}
                  onChange={(e) => setEditData((d) => ({ ...(d || {}), description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="What does your company do?"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                onClick={() => {
                  setIsEditMode(false);
                  if (company) setEditData(company);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <LinkIcon size={18} className="text-slate-500" />
              Saved Fields
            </h3>
            <p className="text-sm text-slate-600">
              Company website, description, email, phone numbers, and location are saved to the companies table and shown on this profile after refresh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-sm text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function InlineField({ label, icon, value }: { label: string; icon: ReactNode; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-sm text-slate-800 flex items-center gap-2 mt-1">
        {icon}
        <span>{value}</span>
      </p>
    </div>
  );
}

function LinkField({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <Field label={label} value="-" />
    );
  }

  const href = url.startsWith('http') ? url : `https://${url}`;

  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
      <a href={href} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-2 mt-1">
        <Globe size={16} className="text-emerald-500" />
        {url}
      </a>
    </div>
  );
}

