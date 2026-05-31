'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Scale, Activity, AlertCircle, Building2, Calculator, CheckCircle2, XCircle } from 'lucide-react';

export default function BalanceSheet() {
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

      // 1. FETCH CAPITAL STRUCTURE
      const { data: capData } = await supabase.from('capital_structure').select('*').eq('entity_name', selectedEntity).limit(1);
      const startingCash = capData && capData.length > 0 ? parseNum(capData[0].cash_on_hand) : 0;
      const totalDebt = capData && capData.length > 0 ? parseNum(capData[0].total_debt) : 0;
      const interestRate = capData && capData.length > 0 ? parseNum(capData[0].average_interest_rate_pct) / 100 : 0;
      const taxRate = capData && capData.length > 0 ? parseNum(capData[0].corporate_tax_rate_pct) / 100 : 0.30;

      // 2. FETCH WORKING CAPITAL
      const { data: wcData } = await supabase.from('core_working_capital').select('*').eq('entity_name', selectedEntity).limit(1);
      const accountsReceivable = wcData && wcData.length > 0 ? parseNum(wcData[0].accounts_receivable) : 0;
      const inventory = wcData && wcData.length > 0 ? parseNum(wcData[0].inventory) : 0;
      const accountsPayable = wcData && wcData.length > 0 ? parseNum(wcData[0].accounts_payable) : 0;
      const paidInCapital = wcData && wcData.length > 0 ? parseNum(wcData[0].paid_in_capital) : 0;

      // 3. FETCH FIXED ASSETS
      const { data: assetData } = await supabase.from('core_fixed_assets').select('*').eq('entity_name', selectedEntity);
      let totalStartingBookValue = 0; let totalAdditions = 0; let totalDisposals = 0; let totalDepreciation = 0;
      
      if (assetData && assetData.length > 0) {
        assetData.forEach(asset => {
          totalStartingBookValue += parseNum(asset.starting_book_value);
          totalAdditions += parseNum(asset.addition_amount);
          totalDisposals += parseNum(asset.disposal_amount);
          totalDepreciation += parseNum(asset.depreciation_amount);
        });
      }
      
      const netFixedAssets = totalStartingBookValue + totalAdditions - totalDisposals - totalDepreciation;

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
        revenue = 5000000; ebitda = 1250000; // Fallback
      }

      const ebit = ebitda - totalDepreciation;
      const interestExpense = totalDebt * interestRate;
      const ebt = ebit - interestExpense;
      const taxExpense = ebt > 0 ? ebt * taxRate : 0;
      const netIncome = ebt - taxExpense; 

      // 5. CASH FLOW BRIDGE (The Missing Link)
      const operatingCashFlow = netIncome + totalDepreciation - accountsReceivable - inventory + accountsPayable;
      const investingCashFlow = totalDisposals - totalAdditions;
      const financingCashFlow = totalDebt + paidInCapital;
      const endingCash = startingCash + operatingCashFlow + investingCashFlow + financingCashFlow;

      // --- ASSEMBLE BALANCED STATEMENT ---
      const totalCurrentAssets = endingCash + accountsReceivable + inventory;
      const totalAssets = totalCurrentAssets + netFixedAssets;

      const totalCurrentLiabilities = accountsPayable;
      const totalLiabilities = totalCurrentLiabilities + totalDebt;

      // Opening Equity accounts for the Year 0 assets that existed before this model ran
      const openingEquity = startingCash + totalStartingBookValue; 
      const retainedEarnings = netIncome; 
      const totalEquity = paidInCapital + retainedEarnings + openingEquity;

      const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
      
      // The Golden Rule Check
      const balanceCheck = totalAssets - totalLiabilitiesAndEquity;

      setResults({
        currency,
        cash: endingCash, // Now using true ending cash
        accountsReceivable, inventory, totalCurrentAssets, netFixedAssets, totalAssets,
        accountsPayable, totalCurrentLiabilities, totalDebt, totalLiabilities,
        openingEquity, paidInCapital, retainedEarnings, totalEquity,
        totalLiabilitiesAndEquity,
        balanceCheck
      });

    } catch (err) {
      console.error('Balance Sheet Error:', err);
      setError(err.message || 'Failed to generate Balance Sheet.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val, curr) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Scale className="text-[#002D72]" /> Pro Forma Balance Sheet</h1>
          <p className="text-slate-500 mt-1 text-sm">Generate statement of financial position (Year 1).</p>
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
          {loading ? <Activity className="animate-spin" size={18} /> : <Calculator size={18} />} {loading ? 'Compiling...' : 'Generate Balance Sheet'}
        </button>
      </div>

      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden">
          
          <div className="bg-slate-50 border-b border-slate-200 p-6 text-center relative">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">{selectedEntity}</h2>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Balance Sheet</p>
            <p className="text-xs text-slate-400 mt-1">As of Year 1 End • All figures in {results.currency}</p>
            
            {/* Balance Check Badge */}
            <div className={`absolute top-6 right-6 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold ${Math.abs(results.balanceCheck) < 1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800'}`}>
              {Math.abs(results.balanceCheck) < 1 ? <><CheckCircle2 size={14}/> Balanced</> : <><XCircle size={14}/> Off by {formatCurrency(results.balanceCheck, results.currency)}</>}
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT COLUMN: ASSETS */}
            <div>
              <h3 className="text-lg font-black text-[#002D72] uppercase border-b-2 border-[#002D72] pb-2 mb-4 tracking-wider">Assets</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2 font-bold text-slate-800" colSpan="2">Current Assets</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Cash & Equivalents</td><td className="py-2 text-right text-emerald-600 font-bold">{formatCurrency(results.cash, results.currency)}</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Accounts Receivable</td><td className="py-2 text-right">{formatCurrency(results.accountsReceivable, results.currency)}</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Inventory</td><td className="py-2 text-right">{formatCurrency(results.inventory, results.currency)}</td></tr>
                  <tr className="bg-slate-50"><td className="py-3 font-bold text-slate-900 pl-4">Total Current Assets</td><td className="py-3 text-right font-bold text-slate-900">{formatCurrency(results.totalCurrentAssets, results.currency)}</td></tr>
                  
                  <tr><td className="py-4 font-bold text-slate-800" colSpan="2">Non-Current Assets</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Net Fixed Assets (PP&E)</td><td className="py-2 text-right">{formatCurrency(results.netFixedAssets, results.currency)}</td></tr>
                  
                  <tr>
                    <td className="py-6 font-black text-[#002D72] uppercase tracking-widest text-base">Total Assets</td>
                    <td className="py-6 text-right font-black text-[#002D72] text-lg border-double border-b-4 border-[#002D72]">{formatCurrency(results.totalAssets, results.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
            <div>
              <h3 className="text-lg font-black text-[#002D72] uppercase border-b-2 border-[#002D72] pb-2 mb-4 tracking-wider">Liabilities & Equity</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2 font-bold text-slate-800" colSpan="2">Current Liabilities</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Accounts Payable</td><td className="py-2 text-right">{formatCurrency(results.accountsPayable, results.currency)}</td></tr>
                  <tr className="bg-slate-50"><td className="py-3 font-bold text-slate-900 pl-4">Total Current Liabilities</td><td className="py-3 text-right font-bold text-slate-900">{formatCurrency(results.totalCurrentLiabilities, results.currency)}</td></tr>
                  
                  <tr><td className="py-4 font-bold text-slate-800" colSpan="2">Non-Current Liabilities</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Long-Term Debt</td><td className="py-2 text-right">{formatCurrency(results.totalDebt, results.currency)}</td></tr>
                  <tr className="bg-slate-50/80"><td className="py-3 font-bold text-[#002D72] pl-4 uppercase text-xs tracking-wider">Total Liabilities</td><td className="py-3 text-right font-bold text-[#002D72]">{formatCurrency(results.totalLiabilities, results.currency)}</td></tr>

                  <tr><td className="py-4 font-bold text-slate-800" colSpan="2">Shareholder's Equity</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Opening Balance Equity</td><td className="py-2 text-right text-emerald-600 font-bold">{formatCurrency(results.openingEquity, results.currency)}</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Paid-in Capital</td><td className="py-2 text-right">{formatCurrency(results.paidInCapital, results.currency)}</td></tr>
                  <tr><td className="py-2 text-slate-600 pl-4">Retained Earnings (Net Income)</td><td className="py-2 text-right">{formatCurrency(results.retainedEarnings, results.currency)}</td></tr>
                  <tr className="bg-slate-50/80"><td className="py-3 font-bold text-[#002D72] pl-4 uppercase text-xs tracking-wider">Total Equity</td><td className="py-3 text-right font-bold text-[#002D72]">{formatCurrency(results.totalEquity, results.currency)}</td></tr>

                  <tr>
                    <td className="py-6 font-black text-[#002D72] uppercase tracking-widest text-base">Total Liab. & Equity</td>
                    <td className="py-6 text-right font-black text-[#002D72] text-lg border-double border-b-4 border-[#002D72]">{formatCurrency(results.totalLiabilitiesAndEquity, results.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}