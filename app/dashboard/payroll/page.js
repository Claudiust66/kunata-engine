'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Users, Save, Activity, AlertCircle, Plus, Trash2, Briefcase } from 'lucide-react';

export default function PayrollDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Global Info
  const [entityName, setEntityName] = useState('');
  const [year, setYear] = useState(2026);

  // Dynamic Array for Roles
  const [roles, setRoles] = useState([
    { id: 1, department: 'Executive', roleTitle: 'Chief Executive Officer', headcount: 1, baseSalary: 250000, benefitsPct: 15.0 }
  ]);

  const handleAddRole = () => {
    const newId = roles.length ? roles[roles.length - 1].id + 1 : 1;
    setRoles([...roles, { id: newId, department: 'Operations', roleTitle: '', headcount: 1, baseSalary: 0, benefitsPct: 10.0 }]);
  };

  const handleRemoveRole = (idToRemove) => {
    if (roles.length === 1) return; // Always keep at least one row
    setRoles(roles.filter(role => role.id !== idToRemove));
  };

  const handleRoleChange = (id, field, value) => {
    setRoles(roles.map(role => role.id === id ? { ...role, [field]: value } : role));
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
      // We map the React state into an array of database rows
      const payload = roles.map(role => ({
        entity_name: entityName,
        year: year,
        department: role.department,
        role_title: role.roleTitle,
        headcount: role.headcount,
        base_salary: role.baseSalary,
        benefits_pct: role.benefitsPct
      }));

      const { data, error: insertError } = await supabase
        .from('core_payroll')
        .insert(payload);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving payroll:', err);
      setError(err.message || 'Failed to save payroll configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-[#002D72]" />
            Payroll Costs (CPAY)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Define organizational structure, headcount, and remuneration.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Payroll Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Payroll data saved securely to the database!
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

      {/* Dynamic Roles Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-[#002D72] flex items-center gap-2">
            <Briefcase size={18} /> Organizational Roster
          </h2>
          <button 
            onClick={handleAddRole}
            className="flex items-center gap-1 text-sm font-bold text-[#C5A059] hover:text-[#a38042] bg-white px-4 py-2 border border-[#C5A059]/30 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} /> Add Role
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Header Row (Hidden on mobile) */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase pb-2 border-b border-slate-100">
            <div className="col-span-2">Department</div>
            <div className="col-span-3">Role Title</div>
            <div className="col-span-2">Headcount</div>
            <div className="col-span-2">Base Salary</div>
            <div className="col-span-2">Benefits (%)</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Dynamic Rows */}
          {roles.map((role) => (
            <div key={role.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-lg border border-slate-200 md:border-0">
              
              <div className="col-span-2">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                <select className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm"
                  value={role.department} onChange={e => handleRoleChange(role.id, 'department', e.target.value)}>
                  <option value="Executive">Executive</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales & Marketing</option>
                  <option value="IT">IT & Tech</option>
                </select>
              </div>

              <div className="col-span-3">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Role Title</label>
                <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm font-medium" 
                  value={role.roleTitle} onChange={e => handleRoleChange(role.id, 'roleTitle', e.target.value)} placeholder="e.g. Regional Manager" />
              </div>

              <div className="col-span-2">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Headcount</label>
                <input type="number" min="1" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm" 
                  value={role.headcount} onChange={e => handleRoleChange(role.id, 'headcount', parseInt(e.target.value))} />
              </div>

              <div className="col-span-2">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Base Salary</label>
                <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm" 
                  value={role.baseSalary} onChange={e => handleRoleChange(role.id, 'baseSalary', parseFloat(e.target.value))} />
              </div>

              <div className="col-span-2">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Benefits (%)</label>
                <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm" 
                  value={role.benefitsPct} onChange={e => handleRoleChange(role.id, 'benefitsPct', parseFloat(e.target.value))} />
              </div>

              <div className="col-span-1 flex justify-center">
                <button 
                  type="button"
                  onClick={() => handleRemoveRole(role.id)}
                  disabled={roles.length === 1}
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