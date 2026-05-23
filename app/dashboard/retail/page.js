'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { ShoppingCart, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Percent, Store, Users } from 'lucide-react';

export default function RetailDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Store Operations
    storesOpenStart: 100,
    newStoresAdded: 5,
    storesClosed: 2,
    // Traffic & Sales
    annualFootfallPerStore: 50000,
    conversionRatePct: 15.0,
    avgTransactionValue: 45.0,
    eCommerceSalesPct: 20.0,
    // Costs
    cogsPct: 40.0,
    inventoryShrinkagePct: 2.5
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
        .from('retail_financials')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          stores_open_start: formData.storesOpenStart,
          new_stores_added: formData.newStoresAdded,
          stores_closed: formData.storesClosed,
          annual_footfall_per_store: formData.annualFootfallPerStore,
          conversion_rate_pct: formData.conversionRatePct,
          avg_transaction_value: formData.avgTransactionValue,
          e_commerce_sales_pct: formData.eCommerceSalesPct,
          cogs_pct: formData.cogsPct,
          inventory_shrinkage_pct: formData.inventoryShrinkagePct
        }], { onConflict: 'entity_name, year' }); // Bulletproof upsert!

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving retail data:', err);
      // Helpful error message if the schema requires the unique constraint like Banking did
      if (err.message?.includes('conflict')) {
        setError('Database needs a unique constraint. Run: ALTER TABLE retail_financials ADD UNIQUE (entity_name, year); in Supabase SQL.');
      } else {
        setError(err.message || 'Failed to save retail configuration.');
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
            <ShoppingCart className="text-[#002D72]" />
            Retail Sector
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage physical footprints, footfall, conversion rates, and omnichannel sales.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Retail Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Retail configuration saved securely!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* THE FOOLPROOF DROPDOWN */}
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
        
        {/* Physical Footprint Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Store size={18} /> Physical Footprint & Traffic
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Stores</label>
                <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.storesOpenStart} onChange={e => setFormData({...formData, storesOpenStart: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Added</label>
                <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.newStoresAdded} onChange={e => setFormData({...formData, newStoresAdded: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Closed</label>
                <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.storesClosed} onChange={e => setFormData({...formData, storesClosed: parseInt(e.target.value)})} />
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual Footfall (Per Store)</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.annualFootfallPerStore} onChange={e => setFormData({...formData, annualFootfallPerStore: parseInt(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

        {/* Conversion & Economics Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <DollarSign size={18} /> Unit Economics & Costs
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Conversion (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-3.5 text-slate-400" />
                  <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.conversionRatePct} onChange={e => setFormData({...formData, conversionRatePct: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avg Transaction ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
                  <input type="number" step="0.01" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.avgTransactionValue} onChange={e => setFormData({...formData, avgTransactionValue: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">E-Comm Boost (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.eCommerceSalesPct} onChange={e => setFormData({...formData, eCommerceSalesPct: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">COGS (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.cogsPct} onChange={e => setFormData({...formData, cogsPct: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Shrinkage (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.inventoryShrinkagePct} onChange={e => setFormData({...formData, inventoryShrinkagePct: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}