'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  Building2, Landmark, LayoutDashboard, LogOut, Users, Receipt, 
  Monitor, Banknote, Calculator, Settings, Store, LineChart, 
  ChevronDown, ChevronRight, Wallet, Briefcase, Shield, Umbrella, 
  Factory, BedDouble, Layers, FileText, DollarSign, RefreshCcw, Scale, ArrowRightLeft, ShieldAlert 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; 

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [openMenus, setOpenMenus] = useState({
    'Revenue & Direct Costs': false, 
    'Core Financials': false,
    'Financial Statements': true     
  });

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

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

  const navItems = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    
    // --- SECTION 1: DATA ENTRY ---
    { isHeader: true, name: 'Data Entry (Inputs)' },
    { name: 'Step 1: Entity Config', href: '/dashboard/entity', icon: Building2 }, 
    { 
      name: 'Revenue & Direct Costs', 
      icon: Wallet,
      subItems: [
        { name: 'Banking Sector', href: '/dashboard/banking', icon: Landmark },
        { name: 'Insurance Sector', href: '/dashboard/insurance', icon: Shield },
        { name: 'Reinsurance', href: '/dashboard/reinsurance', icon: Umbrella },
        { name: 'Hotel & Hospitality', href: '/dashboard/hotel', icon: BedDouble },
        { name: 'Manufacturing', href: '/dashboard/manufacturing', icon: Factory },
        { name: 'Retail Sector', href: '/dashboard/retail', icon: Store },
        { name: 'Services Sector', href: '/dashboard/services', icon: Users }, 
        { name: 'Hybrid Sector', href: '/dashboard/hybrid', icon: Layers }, 
      ]
    },
    {
      name: 'Core Financials',
      icon: Briefcase,
      subItems: [
        { name: 'Payroll Costs', href: '/dashboard/payroll', icon: Users },
        { name: 'General Expenses', href: '/dashboard/expenses', icon: Receipt },
        { name: 'Fixed Assets', href: '/dashboard/assets', icon: Monitor },
        { name: 'Capital Structure', href: '/dashboard/capital-structure', icon: Landmark }, 
        { name: 'Working Capital', href: '/dashboard/working-capital', icon: RefreshCcw },
        { name: 'Capital & Finance', href: '/dashboard/capital', icon: Banknote },
        { name: 'Tax & Valuation', href: '/dashboard/tax-wacc', icon: Calculator },
      ]
    },

    // --- SECTION 2: DASHBOARDS ---
    { isHeader: true, name: 'Executive Dashboards (Outputs)' },
    { name: 'Valuation Engine', href: '/dashboard/valuation', icon: LineChart },
    { name: 'Credit & Risk Ratings', href: '/dashboard/risk', icon: ShieldAlert }, 
    {
      name: 'Financial Statements',
      icon: FileText,
      subItems: [
        { name: 'Income Statement', href: '/dashboard/income-statement', icon: DollarSign },
        { name: 'Balance Sheet', href: '/dashboard/balance-sheet', icon: Scale },
        { name: 'Cash Flow Statement', href: '/dashboard/cash-flow', icon: ArrowRightLeft },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* LEFT SIDEBAR - Maintained w-64 but tightened internals */}
      <aside className="w-64 bg-[#002D72] text-white flex flex-col shadow-xl z-10 hidden md:flex">
        
        {/* CFO Mode: Tighter header padding and slightly smaller brand text */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-[#C5A059] tracking-wide">Kunata</h2>
          <p className="text-[10px] text-slate-300 mt-0.5 uppercase tracking-wider font-semibold">Engine UI</p>
        </div>
        
        {/* CFO Mode: Reduced space between items (space-y-0.5) */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            
            if (item.isHeader) {
              return (
                // CFO Mode: Tighter header spacing
                <div key={`header-${index}`} className="px-3 pt-5 pb-1.5">
                  <p className="text-[9px] font-black text-blue-300/80 uppercase tracking-widest">{item.name}</p>
                </div>
              );
            }

            const Icon = item.icon;
            
            if (item.subItems) {
              const isOpen = openMenus[item.name];
              const isChildActive = item.subItems.some(sub => pathname === sub.href);

              return (
                <div key={item.name} className="space-y-0.5 mb-1.5">
                  <button 
                    onClick={() => toggleMenu(item.name)}
                    // CFO Mode: Reduced padding (py-2), text size (text-sm), and icon size (18)
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isChildActive && !isOpen ? 'bg-white/5 text-white font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} className={isChildActive ? 'text-white' : 'text-slate-400'} />
                      {item.name}
                    </div>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  {isOpen && (
                    <div className="pl-9 pr-2 py-0.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.subItems.map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link 
                            key={sub.name}
                            href={sub.href}
                            // CFO Mode: Text size down to text-xs, very tight padding
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                              isSubActive 
                                ? 'bg-[#C5A059] text-white font-bold shadow-md' 
                                : 'text-slate-400 hover:bg-white/10 hover:text-white font-medium'
                            }`}
                          >
                            <SubIcon size={14} className={isSubActive ? 'text-white' : 'text-slate-500'} />
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href; 
            return (
              <Link 
                key={item.name} 
                href={item.href}
                // CFO Mode: Match the parent link sizing
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                  isActive 
                    ? 'bg-[#C5A059] text-white font-bold shadow-md' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM USER ACTIONS */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link 
            href="/dashboard/settings"
            className={`flex items-center gap-2.5 px-3 py-2 w-full rounded-lg transition-colors text-sm font-medium ${
              pathname === '/dashboard/settings' 
                ? 'bg-[#C5A059] text-white font-bold' 
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings size={18} className={pathname === '/dashboard/settings' ? 'text-white' : ''} />
            Settings
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors font-medium"
          >
            <LogOut size={18} />
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