'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mail, Key, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 1. Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    // 2. Send to Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    // 3. Handle response
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
      setFormData({ email: '', password: '', confirmPassword: '' });
      // Optional: Automatically redirect to login after a few seconds
      setTimeout(() => {
        router.push('/login');
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="h-16 w-16 bg-[#002D72] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6">
          <UserPlus size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
        <p className="mt-2 text-sm text-slate-500">
          Join the Kunata Engine to manage client valuations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} className="shrink-0" /> 
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center">
              <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-3" />
              <h3 className="text-emerald-800 font-bold text-lg mb-1">Registration Successful</h3>
              <p className="text-emerald-600 text-sm mb-4">Your account has been created. Please check your email to verify your account before logging in.</p>
              <Link href="/login" className="text-[#002D72] font-bold text-sm hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSignUp}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required type="email" placeholder="analyst@pennarthgreene.com" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required type="password" placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Confirm Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input required type="password" placeholder="••••••••" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#002D72] font-medium" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#002D72] text-white p-3 rounded-xl font-bold hover:bg-[#001A44] transition-all flex justify-center shadow-lg disabled:opacity-70 mt-4">
                {loading ? <span className="animate-pulse">Creating Account...</span> : 'Sign Up'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <Link href="/login" className="text-[#C5A059] hover:text-[#a38042] font-bold transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}