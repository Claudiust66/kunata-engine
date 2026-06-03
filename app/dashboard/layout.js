'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  Building2, Landmark, LayoutDashboard, LogOut, Users, Receipt, 
  Monitor, Calculator, Settings, Store, LineChart, 
  ChevronDown, ChevronRight, Wallet, Briefcase, Shield, Umbrella, 
  Factory, BedDouble, Layers, FileText, DollarSign, Scale, ArrowRightLeft, ShieldAlert, Activity, Percent, TrendingUp, Database
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; 

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Smart Accordion State
  const [openMenus, setOpenMenus] = useState({
    'Outputs': true, // Open by default because "Outputs sell the thing"
    'Inputs': false,
    '2. Detailed Financials': true,     
    '3. Revenue & Direct Costs': false, 
  });

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => {
      const newState = { ...prev };
      
      // Mutually exclusive toggle for the main parent categories
      if (menuName === 'Outputs') {
        newState.Outputs = !prev.Outputs;
        if (newState.Outputs) newState.Inputs = false; 
      } else if (menuName === 'Inputs') {
        newState.Inputs = !prev.Inputs;
        if (newState.Inputs) newState.Outputs = false; 
      } else {
        // Standard toggle for sub-menus
        newState[menuName] = !prev[menuName];
      }
      
      return newState;
    });
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

  // Nested Navigation Structure based on user's exact flow
  const navItems = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    
    // --- MAIN CATEGORY: OUTPUTS ---
    {
      name: 'Outputs',
      icon: TrendingUp,
      subItems: [
        { name: '1. Summary Financials', href: '/dashboard/summary', icon: Activity },
        {
          name: '2. Detailed Financials',
          icon: FileText,
          subItems: [
            { name: 'Income Statement', href: '/dashboard/income-statement', icon: DollarSign },
            { name: 'Balance Sheet', href: '/dashboard/balance-sheet', icon: Scale },
            { name: 'Cash Flow Statement', href: '/dashboard/cash-flow', icon: ArrowRightLeft },
          ]
        },
        { name: '3. Cost of Capital', href: '/dashboard/cost-of-capital', icon: Landmark },
        { name: '4. Ratings', href: '/dashboard/risk', icon: ShieldAlert },
        { name: '5. Valuations', href: '/dashboard/valuation', icon: LineChart },
        { name: '6. Financial Ratios', href: '/dashboard/ratios', icon: Percent },
      ]
    },

    // --- MAIN CATEGORY: INPUTS ---
    {
      name: 'Inputs',
      icon: Database,
      subItems: [
        { name: '1. Entity Config', href: '/dashboard/entity', icon: Building2 }, 
        { name: '2. Opening Balance Sheet', href: '/dashboard/opening-balance', icon: FileText }, 
        { 
          name: '3. Revenue & Direct Costs', 
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
        { name: '4. Payroll', href: '/dashboard/payroll', icon: Users },
        { name: '5. Expenses', href: '/dashboard/expenses', icon: Receipt },
        { name: '6. Fixed Assets', href: '/dashboard/assets', icon: Monitor },
        { name: '7. Capital Structure & CoC', href: '/dashboard/capital-structure', icon: Landmark }, 
        { name: '8. Misc Assumptions', href: '/dashboard/misc-assumptions', icon: Settings },
        { name: '9. Corporation Tax', href: '/dashboard/tax-wacc', icon: Calculator },
        { name: '10. Other Financial Input', href: '/dashboard/other-inputs', icon: Briefcase },
        { name: '11. Ratings Input', href: '/dashboard/ratings-input', icon: Shield },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#002D72] text-white flex flex-col shadow-xl z-10 hidden md:flex">
        
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-[#C5A059] tracking-wide">Kunata</h2>
          <p className="text-[10px] text-slate-300 mt-0.5 uppercase tracking-wider font-semibold">Engine UI</p>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // --- RENDER LEVEL 1 (Top Level Expandable Categories) ---
            if (item.subItems) {
              const isParentOpen = openMenus[item.name];
              const isChildActive = item.subItems.some(sub => 
                pathname === sub.href || (sub.subItems && sub.subItems.some(child => pathname === child.href))
              );

              return (
                <div key={item.name} className="space-y-0.5 mb-2">
                  <button 
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      (isChildActive || isParentOpen) ? 'bg-white/10 text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} className={(isChildActive || isParentOpen) ? 'text-white' : 'text-slate-400'} />
                      <span className="tracking-wide uppercase text-[11px] font-black">{item.name}</span>
                    </div>
                    {isParentOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {/* --- RENDER LEVEL 2 (Numbered lists inside Inputs/Outputs) --- */}
                  {isParentOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200 border-l border-white/10 ml-5 mt-1 mb-3">
                      {item.subItems.map(sub => {
                        const SubIcon = sub.icon;

                        // --- RENDER LEVEL 2 Expandable (Detailed Financials / Revenue) ---
                        if (sub.subItems) {
                          const isSubOpen = openMenus[sub.name];
                          const isDeepChildActive = sub.subItems.some(child => pathname === child.href);

                          return (
                            <div key={sub.name} className="space-y-0.5 mb-1">
                              <button 
                                onClick={() => toggleMenu(sub.name)}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 text-[13px] ${
                                  isDeepChildActive && !isSubOpen ? 'bg-white/5 text-[#C5A059] font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <SubIcon size={16} className={isDeepChildActive ? 'text-[#C5A059]' : 'text-slate-400'} />
                                  <span className="truncate">{sub.name}</span>
                                </div>
                                {isSubOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>

                              {/* --- RENDER LEVEL 3 (Deep Links) --- */}
                              {isSubOpen && (
                                <div className="pl-8 pr-1 py-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                  {sub.subItems.map(child => {
                                    const ChildIcon = child.icon;
                                    const isDeepActive = pathname === child.href;
                                    return (
                                      <Link 
                                        key={child.name}
                                        href={child.href}
                                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                                          isDeepActive 
                                            ? 'bg-[#C5A059] text-white font-bold shadow-md' 
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
                                        }`}
                                      >
                                        <ChildIcon size={14} className={isDeepActive ? 'text-white' : 'text-slate-500'} />
                                        <span className="truncate">{child.name}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // --- RENDER LEVEL 2 Standard Links ---
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link 
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-[13px] ${
                              isSubActive 
                                ? 'bg-[#C5A059] text-white font-bold shadow-md' 
                                : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                            }`}
                          >
                            <SubIcon size={16} className={isSubActive ? 'text-white' : 'text-slate-400'} />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // --- RENDER TOP-LEVEL STANDALONE (Dashboard Overview) ---
            const isActive = pathname === item.href; 
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm mb-2 ${
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