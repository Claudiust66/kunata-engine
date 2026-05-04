'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Store, Save, Activity, AlertCircle, ShoppingBag, MapPin, Tag } from 'lucide-react';

export default function RetailDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('network');

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Network
    storesOpenStart: 10,
    newStoresAdded: 2,
    storesClosed: 0,
    avgSqFtPerStore: 2500,
    // Revenue
    annualFootfallPerStore: 150000,
    conversionRatePct: 25.5,
    avgTransactionValue: 45.00,
    eCommerceSalesPct: 15.0,
    // Margins
    cogsPct: 40.0,
    inventoryShrinkagePct: 1.5
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
        .from('retail_financials')
        .insert([{
          entity_name: formData.entityName,
          year: formData.year,
          stores_open_start: formData.storesOpenStart,
          new_stores_added: formData.newStoresAdded,
          stores_closed: formData.storesClosed,
          avg_sq_ft_per_store: formData.avgSqFtPerStore,
          annual_footfall_per_store: formData.annualFootfallPerStore,
          conversion_rate_pct: formData.conversionRatePct,
          avg_transaction_value: formData.avgTransactionValue,
          e_commerce_sales_pct: formData.eCommerceSalesPct,
          cogs_pct: formData.cogsPct,
          inventory_shrinkage_pct: formData.inventoryShrinkagePct
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving retail data:', err);
      setError(err.message || 'Failed to save retail configuration.');
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
            <Store className="text-[#002D72]" />
            Retail Sector (6RT)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Data entry for store footprint, revenue drivers, and margins.</p>
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
          Retail configuration saved successfully!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label>
            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
              value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="e.g. Pennarth Greene Retail" />
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
        <button onClick={() => setActiveTab('network')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'network' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <MapPin size={16} /> Store Network
        </button>
        <button onClick={() => setActiveTab('revenue')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'revenue' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <ShoppingBag size={16} /> Revenue Drivers
        </button>
        <button onClick={() => setActiveTab('margins')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'margins' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Tag size={16} /> COGS & Margins
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-6">
        
        {/* TAB 1: NETWORK */}
        {activeTab === 'network' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stores Open (Start of Year)</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.storesOpenStart} onChange={e => setFormData({...formData, storesOpenStart: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avg. Sq. Ft. Per Store</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.avgSqFtPerStore} onChange={e => setFormData({...formData, avgSqFtPerStore: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-600 uppercase mb-2">New Stores Added</label>
              <input type="number" className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
                value={formData.newStoresAdded} onChange={e => setFormData({...formData, newStoresAdded: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-rose-600 uppercase mb-2">Stores Closed</label>
              <input type="number" className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                value={formData.storesClosed} onChange={e => setFormData({...formData, storesClosed: parseInt(e.target.value)})} />
            </div>
          </div>
        )}

        {/* TAB 2: REVENUE */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual Footfall (Per Store)</label>
              <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.annualFootfallPerStore} onChange={e => setFormData({...formData, annualFootfallPerStore: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Conversion Rate (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.conversionRatePct} onChange={e => setFormData({...formData, conversionRatePct: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Avg. Transaction Value (ATV)</label>
              <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.avgTransactionValue} onChange={e => setFormData({...formData, avgTransactionValue: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">E-Commerce Revenue Split (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.eCommerceSalesPct} onChange={e => setFormData({...formData, eCommerceSalesPct: parseFloat(e.target.value)})} />
            </div>
          </div>
        )}

        {/* TAB 3: MARGINS */}
        {activeTab === 'margins' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cost of Goods Sold (COGS %)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.cogsPct} onChange={e => setFormData({...formData, cogsPct: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Inventory Shrinkage (%)</label>
              <input type="number" step="0.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                value={formData.inventoryShrinkagePct} onChange={e => setFormData({...formData, inventoryShrinkagePct: parseFloat(e.target.value)})} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}