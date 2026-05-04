'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; 
import { LayoutDashboard, Building2, Plus, ArrowRight, Activity, Globe2, Briefcase, CheckCircle2, XCircle } from 'lucide-react';

export default function DashboardOverview() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all entities belonging to the logged-in user when the page loads
  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      
      // Because of our strict RLS policies, this query will automatically 
      // ONLY return rows where user_id matches the currently logged-in user!
      const { data, error: fetchError } = await supabase
        .from('entities')
        .select('*')
        .order('entity_name', { ascending: true });

      if (fetchError) throw fetchError;
      setEntities(data || []);

    } catch (err) {
      console.error('Error fetching entities:', err);
      setError(err.message || 'Failed to load your entities.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to render module status
  const ModuleBadge = ({ label, isActive }) => (
    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      {isActive ? (
        <CheckCircle2 size={16} className="text-emerald-500" />
      ) : (
        <XCircle size={16} className="text-slate-300" />
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="text-[#002D72]" />
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome to the Kunata Engine. Here are your active models.</p>
        </div>
        <Link 
          href="/dashboard/entity"
          className="bg-[#C5A059] hover:bg-[#a38042] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Entity
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm font-bold">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Activity size={40} className="animate-spin text-[#002D72] mb-4" />
          <p className="font-bold">Loading your secure vault...</p>
        </div>
      ) : (
        <>
          {/* Empty State (If they have no entities yet) */}
          {entities.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
              <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Entities Found</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                You haven't set up any financial models yet. Create your first entity to unlock the full power of the Kunata Engine.
              </p>
              <Link 
                href="/dashboard/entity"
                className="inline-flex items-center gap-2 bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                <Plus size={18} /> Setup First Entity
              </Link>
            </div>
          ) : (
            /* Entity Grid */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {entities.map((entity) => (
                <div key={entity.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  
                  {/* Card Header */}
                  <div className="bg-[#002D72] p-5 text-white flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-1">{entity.entity_name}</h2>
                      <div className="flex items-center gap-4 text-xs font-semibold text-blue-200">
                        <span className="flex items-center gap-1"><Globe2 size={14}/> {entity.country_code}</span>
                        <span className="flex items-center gap-1"><Briefcase size={14}/> {entity.industry_category}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-white">FY {entity.start_year}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Module Statuses */}
                  <div className="p-5 flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                    
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sector Models</h3>
                      <div className="space-y-2">
                        {entity.mod_bank && <ModuleBadge label="Banking (1BK)" isActive={true} />}
                        {entity.mod_insurance && <ModuleBadge label="Insurance (2IN)" isActive={true} />}
                        {entity.mod_reinsurance && <ModuleBadge label="Reinsurance (3RE)" isActive={true} />}
                        {entity.mod_retail && <ModuleBadge label="Retail (6RT)" isActive={true} />}
                        {!entity.mod_bank && !entity.mod_insurance && !entity.mod_reinsurance && !entity.mod_retail && (
                          <div className="text-xs font-bold text-slate-400 italic p-2">No sector active</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Core Financials</h3>
                      <div className="space-y-2">
                        <ModuleBadge label="Payroll (CPAY)" isActive={entity.mod_payroll} />
                        <ModuleBadge label="Expenses (CEXP)" isActive={entity.mod_expenses} />
                        <ModuleBadge label="Capital (CCAP)" isActive={entity.mod_capital} />
                        <ModuleBadge label="Valuation (WACC)" isActive={entity.mod_wacc} />
                      </div>
                    </div>

                  </div>

                  {/* Card Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Currency: {entity.currency}
                    </span>
                    <Link 
                      href="/dashboard/entity" 
                      className="text-sm font-bold text-[#002D72] hover:text-[#C5A059] flex items-center gap-1 transition-colors"
                    >
                      Edit Config <ArrowRight size={16} />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}