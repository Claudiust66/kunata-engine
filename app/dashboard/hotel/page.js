'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { BedDouble, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Percent } from 'lucide-react';

export default function HotelDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Operations
    totalRooms: 150,
    operatingDays: 365,
    occupancyRatePct: 75.0,
    averageDailyRate: 250.0,
    // Ancillary Revenue
    fbRevenuePctOfRooms: 30.0,
    otherRevenuePctOfRooms: 10.0,
    // Expenses
    roomExpensePct: 25.0,
    fbExpensePct: 70.0,
    undistributedOpexPct: 15.0
  });

  // Fetch entities for the dropdown so the user can't make a typo
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
        .from('hotel_financials')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          total_rooms: formData.totalRooms,
          operating_days: formData.operatingDays,
          occupancy_rate_pct: formData.occupancyRatePct,
          average_daily_rate: formData.averageDailyRate,
          fb_revenue_pct_of_rooms: formData.fbRevenuePctOfRooms,
          other_revenue_pct_of_rooms: formData.otherRevenuePctOfRooms,
          room_expense_pct: formData.roomExpensePct,
          fb_expense_pct: formData.fbExpensePct,
          undistributed_opex_pct: formData.undistributedOpexPct
        }], { onConflict: 'entity_name, year' }); // Added upsert to prevent multiple rows!

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving hotel data:', err);
      setError(err.message || 'Failed to save hotel configuration.');
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
            <BedDouble className="text-[#002D72]" />
            Hotel & Hospitality
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage room inventory, ADR, occupancy, and departmental expenses.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Hotel Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Hotel configuration saved securely!
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
        
        {/* Core Operations Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2">Core Operations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Rooms</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.totalRooms} onChange={e => setFormData({...formData, totalRooms: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Operating Days</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.operatingDays} onChange={e => setFormData({...formData, operatingDays: parseInt(e.target.value)})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Occupancy (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute right-3 top-3 text-slate-400" />
                  <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.occupancyRatePct} onChange={e => setFormData({...formData, occupancyRatePct: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ADR ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input type="number" step="0.01" className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={formData.averageDailyRate} onChange={e => setFormData({...formData, averageDailyRate: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ancillary & Expenses Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-2">Ancillary & Expenses</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">F&B Rev (% of Rooms)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.fbRevenuePctOfRooms} onChange={e => setFormData({...formData, fbRevenuePctOfRooms: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Other Rev (% of Rooms)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.otherRevenuePctOfRooms} onChange={e => setFormData({...formData, otherRevenuePctOfRooms: parseFloat(e.target.value)})} />
              </div>
            </div>
            
            <hr className="border-slate-100 my-4" />
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Room Exp. (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.roomExpensePct} onChange={e => setFormData({...formData, roomExpensePct: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">F&B Exp. (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.fbExpensePct} onChange={e => setFormData({...formData, fbExpensePct: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Undist. Opex (%)</label>
                <input type="number" step="0.1" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.undistributedOpexPct} onChange={e => setFormData({...formData, undistributedOpexPct: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}