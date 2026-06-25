import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchMySessions, fetchPatientProfile, fetchMyAssignments } from '@/services/api';
import type { ExerciseAssignment, MotionSession } from '@/types/api';
import { 
  Play, 
  Activity, 
  Clock, 
  TrendingUp, 
  LogOut, 
  Award,
  Calendar,
  History,
  FileSpreadsheet,
  Heart,
  Dumbbell,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  BarChart3,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatisticCard, ExerciseCard } from '@/components/ui/Card';

interface ProgressData {
  label: string;
  rom: number;
  score: number;
}

const ProgressChart: React.FC<{ data: ProgressData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-lg text-chosen-text-muted">
        <span className="text-xs">Not enough sessions to display analytics</span>
      </div>
    );
  }

  const width = 500;
  const height = 220;
  const padding = 40;
  
  const pointsROM = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / Math.max(1, data.length - 1);
    const y = height - padding - ((d.rom || 0) / 180) * (height - 2 * padding);
    return { x, y };
  });

  const pointsScore = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / Math.max(1, data.length - 1);
    const y = height - padding - ((d.score || 0) / 100) * (height - 2 * padding);
    return { x, y };
  });

  const pathROM = pointsROM.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const pathScore = pointsScore.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
        const y = padding + r * (height - 2 * padding);
        return (
          <line
            key={idx}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="currentColor"
            className="text-[#E5E5E5] dark:text-[#2d3139]"
            strokeDasharray="4 4"
          />
        );
      })}
      
      {/* Line Paths using Figma colors (Gold #A27B41, Green #4F995E) */}
      {data.length > 1 && (
        <>
          <path d={pathROM} fill="none" stroke="#A27B41" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathScore} fill="none" stroke="#4F995E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {/* Grid Circular Vertices */}
      {data.map((d, i) => {
        const pROM = pointsROM[i];
        const pScore = pointsScore[i];
        return (
          <g key={i}>
            <circle cx={pROM.x} cy={pROM.y} r="4.5" fill="#A27B41" stroke="#fff" strokeWidth="2" className="hover:scale-125 transition-all" />
            <title>{`ROM: ${d.rom}°`}</title>
            
            <circle cx={pScore.x} cy={pScore.y} r="4.5" fill="#4F995E" stroke="#fff" strokeWidth="2" className="hover:scale-125 transition-all" />
            <title>{`Form Accuracy: ${d.score}%`}</title>

            <text
              x={pROM.x}
              y={height - 12}
              textAnchor="middle"
              className="text-[9px] fill-chosen-text-muted font-bold"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const PatientDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [sessions, setSessions] = useState<MotionSession[]>([]);
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [clinicalProfile, setClinicalProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPatientData() {
      try {
        const [patientData, sessionsData, assignmentsData] = await Promise.all([
          fetchPatientProfile(),
          fetchMySessions(),
          fetchMyAssignments(),
        ]);
        setClinicalProfile(patientData);
        setSessions(sessionsData);
        setAssignments(assignmentsData);
      } catch (err) {
        console.error('Failed to load patient data:', err);
        setClinicalProfile(null);
        setSessions([]);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    }
    loadPatientData();
  }, []);

  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const avgAccuracy = sessions.length 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.avg_score || 0), 0) / sessions.length)
    : 0;

  const processedChartData: ProgressData[] = [...sessions]
    .slice(0, 7)
    .reverse()
    .map(s => ({
      label: new Date(s.completed_at || s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      rom: s.range_of_motion || 0,
      score: s.avg_score || 0
    }));

  const activeAssignments = assignments;
  const upcomingAssignments = assignments;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0c18] flex flex-col transition-colors duration-200 text-chosen-text-primary">
      
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-[#0d0c18]/80 backdrop-blur-md border-b border-[#E5E5E5] dark:border-charcoal-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#141414] dark:bg-white rounded-chosen-md flex items-center justify-center text-white dark:text-[#141414] shadow-chosen-sm">
            <Activity className="h-5 w-5 text-[#A27B41]" />
          </div>
          <div className="text-left">
            <span className="font-display font-bold text-lg leading-none block text-[#0d0c18] dark:text-white">Chosen Life</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A27B41] mt-1 block">Patient Companion</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-chosen-text-primary">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : profile?.email}
            </span>
            <span className="text-[10px] bg-[#F5F5F5] dark:bg-charcoal-800 text-[#525252] dark:text-[#a3a3a3] px-2 py-0.5 rounded-full font-bold uppercase mt-0.5">
              Patient Profile
            </span>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={signOut}
            leftIcon={<LogOut className="h-4 w-4" />}
            title="Sign Out"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Banner greeting with custom Figma AI gradient backdrop */}
        <div className="bg-ai-gradient border border-[#E5E5E5] dark:border-charcoal-700/80 rounded-chosen-xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-chosen-lg relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-48 h-48 bg-[#A27B41]/5 rounded-full blur-xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#A27B41] fill-current" />
              <span className="text-2xs uppercase font-bold tracking-widest text-[#A27B41]">Welcome Back</span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-[#0d0c18] dark:text-white">Hello, {profile?.firstName || 'Patient'}</h1>
            <p className="text-chosen-text-secondary text-sm max-w-md">
              Ready to recover? Select your assigned exercises below to launch real-time motion capture analysis and submit tracking telemetry.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            {activeAssignments.length > 0 ? (
              <Button 
                variant="primary"
                size="lg"
                onClick={() => navigate('/tracker', { state: { exerciseName: activeAssignments[0].exercise?.name, rules: activeAssignments[0].exercise?.rules } })}
                leftIcon={<Play className="h-4.5 w-4.5 fill-current" />}
              >
                Start Today's Routine
              </Button>
            ) : (
              <Button 
                variant="primary"
                size="lg"
                onClick={() => navigate('/tracker')}
                leftIcon={<Play className="h-4.5 w-4.5 fill-current" />}
              >
                Quick Practice
              </Button>
            )}
          </div>
        </div>

        {/* Clinical diagnosis banner */}
        {clinicalProfile?.diagnosis && (
          <div className="bg-[#FAFBFC] dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-[#A27B41] text-left">
            <div>
              <span className="text-2xs font-bold text-[#A27B41] uppercase tracking-wider">Clinical Treatment Plan</span>
              <p className="font-bold text-chosen-text-primary text-sm mt-1">{clinicalProfile.diagnosis}</p>
            </div>
            <div className="text-xs">
              <span className="text-chosen-text-muted block text-2xs font-bold uppercase tracking-wider">Supervising Clinician</span>
              <span className="font-bold text-[#0D0C18] dark:text-white flex items-center gap-1.5 mt-0.5">
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                Dr. {clinicalProfile.assigned_admin?.user?.last_name || 'David Carter'}
              </span>
            </div>
          </div>
        )}

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatisticCard
            label="Sessions Done"
            value={loading ? '...' : sessions.length}
            icon={<Calendar className="h-5 w-5 text-[#A27B41]" />}
            iconBg="bg-[#A27B41]/10 text-[#A27B41]"
          />
          <StatisticCard
            label="Avg Form Accuracy"
            value={loading ? '...' : `${avgAccuracy}%`}
            icon={<Award className="h-5 w-5 text-[#A27B41]" />}
            iconBg="bg-[#A27B41]/10 text-[#A27B41]"
          />
          <StatisticCard
            label="Practice Practice"
            value={loading ? '...' : `${Math.round(totalDuration / 60)}m`}
            icon={<Clock className="h-5 w-5 text-[#A27B41]" />}
            iconBg="bg-[#A27B41]/10 text-[#A27B41]"
          />
        </div>

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (Assigned Program and Metrics Graphs) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Assigned Exercises Grid */}
            <div className="bg-white dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-lg p-6 space-y-6">
              <div className="text-left">
                <h3 className="font-display font-bold text-base text-chosen-text-primary flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-chosen-text-muted" />
                  Assigned Rehabilitation Exercises
                </h3>
                <p className="text-xs text-chosen-text-muted mt-1">Exercises prescribed specifically for your rehab program</p>
              </div>

              {loading ? (
                <p className="text-xs text-chosen-text-muted text-center py-8">Loading program...</p>
              ) : activeAssignments.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#E5E5E5] dark:border-charcoal-850 rounded-chosen-lg text-chosen-text-muted">
                  <Dumbbell className="h-10 w-10 mx-auto text-charcoal-350 dark:text-charcoal-600 mb-3" />
                  <p className="font-bold text-sm text-chosen-text-primary">No exercises assigned yet.</p>
                  <p className="text-xs mt-1">Your clinician will assign exercise templates shortly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeAssignments.map((assignment) => {
                    const ex = assignment.exercise;
                    if (!ex) return null;
                    return (
                      <ExerciseCard
                        key={assignment.id}
                        name={ex.name}
                        thumbnailUrl={ex.thumbnail_url || undefined}
                        targetRom={ex.target_rom || undefined}
                        description={ex.description || undefined}
                        instructions={ex.instructions || undefined}
                        actionButton={
                          <Button
                            variant="secondary"
                            className="w-full flex items-center justify-center gap-2 font-bold py-2"
                            onClick={() => navigate('/tracker', { state: { exerciseName: ex.name, rules: ex.rules } })}
                          >
                            <Play className="h-3.5 w-3.5 fill-current" /> Start Exercise
                          </Button>
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress Metrics Section */}
            <div className="bg-white dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-lg p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                <div>
                  <h3 className="font-display font-bold text-base text-chosen-text-primary flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-chosen-text-muted" />
                    Recovery Progress Analytics
                  </h3>
                  <p className="text-xs text-chosen-text-muted mt-1">Range of Motion (ROM) & alignment scores trends</p>
                </div>
                
                {/* Custom Legends */}
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto select-none">
                  <span className="flex items-center gap-1.5 text-[#A27B41]">
                    <span className="h-2.5 w-2.5 bg-[#A27B41] rounded-full inline-block" />
                    ROM Achieved (°)
                  </span>
                  <span className="flex items-center gap-1.5 text-[#4F995E]">
                    <span className="h-2.5 w-2.5 bg-[#4F995E] rounded-full inline-block" />
                    Accuracy Score (%)
                  </span>
                </div>
              </div>

              <div className="bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/80 rounded-chosen-lg p-6 relative">
                <ProgressChart data={processedChartData} />
              </div>
            </div>

          </div>

          {/* Right Columns (Upcoming Tasks and Recording History Logs) */}
          <div className="space-y-8">
            
            {/* Upcoming Sessions Calendar */}
            <div className="bg-white dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-lg p-6 space-y-6 text-left">
              <div>
                <h3 className="font-display font-bold text-base text-chosen-text-primary flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-chosen-text-muted" />
                  Upcoming Sessions Schedule
                </h3>
                <p className="text-[10px] text-chosen-text-muted mt-1">Assigned workouts due shortly</p>
              </div>

              {loading ? (
                <p className="text-xs text-chosen-text-muted">Loading schedule...</p>
              ) : upcomingAssignments.length === 0 ? (
                <div className="p-4 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/80 rounded-chosen-md flex gap-2.5 items-start">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#4F995E] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-chosen-text-primary block">No Assigned Exercises</span>
                    <span className="text-[10px] text-chosen-text-muted mt-0.5 block">Your clinician will assign exercises to your program.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/60 rounded-chosen-md flex justify-between items-center hover:border-gold-500/30 transition-all">
                      <div className="space-y-1">
                        <span className="font-bold text-xs text-chosen-text-primary block">
                          {assignment.exercise?.name}
                        </span>
                        <span className="text-[10px] text-chosen-text-muted flex items-center gap-1 font-semibold">
                          <Clock className="h-3 w-3" />
                          Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => navigate('/tracker', { state: { exerciseName: assignment.exercise?.name, rules: assignment.exercise?.rules } })}
                        leftIcon={<ChevronRight className="h-4.5 w-4.5 text-[#A27B41]" />}
                        title="Start workout"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recording Logs timeline list */}
            <div className="bg-white dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-lg p-6 space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-chosen-text-primary flex items-center gap-2">
                    <History className="h-4.5 w-4.5 text-chosen-text-muted" />
                    Completed Practice Logs
                  </h3>
                  <p className="text-[10px] text-chosen-text-muted mt-1">Logs of completed rehab exercises</p>
                </div>
                <button 
                  onClick={() => alert('Feature coming soon: Telemetry CSV exported.')}
                  className="text-xs font-bold text-[#A27B41] hover:underline flex items-center gap-0.5"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                </button>
              </div>

              {loading ? (
                <p className="text-xs text-chosen-text-muted text-center py-4">Loading logs...</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-chosen-text-muted text-center py-4">No sessions recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3.5 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/60 rounded-chosen-md hover:translate-x-0.5 transition-all text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-[#FAFBFC] dark:bg-charcoal-800 text-[#A27B41] border border-chosen rounded-chosen-md flex items-center justify-center font-bold">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-chosen-text-primary block max-w-[120px] truncate">
                            {session.title || 'Workout'}
                          </h5>
                          <span className="text-[9px] text-chosen-text-muted block mt-0.5 font-mono font-semibold">
                            {new Date(session.completed_at || session.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-chosen-text-primary block">
                            {session.avg_score || session.score}% Form
                          </span>
                          <span className="text-[9px] text-chosen-text-muted block mt-0.5 font-mono font-semibold">
                            {Math.round(session.range_of_motion || 0)}° ROM | {session.duration_seconds || 0}s
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/patient/session/${session.id}`)}
                          className="p-1.5 bg-[#F5F5F5] hover:bg-gold-500/10 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-500 hover:text-[#A27B41] rounded-chosen-sm transition-all"
                          title="Replay Session"
                        >
                          <PlayCircle className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default PatientDashboard;
