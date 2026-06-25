import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isFab?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFab = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes with Apple-inspired details
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 dark:focus:ring-offset-charcoal-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40';
  
  // Style variant definitions mapped exactly to Figma specifications
  const variants = {
    // Primary is dark black/charcoal in Figma (#141414)
    primary: 'bg-[#141414] hover:bg-[#272727] dark:bg-white text-white dark:text-[#141414] shadow-chosen-sm focus:ring-[#141414]',
    // Secondary is light gray (#F5F5F5) in Figma
    secondary: 'bg-[#F5F5F5] hover:bg-[#E6E6E6] dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-[#0D0C18] dark:text-white',
    // Outline is border-gray (#E5E5E5)
    outline: 'border border-[#E5E5E5] hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 text-[#525252] dark:text-white bg-white dark:bg-transparent',
    ghost: 'bg-transparent hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 text-[#525252] dark:text-white',
    // Danger is soft pastel red backdrop (#F5E6E6) with red text (#D15858)
    danger: 'bg-[#F5E6E6] hover:bg-[#F5DBDB] text-[#D15858] focus:ring-[#D15858]',
    // Success is soft pastel green
    success: 'bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#4F995E] focus:ring-[#4F995E]',
  };

  // Sizes using the Figma 8px border radius layout standard (rounded-chosen-md)
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-chosen-sm gap-1',
    sm: 'px-3.5 py-2 text-xs rounded-chosen-md gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-chosen-md gap-2',
    lg: 'px-6 py-3.5 text-base rounded-chosen-lg gap-2.5',
  };

  const shapeClasses = isFab 
    ? 'rounded-full p-4 aspect-square shadow-chosen-floating flex items-center justify-center shrink-0' 
    : sizes[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${shapeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : (
        <>
          {leftIcon && <span className="flex items-center justify-center shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex items-center justify-center shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
