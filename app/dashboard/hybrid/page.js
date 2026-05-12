'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Layers, Save, Activity, AlertCircle, RefreshCw, Package, Users } from 'lucide-react';

export default function HybridDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    recurringRevenue: 5000000,
    recurringCogsPct: 15.0,
    productRevenue: 2500000,
    productCogsPct: 45.0,
    serviceRevenue: 1000000,
    serviceCogsPct: 35.0
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!formData.entityName) return setError('Please provide an Entity Name.');

    try {
      const { error: insertError } = await supabase.from('hybrid_financials').insert([{
        entity_name: formData.entityName,
        year: formData.year,
        recurring_revenue: formData.recurringRevenue,
        recurring_cogs_pct: formData.recurringCogsPct,
        product_revenue: formData.productRevenue,
        product_cogs_pct: formData.productCogsPct,
        service_revenue: formData.serviceRevenue,
        service_cogs_pct: formData.serviceCogsPct
      }]);
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save hybrid configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-[#002D72]" /> Hybrid Sector (8HB)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage blended revenue streams (Subscriptions, Products, Services).</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />} Save Data
        </button>
      </div>

      {success && <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg font-bold">Saved successfully!</div>}
      {error && <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg font-bold flex items-center gap-2"><AlertCircle size={18}/> {error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} /></div>
        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label><input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-blue-500">
          <h2 className="font-bold text-[#002D72] mb-4 flex items-center gap-2"><RefreshCw size={18}/> Recurring / SaaS</h2>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual Revenue</label>
          <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] mb-4" value={formData.recurringRevenue} onChange={e => setFormData({...formData, recurringRevenue: parseFloat(e.target.value)})} />
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">COGS (%)</label>
          <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.recurringCogsPct} onChange={e => setFormData({...formData, recurringCogsPct: parseFloat(e.target.value)})} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-amber-500">
          <h2 className="font-bold text-[#002D72] mb-4 flex items-center gap-2"><Package size={18}/> Product Sales</h2>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual Revenue</label>
          <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] mb-4" value={formData.productRevenue} onChange={e => setFormData({...formData, productRevenue: parseFloat(e.target.value)})} />
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">COGS (%)</label>
          <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.productCogsPct} onChange={e => setFormData({...formData, productCogsPct: parseFloat(e.target.value)})} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-emerald-500">
          <h2 className="font-bold text-[#002D72] mb-4 flex items-center gap-2"><Users size={18}/> Services / Consulting</h2>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual Revenue</label>
          <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] mb-4" value={formData.serviceRevenue} onChange={e => setFormData({...formData, serviceRevenue: parseFloat(e.target.value)})} />
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">COGS (%)</label>
          <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.serviceCogsPct} onChange={e => setFormData({...formData, serviceCogsPct: parseFloat(e.target.value)})} />
        </div>
      </div>
    </div>
  );
}