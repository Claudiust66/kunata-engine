'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { RefreshCcw, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function WorkingCapitalForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    accountsReceivable: 500000,
    inventory: 250000,
    accountsPayable: 300000,
    paidInCapital: 1000000
  });

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
        .from('core_working_capital')
        .upsert([{
          entity_name: formData.entityName,
          year: formData.year,
          accounts_receivable: formData.accountsReceivable,
          inventory: formData.inventory,
          accounts_payable: formData.accountsPayable,
          paid_in_capital: formData.paidInCapital
        }], { onConflict: 'entity_name, year' }); 

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving working capital:', err);
      setError(err.message || 'Failed to save working capital configuration.');
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
            <RefreshCcw className="text-[#002D72]" />
            Working Capital & Equity
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Configure short-term assets, liabilities, and starting equity for the Balance Sheet.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Working Capital saved securely! The Balance Sheet is ready to balance.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* AR */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-emerald-600 mb-4 flex items-center gap-2">
            <ArrowDownRight size={16} /> Accounts Receivable
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Owed by Customers ($)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input type="number" className="w-full pl-8 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
                value={formData.accountsReceivable} onChange={e => setFormData({...formData, accountsReceivable: parseInt(e.target.value) || 0})} />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-2">
            <RefreshCcw size={16} /> Inventory
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Unsold Goods Value ($)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input type="number" className="w-full pl-8 p-2.5 bg-blue-50 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.inventory} onChange={e => setFormData({...formData, inventory: parseInt(e.target.value) || 0})} />
            </div>
          </div>
        </div>

        {/* AP */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-rose-600 mb-4 flex items-center gap-2">
            <ArrowUpRight size={16} /> Accounts Payable
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Owed to Suppliers ($)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input type="number" className="w-full pl-8 p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                value={formData.accountsPayable} onChange={e => setFormData({...formData, accountsPayable: parseInt(e.target.value) || 0})} />
            </div>
          </div>
        </div>

        {/* Paid in Capital */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-[#C5A059] mb-4 flex items-center gap-2">
            <Wallet size={16} /> Initial Equity
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Paid-in Capital ($)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input type="number" className="w-full pl-8 p-2.5 bg-amber-50 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
                value={formData.paidInCapital} onChange={e => setFormData({...formData, paidInCapital: parseInt(e.target.value) || 0})} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}