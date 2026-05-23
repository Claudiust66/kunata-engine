'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Layers, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Percent, Repeat, Box, Briefcase } from 'lucide-react';

export default function HybridDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Revenue Streams
    recurringRevenue: 5000000,
    productRevenue: 3000000,
    serviceRevenue: 2000000,
    // Respective COGS
    recurringCogsPct: 15.0,
    productCogsPct: 45.0,
    serviceCogsPct: 60.0
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
        .from('hybrid_financials')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          recurring_revenue: formData.recurringRevenue,
          product_revenue: formData.productRevenue,
          service_revenue: formData.serviceRevenue,
          recurring_cogs_pct: formData.recurringCogsPct,
          product_cogs_pct: formData.productCogsPct,
          service_cogs_pct: formData.serviceCogsPct
        }], { onConflict: 'entity_name, year' }); // Bulletproof upsert!

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving hybrid data:', err);
      if (err.message?.includes('conflict') || err.message?.includes('constraint')) {
        setError('Database needs a unique constraint. Run: ALTER TABLE hybrid_financials ADD UNIQUE (entity_name, year); in Supabase SQL.');
      } else {
        setError(err.message || 'Failed to save hybrid configuration.');
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
            <Layers className="text-[#002D72]" />
            Hybrid Sector
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage diverse revenue streams and segmented cost structures.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Hybrid Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Hybrid configuration saved securely!
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
        
        {/* Revenue Streams Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <DollarSign size={18} /> Revenue Mix
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Recurring / SaaS Rev ($)</label>
              <div className="relative">
                <Repeat size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.recurringRevenue} onChange={e => setFormData({...formData, recurringRevenue: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Physical Product Rev ($)</label>
              <div className="relative">
                <Box size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.productRevenue} onChange={e => setFormData({...formData, productRevenue: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Services / Consulting Rev ($)</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.serviceRevenue} onChange={e => setFormData({...formData, serviceRevenue: parseInt(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

        {/* Cost Structure Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Percent size={18} /> Segment Margins
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Recurring COGS (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-rose-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.recurringCogsPct} onChange={e => setFormData({...formData, recurringCogsPct: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product COGS (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-rose-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.productCogsPct} onChange={e => setFormData({...formData, productCogsPct: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Service Direct Costs (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-rose-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.serviceCogsPct} onChange={e => setFormData({...formData, serviceCogsPct: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}