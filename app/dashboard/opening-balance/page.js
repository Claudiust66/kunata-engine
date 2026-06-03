'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wrench, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

function PlaceholderContent({ title }) {
  const searchParams = useSearchParams();
  const entity = searchParams ? searchParams.get('entity') : null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="text-[#002D72]" />
            {title}
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            {entity ? `Workspace: ${entity}` : 'Global Configuration'}
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* BODY */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-16 text-center shadow-sm">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <LayoutDashboard size={32} className="text-[#002D72]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Module In Development</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          The UI shell for this section is active and securely routed. We are currently awaiting the specific financial data models, mathematical formulas, and business requirements to finalize the engine.
        </p>
        <div className="inline-block bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Status: Pending Business Logic
        </div>
      </div>

    </div>
  );
}

export default function PlaceholderPage() {
  // 👉 EDIT THIS TITLE TO MATCH THE FOLDER 👈
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-[#002D72] animate-pulse">Loading Workspace...</div>}>
      <PlaceholderContent title="opening-balance" /> 
    </Suspense>
  );
}