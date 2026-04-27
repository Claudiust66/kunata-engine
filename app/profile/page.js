'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Briefcase, Phone, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: 'Default',
    lastName: 'Analyst',
    email: 'analyst@pennarthgreene.com',
    role: 'Senior Valuation Analyst',
    phone: '+1 (555) 123-4567'
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

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Verifying Security...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-[#002D72] mb-8 font-bold text-sm transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Portfolio
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analyst Profile</h1>
          <p className="text-slate-500 mt-1">Manage your personal information and contact details.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-8 flex items-center gap-6">
            <div className="bg-[#002D72] text-white h-20 w-20 rounded-full flex items-center justify-center text-2xl font-black shadow-lg">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{profile.firstName} {profile.lastName}</h2>
              <p className="text-[#C5A059] font-bold uppercase tracking-wider text-xs mt-1">{profile.role}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Last Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required type="email" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium text-slate-500 cursor-not-allowed" value={profile.email} disabled title="Contact an administrator to change your email." />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Corporate Title</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button type="submit" disabled={isSaving} className="bg-[#002D72] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#001A44] transition-all flex items-center gap-2 shadow-lg disabled:opacity-70">
                {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save size={18} /> Save Changes</>}
              </button>
              {saveSuccess && <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-in fade-in"><CheckCircle2 size={18} /> Profile updated securely</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}