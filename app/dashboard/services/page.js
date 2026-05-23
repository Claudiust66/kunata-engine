'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Briefcase, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Percent, Users, Clock } from 'lucide-react';

export default function ServicesDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Revenue Drivers
    totalBillableStaff: 50,
    targetBillableHours: 2000,
    utilizationPct: 75.0,
    avgHourlyRate: 150.0,
    // Cost Drivers
    directLaborCostPct: 60.0
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
        .from('services_financials')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          total_billable_staff: formData.totalBillableStaff,
          target_billable_hours: formData.targetBillableHours,
          utilization_pct: formData.utilizationPct,
          avg_hourly_rate: formData.avgHourlyRate,
          direct_labor_cost_pct: formData.directLaborCostPct
        }], { onConflict: 'entity_name, year' }); // Bulletproof upsert!

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving services data:', err);
      setError(err.message || 'Failed to save services configuration.');
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
            <Briefcase className="text-[#002D72]" />
            Services & Consulting
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage billable staff, utilization rates, and hourly billing.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Services Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Services configuration saved securely!
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
        
        {/* Capacity & Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Users size={18} /> Capacity & Billing
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Billable Staff</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-3.5 text-slate-400" />
                  <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.totalBillableStaff} onChange={e => setFormData({...formData, totalBillableStaff: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Hours / Yr</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-3.5 text-slate-400" />
                  <input type="number" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.targetBillableHours} onChange={e => setFormData({...formData, targetBillableHours: parseInt(e.target.value)})} />
                </div>
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
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avg Hourly Rate ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
                  <input type="number" step="0.01" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.avgHourlyRate} onChange={e => setFormData({...formData, avgHourlyRate: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Costs Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <DollarSign size={18} /> Direct Costs
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Direct Labor Cost (%)</label>
              <p className="text-xs text-slate-400 mb-2">Total compensation for billable staff as a percentage of revenue.</p>
              <div className="relative">
                <Percent size={14} className="absolute right-3 top-3.5 text-rose-400" />
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.directLaborCostPct} onChange={e => setFormData({...formData, directLaborCostPct: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}