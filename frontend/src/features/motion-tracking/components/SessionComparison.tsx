import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCompare {
  current: number;
  previous: number;
  delta: number;
}

interface SessionComparisonProps {
  comparison: {
    current_session_id: number;
    previous_session_id: number | null;
    rom: MetricCompare;
    speed: MetricCompare;
    symmetry: MetricCompare;
    accuracy: MetricCompare;
    smoothness: MetricCompare;
    repetitions: MetricCompare;
  };
}

export const SessionComparison: React.FC<SessionComparisonProps> = ({ comparison }) => {
  const { previous_session_id, rom, speed, symmetry, accuracy, smoothness, repetitions } = comparison;

  if (!previous_session_id) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-chosen-lg bg-chosen-surface border border-chosen text-center gap-3">
        <TrendingUp className="h-10 w-10 text-gold-500 animate-pulse" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-chosen-text-primary">First Session Recorded</span>
          <span className="text-xs text-chosen-text-secondary mt-1">Comparison metrics will populate once you record your next session of this exercise.</span>
        </div>
      </div>
    );
  }

  // Helper to render delta row
  const renderMetricRow = (
    label: string,
    data: MetricCompare,
    higherIsBetter = true,
    unit = ''
  ) => {
    const isImproved = higherIsBetter ? data.delta > 0 : data.delta < 0;
    const isNoChange = data.delta === 0;

    const getDeltaColor = () => {
      if (isNoChange) return 'text-chosen-text-muted bg-chosen-bg border border-chosen';
      return isImproved 
        ? 'text-success bg-success-light border border-success/20' 
        : 'text-error bg-error-light border border-error/20';
    };

    const getDeltaIcon = () => {
      if (isNoChange) return <Minus className="h-3 w-3" />;
      return isImproved 
        ? <ArrowUpRight className="h-3 w-3" /> 
        : <ArrowDownRight className="h-3 w-3" />;
    };

    const formatVal = (val: number) => {
      return Number.isInteger(val) ? val.toString() : val.toFixed(1);
    };

    return (
      <div className="grid grid-cols-4 items-center py-3.5 border-b border-chosen last:border-b-0 hover:bg-chosen-bg/50 px-2 rounded-chosen-sm transition-all">
        {/* Metric Name */}
        <span className="text-xs font-bold text-chosen-text-secondary text-left">{label}</span>

        {/* Previous Session */}
        <span className="text-xs font-mono text-chosen-text-muted">{formatVal(data.previous)}{unit}</span>

        {/* Current Session */}
        <span className="text-xs font-mono text-chosen-text-primary font-bold">{formatVal(data.current)}{unit}</span>

        {/* Comparison Delta */}
        <div className="flex justify-end">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-chosen-sm text-xs font-mono font-bold ${getDeltaColor()}`}>
            {getDeltaIcon()}
            {data.delta > 0 ? '+' : ''}{formatVal(data.delta)}{unit}
          </span>
        </div>
      </div>
    );
  };

  // Determine overall session progress
  const positiveDeltasCount = [rom, accuracy, smoothness, repetitions]
    .filter(m => m.delta > 0).length;

  const isOverallImprovement = positiveDeltasCount >= 2;

  return (
    <div className="flex flex-col gap-4 w-full bg-chosen-surface border border-chosen p-5 rounded-chosen-lg shadow-chosen-sm">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-chosen pb-4 text-left">
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">Progress Comparison</h4>
          <p className="text-xs text-chosen-text-secondary">Comparing current session against your last attempt</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-chosen-md border text-xs font-bold ${
          isOverallImprovement 
            ? 'bg-success-light text-success border-success/20' 
            : 'bg-error-light text-error border-error/20'
        }`}>
          {isOverallImprovement ? (
            <>
              <TrendingUp className="h-4 w-4" />
              <span>Overall Improvement</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4" />
              <span>Regression Detected</span>
            </>
          )}
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-4 text-chosen-text-muted text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 border-b border-chosen">
        <span className="text-left">Metric</span>
        <span className="text-left">Previous</span>
        <span className="text-left">Current</span>
        <span className="text-right">Delta</span>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {renderMetricRow('Range of Motion', rom, true, '°')}
        {renderMetricRow('Form Accuracy', accuracy, true, '%')}
        {renderMetricRow('Movement Smoothness', smoothness, true, '%')}
        {renderMetricRow('Repetitions Completed', repetitions, true, '')}
        {renderMetricRow('Average Speed', speed, false, '°/s')}
        {renderMetricRow('Bilateral Symmetry', symmetry, true, '%')}
      </div>
      
    </div>
  );
};
