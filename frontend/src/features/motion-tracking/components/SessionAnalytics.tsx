import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { generateSessionInsights, analyzeSquatSession, formatMs } from '../utils/sessionMetrics';

interface MotionFrame {
  timestamp_millis: number;
  joint_coordinates: Record<string, number[]>;
}

interface HistoricalSession {
  id: number;
  completed_at: string;
  score: number;
  duration_seconds: number;
  range_of_motion: number;
  speed: number;
  symmetry: number;
}

interface SessionAnalyticsProps {
  frames?: MotionFrame[];
  history?: HistoricalSession[];
  exerciseName?: string;
  errorCount?: number;
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({
  frames = [],
  history = [],
  exerciseName = 'Exercise',
  errorCount = 0
}) => {
  const activeJointKey = exerciseName.toLowerCase().includes('squat')
    ? 'squat'
    : exerciseName.toLowerCase().includes('shoulder')
      ? 'shoulder'
      : exerciseName.toLowerCase().includes('knee')
        ? 'knee'
        : 'elbow';

  const calculateAngleForJoint = (
    coords: Record<string, number[]>,
    joint: 'shoulder' | 'elbow' | 'hip' | 'knee',
    side: 'l' | 'r' = 'r'
  ) => {
    const calcAngle = (a: number[], b: number[], c: number[]) => {
      const baX = a[0] - b[0];
      const baY = a[1] - b[1];
      const bcX = c[0] - b[0];
      const bcY = c[1] - b[1];
      const dot = baX * bcX + baY * bcY;
      const magBA = Math.sqrt(baX * baX + baY * baY);
      const magBC = Math.sqrt(bcX * bcX + bcY * bcY);
      if (magBA === 0 || magBC === 0) return 0;
      const cos = dot / (magBA * magBC);
      return Math.round((Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI);
    };

    const s = coords[`shoulder_${side}`];
    const e = coords[`elbow_${side}`];
    const w = coords[`wrist_${side}`];
    const h = coords[`hip_${side}`];
    const k = coords[`knee_${side}`];
    const a = coords[`ankle_${side}`];

    if (joint === 'shoulder' && h && s && e) return calcAngle(h, s, e);
    if (joint === 'elbow' && s && e && w) return calcAngle(s, e, w);
    if (joint === 'hip' && s && h && k) return calcAngle(s, h, k);
    if (joint === 'knee' && h && k && a) return calcAngle(h, k, a);
    return 0;
  };

  const currentSessionData = frames.map((f) => {
    const coords = f.joint_coordinates;
    const time = (f.timestamp_millis / 1000).toFixed(1);

    if (activeJointKey === 'squat') {
      const kneeL = calculateAngleForJoint(coords, 'knee', 'l');
      const kneeR = calculateAngleForJoint(coords, 'knee', 'r');
      const hipL = calculateAngleForJoint(coords, 'hip', 'l');
      const hipR = calculateAngleForJoint(coords, 'hip', 'r');
      const symmetry = Math.max(0, Math.round(100 - Math.abs(kneeL - kneeR) * 3));
      return {
        time,
        'Knee Angle': Math.round((kneeL + kneeR) / 2),
        'Hip Angle': Math.round((hipL + hipR) / 2),
        Symmetry: symmetry
      };
    }

    const angle =
      activeJointKey === 'shoulder'
        ? calculateAngleForJoint(coords, 'shoulder')
        : activeJointKey === 'knee'
          ? calculateAngleForJoint(coords, 'knee')
          : calculateAngleForJoint(coords, 'elbow');
    return { time, Angle: angle };
  });

  const trendData = [...history]
    .reverse()
    .map((s) => ({
      date: new Date(s.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      ROM: Math.round(s.range_of_motion),
      Accuracy: Math.round(s.score),
      Speed: Math.round(s.speed),
      Symmetry: Math.round(s.symmetry > 2.0 ? s.symmetry : s.symmetry * 100)
    }));

  const insights = generateSessionInsights(frames, exerciseName, errorCount);
  const squatAnalysis = activeJointKey === 'squat' ? analyzeSquatSession(frames) : null;

  const getInsightIcon = (status: 'good' | 'warn' | 'bad') => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />;
      case 'bad':
        return <XCircle className="h-4 w-4 text-error flex-shrink-0" />;
    }
  };

  const getInsightBorder = (status: 'good' | 'warn' | 'bad') => {
    switch (status) {
      case 'good':
        return 'border-success/20 bg-success-light';
      case 'warn':
        return 'border-warning/20 bg-warning-light';
      case 'bad':
        return 'border-error/20 bg-error-light';
    }
  };

  const chartTooltipStyle = {
    backgroundColor: 'var(--surface-raised)',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    boxShadow: 'var(--shadow-sm)'
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-2">
      {/* Session insights */}
      {insights.length > 0 && (
        <div className="bg-chosen-surface border border-chosen p-5 rounded-chosen-lg flex flex-col text-left">
          <div className="flex flex-col gap-1 mb-4">
            <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">Session Insights</h4>
            <p className="text-xs text-chosen-text-secondary">Detailed analysis derived from per-frame telemetry data</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.label}
                className={`flex items-start gap-3 p-3.5 rounded-chosen-md border ${getInsightBorder(insight.status)}`}
              >
                {getInsightIcon(insight.status)}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-bold text-chosen-text-secondary uppercase tracking-wider">
                      {insight.label}
                    </span>
                    <span className="text-sm font-bold text-chosen-text-primary font-mono">{insight.value}</span>
                  </div>
                  <p className="text-xs text-chosen-text-secondary mt-1 leading-relaxed">{insight.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tempo breakdown for squats */}
      {squatAnalysis && squatAnalysis.tutMs > 0 && (
        <div className="bg-chosen-surface border border-chosen p-5 rounded-chosen-lg flex flex-col text-left">
          <div className="flex flex-col gap-1 mb-4">
            <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">Tempo Analysis</h4>
            <p className="text-xs text-chosen-text-secondary">Eccentric vs concentric phase breakdown across all reps</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-chosen-md bg-chosen-bg border border-chosen text-center">
              <span className="text-[10px] text-chosen-text-muted uppercase font-bold tracking-wider block">Eccentric</span>
              <span className="text-lg font-bold text-warning-dark dark:text-warning mt-1 block">{formatMs(squatAnalysis.eccentricMs)}</span>
            </div>
            <div className="p-4 rounded-chosen-md bg-chosen-bg border border-chosen text-center">
              <span className="text-[10px] text-chosen-text-muted uppercase font-bold tracking-wider block">Concentric</span>
              <span className="text-lg font-bold text-info mt-1 block">{formatMs(squatAnalysis.concentricMs)}</span>
            </div>
            <div className="p-4 rounded-chosen-md bg-chosen-bg border border-chosen text-center">
              <span className="text-[10px] text-chosen-text-muted uppercase font-bold tracking-wider block">Total TUT</span>
              <span className="text-lg font-bold text-gold-600 dark:text-gold-400 mt-1 block">{formatMs(squatAnalysis.tutMs)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Joint angle waveform */}
      {currentSessionData.length > 0 && (
        <div className="bg-chosen-surface border border-chosen p-5 rounded-chosen-lg flex flex-col text-left">
          <div className="flex flex-col gap-1 mb-4">
            <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">Joint Angle Waveform</h4>
            <p className="text-xs text-chosen-text-secondary">Flexion / extension cycles across session duration (seconds)</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={currentSessionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} domain={[0, 180]} />
                <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => `Time: ${label}s`} />
                {activeJointKey === 'squat' && (
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                )}
                {activeJointKey === 'squat' ? (
                  <>
                    <Line type="monotone" dataKey="Knee Angle" stroke="var(--success)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Hip Angle" stroke="var(--info)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="Angle"
                    stroke="var(--info)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--info)' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Symmetry waveform for squats */}
      {activeJointKey === 'squat' && currentSessionData.length > 0 && (
        <div className="bg-chosen-surface border border-chosen p-5 rounded-chosen-lg flex flex-col text-left">
          <div className="flex flex-col gap-1 mb-4">
            <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">Bilateral Symmetry Trend</h4>
            <p className="text-xs text-chosen-text-secondary">Left/right knee coordination over time — dips indicate imbalance</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentSessionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="symmetryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--focus)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--focus)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => `Time: ${label}s`} />
                <Area
                  type="monotone"
                  dataKey="Symmetry"
                  stroke="var(--focus)"
                  strokeWidth={2}
                  fill="url(#symmetryGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historical trends */}
      {trendData.length > 1 && (
        <div className="grid grid-cols-1 gap-5">
          <div className="bg-chosen-surface border border-chosen p-5 rounded-chosen-lg flex flex-col text-left">
            <div className="flex flex-col gap-1 mb-4">
              <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">ROM & Form Progress</h4>
              <p className="text-xs text-chosen-text-secondary">Range of motion and accuracy across prior sessions</p>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="ROM" name="ROM (deg)" stroke="var(--info)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Accuracy" name="Accuracy (%)" stroke="var(--focus)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-chosen-surface border border-chosen p-5 rounded-chosen-lg flex flex-col text-left">
            <div className="flex flex-col gap-1 mb-4">
              <h4 className="text-sm font-bold text-chosen-text-primary uppercase tracking-wider">Speed & Symmetry Trends</h4>
              <p className="text-xs text-chosen-text-secondary">Movement speed and bilateral coordination over time</p>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Speed" name="Speed (deg/s)" stroke="var(--info)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Symmetry" name="Symmetry (%)" stroke="var(--focus)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
