import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, Menu, X, User as UserIcon, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                OMEGA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                L1 MVP
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium leading-none">
              AI Job & Interview Coach
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard') ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/analyze"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/analyze') ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                New Match Analysis
              </Link>
            </>
          ) : null}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium max-w-[140px] truncate">{user?.full_name || user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} icon={<LogOut className="w-3.5 h-3.5" />}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200 hover:text-indigo-400"
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-200 hover:text-indigo-400"
              >
                Dashboard
              </Link>
              <Link
                to="/analyze"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-200 hover:text-indigo-400"
              >
                New Match Analysis
              </Link>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 truncate max-w-[180px]">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
