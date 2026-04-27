'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) alert(error.message);
    else {
      setMessage("Password updated! Redirecting...");
      setTimeout(() => window.location.href = '/login', 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <form onSubmit={handleUpdatePassword} className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>
        {message && <div className="mb-4 text-green-600 text-sm">{message}</div>}
        <input 
          type="password" placeholder="Enter new password" required 
          className="w-full p-3 border rounded-xl mb-4"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Update Password</button>
      </form>
    </div>
  );
}