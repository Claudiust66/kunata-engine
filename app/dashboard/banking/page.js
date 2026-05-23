'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Landmark, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Percent, TrendingUp, ShieldAlert } from 'lucide-react';

export default function BankingDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Core Balance Sheet
    interestEarningAssets: 500000000,
    // Revenue Drivers
    netInterestMarginPct: 3.5,
    nonInterestIncomePct: 1.5, // As a % of Interest-Earning Assets
    // Cost & Risk Drivers
    efficiencyRatioPct: 55.0, // Non-interest expense as % of total revenue
    provisionLossPct: 0.5 // Provision for credit losses as % of assets
  });

  // Fetch entities for the dropdown to prevent typos
  useEffect(() => {
    const fetchEntities = async () => {
      const { data } = await supabase.from('entities').select('entity_name').order('entity_name');
      if (data) setEntities(data);
    };
    fetchEntities();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!formData.entityName) {
      setError('Please select an Entity.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('banking_financials')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          fiscal_year: formData.year, // <--- WE ADDED THIS TO MAKE THE DB HAPPY
          interest_earning_assets: formData.interestEarningAssets,
          net_interest_margin_pct: formData.netInterestMarginPct,
          non_interest_income_pct: formData.nonInterestIncomePct,
          efficiency_ratio_pct: formData.efficiencyRatioPct,
          provision_loss_pct: formData.provisionLossPct
        }], { onConflict: 'entity_name, year' }); // Upsert prevents duplicate rows!

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving banking data:', err);
      setError(err.message || 'Failed to save banking configuration. Check your Supabase table columns.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="text-[#002D72]" />
            Banking Sector
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage interest-earning assets, NIM, and efficiency ratios.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Banking Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Banking configuration saved securely!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* THE FOOLPROOF DROPDOWN */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Entity</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-3 text-slate-400" />
              <select 
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium"
                value={formData.entityName}
                onChange={e => setFormData({...formData, entityName: e.target.value})}
              >
                <option value="" disabled>Select an entity...</option>
                {entities.map(ent => (
                  <option key={ent.entity_name} value={ent.entity_name}>{ent.entity_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
              <input type="number" className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Assets & Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <TrendingUp size={18} /> Balance Sheet & Revenue
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Interest-Earning Assets ($)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.interestEarningAssets} onChange={e => setFormData({...formData, interestEarningAssets: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Net Interest Margin (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                  <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.netInterestMarginPct} onChange={e => setFormData({...formData, netInterestMarginPct: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Non-Interest Inc. (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                  <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.nonInterestIncomePct} onChange={e => setFormData({...formData, nonInterestIncomePct: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Costs & Risk Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldAlert size={18} /> Costs & Provisions
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Efficiency Ratio (%)</label>
              <p className="text-xs text-slate-400 mb-2">Non-interest expenses as a percentage of total revenue.</p>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-rose-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.efficiencyRatioPct} onChange={e => setFormData({...formData, efficiencyRatioPct: parseFloat(e.target.value)})} />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Provision for Credit Losses (%)</label>
              <p className="text-xs text-slate-400 mb-2">Expected losses as a percentage of interest-earning assets.</p>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-rose-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.provisionLossPct} onChange={e => setFormData({...formData, provisionLossPct: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}