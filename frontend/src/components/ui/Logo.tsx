import React from 'react';
import { cn } from '@/components/layout/LayoutComponents';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md'
}) => {
  const sizes = {
    xs: 'h-5',
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12'
  };

  const selectedHeight = sizes[size] || sizes.md;

  return (
    <div className={cn("flex items-center select-none", className)}>
      <img
        src="/logo.png"
        alt="Chosen Life"
        className={cn(selectedHeight, "w-auto object-contain")}
      />
    </div>
  );
};
