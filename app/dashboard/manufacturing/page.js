'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Factory, Save, Activity, AlertCircle, Wrench, Banknote, Package } from 'lucide-react';

export default function ManufacturingDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('capacity');

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Capacity
    maxCapacityUnits: 500000,
    utilizationPct: 85.0,
    // Sales
    averageSellingPrice: 150.00,
    unitsSoldPct: 95.0,
    // Unit Costs
    rawMaterialPerUnit: 45.00,
    directLaborPerUnit: 25.00,
    fixedManufacturingOverhead: 1500000
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!formData.entityName) {
      setError('Please provide an Entity Name.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('manufacturing_financials')
        .insert([{
          entity_name: formData.entityName,
          year: formData.year,
          max_capacity_units: formData.maxCapacityUnits,
          utilization_pct: formData.utilizationPct,
          average_selling_price: formData.averageSellingPrice,
          units_sold_pct: formData.unitsSoldPct,
          raw_material_per_unit: formData.rawMaterialPerUnit,
          direct_labor_per_unit: formData.directLaborPerUnit,
          fixed_manufacturing_overhead: formData.fixedManufacturingOverhead
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving manufacturing data:', err);
      setError(err.message || 'Failed to save manufacturing configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Factory className="text-[#002D72]" />
            Manufacturing Sector (5MF)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage plant capacity, unit sales, and production costs.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Manufacturing Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Manufacturing configuration saved securely!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label>
            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
              value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="e.g. Pennarth Greene Industrials" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label>
            <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
              value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('capacity')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'capacity' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Wrench size={16} /> Production Capacity
        </button>
        <button onClick={() => setActiveTab('sales')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'sales' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Banknote size={16} /> Revenue & Sales
        </button>
        <button onClick={() => setActiveTab('cogs')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'cogs' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Package size={16} /> Unit Economics (COGS)
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-6">
        
        {/* TAB 1: CAPACITY */}
        {activeTab === 'capacity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Capacity (Units)</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.maxCapacityUnits} onChange={e => setFormData({...formData, maxCapacityUnits: parseInt(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Total theoretical output at 100% capacity.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Utilization (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.utilizationPct} onChange={e => setFormData({...formData, utilizationPct: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Expected actual plant utilization.</p>
            </div>
            
            {/* Real-time Production Indicator */}
            <div className="md:col-span-2 mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-900">Implied Production Output</p>
                <p className="text-xs text-blue-700">Units manufactured based on capacity and utilization.</p>
              </div>
              <div className="text-xl font-black text-blue-800">
                {Math.round(formData.maxCapacityUnits * (formData.utilizationPct / 100)).toLocaleString()} units
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SALES */}
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Average Selling Price (ASP)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.averageSellingPrice} onChange={e => setFormData({...formData, averageSellingPrice: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Units Sold vs. Produced (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.unitsSoldPct} onChange={e => setFormData({...formData, unitsSoldPct: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Values under 100% assume remaining units go to inventory buildup.</p>
            </div>
          </div>
        )}

        {/* TAB 3: COGS */}
        {activeTab === 'cogs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Raw Material (Per Unit)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.rawMaterialPerUnit} onChange={e => setFormData({...formData, rawMaterialPerUnit: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Direct Labor (Per Unit)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.directLaborPerUnit} onChange={e => setFormData({...formData, directLaborPerUnit: parseFloat(e.target.value)})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fixed Manufacturing Overhead</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.fixedManufacturingOverhead} onChange={e => setFormData({...formData, fixedManufacturingOverhead: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Annual fixed plant costs (rent, depreciation, fixed utilities).</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}