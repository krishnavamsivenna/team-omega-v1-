import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#0d1114] text-slate-900 dark:text-slate-100 todesktop-grid transition-colors duration-200 relative selection:bg-teal-400 selection:text-slate-950 overflow-x-hidden">
      {/* Dark Mode Luminous Grid Highlights */}
      <div className="hidden dark:block todesktop-grid-highlight" />
      <div className="hidden dark:block todesktop-grid-highlight-secondary" />

      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
