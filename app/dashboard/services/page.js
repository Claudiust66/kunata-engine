'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Users, Save, Activity, AlertCircle, Clock, DollarSign } from 'lucide-react';

export default function ServicesDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    totalBillableStaff: 50,
    targetBillableHours: 2000,
    utilizationPct: 75.0,
    avgHourlyRate: 250.00,
    directLaborCostPct: 40.0
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!formData.entityName) return setError('Please provide an Entity Name.');

    try {
      const { error: insertError } = await supabase.from('services_financials').insert([{
        entity_name: formData.entityName,
        year: formData.year,
        total_billable_staff: formData.totalBillableStaff,
        target_billable_hours: formData.targetBillableHours,
        utilization_pct: formData.utilizationPct,
        avg_hourly_rate: formData.avgHourlyRate,
        direct_labor_cost_pct: formData.directLaborCostPct
      }]);
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save services configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-[#002D72]" /> Services Sector (7SV)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage headcount, utilization, and billable rates.</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2"><Users size={14} className="inline mr-1"/> Billable Staff</label><input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.totalBillableStaff} onChange={e => setFormData({...formData, totalBillableStaff: parseInt(e.target.value)})} /></div>
        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2"><Clock size={14} className="inline mr-1"/> Annual Hours/Person</label><input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.targetBillableHours} onChange={e => setFormData({...formData, targetBillableHours: parseInt(e.target.value)})} /></div>
        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Utilization (%)</label><input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.utilizationPct} onChange={e => setFormData({...formData, utilizationPct: parseFloat(e.target.value)})} /></div>
        
        <div className="md:col-span-3 border-t border-slate-100 my-2"></div>
        
        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2"><DollarSign size={14} className="inline mr-1"/> Avg Hourly Rate</label><input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.avgHourlyRate} onChange={e => setFormData({...formData, avgHourlyRate: parseFloat(e.target.value)})} /></div>
        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Direct Labor Cost (%)</label><input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" value={formData.directLaborCostPct} onChange={e => setFormData({...formData, directLaborCostPct: parseFloat(e.target.value)})} /></div>
      </div>
    </div>
  );
}