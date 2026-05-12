'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Umbrella, Save, Activity, AlertCircle, FileText, TrendingDown, Shield } from 'lucide-react';

export default function ReinsuranceDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('premiums');

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Premiums
    assumedPremium: 120000000,
    retrocessionPct: 20.0,
    // Claims & Costs
    lossRatioPct: 65.0,
    commissionRatioPct: 15.0,
    expenseRatioPct: 10.0,
    // Reserves
    uprMarginPct: 35.0
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!formData.entityName) {
      setError('Please provide an Entity Name.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('reinsurance_financials')
        .insert([{
          entity_name: formData.entityName,
          year: formData.year,
          assumed_premium: formData.assumedPremium,
          retrocession_pct: formData.retrocessionPct,
          loss_ratio_pct: formData.lossRatioPct,
          commission_ratio_pct: formData.commissionRatioPct,
          expense_ratio_pct: formData.expenseRatioPct,
          upr_margin_pct: formData.uprMarginPct
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving reinsurance data:', err);
      setError(err.message || 'Failed to save reinsurance configuration.');
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
            <Umbrella className="text-[#002D72]" />
            Reinsurance Sector (3REI)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage assumed treaties, retrocession, claims, and reserves.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Reinsurance Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Reinsurance configuration saved securely!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label>
            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
              value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="e.g. Pennarth Greene Re" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label>
            <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
              value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('premiums')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'premiums' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <FileText size={16} /> Assumed & Retrocession
        </button>
        <button onClick={() => setActiveTab('claims')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'claims' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <TrendingDown size={16} /> Claims & Expenses
        </button>
        <button onClick={() => setActiveTab('reserves')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'reserves' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Shield size={16} /> Reserves
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-6">
        
        {/* TAB 1: PREMIUMS */}
        {activeTab === 'premiums' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assumed Premium</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.assumedPremium} onChange={e => setFormData({...formData, assumedPremium: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Premiums taken on from primary insurers.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Retrocession (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.retrocessionPct} onChange={e => setFormData({...formData, retrocessionPct: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Percentage of Assumed Premium passed to other reinsurers.</p>
            </div>
          </div>
        )}

        {/* TAB 2: CLAIMS & COSTS */}
        {activeTab === 'claims' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Loss Ratio (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                value={formData.lossRatioPct} onChange={e => setFormData({...formData, lossRatioPct: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Commission Ratio (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.commissionRatioPct} onChange={e => setFormData({...formData, commissionRatioPct: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Expense Ratio (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.expenseRatioPct} onChange={e => setFormData({...formData, expenseRatioPct: parseFloat(e.target.value)})} />
            </div>
            
            {/* Real-time Combined Ratio indicator */}
            <div className="md:col-span-3 mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Implied Combined Ratio</p>
                <p className="text-xs text-slate-500">Should ideally be below 100% for underwriting profitability.</p>
              </div>
              <div className={`text-xl font-black ${(formData.lossRatioPct + formData.commissionRatioPct + formData.expenseRatioPct) < 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {(formData.lossRatioPct + formData.commissionRatioPct + formData.expenseRatioPct).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESERVES */}
        {activeTab === 'reserves' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">UPR Margin (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.uprMarginPct} onChange={e => setFormData({...formData, uprMarginPct: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Unearned Premium Reserve relative to assumed premium.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}