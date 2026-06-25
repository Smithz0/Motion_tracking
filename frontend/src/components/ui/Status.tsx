import React from 'react';
import { Loader2 } from 'lucide-react';

// ==========================================
// 1. Progress Ring (Circular SVG)
// ==========================================
interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 60,
  strokeWidth = 5,
  color = 'stroke-gold-500',
  trackColor = 'stroke-charcoal-200 dark:stroke-charcoal-800',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track circle */}
        <circle
          className={`${trackColor} transition-all`}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Fill circle */}
        <circle
          className={`${color} transition-all duration-300 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-3xs font-bold text-chosen-text-primary">{Math.round(progress)}%</span>
    </div>
  );
};

// ==========================================
// 2. Progress Bar (Linear)
// ==========================================
interface ProgressBarProps {
  progress: number;
  height?: string;
  color?: string;
  trackColor?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'h-2',
  color = 'bg-gold-500',
  trackColor = 'bg-charcoal-200 dark:bg-charcoal-800',
  className = '',
}) => {
  const roundedProgress = Math.min(100, Math.max(0, progress));
  return (
    <div className={`w-full ${trackColor} rounded-full overflow-hidden shrink-0 ${height} ${className}`}>
      <div
        className={`${color} h-full rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${roundedProgress}%` }}
      />
    </div>
  );
};

// ==========================================
// 3. Pill Status
// ==========================================
interface PillStatusProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const PillStatus: React.FC<PillStatusProps> = ({
  label,
  variant = 'neutral',
  className = '',
}) => {
  const dotColors = {
    success: 'bg-success animate-pulse',
    warning: 'bg-warning animate-pulse',
    error: 'bg-error animate-pulse',
    info: 'bg-info animate-pulse',
    neutral: 'bg-charcoal-400 dark:bg-charcoal-500',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-chosen-surface border border-chosen rounded-full text-xs font-semibold text-chosen-text-primary shadow-chosen-sm ${className}`}>
      <span className={`h-2 w-2 rounded-full inline-block shrink-0 ${dotColors[variant]}`} />
      <span>{label}</span>
    </div>
  );
};

// ==========================================
// 4. Avatar
// ==========================================
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Patient',
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base font-bold',
  };

  const getInitials = (n: string) => {
    const parts = n.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`
      relative rounded-full flex items-center justify-center shrink-0 overflow-hidden select-none
      bg-gold-500/10 text-gold-500 font-bold border border-gold-500/20
      ${sizes[size]}
      ${className}
    `}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

// ==========================================
// 5. Skeleton Loader (Shimmer element)
// ==========================================
interface SkeletonLoaderProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
}) => {
  const shapeClass = {
    text: 'rounded-chosen-sm h-3.5 w-3/4',
    rect: 'rounded-chosen-md',
    circle: 'rounded-full',
  }[variant];

  const customStyle: React.CSSProperties = {};
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  return (
    <div
      className={`
        bg-charcoal-200/60 dark:bg-charcoal-800/60 animate-pulse-slow
        ${shapeClass}
        ${className}
      `}
      style={customStyle}
    />
  );
};

// ==========================================
// 6. Spinner
// ==========================================
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8 text-gold-500',
    lg: 'h-12 w-12 text-gold-500',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizes[size]}`} />
    </div>
  );
};
