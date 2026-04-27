'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Edit3, Plus, X, Save, ArrowLeft } from 'lucide-react';

export default function AdminPortal() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [newScenario, setNewScenario] = useState({ name: '', wacc: 0.08, overall_risk_rating: 'A' });

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  async function checkUserAndFetch() {
    // 1. Get the company ID from the URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('companyId');
    setCompanyId(id);

    // 2. Check for the secure session
    const { data: { session } } = await supabase.auth.getSession();
    
    // 3. Kick to login if unprotected
    if (!session) {
      window.location.href = '/login';
      return;
    }

    // 4. If secure, fetch the data
    fetchScenarios(id);
  }

  async function fetchScenarios(id) {
    let query = supabase.from('scenarios').select('*').order('created_at', { ascending: false });
    
    if (id) {
      query = query.eq('company_id', id);
    }

    const { data } = await query;
    if (data) setScenarios(data);
    setLoading(false);
  }

  async function handleCreateScenario(e) {
    e.preventDefault();
    const payload = { ...newScenario, company_id: companyId };
    
    const { data, error } = await supabase
      .from('scenarios')
      .insert([payload])
      .select();

    if (!error) {
      setScenarios([data[0], ...scenarios]);
      setShowForm(false);
      setNewScenario({ name: '', wacc: 0.08, overall_risk_rating: 'A' });
    }
  }

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Verifying Security...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <Link href={companyId ? `/dashboard?companyId=${companyId}` : '/'} className="flex items-center gap-2 text-slate-500 hover:text-[#002D72] mb-6 font-bold text-sm">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scenario Management</h1>
          <p className="text-slate-500 text-sm">Update financial projections for this client.</p>
        </div>
        
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#002D72] text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all text-sm shadow-lg"
          >
            <Plus size={18} /> Create New Scenario
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#002D72]">New Scenario Details</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={20}/></button>
          </div>
          <form onSubmit={handleCreateScenario} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name</label>
              <input required className="w-full p-2 rounded border border-slate-200" value={newScenario.name} onChange={e => setNewScenario({...newScenario, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">WACC</label>
              <input type="number" step="0.001" className="w-full p-2 rounded border border-slate-200" value={newScenario.wacc} onChange={e => setNewScenario({...newScenario, wacc: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Risk</label>
              <select className="w-full p-2 rounded border border-slate-200" value={newScenario.overall_risk_rating} onChange={e => setNewScenario({...newScenario, overall_risk_rating: e.target.value})}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </div>
            <button type="submit" className="bg-[#002D72] text-white p-2 rounded font-bold hover:bg-slate-800 flex items-center justify-center gap-2">
              <Save size={18} /> Create
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Scenario Name</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase text-center">WACC</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase text-center">Risk</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scenarios.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-700">{s.name}</td>
                <td className="p-4 text-center text-slate-600">{(s.wacc * 100).toFixed(1)}%</td>
                <td className="p-4 text-center">
                  <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-100 uppercase">Grade {s.overall_risk_rating}</span>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/scenario/${s.id}`} className="bg-slate-900 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-slate-800">
                    Edit Financials
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {scenarios.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400 italic font-medium">No scenarios found for this client. Create one to begin.</div>
        )}
      </div>
    </div>
  );
}