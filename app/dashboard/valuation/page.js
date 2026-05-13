'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { LineChart, Play, Activity, AlertCircle, DollarSign, TrendingUp, BarChart3, Building2 } from 'lucide-react';

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

      // --- THE MASTER CALCULATION ENGINE ---
      let year1Rev = 0;
      let ebitda = 0;
      let wacc = macroData ? (macroData.risk_free_rate + (macroData.unleveraged_beta * macroData.market_risk_premium)) : 10.0;
      
      const industry = entityData?.industry_category || '';

      // ROUTING LOGIC: Determine which math to run based on the industry
      if (industry.includes('Retail')) {
        // 6RT: RETAIL MATH
        const { data: retail } = await supabase.from('retail_financials').select('*').eq('entity_name', selectedEntity).order('year').limit(1).single();
        if (retail) {
          const totalStores = retail.stores_open_start + retail.new_stores_added - retail.stores_closed;
          const footfall = totalStores * retail.annual_footfall_per_store;
          const conversions = footfall * (retail.conversion_rate_pct / 100);
          
          year1Rev = conversions * retail.avg_transaction_value;
          year1Rev = year1Rev * (1 + (retail.e_commerce_sales_pct / 100)); 
          ebitda = year1Rev * ((100 - retail.cogs_pct - retail.inventory_shrinkage_pct) / 100) * 0.4; // Proxy operating margin
        }

      } else if (industry.includes('Insurance') && !industry.includes('Reinsurance')) {
        // 2IN: DIRECT INSURANCE MATH
        const { data: ins } = await supabase.from('insurance_financials').select('*').eq('entity_name', selectedEntity).order('year').limit(1).single();
        if (ins) {
          year1Rev = ins.gross_written_premium * (1 - (ins.reinsurance_ceded_pct / 100)); // NWP
          const combinedRatio = (ins.loss_ratio_pct + ins.commission_rate_pct + ins.management_expense_ratio_pct) / 100;
          ebitda = year1Rev * (1 - combinedRatio); // Underwriting Profit
        }

      } else if (industry.includes('Reinsurance')) {
        // 3REI: REINSURANCE MATH
        const { data: reins } = await supabase.from('reinsurance_financials').select('*').eq('entity_name', selectedEntity).order('year').limit(1).single();
        if (reins) {
          year1Rev = reins.assumed_premium * (1 - (reins.retrocession_pct / 100)); // Net Assumed
          const combinedRatio = (reins.loss_ratio_pct + reins.commission_ratio_pct + reins.expense_ratio_pct) / 100;
          ebitda = year1Rev * (1 - combinedRatio);
        }

      } else if (industry.includes('Manufacturing')) {
        // 5MF: MANUFACTURING MATH
        const { data: mf } = await supabase.from('manufacturing_financials').select('*').eq('entity_name', selectedEntity).order('year').limit(1).single();
        if (mf) {
          const producedUnits = mf.max_capacity_units * (mf.utilization_pct / 100);
          const soldUnits = producedUnits * (mf.units_sold_pct / 100);
          year1Rev = soldUnits * mf.average_selling_price;
          
          const totalCogs = (soldUnits * mf.raw_material_per_unit) + (soldUnits * mf.direct_labor_per_unit) + mf.fixed_manufacturing_overhead;
          ebitda = year1Rev - totalCogs;
        }

      } else if (industry.includes('Hotel') || industry.includes('Hospitality')) {
        // 4HT: HOTEL & HOSPITALITY MATH
        const { data: ht } = await supabase.from('hotel_financials').select('*').eq('entity_name', selectedEntity).order('year').limit(1).single();
        if (ht) {
          const occupiedRooms = ht.total_rooms * ht.operating_days * (ht.occupancy_rate_pct / 100);
          const roomRev = occupiedRooms * ht.average_daily_rate;
          const fbRev = roomRev * (ht.fb_revenue_pct_of_rooms / 100);
          const otherRev = roomRev * (ht.other_revenue_pct_of_rooms / 100);
          
          year1Rev = roomRev + fbRev + otherRev;
          
          const expenses = (roomRev * (ht.room_expense_pct / 100)) + (fbRev * (ht.fb_expense_pct / 100)) + (year1Rev * (ht.undistributed_opex_pct / 100));
          ebitda = year1Rev - expenses;
        }

      } else if (industry.includes('Service') || industry.includes('Consulting')) {
        // 7SV: SERVICES MATH
        const { data: sv } = await supabase.from('services_financials').select('*').eq('entity_name', selectedEntity).order('year').limit(1).single();
        if (sv) {
          const billableHours = sv.total_billable_staff * sv.target_billable_hours * (sv.utilization_pct / 100);
          year1Rev = billableHours * sv.avg_hourly_rate;
          
          const laborCost = year1Rev * (sv.direct_labor_cost_pct / 100);
          ebitda = year1Rev - laborCost; // Simplified operating margin for services
        }

      } else if (industry.includes('Hybrid')) {
        // 8HB: HYBRID MATH
        const { data: hb } = await supabase.from('hybrid_financials').select('*').eq('entity_name', selectedEntity).order('year').limit(1).single();
        if (hb) {
          year1Rev = hb.recurring_revenue + hb.product_revenue + hb.service_revenue;
          
          const blendedCogs = (hb.recurring_revenue * (hb.recurring_cogs_pct / 100)) + 
                              (hb.product_revenue * (hb.product_cogs_pct / 100)) + 
                              (hb.service_revenue * (hb.service_cogs_pct / 100));
          ebitda = year1Rev - blendedCogs;
        }

      } else {
        // 1BK: BANKING OR FALLBACK
        year1Rev = 5000000; 
        ebitda = year1Rev * 0.25; 
      }

      // Safeguard against zero data
      if (year1Rev === 0) throw new Error("No revenue drivers found for this entity. Please configure sector data.");

      // --- THE 5-YEAR DCF LOOP ---
      const taxRate = macroData ? (macroData.corporate_tax_rate / 100) : 0.30;
      const safeWacc = wacc > 0 ? (wacc / 100) : 0.10; 
      
      const yoyGrowthRate = 0.05; // 5% base case revenue growth
      const terminalGrowthRate = 0.02; // 2% perpetual growth for Terminal Value
      
      let projections = [];
      let cumulativePvFcf = 0;
      
      let currentRev = year1Rev;
      let currentEbitda = ebitda;

      for (let year = 1; year <= 5; year++) {
        const nopat = currentEbitda * (1 - taxRate);
        
        // Proxy: Assuming D&A offsets CapEx and Net Working Capital changes are zero for base case.
        const fcf = nopat; 
        
        // Present Value of this year's FCF
        const discountFactor = Math.pow(1 + safeWacc, year);
        const pvFcf = fcf / discountFactor;
        
        cumulativePvFcf += pvFcf;

        projections.push({
          year: year,
          revenue: currentRev,
          ebitda: currentEbitda,
          nopat: nopat,
          fcf: fcf,
          pvFcf: pvFcf
        });

        // Grow metrics for the next iteration of the loop
        currentRev = currentRev * (1 + yoyGrowthRate);
        currentEbitda = currentEbitda * (1 + yoyGrowthRate); 
      }

      // --- TERMINAL VALUE (GORDON GROWTH MODEL) ---
      const year5Fcf = projections[4].fcf;
      const terminalValue = (year5Fcf * (1 + terminalGrowthRate)) / (safeWacc - terminalGrowthRate);
      
      // Discount the Terminal Value back to Year 0
      const pvTerminalValue = terminalValue / Math.pow(1 + safeWacc, 5);

      // Enterprise Value = PV of Discrete Cash Flows + PV of Terminal Value
      const enterpriseValue = cumulativePvFcf + pvTerminalValue;

      // Output Results
      setResults({
        projections: projections,
        cumulativePvFcf: cumulativePvFcf,
        terminalValue: terminalValue,
        pvTerminalValue: pvTerminalValue,
        wacc: wacc,
        enterpriseValue: enterpriseValue,
        currency: entityData?.currency || 'USD'
      });

    } catch (err) {
      console.error('Calculation Error:', err);
      setError(err.message || 'Failed to run valuation engine. Ensure sector data exists.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val, curr) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LineChart className="text-[#002D72]" />
            Valuation Engine
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Compile data and run the 5-Year DCF models.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

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
          
          {/* Master Valuation Card */}
          <div className="bg-gradient-to-br from-[#002D72] to-[#001a44] p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-[#C5A059]/20 mb-8">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <DollarSign size={120} />
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp size={16} /> Implied Enterprise Value (DCF)
                </p>
                <p className="text-5xl md:text-6xl font-black text-[#C5A059] tracking-tight">
                  {formatCurrency(results.enterpriseValue, results.currency)}
                </p>
                <p className="text-sm text-blue-300 mt-4 max-w-xl">
                  Calculated using a 5-Year DCF. WACC is <strong>{results.wacc.toFixed(2)}%</strong> and Perpetual Growth Rate is <strong>2.0%</strong>.
                  {results.enterpriseValue < 0 ? " Warning: Negative cash flows imply a distressed valuation." : ""}
                </p>
              </div>
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                <div>
                  <p className="text-xs text-blue-300 uppercase tracking-wider font-bold">PV of 5-Yr Cash Flows</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(results.cumulativePvFcf, results.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300 uppercase tracking-wider font-bold">PV of Terminal Value</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(results.pvTerminalValue, results.currency)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Year Projection Table */}
          <h2 className="text-xl font-bold text-[#002D72] mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> 5-Year Discrete Projections
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Metric</th>
                    {results.projections.map(p => (
                      <th key={`head-${p.year}`} className="px-6 py-4 text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">Projected Revenue</td>
                    {results.projections.map(p => <td key={`rev-${p.year}`} className="px-6 py-4 text-right font-medium">{formatCurrency(p.revenue, results.currency)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">EBITDA</td>
                    {results.projections.map(p => <td key={`ebitda-${p.year}`} className="px-6 py-4 text-right font-medium">{formatCurrency(p.ebitda, results.currency)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">Net Operating Profit (NOPAT)</td>
                    {results.projections.map(p => <td key={`nopat-${p.year}`} className="px-6 py-