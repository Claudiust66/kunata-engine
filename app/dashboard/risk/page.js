'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { ShieldAlert, Play, Activity, AlertCircle, Building2, Download, Printer } from 'lucide-react';

export default function RiskDashboard() {
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
      const { data, error: fetchError } = await supabase.from('entities').select('*').order('entity_name');
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
    const { data: exactData } = await supabase.from(tableName).select('*').eq('entity_name', entityName).order('year').limit(1);
    if (exactData && exactData.length > 0) return exactData[0];

    const { data: allData } = await supabase.from(tableName).select('*');
    if (allData && allData.length > 0) {
      let fuzzyMatch = null;
      allData.forEach(row => {
        const cleanDBName = row.entity_name.trim().toLowerCase();
        const cleanAppName = entityName.trim().toLowerCase();
        if (cleanDBName === cleanAppName || cleanDBName.includes(cleanAppName) || cleanAppName.includes(cleanDBName)) {
          fuzzyMatch = row;
        }
      });
      if (fuzzyMatch) return fuzzyMatch;
    }
    return null;
  };

  const handleRunModel = async () => {
    if (!selectedEntity) return;
    setLoading(true); setError(''); setResults(null);

    try {
      const { data: entArray } = await supabase.from('entities').select('*').eq('entity_name', selectedEntity).limit(1);
      const entityData = entArray && entArray.length > 0 ? entArray[0] : null;

      const { data: capArray } = await supabase.from('capital_structure').select('*').eq('entity_name', selectedEntity).order('year').limit(1);
      const capData = capArray && capArray.length > 0 ? capArray[0] : null;

      let totalDebt = 0; let cash = 0; let interestRate = 0; let taxRate = 0.30;
      if (capData) {
        totalDebt = parseNum(capData.total_debt);
        cash = parseNum(capData.cash_on_hand);
        interestRate = parseNum(capData.average_interest_rate_pct);
        taxRate = parseNum(capData.corporate_tax_rate_pct) / 100;
      }

      const { data: wcArray } = await supabase.from('core_working_capital').select('*').eq('entity_name', selectedEntity).limit(1);
      const wcData = wcArray && wcArray.length > 0 ? wcArray[0] : null;
      
      const currentAssets = cash + (wcData ? parseNum(wcData.accounts_receivable) + parseNum(wcData.inventory) : 0);
      const currentLiabilities = wcData ? parseNum(wcData.accounts_payable) : 0;
      const paidInCapital = wcData ? parseNum(wcData.paid_in_capital) : 0;

      const { data: assetData } = await supabase.from('core_fixed_assets').select('depreciation_amount').eq('entity_name', selectedEntity);
      let totalDepreciation = 0;
      if (assetData && assetData.length > 0) {
        totalDepreciation = assetData.reduce((sum, item) => sum + parseNum(item.depreciation_amount), 0);
      }

      let year1Rev = 0; let ebitda = 0;
      const industry = entityData?.industry_category || '';

      if (industry.includes('Banking') || industry.includes('Bank')) {
        const bank = await fetchSectorData('banking_financials', selectedEntity);
        if (bank) {
          const assets = parseNum(bank.interest_earning_assets);
          year1Rev = (assets * (parseNum(bank.net_interest_margin_pct) / 100)) + (assets * (parseNum(bank.non_interest_income_pct) / 100));
          ebitda = year1Rev - (year1Rev * (parseNum(bank.efficiency_ratio_pct) / 100)) - (assets * (parseNum(bank.provision_loss_pct) / 100));
        }
      } else if (industry.includes('Service')) {
        const sv = await fetchSectorData('services_financials', selectedEntity);
        if (sv) {
          year1Rev = (parseNum(sv.total_billable_staff) * parseNum(sv.target_billable_hours) * (parseNum(sv.utilization_pct) / 100)) * parseNum(sv.avg_hourly_rate);
          ebitda = year1Rev - (year1Rev * (parseNum(sv.direct_labor_cost_pct) / 100)); 
        }
      } else {
        year1Rev = 5000000; ebitda = 1250000; 
      }

      if (year1Rev === 0) throw new Error("No revenue drivers found for this entity.");

      const ebit = ebitda - totalDepreciation;
      const interestExpense = totalDebt * (interestRate / 100);
      const netIncome = (ebit - interestExpense) * (1 - taxRate);
      const totalEquity = paidInCapital + netIncome;

      const interestCoverage = interestExpense > 0 ? (ebit / interestExpense) : 99;
      const debtToEquity = totalEquity > 0 ? (totalDebt / totalEquity) : 0;
      const currentRatio = currentLiabilities > 0 ? (currentAssets / currentLiabilities) : 99;
      const debtToEbitda = ebitda > 0 ? (totalDebt / ebitda) : 0;

      let riskScore = 0;
      if (interestCoverage > 5) riskScore += 3; else if (interestCoverage > 2) riskScore += 1; else riskScore -= 2;
      if (debtToEquity < 1) riskScore += 3; else if (debtToEquity < 2.5) riskScore += 1; else riskScore -= 2;
      if (currentRatio > 1.5) riskScore += 2; else if (currentRatio > 1) riskScore += 1; else riskScore -= 2;
      if (debtToEbitda < 3) riskScore += 2; else if (debtToEbitda < 5) riskScore += 0; else riskScore -= 2;

      let riskGrade = 'CCC (High Risk)';
      let riskColor = 'text-rose-600';
      if (riskScore >= 8) { riskGrade = 'AAA (Prime)'; riskColor = 'text-emerald-600'; }
      else if (riskScore >= 6) { riskGrade = 'A (Low Risk)'; riskColor = 'text-emerald-500'; }
      else if (riskScore >= 3) { riskGrade = 'BBB (Moderate)'; riskColor = 'text-amber-500'; }
      else if (riskScore >= 0) { riskGrade = 'BB (Speculative)'; riskColor = 'text-amber-600'; }

      setResults({
        interestCoverage, debtToEquity, currentRatio, debtToEbitda, riskGrade, riskColor, riskScore,
        currency: entityData?.currency || 'USD'
      });

    } catch (err) {
      setError(err.message || 'Failed to run risk engine.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (!results) return;
    const rows = [
      ['Metric', 'Value', 'Target Threshold'],
      ['Interest Coverage', results.interestCoverage === 99 ? 'N/A' : `${results.interestCoverage.toFixed(2)}x`, '> 2.0x'],
      ['Debt-to-Equity', `${results.debtToEquity.toFixed(2)}x`, '< 2.5x'],
      ['Current Ratio', results.currentRatio === 99 ? 'N/A' : `${results.currentRatio.toFixed(2)}x`, '> 1.0x'],
      ['Debt-to-EBITDA', `${results.debtToEbitda.toFixed(2)}x`, '< 5.0x'],
      [],
      ['Synthetic Credit Grade', results.riskGrade, '']
    ];
    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${selectedEntity.replace(/\s+/g, '_')}_Risk_Rating.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans print:py-0 print:px-0">
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ShieldAlert className="text-[#002D72]" /> Credit & Risk Ratings</h1>
          <p className="text-slate-500 mt-1 text-sm">Standalone evaluation of entity leverage, liquidity, and default risk.</p>
        </div>
      </div>
      
      {error && <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold print:hidden"><AlertCircle size={18} /> {error}</div>}
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-end gap-4 print:hidden">
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
        <button onClick={handleRunModel} disabled={loading || !selectedEntity} className="w-full md:w-auto bg-[#002D72] hover:bg-[#001f4d] text-white px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70">
          {loading ? <Activity className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />} {loading ? 'Computing...' : 'Run Risk Analysis'}
        </button>
      </div>

      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end gap-3 mb-6 print:hidden">
            <button onClick={handleExportCSV} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"><Download size={16} /> Export CSV</button>
            <button onClick={handlePrint} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"><Printer size={16} /> Save PDF</button>
          </div>

          <div className="hidden print:block mb-8 text-center border-b-2 border-slate-800 pb-4">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">{selectedEntity}</h1>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Credit & Risk Assessment</p>
          </div>

          {/* MAIN RISK CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8 text-center relative overflow-hidden print:border-slate-300 print:shadow-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 p-4 opacity-5"><ShieldAlert size={150} /></div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 relative z-10">Assigned Synthetic Grade</h2>
            <p className={`text-6xl font-black ${results.riskColor} relative z-10 print:text-slate-900`}>{results.riskGrade}</p>
            <p className="text-slate-500 mt-4 text-sm max-w-lg mx-auto relative z-10">Calculated based on a weighted proprietary index evaluating interest coverage, debt reliance, and current liquidity constraints.</p>
          </div>

          {/* DETAILED BREAKDOWN TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Risk Metric</th>
                  <th className="px-6 py-4 text-right">Calculated Value</th>
                  <th className="px-6 py-4 text-right hidden sm:table-cell">Target Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">Interest Coverage Ratio</td>
                  <td className={`px-6 py-4 text-right font-bold ${results.interestCoverage > 2 || results.interestCoverage === 99 ? 'text-emerald-600' : 'text-rose-600'} print:text-slate-900`}>{results.interestCoverage === 99 ? 'N/A' : `${results.interestCoverage.toFixed(2)}x`}</td>
                  <td className="px-6 py-4 text-right text-slate-500 hidden sm:table-cell">{'> 2.0x'}</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">Debt-to-Equity Ratio</td>
                  <td className={`px-6 py-4 text-right font-bold ${results.debtToEquity < 2.5 ? 'text-emerald-600' : 'text-rose-600'} print:text-slate-900`}>{results.debtToEquity.toFixed(2)}x</td>
                  <td className="px-6 py-4 text-right text-slate-500 hidden sm:table-cell">{'< 2.5x'}</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">Current Ratio</td>
                  <td className={`px-6 py-4 text-right font-bold ${results.currentRatio > 1 || results.currentRatio === 99 ? 'text-emerald-600' : 'text-rose-600'} print:text-slate-900`}>{results.currentRatio === 99 ? 'N/A' : `${results.currentRatio.toFixed(2)}x`}</td>
                  <td className="px-6 py-4 text-right text-slate-500 hidden sm:table-cell">{'> 1.0x'}</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">Debt-to-EBITDA</td>
                  <td className={`px-6 py-4 text-right font-bold ${results.debtToEbitda < 5 ? 'text-emerald-600' : 'text-rose-600'} print:text-slate-900`}>{results.debtToEbitda.toFixed(2)}x</td>
                  <td className="px-6 py-4 text-right text-slate-500 hidden sm:table-cell">{'< 5.0x'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}