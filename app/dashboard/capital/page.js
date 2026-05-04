'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Banknote, Save, Activity, AlertCircle, Plus, Trash2, Coins, TrendingUp } from 'lucide-react';

export default function CapitalDetailsForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('debt');

  // Global Context
  const [entityName, setEntityName] = useState('');
  const [year, setYear] = useState(2026);

  // DEBT STATE: Dynamic Array for Loans
  const [loans, setLoans] = useState([
    { id: 1, loanName: 'Senior Term Loan A', loanType: 'Long-Term', drawdownAmount: 0, repaymentAmount: 50000, interestIncurred: 12500, interestPaid: 12500 },
    { id: 2, loanName: 'Working Capital Facility', loanType: 'Short-Term', drawdownAmount: 25000, repaymentAmount: 0, interestIncurred: 1500, interestPaid: 1500 }
  ]);

  // EQUITY STATE: Fixed fields
  const [equity, setEquity] = useState({
    newSharesIssued: 0,
    parValue: 1.00,
    sharePremium: 0.00,
    dividendsProposed: 0.00,
    dividendsPaid: 0.00,
    sharesBoughtBack: 0,
    buybackPrice: 0.00
  });

  const handleAddLoan = () => {
    const newId = loans.length ? loans[loans.length - 1].id + 1 : 1;
    setLoans([...loans, { id: newId, loanName: '', loanType: 'Long-Term', drawdownAmount: 0, repaymentAmount: 0, interestIncurred: 0, interestPaid: 0 }]);
  };

  const handleRemoveLoan = (idToRemove) => {
    if (loans.length === 1) return; 
    setLoans(loans.filter(loan => loan.id !== idToRemove));
  };

  const handleLoanChange = (id, field, value) => {
    setLoans(loans.map(loan => loan.id === id ? { ...loan, [field]: value } : loan));
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
      // 1. Save Dynamic Debt Rows
      const loanPayload = loans.map(loan => ({
        entity_name: entityName,
        year: year,
        loan_name: loan.loanName,
        loan_type: loan.loanType,
        drawdown_amount: loan.drawdownAmount,
        repayment_amount: loan.repaymentAmount,
        interest_incurred: loan.interestIncurred,
        interest_paid: loan.interestPaid
      }));

      const { error: loanError } = await supabase.from('core_loans').insert(loanPayload);
      if (loanError) throw loanError;

      // 2. Save Equity Object
      const { error: equityError } = await supabase.from('core_equity').insert([{
        entity_name: entityName,
        year: year,
        new_shares_issued: equity.newSharesIssued,
        par_value: equity.parValue,
        share_premium: equity.sharePremium,
        dividends_proposed: equity.dividendsProposed,
        dividends_paid: equity.dividendsPaid,
        shares_bought_back: equity.sharesBoughtBack,
        buyback_price: equity.buybackPrice
      }]);
      if (equityError) throw equityError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('Error saving capital data:', err);
      setError(err.message || 'Failed to save capital configuration.');
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
            <Banknote className="text-[#002D72]" />
            Capital & Financing (CCAP)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage debt facilities, equity issuances, and dividends.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Capital Data'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          Capital and Financing data saved securely!
        </div>
      )}

      {/* Global Context Card */}
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

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        <button onClick={() => setActiveTab('debt')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'debt' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Banknote size={16} /> Debt Financing
        </button>
        <button onClick={() => setActiveTab('equity')} className={`px-5 py-3 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === 'equity' ? 'bg-[#002D72] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
          <Coins size={16} /> Equity & Dividends
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-6">
        
        {/* TAB 1: DEBT FINANCING */}
        {activeTab === 'debt' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#002D72]">Loan Facilities</h2>
              <button onClick={handleAddLoan} className="flex items-center gap-1 text-sm font-bold text-[#C5A059] hover:text-[#a38042] bg-white px-4 py-2 border border-[#C5A059]/30 rounded-lg shadow-sm transition-colors">
                <Plus size={16} /> Add Loan
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="hidden md:grid md:grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase pb-2 border-b border-slate-100">
                <div className="col-span-3">Facility Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">New Drawdown</div>
                <div className="col-span-2">Repayment</div>
                <div className="col-span-2">Interest Paid</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {loans.map((loan) => (
                <div key={loan.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-lg border border-slate-200 md:border-0">
                  <div className="col-span-3">
                    <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Facility Name</label>
                    <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm font-medium" 
                      value={loan.loanName} onChange={e => handleLoanChange(loan.id, 'loanName', e.target.value)} placeholder="e.g. HSBC Term Loan" />
                  </div>
                  <div className="col-span-2">
                    <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                    <select className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm"
                      value={loan.loanType} onChange={e => handleLoanChange(loan.id, 'loanType', e.target.value)}>
                      <option value="Long-Term">Long-Term</option>
                      <option value="Short-Term">Short-Term</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">New Drawdown</label>
                    <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm" 
                      value={loan.drawdownAmount} onChange={e => handleLoanChange(loan.id, 'drawdownAmount', parseFloat(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Repayment</label>
                    <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm" 
                      value={loan.repaymentAmount} onChange={e => handleLoanChange(loan.id, 'repaymentAmount', parseFloat(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="md:hidden block text-xs font-bold text-slate-500 uppercase mb-1">Interest Paid</label>
                    <input type="number" step="0.01" className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] text-sm" 
                      value={loan.interestPaid} onChange={e => handleLoanChange(loan.id, 'interestPaid', parseFloat(e.target.value))} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button type="button" onClick={() => handleRemoveLoan(loan.id)} disabled={loans.length === 1} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EQUITY & DIVIDENDS */}
        {activeTab === 'equity' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            <div>
              <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-3 flex items-center gap-2"><TrendingUp size={18}/> Share Capital</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Shares Issued</label>
                  <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={equity.newSharesIssued} onChange={e => setEquity({...equity, newSharesIssued: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Par Value (per share)</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={equity.parValue} onChange={e => setEquity({...equity, parValue: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Share Premium (per share)</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={equity.sharePremium} onChange={e => setEquity({...equity, sharePremium: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#002D72] mb-4 border-b border-slate-100 pb-3 flex items-center gap-2"><Coins size={18}/> Dividends & Buybacks</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dividends Proposed</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={equity.dividendsProposed} onChange={e => setEquity({...equity, dividendsProposed: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dividends Paid (Cash)</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={equity.dividendsPaid} onChange={e => setEquity({...equity, dividendsPaid: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Shares Bought Back</label>
                  <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={equity.sharesBoughtBack} onChange={e => setEquity({...equity, sharesBoughtBack: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Buyback Price</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                    value={equity.buybackPrice} onChange={e => setEquity({...equity, buybackPrice: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}