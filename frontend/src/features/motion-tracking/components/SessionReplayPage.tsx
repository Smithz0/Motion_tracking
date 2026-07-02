import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  AlertCircle, 
  BarChart3, 
  ShieldAlert, 
  GitCompare, 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  ChevronLeft,
  Activity,
  TrendingUp,
  Clock,
  User,
  Plus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  fetchSessionDetail,
  fetchSessionFrames,
  fetchSessionAccuracy,
  fetchSessionComparison,
  fetchMySessions,
  fetchPatientDetail
} from '@/services/api';
import { SkeletonReplay } from './SkeletonReplay';
import { MetricsPanel } from './MetricsPanel';
import { ErrorList } from './ErrorList';
import { SessionComparison } from './SessionComparison';
import { SessionAnalytics } from './SessionAnalytics';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Status';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/components/layout/LayoutComponents';

export const SessionReplayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for API data
  const [session, setSession] = useState<any>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Tab State: 'metrics' | 'insights' | 'compare' | 'notes'
  const [activeTab, setActiveTab] = useState<'metrics' | 'insights' | 'compare' | 'notes'>('metrics');

  // Expansion State (Theater Mode)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Practitioner Notes cache
  const [sessionNotes, setSessionNotes] = useState<Record<string, Array<{
    id: string;
    author: string;
    content: string;
    recommendation: string;
    status: string;
    timestamp: string;
  }>>>({
    '1': [
      {
        id: 'n-1',
        author: 'Dr. Aurelius',
        content: 'Form was highly consistent. Knee alignment is solid during descent. Joint angles within optimal ranges.',
        recommendation: 'Continue standard routine sets. Check speed alignment next checkup.',
        status: 'Reviewed',
        timestamp: 'June 28, 2026 at 10:24 AM'
      }
    ]
  });

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');
  const [reviewStatus, setReviewStatus] = useState('Reviewed');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const getSessionNotes = (id: string) => {
    return sessionNotes[id] || [];
  };

  const handleAddNote = () => {
    if (!sessionId || !newNoteContent.trim()) return;
    const authorName = (profile as any)?.full_name || 'Dr. Aurelius';
    const newNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      content: newNoteContent,
      recommendation: newRecommendation || 'Continue standard exercises.',
      status: reviewStatus,
      timestamp: new Date().toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    };
    setSessionNotes(prev => ({
      ...prev,
      [sessionId]: [newNote, ...getSessionNotes(sessionId)]
    }));
    setNewNoteContent('');
    setNewRecommendation('');
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!sessionId || !editingContent.trim()) return;
    setSessionNotes(prev => ({
      ...prev,
      [sessionId]: getSessionNotes(sessionId).map(n => 
        n.id === noteId ? { ...n, content: editingContent, timestamp: `${n.timestamp} (edited)` } : n
      )
    }));
    setEditingNoteId(null);
    setEditingContent('');
  };

  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;
      setLoading(true);
      setError(null);

      try {
        const id = parseInt(sessionId);
        
        // 1. Fetch main session detail
        const sessionDetail = await fetchSessionDetail(id);
        setSession(sessionDetail);

        // 2. Fetch coordinate frames
        const frameData = await fetchSessionFrames(id);
        setFrames(frameData.frames || []);

        // 3. Fetch accuracy & error data
        const accuracyData = await fetchSessionAccuracy(id);
        setAccuracy(accuracyData);

        // 4. Fetch comparison metrics
        const comparisonData = await fetchSessionComparison(id);
        setComparison(comparisonData);

        // 5. Fetch history (exercise progress trends)
        try {
          if (profile?.role === 'patient') {
            const mySessions = await fetchMySessions();
            const filtered = mySessions.filter((s: any) => s.exercise_id === sessionDetail.exercise_id);
            setHistory(filtered);
          } else if (profile?.role === 'admin') {
            const patientDetail = await fetchPatientDetail(sessionDetail.patient_id);
            const filtered = (patientDetail.sessions || []).filter((s: any) => s.exercise_id === sessionDetail.exercise_id);
            setHistory(filtered);
          }
        } catch (histErr) {
          console.warn('Failed to load session history trends:', histErr);
        }

      } catch (err: any) {
        console.error('Failed to load session replay data:', err);
        setError(err.message || 'Failed to retrieve session details from server.');
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId, profile]);

  const handleBack = () => {
    if (profile?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/patient');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chosen-bg text-chosen-text-primary">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="text-sm font-semibold uppercase tracking-wider text-chosen-text-muted">Loading Telemetry Replay...</span>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chosen-bg p-6 text-chosen-text-primary">
        <div className="max-w-md w-full p-6 bg-chosen-raised border border-chosen rounded-chosen-lg flex flex-col items-center gap-4 text-center shadow-chosen-lg">
          <AlertCircle className="h-12 w-12 text-error" />
          <h3 className="text-lg font-bold">Error Loading Session</h3>
          <p className="text-sm text-chosen-text-muted">{error || 'Session details could not be found.'}</p>
          <Button
            onClick={handleBack}
            variant="secondary"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="mt-2"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0c18] text-chosen-text-primary p-4 md:p-6 lg:p-8 flex flex-col gap-6 select-none">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col gap-4 border-b border-chosen pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <button 
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-chosen-md bg-[#F5F5F5] dark:bg-charcoal-850 border border-chosen text-chosen-text-secondary hover:text-gold-500 hover:border-gold-500/50 transition-all font-bold text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              Portal Dashboard
            </button>
            <span className="text-chosen-text-muted">/</span>
            <span className="text-[#A27B41] font-bold text-xs">Motion Reports Page</span>
          </div>

          {/* Export Toolbar */}
          <div className="flex items-center gap-2 select-none">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={() => window.print()}
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Print Report
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Share link copied to clipboard!');
              }}
              leftIcon={<Share2 className="h-4 w-4" />}
            >
              Share
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => alert('Downloading Clinical Motion Analysis PDF...')}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Title and Logo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left pt-2">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-500/5 border border-chosen text-chosen-text-muted rounded-chosen-sm font-semibold">
              REPORT ID: {session.id}
            </span>
          </div>
        </div>

        {/* Filter bar mockups */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-chosen text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="text-chosen-text-muted font-semibold">Patient:</span>
            <select className="bg-white dark:bg-charcoal-900 border border-chosen rounded-chosen-md px-2 py-1 text-chosen-text-secondary focus:outline-none focus:ring-1 focus:ring-[#A27B41] font-medium">
              <option>{session.patient_id}</option>
              <option>All Patients</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-chosen-text-muted font-semibold">Exercise:</span>
            <select className="bg-white dark:bg-charcoal-900 border border-chosen rounded-chosen-md px-2 py-1 text-chosen-text-secondary focus:outline-none focus:ring-1 focus:ring-[#A27B41] font-medium">
              <option>{session.title ? session.title.split(" - ")[0] : "Exercise"}</option>
              <option>All Exercises</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-chosen-text-muted font-semibold">Status:</span>
            <select className="bg-white dark:bg-charcoal-900 border border-chosen rounded-chosen-md px-2 py-1 text-chosen-text-secondary focus:outline-none focus:ring-1 focus:ring-[#A27B41] font-medium">
              <option>Completed</option>
              <option>Needs Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Three Panel Desktop Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:max-h-[calc(100vh-220px)] lg:overflow-hidden">
        
        {/* ==========================================
            LEFT PANEL: CONTEXT INFORMATION (col-span-3)
            ========================================== */}
        <div className={cn("space-y-6 text-left lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2 lg:panel-scroll", isExpanded ? "hidden" : "col-span-12 lg:col-span-3")}>
          {/* Patient Card */}
          <Card className="p-5 space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[#A27B41]" />
              Patient Profile
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">ID Code</span>
                <span className="font-mono font-bold text-chosen-text-secondary">{session.patient_id}</span>
              </div>
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Completion Status</span>
                <span className="inline-block px-2.5 py-0.5 bg-green-500/10 border border-green-500/25 text-green-500 rounded-full font-bold uppercase text-[9px] mt-1">
                  {session.status || 'Completed'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Practitioner</span>
                <span className="font-semibold text-chosen-text-secondary">Dr. Carter</span>
              </div>
            </div>
          </Card>

          {/* Exercise Card */}
          <Card className="p-5 space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#A27B41]" />
              Exercise Routine
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Routine Name</span>
                <span className="font-bold text-chosen-text-secondary block truncate">{session.title || 'Workout'}</span>
              </div>
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Target Joint</span>
                <span className="font-semibold text-chosen-text-secondary">
                  {session.title?.toLowerCase().includes('squat') ? 'Hip & Knee Flexion' : 'Shoulder / Elbow Abduction'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Calibration Limit</span>
                <span className="font-semibold text-chosen-text-secondary font-mono">110° Threshold</span>
              </div>
            </div>
          </Card>

          {/* Session Card */}
          <Card className="p-5 space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#A27B41]" />
              Session Info
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Recorded Date</span>
                <span className="font-semibold text-chosen-text-secondary">
                  {session.completed_at ? new Date(session.completed_at).toLocaleDateString() : 'June 28, 2026'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Workout Duration</span>
                <span className="font-semibold text-chosen-text-secondary font-mono">{Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
              </div>
              <div>
                <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Frames Processed</span>
                <span className="font-semibold text-chosen-text-secondary font-mono">{frames.length} captured</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ==========================================
            CENTER PANEL: PRIMARY REPLAY CANVASES (col-span-5)
            ========================================== */}
        <div className={cn("flex flex-col gap-6 text-left lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2 lg:panel-scroll", isExpanded ? "col-span-12 lg:col-span-8" : "col-span-12 lg:col-span-5")}>
          <Card className="p-4 space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#A27B41] border-b border-chosen pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                Skeleton Pose Replay
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2 py-1 rounded bg-[#F5F5F5] dark:bg-charcoal-850 border border-chosen text-chosen-text-secondary hover:text-[#A27B41] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 font-bold text-2xs uppercase tracking-wider cursor-pointer select-none"
                title={isExpanded ? "Collapse to Default Mode" : "Expand to Theater Mode"}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="h-3 w-3 text-gold-500" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3 w-3" />
                    <span>Expand View</span>
                  </>
                )}
              </button>
            </h3>
            <div className="w-full relative rounded-chosen-lg overflow-hidden border border-chosen bg-slate-950">
              <SkeletonReplay 
                frames={frames} 
                exerciseName={session.title ? session.title.split(" - ")[0] : "Exercise"} 
              />
            </div>
          </Card>
        </div>

        {/* ==========================================
            RIGHT PANEL: METRICS, AI INSIGHTS & NOTES (col-span-4)
            ========================================== */}
        <div className="col-span-12 lg:col-span-4 space-y-6 text-left lg:max-h-[calc(100vh-220px)] lg:flex lg:flex-col lg:overflow-hidden lg:pt-1">
          {/* Tab switches */}
          <div className="flex bg-[#F5F5F5] dark:bg-charcoal-850 p-1.5 rounded-chosen-lg border border-chosen overflow-x-auto lg:overflow-x-visible select-none gap-1 flex-shrink-0">
            {(['metrics', 'insights', 'compare', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-2.5 rounded-chosen-md font-bold text-2xs uppercase tracking-wider transition-all whitespace-nowrap flex-1 text-center",
                  activeTab === tab
                    ? "bg-white dark:bg-charcoal-900 text-gold-500 shadow-chosen-sm"
                    : "text-chosen-text-muted hover:text-[#A27B41]"
                )}
              >
                {tab === 'compare' ? 'Comparison' : tab}
              </button>
            ))}
          </div>

          {/* Sub-panels */}
          <div className="space-y-6 lg:overflow-y-auto lg:flex-1 lg:pr-2 lg:panel-scroll">
            {/* TAB: METRICS */}
            {activeTab === 'metrics' && (
              <div className="space-y-6 animate-fade-in">
                {/* Embedded Metrics Panel */}
                <MetricsPanel
                  metrics={session.metrics_summary || {}}
                  durationSeconds={session.duration_seconds}
                  score={Math.round(session.score || 0)}
                  status={session.status}
                  errorCount={accuracy?.detected_errors?.length || 0}
                />

                {/* WAVEFORM ANALYTICS */}
                <Card className="p-4 space-y-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-[#A27B41]" />
                    Joint Angle Waveforms
                  </h4>
                  <SessionAnalytics 
                    frames={frames} 
                    history={history} 
                    exerciseName={session.title ? session.title.split(" - ")[0] : "Exercise"}
                    errorCount={accuracy?.detected_errors?.length || 0}
                  />
                </Card>
              </div>
            )}

            {/* TAB: AI INSIGHTS */}
            {activeTab === 'insights' && (
              <div className="space-y-4 animate-fade-in">
                <Card className="p-4 space-y-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2">
                    Clinical AI Advice Recommendations
                  </h4>
                  
                  {/* Custom AI recommendations based on metrics and detected errors */}
                  <div className="space-y-3">
                    {Math.round(session.score || 0) >= 90 ? (
                      <div className="flex items-start gap-3 p-3 bg-green-500/5 text-green-500 border border-green-500/10 rounded-chosen-md">
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-2xs uppercase block">Excellent form posture</span>
                          <p className="text-2xs text-chosen-text-secondary mt-1">Excellent joint symmetry. Alignment angles were within optimal posture envelopes.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-red-500/5 text-red-500 border border-red-500/10 rounded-chosen-md">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-2xs uppercase block">Knee alignment correction</span>
                          <p className="text-2xs text-chosen-text-secondary mt-1">Valgus knee deviation detected. Try reducing speed on descending phases.</p>
                        </div>
                      </div>
                    )}

                    {session.duration_seconds / (session.metrics_summary?.repetitions || 1) < 2.5 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-500/5 text-yellow-600 border border-yellow-500/10 rounded-chosen-md">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-2xs uppercase block">Fast movement pace</span>
                          <p className="text-2xs text-chosen-text-secondary mt-1">Movement speed is slightly too fast. Try holding extensions for 1.5 seconds.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-3 bg-[#A27B41]/5 text-[#A27B41] border border-[#A27B41]/10 rounded-chosen-md">
                      <TrendingUp className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-2xs uppercase block">Range of motion improvement</span>
                        <p className="text-2xs text-chosen-text-secondary mt-1">Great improvements in maximum abduction ranges compared to last week.</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Form deviations log */}
                <Card className="p-4 space-y-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-[#A27B41]" />
                    Form Deviations Log
                  </h4>
                  <ErrorList errors={accuracy?.detected_errors || []} />
                </Card>
              </div>
            )}

            {/* TAB: COMPARISON */}
            {activeTab === 'compare' && (
              <div className="space-y-4 animate-fade-in">
                {comparison ? (
                  <SessionComparison comparison={comparison} />
                ) : (
                  <Card className="p-8 text-center text-chosen-text-muted">
                    <GitCompare className="h-10 w-10 mx-auto text-chosen-text-muted mb-3" />
                    <p className="text-xs">No previous session data is available to compare.</p>
                  </Card>
                )}
              </div>
            )}

            {/* TAB: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-fade-in">
                {/* Note Editor */}
                <Card className="p-4 space-y-3">
                  <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">
                    Write Practitioner Progress Note
                  </span>
                  
                  <textarea
                    placeholder="Describe joint abnormalities, muscle fatigue signs, range limit modifications..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full p-2.5 bg-slate-500/5 hover:bg-slate-500/10 focus:bg-white dark:focus:bg-charcoal-900 border border-chosen rounded-chosen-md text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[#A27B41] text-chosen-text-primary min-h-[70px]"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] text-chosen-text-muted font-bold uppercase block mb-1">Recommendation</span>
                      <input
                        type="text"
                        placeholder="e.g. increase stretch"
                        value={newRecommendation}
                        onChange={(e) => setNewRecommendation(e.target.value)}
                        className="w-full p-2 bg-slate-500/5 border border-chosen rounded text-xs text-chosen-text-primary focus:outline-none focus:ring-1 focus:ring-[#A27B41]"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-chosen-text-muted font-bold uppercase block mb-1">Review Status</span>
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-charcoal-900 border border-chosen rounded text-xs text-chosen-text-primary focus:outline-none focus:ring-1 focus:ring-[#A27B41]"
                      >
                        <option value="Reviewed">Reviewed</option>
                        <option value="Pending Revision">Pending Revision</option>
                        <option value="Needs Checkup">Needs Checkup</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      size="xs"
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim()}
                      leftIcon={<Plus className="h-3.5 w-3.5" />}
                    >
                      Save Clinical Note
                    </Button>
                  </div>
                </Card>

                {/* Notes Timeline Feed */}
                <div className="space-y-4">
                  {getSessionNotes(sessionId || '').map((note) => (
                    <Card key={note.id} className="p-4 space-y-3 border-l-4 border-l-[#A27B41]">
                      <div className="flex justify-between items-center text-[10px] text-chosen-text-muted font-bold">
                        <span>AUTHOR: {note.author}</span>
                        <span>{note.timestamp}</span>
                      </div>
                      
                      {editingNoteId === note.id ? (
                        <div className="space-y-2 select-none">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-charcoal-900 border border-[#A27B41]/50 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#A27B41] text-chosen-text-primary"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => setEditingNoteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="xs"
                              onClick={() => handleSaveEditNote(note.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs text-left">
                          <p className="text-chosen-text-secondary leading-relaxed whitespace-pre-line">
                            {note.content}
                          </p>
                          <div className="pt-2 border-t border-chosen flex justify-between items-center text-[10px] select-none">
                            <span className="text-chosen-text-muted">
                              RECOMMENDATION: <span className="font-semibold text-[#A27B41]">{note.recommendation}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-chosen-text-muted font-bold">
                              {note.status}
                            </span>
                          </div>
                          <div className="flex justify-end select-none pt-1">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingContent(note.content);
                              }}
                              className="text-[#A27B41] font-bold p-0 text-[10px]"
                            >
                              Edit Note
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      
    </div>
  );
};
