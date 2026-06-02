'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Building2, ArrowRight, Plus, Briefcase } from 'lucide-react';

export default function PortfolioPage() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  async function checkUserAndFetch() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = '/login';
      return;
    }
    fetchEntities();
  }

  async function fetchEntities() {
    const { data } = await supabase.from('entities').select('*').order('entity_name');
    if (data) setEntities(data);
    setLoading(false);
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
          
          <Link 
            href="/dashboard/entity"
            className="bg-[#002D72] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#001A44] transition-all shadow-lg"
          >
            <Plus size={20} /> New Client
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entities.map((entity) => (
            <Link 
              key={entity.id} 
              href={`/dashboard?entity=${encodeURIComponent(entity.entity_name)}`} 
              className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#C5A059] transition-all flex justify-between items-center"
            >
              <div className="flex items-center gap-5">
                <div className="bg-slate-900 p-4 rounded-2xl group-hover:bg-[#002D72] transition-colors shadow-lg">
                  <Building2 className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-800 group-hover:text-[#002D72] transition-colors">
                    {entity.entity_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase size={14} className="text-slate-400" />
                    <p className="text-slate-500 text-sm font-medium">
                      {entity.currency} | FY {entity.start_year}
                    </p>
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