'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Landmark, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Ensure this matches your path!

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Your Master Navigation Menu
  const navItems = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Entity Config (DetE)', href: '/dashboard/entity', icon: Building2 },
    { name: 'Banking Sector (1BK)', href: '/dashboard/banking', icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#002D72] text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-[#C5A059] tracking-wide">Kunata</h2>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-semibold">Engine UI</p>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Check if the current URL matches the button's link so we can highlight it
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
        <div className="p-4 border-t border-white/10">
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
        {/* Next.js automatically injects your page.js files into this 'children' variable */}
        {children}
      </main>

    </div>
  );
}