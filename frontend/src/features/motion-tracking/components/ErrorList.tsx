import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';

interface SessionError {
  type: string;
  severity: string;
  timestamp_ms: number;
  description: string;
}

interface ErrorListProps {
  errors: SessionError[];
}

export const ErrorList: React.FC<ErrorListProps> = ({ errors }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-error-light text-error border-error/20';
      case 'medium':
        return 'bg-warning-light text-warning-dark border-warning/20';
      case 'low':
      default:
        return 'bg-info-light text-info border-info/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <ShieldAlert className="h-5 w-5 text-error" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'low':
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'border-l-error';
      case 'medium':
        return 'border-l-warning';
      case 'low':
      default:
        return 'border-l-info';
    }
  };

  const formatTimestamp = (ms: number) => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const severityCounts = errors.reduce(
    (acc, e) => {
      const s = e.severity.toLowerCase();
      if (s === 'high') acc.high += 1;
      else if (s === 'medium') acc.medium += 1;
      else acc.low += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-chosen-lg bg-chosen-surface border border-chosen text-center gap-4">
        <div className="p-4 rounded-full bg-success-light border border-success/20">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold text-chosen-text-primary">Flawless Session</span>
          <span className="text-sm text-chosen-text-secondary max-w-xs">
            No deviations or form errors were detected in your movement.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col gap-3 px-1">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">
            Detected Form Corrections
          </h4>
          <span className="text-xs text-chosen-text-primary font-mono bg-chosen-surface px-2.5 py-1 rounded-chosen-sm border border-chosen">
            {errors.length} {errors.length === 1 ? 'Alert' : 'Alerts'}
          </span>
        </div>

        {/* Severity summary chips */}
        <div className="flex flex-wrap gap-2">
          {severityCounts.high > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-chosen-sm bg-error-light text-error border border-error/20">
              {severityCounts.high} High
            </span>
          )}
          {severityCounts.medium > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-chosen-sm bg-warning-light text-warning-dark border border-warning/20">
              {severityCounts.medium} Medium
            </span>
          )}
          {severityCounts.low > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-chosen-sm bg-info-light text-info border border-info/20">
              {severityCounts.low} Low
            </span>
          )}
        </div>
      </div>

      {/* Alert cards — scroll handled by parent panel */}
      <div className="flex flex-col gap-3">
        {errors.map((error) => (
          <div
            key={`${error.type}-${error.timestamp_ms}-${error.description.slice(0, 20)}`}
            className={`flex items-start gap-4 p-4 rounded-chosen-lg bg-chosen-surface border border-chosen border-l-[3px] ${getSeverityBorder(error.severity)} hover:bg-chosen-bg/50 hover:border-chosen-border-hover transition-colors`}
          >
            <div className="mt-0.5 flex-shrink-0 p-2 rounded-chosen-md bg-chosen-bg">
              {getSeverityIcon(error.severity)}
            </div>

            <div className="flex-1 flex flex-col text-left min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-chosen-text-primary">{error.type}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-chosen-text-secondary bg-chosen-bg px-2 py-0.5 rounded-chosen-sm border border-chosen/50">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(error.timestamp_ms)}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(error.severity)}`}
                  >
                    {error.severity}
                  </span>
                </div>
              </div>
              <p className="text-xs text-chosen-text-secondary mt-2 leading-relaxed">
                {error.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
