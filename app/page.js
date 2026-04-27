'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Building2, ArrowRight, Plus, Briefcase, X, Save } from 'lucide-react';

export default function PortfolioPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCompany, setNewCompany] = useState({ 
    name: '', 
    base_year: 2026, 
    currency: 'USD' 
  });

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  async function checkUserAndFetch() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = '/login';
      return;
    }

    fetchCompanies();
  }

  async function fetchCompanies() {
    const { data } = await supabase.from('companies').select('*').order('name');
    if (data) setCompanies(data);
    setLoading(false);
  }

  async function handleCreateCompany(e) {
    e.preventDefault();
    if (!newCompany.name) return;

    const { data, error } = await supabase
      .from('companies')
      .insert([newCompany])
      .select();

    if (!error) {
      setCompanies([...data, ...companies]);
      setNewCompany({ name: '', base_year: 2026, currency: 'USD' });
      setIsAdding(false);
    } else {
      alert("Error: " + error.message);
    }
  }

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Verifying Security...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Client Portfolio</h1>
            <p className="text-slate-500 mt-1">Pennarth Greene Analyst Portal</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#002D72] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#001A44] transition-all shadow-lg"
            >
              <Plus size={20} /> New Client
            </button>
          )}
        </div>

        {isAdding && (
          <div className="mb-10 bg-white p-8 rounded-3xl border-2 border-[#C5A059] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Onboard New Client</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateCompany} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Client Name</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="e.g. Equity Bank" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Base Year</label>
                <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newCompany.base_year} onChange={e => setNewCompany({...newCompany, base_year: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Currency</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700" value={newCompany.currency} onChange={e => setNewCompany({...newCompany, currency: e.target.value})}>
                  <option value="USD">USD ($)</option>
                  <option value="GHS">GHS (₵)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <button type="submit" className="bg-[#002D72] text-white p-3.5 rounded-xl font-bold hover:bg-[#001A44] flex items-center justify-center gap-2 shadow-lg">
                <Save size={20} /> Complete
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <Link key={company.id} href={`/dashboard?companyId=${company.id}`} className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#C5A059] transition-all flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="bg-slate-900 p-4 rounded-2xl group-hover:bg-[#002D72] transition-colors shadow-lg">
                  <Building2 className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-800 group-hover:text-[#002D72] transition-colors">{company.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase size={14} className="text-slate-400" />
                    <p className="text-slate-500 text-sm font-medium">{company.currency} | {company.base_year}</p>
                  </div>
                </div>
              </div>
              <ArrowRight className="text-slate-200 group-hover:text-[#002D72] group-hover:translate-x-1 transition-all" size={24} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}