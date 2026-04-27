'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Landmark } from 'lucide-react';

export default function ScenarioWorkspace({ params }) {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Card 1: Retail Revenue State
  const [retailLoading, setRetailLoading] = useState(false);
  const [retailSuccess, setRetailSuccess] = useState(false);
  const [retailData, setRetailData] = useState({
    year1: { active_customers: '', loan_volume: '', average_interest_rate: '' },
    year2: { active_customers: '', loan_volume: '', average_interest_rate: '' },
    year3: { active_customers: '', loan_volume: '', average_interest_rate: '' },
  });

  // Card 2: Banking Financials State
  const [bankingLoading, setBankingLoading] = useState(false);
  const [bankingSuccess, setBankingSuccess] = useState(false);
  const [bankingData, setBankingData] = useState({
    year1: { total_deposits: '', net_interest_income: '', non_interest_income: '' },
    year2: { total_deposits: '', net_interest_income: '', non_interest_income: '' },
    year3: { total_deposits: '', net_interest_income: '', non_interest_income: '' },
  });

  useEffect(() => {
    async function fetchScenarioDetails() {
      const resolvedParams = await params;
      const { data } = await supabase.from('scenarios').select('*').eq('id', resolvedParams.id).single();
      if (data) setScenario(data);
      setLoading(false);
    }
    fetchScenarioDetails();
  }, [params]);

  const handleRetailChange = (year, field, value) => {
    setRetailData(prev => ({ ...prev, [year]: { ...prev[year], [field]: value } }));
  };

  const handleBankingChange = (year, field, value) => {
    setBankingData(prev => ({ ...prev, [year]: { ...prev[year], [field]: value } }));
  };

  const handleRetailSubmit = async (e) => {
    e.preventDefault();
    setRetailLoading(true);
    const resolvedParams = await params;
    const rows = [1, 2, 3].map(yr => ({
      scenario_id: resolvedParams.id,
      fiscal_year: 2024 + yr,
      sales_volume: parseInt(retailData[`year${yr}`].active_customers) || 0,
      closing_stock_volume: parseFloat(retailData[`year${yr}`].loan_volume) || 0,
      unit_price: (parseFloat(retailData[`year${yr}`].average_interest_rate) || 0) / 100,
      product_name: 'Retail Banking Aggregate'
    }));
    const { error } = await supabase.from('retail_revenues').insert(rows);
    if (!error) setRetailSuccess(true);
    setRetailLoading(false);
  };

  const handleBankingSubmit = async (e) => {
    e.preventDefault();
    setBankingLoading(true);
    const resolvedParams = await params;
    const rows = [1, 2, 3].map(yr => ({
      scenario_id: resolvedParams.id,
      fiscal_year: 2024 + yr,
      total_deposits: parseFloat(bankingData[`year${yr}`].total_deposits) || 0,
      net_interest_income: parseFloat(bankingData[`year${yr}`].net_interest_income) || 0,
      non_interest_income: parseFloat(bankingData[`year${yr}`].non_interest_income) || 0,
      interest_income: 0, // Defaulting these to 0 as we focus on Net for now
      interest_expense: 0
    }));
    const { error } = await supabase.from('banking_financials').insert(rows);
    if (!error) setBankingSuccess(true);
    setBankingLoading(false);
  };

  if (loading) return <div className="p-8 text-slate-500 font-sans">Loading workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft size={16} /> Back to Scenario Management
          </Link>
        </div>

        <header className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Financial Workspace: {scenario?.name}</h1>
          <div className="flex gap-4 text-sm text-slate-600">
            <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">EV: ${scenario?.enterprise_value}M</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">WACC: {(scenario?.wacc * 100).toFixed(2)}%</span>
          </div>
        </header>

        {/* CARD 1: RETAIL REVENUES */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            Card 1: Retail Revenue Projections
          </h2>
          <form onSubmit={handleRetailSubmit}>
            <table className="w-full mb-4">
              <tbody>
              <tr className="text-slate-500 text-sm border-b">
                <th className="text-left py-2">Metric</th>
                <th>Year 1</th><th>Year 2</th><th>Year 3</th>
              </tr>
              <tr>
                <td className="py-4 font-medium">Active Customers</td>
                {['year1','year2','year3'].map(y => <td key={y} className="p-1"><input type="number" value={retailData[y].active_customers} onChange={e => handleRetailChange(y, 'active_customers', e.target.value)} className="w-full p-2 border rounded text-center"/></td>)}
              </tr>
              <tr>
                <td className="py-4 font-medium">Loan Volume ($M)</td>
                {['year1','year2','year3'].map(y => <td key={y} className="p-1"><input type="number" step="0.01" value={retailData[y].loan_volume} onChange={e => handleRetailChange(y, 'loan_volume', e.target.value)} className="w-full p-2 border rounded text-center"/></td>)}
              </tr>
              </tbody>
            </table>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold float-right">Save Retail</button>
            <div className="clear-both"></div>
          </form>
        </div>

        {/* CARD 2: BANKING FINANCIALS */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Landmark className="text-blue-600" size={24} />
            Card 2: Banking Financials (P&L)
          </h2>
          
          {bankingSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center gap-2 rounded">
              <CheckCircle size={20} /> Banking financials saved!
            </div>
          )}

          <form onSubmit={handleBankingSubmit}>
            <table className="w-full mb-4">
              <tbody>
              <tr className="text-slate-500 text-sm border-b">
                <th className="text-left py-2">Line Item ($M)</th>
                <th>Year 1</th><th>Year 2</th><th>Year 3</th>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-4 font-medium">Total Deposits</td>
                {['year1','year2','year3'].map(y => <td key={y} className="p-1"><input type="number" step="0.01" value={bankingData[y].total_deposits} onChange={e => handleBankingChange(y, 'total_deposits', e.target.value)} className="w-full p-2 border rounded text-center bg-blue-50/30"/></td>)}
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-4 font-medium">Net Interest Income</td>
                {['year1','year2','year3'].map(y => <td key={y} className="p-1"><input type="number" step="0.01" value={bankingData[y].net_interest_income} onChange={e => handleBankingChange(y, 'net_interest_income', e.target.value)} className="w-full p-2 border rounded text-center"/></td>)}
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-4 font-medium">Non-Interest Income</td>
                {['year1','year2','year3'].map(y => <td key={y} className="p-1"><input type="number" step="0.01" value={bankingData[y].non_interest_income} onChange={e => handleBankingChange(y, 'non_interest_income', e.target.value)} className="w-full p-2 border rounded text-center"/></td>)}
              </tr>
              </tbody>
            </table>
            <div className="flex justify-end">
              <button type="submit" disabled={bankingLoading} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2 rounded font-semibold transition-colors">
                {bankingLoading ? 'Saving...' : <><Save size={18} /> Save Banking Financials</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}