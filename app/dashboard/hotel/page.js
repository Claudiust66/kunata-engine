'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { BedDouble, Save, Activity, AlertCircle, Coffee, DollarSign, Calculator } from 'lucide-react';

export default function HotelDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('rooms');

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Room Metrics
    totalRooms: 250,
    operatingDays: 365,
    occupancyRatePct: 72.5,
    averageDailyRate: 185.00,
    // Ancillary Revenue
    fbRevenuePctOfRooms: 35.0,
    otherRevenuePctOfRooms: 10.0,
    // Operating Costs
    roomExpensePct: 25.0,
    fbExpensePct: 65.0,
    undistributedOpexPct: 15.0
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
        .from('hotel_financials')
        .insert([{
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
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving hotel data:', err);
      setError(err.message || 'Failed to save hospitality configuration.');
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
            Hotel & Hospitality (4HT)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage room inventory, RevPAR drivers, and operating expenses.</p>
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
          Hospitality configuration saved securely!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label>
            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
              value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="e.g. Pennarth Greene Grand Hotel" />
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
        <button onClick={() => setActiveTab('rooms')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'rooms' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <BedDouble size={16} /> Room Metrics
        </button>
        <button onClick={() => setActiveTab('ancillary')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'ancillary' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Coffee size={16} /> F&B and Ancillary
        </button>
        <button onClick={() => setActiveTab('expenses')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <DollarSign size={16} /> Operating Costs
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-6">
        
        {/* TAB 1: ROOM METRICS */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Rooms Available</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.totalRooms} onChange={e => setFormData({...formData, totalRooms: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Operating Days</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.operatingDays} onChange={e => setFormData({...formData, operatingDays: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Average Occupancy Rate (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.occupancyRatePct} onChange={e => setFormData({...formData, occupancyRatePct: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Average Daily Rate (ADR)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.averageDailyRate} onChange={e => setFormData({...formData, averageDailyRate: parseFloat(e.target.value)})} />
            </div>
            
            {/* Real-time RevPAR Indicator */}
            <div className="md:col-span-2 mt-4 p-4 rounded-lg bg-[#002D72]/5 border border-[#002D72]/20 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#002D72] flex items-center gap-2"><Calculator size={16}/> Implied RevPAR</p>
                <p className="text-xs text-slate-500">Revenue Per Available Room (ADR × Occupancy)</p>
              </div>
              <div className="text-xl font-black text-[#002D72]">
                ${(formData.averageDailyRate * (formData.occupancyRatePct / 100)).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANCILLARY */}
        {activeTab === 'ancillary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">F&B Revenue (% of Room Revenue)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.fbRevenuePctOfRooms} onChange={e => setFormData({...formData, fbRevenuePctOfRooms: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Food, beverage, and catering income.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Other Revenue (% of Room Revenue)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.otherRevenuePctOfRooms} onChange={e => setFormData({...formData, otherRevenuePctOfRooms: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Spa, parking, resort fees, and telecommunications.</p>
            </div>
          </div>
        )}

        {/* TAB 3: OPERATING COSTS */}
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Room Dept Expenses (% of Room Rev)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.roomExpensePct} onChange={e => setFormData({...formData, roomExpensePct: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">F&B Dept Expenses (% of F&B Rev)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.fbExpensePct} onChange={e => setFormData({...formData, fbExpensePct: parseFloat(e.target.value)})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Undistributed OpEx (% of Total Rev)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.undistributedOpexPct} onChange={e => setFormData({...formData, undistributedOpexPct: parseFloat(e.target.value)})} />
              <p className="text-xs text-slate-400 mt-1">Admin, marketing, maintenance, and utilities.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}