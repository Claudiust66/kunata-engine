'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Building2, Save, Activity, Landmark, Wallet, Coins, AlertCircle, TrendingUp } from 'lucide-react';

export default function BankingDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('capital');

  const [formData, setFormData] = useState({
    entityName: '',
    year: 2026,
    // Capital & Assets
    equityCapital: 0.0,
    debtCapital: 0.0,
    cashReservePct: 0.0,
    avgYieldAssets: 0.0,
    // Deposits
    currentDepositsTier1Bal: 0.0,
    currentDepositsTier1Customers: 0,
    savingsDepositsTier1Bal: 0.0,
    // Revenue & Fees
    interestIncome: 0.0,
    loanFees: 0.0,
    forexValue: 0.0,
    forexSpread: 0.0,
    badDebts: 0.0
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
      const { data, error: insertError } = await supabase
        .from('banking_financials')
        .insert([
          {
            entity_name: formData.entityName,
            year: formData.year,
            equity_capital: formData.equityCapital,
            debt_capital: formData.debtCapital,
            cash_reserve_pct: formData.cashReservePct,
            avg_yield_assets: formData.avgYieldAssets,
            current_deposits_tier1_bal: formData.currentDepositsTier1Bal,
            current_deposits_tier1_customers: formData.currentDepositsTier1Customers,
            savings_deposits_tier1_bal: formData.savingsDepositsTier1Bal,
            interest_income: formData.interestIncome,
            loan_fees: formData.loanFees,
            forex_value: formData.forexValue,
            forex_spread: formData.forexSpread,
            bad_debts: formData.badDebts
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving banking data:', err);
      setError(err.message || 'Failed to save banking configuration.');
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
            <Landmark className="text-[#002D72]" />
            Banking Sector (D1BK)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Data entry for capital, deposits, and revenue assumptions.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Banking Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Banking configuration saved successfully!
        </div>
      )}

      {/* Global Context Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entity Name</label>
            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
              value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="Must match DetE entity..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Year</label>
            <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
              value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        <button onClick={() => setActiveTab('capital')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'capital' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Landmark size={16} /> Capital & Assets
        </button>
        <button onClick={() => setActiveTab('deposits')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'deposits' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Wallet size={16} /> Deposit Tiers
        </button>
        <button onClick={() => setActiveTab('revenue')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'revenue' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <TrendingUp size={16} /> Revenue Assumptions
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-6">
        
        {/* TAB 1: CAPITAL & ASSETS */}
        {activeTab === 'capital' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-3">Capital Allocations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estimated Equity Capital</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.equityCapital} onChange={e => setFormData({...formData, equityCapital: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estimated Debt Capital</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.debtCapital} onChange={e => setFormData({...formData, debtCapital: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cash Reserve (%)</label>
                <input type="number" step="0.001" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.cashReservePct} onChange={e => setFormData({...formData, cashReservePct: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Average Yield on Assets (%)</label>
                <input type="number" step="0.001" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.avgYieldAssets} onChange={e => setFormData({...formData, avgYieldAssets: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEPOSITS */}
        {activeTab === 'deposits' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-3">Current & Savings Deposits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-3 text-sm">Tier 1 Current (Bal &gt;= 100k)</h3>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 mt-2">Average Balance</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.currentDepositsTier1Bal} onChange={e => setFormData({...formData, currentDepositsTier1Bal: parseFloat(e.target.value)})} />
                
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 mt-4">No. of Customers</label>
                <input type="number" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.currentDepositsTier1Customers} onChange={e => setFormData({...formData, currentDepositsTier1Customers: parseInt(e.target.value)})} />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-3 text-sm">Tier 1 Savings (Bal &gt;= 1m)</h3>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 mt-2">Average Balance</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.savingsDepositsTier1Bal} onChange={e => setFormData({...formData, savingsDepositsTier1Bal: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE & FEES */}
        {activeTab === 'revenue' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-3">Revenue Assumptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Interest Income</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.interestIncome} onChange={e => setFormData({...formData, interestIncome: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Loan Fees</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.loanFees} onChange={e => setFormData({...formData, loanFees: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type 1 Forex: Value</label>
                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.forexValue} onChange={e => setFormData({...formData, forexValue: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type 1 Forex: Spread</label>
                <input type="number" step="0.001" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={formData.forexSpread} onChange={e => setFormData({...formData, forexSpread: parseFloat(e.target.value)})} />
              </div>
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <label className="block text-xs font-bold text-rose-500 uppercase mb-2 flex items-center gap-1"><AlertCircle size={14}/> Stress Tests: Bad Debts</label>
                <input type="number" step="0.01" className="w-full md:w-1/2 p-2.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" 
                  value={formData.badDebts} onChange={e => setFormData({...formData, badDebts: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}