'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // THE REAL BACKEND CALL
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email, // or whatever your state variable is named
      password: password,
    });

    if (error) {
      alert("Login failed: " + error.message); // Or set this to your error state
      setLoading(false);
    } else {
      // Success! Send them to the Portfolio
      window.location.href = '/'; 
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError(error.message); } 
    else { setMessage("Check your email for the reset link!"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl"><Shield className="text-white" size={32} /></div>
        </div>

        {view === 'login' ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-8">Sign In</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl" value={password} onChange={e => setPassword(e.target.value)} />
              <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
                {loading ? 'Processing...' : 'Login'}
              </button>
            </form>
            <button onClick={() => setView('forgot')} className="w-full text-center text-sm text-blue-600 mt-4 hover:underline font-medium">
              Forgot password?
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
            <p className="text-slate-500 text-sm text-center mb-6">Enter your email and we'll send a recovery link.</p>
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl" value={email} onChange={e => setEmail(e.target.value)} />
              <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Send Link</button>
            </form>
            <button onClick={() => setView('login')} className="flex items-center justify-center gap-2 w-full text-sm text-slate-500 mt-4 hover:text-slate-800">
              <ArrowLeft size={16} /> Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}