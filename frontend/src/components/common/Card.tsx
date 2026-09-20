import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#13171a]/90 backdrop-blur-xl p-6 transition-all duration-300 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
        hoverEffect ? 'hover:border-slate-300 dark:hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-0.5' : ''
      } ${glow ? 'shadow-xl shadow-teal-500/10 border-teal-500/40 dark:border-teal-500/30' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
