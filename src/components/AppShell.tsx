'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import FloatingChat from './FloatingChat';
import { Menu, Zap } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:ml-64 min-h-screen overflow-auto" style={{ color: 'var(--text-primary)' }}>
        {/* Mobile top bar — hidden on desktop */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 lg:hidden"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>StratIA</span>
          </div>
        </div>

        {children}
      </main>

      {/* Global floating chat assistant — visible on all pages */}
      <FloatingChat />
    </div>
  );
}
