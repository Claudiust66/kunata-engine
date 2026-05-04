'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Building2, Calendar, DollarSign, Percent, Settings2, Save, Activity, LayoutGrid, AlertCircle } from 'lucide-react';

export default function EntityDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. STATE: Added industryCategory and updated countryCode to 2 letters
  const [formData, setFormData] = useState({
    entityName: '',
    countryCode: 'CA',
    industryCategory: 'Financial Services',
    startYear: 2026,
    currency: 'USD',
    exchangeRate: 1.00,
    parValue: 1.00,
    dataEntryDAP: '2',
    reportingDAP: '2',
    taxLongName: 'Goods & Services Tax',
    taxShortName: 'GST %',
    taxCode: 'GST Code',
    modBank: false,
    modInsurance: false,
    modReinsurance: true,
    modHotel: false,
    modManufacturing: false,
    modRetail: false,
    modServices: false,
    modHybrid: false,
    mod9XX: false,
    modPayroll: true,
    modExpenses: true,
    modFixedAssets: true,
    modCapital: true,
    modOthers1: true,
    modOthers2: true,
    modCorpTax: true,
    modWACC: true,
    modValuation: true,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    // Basic Validation
    if (!formData.entityName) {
      setError('Please provide an Entity Name.');
      setLoading(false);
      return;
    }
    if (!formData.countryCode || formData.countryCode.length > 2) {
      setError('Country Code must be exactly 2 letters (e.g., CA, US).');
      setLoading(false);
      return;
    }
    if (!formData.industryCategory) {
      setError('Please provide an Industry Category.');
      setLoading(false);
      return;
    }

    try {
      // 2. PAYLOAD: Added industry_category to the Supabase insert
      const { data, error: insertError } = await supabase
        .from('entities')
        .insert([
          {
            entity_name: formData.entityName,
            country_code: formData.countryCode,
            industry_category: formData.industryCategory,
            start_year: formData.startYear,
            currency: formData.currency,
            exchange_rate: formData.exchangeRate,
            par_value: formData.parValue,
            data_entry_dap: formData.dataEntryDAP,
            reporting_dap: formData.reportingDAP,
            tax_long_name: formData.taxLongName,
            tax_short_name: formData.taxShortName,
            tax_code: formData.taxCode,
            mod_bank: formData.modBank,
            mod_insurance: formData.modInsurance,
            mod_reinsurance: formData.modReinsurance,
            mod_hotel: formData.modHotel,
            mod_manufacturing: formData.modManufacturing,
            mod_retail: formData.modRetail,
            mod_services: formData.modServices,
            mod_hybrid: formData.modHybrid,
            mod_9xx: formData.mod9XX,
            mod_payroll: formData.modPayroll,
            mod_expenses: formData.modExpenses,
            mod_fixed_assets: formData.modFixedAssets,
            mod_capital: formData.modCapital,
            mod_others1: formData.modOthers1,
            mod_others2: formData.modOthers2,
            mod_corp_tax: formData.modCorpTax,
            mod_wacc: formData.modWACC,
            mod_valuation: formData.modValuation
          }
        ]);

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

  const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button 
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#002D72] focus:ring-offset-2 ${checked ? 'bg-[#002D72]' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-[#002D72]" />
            Entity Configuration (DetE)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Define baseline parameters and activate analytical modules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#C5A059] hover:bg-[#a38042] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Configuration saved successfully to the database!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#002D72] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} /> Basic Information
            </h2>
            {/* 3. UI: Updated to grid-cols-4 and added Industry input */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name of Entity</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
                  value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="e.g. Pennarth Greene & Company Limited" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Country Code</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" maxLength={2} className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium uppercase" 
                    value={formData.countryCode} onChange={e => setFormData({...formData, countryCode: e.target.value.toUpperCase()})} placeholder="CA" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Industry</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
                    value={formData.industryCategory} onChange={e => setFormData({...formData, industryCategory: e.target.value})} placeholder="e.g. Retail" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Year</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="number" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.startYear} onChange={e => setFormData({...formData, startYear: parseInt(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Par Value</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="number" step="0.01" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.parValue} onChange={e => setFormData({...formData, parValue: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#002D72] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings2 size={18} /> Currency & Adjustments (DAP)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Currency (ShortForm)</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} placeholder="USD" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Exchange Rate (Prev Year)</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.exchangeRate} onChange={e => setFormData({...formData, exchangeRate: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Entry (DAP)</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm"
                  value={formData.dataEntryDAP} onChange={e => setFormData({...formData, dataEntryDAP: e.target.value})}>
                  <option value="0">0 = No Adjustment</option>
                  <option value="1">1 = Thousands (1,000)</option>
                  <option value="2">2 = Millions (1,000,000)</option>
                  <option value="3">3 = Billions (1,000,000,000)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reporting (DAP)</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm"
                  value={formData.reportingDAP} onChange={e => setFormData({...formData, reportingDAP: e.target.value})}>
                  <option value="0">0 = No Adjustment</option>
                  <option value="1">1 = Thousands (1,000)</option>
                  <option value="2">2 = Millions (1,000,000)</option>
                  <option value="3">3 = Billions (1,000,000,000)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#002D72] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent size={18} /> Tax Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name of Sales Tax (Long)</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.taxLongName} onChange={e => setFormData({...formData, taxLongName: e.target.value})} placeholder="Goods & Services Tax" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tax Code</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.taxCode} onChange={e => setFormData({...formData, taxCode: e.target.value})} placeholder="GST Code" />
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl shadow-sm border border-[#002D72]/20 p-6">
            <h2 className="text-lg font-bold text-[#002D72] mb-1 flex items-center gap-2">
              <LayoutGrid size={18} /> Sector Modules
            </h2>
            <p className="text-xs text-slate-500 mb-4 pb-3 border-b border-slate-200">Activate revenue models for this entity.</p>
            
            <ToggleSwitch label="1BK: Bank" checked={formData.modBank} onChange={() => setFormData({...formData, modBank: !formData.modBank})} />
            <ToggleSwitch label="2IN: Insurance" checked={formData.modInsurance} onChange={() => setFormData({...formData, modInsurance: !formData.modInsurance})} />
            <ToggleSwitch label="3RE: Reinsurance" checked={formData.modReinsurance} onChange={() => setFormData({...formData, modReinsurance: !formData.modReinsurance})} />
            <ToggleSwitch label="4HT: Hotel" checked={formData.modHotel} onChange={() => setFormData({...formData, modHotel: !formData.modHotel})} />
            <ToggleSwitch label="5MF: Manufacturing" checked={formData.modManufacturing} onChange={() => setFormData({...formData, modManufacturing: !formData.modManufacturing})} />
            <ToggleSwitch label="6RT: Retail" checked={formData.modRetail} onChange={() => setFormData({...formData, modRetail: !formData.modRetail})} />
            <ToggleSwitch label="7SV: Services" checked={formData.modServices} onChange={() => setFormData({...formData, modServices: !formData.modServices})} />
            <ToggleSwitch label="8HY: Hybrid" checked={formData.modHybrid} onChange={() => setFormData({...formData, modHybrid: !formData.modHybrid})} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#002D72] mb-1 flex items-center gap-2">
              <Activity size={18} /> Core Financials
            </h2>
            <p className="text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">Activate standard financial components.</p>

            <ToggleSwitch label="PY: Payroll" checked={formData.modPayroll} onChange={() => setFormData({...formData, modPayroll: !formData.modPayroll})} />
            <ToggleSwitch label="EX: General Expenses" checked={formData.modExpenses} onChange={() => setFormData({...formData, modExpenses: !formData.modExpenses})} />
            <ToggleSwitch label="FA: Fixed Assets" checked={formData.modFixedAssets} onChange={() => setFormData({...formData, modFixedAssets: !formData.modFixedAssets})} />
            <ToggleSwitch label="CAP: Capital" checked={formData.modCapital} onChange={() => setFormData({...formData, modCapital: !formData.modCapital})} />
            <ToggleSwitch label="Corporation Tax" checked={formData.modCorpTax} onChange={() => setFormData({...formData, modCorpTax: !formData.modCorpTax})} />
            <ToggleSwitch label="WACC + Enterprise Risk" checked={formData.modWACC} onChange={() => setFormData({...formData, modWACC: !formData.modWACC})} />
            <ToggleSwitch label="Valuation" checked={formData.modValuation} onChange={() => setFormData({...formData, modValuation: !formData.modValuation})} />
          </div>
        </div>
      </div>
    </div>
  );
}