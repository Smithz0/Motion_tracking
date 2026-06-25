import React from 'react';
import { Calendar, User, Dumbbell, Activity, ShieldCheck, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import Badge from './Badge';

// ==========================================
// Base Card Container
// ==========================================
interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<BaseCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-chosen-raised border border-chosen rounded-chosen-lg p-6
        transition-all duration-300 shadow-chosen-sm
        ${hoverable ? 'hover:shadow-chosen-md hover:border-gold-450 cursor-pointer hover:translate-y-[-2px]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ==========================================
// Glass Card
// ==========================================
export const GlassCard: React.FC<BaseCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/70 dark:bg-charcoal-800/70 backdrop-blur-md border border-white/20 dark:border-white/5
        transition-all duration-300 shadow-glass-light dark:shadow-glass-dark rounded-chosen-lg p-6
        ${hoverable ? 'hover:shadow-chosen-lg hover:scale-[1.01] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ==========================================
// Statistic Card
// ==========================================
interface StatisticCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number | string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  label,
  value,
  trend,
  icon,
  iconBg = 'bg-gold-500/10 text-gold-500',
  className = '',
}) => {
  return (
    <Card className={`flex items-center justify-between p-6 ${className}`}>
      <div className="space-y-2 text-left">
        <span className="text-2xs font-bold uppercase tracking-widest text-chosen-text-muted">{label}</span>
        <h3 className="font-display font-bold text-3xl text-chosen-text-primary">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1.5 mt-1 select-none">
            {trend.direction === 'up' && (
              <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> {trend.value}
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> {trend.value}
              </span>
            )}
            {trend.direction === 'neutral' && (
              <span className="text-[10px] text-chosen-text-muted font-semibold">
                {trend.value}
              </span>
            )}
            {trend.label && <span className="text-[10px] text-chosen-text-muted">{trend.label}</span>}
          </div>
        )}
      </div>
      {icon && (
        <div className={`p-3.5 rounded-chosen-md shrink-0 flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      )}
    </Card>
  );
};

// ==========================================
// Exercise Card
// ==========================================
interface ExerciseCardProps {
  name: string;
  thumbnailUrl?: string;
  targetRom?: number;
  description?: string;
  instructions?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  thumbnailUrl,
  targetRom = 120,
  description,
  instructions,
  actionButton,
  className = '',
}) => {
  const fallbackThumbnail = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300';
  return (
    <div className={`flex flex-col border border-chosen rounded-chosen-lg bg-chosen-raised overflow-hidden shadow-chosen-sm hover:shadow-chosen-md hover:border-gold-500/30 transition-all duration-300 ${className}`}>
      <div className="relative">
        <img
          src={thumbnailUrl || fallbackThumbnail}
          alt={name}
          className="h-36 w-full object-cover border-b border-chosen"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackThumbnail;
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge variant="info" styleType="solid">ROM: {targetRom}°</Badge>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 text-left">
        <div className="space-y-2">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-base leading-snug flex items-center gap-2">
            <Dumbbell className="h-4.5 w-4.5 text-gold-500 shrink-0" />
            {name}
          </h4>
          {description && <p className="text-xs text-chosen-text-secondary line-clamp-2">{description}</p>}
          {instructions && (
            <div className="text-[11px] bg-chosen-surface border border-chosen p-2.5 rounded-chosen-md text-chosen-text-secondary italic">
              "{instructions}"
            </div>
          )}
        </div>
        
        {actionButton && <div className="mt-2">{actionButton}</div>}
      </div>
    </div>
  );
};

// ==========================================
// Patient Card
// ==========================================
interface PatientCardProps {
  fullName: string;
  email?: string;
  phone?: string;
  diagnosis?: string;
  isArchived?: boolean;
  onProfileClick?: () => void;
  actionButton?: React.ReactNode;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  fullName,
  email,
  phone,
  diagnosis,
  isArchived = false,
  onProfileClick,
  actionButton,
  className = '',
}) => {
  return (
    <Card 
      onClick={onProfileClick} 
      hoverable={!!onProfileClick} 
      className={`p-5 flex flex-col justify-between gap-4 text-left ${className}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gold-500/10 text-gold-500 rounded-full flex items-center justify-center font-bold text-sm uppercase">
            {fullName?.[0] || 'P'}
          </div>
          <div>
            <span className="font-bold text-chosen-text-primary text-sm block">{fullName}</span>
            {email && <span className="text-[10px] text-chosen-text-muted block mt-0.5">{email}</span>}
          </div>
        </div>
        {isArchived ? (
          <Badge variant="neutral">Archived</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        )}
      </div>
      
      <div className="space-y-1 text-xs">
        <span className="text-[10px] font-bold text-chosen-text-muted uppercase tracking-wider block">Diagnosis</span>
        <p className="text-chosen-text-secondary line-clamp-2 font-medium">
          {diagnosis || 'No active rehabilitation plan prescribed.'}
        </p>
        {phone && <p className="text-[10px] text-chosen-text-muted font-mono pt-1">Phone: {phone}</p>}
      </div>

      {(actionButton || onProfileClick) && (
        <div className="flex justify-between items-center border-t border-chosen pt-3.5 mt-1">
          {onProfileClick ? (
            <button className="text-xs font-bold text-gold-600 hover:text-gold-500 flex items-center gap-1 transition-colors">
              <User className="h-3.5 w-3.5" /> View Profile <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : <div />}
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}
    </Card>
  );
};

// ==========================================
// Appointment Card
// ==========================================
interface AppointmentCardProps {
  title: string;
  dateString: string;
  timeString?: string;
  detail?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  title,
  dateString,
  timeString,
  detail,
  actionButton,
  className = '',
}) => {
  return (
    <Card className={`p-4 flex justify-between items-center gap-4 text-left ${className}`}>
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-chosen-md shrink-0 flex items-center justify-center">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h5 className="font-bold text-xs text-chosen-text-primary truncate">{title}</h5>
          <span className="text-[10px] text-chosen-text-muted font-semibold block mt-0.5">
            {dateString} {timeString ? `at ${timeString}` : ''}
          </span>
          {detail && <p className="text-[10px] text-chosen-text-secondary mt-1 truncate">{detail}</p>}
        </div>
      </div>
      {actionButton && <div className="shrink-0">{actionButton}</div>}
    </Card>
  );
};

// ==========================================
// Metric Card
// ==========================================
interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  status?: 'success' | 'warning' | 'idle';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  status = 'idle',
  className = '',
}) => {
  const statusColors = {
    success: 'border-l-4 border-l-success',
    warning: 'border-l-4 border-l-warning',
    idle: 'border-l-4 border-l-chosen-border',
  };
  return (
    <Card className={`p-4 flex items-center justify-between text-left ${statusColors[status]} ${className}`}>
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-chosen-text-muted uppercase tracking-wider block">{label}</span>
        <span className="font-display font-bold text-lg text-chosen-text-primary block">{value}</span>
      </div>
      {subValue && (
        <span className="text-[10px] font-mono font-bold text-chosen-text-muted bg-chosen-surface px-2 py-1 rounded-chosen-sm shrink-0">
          {subValue}
        </span>
      )}
    </Card>
  );
};

// ==========================================
// Analytics Chart Container Card
// ==========================================
interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  subtitle,
  headerActions,
  children,
  className = '',
}) => {
  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-chosen pb-4 text-left">
        <div>
          <h3 className="font-display font-bold text-lg text-chosen-text-primary flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold-500" />
            {title}
          </h3>
          {subtitle && <p className="text-xs text-chosen-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {headerActions && <div className="flex items-center gap-2 self-start sm:self-auto">{headerActions}</div>}
      </div>
      <div className="w-full">{children}</div>
    </Card>
  );
};

// ==========================================
// Empty Card (No records/logs state display)
// ==========================================
interface EmptyCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({
  title,
  description,
  icon,
  actionButton,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-6 border-2 border-dashed border-chosen rounded-chosen-lg bg-chosen-raised text-chosen-text-muted ${className}`}>
      {icon ? (
        <div className="mb-4 text-charcoal-350 dark:text-charcoal-600 flex justify-center">{icon}</div>
      ) : (
        <ShieldCheck className="h-10 w-10 mx-auto text-charcoal-300 dark:text-charcoal-700 mb-4" />
      )}
      <p className="font-bold text-sm text-chosen-text-primary">{title}</p>
      <p className="text-xs mt-1 text-chosen-text-secondary max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionButton && <div className="mt-5">{actionButton}</div>}
    </div>
  );
};

export default Card;
