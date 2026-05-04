'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Monitor, Save, Activity, AlertCircle, Plus, Trash2, PackagePlus } from 'lucide-react';

export default function FixedAssetsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [entityName, setEntityName] = useState('');
  const [year, setYear] = useState(2026);

  // Initialize with standard categories from your CFAS spreadsheet
  const [assets, setAssets] = useState([
    { id: 1, category: 'ICT Hardware & Software', additionAmount: 25000, disposalAmount: 0 },
    { id: 2, category: 'Motor Vehicles', additionAmount: 35000, disposalAmount: 10000 },
    { id: 3, category: 'Furniture & Fittings', additionAmount: 5000, disposalAmount: 0 }
  ]);

  const handleAddAsset = () => {
    const newId = assets.length ? assets[assets.length - 1].id + 1 : 1;
    setAssets([...assets, { id: newId, category: '', additionAmount: 0, disposalAmount: 0 }]);
  };

  const handleRemoveAsset = (idToRemove) => {
    if (assets.length === 1) return; 
    setAssets(assets.filter(ast => ast.id !== idToRemove));
  };

  const handleAssetChange = (id, field, value) => {
    setAssets(assets.map(ast => ast.id === id ? { ...ast, [field]: value } : ast));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!entityName) {
      setError('Please provide an Entity Name.');
      setLoading(false);
      return;
    }

    try {
      const payload = assets.map(ast => ({
        entity_name: entityName,
        year: year,
        asset_category: ast.category,
        addition_amount: ast.additionAmount,
        disposal_amount: ast.disposalAmount
      }));

      const { data, error: insertError } = await supabase
        .from('core_fixed_assets')
        .insert(payload);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving assets:', err);
      setError(err.message || 'Failed to save fixed assets configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Monitor className="text-[#002D72]" />
            Fixed Assets (CFAS)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage capital expenditures (CapEx) and asset disposals.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Fixed Assets'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Fixed Assets saved securely to the database!
        </div>
      )}

      {/* Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label>
            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
              value={entityName} onChange={e => setEntityName(e.target.value)} placeholder="e.g. Pennarth Greene & Company Limited" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label>
            <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
              value={year} onChange={e => setYear(parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Dynamic Assets Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-[#002D72] flex items-center gap-2">
            <PackagePlus size={18} /> Asset Register
          </h2>
          <button 
            onClick={handleAddAsset}
            className="flex items-center gap-1 text-sm font-bold text-[#C5A059] hover:text-[#a38042] bg-white px-4 py-2 border border-[#C5A059]/30 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} /> Add Asset Class
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Header Row */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase pb-2 border-b border-slate-100">
            <div className="col-span-5">Asset Category</div>
            <div className="col-span-3">Additions (Purchases)</div>
            <div className="col-span-3">Disposals (Sales)</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Dynamic Rows */}
          {assets.map((ast) => (
            <div key={ast.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-lg border border-slate-200 md:border-0">
              
              <div className="col-span-5">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm font-medium" 
                  value={ast.category} onChange={e => handleAssetChange(ast.id, 'category', e.target.value)} placeholder="e.g. Land & Buildings" />
              </div>

              <div className="col-span-3">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Additions</label>
                <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm" 
                  value={ast.additionAmount} onChange={e => handleAssetChange(ast.id, 'additionAmount', parseFloat(e.target.value))} />
              </div>

              <div className="col-span-3">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Disposals</label>
                <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm" 
                  value={ast.disposalAmount} onChange={e => handleAssetChange(ast.id, 'disposalAmount', parseFloat(e.target.value))} />
              </div>

              <div className="col-span-1 flex justify-center">
                <button 
                  type="button"
                  onClick={() => handleRemoveAsset(ast.id)}
                  disabled={assets.length === 1}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}