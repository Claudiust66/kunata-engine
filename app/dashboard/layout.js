'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';
import { Building2, Landmark, LayoutDashboard, LogOut, Users, Receipt, Monitor, Banknote, Calculator, Settings, Store, LineChart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; 

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // 1. Reference to hold our active timer
  const timeoutRef = useRef(null);

  // 2. Wrap logout in useCallback so it stays stable in memory
  const handleLogout = useCallback(async () => {
    console.log("Session timed out due to inactivity. Logging out...");
    await supabase.auth.signOut();
    router.push('/login');
  }, [router]);

  // 3. The function that resets the 30-minute clock
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // 30 minutes = 30 * 60 * 1000 = 1,800,000 milliseconds
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 1800000); 
  }, [handleLogout]);

  // 4. Listen for user activity to trigger the reset
  useEffect(() => {
    // Array of DOM events that indicate the user is actively using the app
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      resetTimer();
    };

    // Attach the listeners to the entire document
    activityEvents.forEach(event => document.addEventListener(event, handleUserActivity));
    
    // Start the timer when the dashboard first loads
    resetTimer();

    // Cleanup phase: remove listeners if the user leaves the dashboard
    return () => {
      activityEvents.forEach(event => document.removeEventListener(event, handleUserActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  // Your Master Navigation Menu
  const navItems = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Valuation Engine', href: '/dashboard/valuation', icon: LineChart },
    { name: 'Entity Config (DetE)', href: '/dashboard/entity', icon: Building2 },
    { name: 'Banking Sector (1BK)', href: '/dashboard/banking', icon: Landmark },
    { name: 'Retail Sector (6RT)', href: '/dashboard/retail', icon: Store },
    { name: 'Payroll Costs (CPAY)', href: '/dashboard/payroll', icon: Users },
    { name: 'General Expenses (CEXP)', href: '/dashboard/expenses', icon: Receipt },
    { name: 'Fixed Assets (CFAS)', href: '/dashboard/assets', icon: Monitor },
    { name: 'Capital & Finance (CCAP)', href: '/dashboard/capital', icon: Banknote },
    { name: 'Tax & Valuation (WACC)', href: '/dashboard/tax-wacc', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#002D72] text-white flex flex-col shadow-xl z-10 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-[#C5A059] tracking-wide">Kunata</h2>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-semibold">Engine UI</p>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href; 
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#C5A059] text-white font-bold shadow-md' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM USER ACTIONS */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link 
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors font-medium ${
              pathname === '/dashboard/settings' 
                ? 'bg-[#C5A059] text-white font-bold' 
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings size={20} className={pathname === '/dashboard/settings' ? 'text-white' : ''} />
            Settings
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-y-auto">
        {children}
      </main>

    </div>
  );
}