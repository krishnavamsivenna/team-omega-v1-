import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  PlusCircle,
  LayoutDashboard,
  Briefcase,
  Bell,
  Sun,
  Moon,
  CheckCheck,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0d1114]/85 backdrop-blur-xl transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-teal-950 to-teal-700 dark:from-white dark:via-slate-100 dark:to-teal-200 bg-clip-text text-transparent">
                OMEGA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                v3.0
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
              Career Intelligence Engine
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg transition-all ${
              isActive('/')
                ? 'bg-slate-100 dark:bg-white/[0.08] text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
            }`}
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                to="/analyze"
                className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/analyze')
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Match Analysis
              </Link>
              <Link
                to="/jobs"
                className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/jobs')
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Jobs Board
              </Link>
              <Link
                to="/interview"
                className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/interview')
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-xs">🎙️</span>
                Mock Interview
              </Link>
              <Link
                to="/roadmap"
                className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/roadmap')
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Roadmaps
              </Link>
            </>
          ) : null}
        </nav>

        {/* Desktop Controls & Profile */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#13171a] text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 hover:border-teal-500/40 transition-all cursor-pointer shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* In-app Notification Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
              className="p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#13171a] text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 hover:border-teal-500/40 transition-all relative cursor-pointer shadow-xs"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white/95 dark:bg-[#13171a]/95 shadow-2xl backdrop-blur-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Activity Feed</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) {
                            navigate(n.link);
                            setIsNotificationsOpen(false);
                          }
                        }}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors ${
                          !n.read ? 'bg-teal-50/50 dark:bg-teal-950/25' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold ${!n.read ? 'text-teal-600 dark:text-teal-300' : 'text-slate-800 dark:text-slate-200'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-300">
                <UserIcon className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                <span className="font-medium max-w-[140px] truncate">{user?.full_name || user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} icon={<LogOut className="w-3.5 h-3.5" />}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-400"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0d1114]/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-teal-600 dark:hover:text-teal-400"
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-teal-600 dark:hover:text-teal-400"
              >
                Dashboard
              </Link>
              <Link
                to="/analyze"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-teal-600 dark:hover:text-teal-400"
              >
                Match Analysis
              </Link>
              <Link
                to="/jobs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-teal-600 dark:hover:text-teal-400"
              >
                💼 Jobs Board
              </Link>
              <Link
                to="/interview"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-teal-600 dark:hover:text-teal-400"
              >
                🎙️ Mock Interview
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-teal-600 dark:hover:text-teal-400"
              >
                🧭 Learning Roadmaps
              </Link>
              <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-2">
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
