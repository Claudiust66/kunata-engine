'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Factory, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Percent, Settings, Package } from 'lucide-react';

export default function ManufacturingDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Production
    maxCapacityUnits: 1000000,
    utilizationPct: 85.0,
    unitsSoldPct: 95.0,
    // Unit Economics
    averageSellingPrice: 150.0,
    rawMaterialPerUnit: 45.0,
    directLaborPerUnit: 25.0,
    fixedManufacturingOverhead: 5000000
  });

  // Fetch entities for the foolproof dropdown
  useEffect(() => {
    const fetchEntities = async () => {
      const { data } = await supabase.from('entities').select('entity_name').order('entity_name');
      if (data) setEntities(data);
    };
    fetchEntities();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!formData.entityName) {
      setError('Please select an Entity.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('manufacturing_financials')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          max_capacity_units: formData.maxCapacityUnits,
          utilization_pct: formData.utilizationPct,
          units_sold_pct: formData.unitsSoldPct,
          average_selling_price: formData.averageSellingPrice,
          raw_material_per_unit: formData.rawMaterialPerUnit,
          direct_labor_per_unit: formData.directLaborPerUnit,
          fixed_manufacturing_overhead: formData.fixedManufacturingOverhead
        }], { onConflict: 'entity_name, year' }); // Bulletproof upsert!

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving manufacturing data:', err);
      if (err.message?.includes('conflict') || err.message?.includes('constraint')) {
        setError('Database needs a unique constraint. Run: ALTER TABLE manufacturing_financials ADD UNIQUE (entity_name, year); in Supabase SQL.');
      } else {
        setError(err.message || 'Failed to save manufacturing configuration.');
      }
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
            Manufacturing Sector
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage production capacity, utilization, and unit economics.</p>
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Entity</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-3 text-slate-400" />
              <select 
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium"
                value={formData.entityName}
                onChange={e => setFormData({...formData, entityName: e.target.value})}
              >
                <option value="" disabled>Select an entity...</option>
                {entities.map(ent => (
                  <option key={ent.entity_name} value={ent.entity_name}>{ent.entity_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
              <input type="number" className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Production Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Settings size={18} /> Production & Capacity
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Capacity (Units)</label>
              <div className="relative">
                <Package size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.maxCapacityUnits} onChange={e => setFormData({...formData, maxCapacityUnits: parseInt(e.target.value)})} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Utilization (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                  <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.utilizationPct} onChange={e => setFormData({...formData, utilizationPct: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Units Sold (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                  <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.unitsSoldPct} onChange={e => setFormData({...formData, unitsSoldPct: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Economics Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <DollarSign size={18} /> Unit Economics & Costs
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Average Selling Price ($)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" step="0.01" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.averageSellingPrice} onChange={e => setFormData({...formData, averageSellingPrice: parseFloat(e.target.value)})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Raw Material/Unit ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3.5 text-rose-400" />
                  <input type="number" step="0.01" className="w-full pl-8 p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                    value={formData.rawMaterialPerUnit} onChange={e => setFormData({...formData, rawMaterialPerUnit: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Direct Labor/Unit ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3.5 text-rose-400" />
                  <input type="number" step="0.01" className="w-full pl-8 p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                    value={formData.directLaborPerUnit} onChange={e => setFormData({...formData, directLaborPerUnit: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fixed Overhead ($)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3.5 text-rose-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.fixedManufacturingOverhead} onChange={e => setFormData({...formData, fixedManufacturingOverhead: parseInt(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}