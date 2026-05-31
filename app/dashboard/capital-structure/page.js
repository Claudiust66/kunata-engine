'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Landmark, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Percent, Scale, TrendingUp, ShieldAlert } from 'lucide-react';

export default function CapitalStructureForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Liquidity & Debt
    cashOnHand: 2500000,
    totalDebt: 5000000,
    averageInterestRatePct: 6.5,
    // Macro & Risk
    corporateTaxRatePct: 21.0,
    beta: 1.2,
    riskFreeRatePct: 4.5,
    marketRiskPremiumPct: 5.5,
    // Capital Mix
    targetEquityMixPct: 60.0,
    targetDebtMixPct: 40.0
  });

  // Fetch entities for our foolproof dropdown
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
        .from('capital_structure')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          cash_on_hand: formData.cashOnHand,
          total_debt: formData.totalDebt,
          average_interest_rate_pct: formData.averageInterestRatePct,
          corporate_tax_rate_pct: formData.corporateTaxRatePct,
          beta: formData.beta,
          risk_free_rate_pct: formData.riskFreeRatePct,
          market_risk_premium_pct: formData.marketRiskPremiumPct,
          target_equity_mix_pct: formData.targetEquityMixPct,
          target_debt_mix_pct: formData.targetDebtMixPct
        }], { onConflict: 'entity_name, year' }); // Built-in protection

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving capital structure:', err);
      setError(err.message || 'Failed to save capital configuration.');
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
            Capital Structure & Macro
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Configure debt, liquidity, and macroeconomic drivers for WACC and Ratings.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Capital Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Capital structure saved securely! Ready for WACC calculations.
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Debt & Liquidity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <DollarSign size={18} /> Balance Sheet Basics
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cash on Hand ($)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.cashOnHand} onChange={e => setFormData({...formData, cashOnHand: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Outstanding Debt ($)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3.5 text-rose-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.totalDebt} onChange={e => setFormData({...formData, totalDebt: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avg. Interest Rate (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-rose-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.averageInterestRatePct} onChange={e => setFormData({...formData, averageInterestRatePct: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

        {/* Macro & Market Risk */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <TrendingUp size={18} /> Macro & Market Risk
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Corporate Tax Rate (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.corporateTaxRatePct} onChange={e => setFormData({...formData, corporateTaxRatePct: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Beta</label>
              <div className="relative">
                <ShieldAlert size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" step="0.01" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.beta} onChange={e => setFormData({...formData, beta: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Risk-Free Rate (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.riskFreeRatePct} onChange={e => setFormData({...formData, riskFreeRatePct: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Market Prem (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.marketRiskPremiumPct} onChange={e => setFormData({...formData, marketRiskPremiumPct: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

        {/* Capital Mix Target */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Scale size={18} /> Target Capital Mix
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Equity Weight (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.targetEquityMixPct} onChange={e => setFormData({...formData, targetEquityMixPct: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Debt Weight (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.targetDebtMixPct} onChange={e => setFormData({...formData, targetDebtMixPct: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="pt-2">
               <p className="text-xs text-slate-500 italic">
                 Note: These weights are used to calculate the final Weighted Average Cost of Capital (WACC). Ensure they add up to 100%.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}