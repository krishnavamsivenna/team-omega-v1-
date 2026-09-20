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
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5' : ''
      } ${glow ? 'shadow-lg shadow-indigo-500/10 border-indigo-500/30' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
