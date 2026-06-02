'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, LayoutDashboard, Database, LogOut, User, Key, Settings, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

// We separate the links into their own component so Next.js can safely read the URL parameters
function NavigationLinks() {
  const searchParams = useSearchParams();
  const companyId = searchParams ? searchParams.get('companyId') : null;

  return (
    <div className="flex items-center gap-2 md:gap-6">
      <Link 
        href="/" 
        className="flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-blue-800/50"
      >
        <Building2 size={18} /> 
        <span className="hidden sm:inline">Portfolio</span>
      </Link>
      
      <Link 
        href={companyId ? `/dashboard?companyId=${companyId}` : '#'} 
        className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg transition-colors ${
          companyId 
            ? 'text-blue-100 hover:text-white hover:bg-blue-800/50' 
            : 'text-blue-900/50 cursor-not-allowed pointer-events-none'
        }`}
      >
        <LayoutDashboard size={18} /> 
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      <Link 
        href={companyId ? `/admin?companyId=${companyId}` : '#'} 
        className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg transition-colors ${
          companyId 
            ? 'text-blue-100 hover:text-white hover:bg-blue-800/50' 
            : 'text-blue-900/50 cursor-not-allowed pointer-events-none'
        }`}
      >
        <Database size={18} /> 
        <span className="hidden sm:inline">Data Entry</span>
      </Link>
    </div>
  );
}

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Add these state variables if you don't have them yet
  const [profileName, setProfileName] = useState('User');
  const [profileTitle, setProfileTitle] = useState('Analyst');

  // The function that talks to Supabase to get the latest profile
  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('full_name, job_title')
          .eq('id', user.id)
          .single();

        if (data) {
          if (data.full_name) setProfileName(data.full_name);
          if (data.job_title) setProfileTitle(data.job_title);
        } else {
          // Fallback to email if no profile exists yet
          setProfileName(user.email.split('@')[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching user for Navbar:', err);
    }
  };
  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // EXISTING CODE: Close the dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // NEW CODE: Fetch data on load and listen for updates from the Settings page!
  useEffect(() => {
    // 1. Fetch data immediately when the Navbar first loads
    fetchUserData();

    // 2. Define what to do when we hear the "shout" from the Settings page
    const handleProfileUpdate = () => {
      fetchUserData(); 
    };

    // 3. Start listening
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // 4. Stop listening if the component ever unmounts (cleanup)
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    // End the Supabase session
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      // Redirect to the login page securely
      window.location.href = '/login'; 
    } else {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <nav className="bg-[#002D72] text-white py-4 px-4 md:px-8 shadow-md font-sans print:hidden border-b border-[#001A44]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO AREA */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="bg-[#C5A059] p-2 rounded-lg shadow-lg">
            <Building2 size={24} className="text-[#002D72]" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight block leading-none">KUNATA</span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-bold block mt-1">Valuation Engine</span>
          </div>
        </Link>

        {/* DYNAMIC NAVIGATION LINKS */}
        <Suspense fallback={<div className="text-blue-300 text-sm font-bold animate-pulse">Loading menu...</div>}>
          <NavigationLinks />
        </Suspense>

        {/* USER PROFILE AREA WITH DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-blue-800/50 p-2 rounded-xl transition-all"
          >
            <div className="text-right hidden md:block">
              {/* CHANGE 1: Swapped hardcoded name for {profileName} */}
              <p className="text-xs font-bold text-blue-100">{profileName}</p>
              {/* CHANGE 2: Swapped hardcoded title for {profileTitle} */}
              <p className="text-[10px] text-blue-300 uppercase font-semibold tracking-wider">{profileTitle}</p>
            </div>
            <div className="bg-blue-800/60 p-2 rounded-full text-blue-200">
              <User size={18} />
            </div>
            <ChevronDown 
              size={14} 
              className={`text-blue-300 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* DROPDOWN MENU */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 text-left">
              
              {/* Header Section */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                {/* CHANGE 3: Update the dropdown header as well! */}
                <p className="text-sm font-bold text-slate-800">{profileName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{profileTitle}</p>
              </div>
              
              {/* Action Links */}
              {/* ... the rest of your dropdown code stays exactly the same ... */}
              
              {/* Action Links */}
              <div className="p-2">
                <Link 
                  href="/profile" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#002D72] rounded-lg transition-colors"
                >
                  <Settings size={16} className="text-slate-400" /> 
                  Edit Profile
                </Link>
                <Link 
                  href="/security" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#002D72] rounded-lg transition-colors"
                >
                  <Key size={16} className="text-slate-400" /> 
                  Change Password
                </Link>
              </div>
              
              {/* Logout Section */}
              <div className="border-t border-slate-100 p-2">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> 
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}