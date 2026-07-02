import React, { useState, useMemo } from 'react';
import { 
  Calendar,
  TrendingUp, 
  Download, 
  RefreshCw, 
  Printer, 
  FileText, 
  Users, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  Heart, 
  Info, 
  Clock, 
  Dumbbell, 
  Maximize2
} from 'lucide-react';
import { Card, StatisticCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Modal, cn } from '@/components/layout/LayoutComponents';
import { Exercise, PatientListItem, MotionSession } from '@/types/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

interface AnalyticsDashboardProps {
  patients: PatientListItem[];
  exercisesList: Exercise[];
  motionReports: MotionSession[];
  stats: any;
  onRefresh: () => Promise<void>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  patients,
  exercisesList,
  motionReports,
  onRefresh
}) => {
  // 1. Filter States
  const [practitionerFilter, setPractitionerFilter] = useState('All');
  const [exerciseFilter, setExerciseFilter] = useState('All');
  const [patientFilter, setPatientFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timePeriod, setTimePeriod] = useState('weekly');

  // Custom Date Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 86400000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [refreshing, setRefreshing] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Trigger Mock Refresh Action
  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  // Trigger Print Dashboard
  const handlePrintClick = () => {
    window.print();
  };

  // Calendar Range Picker Helpers
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isFutureDate = (d: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d > today;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);
    const daysArray = [];

    // Prev month padding cells
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push({ day: null, date: null });
    }

    // Active days
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({
        day: i,
        date: new Date(currentYear, currentMonth, i)
      });
    }

    return daysArray;
  }, [currentMonth, currentYear]);

  const handleDayClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setHoverDate(null);
    } else {
      if (date < startDate) {
        setStartDate(date);
      } else {
        setEndDate(date);
        setHoverDate(null);
      }
    }
  };

  const handleDayMouseEnter = (date: Date | null) => {
    if (startDate && !endDate && date) {
      setHoverDate(date);
    }
  };

  const isBetween = (time: number) => {
    const start = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime() : null;
    const end = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() : null;
    const hover = hoverDate ? new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate()).getTime() : null;

    if (start) {
      if (end) return time > start && time < end;
      if (hover && time > start) return time < hover;
    }
    return false;
  };

  const formatDateLabel = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleApplyRange = () => {
    setShowDatePicker(false);
  };



  // Filter reports list based on selected range, exercise, patient, status, etc.
  const filteredReports = useMemo(() => {
    const selectedPatientListItem = patients.find(p => p.id === patientFilter);
    const targetPatientId = selectedPatientListItem?.patient_id;

    const selectedExercise = exercisesList.find(ex => ex.id.toString() === exerciseFilter);
    const targetExerciseName = selectedExercise?.name.toLowerCase();

    return motionReports.filter(r => {
      // 1. Filter by Date Range
      if (startDate && endDate) {
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0).getTime();
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59).getTime();
        if (r.created_at) {
          const t = new Date(r.created_at).getTime();
          if (t < start || t > end) return false;
        }
      }

      // 2. Filter by Patient selection
      if (patientFilter !== 'All' && r.patient_id !== targetPatientId) {
        return false;
      }

      // 3. Filter by target exercise matching
      if (exerciseFilter !== 'All' && targetExerciseName) {
        if (!r.title.toLowerCase().includes(targetExerciseName)) {
          return false;
        }
      }

      return true;
    });
  }, [motionReports, startDate, endDate, patientFilter, exerciseFilter, patients, exercisesList]);

  // Trigger Export CSV Action
  const handleExportCSV = () => {
    if (filteredReports.length === 0) {
      alert("No reports available to export for this date range.");
      return;
    }
    
    // Build CSV contents
    const headers = ["Date", "Patient ID", "Exercise Title", "ROM Achieved (deg)", "Form Score (%)", "Session Duration (s)"];
    const rows = filteredReports.map(r => [
      r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
      r.patient_id || '',
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.range_of_motion || 0,
      r.avg_score || 0,
      r.duration_seconds || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clinical_analytics_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Export PDF Action
  const handleExportPDF = () => {
    window.print();
  };

  // 2. Compute dynamic stats from inputs
  const calculatedStats = useMemo(() => {
    const totalPatients = patients.length || 9;
    const activePatients = patients.filter(p => !p.is_archived).length || 7;
    const exercisesCompleted = filteredReports.length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sessionsThisWeek = filteredReports.filter(r => new Date(r.created_at) >= sevenDaysAgo).length;

    const avgAccuracy = filteredReports.length 
      ? Math.round(filteredReports.reduce((acc, r) => acc + (r.avg_score || 0), 0) / filteredReports.length)
      : 92;

    const avgRom = filteredReports.length
      ? Math.round(filteredReports.reduce((acc, r) => acc + (r.range_of_motion || 0), 0) / filteredReports.length)
      : 120;

    const complianceRate = Math.min(100, Math.round((filteredReports.length / (activePatients * 3 || 1)) * 100)) || 85;
    const recoveryScore = Math.min(100, Math.round(avgAccuracy * 0.85)) || 78;

    return {
      totalPatients,
      activePatients,
      exercisesCompleted,
      sessionsThisWeek,
      avgAccuracy,
      avgRom,
      complianceRate,
      recoveryScore
    };
  }, [patients, filteredReports]);

  // 3. Dynamic Mock & Real Chart Data Setup
  const chartData = useMemo(() => {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const msDiff = end.getTime() - start.getTime();
    const daysDiff = Math.max(1, Math.ceil(msDiff / 86400000));
    
    const datesList: Date[] = [];
    for (let i = 0; i <= daysDiff; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d <= end) {
        datesList.push(d);
      }
    }
    
    const reportsByDate: Record<string, MotionSession[]> = {};
    filteredReports.forEach(r => {
      if (!r.created_at) return;
      const dateKey = new Date(r.created_at).toDateString();
      if (!reportsByDate[dateKey]) reportsByDate[dateKey] = [];
      reportsByDate[dateKey].push(r);
    });
    
    const exerciseCompletion: Array<{ date: string; count: number }> = [];
    const motionAccuracy: Array<{ session: string; score: number }> = [];
    const recoveryTrend: Array<{ week: string; rom: number; accuracy: number }> = [];
    const complianceTrend: Array<{ week: string; rate: number }> = [];
    const sessionActivity: Array<{ hour: string; sessions: number }> = [
      { hour: '08:00', sessions: 0 },
      { hour: '10:00', sessions: 0 },
      { hour: '12:00', sessions: 0 },
      { hour: '14:00', sessions: 0 },
      { hour: '16:00', sessions: 0 },
      { hour: '18:00', sessions: 0 }
    ];
    
    filteredReports.forEach(r => {
      if (!r.created_at) return;
      const hour = new Date(r.created_at).getHours();
      if (hour >= 8 && hour < 10) sessionActivity[0].sessions++;
      else if (hour >= 10 && hour < 12) sessionActivity[1].sessions++;
      else if (hour >= 12 && hour < 14) sessionActivity[2].sessions++;
      else if (hour >= 14 && hour < 16) sessionActivity[3].sessions++;
      else if (hour >= 16 && hour < 18) sessionActivity[4].sessions++;
      else if (hour >= 18) sessionActivity[5].sessions++;
    });
    
    if (daysDiff <= 14) {
      datesList.forEach(d => {
        const key = d.toDateString();
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const count = reportsByDate[key]?.length || 0;
        exerciseCompletion.push({ date: label, count });
      });
    } else {
      const weeksCount = Math.ceil(daysDiff / 7);
      for (let w = 1; w <= weeksCount; w++) {
        const label = `Wk ${w}`;
        const wStart = new Date(start);
        wStart.setDate(start.getDate() + (w - 1) * 7);
        const wEnd = new Date(start);
        wEnd.setDate(start.getDate() + w * 7);
        
        const count = filteredReports.filter(r => {
          if (!r.created_at) return false;
          const t = new Date(r.created_at).getTime();
          return t >= wStart.getTime() && t < wEnd.getTime();
        }).length;
        
        exerciseCompletion.push({ date: label, count });
      }
    }
    
    if (filteredReports.length === 0) {
      if (daysDiff <= 14) {
        datesList.forEach((d, idx) => {
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          exerciseCompletion.push({ date: label, count: Math.round(Math.abs(Math.sin(idx) * 2) + 1) });
        });
      } else {
        const weeksCount = Math.ceil(daysDiff / 7);
        for (let w = 1; w <= weeksCount; w++) {
          exerciseCompletion.push({ date: `Wk ${w}`, count: Math.round(Math.abs(Math.cos(w) * 3) + 2) });
        }
      }
    }
    
    if (filteredReports.length > 0) {
      filteredReports.forEach((r, idx) => {
        motionAccuracy.push({
          session: `Sess ${idx + 1}`,
          score: r.avg_score || 90
        });
      });
      
      const weeksCount = Math.ceil(daysDiff / 7);
      for (let w = 1; w <= weeksCount; w++) {
        const wStart = new Date(start);
        wStart.setDate(start.getDate() + (w - 1) * 7);
        const wEnd = new Date(start);
        wEnd.setDate(start.getDate() + w * 7);
        
        const weekSessions = filteredReports.filter(r => {
          if (!r.created_at) return false;
          const t = new Date(r.created_at).getTime();
          return t >= wStart.getTime() && t < wEnd.getTime();
        });
        
        const avgScore = weekSessions.length
          ? Math.round(weekSessions.reduce((acc, r) => acc + (r.avg_score || 0), 0) / weekSessions.length)
          : 88;
        
        const avgRomVal = weekSessions.length
          ? Math.round(weekSessions.reduce((acc, r) => acc + (r.range_of_motion || 0), 0) / weekSessions.length)
          : 110;
        
        recoveryTrend.push({
          week: `Wk ${w}`,
          rom: avgRomVal,
          accuracy: avgScore
        });
        
        complianceTrend.push({
          week: `Wk ${w}`,
          rate: Math.min(100, Math.round((weekSessions.length / 3) * 100)) || 80
        });
      }
    } else {
      const weeksCount = Math.max(4, Math.ceil(daysDiff / 7));
      for (let w = 1; w <= weeksCount; w++) {
        recoveryTrend.push({
          week: `Wk ${w}`,
          rom: 95 + w * 8,
          accuracy: 82 + w * 2
        });
        complianceTrend.push({
          week: `Wk ${w}`,
          rate: 74 + Math.round(Math.sin(w) * 10)
        });
      }
      for (let s = 1; s <= 5; s++) {
        motionAccuracy.push({
          session: `Sess ${s}`,
          score: 84 + s * 2
        });
      }
    }
    
    const allZeroSessions = sessionActivity.every(s => s.sessions === 0);
    if (allZeroSessions) {
      sessionActivity[0].sessions = 2;
      sessionActivity[1].sessions = 5;
      sessionActivity[2].sessions = 3;
      sessionActivity[3].sessions = 6;
      sessionActivity[4].sessions = 4;
      sessionActivity[5].sessions = 8;
    }
    
    const patientGrowth: Array<{ name: string; count: number }> = [];
    const monthsDiff = Math.max(1, Math.ceil(daysDiff / 30));
    if (monthsDiff <= 6) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const startMonth = start.getMonth();
      for (let m = 0; m <= monthsDiff; m++) {
        const mIdx = (startMonth + m) % 12;
        patientGrowth.push({
          name: monthNames[mIdx],
          count: Math.max(2, (patients.length || 8) - (monthsDiff - m))
        });
      }
    } else {
      for (let i = 0; i < 6; i++) {
        patientGrowth.push({
          name: `Period ${i + 1}`,
          count: Math.round(5 + i * 1.5)
        });
      }
    }
    
    return {
      patientGrowth,
      exerciseCompletion,
      recoveryTrend,
      motionAccuracy,
      rangeOfMotion: [
        { name: 'Shoulder', avg: 125, target: 140 },
        { name: 'Elbow', avg: 118, target: 130 },
        { name: 'Knee', avg: 98, target: 110 },
        { name: 'Wrist', avg: 65, target: 75 }
      ],
      complianceTrend,
      sessionActivity
    };
  }, [patients, filteredReports, startDate, endDate]);

  return (
    <div className="space-y-8 animate-slide-up text-left">
      {/* Print-only Medical Report Transcript Header */}
      <div className="hidden print:block border-b-2 border-charcoal-900 pb-4 mb-6 select-none text-left">
        <h1 className="text-xl font-bold text-black uppercase tracking-wider">Chosen Life Clinical Motion Tracking</h1>
        <h2 className="text-sm font-bold text-charcoal-700 mt-1">Clinical Telemetry & Progress Report</h2>
        <div className="grid grid-cols-2 gap-4 mt-4 text-2xs text-charcoal-600">
          <div>
            <p><span className="font-bold text-black">Generated Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-bold text-black">Active Filter Period:</span> {startDate ? formatDateLabel(startDate) : 'Start'} to {endDate ? formatDateLabel(endDate) : 'End'}</p>
          </div>
          <div>
            <p><span className="font-bold text-black">Selected Patient Profile:</span> {patientFilter !== 'All' ? patients.find(p => p.id === patientFilter)?.full_name || 'Individual Profile' : 'All Patients'}</p>
            <p><span className="font-bold text-black">Exercise Template:</span> {exerciseFilter !== 'All' ? exercisesList.find(ex => ex.id.toString() === exerciseFilter)?.name || 'Filtered Template' : 'All Templates'}</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: HEADER & CLINIC FILTER BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-chosen-text-primary">Clinical Analytics Dashboard</h2>
          <p className="text-xs text-chosen-text-muted mt-1">Cross-examine patient compliance rates, ROM metrics, and motion tracking results.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleRefreshClick}
            variant="secondary"
            leftIcon={<RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />}
            className="text-xs font-semibold py-2 px-3 border-chosen bg-white dark:bg-charcoal-900"
          >
            Refresh Data
          </Button>

          <Button
            onClick={handlePrintClick}
            variant="secondary"
            leftIcon={<Printer className="h-4 w-4" />}
            className="text-xs font-semibold py-2 px-3 border-chosen bg-white dark:bg-charcoal-900"
          >
            Print
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
            className="text-xs font-semibold py-2 px-3 border-chosen bg-white dark:bg-charcoal-900"
          >
            Export CSV
          </Button>

          <Button
            onClick={handleExportPDF}
            variant="primary"
            leftIcon={<FileText className="h-4 w-4" />}
            className="text-xs font-bold py-2 px-4 shadow-chosen-sm btn-primary"
          >
            Export Report PDF
          </Button>
        </div>
      </div>

      {/* GLOBAL FILTERS PANEL */}
      <Card className="p-4 bg-white dark:bg-[#0d0c18] border border-chosen shadow-chosen-sm select-none no-print">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative">
            <span className="text-[10px] text-chosen-text-muted font-bold uppercase block tracking-wider mb-1.5 select-none text-left">Date Range</span>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center justify-between px-3 py-2 border border-chosen rounded-chosen-md bg-white dark:bg-[#121122] text-xs text-chosen-text-primary hover:border-gold-500/40 transition-colors select-none cursor-pointer text-left"
            >
              <span className="truncate">
                {startDate && endDate 
                  ? `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
                  : startDate 
                    ? `Starts ${formatDateLabel(startDate)}`
                    : 'Select dates...'}
              </span>
              <Calendar className="h-4 w-4 shrink-0 text-[#A27B41] ml-2" />
            </button>

            {/* Custom Range Popover Dropdown */}
            {showDatePicker && (
              <div 
                className="absolute top-[62px] left-0 z-50 p-4 bg-white dark:bg-[#0c0b16] border border-chosen rounded-chosen-xl shadow-chosen-modal flex flex-col sm:flex-row gap-4 animate-slide-up w-[310px] sm:w-[460px] md:w-[480px]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowDatePicker(false);
                }}
              >
                {/* Screen Reader Announcements */}
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {startDate && !endDate && `Start date selected: ${formatDateLabel(startDate)}. Please select an end date.`}
                  {startDate && endDate && `Selected range from ${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}.`}
                </div>
                {/* Left Side: Calendar month view */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-center justify-between select-none">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-850 rounded text-chosen-text-muted text-xs"
                    >
                      &larr;
                    </button>
                    <span className="text-2xs font-bold text-chosen-text-primary">
                      {months[currentMonth]} {currentYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-850 rounded text-chosen-text-muted text-xs"
                    >
                      &rarr;
                    </button>
                  </div>

                  {/* Days of week grid */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-chosen-text-muted select-none">
                    {daysOfWeek.map(d => (
                      <div key={d} className="py-0.5">{d}</div>
                    ))}
                  </div>

                  {/* Day cells grid */}
                  <div className="grid grid-cols-7 select-none">
                    {days.map((cell, idx) => {
                      if (!cell.date) {
                        return <div key={`empty-${idx}`} className="w-full h-9" />;
                      }
                      
                      const time = cell.date.getTime();
                      const start = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime() : null;
                      const end = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() : null;
                      const hover = hoverDate ? new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate()).getTime() : null;
                      
                      const isStart = start && time === start;
                      const isEnd = end && time === end;
                      const between = isBetween(time);
                      const dayOfWeek = cell.date.getDay();
                      const disabled = isFutureDate(cell.date);
                      const isTodayDate = isToday(cell.date);

                      // Determine range preview states
                      const isHoverRange = start && !end && hover && time > start && time <= hover;
                      const isHoverEnd = start && !end && hover && time === hover;

                      // Dynamic inline styling for start/end half-highlights
                      let backgroundStyle = undefined;
                      let bgClass = "";
                      let radiusClass = "";

                      if (isStart) {
                        if (end && time !== end) {
                          backgroundStyle = { background: 'linear-gradient(90deg, transparent 50%, rgba(162, 123, 65, 0.1) 50%)' };
                          radiusClass = "rounded-l-full";
                        } else if (hover && hover > start) {
                          backgroundStyle = { background: 'linear-gradient(90deg, transparent 50%, rgba(162, 123, 65, 0.05) 50%)' };
                          radiusClass = "rounded-l-full";
                        }
                      } else if (isEnd) {
                        if (start && time !== start) {
                          backgroundStyle = { background: 'linear-gradient(90deg, rgba(162, 123, 65, 0.1) 50%, transparent 50%)' };
                          radiusClass = "rounded-r-full";
                        }
                      } else if (isHoverEnd) {
                        if (start) {
                          backgroundStyle = { background: 'linear-gradient(90deg, rgba(162, 123, 65, 0.05) 50%, transparent 50%)' };
                          radiusClass = "rounded-r-full";
                        }
                      } else if (between) {
                        bgClass = "bg-[#A27B41]/10";
                        if (dayOfWeek === 0) radiusClass = "rounded-l-full";
                        if (dayOfWeek === 6) radiusClass = "rounded-r-full";
                      } else if (isHoverRange) {
                        bgClass = "bg-[#A27B41]/5";
                        if (dayOfWeek === 0) radiusClass = "rounded-l-full";
                        if (dayOfWeek === 6) radiusClass = "rounded-r-full";
                      }

                      return (
                        <div
                          key={cell.date.toISOString()}
                          className={cn(
                            "w-full h-9 flex items-center justify-center relative transition-all duration-150 ease-out",
                            bgClass,
                            radiusClass
                          )}
                          style={backgroundStyle}
                        >
                          <button
                            type="button"
                            onClick={() => !disabled && handleDayClick(cell.date!)}
                            onMouseEnter={() => !disabled && handleDayMouseEnter(cell.date)}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center text-[10px] rounded-full transition-all duration-200 ease-out cursor-pointer relative z-10 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2",
                              (isStart || isEnd) && "bg-gold-500 text-white shadow-chosen-sm font-bold scale-105",
                              isHoverEnd && "bg-[#A27B41]/20 text-gold-500 font-bold border border-dashed border-[#A27B41]/50 scale-105",
                              !isStart && !isEnd && between && "text-gold-500 font-bold",
                              !isStart && !isEnd && isHoverRange && "text-gold-500/80 font-semibold",
                              isTodayDate && !(isStart || isEnd || between || isHoverRange) && "border border-gold-500/50 text-[#A27B41] font-bold",
                              !isStart && !isEnd && !between && !isHoverRange && !isTodayDate && "text-chosen-text-secondary hover:bg-chosen-surface/40 hover:text-[#A27B41]",
                              disabled && "text-chosen-text-muted opacity-30 cursor-not-allowed pointer-events-none"
                            )}
                            disabled={disabled}
                            aria-label={`${cell.day} ${months[currentMonth]} ${currentYear}${isTodayDate ? ' (Today)' : ''}${disabled ? ' (Disabled)' : ''}${isStart ? ' (Start Date)' : ''}${isEnd ? ' (End Date)' : ''}`}
                            aria-selected={isStart || isEnd || between ? "true" : "false"}
                            tabIndex={disabled ? -1 : 0}
                          >
                            {cell.day}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected summary & Apply action */}
                  <div className="flex items-center justify-between pt-3 border-t border-chosen select-none">
                    <div className="text-[10px] text-chosen-text-secondary pr-2">
                      <span className="block font-bold">Selected:</span>
                      <span className="font-semibold text-[#A27B41] block truncate max-w-[120px] sm:max-w-[200px]">
                        {startDate ? formatDateLabel(startDate) : 'Start'} - {endDate ? formatDateLabel(endDate) : 'End'}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="px-2 py-1 text-[9px] font-semibold bg-[#F5F5F5] dark:bg-charcoal-850 text-chosen-text-muted hover:text-chosen-text-primary rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyRange}
                        className="px-2 py-1 text-[9px] font-bold bg-gold-500 text-white hover:bg-gold-600 rounded shadow-chosen-sm cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Quick Presets */}
                <div className="flex flex-row sm:flex-col flex-wrap sm:flex-nowrap gap-1.5 sm:border-l border-chosen sm:pl-4 pl-0 border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0 justify-center">
                  {[
                    { label: 'Today', getValue: () => [new Date(), new Date()] },
                    { label: 'Yesterday', getValue: () => {
                        const d = new Date(); d.setDate(d.getDate() - 1);
                        return [d, d];
                      }
                    },
                    { label: 'Last 7 Days', getValue: () => [new Date(Date.now() - 7 * 86400000), new Date()] },
                    { label: 'Last 30 Days', getValue: () => [new Date(Date.now() - 30 * 86400000), new Date()] },
                    { label: 'Last 90 Days', getValue: () => [new Date(Date.now() - 90 * 86400000), new Date()] },
                    { label: 'This Month', getValue: () => {
                        const d = new Date();
                        return [new Date(d.getFullYear(), d.getMonth(), 1), new Date()];
                      }
                    },
                    { label: 'Last Month', getValue: () => {
                        const d = new Date();
                        return [new Date(d.getFullYear(), d.getMonth() - 1, 1), new Date(d.getFullYear(), d.getMonth(), 0)];
                      }
                    }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const [start, end] = preset.getValue();
                        setStartDate(start);
                        setEndDate(end);
                        setCurrentMonth(start.getMonth());
                        setCurrentYear(start.getFullYear());
                      }}
                      className="text-3xs font-semibold px-2 py-1 bg-[#F5F5F5] dark:bg-charcoal-850 hover:bg-[#A27B41]/10 hover:text-gold-500 text-chosen-text-secondary rounded transition-colors text-left cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Select
            label="Practitioner"
            value={practitionerFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPractitionerFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Clinicians' },
              { value: 'Sarah Connor', label: 'Sarah Connor, PT' },
              { value: 'Kyle Reese', label: 'Kyle Reese, OT' }
            ]}
          />
          <Select
            label="Target Exercise"
            value={exerciseFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExerciseFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Exercises' },
              ...exercisesList.map(ex => ({ value: ex.id.toString(), label: ex.name }))
            ]}
          />
          <Select
            label="Patient Profile"
            value={patientFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPatientFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Patients' },
              ...patients.map(p => ({ value: p.id, label: p.full_name }))
            ]}
          />
          <Select
            label="Rehab Status"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Rehab' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />
          <Select
            label="Time Increment"
            value={timePeriod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimePeriod(e.target.value)}
            options={[
              { value: 'daily', label: 'Daily Interval' },
              { value: 'weekly', label: 'Weekly Interval' },
              { value: 'monthly', label: 'Monthly Interval' }
            ]}
          />
        </div>

      </Card>

      {/* SECTION 2: STATS SUMMARY KPI DECK (3 Columns layout matching reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatisticCard
          label="Total Patients"
          value={calculatedStats.totalPatients}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-[#A27B41]/10 text-gold-500"
          className="h-full"
          trend={{
            value: "Roster count active",
            direction: "up"
          }}
        />
        <StatisticCard
          label="Active Patients"
          value={calculatedStats.activePatients}
          icon={<Heart className="h-5 w-5" />}
          iconBg="bg-emerald-500/10 text-emerald-500"
          className="h-full"
          trend={{
            value: "Under supervision",
            direction: "neutral"
          }}
        />
        <StatisticCard
          label="Exercises Completed"
          value={calculatedStats.exercisesCompleted}
          icon={<Dumbbell className="h-5 w-5" />}
          iconBg="bg-cyan-500/10 text-cyan-500"
          className="h-full"
          trend={{
            value: "Total recorded runs",
            direction: "up"
          }}
        />
        <StatisticCard
          label="Sessions This Week"
          value={calculatedStats.sessionsThisWeek}
          icon={<Activity className="h-5 w-5" />}
          iconBg="bg-violet-500/10 text-violet-500"
          className="h-full"
          trend={{
            value: "Weekly compliance count",
            direction: "up"
          }}
        />
        <StatisticCard
          label="Average Accuracy Score"
          value={`${calculatedStats.avgAccuracy}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-pink-500/10 text-pink-500"
          className="h-full"
          trend={{
            value: "Camera tracking standard",
            direction: "up"
          }}
        />
        <StatisticCard
          label="Compliance Rate"
          value={`${calculatedStats.complianceRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-amber-500/10 text-amber-500"
          className="h-full"
          trend={{
            value: "Average completion ratio",
            direction: "up"
          }}
        />
      </div>

      {/* SECTION 3: AI DIAGNOSTIC INSIGHTS */}
      <Card className="p-6 bg-slate-950/5 dark:bg-[#11101e] border border-chosen rounded-chosen-xl space-y-4">
        <h3 className="text-sm font-display font-bold text-chosen-text-primary flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-[#A27B41]" /> Automated Clinical insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-chosen-lg text-xs space-y-1">
            <span className="font-bold text-emerald-500 block">Flexion recovery improving</span>
            <p className="text-chosen-text-secondary leading-relaxed">Range of motion across all elbow routines rose by 12° over the last 4 weeks.</p>
          </div>
          <div className="p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-chosen-lg text-xs space-y-1">
            <span className="font-bold text-red-500 block">Compliance Drop Alert</span>
            <p className="text-chosen-text-secondary leading-relaxed">Overall exercise compliance decreased by 8% due to missing weekend sessions.</p>
          </div>
          <div className="p-4 bg-[#A27B41]/5 dark:bg-[#A27B41]/10 border border-[#A27B41]/20 rounded-chosen-lg text-xs space-y-1">
            <span className="font-bold text-[#A27B41] block">Joint alignment bottlenecks</span>
            <p className="text-chosen-text-secondary leading-relaxed">Most patients struggle to hit targets with Shoulder Flexion templates.</p>
          </div>
          <div className="p-4 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 rounded-chosen-lg text-xs space-y-1">
            <span className="font-bold text-violet-500 block">Roster Review Recommended</span>
            <p className="text-chosen-text-secondary leading-relaxed">Consider revising the post-op Squat checklist settings for John Miller.</p>
          </div>
        </div>
      </Card>

      {/* SECTION 4: CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* CHART 1: PATIENT GROWTH */}
        <Card className="p-5 flex flex-col justify-between border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl h-96">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <h4 className="font-display font-bold text-sm text-chosen-text-primary">Patient Growth</h4>
              <p className="text-2xs text-chosen-text-muted mt-0.5">Active treatment profiles registered</p>
            </div>
            <button 
              onClick={() => setExpandedChart('Patient Growth')}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 rounded transition-colors text-chosen-text-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full pt-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.patientGrowth} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A27B41" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#A27B41" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#A27B41" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 2: EXERCISE COMPLETION */}
        <Card className="p-5 flex flex-col justify-between border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl h-96">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <h4 className="font-display font-bold text-sm text-chosen-text-primary">Completion Trend</h4>
              <p className="text-2xs text-chosen-text-muted mt-0.5">Routines successfully completed daily</p>
            </div>
            <button 
              onClick={() => setExpandedChart('Completion Trend')}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 rounded transition-colors text-chosen-text-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full pt-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.exerciseCompletion} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 3: RECOVERY ROM TREND */}
        <Card className="p-5 flex flex-col justify-between border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl h-96">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <h4 className="font-display font-bold text-sm text-chosen-text-primary">ROM Delta Progression</h4>
              <p className="text-2xs text-chosen-text-muted mt-0.5">Degrees range improvement (4 weeks)</p>
            </div>
            <button 
              onClick={() => setExpandedChart('ROM Delta Progression')}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 rounded transition-colors text-chosen-text-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full pt-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.recoveryTrend} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                <XAxis dataKey="week" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="rom" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorRom)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 4: MOTION ALIGNMENT SCORE */}
        <Card className="p-5 flex flex-col justify-between border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl h-96">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <h4 className="font-display font-bold text-sm text-chosen-text-primary">Motion Accuracy</h4>
              <p className="text-2xs text-chosen-text-muted mt-0.5">Camera joint alignment telemetry score (%)</p>
            </div>
            <button 
              onClick={() => setExpandedChart('Motion Accuracy')}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 rounded transition-colors text-chosen-text-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full pt-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.motionAccuracy} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                <XAxis dataKey="session" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 5: COMPLIANCE RATE TRACKER */}
        <Card className="p-5 flex flex-col justify-between border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl h-96">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <h4 className="font-display font-bold text-sm text-chosen-text-primary">Weekly Compliance Tracker</h4>
              <p className="text-2xs text-chosen-text-muted mt-0.5">Percentage rate over previous weeks</p>
            </div>
            <button 
              onClick={() => setExpandedChart('Weekly Compliance Tracker')}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 rounded transition-colors text-chosen-text-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full pt-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.complianceTrend} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                <XAxis dataKey="week" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 6: WEEKDAY SESSION ACTIVITY */}
        <Card className="p-5 flex flex-col justify-between border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl h-96">
          <div className="flex justify-between items-start shrink-0">
            <div>
              <h4 className="font-display font-bold text-sm text-chosen-text-primary">Session Activity</h4>
              <p className="text-2xs text-chosen-text-muted mt-0.5">Active motion runs by time of day</p>
            </div>
            <button 
              onClick={() => setExpandedChart('Session Activity')}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 rounded transition-colors text-chosen-text-muted"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full pt-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.sessionActivity} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                <XAxis dataKey="hour" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* SECTION 5: PERFORMANCE ANALYTICS & TOP PERFORMERS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Joint Performance Details */}
        <Card className="p-6 border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-chosen-text-primary">Joint & Gesture Performance</h3>
            <p className="text-2xs text-chosen-text-muted">Symmetry and alignment averages tracked</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-chosen pb-2">
              <span className="font-semibold text-chosen-text-secondary">Average Form Score</span>
              <span className="font-mono font-bold text-[#A27B41]">91%</span>
            </div>
            <div className="flex justify-between items-center border-b border-chosen pb-2">
              <span className="font-semibold text-chosen-text-secondary">Average Joint Stability</span>
              <span className="font-mono font-bold text-emerald-500">89%</span>
            </div>
            <div className="flex justify-between items-center border-b border-chosen pb-2">
              <span className="font-semibold text-chosen-text-secondary">Average Symmetry (Bilateral)</span>
              <span className="font-mono font-bold text-cyan-500">92%</span>
            </div>
            <div className="flex justify-between items-center border-b border-chosen pb-2">
              <span className="font-semibold text-chosen-text-secondary">Average Motion Speed</span>
              <span className="font-mono font-bold text-chosen-text-primary">1.2 rad/sec</span>
            </div>
            <div className="flex justify-between items-center border-b border-chosen pb-2">
              <span className="font-semibold text-chosen-text-secondary">Best Performing Exercise</span>
              <span className="font-bold text-[#A27B41] uppercase tracking-wider">Elbow Flexion</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-chosen-text-secondary">Most Challenging Exercise</span>
              <span className="font-bold text-red-500 uppercase tracking-wider">Shoulder Abduction</span>
            </div>
          </div>
        </Card>

        {/* Top Patients metrics */}
        <Card className="p-6 border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-chosen-text-primary">Top Patient Progress</h3>
            <p className="text-2xs text-chosen-text-muted">High compliance and fastest rehabilitation rates</p>
          </div>

          <div className="divide-y divide-chosen text-xs text-chosen-text-secondary">
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-chosen-text-primary block">Sarah Connor</span>
                <span className="text-[10px] text-chosen-text-muted">Rotator Cuff tear rehab</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-bold text-[10px]">
                96% Compliance
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-chosen-text-primary block">John Miller</span>
                <span className="text-[10px] text-chosen-text-muted">ACL Knee reconstruction</span>
              </div>
              <span className="px-2 py-0.5 bg-[#A27B41]/10 text-[#A27B41] rounded font-bold text-[10px]">
                +25° ROM delta
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-chosen-text-primary block">Kyle Reese</span>
                <span className="text-[10px] text-chosen-text-muted">Elbow Flexion routine</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded font-bold text-[10px]">
                Highest Stability
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 6: COMPLIANCE ALERTS & RECENT TIMELINE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Compliance Alerts desk */}
        <Card className="p-6 border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-sm text-chosen-text-primary">Compliance Alerts</h3>
              <p className="text-2xs text-chosen-text-muted">Patients requiring active follow-up review</p>
            </div>
            <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
          </div>

          <div className="divide-y divide-chosen text-xs text-chosen-text-secondary">
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-chosen-text-primary block">John Miller</span>
                <span className="text-2xs text-red-500 font-semibold block mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Missed 2 routines this week
                </span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="text-[#A27B41] font-bold text-2xs hover:underline cursor-pointer"
              >
                Follow Up
              </Button>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-chosen-text-primary block">Sarah Connor</span>
                <span className="text-2xs text-[#A27B41] font-semibold block mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Target ROM threshold check needed
                </span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="text-[#A27B41] font-bold text-2xs hover:underline cursor-pointer"
              >
                Review Specs
              </Button>
            </div>
          </div>
        </Card>

        {/* Timeline Log */}
        <Card className="p-6 border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-chosen-text-primary">Recent Clinic Activity</h3>
            <p className="text-2xs text-chosen-text-muted">Latest session events logged</p>
          </div>

          <div className="relative border-l border-chosen pl-4 space-y-5 ml-1 text-xs">
            {filteredReports.slice(0, 3).map((act, index) => (
              <div key={index} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold-500 border border-white dark:border-charcoal-900" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-chosen-text-primary block">
                      Patient session completed
                    </span>
                    <span className="text-chosen-text-secondary block mt-0.5">
                      {act.title} (ROM: {act.range_of_motion || 120}°, Score: {act.avg_score || 90}%)
                    </span>
                  </div>
                  <span className="text-3xs text-chosen-text-muted font-mono whitespace-nowrap">
                    {act.created_at ? new Date(act.created_at).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white dark:border-charcoal-900" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-chosen-text-primary block">
                    New Patient Roster Profile
                  </span>
                  <span className="text-chosen-text-secondary block mt-0.5">
                    Added to active clinical check-in list
                  </span>
                </div>
                <span className="text-3xs text-chosen-text-muted font-mono whitespace-nowrap">Earlier today</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* EXPANDED CHART MODAL */}
      {expandedChart && (
        <Modal
          isOpen={true}
          onClose={() => setExpandedChart(null)}
          title={`Expanded View: ${expandedChart}`}
          size="lg"
        >
          <div className="h-96 w-full pt-4 text-left select-none">
            <p className="text-xs text-chosen-text-muted mb-4">Detailed analytical graph mapping session details.</p>
            <ResponsiveContainer width="100%" height="90%">
              {expandedChart === 'Patient Growth' ? (
                <AreaChart data={chartData.patientGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorExpGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A27B41" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#A27B41" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#A27B41" strokeWidth={3} fillOpacity={1} fill="url(#colorExpGrowth)" />
                </AreaChart>
              ) : expandedChart === 'Completion Trend' ? (
                <LineChart data={chartData.exerciseCompletion} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              ) : expandedChart === 'ROM Delta Progression' ? (
                <AreaChart data={chartData.recoveryTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorExpRom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                  <XAxis dataKey="week" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rom" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorExpRom)" />
                </AreaChart>
              ) : expandedChart === 'Motion Accuracy' ? (
                <LineChart data={chartData.motionAccuracy} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                  <XAxis dataKey="session" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              ) : expandedChart === 'Weekly Compliance Tracker' ? (
                <LineChart data={chartData.complianceTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                  <XAxis dataKey="week" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData.sessionActivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" className="dark:stroke-charcoal-850" />
                  <XAxis dataKey="hour" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Modal>
      )}
    </div>
  );
};
