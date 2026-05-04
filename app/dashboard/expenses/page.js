'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Receipt, Save, Activity, AlertCircle, Plus, Trash2, CreditCard } from 'lucide-react';

export default function ExpensesDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [entityName, setEntityName] = useState('');
  const [year, setYear] = useState(2026);

  // Initialize with standard categories from your spreadsheet
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Occupancy Expenses', annualAmount: 150000, gstApplicable: true },
    { id: 2, category: 'Board Expenses', annualAmount: 50000, gstApplicable: false },
    { id: 3, category: 'Commission Expenses', annualAmount: 25000, gstApplicable: true }
  ]);

  const handleAddExpense = () => {
    const newId = expenses.length ? expenses[expenses.length - 1].id + 1 : 1;
    setExpenses([...expenses, { id: newId, category: '', annualAmount: 0, gstApplicable: true }]);
  };

  const handleRemoveExpense = (idToRemove) => {
    if (expenses.length === 1) return; 
    setExpenses(expenses.filter(exp => exp.id !== idToRemove));
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
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
      const payload = expenses.map(exp => ({
        entity_name: entityName,
        year: year,
        expense_category: exp.category,
        annual_amount: exp.annualAmount,
        gst_applicable: exp.gstApplicable
      }));

      const { data, error: insertError } = await supabase
        .from('core_expenses')
        .insert(payload);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving expenses:', err);
      setError(err.message || 'Failed to save expense configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="text-[#002D72]" />
            General Expenses (CEXP)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage periodic operational costs and tax applicability.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Expenses'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Expense data saved securely to the database!
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

      {/* Dynamic Expenses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-[#002D72] flex items-center gap-2">
            <CreditCard size={18} /> Overhead Allocations
          </h2>
          <button 
            onClick={handleAddExpense}
            className="flex items-center gap-1 text-sm font-bold text-[#C5A059] hover:text-[#a38042] bg-white px-4 py-2 border border-[#C5A059]/30 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} /> Add Expense Line
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Header Row */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase pb-2 border-b border-slate-100">
            <div className="col-span-5">Expense Category</div>
            <div className="col-span-3">Annual Amount</div>
            <div className="col-span-3 text-center">Subject to GST / Sales Tax?</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Dynamic Rows */}
          {expenses.map((exp) => (
            <div key={exp.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-lg border border-slate-200 md:border-0">
              
              <div className="col-span-5">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm font-medium" 
                  value={exp.category} onChange={e => handleExpenseChange(exp.id, 'category', e.target.value)} placeholder="e.g. Marketing & Advertising" />
              </div>

              <div className="col-span-3">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm" 
                  value={exp.annualAmount} onChange={e => handleExpenseChange(exp.id, 'annualAmount', parseFloat(e.target.value))} />
              </div>

              <div className="col-span-3 flex justify-center items-center">
                <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mr-4">GST Applicable?</label>
                <button 
                  type="button"
                  onClick={() => handleExpenseChange(exp.id, 'gstApplicable', !exp.gstApplicable)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#002D72] focus:ring-offset-2 ${exp.gstApplicable ? 'bg-[#002D72]' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${exp.gstApplicable ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="col-span-1 flex justify-center">
                <button 
                  type="button"
                  onClick={() => handleRemoveExpense(exp.id)}
                  disabled={expenses.length === 1}
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