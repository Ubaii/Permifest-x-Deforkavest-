'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Menu, X, Shield, Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { currentUser } = useAppStore();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              {title && <h1 className="text-base sm:text-lg font-bold text-slate-100">{title}</h1>}
              {subtitle && <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Status RBAC:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                {ROLE_LABELS[currentUser.role]} Mode
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 cyber-dots">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
