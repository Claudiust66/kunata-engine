'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Monitor, Save, Activity, AlertCircle, Building2, Calendar, DollarSign, PlusCircle, MinusCircle, TrendingDown, Tag } from 'lucide-react';

export default function FixedAssetsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [entities, setEntities] = useState([]);

  // Pre-defined asset categories for consistency
  const assetCategories = [
    'Land & Buildings',
    'Machinery & Equipment',
    'Vehicles & Fleet',
    'IT & Office Equipment',
    'Furniture & Fixtures',
    'Leasehold Improvements',
    'Intangible Assets'
  ];

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    assetCategory: '',
    startingBookValue: 0,
    additionAmount: 0,
    disposalAmount: 0,
    depreciationAmount: 0
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

    if (!formData.entityName || !formData.assetCategory) {
      setError('Please select both an Entity and an Asset Category.');
      setLoading(false);
      return;
    }

    try {
      // Standard insert for the core_fixed_assets table
      const { error: insertError } = await supabase
        .from('core_fixed_assets')
        .insert([{
          entity_name: formData.entityName,
          year: formData.year,
          asset_category: formData.assetCategory,
          starting_book_value: formData.startingBookValue,
          addition_amount: formData.additionAmount,
          disposal_amount: formData.disposalAmount,
          depreciation_amount: formData.depreciationAmount
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      // Reset numeric fields for quick subsequent entries, keep entity/year
      setFormData(prev => ({
        ...prev,
        assetCategory: '',
        startingBookValue: 0,
        additionAmount: 0,
        disposalAmount: 0,
        depreciationAmount: 0
      }));
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving asset data:', err);
      setError(err.message || 'Failed to save fixed asset record.');
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
            <Monitor className="text-[#002D72]" />
            Fixed Assets & CapEx
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Log asset balances, capital expenditures, and depreciation for the balance sheet.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Asset Record'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Asset record saved successfully! Ready for P&L calculations.
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Asset Category</label>
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-3 text-slate-400" />
              <select 
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium"
                value={formData.assetCategory}
                onChange={e => setFormData({...formData, assetCategory: e.target.value})}
              >
                <option value="" disabled>Select category...</option>
                {assetCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-[#002D72] mb-4 flex items-center gap-2">
            <DollarSign size={16} /> Starting Balance
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Opening Book Value ($)</label>
            <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
              value={formData.startingBookValue} onChange={e => setFormData({...formData, startingBookValue: parseInt(e.target.value) || 0})} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-emerald-600 mb-4 flex items-center gap-2">
            <PlusCircle size={16} /> CapEx Additions
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Purchases ($)</label>
            <input type="number" className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
              value={formData.additionAmount} onChange={e => setFormData({...formData, additionAmount: parseInt(e.target.value) || 0})} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-amber-600 mb-4 flex items-center gap-2">
            <MinusCircle size={16} /> Disposals
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assets Sold/Retired ($)</label>
            <input type="number" className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
              value={formData.disposalAmount} onChange={e => setFormData({...formData, disposalAmount: parseInt(e.target.value) || 0})} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-rose-600 mb-4 flex items-center gap-2">
            <TrendingDown size={16} /> Depreciation
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual D&A Expense ($)</label>
            <input type="number" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
              value={formData.depreciationAmount} onChange={e => setFormData({...formData, depreciationAmount: parseInt(e.target.value) || 0})} />
          </div>
        </div>

      </div>
    </div>
  );
}