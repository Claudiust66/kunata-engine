'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Calculator, Save, Activity, AlertCircle, Percent, Scale, ShieldAlert } from 'lucide-react';

export default function TaxWaccForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('tax');

  const [entityName, setEntityName] = useState('');
  const [year, setYear] = useState(2026);

  const [tax, setTax] = useState({
    corporateTaxRate: 30.0,
    taxPaidAdvance: 0,
    addbackDepreciation: 0,
    addbackProvisions: 0
  });

  const [wacc, setWacc] = useState({
    riskFreeRate: 2.82,
    inflationDomicile: 14.9,
    inflationUSA: 2.0,
    unleveragedBeta: 0.5,
    marketRiskPremium: 18.6,
    debtRiskPremium: 3.5,
    countryRiskPremium: 6.75
  });

  const [risk, setRisk] = useState({
    country: 45.2,
    financial: 44.5,
    governance: 41.0,
    strategy: 40.6,
    operations: 41.3,
    reputational: 40.0
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!entityName) {
      setError('Please provide an Entity Name.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('core_tax_wacc').insert([{
        entity_name: entityName,
        year: year,
        corporate_tax_rate: tax.corporateTaxRate,
        tax_paid_advance: tax.taxPaidAdvance,
        addback_depreciation: tax.addbackDepreciation,
        addback_provisions: tax.addbackProvisions,
        risk_free_rate: wacc.riskFreeRate,
        inflation_domicile: wacc.inflationDomicile,
        inflation_usa: wacc.inflationUSA,
        unleveraged_beta: wacc.unleveragedBeta,
        market_risk_premium: wacc.marketRiskPremium,
        debt_risk_premium: wacc.debtRiskPremium,
        country_risk_premium: wacc.countryRiskPremium,
        risk_country: risk.country,
        risk_financial: risk.financial,
        risk_governance: risk.governance,
        risk_strategy: risk.strategy,
        risk_operations: risk.operations,
        risk_reputational: risk.reputational
      }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving Tax & WACC data:', err);
      setError(err.message || 'Failed to save configuration.');
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
            <Calculator className="text-[#002D72]" />
            Tax, WACC & Enterprise Risk
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Macro assumptions for valuation and post-tax cash flows.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Macro Assumptions'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Tax and Valuation Assumptions saved securely!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label>
            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
              value={entityName} onChange={e => setEntityName(e.target.value)} placeholder="e.g. Pennarth Greene & Company Limited" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label>
            <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
              value={year} onChange={e => setYear(parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        <button onClick={() => setActiveTab('tax')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'tax' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Percent size={16} /> Corporate Tax (CTX)
        </button>
        <button onClick={() => setActiveTab('wacc')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'wacc' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Scale size={16} /> Cost of Capital (WACC)
        </button>
        <button onClick={() => setActiveTab('risk')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'risk' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <ShieldAlert size={16} /> Enterprise Risk (RCR)
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-6">
        
        {/* TAB 1: CORPORATE TAX */}
        {activeTab === 'tax' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Corporate Tax Rate (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={tax.corporateTaxRate} onChange={e => setTax({...tax, corporateTaxRate: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tax Paid In Advance</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={tax.taxPaidAdvance} onChange={e => setTax({...tax, taxPaidAdvance: parseFloat(e.target.value)})} />
            </div>
            <div className="md:col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-[#002D72] mb-4">Temporary Differences (P&L Add-backs)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Depreciation & Amortisation</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={tax.addbackDepreciation} onChange={e => setTax({...tax, addbackDepreciation: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Provision for Bad Debts & Staff</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={tax.addbackProvisions} onChange={e => setTax({...tax, addbackProvisions: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WACC */}
        {activeTab === 'wacc' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#002D72]">Cost of Equity Parameters</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Risk Free Rate (%)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={wacc.riskFreeRate} onChange={e => setWacc({...wacc, riskFreeRate: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Inflation (Domicile) (%)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={wacc.inflationDomicile} onChange={e => setWacc({...wacc, inflationDomicile: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Inflation (USA) (%)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={wacc.inflationUSA} onChange={e => setWacc({...wacc, inflationUSA: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Unleveraged Beta</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={wacc.unleveragedBeta} onChange={e => setWacc({...wacc, unleveragedBeta: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Equity Market Risk Premium (%)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={wacc.marketRiskPremium} onChange={e => setWacc({...wacc, marketRiskPremium: parseFloat(e.target.value)})} />
            </div>

            <div className="md:col-span-3 pt-4 pb-3 border-b border-t border-slate-100 mt-2">
              <h3 className="text-sm font-bold text-[#002D72]">Cost of Debt Parameters</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Debt Risk Premium (%)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={wacc.debtRiskPremium} onChange={e => setWacc({...wacc, debtRiskPremium: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Country Risk Premium (%)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={wacc.countryRiskPremium} onChange={e => setWacc({...wacc, countryRiskPremium: parseFloat(e.target.value)})} />
            </div>
          </div>
        )}

        {/* TAB 3: ENTERPRISE RISK */}
        {activeTab === 'risk' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#002D72]">Risk Assessment Scoring (0 - 100)</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><ShieldAlert size={14}/> Country Risk</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={risk.country} onChange={e => setRisk({...risk, country: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><ShieldAlert size={14}/> Financial Risk</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={risk.financial} onChange={e => setRisk({...risk, financial: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><ShieldAlert size={14}/> Governance Risk</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={risk.governance} onChange={e => setRisk({...risk, governance: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><ShieldAlert size={14}/> Strategy Risk</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={risk.strategy} onChange={e => setRisk({...risk, strategy: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><ShieldAlert size={14}/> Operations Risk</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={risk.operations} onChange={e => setRisk({...risk, operations: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><ShieldAlert size={14}/> Reputational Risk</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={risk.reputational} onChange={e => setRisk({...risk, reputational: parseFloat(e.target.value)})} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}