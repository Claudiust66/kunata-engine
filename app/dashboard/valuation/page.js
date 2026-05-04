'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { LineChart, Play, Activity, AlertCircle, DollarSign, TrendingUp, BarChart3, Building2 } from 'lucide-react';

export default function ValuationEngine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Selection State
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  
  // Results State
  const [results, setResults] = useState(null);

  // Fetch available entities on load
  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('entities')
        .select('entity_name, industry_category')
        .order('entity_name');
      if (fetchError) throw fetchError;
      setEntities(data || []);
      if (data && data.length > 0) setSelectedEntity(data[0].entity_name);
    } catch (err) {
      console.error('Error fetching entities:', err);
    }
  };

  const handleRunModel = async () => {
    if (!selectedEntity) return;
    
    setLoading(true);
    setError('');
    setResults(null);

    try {
      // 1. Fetch Entity Context
      const { data: entityData } = await supabase
        .from('entities')
        .select('*')
        .eq('entity_name', selectedEntity)
        .single();

      // 2. Fetch Macro Assumptions (Tax & WACC)
      const { data: macroData } = await supabase
        .from('core_tax_wacc')
        .select('*')
        .eq('entity_name', selectedEntity)
        .order('year', { ascending: true })
        .limit(1)
        .single();

      // 3. Fetch Sector Data (Checking Retail for this example)
      let sectorData = null;
      if (entityData?.industry_category === 'Retail / Consumer') {
        const { data: retail } = await supabase
          .from('retail_financials')
          .select('*')
          .eq('entity_name', selectedEntity)
          .order('year', { ascending: true })
          .limit(1)
          .single();
        sectorData = retail;
      }

      // --- THE CALCULATION ENGINE LOGIC ---
      // In a full production model, this would be a massive service file looping through 5-10 years.
      // Here, we prove the architecture works by running Year 1 calculations.
      
      let year1Rev = 0;
      let wacc = macroData ? (macroData.risk_free_rate + (macroData.unleveraged_beta * macroData.market_risk_premium)) : 10.0; // Simplified WACC

      if (sectorData && entityData.industry_category === 'Retail / Consumer') {
        const totalStores = sectorData.stores_open_start + sectorData.new_stores_added - sectorData.stores_closed;
        const footfall = totalStores * sectorData.annual_footfall_per_store;
        const conversions = footfall * (sectorData.conversion_rate_pct / 100);
        year1Rev = conversions * sectorData.avg_transaction_value;
        
        // Add E-Commerce
        year1Rev = year1Rev * (1 + (sectorData.e_commerce_sales_pct / 100));
      } else {
        // Fallback for non-retail for now
        year1Rev = 5000000; 
      }

      // Mocking the rest of the P&L for architectural demonstration
      const ebitda = year1Rev * 0.25; 
      const taxRate = macroData ? (macroData.corporate_tax_rate / 100) : 0.30;
      const nopat = ebitda * (1 - taxRate);
      
      // Simplified Enterprise Value (NOPAT / WACC) - Gordon Growth
      const enterpriseValue = nopat / (wacc / 100);

      // Set the final results to be displayed
      setResults({
        revenue: year1Rev,
        ebitda: ebitda,
        nopat: nopat,
        wacc: wacc,
        enterpriseValue: enterpriseValue,
        currency: entityData?.currency || 'USD'
      });

    } catch (err) {
      console.error('Calculation Error:', err);
      setError('Failed to run valuation engine. Ensure data exists for this entity.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format currency
  const formatCurrency = (val, curr) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LineChart className="text-[#002D72]" />
            Valuation Engine
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Compile data and run the DCF / Valuation models.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Entity</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-3 text-slate-400" />
            <select 
              className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              <option value="" disabled>Select an entity to value...</option>
              {entities.map(ent => (
                <option key={ent.entity_name} value={ent.entity_name}>{ent.entity_name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleRunModel}
          disabled={loading || !selectedEntity}
          className="w-full md:w-auto bg-[#002D72] hover:bg-[#001f4d] text-[#C5A059] px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 border border-[#C5A059]/30"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
          {loading ? 'COMPUTING...' : 'RUN ENGINE'}
        </button>
      </div>

      {/* Output Dashboard */}
      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-[#002D72] mb-6 flex items-center gap-2">
            <BarChart3 size={20} /> Base Case Outputs (Year 1)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Metric Cards */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Projected Revenue</p>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(results.revenue, results.currency)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Est. EBITDA</p>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(results.ebitda, results.currency)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Calculated WACC</p>
              <p className="text-2xl font-black text-slate-900">{results.wacc.toFixed(2)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Net Operating Profit (NOPAT)</p>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(results.nopat, results.currency)}</p>
            </div>
          </div>

          {/* Master Valuation Card */}
          <div className="bg-gradient-to-br from-[#002D72] to-[#001a44] p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-[#C5A059]/20">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <DollarSign size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2 flex items-center gap-2">
                <TrendingUp size={16} /> Implied Enterprise Value (EV)
              </p>
              <p className="text-5xl md:text-6xl font-black text-[#C5A059] tracking-tight">
                {formatCurrency(results.enterpriseValue, results.currency)}
              </p>
              <p className="text-sm text-blue-300 mt-4 max-w-2xl">
                Calculated using perpetuity growth method based on Year 1 NOPAT and blended WACC. Debt and cash adjustments required for final Equity Value.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}