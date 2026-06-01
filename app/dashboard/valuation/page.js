'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { LineChart, Play, Activity, AlertCircle, DollarSign, TrendingUp, Building2, Scale, Landmark, ShieldAlert, CheckCircle2, AlertTriangle, Download, Printer } from 'lucide-react';

export default function ValuationEngine() {
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
      console.log("Fetching entities for Valuation Engine...");
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

    console.warn(`Exact DB match failed for ${tableName}. Initiating Deep Scan...`);
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
      console.log("--- MASTER ENGINE RUN INITIATED ---");
      
      const { data: entArray } = await supabase.from('entities').select('*').eq('entity_name', selectedEntity).limit(1);
      const entityData = entArray && entArray.length > 0 ? entArray[0] : null;

      // 1. FETCH WACC & CAPITAL STRUCTURE
      const { data: capArray } = await supabase.from('capital_structure').select('*').eq('entity_name', selectedEntity).order('year').limit(1);
      const capData = capArray && capArray.length > 0 ? capArray[0] : null;

      let waccDetails = { ke: 10.0, kd: 0, weightE: 1.0, weightD: 0, taxRate: 0.30, beta: 1.0, riskFree: 4.5, mrp: 5.5, interest: 0, finalWacc: 10.0 };
      let totalDebt = 0; let cash = 0;

      if (capData) {
        totalDebt = parseNum(capData.total_debt);
        cash = parseNum(capData.cash_on_hand);
        const riskFree = parseNum(capData.risk_free_rate_pct);
        const beta = parseNum(capData.beta);
        const mrp = parseNum(capData.market_risk_premium_pct);
        const interest = parseNum(capData.average_interest_rate_pct);
        const taxRate = parseNum(capData.corporate_tax_rate_pct) / 100;
        const weightE = parseNum(capData.target_equity_mix_pct) / 100;
        const weightD = parseNum(capData.target_debt_mix_pct) / 100;

        const ke = riskFree + (beta * mrp); 
        const kd = interest * (1 - taxRate); 
        const finalWacc = (ke * weightE) + (kd * weightD); 

        waccDetails = { ke, kd, weightE, weightD, taxRate, beta, riskFree, mrp, interest, finalWacc: finalWacc > 0 ? finalWacc : 10.0 };
      }
      
      const wacc = waccDetails.finalWacc;

      // 2. FETCH WORKING CAPITAL & ASSETS FOR RISK ENGINE
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

      // 3. REVENUE & EBITDA ROUTING
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

      if (year1Rev === 0) throw new Error("No revenue drivers found for this entity. Please configure sector data.");

      // 4. RISK RATINGS ENGINE
      const ebit = ebitda - totalDepreciation;
      const interestExpense = totalDebt * (waccDetails.interest / 100);
      const netIncome = (ebit - interestExpense) * (1 - waccDetails.taxRate);
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

      const riskDetails = { interestCoverage, debtToEquity, currentRatio, debtToEbitda, riskGrade, riskColor };

      // 5. THE 5-YEAR DCF LOOP
      const safeWacc = wacc / 100; 
      const yoyGrowthRate = 0.05; 
      const terminalGrowthRate = 0.02; 
      
      let projections = [];
      let cumulativePvFcf = 0;
      let currentRev = year1Rev;
      let currentEbitda = ebitda;

      for (let year = 1; year <= 5; year++) {
        const nopat = currentEbitda * (1 - waccDetails.taxRate);
        const fcf = nopat; 
        const pvFcf = fcf / Math.pow(1 + safeWacc, year);
        
        cumulativePvFcf += pvFcf;
        projections.push({ year, revenue: currentRev, ebitda: currentEbitda, nopat, fcf, pvFcf });

        currentRev *= (1 + yoyGrowthRate);
        currentEbitda *= (1 + yoyGrowthRate); 
      }

      const terminalValue = (projections[4].fcf * (1 + terminalGrowthRate)) / (safeWacc - terminalGrowthRate);
      const pvTerminalValue = terminalValue / Math.pow(1 + safeWacc, 5);

      setResults({
        projections, cumulativePvFcf, terminalValue, pvTerminalValue, wacc, 
        waccDetails, riskDetails,
        enterpriseValue: cumulativePvFcf + pvTerminalValue,
        currency: entityData?.currency || 'USD'
      });

    } catch (err) {
      console.error('Calculation Error:', err);
      setError(err.message || 'Failed to run master engine. Ensure sector and capital data exists.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val, curr) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val);

  // --- NEW EXPORT FUNCTIONS ---
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!results) return;
    
    const headers = ['Year', 'Projected Revenue', 'EBITDA', 'Net Operating Profit (NOPAT)', 'Free Cash Flow (FCF)', 'Present Value of FCF'];
    
    const rows = results.projections.map(p => [
      `Year ${p.year}`,
      p.revenue.toFixed(2),
      p.ebitda.toFixed(2),
      p.nopat.toFixed(2),
      p.fcf.toFixed(2),
      p.pvFcf.toFixed(2)
    ]);

    // Add Valuation Summary to the bottom of the CSV
    rows.push([], ['VALUATION SUMMARY']);
    rows.push(['Implied Enterprise Value', results.enterpriseValue.toFixed(2)]);
    rows.push(['WACC (%)', results.wacc.toFixed(2)]);
    rows.push(['Risk Grade', results.riskDetails.riskGrade]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${selectedEntity.replace(/\s+/g, '_')}_Valuation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans print:py-0 print:px-0">
      
      {/* Header - Hidden on Print */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><LineChart className="text-[#002D72]" /> Valuation & Risk Hub</h1>
          <p className="text-slate-500 mt-1 text-sm">Centralized executive dashboard for DCF Valuation, Cost of Capital, and Risk Ratings.</p>
        </div>
      </div>
      
      {error && <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold print:hidden"><AlertCircle size={18} /> {error}</div>}
      
      {/* Control Panel - Hidden on Print */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-end gap-4 print:hidden">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Entity</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-3 text-slate-400" />
            <select className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)}>
              <option value="" disabled>Select an entity to evaluate...</option>
              {entities.map(ent => <option key={ent.entity_name} value={ent.entity_name}>{ent.entity_name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleRunModel} disabled={loading || !selectedEntity} className="w-full md:w-auto bg-[#002D72] hover:bg-[#001f4d] text-[#C5A059] px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 border border-[#C5A059]/30">
          {loading ? <Activity className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />} {loading ? 'COMPUTING HUB...' : 'RUN MASTER ENGINE'}
        </button>
      </div>

      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* EXPORT UTILITY BAR - Hidden on Print */}
          <div className="flex justify-end gap-3 mb-6 print:hidden">
            <button onClick={handleExportCSV} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={handlePrint} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
              <Printer size={16} /> Save PDF
            </button>
          </div>

          {/* PRINT ONLY: Entity Title */}
          <div className="hidden print:block mb-8 text-center border-b-2 border-slate-800 pb-4">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">{selectedEntity}</h1>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Executive Valuation & Risk Report</p>
          </div>

          {/* THE EXECUTIVE DASHBOARD (WACC & RISK MODULES) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:gap-4">
            
            {/* WACC Glass Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden print:border-slate-300 print:shadow-none">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Scale size={100} /></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 mb-4"><Landmark size={16} /> Cost of Capital</h3>
              <div className="flex items-end gap-4 mb-6 z-10 relative">
                <p className="text-4xl font-black text-[#002D72]">{results.waccDetails.finalWacc.toFixed(2)}%</p>
                <p className="text-xs text-slate-400 font-medium mb-1.5">Calculated WACC</p>
              </div>
              <div className="grid grid-cols-2 gap-4 z-10 relative">
                <div><p className="text-xs font-bold text-slate-400 uppercase">Cost of Equity</p><p className="text-lg font-bold text-slate-800">{results.waccDetails.ke.toFixed(2)}%</p></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase">Cost of Debt</p><p className="text-lg font-bold text-slate-800">{results.waccDetails.kd.toFixed(2)}%</p></div>
              </div>
            </div>

            {/* Risk Rating Glass Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden print:border-slate-300 print:shadow-none">
              <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldAlert size={100} /></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 mb-4"><ShieldAlert size={16} /> Credit & Risk Rating</h3>
              <div className="flex items-end gap-4 mb-6 z-10 relative">
                <p className={`text-3xl font-black ${results.riskDetails.riskColor} print:text-slate-800`}>{results.riskDetails.riskGrade}</p>
                <p className="text-xs text-slate-400 font-medium mb-1.5">Synthetic Grade</p>
              </div>
              <div className="grid grid-cols-2 gap-4 z-10 relative">
                <div><p className="text-xs font-bold text-slate-400 uppercase">Interest Coverage</p><p className="text-lg font-bold text-slate-800">{results.riskDetails.interestCoverage === 99 ? 'N/A' : `${results.riskDetails.interestCoverage.toFixed(1)}x`}</p></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase">Debt-to-Equity</p><p className="text-lg font-bold text-slate-800">{results.riskDetails.debtToEquity.toFixed(2)}x</p></div>
              </div>
            </div>

          </div>

          {/* VALUATION BANNER */}
          <div className="bg-gradient-to-br from-[#002D72] to-[#001a44] p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-[#C5A059]/20 mb-8 print:bg-none print:text-slate-900 print:border-slate-300 print:shadow-none">
            <div className="absolute top-0 right-0 p-8 opacity-10 print:hidden"><DollarSign size={120} /></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2 flex items-center gap-2 print:text-slate-500"><TrendingUp size={16} /> Implied Enterprise Value (DCF)</p>
                <p className="text-5xl md:text-6xl font-black text-[#C5A059] tracking-tight print:text-[#002D72]">{formatCurrency(results.enterpriseValue, results.currency)}</p>
                <p className="text-sm text-blue-300 mt-4 max-w-xl print:text-slate-600">Calculated using a 5-Year DCF. WACC is <strong>{results.wacc.toFixed(2)}%</strong> and Perpetual Growth Rate is <strong>2.0%</strong>.</p>
              </div>
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 print:border-slate-300">
                <div><p className="text-xs text-blue-300 uppercase tracking-wider font-bold print:text-slate-500">PV of 5-Yr Cash Flows</p><p className="text-xl font-bold text-white print:text-slate-900">{formatCurrency(results.cumulativePvFcf, results.currency)}</p></div>
                <div><p className="text-xs text-blue-300 uppercase tracking-wider font-bold print:text-slate-500">PV of Terminal Value</p><p className="text-xl font-bold text-white print:text-slate-900">{formatCurrency(results.pvTerminalValue, results.currency)}</p></div>
              </div>
            </div>
          </div>

          {/* DCF TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 print:shadow-none print:border-slate-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                  <tr><th className="px-6 py-4">Metric</th>{results.projections.map(p => <th key={`head-${p.year}`} className="px-6 py-4 text-right">Year {p.year}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 font-bold text-slate-800">Projected Revenue</td>{results.projections.map(p => <td key={`rev-${p.year}`} className="px-6 py-4 text-right font-medium">{formatCurrency(p.revenue, results.currency)}</td>)}</tr>
                  <tr className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 font-bold text-slate-800">EBITDA</td>{results.projections.map(p => <td key={`ebitda-${p.year}`} className="px-6 py-4 text-right font-medium">{formatCurrency(p.ebitda, results.currency)}</td>)}</tr>
                  <tr className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 font-bold text-slate-800">Net Operating Profit (NOPAT)</td>{results.projections.map(p => <td key={`nopat-${p.year}`} className="px-6 py-4 text-right font-medium">{formatCurrency(p.nopat, results.currency)}</td>)}</tr>
                  <tr className="hover:bg-slate-50 transition-colors bg-blue-50/50 print:bg-slate-50"><td className="px-6 py-4 font-bold text-[#002D72]">Free Cash Flow (FCF)</td>{results.projections.map(p => <td key={`fcf-${p.year}`} className="px-6 py-4 text-right font-bold text-[#002D72]">{formatCurrency(p.fcf, results.currency)}</td>)}</tr>
                  <tr className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 font-bold text-emerald-600 print:text-slate-800">Present Value of FCF</td>{results.projections.map(p => <td key={`pv-${p.year}`} className="px-6 py-4 text-right font-bold text-emerald-600 print:text-slate-800">{formatCurrency(p.pvFcf, results.currency)}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}