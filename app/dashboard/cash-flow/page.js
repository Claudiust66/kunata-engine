'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { ArrowRightLeft, Activity, AlertCircle, Building2, Calculator, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function CashFlowStatement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data, error: fetchError } = await supabase.from('entities').select('entity_name, industry_category, currency').order('entity_name');
      if (fetchError) throw fetchError;
      setEntities(data || []);
      if (data && data.length > 0) setSelectedEntity(data[0].entity_name);
    } catch (err) {
      console.error('Error fetching entities:', err);
    }
  };

  const parseNum = (val) => {
    if (val === null || val === undefined) return 0;
    const parsed = Number(String(val).replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchSectorData = async (tableName, entityName) => {
    const { data } = await supabase.from(tableName).select('*').eq('entity_name', entityName).order('year').limit(1);
    return data && data.length > 0 ? data[0] : null;
  };

  const handleGenerateStatement = async () => {
    if (!selectedEntity) return;
    setLoading(true); setError(''); setResults(null);

    try {
      const entityInfo = entities.find(e => e.entity_name === selectedEntity);
      const industry = entityInfo?.industry_category || '';
      const currency = entityInfo?.currency || 'USD';

      // 1. FETCH CAPITAL STRUCTURE (Starting Cash, Debt, Interest, Taxes)
      const { data: capData } = await supabase.from('capital_structure').select('*').eq('entity_name', selectedEntity).limit(1);
      const startingCash = capData && capData.length > 0 ? parseNum(capData[0].cash_on_hand) : 0;
      const totalDebt = capData && capData.length > 0 ? parseNum(capData[0].total_debt) : 0;
      const interestRate = capData && capData.length > 0 ? parseNum(capData[0].average_interest_rate_pct) / 100 : 0;
      const taxRate = capData && capData.length > 0 ? parseNum(capData[0].corporate_tax_rate_pct) / 100 : 0.30;

      // 2. FETCH WORKING CAPITAL (AR, Inventory, AP, Equity)
      const { data: wcData } = await supabase.from('core_working_capital').select('*').eq('entity_name', selectedEntity).limit(1);
      const accountsReceivable = wcData && wcData.length > 0 ? parseNum(wcData[0].accounts_receivable) : 0;
      const inventory = wcData && wcData.length > 0 ? parseNum(wcData[0].inventory) : 0;
      const accountsPayable = wcData && wcData.length > 0 ? parseNum(wcData[0].accounts_payable) : 0;
      const paidInCapital = wcData && wcData.length > 0 ? parseNum(wcData[0].paid_in_capital) : 0;

      // 3. FETCH FIXED ASSETS (Additions, Disposals, Depreciation)
      const { data: assetData } = await supabase.from('core_fixed_assets').select('*').eq('entity_name', selectedEntity);
      let totalAdditions = 0; let totalDisposals = 0; let totalDepreciation = 0;
      
      if (assetData && assetData.length > 0) {
        assetData.forEach(asset => {
          totalAdditions += parseNum(asset.addition_amount);
          totalDisposals += parseNum(asset.disposal_amount);
          totalDepreciation += parseNum(asset.depreciation_amount);
        });
      }

      // 4. CALCULATE NET INCOME (Silent Engine)
      let revenue = 0; let ebitda = 0;
      if (industry.includes('Banking') || industry.includes('Bank')) {
        const bank = await fetchSectorData('banking_financials', selectedEntity);
        if (bank) {
          revenue = parseNum(bank.interest_earning_assets) * (parseNum(bank.net_interest_margin_pct) / 100) + parseNum(bank.interest_earning_assets) * (parseNum(bank.non_interest_income_pct) / 100);
          ebitda = revenue - (revenue * (parseNum(bank.efficiency_ratio_pct) / 100)) - (parseNum(bank.interest_earning_assets) * (parseNum(bank.provision_loss_pct) / 100));
        }
      } else if (industry.includes('Service')) {
        const sv = await fetchSectorData('services_financials', selectedEntity);
        if (sv) {
          revenue = (parseNum(sv.total_billable_staff) * parseNum(sv.target_billable_hours) * (parseNum(sv.utilization_pct) / 100)) * parseNum(sv.avg_hourly_rate);
          ebitda = revenue - (revenue * (parseNum(sv.direct_labor_cost_pct) / 100)); 
        }
      } else {
        revenue = 5000000; ebitda = 1250000; 
      }

      const netIncome = (ebitda - totalDepreciation - (totalDebt * interestRate)) * (1 - taxRate);

      // --- CASH FLOW MATH ---
      
      // Operating Cash Flow
      // Net Income + Non-Cash Expenses (Depreciation) - Increases in Current Assets + Increases in Current Liab.
      const operatingCashFlow = netIncome + totalDepreciation - accountsReceivable - inventory + accountsPayable;

      // Investing Cash Flow
      const investingCashFlow = totalDisposals - totalAdditions;

      // Financing Cash Flow
      const financingCashFlow = totalDebt + paidInCapital;

      // Net Change & Ending Cash
      const netChangeInCash = operatingCashFlow + investingCashFlow + financingCashFlow;
      const endingCash = startingCash + netChangeInCash;

      setResults({
        currency,
        startingCash,
        netIncome, totalDepreciation, accountsReceivable, inventory, accountsPayable, operatingCashFlow,
        totalAdditions, totalDisposals, investingCashFlow,
        totalDebt, paidInCapital, financingCashFlow,
        netChangeInCash,
        endingCash
      });

    } catch (err) {
      console.error('Cash Flow Error:', err);
      setError(err.message || 'Failed to generate Cash Flow Statement.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val, curr) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ArrowRightLeft className="text-[#002D72]" /> Statement of Cash Flows</h1>
          <p className="text-slate-500 mt-1 text-sm">Track the movement of cash through operations, investing, and financing.</p>
        </div>
      </div>
      
      {error && <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold"><AlertCircle size={18} /> {error}</div>}
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Entity</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-3 text-slate-400" />
            <select className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)}>
              <option value="" disabled>Select an entity...</option>
              {entities.map(ent => <option key={ent.entity_name} value={ent.entity_name}>{ent.entity_name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleGenerateStatement} disabled={loading || !selectedEntity} className="w-full md:w-auto bg-[#002D72] hover:bg-[#001f4d] text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70">
          {loading ? <Activity className="animate-spin" size={18} /> : <Calculator size={18} />} {loading ? 'Compiling...' : 'Generate Cash Flow'}
        </button>
      </div>

      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden">
          
          <div className="bg-slate-50 border-b border-slate-200 p-6 text-center relative">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">{selectedEntity}</h2>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Statement of Cash Flows</p>
            <p className="text-xs text-slate-400 mt-1">For the Year Ended (Year 1) • All figures in {results.currency}</p>
          </div>

          <div className="p-8">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                
                {/* Starting Cash */}
                <tr className="bg-slate-50/50"><td className="py-4 font-bold text-slate-900">Cash at Beginning of Year</td><td className="py-4 text-right font-bold text-slate-900">{formatCurrency(results.startingCash, results.currency)}</td></tr>

                {/* Operating Activities */}
                <tr><td className="py-4 font-black text-[#002D72] uppercase tracking-wider text-xs" colSpan="2">Cash Flows from Operating Activities</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Net Income</td><td className="py-2 text-right">{formatCurrency(results.netIncome, results.currency)}</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Depreciation & Amortization</td><td className="py-2 text-right">{formatCurrency(results.totalDepreciation, results.currency)}</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Increase in Accounts Receivable</td><td className="py-2 text-right text-rose-600">({formatCurrency(results.accountsReceivable, results.currency)})</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Increase in Inventory</td><td className="py-2 text-right text-rose-600">({formatCurrency(results.inventory, results.currency)})</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Increase in Accounts Payable</td><td className="py-2 text-right text-emerald-600">{formatCurrency(results.accountsPayable, results.currency)}</td></tr>
                <tr className="bg-slate-50/80"><td className="py-3 font-bold text-slate-900 pl-4">Net Cash from Operations</td><td className="py-3 text-right font-bold text-slate-900">{formatCurrency(results.operatingCashFlow, results.currency)}</td></tr>

                {/* Investing Activities */}
                <tr><td className="py-4 font-black text-[#002D72] uppercase tracking-wider text-xs" colSpan="2">Cash Flows from Investing Activities</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Capital Expenditures (Asset Purchases)</td><td className="py-2 text-right text-rose-600">({formatCurrency(results.totalAdditions, results.currency)})</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Proceeds from Asset Disposals</td><td className="py-2 text-right text-emerald-600">{formatCurrency(results.totalDisposals, results.currency)}</td></tr>
                <tr className="bg-slate-50/80"><td className="py-3 font-bold text-slate-900 pl-4">Net Cash from Investing</td><td className="py-3 text-right font-bold text-slate-900">{formatCurrency(results.investingCashFlow, results.currency)}</td></tr>

                {/* Financing Activities */}
                <tr><td className="py-4 font-black text-[#002D72] uppercase tracking-wider text-xs" colSpan="2">Cash Flows from Financing Activities</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Proceeds from Long-Term Debt</td><td className="py-2 text-right text-emerald-600">{formatCurrency(results.totalDebt, results.currency)}</td></tr>
                <tr><td className="py-2 text-slate-600 pl-4">Proceeds from Paid-in Capital</td><td className="py-2 text-right text-emerald-600">{formatCurrency(results.paidInCapital, results.currency)}</td></tr>
                <tr className="bg-slate-50/80"><td className="py-3 font-bold text-slate-900 pl-4">Net Cash from Financing</td><td className="py-3 text-right font-bold text-slate-900">{formatCurrency(results.financingCashFlow, results.currency)}</td></tr>

                {/* Net Change */}
                <tr><td className="py-4 font-bold text-slate-800" colSpan="2"></td></tr>
                <tr className="bg-slate-100">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    {results.netChangeInCash >= 0 ? <ArrowUpCircle size={16} className="text-emerald-600" /> : <ArrowDownCircle size={16} className="text-rose-600" />}
                    Net Change in Cash
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(results.netChangeInCash, results.currency)}</td>
                </tr>

                {/* FINAL ENDING CASH */}
                <tr>
                  <td className="py-6 font-black text-[#002D72] uppercase tracking-widest text-base">Cash at End of Year</td>
                  <td className="py-6 text-right font-black text-[#C5A059] text-2xl border-double border-b-4 border-[#C5A059]">{formatCurrency(results.endingCash, results.currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}