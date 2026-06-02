'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Building2, Calendar, DollarSign, Percent, Settings2, Save, Activity, LayoutGrid, AlertCircle } from 'lucide-react';

export default function EntityDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    entityName: '', countryCode: 'CA', industryCategory: 'Financial Services', startYear: 2026,
    currency: 'USD', exchangeRate: 1.00, parValue: 1.00, dataEntryDAP: '2', reportingDAP: '2',
    taxLongName: 'Goods & Services Tax', taxShortName: 'GST %', taxCode: 'GST Code',
    modBank: false, modInsurance: false, modReinsurance: true, modHotel: false,
    modManufacturing: false, modRetail: false, modServices: false, modHybrid: false,
    mod9XX: false, modPayroll: true, modExpenses: true, modFixedAssets: true,
    modCapital: true, modOthers1: true, modOthers2: true, modCorpTax: true,
    modWACC: true, modValuation: true,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(false); setError('');

    if (!formData.entityName) { setError('Please provide an Entity Name.'); setLoading(false); return; }
    if (!formData.countryCode || formData.countryCode.length > 2) { setError('Country Code must be exactly 2 letters (e.g., CA, US).'); setLoading(false); return; }
    if (!formData.industryCategory) { setError('Please provide an Industry Category.'); setLoading(false); return; }

    try {
      const { data, error: insertError } = await supabase.from('entities').insert([{
        entity_name: formData.entityName, country_code: formData.countryCode, industry_category: formData.industryCategory,
        start_year: formData.startYear, currency: formData.currency, exchange_rate: formData.exchangeRate, par_value: formData.parValue,
        data_entry_dap: formData.dataEntryDAP, reporting_dap: formData.reportingDAP, tax_long_name: formData.taxLongName,
        tax_short_name: formData.taxShortName, tax_code: formData.taxCode, mod_bank: formData.modBank, mod_insurance: formData.modInsurance,
        mod_reinsurance: formData.modReinsurance, mod_hotel: formData.modHotel, mod_manufacturing: formData.modManufacturing,
        mod_retail: formData.modRetail, mod_services: formData.modServices, mod_hybrid: formData.modHybrid, mod_9xx: formData.mod9XX,
        mod_payroll: formData.modPayroll, mod_expenses: formData.modExpenses, mod_fixed_assets: formData.modFixedAssets,
        mod_capital: formData.modCapital, mod_others1: formData.modOthers1, mod_others2: formData.modOthers2,
        mod_corp_tax: formData.modCorpTax, mod_wacc: formData.modWACC, mod_valuation: formData.modValuation
      }]);

      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving entity:', err);
      setError(err.message || 'Failed to save entity configuration.');
    } finally {
      setLoading(false);
    }
  };

  // CFO Mode: Tighter padding (py-1.5) and smaller text (text-xs)
  const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <button 
        type="button" onClick={onChange}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#002D72]' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out ${checked ? 'translate-x-4.5' : 'translate-x-1'}`} style={checked ? { transform: 'translateX(18px)' } : {}} />
      </button>
    </div>
  );

  return (
    // CFO Mode: Reduced top/bottom padding to maximize screen real estate
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* HEADER: Updated Copywriting */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-[#002D72]" size={20} />
            Step 1: Basic Entity Configuration
          </h1>
          <p className="text-slate-500 mt-1 text-xs">Define baseline parameters to initialize the database. Detailed financial data entry will be completed in subsequent modules.</p>
        </div>
        <button 
          onClick={handleSave} disabled={loading}
          className="bg-[#C5A059] hover:bg-[#a38042] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={16} /> : <Save size={16} />}
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {error && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold"><AlertCircle size={16} /> {error}</div>}
      {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold">Configuration saved successfully to the database!</div>}

      {/* CFO Mode: Tighter grid gaps (gap-4) and spacing (space-y-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-base font-bold text-[#002D72] mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 size={16} /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name of Entity</label>
                <input type="text" className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
                  value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="e.g. Pennarth Greene & Company Limited" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Country</label>
                <input type="text" maxLength={2} className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium uppercase text-center" 
                  value={formData.countryCode} onChange={e => setFormData({...formData, countryCode: e.target.value.toUpperCase()})} placeholder="CA" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Industry</label>
                <input type="text" className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
                  value={formData.industryCategory} onChange={e => setFormData({...formData, industryCategory: e.target.value})} placeholder="e.g. Retail" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Year</label>
                <input type="number" className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-center" 
                  value={formData.startYear} onChange={e => setFormData({...formData, startYear: parseInt(e.target.value)})} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-base font-bold text-[#002D72] mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Settings2 size={16} /> Currency & Adjustments (DAP)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Currency</label>
                <input type="text" className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-center" 
                  value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} placeholder="USD" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Par Value</label>
                <input type="number" step="0.01" className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-center" 
                  value={formData.parValue} onChange={e => setFormData({...formData, parValue: parseFloat(e.target.value)})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Exchange Rate (Prev Year)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input type="number" step="0.01" className="w-full pl-8 p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.exchangeRate} onChange={e => setFormData({...formData, exchangeRate: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Entry (DAP)</label>
                <select className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]"
                  value={formData.dataEntryDAP} onChange={e => setFormData({...formData, dataEntryDAP: e.target.value})}>
                  <option value="0">0 = No Adjustment</option>
                  <option value="1">1 = Thousands</option>
                  <option value="2">2 = Millions</option>
                  <option value="3">3 = Billions</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reporting (DAP)</label>
                <select className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]"
                  value={formData.reportingDAP} onChange={e => setFormData({...formData, reportingDAP: e.target.value})}>
                  <option value="0">0 = No Adjustment</option>
                  <option value="1">1 = Thousands</option>
                  <option value="2">2 = Millions</option>
                  <option value="3">3 = Billions</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-base font-bold text-[#002D72] mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Percent size={16} /> Tax Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name of Sales Tax (Long)</label>
                <input type="text" className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.taxLongName} onChange={e => setFormData({...formData, taxLongName: e.target.value})} placeholder="Goods & Services Tax" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tax Code</label>
                <input type="text" className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-center" 
                  value={formData.taxCode} onChange={e => setFormData({...formData, taxCode: e.target.value})} placeholder="GST" />
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl shadow-sm border border-[#002D72]/20 p-4">
            <h2 className="text-base font-bold text-[#002D72] mb-1 flex items-center gap-2">
              <LayoutGrid size={16} /> Sector Modules
            </h2>
            <p className="text-[10px] text-slate-500 mb-2 pb-2 border-b border-slate-200 uppercase tracking-wider font-bold">Activate Revenue Models</p>
            
            <ToggleSwitch label="1BK: Bank" checked={formData.modBank} onChange={() => setFormData({...formData, modBank: !formData.modBank})} />
            <ToggleSwitch label="2IN: Insurance" checked={formData.modInsurance} onChange={() => setFormData({...formData, modInsurance: !formData.modInsurance})} />
            <ToggleSwitch label="3RE: Reinsurance" checked={formData.modReinsurance} onChange={() => setFormData({...formData, modReinsurance: !formData.modReinsurance})} />
            <ToggleSwitch label="4HT: Hotel" checked={formData.modHotel} onChange={() => setFormData({...formData, modHotel: !formData.modHotel})} />
            <ToggleSwitch label="5MF: Manufacturing" checked={formData.modManufacturing} onChange={() => setFormData({...formData, modManufacturing: !formData.modManufacturing})} />
            <ToggleSwitch label="6RT: Retail" checked={formData.modRetail} onChange={() => setFormData({...formData, modRetail: !formData.modRetail})} />
            <ToggleSwitch label="7SV: Services" checked={formData.modServices} onChange={() => setFormData({...formData, modServices: !formData.modServices})} />
            <ToggleSwitch label="8HY: Hybrid" checked={formData.modHybrid} onChange={() => setFormData({...formData, modHybrid: !formData.modHybrid})} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-base font-bold text-[#002D72] mb-1 flex items-center gap-2">
              <Activity size={16} /> Core Financials
            </h2>
            <p className="text-[10px] text-slate-500 mb-2 pb-2 border-b border-slate-100 uppercase tracking-wider font-bold">Activate Standard Components</p>

            <ToggleSwitch label="PY: Payroll" checked={formData.modPayroll} onChange={() => setFormData({...formData, modPayroll: !formData.modPayroll})} />
            <ToggleSwitch label="EX: General Expenses" checked={formData.modExpenses} onChange={() => setFormData({...formData, modExpenses: !formData.modExpenses})} />
            <ToggleSwitch label="FA: Fixed Assets" checked={formData.modFixedAssets} onChange={() => setFormData({...formData, modFixedAssets: !formData.modFixedAssets})} />
            <ToggleSwitch label="CAP: Capital" checked={formData.modCapital} onChange={() => setFormData({...formData, modCapital: !formData.modCapital})} />
            <ToggleSwitch label="Corporation Tax" checked={formData.modCorpTax} onChange={() => setFormData({...formData, modCorpTax: !formData.modCorpTax})} />
            <ToggleSwitch label="WACC + Enterprise Risk" checked={formData.modWACC} onChange={() => setFormData({...formData, modWACC: !formData.modWACC})} />
            <ToggleSwitch label="Valuation Engine" checked={formData.modValuation} onChange={() => setFormData({...formData, modValuation: !formData.modValuation})} />
          </div>
        </div>
      </div>
    </div>
  );
}