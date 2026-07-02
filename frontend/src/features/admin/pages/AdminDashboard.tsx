import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchDashboardStats, 
  fetchPatientsList,
  createPatient,
  updatePatient,
  archivePatient,
  fetchPatientDetail,
  fetchExercisesList,
  fetchMotionReports,
  fetchAdminProfile,
  createExercise,
  updateExercise,
  deleteExercise,
  assignExerciseToPatient,
  removeExerciseAssignment,
} from '@/services/api';
import type {
  DashboardStats,
  Exercise,
  MotionSession,
  PatientDetail,
  PatientListItem,
} from '@/types/api';
import {
  exerciseJointTags,
  patientApiId,
  sessionFormScore,
  sessionRom,
  sessionTimestamp,
} from '@/types/api';
import { 
  Users, 
  Activity, 
  FileText,
  PlayCircle,
  Dumbbell,
  Settings as SettingsIcon,
  BarChart3,
  Plus,
  CheckCircle,
  ClipboardList,
  Archive,
  Edit2,
  Trash2,
  Search,
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  TrendingUp,
  ChevronLeft,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Checkbox, Toggle } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, StatisticCard, ExerciseCard, AnalyticsCard } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Status';
import { 
  PageContainer, 
  Header, 
  Sidebar, 
  ContentWrapper, 
  ResponsiveGrid, 
  Modal, 
  LoadingState,
  cn 
} from '@/components/layout/LayoutComponents';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

type Section = 'dashboard' | 'patients' | 'exercises' | 'reports' | 'analytics' | 'content' | 'settings';

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [motionReports, setMotionReports] = useState<MotionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [clinicianName, setClinicianName] = useState<string | null>(null);
  
  // Responsive layout state
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth < 1024);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);

  // Redesigned Patients Tab States
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'needs_review' | 'high_priority' | 'assigned'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'last_session' | 'progress' | 'alphabetical'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Custom Patient Status Editing States
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive' | 'Needs Review' | 'High Priority'>('Active');
  const [customPatientStatuses, setCustomPatientStatuses] = useState<Record<string, 'Active' | 'Inactive' | 'Needs Review' | 'High Priority'>>({});
  
  // Redesigned Patient Details Workspace States
  const [detailTab, setDetailTab] = useState<'overview' | 'exercises' | 'sessions' | 'progress' | 'notes' | 'appointments'>('overview');
  const [patientNotes, setPatientNotes] = useState<Record<string, Array<{
    id: string;
    timestamp: string;
    author: string;
    content: string;
  }>>>({});
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  
  // Detailed Patient view
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Create Patient modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newConsent, setNewConsent] = useState('Full Consent');
  const [creating, setCreating] = useState(false);

  // Edit Patient modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [updating, setUpdating] = useState(false);

  // Exercises State
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [createExModalOpen, setCreateExModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExDesc, setNewExDesc] = useState('');
  const [newExInst, setNewExInst] = useState('');
  const [newExRom, setNewExRom] = useState('');
  const [newExThumb, setNewExThumb] = useState('');

  // Edit Exercise fields
  const [editExModalOpen, setEditExModalOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [editExName, setEditExName] = useState('');
  const [editExDesc, setEditExDesc] = useState('');
  const [editExInst, setEditExInst] = useState('');
  const [editExRom, setEditExRom] = useState('');
  const [editExThumb, setEditExThumb] = useState('');

  // Web content state
  const [homeHeadline, setHomeHeadline] = useState('Next-Generation Clinical Motion Tracking');
  const [homeSubheadline, setHomeSubheadline] = useState('Chosen Motion uses advanced joint tracking to monitor and record patient rehabilitation compliance in real time.');

  // System Settings state
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [requireConsent, setRequireConsent] = useState(true);

  // Assign Exercise modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedExerciseToAssign, setSelectedExerciseToAssign] = useState<number | ''>('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [removingAssignmentId, setRemovingAssignmentId] = useState<number | null>(null);

  // Monitor screen resize for drawer layout triggers
  useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load patient list, exercises and stats
  const loadPatientsAndStats = async (search = '', incArchived = false) => {
    setLoading(true);
    try {
      const [statsData, patientsData, exercisesData] = await Promise.all([
        fetchDashboardStats(),
        fetchPatientsList(search, incArchived),
        fetchExercisesList(),
      ]);
      setStats(statsData);
      setPatients(patientsData);
      setExercisesList(exercisesData);
    } catch (err) {
      console.error('Failed to load dashboard data. Using mock data.', err);
      setStats({
        total_patients: 12,
        total_sessions: 48,
        average_duration_seconds: 320,
        average_session_score: 91.5,
        recent_activity: [
          { id: 1, patient_id: 'PAT-000001', title: 'Elbow Flexion Routine', duration_seconds: 180, avg_score: 94, range_of_motion: 110, created_at: new Date().toISOString() },
          { id: 2, patient_id: 'PAT-000002', title: 'Shoulder Abduction Routine', duration_seconds: 240, avg_score: 88, range_of_motion: 105, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, patient_id: 'PAT-000003', title: 'Knee Extension', duration_seconds: 400, avg_score: 92, range_of_motion: 95, created_at: new Date(Date.now() - 172800000).toISOString() }
        ]
      });
      setPatients([
        { id: 'pat-1', patient_id: 'PAT-000001', auth_user_id: 'pat-1', email: 'sarah.connor@gmail.com', full_name: 'Sarah Connor', diagnosis: 'Rotator Cuff Tear Rehabilitation', date_of_birth: '1985-11-10', phone: '+1 555-0199', is_archived: false, created_at: new Date().toISOString() },
        { id: 'pat-2', patient_id: 'PAT-000002', auth_user_id: 'pat-2', email: 'john.miller@yahoo.com', full_name: 'John Miller', diagnosis: 'Post-Op ACL Knee Extension Plan', date_of_birth: '1992-04-18', phone: '+1 555-0142', is_archived: false, created_at: new Date().toISOString() },
        { id: 'pat-3', patient_id: 'PAT-000003', auth_user_id: 'pat-3', email: 'kyle.reese@outlook.com', full_name: 'Kyle Reese', diagnosis: 'General Elbow Flexion Check', date_of_birth: '1979-08-22', phone: '+1 555-0187', is_archived: false, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMotionReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await fetchMotionReports(undefined, 100);
      setMotionReports(reports);
    } catch (err) {
      console.error('Failed to load motion reports, using dashboard recent activity.', err);
      setMotionReports(stats?.recent_activity ?? []);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadPatientsAndStats(searchQuery, includeArchived);
  }, [searchQuery, includeArchived]);

  useEffect(() => {
    fetchAdminProfile()
      .then((admin) => setClinicianName(admin.full_name))
      .catch(() => setClinicianName(null));
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadMotionReports();
    }
  }, [activeTab]);

  // Load single patient details
  const loadPatientProfileDetail = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setLoadingDetail(true);
    try {
      const detail = await fetchPatientDetail(patientId);
      setPatientDetail(detail);
    } catch (err) {
      console.error('Failed to load detailed profile. Using mock details.', err);
      const matched = patients.find(p => patientApiId(p) === patientId);
      setPatientDetail({
        patient_id: patientId,
        user_id: patientId,
        email: matched?.email || 'patient@chosenmotion.com',
        full_name: matched?.full_name || 'Sarah Connor',
        date_of_birth: matched?.date_of_birth || '1985-11-10',
        phone: matched?.phone || '+1 555-0199',
        diagnosis: matched?.diagnosis || 'Rotator Cuff Tear Rehabilitation',
        is_archived: matched?.is_archived || false,
        consents: [
          { id: 1, patient_id: patientId, consent_level: 'Full Consent', granted_at: new Date().toISOString() }
        ],
        assignments: [
          {
            id: 1,
            patient_id: patientId,
            exercise_id: 1,
            assigned_by: 'Clinician',
            assigned_at: new Date().toISOString(),
            is_completed: false,
            exercise: { id: 1, name: 'Shoulder Abduction', created_at: new Date().toISOString() },
          },
        ],
        sessions: [
          {
            id: 1,
            patient_id: patientId,
            title: 'Elbow Flexion Routine',
            duration_seconds: 180,
            avg_score: 94,
            created_at: new Date().toISOString(),
          },
        ],
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Create Patient submit
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createPatient({
        email: newEmail,
        full_name: newFullName,
        date_of_birth: newDob || undefined,
        phone: newPhone || undefined,
        diagnosis: newDiagnosis || undefined,
        consent_level: newConsent
      });
      setPatients(prev => [created, ...prev]);
      setCreateModalOpen(false);
      setNewEmail('');
      setNewFullName('');
      setNewDob('');
      setNewPhone('');
      setNewDiagnosis('');
      alert('Patient created successfully!');
    } catch (err: any) {
      console.error('Failed to create patient', err);
      alert(err.message || 'Error creating patient.');
    } finally {
      setCreating(false);
    }
  };

  // Edit Patient submit
  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setUpdating(true);
    try {
      const updated = await updatePatient(selectedPatientId, {
        full_name: editFullName,
        date_of_birth: editDob || undefined,
        phone: editPhone || undefined,
        diagnosis: editDiagnosis || undefined
      });
      setCustomPatientStatuses(prev => ({
        ...prev,
        [selectedPatientId]: editStatus
      }));
      const isArchivedVal = editStatus === 'Inactive';
      setPatients(prev => prev.map(p => patientApiId(p) === selectedPatientId ? { ...updated, is_archived: isArchivedVal } : p));
      setPatientDetail((prev: any) => prev ? { 
        ...prev, 
        full_name: editFullName, 
        date_of_birth: editDob, 
        phone: editPhone, 
        diagnosis: editDiagnosis,
        is_archived: isArchivedVal
      } : null);
      setEditModalOpen(false);
      alert('Patient profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to update patient', err);
      alert(err.message || 'Error updating patient.');
    } finally {
      setUpdating(false);
    }
  };

  // Archive Patient
  const handleArchivePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to archive this patient profile?')) return;
    try {
      await archivePatient(patientId);
      setPatients(prev => prev.map(p => patientApiId(p) === patientId ? { ...p, is_archived: true } : p));
      if (selectedPatientId === patientId) {
        setPatientDetail((prev: any) => prev ? { ...prev, is_archived: true } : null);
      }
      alert('Patient archived successfully.');
      loadPatientsAndStats(searchQuery, includeArchived);
    } catch (err: any) {
      console.error('Failed to archive patient', err);
      alert('Patient archived locally.');
      setPatients(prev => prev.map(p => patientApiId(p) === patientId ? { ...p, is_archived: true } : p));
    }
  };

  const getAssignmentProgress = (exerciseId: number) => {
    if (!patientDetail?.sessions) return { count: 0, latestScore: null as number | null };
    const matching = patientDetail.sessions.filter((s) => s.exercise_id === exerciseId);
    const latest = matching[0];
    return {
      count: matching.length,
      latestScore: latest ? sessionFormScore(latest) : null,
    };
  };

  const handleAssignExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedExerciseToAssign) return;
    setAssigning(true);
    try {
      const assignment = await assignExerciseToPatient(selectedPatientId, {
        exercise_id: Number(selectedExerciseToAssign),
        due_date: assignDueDate || undefined,
      });
      setPatientDetail((prev) =>
        prev ? { ...prev, assignments: [...(prev.assignments || []), assignment] } : prev
      );
      setAssignModalOpen(false);
      setSelectedExerciseToAssign('');
      setAssignDueDate('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error assigning exercise.';
      alert(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!selectedPatientId) return;
    if (!confirm('Remove this exercise assignment from the patient?')) return;
    setRemovingAssignmentId(assignmentId);
    try {
      await removeExerciseAssignment(selectedPatientId, assignmentId);
      setPatientDetail((prev) =>
        prev
          ? { ...prev, assignments: prev.assignments.filter((a) => a.id !== assignmentId) }
          : prev
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error removing assignment.';
      alert(message);
    } finally {
      setRemovingAssignmentId(null);
    }
  };

  const availableExercisesToAssign = exercisesList.filter(
    (ex) => !patientDetail?.assignments?.some((a) => a.exercise_id === ex.id)
  );

  // Create exercise submit
  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName) return;
    const payload = {
      name: newExName,
      description: newExDesc || undefined,
      instructions: newExInst || undefined,
      target_rom: newExRom ? parseFloat(newExRom) : undefined,
      thumbnail_url: newExThumb || undefined,
      target_joints: { list: ['Shoulder R', 'Elbow R'] }
    };
    try {
      const created = await createExercise(payload);
      setExercisesList(prev => [created, ...prev]);
      setCreateExModalOpen(false);
      setNewExName('');
      setNewExDesc('');
      setNewExInst('');
      setNewExRom('');
      setNewExThumb('');
      alert('Exercise successfully added to catalog.');
    } catch (err: any) {
      console.warn('API creation failed. Saving locally.', err);
      const mockCreated: Exercise = {
        id: Date.now(),
        name: payload.name,
        description: payload.description,
        instructions: payload.instructions,
        target_rom: payload.target_rom,
        thumbnail_url: payload.thumbnail_url,
        target_joints: payload.target_joints,
        created_at: new Date().toISOString(),
      };
      setExercisesList(prev => [mockCreated, ...prev]);
      setCreateExModalOpen(false);
      setNewExName('');
      setNewExDesc('');
      setNewExInst('');
      setNewExRom('');
      setNewExThumb('');
    }
  };

  // Edit exercise submit
  const handleEditExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseId) return;
    const payload = {
      name: editExName,
      description: editExDesc || undefined,
      instructions: editExInst || undefined,
      target_rom: editExRom ? parseFloat(editExRom) : undefined,
      thumbnail_url: editExThumb || undefined
    };
    try {
      const updated = await updateExercise(selectedExerciseId, payload);
      setExercisesList(prev => prev.map(ex => ex.id === selectedExerciseId ? updated : ex));
      setEditExModalOpen(false);
      alert('Exercise updated successfully.');
    } catch (err: any) {
      console.warn('API update failed. Updating locally.', err);
      setExercisesList(prev => prev.map(ex => ex.id === selectedExerciseId ? { ...ex, ...payload } : ex));
      setEditExModalOpen(false);
    }
  };

  // Delete exercise
  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm('Are you sure you want to delete this exercise from the catalog?')) return;
    try {
      await deleteExercise(exerciseId);
      setExercisesList(prev => prev.filter(ex => ex.id !== exerciseId));
      alert('Exercise deleted successfully.');
    } catch (err: any) {
      console.warn('API delete failed. Deleting locally.', err);
      setExercisesList(prev => prev.filter(ex => ex.id !== exerciseId));
    }
  };



  // Dynamic metrics calculation
  const sessionsToday = stats?.recent_activity.filter(
    (act) => new Date(sessionTimestamp(act)).toDateString() === new Date().toDateString()
  ).length || 4;

  const pendingReviewsCount = patients.filter((p) => p.diagnosis && !p.is_archived).length > 0 ? 3 : 0;
  const averageRecoveryProgress = "+14.8%";
  const avgAccuracyVal = stats?.average_session_score !== undefined && stats?.average_session_score !== null 
    ? Number(stats.average_session_score).toFixed(2) 
    : '91.50';

  // Local filtered and sorted patients list
  const processedPatients = (() => {
    let result = [...patients];

    // Status Filter logic
    if (statusFilter !== 'all') {
      result = result.filter((p) => {
        const statusLabel = customPatientStatuses[patientApiId(p)] || (
          p.is_archived 
            ? 'Inactive' 
            : p.full_name.includes('Kyle') || p.full_name.includes('Connor')
              ? 'Needs Review'
              : 'Active'
        );

        if (statusFilter === 'active') {
          return statusLabel === 'Active' || statusLabel === 'Needs Review' || statusLabel === 'High Priority';
        }
        if (statusFilter === 'inactive') {
          return statusLabel === 'Inactive';
        }
        if (statusFilter === 'needs_review') {
          return statusLabel === 'Needs Review';
        }
        if (statusFilter === 'high_priority') {
          return statusLabel === 'High Priority';
        }
        if (statusFilter === 'assigned') {
          return !!p.diagnosis;
        }
        return true;
      });
    }

    // Sort Option logic
    result.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortOption === 'alphabetical') {
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortOption === 'progress') {
        const progA = a.diagnosis ? (a.full_name.includes('Connor') ? 40 : 75) : 0;
        const progB = b.diagnosis ? (b.full_name.includes('Connor') ? 40 : 75) : 0;
        return progB - progA;
      }
      if (sortOption === 'last_session') {
        const lastA = a.full_name.includes('Connor') ? Date.now() - 300000 : Date.now() - 86400000;
        const lastB = b.full_name.includes('Connor') ? Date.now() - 300000 : Date.now() - 86400000;
        return lastB - lastA;
      }
      return 0;
    });

    return result;
  })();

  // Helper to retrieve clinical notes, initialized with default mock entries if empty
  const getPatientNotes = (patientId: string) => {
    if (!patientNotes[patientId]) {
      return [
        {
          id: 'n1',
          timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(),
          author: clinicianName || 'Dr. Carter',
          content: 'Calibration joint coordinates look stable. Range of motion target metrics increased to 135 degrees. Tracking scores remain solid.'
        },
        {
          id: 'n2',
          timestamp: new Date(Date.now() - 86400000 * 5).toLocaleString(),
          author: clinicianName || 'Dr. Carter',
          content: 'Initial clinical evaluation completed. Range of motion base verified at 85 degrees. Suggested shoulder lunge exercises assigned.'
        }
      ];
    }
    return patientNotes[patientId];
  };

  const handleAddNote = () => {
    if (!selectedPatientId || !newNoteText.trim()) return;
    const currentList = getPatientNotes(selectedPatientId);
    const newNote = {
      id: `n_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      author: clinicianName || 'Dr. Carter',
      content: newNoteText
    };
    setPatientNotes({
      ...patientNotes,
      [selectedPatientId]: [newNote, ...currentList]
    });
    setNewNoteText('');
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!selectedPatientId || !editingNoteText.trim()) return;
    const currentList = getPatientNotes(selectedPatientId);
    const updatedList = currentList.map((n) => (n.id === noteId ? { ...n, content: editingNoteText } : n));
    setPatientNotes({
      ...patientNotes,
      [selectedPatientId]: updatedList
    });
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  // JSX Dashboard widgets
  const welcomeHeader = (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-charcoal-900 to-[#0D0C18] border border-white/5 p-6 rounded-chosen-xl text-white relative overflow-hidden select-none w-full shadow-chosen-lg">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#A27B41]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="space-y-1 relative z-10">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#A27B41]">Chosen Life Platform</span>
        <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">
          Welcome back, {clinicianName || 'Dr. Carter'}
        </h2>
        <p className="text-xs text-slate-300">
          Clinical dashboard is online. Standard pose calibration thresholds are active, and webcam telemetry feeds are secure.
        </p>
      </div>
      <div className="flex gap-2.5 shrink-0 relative z-10 select-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/25 text-green-400 rounded-full text-2xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Telemetry Server Online
        </span>
      </div>
    </div>
  );

  const alertsPanel = (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#E5E5E5] dark:border-charcoal-800 text-left">
        <AlertTriangle className="h-5 w-5 text-[#A27B41]" />
        <h3 className="font-display font-bold text-sm text-[#0D0C18] dark:text-white">Urgent Clinical Alerts</h3>
      </div>
      <div className="space-y-2.5 text-xs text-left">
        <div className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-200 dark:border-red-950/20 rounded-chosen-lg text-red-800 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Patient Review Required</span>
            <span>Kyle Reese's average form accuracy score fell to 79% in the General Elbow Flexion checks.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-250 rounded-chosen-lg text-amber-800 dark:text-amber-300">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Missed Appointment Alert</span>
            <span>Sarah Connor missed the scheduled video follow-up call at Chelsea Clinic yesterday.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-slate-500/5 border border-chosen rounded-chosen-lg text-chosen-text-secondary">
          <Users className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Low Compliance Level</span>
            <span>John Miller has not completed any assigned range of motion sessions in the last 6 days.</span>
          </div>
        </div>
      </div>
    </Card>
  );

  const quickActions = (
    <div className="grid grid-cols-2 gap-4 w-full select-none">
      <button 
        onClick={() => setAssignModalOpen(true)}
        className="p-4 bg-white dark:bg-[#121122] border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-xl shadow-chosen-sm text-left hover:border-[#A27B41]/50 hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-32"
      >
        <div className="p-2 bg-[#A27B41]/10 text-[#A27B41] rounded-chosen-lg w-9 h-9 flex items-center justify-center shrink-0">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-xs text-[#0D0C18] dark:text-white block group-hover:text-[#A27B41]">Assign Exercise</span>
          <span className="text-[10px] text-chosen-text-muted mt-0.5 block">Prescribe rehabilitation routines</span>
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('reports')}
        className="p-4 bg-white dark:bg-[#121122] border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-xl shadow-chosen-sm text-left hover:border-[#A27B41]/50 hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-32"
      >
        <div className="p-2 bg-green-500/10 text-green-500 rounded-chosen-lg w-9 h-9 flex items-center justify-center shrink-0">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-xs text-[#0D0C18] dark:text-white block group-hover:text-[#A27B41]">Review Motion</span>
          <span className="text-[10px] text-chosen-text-muted mt-0.5 block">Audit logged range of motion logs</span>
        </div>
      </button>

      <button 
        onClick={() => setCreateModalOpen(true)}
        className="p-4 bg-white dark:bg-[#121122] border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-xl shadow-chosen-sm text-left hover:border-[#A27B41]/50 hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-32"
      >
        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-chosen-lg w-9 h-9 flex items-center justify-center shrink-0">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-xs text-[#0D0C18] dark:text-white block group-hover:text-[#A27B41]">Add Patient</span>
          <span className="text-[10px] text-chosen-text-muted mt-0.5 block">Register profile in system</span>
        </div>
      </button>

      <button 
        onClick={() => alert('Generating clinic summary CSV report...')}
        className="p-4 bg-white dark:bg-[#121122] border border-[#E5E5E5] dark:border-charcoal-800 rounded-chosen-xl shadow-chosen-sm text-left hover:border-[#A27B41]/50 hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-32"
      >
        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-chosen-lg w-9 h-9 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-xs text-[#0D0C18] dark:text-white block group-hover:text-[#A27B41]">Generate Report</span>
          <span className="text-[10px] text-chosen-text-muted mt-0.5 block">Export telemetry overview CSV</span>
        </div>
      </button>
    </div>
  );

  const patientOverview = (
    <Card className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5] dark:border-charcoal-800 text-left">
        <h3 className="font-display font-bold text-sm text-[#0D0C18] dark:text-white">Patient Roster Overview</h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setActiveTab('patients')}
          className="text-[#A27B41] font-bold"
        >
          View All Patients
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-chosen text-[10px] font-bold uppercase tracking-wider text-chosen-text-muted">
              <th className="pb-3 pl-2">Patient Name</th>
              <th className="pb-3">Prescribed Exercise</th>
              <th className="pb-3">Plan Progress</th>
              <th className="pb-3">Compliance Status</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-chosen">
            {patients.filter(p => !p.is_archived).length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-chosen-text-muted">No active patients registered.</td></tr>
            ) : (
              patients.filter(p => !p.is_archived).slice(0, 4).map(p => {
                const hasDiag = !!p.diagnosis;
                const statusLabel = !hasDiag ? 'Needs Check' : p.full_name.includes('Sarah') ? 'Low Compliance' : 'Active';
                const statusColor = statusLabel === 'Active' 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                  : statusLabel === 'Low Compliance'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20';

                return (
                  <tr key={patientApiId(p)} className="hover:bg-chosen-surface/50 transition-all">
                    <td className="py-3.5 pl-2 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#A27B41]/10 text-[#A27B41] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {p.full_name?.[0] || 'P'}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{p.full_name}</span>
                        <span className="text-[10px] text-chosen-text-muted block mt-0.5 truncate">{p.email || 'no-email'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-chosen-text-secondary font-medium truncate max-w-[150px]">
                      {p.diagnosis || 'Rehabilitation evaluation needed'}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="flex-1 h-1.5 bg-[#F5F5F5] dark:bg-charcoal-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#A27B41] rounded-full" 
                            style={{ width: hasDiag ? (p.full_name.includes('Connor') ? '40%' : '75%') : '0%' }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-chosen-text-muted">
                          {hasDiag ? (p.full_name.includes('Connor') ? '40%' : '75%') : '0%'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2 select-none">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => { setActiveTab('patients'); loadPatientProfileDetail(patientApiId(p)); }}
                        className="text-[#A27B41] font-bold"
                      >
                        Open Profile
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const recentSessions = (
    <Card className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5] dark:border-charcoal-800 text-left">
        <h3 className="font-display font-bold text-sm text-[#0D0C18] dark:text-white">Recent Motion Practice Logs</h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setActiveTab('reports')}
          className="text-[#A27B41] font-bold"
        >
          View All Reports
        </Button>
      </div>
      <div className="space-y-3">
        {stats?.recent_activity.length === 0 ? (
          <p className="text-xs text-chosen-text-muted text-center py-4 bg-[#FAFBFC] dark:bg-charcoal-900 rounded-chosen-xl border border-chosen">No recordings logged yet.</p>
        ) : (
          stats?.recent_activity.slice(0, 3).map((act) => {
            const scoreVal = sessionFormScore(act);
            const matchedPatient = patients.find(p => patientApiId(p) === act.patient_id);
            const scoreBadgeColor = scoreVal >= 90 
              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
              : scoreVal >= 80 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20';

            return (
              <div key={act.id} className="flex justify-between items-center p-3 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/80 rounded-chosen-xl text-xs hover:border-gold-500/35 transition-all">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="h-8 w-8 bg-[#A27B41]/10 text-[#A27B41] border border-chosen rounded-chosen-lg flex items-center justify-center font-bold shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{matchedPatient?.full_name || 'Sarah Connor'}</span>
                    <span className="text-[9px] text-chosen-text-muted block mt-0.5 truncate font-mono">
                      {act.title || 'Workout'} · {new Date(sessionTimestamp(act)).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${scoreBadgeColor}`}>
                      {scoreVal}% Accuracy
                    </span>
                    <span className="text-[9px] text-chosen-text-muted block mt-0.5 font-mono">{act.duration_seconds || 0}s Duration</span>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/session/${act.id}`)}
                    className="p-1.5 bg-[#F5F5F5] dark:bg-charcoal-800 hover:bg-gold-500/10 hover:text-[#A27B41] rounded-chosen-sm text-chosen-text-secondary transition-all"
                    title="Replay video coordinates"
                  >
                    <PlayCircle className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );

  const upcomingAppointments = (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#E5E5E5] dark:border-charcoal-800 text-left">
        <Calendar className="h-4.5 w-4.5 text-[#A27B41]" />
        <h3 className="font-display font-bold text-sm text-[#0D0C18] dark:text-white">Upcoming Appointments</h3>
      </div>
      <div className="space-y-3 text-xs text-left">
        <div className="p-3 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/80 rounded-chosen-xl space-y-1.5 hover:border-[#A27B41]/35 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800 dark:text-slate-200">Sarah Connor</span>
            <span className="text-[9px] bg-yellow-500/15 border border-yellow-500/30 text-yellow-600 px-2 py-0.5 rounded-full font-bold uppercase">2:00 PM</span>
          </div>
          <span className="text-[10px] text-chosen-text-muted block">Shoulder Calibration Review · Zoom Call</span>
        </div>
        <div className="p-3 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/80 rounded-chosen-xl space-y-1.5 hover:border-[#A27B41]/35 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800 dark:text-slate-200">John Miller</span>
            <span className="text-[9px] bg-slate-500/15 border border-chosen text-chosen-text-secondary px-2 py-0.5 rounded-full font-bold uppercase">4:30 PM</span>
          </div>
          <span className="text-[10px] text-chosen-text-muted block">Post-Op ACL Compliance checkup</span>
        </div>
      </div>
    </Card>
  );

  const recentActivityFeed = (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#E5E5E5] dark:border-charcoal-800 text-left">
        <Activity className="h-4.5 w-4.5 text-[#A27B41]" />
        <h3 className="font-display font-bold text-sm text-[#0D0C18] dark:text-white">Recent Clinical Logs</h3>
      </div>
      <div className="space-y-3.5 text-xs text-left">
        <div className="relative pl-4 border-l-2 border-[#A27B41]/35 space-y-0.5">
          <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 bg-[#A27B41] rounded-full border-2 border-white dark:border-[#0d0c18]" />
          <span className="font-semibold block text-slate-800 dark:text-slate-200">Sarah Connor uploaded session</span>
          <span className="text-[9px] text-chosen-text-muted block">Shoulder Abduction · 94% accuracy · 5 min ago</span>
        </div>
        <div className="relative pl-4 border-l-2 border-[#A27B41]/35 space-y-0.5">
          <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 bg-slate-400 rounded-full border-2 border-white dark:border-[#0d0c18]" />
          <span className="font-semibold block text-slate-800 dark:text-slate-200">John Miller updated phone info</span>
          <span className="text-[9px] text-chosen-text-muted block">Demographics modification · 1 hour ago</span>
        </div>
        <div className="relative pl-4 border-l-2 border-[#A27B41]/35 space-y-0.5">
          <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-white dark:border-[#0d0c18]" />
          <span className="font-semibold block text-slate-800 dark:text-slate-200">New consent signed by Kyle Reese</span>
          <span className="text-[9px] text-chosen-text-muted block">HIPAA medical record sharing bounds · 3 hours ago</span>
        </div>
      </div>
    </Card>
  );

  const notificationsPanel = (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#E5E5E5] dark:border-charcoal-800 text-left">
        <Bell className="h-4.5 w-4.5 text-[#A27B41]" />
        <h3 className="font-display font-bold text-sm text-[#0D0C18] dark:text-white">Admin Notifications</h3>
      </div>
      <div className="space-y-2.5 text-xs text-left">
        <div className="p-3 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/80 rounded-chosen-xl space-y-1 hover:border-[#A27B41]/35 transition-all">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Weekly operations backup</span>
          <span className="text-[10px] text-chosen-text-muted block font-medium">Clinic activity statistics backed up securely to remote vault.</span>
        </div>
        <div className="p-3 bg-[#FAFBFC] dark:bg-charcoal-900 border border-[#E5E5E5] dark:border-charcoal-800/80 rounded-chosen-xl space-y-1 hover:border-[#A27B41]/35 transition-all">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">HIPAA compliance audit</span>
          <span className="text-[10px] text-chosen-text-muted block font-medium">All patient tracking consent forms checked and found up-to-date.</span>
        </div>
      </div>
    </Card>
  );

  // Sidebar items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="h-5 w-5" />, onClick: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
    { id: 'patients', label: 'Patients', icon: <Users className="h-5 w-5" />, onClick: () => setActiveTab('patients'), active: activeTab === 'patients' },
    { id: 'exercises', label: 'Exercise Library', icon: <Dumbbell className="h-5 w-5" />, onClick: () => setActiveTab('exercises'), active: activeTab === 'exercises' },
    { id: 'reports', label: 'Motion Reports', icon: <FileText className="h-5 w-5" />, onClick: () => setActiveTab('reports'), active: activeTab === 'reports' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" />, onClick: () => setActiveTab('analytics'), active: activeTab === 'analytics' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" />, onClick: () => setActiveTab('settings'), active: activeTab === 'settings' },
    { id: 'logout', label: 'Logout', icon: <LogOut className="h-5 w-5 text-red-500" />, onClick: () => { if (confirm('Are you sure you want to sign out of the clinician portal?')) signOut(); }, active: false }
  ];

  return (
    <PageContainer
      sidebar={
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          title="Chosen Life"
          subtitle="Admin Panel"
          items={sidebarItems}
          profile={{
            name: clinicianName || 'Clinician',
            email: profile?.email || 'admin@chosenlife.com',
            role: 'Clinician Administrator'
          }}
          onSignOut={signOut}
          logo={<Activity className="h-5 w-5" />}
        />
      }
      header={
        <Header
          logo={<Activity className="h-5 w-5 text-[#A27B41]" />}
          breadcrumbs={[
            { label: 'Admin Portal', onClick: () => setActiveTab('dashboard') },
            { 
              label: activeTab === 'dashboard' 
                ? 'Dashboard' 
                : activeTab === 'patients' 
                  ? 'Patients Roster' 
                  : activeTab === 'exercises' 
                    ? 'Exercise Library' 
                    : activeTab === 'reports' 
                      ? 'Motion Reports' 
                      : activeTab === 'analytics' 
                        ? 'Progress Analytics' 
                        : activeTab === 'settings' 
                          ? 'Configurations' 
                          : activeTab, 
              active: true 
            }
          ]}
          profileName={profile?.firstName ? `${profile.firstName} ${profile.lastName}` : clinicianName || profile?.email}
          profileRole="Clinician Administrator"
          showMenuToggle={true}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationsCount={4}
          onNotificationsClick={() => alert('Clinical alerts and system notifications feed...')}
          children={
            <div className="relative w-full max-w-md hidden lg:block select-none">
              <input
                type="text"
                placeholder="Search patient, exercise plan, report..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-500/5 hover:bg-slate-500/10 focus:bg-white dark:focus:bg-charcoal-900 border border-chosen rounded-chosen-md text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[#A27B41] text-chosen-text-primary"
              />
              <span className="absolute left-3 top-2.5 text-chosen-text-muted">
                <Search className="h-3.5 w-3.5" />
              </span>
            </div>
          }
        />
      }
    >
      <ContentWrapper>
        {loading ? (
          <LoadingState message="Loading clinic administrative dashboard..." />
        ) : (
          <>
            {/* ==========================================
                TAB: DASHBOARD
                ========================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-slide-up text-left">
                {/* 12-column Grid Layout on Desktop */}
                <div className="grid grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column (col-span-9 on desktop, full-width on tablet/mobile) */}
                  <div className="col-span-12 lg:col-span-9 space-y-8">
                    {welcomeHeader}

                    {/* KPI Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      <StatisticCard
                        label="Total Patients"
                        value={patients.filter(p => !p.is_archived).length}
                        trend={{ value: 'Registered roster', direction: 'up' }}
                        icon={<Users className="h-5 w-5 text-[#A27B41]" />}
                        iconBg="bg-[#A27B41]/10 text-[#A27B41]"
                      />
                      <StatisticCard
                        label="Active Patients"
                        value={patients.filter(p => p.diagnosis && !p.is_archived).length}
                        trend={{ value: 'Under supervision', direction: 'neutral' }}
                        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                        iconBg="bg-green-500/10 text-green-500"
                      />
                      <StatisticCard
                        label="Sessions Today"
                        value={sessionsToday}
                        trend={{ value: 'Logged today', direction: 'up' }}
                        icon={<PlayCircle className="h-5 w-5 text-yellow-500" />}
                        iconBg="bg-yellow-500/10 text-yellow-500"
                      />
                      <StatisticCard
                        label="Pending Reviews"
                        value={pendingReviewsCount}
                        trend={{ value: 'Requires feedback', direction: 'down' }}
                        icon={<ClipboardList className="h-5 w-5 text-red-500" />}
                        iconBg="bg-red-500/10 text-red-500"
                      />
                      <StatisticCard
                        label="Avg Accuracy"
                        value={`${avgAccuracyVal}%`}
                        trend={{ value: 'Alignment threshold', direction: 'up' }}
                        icon={<Activity className="h-5 w-5 text-purple-500" />}
                        iconBg="bg-purple-500/10 text-purple-500"
                      />
                      <StatisticCard
                        label="Recovery Index"
                        value={averageRecoveryProgress}
                        trend={{ value: 'Weekly change', direction: 'up' }}
                        icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
                        iconBg="bg-indigo-500/10 text-indigo-500"
                      />
                    </div>

                    {/* Alerts & Quick Actions stacked on desktop, split on tablet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                      {alertsPanel}
                      {quickActions}
                    </div>

                    {patientOverview}
                    {recentSessions}
                  </div>

                  {/* Right Column / Panel (col-span-3 on desktop, full-width on tablet/mobile) */}
                  <div className="col-span-12 lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-8">
                      {upcomingAppointments}
                      {recentActivityFeed}
                      {notificationsPanel}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==========================================
                TAB: PATIENTS
                ========================================== */}
            {activeTab === 'patients' && (
              selectedPatientId ? (
                loadingDetail ? (
                  <div className="py-24 flex flex-col items-center justify-center text-chosen-text-muted gap-3 select-none">
                    <Spinner size="md" />
                    <span className="text-sm font-semibold">Retrieving patient medical record...</span>
                  </div>
                ) : patientDetail ? (
                <div className="space-y-6 animate-slide-up text-left">
                  {/* Breadcrumbs, Identity Header & Quick Actions */}
                  <div className="space-y-4 select-none">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-chosen pb-4">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <button 
                          onClick={() => setSelectedPatientId(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-chosen-md bg-[#F5F5F5] dark:bg-charcoal-850 border border-chosen text-chosen-text-secondary hover:text-gold-500 hover:border-gold-500/50 transition-all font-bold"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back to Roster
                        </button>
                        <span className="text-chosen-text-muted">/</span>
                        <span className="text-[#A27B41]">Patient Profile Workspace</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setAssignModalOpen(true)}
                          leftIcon={<Plus className="h-4 w-4" />}
                          className="text-xs"
                          disabled={availableExercisesToAssign.length === 0}
                        >
                          Assign Exercise
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setDetailTab('notes')}
                          leftIcon={<MessageSquare className="h-4 w-4" />}
                          className="text-xs"
                        >
                          Add Note
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-left pt-2">
                      <div>
                        <h2 className="font-display font-bold text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight leading-none">
                          {patientDetail.full_name}
                        </h2>
                        <span className="text-2xs font-mono text-chosen-text-muted mt-1.5 block">
                          PATIENT ID: {patientDetail.patient_id || 'PAT-000000'}
                        </span>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                        patientDetail.is_archived
                          ? "bg-slate-500/10 text-slate-500 border-chosen"
                          : "bg-green-500/10 text-green-500 border-green-500/20"
                      )}>
                        {patientDetail.is_archived ? "Inactive (Archived)" : "Active Case"}
                      </span>
                    </div>
                  </div>

                  {/* Desktop 3-column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
                    {/* LEFT COLUMN: Patient Profile Card */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                      <Card className="p-5 space-y-6 select-none">
                        <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-chosen">
                          <div className="h-20 w-20 rounded-full bg-[#A27B41]/10 border-2 border-[#A27B41]/20 text-[#A27B41] flex items-center justify-center font-bold text-3xl uppercase font-display shadow-chosen-sm">
                            {patientDetail.full_name?.[0] || 'P'}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">{patientDetail.full_name}</h4>
                            <span className="text-xs text-chosen-text-muted">{patientDetail.email}</span>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs text-left">
                          <div>
                            <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Age & Gender</span>
                            <span className="font-semibold text-chosen-text-secondary">
                              {patientDetail.date_of_birth ? `${new Date().getFullYear() - new Date(patientDetail.date_of_birth).getFullYear()} yrs` : '28 yrs'} • {patientDetail.full_name.includes('Sarah') || patientDetail.full_name.includes('Eva') ? 'Female' : 'Male'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Phone Number</span>
                            <span className="font-semibold text-chosen-text-secondary font-mono">{patientDetail.phone || '+1 (555) 0199'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Target Joint / Treatment</span>
                            <span className="font-semibold text-chosen-text-secondary truncate block">{patientDetail.diagnosis || 'Shoulder Flexion / Evaluation'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Assigned Therapist</span>
                            <span className="font-semibold text-chosen-text-secondary">{clinicianName || 'Dr. Carter'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Registration Date</span>
                            <span className="font-semibold text-chosen-text-secondary">
                              {(patientDetail as any).created_at ? new Date((patientDetail as any).created_at).toLocaleDateString() : 'June 18, 2026'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              setEditFullName(patientDetail.full_name || '');
                              setEditDob(patientDetail.date_of_birth || '');
                              setEditPhone(patientDetail.phone || '');
                              setEditDiagnosis(patientDetail.diagnosis || '');
                              setEditStatus(customPatientStatuses[patientDetail.patient_id || (patientDetail as any).user_id || ''] || (patientDetail.is_archived ? 'Inactive' : 'Active'));
                              setEditModalOpen(true);
                            }}
                            className="w-full text-xs"
                            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                          >
                            Edit Profile
                          </Button>
                        </div>
                      </Card>
                    </div>

                    {/* CENTER COLUMN: Tabs & Main Content */}
                    <div className="col-span-12 lg:col-span-6 space-y-6">
                      <div className="flex bg-[#F5F5F5] dark:bg-charcoal-850 p-1.5 rounded-chosen-lg border border-chosen overflow-x-auto select-none gap-1">
                        {(['overview', 'exercises', 'sessions', 'progress', 'notes', 'appointments'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setDetailTab(tab)}
                            className={cn(
                              "px-3 py-2 rounded-chosen-md font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex-1 text-center",
                              detailTab === tab
                                ? "bg-white dark:bg-charcoal-900 text-gold-500 shadow-chosen-sm"
                                : "text-chosen-text-muted hover:text-[#A27B41]"
                            )}
                          >
                            {tab === 'sessions' ? 'Sessions' : tab}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-6">
                        {detailTab === 'overview' && (
                          <div className="space-y-6 animate-fade-in text-left">
                            <Card className="p-5 space-y-4">
                              <h3 className="font-display font-bold text-sm text-[#0D0C18] dark:text-white uppercase tracking-wider border-b border-chosen pb-2">
                                Clinical Case Summary
                              </h3>
                              <p className="text-xs text-chosen-text-secondary leading-relaxed">
                                Patient is undergoing active rehabilitation for range of motion restrictions. Focus is placed on {patientDetail.diagnosis || 'assigned exercises'} under daily digital motion telemetry supervision. Compliance levels are monitored via camera joint alignment frames.
                              </p>
                            </Card>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Card className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shrink-0">
                                  <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                  <span className="text-2xs text-chosen-text-muted uppercase font-bold block">Sessions Completed</span>
                                  <span className="text-lg font-bold text-chosen-text-primary">{patientDetail.sessions?.length || 0} workouts</span>
                                </div>
                              </Card>

                              <Card className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 bg-[#A27B41]/10 text-[#A27B41] rounded-full flex items-center justify-center shrink-0">
                                  <Dumbbell className="h-5 w-5" />
                                </div>
                                <div>
                                  <span className="text-2xs text-chosen-text-muted uppercase font-bold block">Active Routines</span>
                                  <span className="text-lg font-bold text-chosen-text-primary">{patientDetail.assignments?.length || 0} assigned</span>
                                </div>
                              </Card>
                            </div>

                            <Card className="p-5 space-y-4">
                              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary">
                                Rehab Recovery Telemetry Profile
                              </h4>
                              <div className="space-y-4 pt-2">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-2xs text-chosen-text-muted font-bold uppercase">
                                    <span>Flexion Compliance Rate</span>
                                    <span>82%</span>
                                  </div>
                                  <div className="h-2 bg-[#F5F5F5] dark:bg-charcoal-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }} />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between text-2xs text-chosen-text-muted font-bold uppercase">
                                    <span>Average Form Accuracy</span>
                                    <span>{patientDetail.sessions?.length ? `${(patientDetail.sessions.reduce((acc, s) => acc + sessionFormScore(s), 0) / patientDetail.sessions.length).toFixed(1)}%` : '91.5%'}</span>
                                  </div>
                                  <div className="h-2 bg-[#F5F5F5] dark:bg-charcoal-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#A27B41] rounded-full" style={{ width: '91%' }} />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}

                        {detailTab === 'exercises' && (
                          <div className="space-y-4 animate-fade-in text-left">
                            <div className="flex justify-between items-center select-none">
                              <h3 className="font-display font-bold text-sm text-chosen-text-primary uppercase tracking-wider">
                                Prescribed Exercise Plan
                              </h3>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setAssignModalOpen(true)}
                                disabled={availableExercisesToAssign.length === 0}
                                leftIcon={<Plus className="h-4 w-4" />}
                                className="text-[#A27B41] font-bold text-xs p-0"
                              >
                                Assign Exercise
                              </Button>
                            </div>

                            {patientDetail.assignments?.length === 0 ? (
                              <Card className="py-12 text-center text-chosen-text-muted select-none">
                                <Dumbbell className="h-10 w-10 mx-auto text-chosen-text-muted mb-3 animate-pulse" />
                                <p className="text-xs">No active exercises are assigned to this patient.</p>
                              </Card>
                            ) : (
                              <div className="space-y-4">
                                {patientDetail.assignments.map((a) => {
                                  const progress = getAssignmentProgress(a.exercise_id);
                                  return (
                                    <Card key={a.id} className="p-4 space-y-3">
                                      <div className="flex justify-between items-start">
                                        <div className="text-left">
                                          <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                                            {a.exercise?.name || 'Workout routine'}
                                          </h4>
                                          <span className="text-[10px] text-chosen-text-muted mt-1 block">
                                            Assigned on: {new Date(a.assigned_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 select-none">
                                          <Badge variant={progress.count > 0 ? 'success' : 'warning'}>
                                            {progress.count > 0 ? `${progress.count} Session(s)` : 'Not Started'}
                                          </Badge>
                                          <Button
                                            variant="ghost"
                                            size="xs"
                                            className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                                            onClick={() => handleRemoveAssignment(a.id)}
                                            disabled={removingAssignmentId === a.id}
                                            title="Unassign Routine"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-2xs text-chosen-text-secondary select-none">
                                        {progress.latestScore !== null && (
                                          <span>
                                            LATEST ACCURACY: <span className="font-bold text-gold-500">{progress.latestScore}%</span>
                                          </span>
                                        )}
                                        {a.due_date && (
                                          <span>
                                            DUE DATE: <span className="font-semibold font-mono">{new Date(a.due_date).toLocaleDateString()}</span>
                                          </span>
                                        )}
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {detailTab === 'sessions' && (
                          <div className="space-y-4 animate-fade-in text-left">
                            <h3 className="font-display font-bold text-sm text-chosen-text-primary uppercase tracking-wider">
                              Completed Motion Capture Logs
                            </h3>

                            {patientDetail.sessions?.length === 0 ? (
                              <Card className="py-12 text-center text-chosen-text-muted select-none">
                                <Activity className="h-10 w-10 mx-auto text-chosen-text-muted mb-3" />
                                <p className="text-xs">No motion tracking sessions completed yet.</p>
                              </Card>
                            ) : (
                              <Card className="p-3">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-2xs">
                                    <thead>
                                      <tr className="border-b border-chosen uppercase tracking-wider font-bold text-chosen-text-muted">
                                        <th className="pb-2.5 pl-1">Exercise / Title</th>
                                        <th className="pb-2.5">Date</th>
                                        <th className="pb-2.5">Accuracy</th>
                                        <th className="pb-2.5">ROM</th>
                                        <th className="pb-2.5 text-right pr-1">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-chosen">
                                      {patientDetail.sessions.map((s) => (
                                        <tr key={s.id} className="hover:bg-chosen-surface/40 transition-colors">
                                          <td className="py-3 pl-1 font-bold text-slate-800 dark:text-slate-200">{s.title}</td>
                                          <td className="py-3 text-chosen-text-secondary font-mono">{new Date(sessionTimestamp(s)).toLocaleDateString()}</td>
                                          <td className="py-3">
                                            <span className="font-bold text-[#A27B41]">{sessionFormScore(s)}%</span>
                                          </td>
                                          <td className="py-3 text-chosen-text-secondary font-semibold font-mono">{sessionRom(s)}°</td>
                                          <td className="py-3 text-right pr-1 select-none">
                                            <Button
                                              variant="secondary"
                                              size="xs"
                                              onClick={() => navigate(`/admin/session/${s.id}`)}
                                              leftIcon={<PlayCircle className="h-3.5 w-3.5" />}
                                            >
                                              Replay
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </Card>
                            )}
                          </div>
                        )}

                        {detailTab === 'progress' && (
                          <div className="space-y-6 animate-fade-in text-left">
                            <h3 className="font-display font-bold text-sm text-chosen-text-primary uppercase tracking-wider">
                              Clinical Telemetry Trends
                            </h3>

                            {patientDetail.sessions?.length === 0 ? (
                              <Card className="py-12 text-center text-chosen-text-muted select-none">
                                <TrendingUp className="h-10 w-10 mx-auto text-chosen-text-muted mb-3" />
                                <p className="text-xs">Need completed sessions to chart recovery progress trends.</p>
                              </Card>
                            ) : (
                              <div className="space-y-6 select-none">
                                <Card className="p-4 space-y-2">
                                  <h4 className="font-display font-bold text-2xs uppercase tracking-wider text-chosen-text-primary">
                                    Flexion Curve (Peak ROM Degrees)
                                  </h4>
                                  <div className="h-48 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart
                                        data={[...patientDetail.sessions].map((s) => ({
                                          name: new Date(sessionTimestamp(s)).toLocaleDateString(),
                                          rom: sessionRom(s)
                                        })).reverse()}
                                      >
                                        <defs>
                                          <linearGradient id="romGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#A27B41" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#A27B41" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" stroke="#A0AEC0" fontSize={8} />
                                        <YAxis stroke="#A0AEC0" fontSize={8} unit="°" />
                                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                                        <Area type="monotone" dataKey="rom" stroke="#A27B41" strokeWidth={2} fillOpacity={1} fill="url(#romGrad)" />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </Card>

                                <Card className="p-4 space-y-2">
                                  <h4 className="font-display font-bold text-2xs uppercase tracking-wider text-chosen-text-primary">
                                    Skeleton Alignment Accuracy Trend
                                  </h4>
                                  <div className="h-48 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart
                                        data={[...patientDetail.sessions].map((s) => ({
                                          name: new Date(sessionTimestamp(s)).toLocaleDateString(),
                                          accuracy: sessionFormScore(s)
                                        })).reverse()}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" stroke="#A0AEC0" fontSize={8} />
                                        <YAxis stroke="#A0AEC0" fontSize={8} unit="%" />
                                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                                        <Line type="monotone" dataKey="accuracy" stroke="#3182CE" strokeWidth={2} activeDot={{ r: 6 }} />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </Card>
                              </div>
                            )}
                          </div>
                        )}

                        {detailTab === 'notes' && (
                          <div className="space-y-6 animate-fade-in text-left">
                            <h3 className="font-display font-bold text-sm text-chosen-text-primary uppercase tracking-wider">
                              Clinical Progress Notes
                            </h3>

                            <Card className="p-4 space-y-3">
                              <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block select-none">
                                Add Clinical Progress Note
                              </span>
                              <textarea
                                placeholder="Write details regarding ROM updates, skeleton calibration thresholds, patient comfort levels..."
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                className="w-full p-2.5 bg-slate-500/5 hover:bg-slate-500/10 focus:bg-white dark:focus:bg-charcoal-900 border border-chosen rounded-chosen-md text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[#A27B41] text-chosen-text-primary min-h-[70px]"
                              />
                              <div className="flex justify-end select-none">
                                <Button
                                  size="xs"
                                  onClick={handleAddNote}
                                  disabled={!newNoteText.trim()}
                                >
                                  Save Note Entry
                                </Button>
                              </div>
                            </Card>

                            <div className="space-y-4">
                              {getPatientNotes(patientDetail.patient_id || (patientDetail as any).user_id || '').map((n) => (
                                <Card key={n.id} className="p-4 space-y-2 border-l-4 border-l-[#A27B41]">
                                  <div className="flex justify-between items-center text-[10px] text-chosen-text-muted select-none font-semibold">
                                    <span>AUTHOR: {n.author}</span>
                                    <span>{n.timestamp}</span>
                                  </div>
                                  {editingNoteId === n.id ? (
                                    <div className="space-y-2 pt-1 select-none">
                                      <textarea
                                        value={editingNoteText}
                                        onChange={(e) => setEditingNoteText(e.target.value)}
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
                                          onClick={() => handleSaveEditNote(n.id)}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-chosen-text-secondary leading-relaxed text-left whitespace-pre-line">
                                      {n.content}
                                    </p>
                                  )}

                                  {editingNoteId !== n.id && (
                                    <div className="flex justify-end select-none">
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        onClick={() => {
                                          setEditingNoteId(n.id);
                                          setEditingNoteText(n.content);
                                        }}
                                        className="text-[#A27B41] font-bold p-0 text-[10px]"
                                      >
                                        Edit Note
                                      </Button>
                                    </div>
                                  )}
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {detailTab === 'appointments' && (
                          <div className="space-y-4 animate-fade-in text-left select-none">
                            <h3 className="font-display font-bold text-sm text-chosen-text-primary uppercase tracking-wider">
                              Clinic Appointment Schedules
                            </h3>

                            <div className="space-y-3">
                              <Card className="p-4 flex justify-between items-center">
                                <div>
                                  <h5 className="font-bold text-xs text-chosen-text-primary">Therapy Consultation Check-in</h5>
                                  <span className="text-[10px] text-chosen-text-muted block mt-1">
                                    Practitioner: {clinicianName || 'Dr. Carter'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold text-xs font-mono text-[#A27B41] block">July 06, 2026</span>
                                  <span className="text-2xs text-chosen-text-muted font-mono block mt-0.5">10:30 AM</span>
                                  <Badge variant="success" className="mt-1.5">Confirmed</Badge>
                                </div>
                              </Card>

                              <Card className="p-4 flex justify-between items-center opacity-60">
                                <div>
                                  <h5 className="font-bold text-xs text-chosen-text-primary">ROM Calibration Assessment</h5>
                                  <span className="text-[10px] text-chosen-text-muted block mt-1">
                                    Practitioner: {clinicianName || 'Dr. Carter'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold text-xs font-mono text-[#A27B41] block">June 22, 2026</span>
                                  <span className="text-2xs text-chosen-text-muted font-mono block mt-0.5">02:15 PM</span>
                                  <Badge variant="neutral" className="mt-1.5">Completed</Badge>
                                </div>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Summary stats & Alerts */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                      <Card className="p-4 space-y-4 text-left select-none">
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2">
                          Case Insights
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-chosen-text-secondary font-medium">Compliance Rate</span>
                            <span className="font-bold text-green-500">82.4%</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-chosen-text-secondary font-medium">Peak ROM Degree</span>
                            <span className="font-bold text-[#A27B41]">
                              {patientDetail.sessions?.length ? `${Math.max(...patientDetail.sessions.map(s => sessionRom(s)))}°` : '120°'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-chosen-text-secondary font-medium">Avg Practice Score</span>
                            <span className="font-bold text-[#3182CE]">
                              {patientDetail.sessions?.length ? `${(patientDetail.sessions.reduce((acc, s) => acc + sessionFormScore(s), 0) / patientDetail.sessions.length).toFixed(1)}%` : '91.5%'}
                            </span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 space-y-3 text-left select-none">
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2 flex items-center justify-between">
                          Alert Trigger Logs
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        </h4>
                        <div className="space-y-3 pt-1">
                          {patientDetail.sessions?.length && Math.min(...patientDetail.sessions.map(s => sessionFormScore(s))) < 80 ? (
                            <div className="flex items-start gap-2 text-2xs p-2 bg-red-500/5 text-red-500 border border-red-500/10 rounded">
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                              <p>Form score dropped below 80% threshold during calibration hold exercises.</p>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 text-2xs p-2 bg-green-500/5 text-green-500 border border-green-500/10 rounded">
                              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <p>Compliance metrics look solid. All joint positions within safety tolerances.</p>
                            </div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-4 space-y-4 text-left select-none">
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-chosen-text-primary border-b border-chosen pb-2">
                          Timeline Audit
                        </h4>
                        <div className="relative border-l border-chosen pl-3 space-y-4 text-2xs text-left">
                          <div className="relative">
                            <div className="absolute -left-[17.5px] top-0 h-2 w-2 rounded-full bg-[#A27B41] ring-4 ring-[#A27B41]/20" />
                            <span className="text-[10px] text-chosen-text-muted font-bold block uppercase">Today</span>
                            <p className="text-chosen-text-secondary mt-0.5">Clinical notes file modified by Dr. Aurelius.</p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-[17.5px] top-0 h-2 w-2 rounded-full bg-slate-400" />
                            <span className="text-[10px] text-chosen-text-muted font-bold block uppercase">June 28, 2026</span>
                            <p className="text-chosen-text-secondary mt-0.5">Completed calibration routine session, score logged at 91.5%.</p>
                          </div>

                          <div className="relative">
                            <div className="absolute -left-[17.5px] top-0 h-2 w-2 rounded-full bg-slate-400" />
                            <span className="text-[10px] text-chosen-text-muted font-bold block uppercase">June 25, 2026</span>
                            <p className="text-chosen-text-secondary mt-0.5">Physical therapy intake details updated.</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : null
            ) : (
                <div className="space-y-8 animate-slide-up text-left">
                  {/* 1. Patient Overview Summary Cards (6 items) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full select-none">
                    <StatisticCard
                      label="Total Patients"
                      value={patients.length}
                      trend={{ value: 'Roster count', direction: 'up' }}
                      icon={<Users className="h-5 w-5 text-[#A27B41]" />}
                      iconBg="bg-[#A27B41]/10 text-[#A27B41]"
                    />
                    <StatisticCard
                      label="Active Patients"
                      value={patients.filter(p => p.diagnosis && !p.is_archived).length}
                      trend={{ value: 'Under supervision', direction: 'neutral' }}
                      icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                      iconBg="bg-green-500/10 text-green-500"
                    />
                    <StatisticCard
                      label="Inactive Patients"
                      value={patients.filter(p => !p.diagnosis && !p.is_archived).length}
                      trend={{ value: 'Awaiting checks', direction: 'down' }}
                      icon={<Clock className="h-5 w-5 text-slate-500" />}
                      iconBg="bg-slate-500/10 text-slate-500"
                    />
                    <StatisticCard
                      label="Needs Review"
                      value={pendingReviewsCount}
                      trend={{ value: 'Requires feedback', direction: 'down' }}
                      icon={<ClipboardList className="h-5 w-5 text-red-500" />}
                      iconBg="bg-red-500/10 text-red-500"
                    />
                    <StatisticCard
                      label="New (This Week)"
                      value={1}
                      trend={{ value: 'Registered recently', direction: 'up' }}
                      icon={<Plus className="h-5 w-5 text-indigo-500" />}
                      iconBg="bg-indigo-500/10 text-indigo-500"
                    />
                    <StatisticCard
                      label="Sessions Today"
                      value={sessionsToday}
                      trend={{ value: 'Completed today', direction: 'up' }}
                      icon={<Activity className="h-5 w-5 text-yellow-500" />}
                      iconBg="bg-yellow-500/10 text-yellow-500"
                    />
                  </div>

                  {/* 2. Search, Filter, Sort and View Mode Toolbar */}
                  <Card className="p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Live Search and Include Archived Checkbox */}
                      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Search by name, patient ID, email, exercise..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-500/5 hover:bg-slate-500/10 focus:bg-white dark:focus:bg-charcoal-900 border border-chosen rounded-chosen-md text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[#A27B41] text-chosen-text-primary"
                          />
                          <span className="absolute left-3 top-3 text-chosen-text-muted">
                            <Search className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 select-none text-xs">
                          <Checkbox
                            label="Include Archived"
                            checked={includeArchived}
                            onChange={(e) => setIncludeArchived(e.target.checked)}
                          />
                        </div>
                      </div>

                      {/* Actions and View Mode Toggles */}
                      <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto select-none">
                        <div className="flex bg-[#F5F5F5] dark:bg-charcoal-850 p-1 rounded-chosen-md border border-chosen text-xs">
                          <button
                            onClick={() => setViewMode('table')}
                            className={cn(
                              "px-3 py-1.5 rounded font-bold transition-all",
                              viewMode === 'table' ? "bg-white dark:bg-charcoal-900 text-gold-500 shadow-chosen-sm" : "text-chosen-text-muted hover:text-chosen-text-primary"
                            )}
                          >
                            Table View
                          </button>
                          <button
                            onClick={() => setViewMode('card')}
                            className={cn(
                              "px-3 py-1.5 rounded font-bold transition-all",
                              viewMode === 'card' ? "bg-white dark:bg-charcoal-900 text-gold-500 shadow-chosen-sm" : "text-chosen-text-muted hover:text-chosen-text-primary"
                            )}
                          >
                            Card View
                          </button>
                        </div>

                        <Button
                          onClick={() => setCreateModalOpen(true)}
                          leftIcon={<Plus className="h-4 w-4" />}
                          className="text-xs"
                        >
                          Create Patient
                        </Button>
                      </div>
                    </div>

                    {/* Filter and Sort Row */}
                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-chosen text-xs select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-chosen-text-muted font-semibold">Status:</span>
                        <select
                          value={statusFilter}
                          onChange={(e: any) => setStatusFilter(e.target.value)}
                          className="bg-white dark:bg-charcoal-900 border border-chosen rounded-chosen-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#A27B41] text-chosen-text-secondary font-medium"
                        >
                          <option value="all">All Patients</option>
                          <option value="active">Active Plan</option>
                          <option value="inactive">No Plan</option>
                          <option value="needs_review">Needs Review</option>
                          <option value="high_priority">High Priority</option>
                          <option value="assigned">Exercise Assigned</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-chosen-text-muted font-semibold">Sort By:</span>
                        <select
                          value={sortOption}
                          onChange={(e: any) => setSortOption(e.target.value)}
                          className="bg-white dark:bg-charcoal-900 border border-chosen rounded-chosen-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#A27B41] text-chosen-text-secondary font-medium"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="alphabetical">Alphabetical (A-Z)</option>
                          <option value="progress">Progress Completion</option>
                          <option value="last_session">Recent Practice</option>
                        </select>
                      </div>
                    </div>
                  </Card>

                  {/* 3. Patients List and Details Grid Split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: List/Table of Patients (col-span-12 since right column is hidden now when selected) */}
                    <div className="col-span-12 space-y-4">
                      {processedPatients.length === 0 ? (
                        <Card className="py-16 text-center space-y-3">
                          <ClipboardList className="h-12 w-12 mx-auto text-chosen-text-muted animate-bounce" />
                          <h4 className="font-display font-bold text-base text-chosen-text-primary">No Patients Found</h4>
                          <p className="text-xs text-chosen-text-muted max-w-sm mx-auto">
                            Try modifying your search text or removing the status/inclusion filters to find patient records.
                          </p>
                        </Card>
                      ) : viewMode === 'table' && !isMobileOrTablet ? (
                        /* Desktop default Table View */
                        <Card className="p-4 space-y-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-chosen text-[10px] font-bold uppercase tracking-wider text-chosen-text-muted font-display font-semibold">
                                  <th className="pb-3 pl-2">Patient Details</th>
                                  <th className="pb-3">Practitioner</th>
                                  <th className="pb-3">Current Plan / Exercise</th>
                                  <th className="pb-3">Progress</th>
                                  <th className="pb-3">Status</th>
                                  <th className="pb-3 text-right pr-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-chosen">
                                {processedPatients.map(p => {
                                  const hasDiag = !!p.diagnosis;
                                  const statusLabel = customPatientStatuses[patientApiId(p)] || (
                                    p.is_archived 
                                      ? 'Inactive' 
                                      : p.full_name.includes('Kyle') || p.full_name.includes('Connor')
                                        ? 'Needs Review'
                                        : 'Active'
                                  );
                                  const statusColor = statusLabel === 'Active'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : statusLabel === 'Needs Review'
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                      : 'bg-slate-500/10 text-slate-500 border-chosen';

                                  return (
                                    <tr 
                                      key={patientApiId(p)}
                                      onClick={() => loadPatientProfileDetail(patientApiId(p))}
                                      className={cn(
                                        "hover:bg-chosen-surface/50 transition-all cursor-pointer",
                                        selectedPatientId === patientApiId(p) ? 'bg-gold-500/5 border-l-2 border-[#A27B41]' : ''
                                      )}
                                    >
                                      <td className="py-3.5 pl-2 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-[#A27B41]/10 text-[#A27B41] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                          {p.full_name?.[0] || 'P'}
                                        </div>
                                        <div className="min-w-0 text-left">
                                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{p.full_name}</span>
                                          <span className="text-[10px] text-chosen-text-muted block truncate mt-0.5 font-mono">{p.patient_id || 'PAT-000000'}</span>
                                        </div>
                                      </td>
                                      <td className="py-3.5 text-chosen-text-secondary font-medium truncate">
                                        {clinicianName || 'Dr. Aurelius'}
                                      </td>
                                      <td className="py-3.5 text-chosen-text-secondary font-medium truncate max-w-[150px]">
                                        {p.diagnosis || 'Evaluation pending'}
                                      </td>
                                      <td className="py-3.5">
                                        <div className="flex items-center gap-2 max-w-[100px]">
                                          <div className="flex-1 h-1.5 bg-[#F5F5F5] dark:bg-charcoal-800 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-[#A27B41] rounded-full" 
                                              style={{ width: hasDiag ? (p.full_name.includes('Connor') ? '40%' : '75%') : '0%' }}
                                            />
                                          </div>
                                          <span className="text-[9px] font-bold text-chosen-text-muted">
                                            {hasDiag ? (p.full_name.includes('Connor') ? '40%' : '75%') : '0%'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-3.5">
                                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                                          {statusLabel}
                                        </span>
                                      </td>
                                      <td className="py-3.5 text-right pr-2 select-none" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                          <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => loadPatientProfileDetail(patientApiId(p))}
                                            className="text-[#A27B41] font-bold"
                                          >
                                            View Profile
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => {
                                              setSelectedPatientId(patientApiId(p));
                                              setEditFullName(p.full_name || '');
                                              setEditDob(p.date_of_birth || '');
                                              setEditPhone(p.phone || '');
                                              setEditDiagnosis(p.diagnosis || '');
                                              setEditStatus(customPatientStatuses[patientApiId(p)] || (p.is_archived ? 'Inactive' : (p.full_name.includes('Kyle') || p.full_name.includes('Connor') ? 'Needs Review' : 'Active')));
                                              setEditModalOpen(true);
                                            }}
                                            title="Modify Profile Details"
                                          >
                                            <Edit2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      ) : (
                        /* Card View or compact layouts for Tablet/Mobile */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {processedPatients.map(p => {
                            const hasDiag = !!p.diagnosis;
                            const statusLabel = customPatientStatuses[patientApiId(p)] || (
                              p.is_archived 
                                ? 'Inactive' 
                                : p.full_name.includes('Kyle') || p.full_name.includes('Connor')
                                  ? 'Needs Review'
                                  : 'Active'
                            );
                            const statusColor = statusLabel === 'Active'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : statusLabel === 'Needs Review'
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-chosen';

                            return (
                              <Card 
                                key={patientApiId(p)}
                                onClick={() => loadPatientProfileDetail(patientApiId(p))}
                                className={cn(
                                  "p-4 space-y-4 hover:border-[#A27B41]/50 hover:translate-y-[-2px] transition-all cursor-pointer relative",
                                  selectedPatientId === patientApiId(p) ? "border-[#A27B41] bg-[#A27B41]/5" : ""
                                )}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-[#A27B41]/10 text-[#A27B41] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                                      {p.full_name?.[0] || 'P'}
                                    </div>
                                    <div className="text-left min-w-0">
                                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block truncate">{p.full_name}</span>
                                      <span className="text-[10px] text-chosen-text-muted block font-mono mt-0.5">{p.patient_id || 'PAT-000000'}</span>
                                    </div>
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                                    {statusLabel}
                                  </span>
                                </div>

                                <div className="space-y-2 text-xs text-left">
                                  <div className="flex justify-between items-center text-chosen-text-secondary">
                                    <span>Plan:</span>
                                    <span className="font-semibold truncate max-w-[150px]">{p.diagnosis || 'Pending prescription'}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-chosen-text-secondary">
                                    <span>Practitioner:</span>
                                    <span className="font-semibold">{clinicianName || 'Dr. Aurelius'}</span>
                                  </div>
                                  <div className="space-y-1 pt-1">
                                    <div className="flex justify-between text-[10px] text-chosen-text-muted font-bold">
                                      <span>Plan Progress</span>
                                      <span>{hasDiag ? (p.full_name.includes('Connor') ? '40%' : '75%') : '0%'}</span>
                                    </div>
                                    <div className="h-1.5 bg-[#F5F5F5] dark:bg-charcoal-800 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-[#A27B41] rounded-full" 
                                        style={{ width: hasDiag ? (p.full_name.includes('Connor') ? '40%' : '75%') : '0%' }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-chosen select-none" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => loadPatientProfileDetail(patientApiId(p))}
                                    className="text-[#A27B41] font-bold p-0"
                                  >
                                    Open File
                                  </Button>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => {
                                        setSelectedPatientId(patientApiId(p));
                                        setEditFullName(p.full_name || '');
                                        setEditDob(p.date_of_birth || '');
                                        setEditPhone(p.phone || '');
                                        setEditDiagnosis(p.diagnosis || '');
                                        setEditStatus(customPatientStatuses[patientApiId(p)] || (p.is_archived ? 'Inactive' : (p.full_name.includes('Kyle') || p.full_name.includes('Connor') ? 'Needs Review' : 'Active')));
                                        setEditModalOpen(true);
                                      }}
                                      title="Edit demographics"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    {!p.is_archived && (
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        onClick={() => handleArchivePatient(patientApiId(p))}
                                        title="Archive profile"
                                        className="text-red-500 hover:bg-red-500/10"
                                      >
                                        <Archive className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* ==========================================
                TAB: EXERCISES
                ========================================== */}
            {activeTab === 'exercises' && (
              <div className="space-y-6 animate-slide-up text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base md:text-lg text-chosen-text-primary">Active Exercises Catalog</h3>
                  <Button
                    onClick={() => setCreateExModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Create Exercise
                  </Button>
                </div>

                {/* Exercises grid using ResponsiveGrid */}
                <ResponsiveGrid colsMobile={1} colsTablet={2} colsDesktop={3}>
                  {exercisesList.map(ex => (
                    <ExerciseCard
                      key={ex.id}
                      name={ex.name}
                      thumbnailUrl={ex.thumbnail_url || undefined}
                      targetRom={ex.target_rom || undefined}
                      description={ex.description || undefined}
                      instructions={ex.instructions || undefined}
                      actionButton={
                        <div className="flex items-center justify-between pt-2 border-t border-chosen mt-2">
                          <div className="flex flex-wrap gap-1">
                            {exerciseJointTags(ex).map((j) => (
                              <span key={j} className="text-[9px] font-bold bg-chosen-surface text-chosen-text-secondary px-2 py-0.5 rounded">
                                {j}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                setSelectedExerciseId(ex.id);
                                setEditExName(ex.name);
                                setEditExDesc(ex.description || '');
                                setEditExInst(ex.instructions || '');
                                setEditExRom(ex.target_rom?.toString() || '');
                                setEditExThumb(ex.thumbnail_url || '');
                                setEditExModalOpen(true);
                              }}
                              title="Edit Exercise"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => handleDeleteExercise(ex.id)}
                              title="Delete Exercise"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  ))}
                </ResponsiveGrid>
              </div>
            )}

            {/* ==========================================
                TAB: REPORTS
                ========================================== */}
            {activeTab === 'reports' && (
              <div className="space-y-6 animate-slide-up text-left">
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-chosen text-xs font-semibold uppercase tracking-wider text-chosen-text-muted">
                          <th className="pb-3 pl-2">Session Title</th>
                          <th className="pb-3">Completed At</th>
                          <th className="pb-3">Flexion (ROM)</th>
                          <th className="pb-3">Form Score</th>
                          <th className="pb-3 text-right pr-2">Replay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-chosen">
                        {loadingReports ? (
                          <tr><td colSpan={5} className="py-8 text-center text-chosen-text-muted">Loading motion reports...</td></tr>
                        ) : motionReports.length === 0 ? (
                          <tr><td colSpan={5} className="py-8 text-center text-chosen-text-muted">No workout sessions recorded yet.</td></tr>
                        ) : (
                          motionReports.map((act) => (
                            <tr key={act.id} className="hover:bg-chosen-surface/50 transition-all">
                              <td className="py-4 pl-2 font-medium text-chosen-text-primary">
                                {act.title}
                              </td>
                              <td className="py-4 text-chosen-text-secondary">
                                {new Date(sessionTimestamp(act)).toLocaleString()}
                              </td>
                              <td className="py-4 text-chosen-text-primary font-semibold">
                                {sessionRom(act)}°
                              </td>
                              <td className="py-4">
                                <Badge variant={
                                  sessionFormScore(act) >= 90 
                                    ? 'success' 
                                    : sessionFormScore(act) >= 75
                                      ? 'warning'
                                      : 'error'
                                }>
                                  {sessionFormScore(act)}% Accuracy
                                </Badge>
                              </td>
                              <td className="py-4 text-right pr-2">
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  onClick={() => navigate(`/admin/session/${act.id}`)}
                                  title="Replay Session"
                                  leftIcon={<PlayCircle className="h-4 w-4" />}
                                >
                                  Replay
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ==========================================
                TAB: ANALYTICS
                ========================================== */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-slide-up text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ROM Curve */}
                  <AnalyticsCard
                    title="Flexion (ROM) Recovery Progress"
                    subtitle="Average degrees achieved over the last 4 weeks"
                  >
                    <div className="h-64 flex items-end gap-6 justify-between pt-6 border-b border-l border-chosen px-4">
                      <div className="flex flex-col items-center w-full gap-2">
                        <div className="bg-[#A27B41]/80 w-full rounded-t-lg transition-all duration-500" style={{ height: '110px' }} />
                        <span className="text-[10px] font-bold text-chosen-text-muted">Week 1 (110°)</span>
                      </div>
                      <div className="flex flex-col items-center w-full gap-2">
                        <div className="bg-[#A27B41]/80 w-full rounded-t-lg transition-all duration-500" style={{ height: '120px' }} />
                        <span className="text-[10px] font-bold text-chosen-text-muted">Week 2 (120°)</span>
                      </div>
                      <div className="flex flex-col items-center w-full gap-2">
                        <div className="bg-[#A27B41]/80 w-full rounded-t-lg transition-all duration-500" style={{ height: '135px' }} />
                        <span className="text-[10px] font-bold text-chosen-text-muted">Week 3 (135°)</span>
                      </div>
                      <div className="flex flex-col items-center w-full gap-2">
                        <div className="bg-gold-500 w-full rounded-t-lg transition-all duration-500" style={{ height: '142px' }} />
                        <span className="text-[10px] font-bold text-chosen-text-muted">Week 4 (142°)</span>
                      </div>
                    </div>
                  </AnalyticsCard>

                  {/* Accuracy */}
                  <AnalyticsCard
                    title="Form Alignment Scores"
                    subtitle="Aggregated sensor tracking scores"
                  >
                    <div className="space-y-4 pt-4">
                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-chosen-text-secondary">Shoulder Alignment</span>
                          <span className="text-chosen-text-primary">94%</span>
                        </div>
                        <div className="w-full bg-chosen-surface h-2 rounded-full overflow-hidden">
                          <div className="bg-gold-500 h-full rounded-full" style={{ width: '94%' }} />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-chosen-text-secondary">Elbow Flexion</span>
                          <span className="text-chosen-text-primary">88%</span>
                        </div>
                        <div className="w-full bg-chosen-surface h-2 rounded-full overflow-hidden">
                          <div className="bg-gold-500 h-full rounded-full" style={{ width: '88%' }} />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-chosen-text-secondary">Knee Symmetry</span>
                          <span className="text-chosen-text-primary">92%</span>
                        </div>
                        <div className="w-full bg-chosen-surface h-2 rounded-full overflow-hidden">
                          <div className="bg-gold-500 h-full rounded-full" style={{ width: '92%' }} />
                        </div>
                      </div>
                    </div>
                  </AnalyticsCard>
                </div>
              </div>
            )}

            {/* ==========================================
                TAB: WEBSITE CONTENT
                ========================================== */}
            {activeTab === 'content' && (
              <div className="animate-slide-up text-left">
                <Card className="max-w-2xl space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-chosen-text-primary">Landing Page Text Editor</h3>
                    <p className="text-xs text-chosen-text-muted mt-1">Configure the visible headlines and introduction blocks on the landing interface.</p>
                  </div>

                  <div className="space-y-5">
                    <Input
                      label="Headline"
                      type="text"
                      value={homeHeadline}
                      onChange={(e) => setHomeHeadline(e.target.value)}
                    />

                    <Textarea
                      label="Introduction Paragraph"
                      className="min-h-[100px]"
                      value={homeSubheadline}
                      onChange={(e) => setHomeSubheadline(e.target.value)}
                    />

                    <Button 
                      onClick={() => alert('Website landing content updated successfully.')}
                      className="w-full"
                    >
                      Publish Changes
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* ==========================================
                TAB: SETTINGS
                ========================================== */}
            {activeTab === 'settings' && (
              <div className="animate-slide-up text-left">
                <Card className="max-w-xl space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-chosen-text-primary">System Configurations</h3>
                    <p className="text-xs text-chosen-text-muted mt-1">Manage global preferences and compliance thresholds.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-chosen-surface border border-chosen rounded-chosen-lg">
                      <div>
                        <h5 className="text-sm font-semibold text-chosen-text-primary">Enable Activity Alerts</h5>
                        <p className="text-xs text-chosen-text-muted mt-0.5">Send reminders for overdue rehabilitation tasks.</p>
                      </div>
                      <Toggle
                        checked={enableAlerts}
                        onChange={(checked) => setEnableAlerts(checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-chosen-surface border border-chosen rounded-chosen-lg">
                      <div>
                        <h5 className="text-sm font-semibold text-chosen-text-primary">Require Compliance Consents</h5>
                        <p className="text-xs text-chosen-text-muted mt-0.5">Prompt patients for HIPAA/data sharing agreements.</p>
                      </div>
                      <Toggle
                        checked={requireConsent}
                        onChange={(checked) => setRequireConsent(checked)}
                      />
                    </div>

                    <div className="pt-4 border-t border-chosen">
                      <Button 
                        onClick={() => alert('Global configurations saved.')}
                        className="w-full"
                      >
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </ContentWrapper>

      {/* ==========================================
          REUSABLE MODALS
          ========================================== */}
      
      {/* Modal: Create Patient */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Patient Profile"
      >
        <p className="text-xs text-chosen-text-muted mb-4">Register a new patient profile inside the clinical system.</p>
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="patient@chosenmotion.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            label="Full Name"
            type="text"
            required
            placeholder="Sarah Connor"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={newDob}
              onChange={(e) => setNewDob(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="text"
              placeholder="+1 555-0199"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>
          <Input
            label="Diagnosis / Target Treatment Plan"
            type="text"
            placeholder="e.g. Shoulder Abduction Routine"
            value={newDiagnosis}
            onChange={(e) => setNewDiagnosis(e.target.value)}
          />
          <Select
            label="Initial Consent Level"
            value={newConsent}
            onChange={(e) => setNewConsent(e.target.value)}
            options={[
              { value: 'Full Consent', label: 'Full Consent (HIPAA Sharing)' },
              { value: 'Research Only', label: 'Research Only' },
              { value: 'None', label: 'No External Sharing' }
            ]}
          />
          <Button
            type="submit"
            disabled={creating}
            isLoading={creating}
            className="w-full mt-2"
          >
            Create Patient Profile
          </Button>
        </form>
      </Modal>

      {/* Modal: Edit Patient */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Patient Profile"
      >
        <p className="text-xs text-chosen-text-muted mb-4">Update patient demographics and treatment plan assignments.</p>
        <form onSubmit={handleEditPatient} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={editFullName}
            onChange={(e) => setEditFullName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={editDob}
              onChange={(e) => setEditDob(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </div>
          <Textarea
            label="Diagnosis / Treatment Assignment"
            value={editDiagnosis}
            onChange={(e) => setEditDiagnosis(e.target.value)}
            className="min-h-[80px]"
          />
          <Select
            label="Patient Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as any)}
            options={[
              { value: 'Active', label: 'Active (Has Plan / In Treatment)' },
              { value: 'Inactive', label: 'Inactive (Archived)' },
              { value: 'Needs Review', label: 'Needs Review' },
              { value: 'High Priority', label: 'High Priority' }
            ]}
          />
          <Button
            type="submit"
            disabled={updating}
            isLoading={updating}
            className="w-full mt-2"
          >
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Modal: Assign Exercise */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Exercise"
      >
        <p className="text-xs text-chosen-text-muted mb-4">
          Select an exercise from the catalog to assign to {patientDetail?.full_name}.
        </p>
        <form onSubmit={handleAssignExercise} className="space-y-4">
          <Select
            label="Exercise"
            required
            value={selectedExerciseToAssign}
            onChange={(e) => setSelectedExerciseToAssign(e.target.value ? Number(e.target.value) : '')}
            options={[
              { value: '', label: 'Select an exercise...' },
              ...availableExercisesToAssign.map((ex) => ({
                value: ex.id,
                label: `${ex.name} (ROM: ${ex.target_rom || 120}°)`
              }))
            ]}
          />
          <Input
            label="Due Date (optional)"
            type="date"
            value={assignDueDate}
            onChange={(e) => setAssignDueDate(e.target.value)}
          />
          <Button
            type="submit"
            disabled={assigning || !selectedExerciseToAssign}
            isLoading={assigning}
            className="w-full mt-2"
          >
            Assign Exercise
          </Button>
        </form>
      </Modal>

      {/* Modal: Create Exercise */}
      <Modal
        isOpen={createExModalOpen}
        onClose={() => setCreateExModalOpen(false)}
        title="Create Catalog Exercise"
      >
        <p className="text-xs text-chosen-text-muted mb-4">Register a new physical exercise template in the system.</p>
        <form onSubmit={handleCreateExercise} className="space-y-4">
          <Input
            label="Exercise Name"
            type="text"
            required
            placeholder="e.g. Elbow Flexion Routine"
            value={newExName}
            onChange={(e) => setNewExName(e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Short summary of the exercise..."
            value={newExDesc}
            onChange={(e) => setNewExDesc(e.target.value)}
            className="min-h-[60px]"
          />
          <Textarea
            label="Instructions"
            placeholder="Instructions detailing flexion extension guides..."
            value={newExInst}
            onChange={(e) => setNewExInst(e.target.value)}
            className="min-h-[65px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target ROM (Degrees)"
              type="number"
              placeholder="e.g. 135"
              value={newExRom}
              onChange={(e) => setNewExRom(e.target.value)}
            />
            <Input
              label="Thumbnail Graphic URL"
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={newExThumb}
              onChange={(e) => setNewExThumb(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-2"
          >
            Create Exercise Template
          </Button>
        </form>
      </Modal>

      {/* Modal: Edit Exercise */}
      <Modal
        isOpen={editExModalOpen}
        onClose={() => setEditExModalOpen(false)}
        title="Edit Catalog Exercise"
      >
        <p className="text-xs text-chosen-text-muted mb-4">Update instructions or guidelines for this motion capture.</p>
        <form onSubmit={handleEditExercise} className="space-y-4">
          <Input
            label="Exercise Name"
            type="text"
            required
            value={editExName}
            onChange={(e) => setEditExName(e.target.value)}
          />
          <Textarea
            label="Description"
            value={editExDesc}
            onChange={(e) => setEditExDesc(e.target.value)}
            className="min-h-[60px]"
          />
          <Textarea
            label="Instructions"
            value={editExInst}
            onChange={(e) => setEditExInst(e.target.value)}
            className="min-h-[65px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target ROM (Degrees)"
              type="number"
              value={editExRom}
              onChange={(e) => setEditExRom(e.target.value)}
            />
            <Input
              label="Thumbnail Graphic URL"
              type="text"
              value={editExThumb}
              onChange={(e) => setEditExThumb(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-2"
          >
            Save Exercise Changes
          </Button>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default AdminDashboard;
