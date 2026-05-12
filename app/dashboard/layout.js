'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  Building2, Landmark, LayoutDashboard, LogOut, Users, Receipt, 
  Monitor, Banknote, Calculator, Settings, Store, LineChart, 
  ChevronDown, ChevronRight, Wallet, Briefcase 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; 

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // 1. State to track which accordion menus are expanded
  const [openMenus, setOpenMenus] = useState({
    'Revenue & Direct Costs': true,
    'Core Financials': true
  });

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  // 2. Idle Timeout Logic 
  const timeoutRef = useRef(null);

  const handleLogout = useCallback(async () => {
    console.log("Session timed out due to inactivity. Logging out...");
    await supabase.auth.signOut();
    router.push('/login');
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 1800000); // 30 minutes
  }, [handleLogout]);

  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleUserActivity = () => resetTimer();
    activityEvents.forEach(event => document.addEventListener(event, handleUserActivity));
    resetTimer();

    return () => {
      activityEvents.forEach(event => document.removeEventListener(event, handleUserActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  // 3. The Fully Grouped Navigation Menu
  const navItems = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Valuation Engine', href: '/dashboard/valuation', icon: LineChart },
    { name: 'Entity Config (DetE)', href: '/dashboard/entity', icon: Building2 },
    
    // GROUP 1: REVENUE MODULES
    { 
      name: 'Revenue & Direct Costs', 
      icon: Wallet,
      subItems: [
        { name: 'Banking Sector (1BK)', href: '/dashboard/banking', icon: Landmark },
        { name: 'Retail Sector (6RT)', href: '/dashboard/retail', icon: Store },
        // { name: 'Reinsurance (3REI)', href: '/dashboard/reinsurance', icon: Shield }, 
      ]
    },

    // GROUP 2: CORE FINANCIALS
    {
      name: 'Core Financials',
      icon: Briefcase,
      subItems: [
        { name: 'Payroll Costs (CPAY)', href: '/dashboard/payroll', icon: Users },
        { name: 'General Expenses (CEXP)', href: '/dashboard/expenses', icon: Receipt },
        { name: 'Fixed Assets (CFAS)', href: '/dashboard/assets', icon: Monitor },
        { name: 'Capital & Finance (CCAP)', href: '/dashboard/capital', icon: Banknote },
        { name: 'Tax & Valuation (WACC)', href: '/dashboard/tax-wacc', icon: Calculator },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#002D72] text-white flex flex-col shadow-xl z-10 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-[#C5A059] tracking-wide">Kunata</h2>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-semibold">Engine UI</p>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // Render Grouped Items
            if (item.subItems) {
              const isOpen = openMenus[item.name];
              const isChildActive = item.subItems.some(sub => pathname === sub.href);

              return (
                <div key={item.name} className="space-y-1 mb-2">
                  <button 
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isChildActive && !isOpen ? 'bg-white/5 text-white font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={isChildActive ? 'text-white' : 'text-slate-400'} />
                      {item.name}
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isOpen && (
                    <div className="pl-11 pr-2 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.subItems.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link 
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                              isSubActive 
                                ? 'bg-[#C5A059] text-white font-bold shadow-md' 
                                : 'text-slate-400 hover:bg-white/10 hover:text-white font-medium'
                            }`}
                          >
                            <SubIcon size={16} className={isSubActive ? 'text-white' : 'text-slate-500'} />
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Render Standalone Items
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