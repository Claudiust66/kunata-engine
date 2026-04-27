'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Percent, ShieldAlert, ArrowLeft, Download, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waccOverride, setWaccOverride] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  async function checkUserAndFetch() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = '/login';
      return;
    }

    fetchInitialData();
  }

  async function fetchInitialData() {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('companyId');
    
    if (!companyId) {
      setDebugInfo("Error: No companyId in URL");
      setLoading(false);
      return;
    }

    const { data: scenarioList, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      setDebugInfo(`Database Error: ${error.message}`);
    } else if (scenarioList && scenarioList.length > 0) {
      setScenarios(scenarioList);
      setSelectedScenario(scenarioList[0]);
      fetchFinancials(scenarioList[0].id);
    } else {
      setDebugInfo(`No scenarios found linked to this Company.`);
    }
    setLoading(false);
  }

  async function fetchFinancials(scenarioId) {
    const { data } = await supabase
      .from('banking_financials')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('fiscal_year', { ascending: true });
    
    if (data && data.length > 0) {
      const formatted = data.map(row => ({
        year: `FY ${row.fiscal_year}`,
        'Net Interest': row.net_interest_income,
        'Non-Interest': row.non_interest_income
      }));
      setFinancialData(formatted);
    } else {
      setFinancialData([]);
    }
  }

  const currentWacc = waccOverride !== null ? waccOverride : (selectedScenario?.wacc || 0.08);
  
  const calculateValuation = () => {
    if (!financialData.length) return 0;
    const totalPV = financialData.reduce((acc, row, index) => {
      const year = index + 1;
      const totalIncome = row['Net Interest'] + row['Non-Interest'];
      const pv = totalIncome / Math.pow(1 + currentWacc, year);
      return acc + pv;
    }, 0);
    return parseFloat(totalPV.toFixed(2));
  };

  const modelValue = calculateValuation();
  const analystValue = selectedScenario?.enterprise_value || 0;
  const variance = modelValue > 0 ? (((analystValue - modelValue) / modelValue) * 100).toFixed(1) : 0;

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Verifying Security...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-[#002D72] font-bold transition-all">
            <ArrowLeft size={20} /> Back to Portfolio
          </Link>
          {debugInfo && <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-xs font-mono border border-amber-200">{debugInfo}</div>}
          <button onClick={() => window.print()} className="bg-white border border-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
            <Download size={18} /> Export PDF
          </button>
        </div>

        <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Valuation Intelligence</h1>
            <p className="text-[#C5A059] font-bold uppercase tracking-[0.2em] text-sm mt-1">Pennarth Greene & Co.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Active Scenario</label>
            <select 
              className="font-bold text-slate-800 outline-none bg-transparent"
              value={selectedScenario?.id}
              onChange={(e) => {
                const s = scenarios.find(item => item.id === e.target.value);
                setSelectedScenario(s);
                fetchFinancials(s.id);
              }}
            >
              {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-[#002D72] text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <Zap className="absolute right-[-20px] top-[-20px] text-white/5" size={200} />
            <div className="relative z-10">
              <h3 className="text-blue-200 font-bold uppercase text-xs tracking-widest mb-2 font-mono">Engine Valuation (3-Year PV)</h3>
              <div className="text-6xl font-black mb-6 tracking-tighter">${modelValue}M</div>
              <p className="text-blue-100/70 text-sm leading-relaxed max-w-sm">
                Discounted Cash Flow calculation based on projected income and {(currentWacc * 100).toFixed(2)}% WACC.
              </p>
              
              <div className="mt-8 pt-8 border-t border-white/10 print:hidden">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-blue-300">Live WACC Sensitivity</span>
                  <span className="text-sm font-mono font-bold text-[#C5A059]">{(currentWacc * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min="0.05" max="0.20" step="0.001" value={currentWacc} onChange={(e) => setWaccOverride(parseFloat(e.target.value))} className="w-full h-1.5 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-[#C5A059]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2 font-mono">Analyst Variance</h3>
            <div className="flex items-baseline gap-4">
              <div className={`text-6xl font-black tracking-tighter ${variance >= 0 ? 'text-[#C5A059]' : 'text-rose-600'}`}>
                {variance > 0 ? '+' : ''}{variance}%
              </div>
              <div className="text-slate-400 font-bold text-xl uppercase tracking-tighter">vs DCF Model</div>
            </div>
            <div className="mt-6 flex items-center gap-4">
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Input Enterprise Value</p>
                  <p className="text-xl font-bold text-slate-800">${analystValue}M</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Rating</p>
                  <p className="text-xl font-bold text-slate-800">Grade {selectedScenario?.overall_risk_rating}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">Revenue Trajectory</h2>
          <div className="h-[400px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                <Bar dataKey="Net Interest" fill="#002D72" radius={[6, 6, 0, 0]} barSize={60} />
                <Bar dataKey="Non-Interest" fill="#C5A059" radius={[6, 6, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}