import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 font-semibold',
    md: 'px-4 py-2 text-sm gap-2 font-semibold',
    lg: 'px-6 py-3 text-sm sm:text-base gap-2.5 font-semibold shadow-lg',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold shadow-teal-500/25 shadow-lg focus:ring-teal-400 border border-teal-300/30 hover:shadow-teal-500/40 hover:-translate-y-0.5',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-900 dark:text-white border border-slate-300 dark:border-white/[0.12] focus:ring-teal-500 shadow-sm hover:-translate-y-0.5',
    outline: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/[0.12] hover:border-teal-500/40 dark:hover:border-teal-400/40 focus:ring-teal-400',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-teal-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25 shadow-lg focus:ring-rose-500 border border-rose-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
};
