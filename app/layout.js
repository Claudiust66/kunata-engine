'use client';
import './globals.css';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from './components/Navbar';

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // 1. Let the user access login and signup without a ticket
      if (pathname === '/login' || pathname === '/signup') {
        setIsAuthorized(true);
        return;
      }

      // 2. Otherwise, check for a valid session ticket
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthorized(true);
      }
    };
    
    checkSession();
  }, [pathname, router]);

  // If they don't have a ticket yet, show the "Bouncer" screen
  if (!isAuthorized) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 font-bold">Verifying secure session...</p>
          </div>
        </body>
      </html>
    );
  }

  // If they DO have a ticket (or are on the login page), render the app normally
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans">
        {/* Only show the Navbar if they are NOT on the login/signup pages */}
        {pathname !== '/login' && pathname !== '/signup' && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  );
}