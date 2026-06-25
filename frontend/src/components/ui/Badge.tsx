import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  styleType?: 'soft' | 'solid' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  styleType = 'soft',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider select-none shrink-0';

  // Combinations of variations and styles mapped exactly to Figma CSS properties
  const styles = {
    soft: {
      success: 'bg-[#ecfdf5] dark:bg-emerald-950/20 text-[#4F995E] dark:text-emerald-450',
      warning: 'bg-[#F2F0EA] dark:bg-yellow-950/20 text-[#A27B41] dark:text-[#CDB07C]', // Warning uses warm gold tone #A27B41 in Figma
      error: 'bg-[#F5E6E6] dark:bg-red-950/20 text-[#D15858] dark:text-red-450',
      info: 'bg-[#eff6ff] dark:bg-blue-950/20 text-indigo-500 dark:text-indigo-400',
      neutral: 'bg-[#F5F5F5] dark:bg-charcoal-800 text-[#525252] dark:text-[#A3A3A3]',
    },
    solid: {
      success: 'bg-[#4F995E] text-white',
      warning: 'bg-[#A27B41] text-white',
      error: 'bg-[#D15858] text-white',
      info: 'bg-indigo-650 text-white',
      neutral: 'bg-charcoal-700 dark:bg-charcoal-300 text-white dark:text-charcoal-900',
    },
    outline: {
      success: 'border border-[#4F995E] text-[#4F995E] bg-transparent',
      warning: 'border border-[#A27B41] text-[#A27B41] bg-transparent',
      error: 'border border-[#D15858] text-[#D15858] bg-transparent',
      info: 'border border-indigo-500 text-indigo-500 bg-transparent',
      neutral: 'border border-[#E5E5E5] text-[#525252] bg-transparent',
    },
  };

  return (
    <span className={`${baseClasses} ${styles[styleType][variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
