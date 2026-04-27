'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Key, ShieldCheck, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    verifySecurity();
  }, []);

  async function verifySecurity() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    setLoading(false);
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSaveSuccess(false);

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match. Please verify and try again.');
      return;
    }
    if (passwords.new.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsSaving(true);
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwords.new
    });

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaveSuccess(true);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Verifying Security...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-[#002D72] mb-8 font-bold text-sm transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Portfolio
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security & Credentials</h1>
          <p className="text-slate-500 mt-1">Update your password to keep your analyst account secure.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-800 p-8 flex items-center gap-4">
            <div className="bg-[#C5A059] p-3 rounded-xl shadow-lg">
              <ShieldCheck size={28} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <p className="text-slate-400 text-sm mt-1">Ensure your new password meets corporate requirements.</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-8">
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Current Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required type="password" placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">New Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required type="password" placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Confirm New Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required type="password" placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button type="submit" disabled={isSaving} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-70">
                {isSaving ? <span className="animate-pulse">Verifying...</span> : <><Save size={18} /> Update Password</>}
              </button>
              {saveSuccess && <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-in fade-in"><CheckCircle2 size={18} /> Password updated successfully</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}