'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Settings, User, Mail, Briefcase, Building, Save, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  
  const [profile, setProfile] = useState({
    fullName: '',
    jobTitle: '',
    organization: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // 1. Get the currently authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      if (user) {
        setUserId(user.id);
        setEmail(user.email);

        // 2. Fetch their profile data from our new table
        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select('full_name, job_title, organization')
          .eq('id', user.id)
          .single();

        // It's okay if they don't have a profile yet (PGRST116 is the code for zero rows)
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (data) {
          setProfile({
            fullName: data.full_name || '',
            jobTitle: data.job_title || '',
            organization: data.organization || ''
          });
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Could not load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      // Upsert: Update the row if it exists, insert it if it doesn't
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: profile.fullName,
          job_title: profile.jobTitle,
          organization: profile.organization,
          updated_at: new Date()
        });

      if (upsertError) throw upsertError;

      setSuccess(true);
      window.dispatchEvent(new Event('profileUpdated'));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <Activity size={40} className="animate-spin text-[#002D72] mb-4" />
        <p className="font-bold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="text-[#002D72]" />
            Account Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your personal profile and system preferences.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold">
          <CheckCircle2 size={18} /> Profile updated successfully.
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-[#002D72] flex items-center gap-2">
            <User size={18} /> Personal Information
          </h2>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* Read-Only Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              <input type="text" disabled className="w-full pl-9 p-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg outline-none cursor-not-allowed font-medium" 
                value={email} />
            </div>
            <p className="text-xs text-slate-400 mt-1">To change your login email, please contact the system administrator.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72] font-medium" 
                  value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} placeholder="e.g. Jane Doe" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Title</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={profile.jobTitle} onChange={e => setProfile({...profile, jobTitle: e.target.value})} placeholder="e.g. Senior Financial Analyst" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Organization / Firm</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#002D72]" 
                  value={profile.organization} onChange={e => setProfile({...profile, organization: e.target.value})} placeholder="e.g. Pennarth Greene" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="bg-[#002D72] hover:bg-[#001f4d] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              {saving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}