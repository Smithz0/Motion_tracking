import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Grid, 
  List, 
  Check, 
  Users, 
  CheckCircle2, 
  Activity, 
  Dumbbell,
  AlertCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Card, StatisticCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ResponsiveGrid, Modal, cn } from '@/components/layout/LayoutComponents';
import { Exercise, PatientListItem } from '@/types/api';

interface ExerciseLibraryProps {
  exercisesList: Exercise[];
  patients: PatientListItem[];
  
  // Create state & handler
  createExModalOpen: boolean;
  setCreateExModalOpen: (open: boolean) => void;
  newExName: string;
  setNewExName: (name: string) => void;
  newExDesc: string;
  setNewExDesc: (desc: string) => void;
  newExInst: string;
  setNewExInst: (inst: string) => void;
  newExRom: string;
  setNewExRom: (rom: string) => void;
  newExThumb: string;
  setNewExThumb: (thumb: string) => void;
  handleCreateExercise: (e: React.FormEvent) => Promise<void>;

  // Edit state & handler
  editExModalOpen: boolean;
  setEditExModalOpen: (open: boolean) => void;
  selectedExerciseId: number | null;
  setSelectedExerciseId: (id: number | null) => void;
  editExName: string;
  setEditExName: (name: string) => void;
  editExDesc: string;
  setEditExDesc: (desc: string) => void;
  editExInst: string;
  setEditExInst: (inst: string) => void;
  editExRom: string;
  setEditExRom: (rom: string) => void;
  editExThumb: string;
  setEditExThumb: (thumb: string) => void;
  handleEditExercise: (e: React.FormEvent) => Promise<void>;
  handleDeleteExercise: (id: number) => Promise<void>;

  // Assign state & handler
  assignModalOpen: boolean;
  setAssignModalOpen: (open: boolean) => void;
  selectedExerciseToAssign: number | '';
  setSelectedExerciseToAssign: (id: number | '') => void;
  assignDueDate: string;
  setAssignDueDate: (date: string) => void;
  assigning: boolean;
  handleAssignExercise: (e: React.FormEvent) => Promise<void>;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

interface DecoratedExercise extends Exercise {
  category: string;
  bodyPart: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  sets: number;
  reps: number;
  status: 'Active' | 'Inactive';
  assignedCount: number;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  exercisesList,
  patients,
  
  createExModalOpen,
  setCreateExModalOpen,
  newExName,
  setNewExName,
  newExDesc,
  setNewExDesc,
  newExInst,
  setNewExInst,
  newExRom,
  setNewExRom,
  newExThumb,
  setNewExThumb,
  handleCreateExercise,

  editExModalOpen,
  setEditExModalOpen,
  setSelectedExerciseId,
  editExName,
  setEditExName,
  editExDesc,
  setEditExDesc,
  editExInst,
  setEditExInst,
  editExRom,
  setEditExRom,
  editExThumb,
  setEditExThumb,
  handleEditExercise,
  handleDeleteExercise,

  assignModalOpen,
  setAssignModalOpen,
  selectedExerciseToAssign,
  setSelectedExerciseToAssign,
  assignDueDate,
  setAssignDueDate,
  assigning,
  handleAssignExercise,
  selectedPatientId,
  setSelectedPatientId
}) => {
  // Local View Toggle and Search/Filter states
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [bodyPartFilter, setBodyPartFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Exercise Detail Panel State
  const [selectedExDetails, setSelectedExDetails] = useState<DecoratedExercise | null>(null);

  // Assign Modal Internal Patient Search
  const [patientSearch, setPatientSearch] = useState('');

  // 1. Decorate exercises list with visual details
  const decoratedExercises = useMemo(() => {
    return exercisesList.map((ex): DecoratedExercise => {
      const name = ex.name.toLowerCase();
      
      let category = 'Rehab';
      let bodyPart = 'Shoulder';
      let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
      let duration = '8 min';
      let sets = 3;
      let reps = 12;
      let status: 'Active' | 'Inactive' = 'Active';
      
      if (name.includes('squat')) {
        category = 'Lower Body';
        bodyPart = 'Knee & Hip';
        difficulty = 'Intermediate';
        duration = '10 min';
        sets = 3;
        reps = 10;
      } else if (name.includes('shoulder') || name.includes('abduction')) {
        category = 'Upper Body';
        bodyPart = 'Shoulder';
        difficulty = 'Beginner';
        duration = '6 min';
        sets = 3;
        reps = 12;
      } else if (name.includes('elbow') || name.includes('flexion')) {
        category = 'Upper Body';
        bodyPart = 'Elbow';
        difficulty = 'Beginner';
        duration = '5 min';
        sets = 3;
        reps = 15;
      } else if (name.includes('knee') || name.includes('extension')) {
        category = 'Lower Body';
        bodyPart = 'Knee';
        difficulty = 'Intermediate';
        duration = '8 min';
        sets = 3;
        reps = 10;
      } else if (name.includes('stretch') || name.includes('yoga')) {
        category = 'Flexibility';
        bodyPart = 'Full Body';
        difficulty = 'Beginner';
        duration = '12 min';
        sets = 2;
        reps = 8;
      } else if (ex.id % 2 === 0) {
        status = 'Inactive';
      }
      
      // Dynamic deterministic patient counts
      const assignedCount = (ex.id % 5) + 1;

      return {
        ...ex,
        category,
        bodyPart,
        difficulty,
        duration,
        sets,
        reps,
        status,
        assignedCount
      };
    });
  }, [exercisesList]);

  // 2. Statistics Summaries Calculations
  const statsSummary = useMemo(() => {
    const total = decoratedExercises.length;
    const active = decoratedExercises.filter(ex => ex.status === 'Active').length;
    const assigned = decoratedExercises.reduce((acc, ex) => acc + ex.assignedCount, 0);
    const categories = new Set(decoratedExercises.map(ex => ex.category)).size;
    
    // Count recently added (created in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = decoratedExercises.filter(ex => new Date(ex.created_at) >= sevenDaysAgo).length;

    // Completed today mock kpi
    const completedToday = 14;

    return { total, active, assigned, categories, recent, completedToday };
  }, [decoratedExercises]);

  // 3. Filtered Exercises List
  const filteredExercises = useMemo(() => {
    return decoratedExercises.filter(ex => {
      const matchesSearch = 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || ex.category === categoryFilter;
      const matchesBodyPart = bodyPartFilter === 'All' || ex.bodyPart === bodyPartFilter;
      const matchesDifficulty = difficultyFilter === 'All' || ex.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'All' || ex.status === statusFilter;

      return matchesSearch && matchesCategory && matchesBodyPart && matchesDifficulty && matchesStatus;
    });
  }, [decoratedExercises, searchQuery, categoryFilter, bodyPartFilter, difficultyFilter, statusFilter]);

  // 4. Patients filter inside Assignment Modal
  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.patient_id.toLowerCase().includes(patientSearch.toLowerCase())
    );
  }, [patients, patientSearch]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(decoratedExercises.map(ex => ex.category)));
  }, [decoratedExercises]);

  const uniqueBodyParts = useMemo(() => {
    return Array.from(new Set(decoratedExercises.map(ex => ex.bodyPart)));
  }, [decoratedExercises]);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* SECTION 1: HEADER & ACTION TOOLBAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-chosen-text-primary">Exercise Catalog Management</h2>
          <p className="text-xs text-chosen-text-muted mt-1">Configure physical rehab parameters, configure templates and assign camera tracking guides.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-[#F5F5F5] dark:bg-charcoal-850 p-1 rounded-chosen-lg border border-chosen">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                "p-1.5 rounded-chosen-md text-chosen-text-secondary transition-all",
                viewMode === 'card' ? "bg-white dark:bg-charcoal-900 text-gold-500 shadow-chosen-sm" : "hover:text-[#A27B41]"
              )}
              title="Card Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-chosen-md text-chosen-text-secondary transition-all",
                viewMode === 'table' ? "bg-white dark:bg-charcoal-900 text-gold-500 shadow-chosen-sm" : "hover:text-[#A27B41]"
              )}
              title="Table Detail View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={() => setCreateExModalOpen(true)}
            leftIcon={<Plus className="h-4.5 w-4.5" />}
            className="btn-primary py-2 px-4 shadow-chosen-md font-bold text-xs"
          >
            Create Exercise
          </Button>
        </div>
      </div>

      {/* SECTION 2: STATS SUMMARY KPI DECK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatisticCard
          label="Total Exercises"
          value={statsSummary.total}
          icon={<Dumbbell className="h-5 w-5" />}
          iconBg="bg-gold-500/10 text-gold-500"
          className="h-full"
          trend={{
            value: "Active catalog",
            direction: "up"
          }}
        />
        <StatisticCard
          label="Active Tracks"
          value={statsSummary.active}
          icon={<Activity className="h-5 w-5" />}
          iconBg="bg-emerald-500/10 text-emerald-500"
          className="h-full"
          trend={{
            value: "Pose tracking active",
            direction: "neutral"
          }}
        />
        <StatisticCard
          label="Assigned patients"
          value={statsSummary.assigned}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-cyan-500/10 text-cyan-500"
          className="h-full"
          trend={{
            value: "Treatment plans ongoing",
            direction: "up"
          }}
        />
        <StatisticCard
          label="Joint Categories"
          value={statsSummary.categories}
          icon={<Tag className="h-5 w-5" />}
          iconBg="bg-violet-500/10 text-violet-500"
          className="h-full"
          trend={{
            value: "Joint metrics mapped",
            direction: "neutral"
          }}
        />
        <StatisticCard
          label="Recently Added"
          value={statsSummary.recent}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-pink-500/10 text-pink-500"
          className="h-full"
          trend={{
            value: "Created this week",
            direction: "up"
          }}
        />
        <StatisticCard
          label="Completed Today"
          value={statsSummary.completedToday}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-amber-500/10 text-amber-500"
          className="h-full"
          trend={{
            value: "Successful sessions today",
            direction: "up"
          }}
        />
      </div>

      {/* SECTION 3: SEARCH & FILTERS BAR */}
      <Card className="p-4 bg-white dark:bg-[#0d0c18] border border-chosen shadow-chosen-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-chosen-text-muted" />
            <Input
              type="text"
              placeholder="Search exercise name, category, body parts..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick filters dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-auto xl:min-w-[55%]">
            <Select
              label=""
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Categories' },
                ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
            <Select
              label=""
              value={bodyPartFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBodyPartFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Body Parts' },
                ...uniqueBodyParts.map(bp => ({ value: bp, label: bp }))
              ]}
            />
            <Select
              label=""
              value={difficultyFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDifficultyFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Difficulties' },
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' }
              ]}
            />
            <Select
              label=""
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* SECTION 4: EXERCISE CATALOG LISTINGS */}
      {filteredExercises.length === 0 ? (
        /* Empty State */
        <Card className="py-16 text-center border border-dashed border-chosen space-y-4 max-w-xl mx-auto rounded-chosen-xl bg-chosen-surface/10">
          <div className="h-16 w-16 bg-[#F5F5F5] dark:bg-charcoal-850 rounded-full flex items-center justify-center mx-auto text-chosen-text-muted">
            <AlertCircle className="h-8 w-8 text-[#A27B41]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-chosen-text-primary">No Matching Exercises</h3>
            <p className="text-xs text-chosen-text-muted max-w-md mx-auto">
              We couldn't find any exercises matching "{searchQuery}" under the selected categories or parameters.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
              setBodyPartFilter('All');
              setDifficultyFilter('All');
              setStatusFilter('All');
            }}
            className="text-xs text-gold-500 hover:underline"
          >
            Reset All Filters
          </Button>
        </Card>
      ) : viewMode === 'card' ? (
        /* CARD VIEW MODE */
        <ResponsiveGrid colsMobile={1} colsTablet={2} colsDesktop={3} className="gap-6">
          {filteredExercises.map((ex) => (
            <Card 
              key={ex.id} 
              className="flex flex-col h-full hover:shadow-chosen-lg hover:border-gold-500/30 transition-all duration-300 group overflow-hidden border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl text-left"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[16/9] w-full bg-slate-950/40 dark:bg-slate-900/60 overflow-hidden flex items-center justify-center border-b border-chosen">
                {ex.thumbnail_url ? (
                  <img
                    src={ex.thumbnail_url}
                    alt={ex.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Dumbbell className="h-8 w-8 mx-auto text-[#A27B41]/50 group-hover:animate-pulse" />
                    <span className="text-[10px] text-chosen-text-muted uppercase tracking-wider block font-bold">Pose Tracking Active</span>
                  </div>
                )}
                
                {/* Upper Left tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-chosen-md border border-white/10">
                    {ex.category}
                  </span>
                </div>

                {/* Status indicator badge (Upper Right) */}
                <span className={cn(
                  "absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-chosen-md shadow-chosen-sm backdrop-blur-xs border",
                  ex.status === 'Active'
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  {ex.status}
                </span>
              </div>

              {/* Card Contents */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider">
                      Body Part: {ex.bodyPart}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border",
                      ex.difficulty === 'Beginner' && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                      ex.difficulty === 'Intermediate' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                      ex.difficulty === 'Advanced' && "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    )}>
                      {ex.difficulty}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-chosen-text-primary line-clamp-1 group-hover:text-[#A27B41] transition-colors">
                    {ex.name}
                  </h4>
                  <p className="text-xs text-chosen-text-muted line-clamp-2 min-h-[32px] leading-relaxed">
                    {ex.description || 'No description guidelines added yet. Camera skeletal metrics coordinates configured.'}
                  </p>
                </div>

                {/* Tracking stats preview */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#F9FBFC] dark:bg-charcoal-850/60 rounded-chosen-lg border border-chosen text-center text-2xs font-bold text-chosen-text-secondary select-none">
                  <div>
                    <span className="text-[8px] text-chosen-text-muted block uppercase tracking-wider font-bold">Duration</span>
                    <span className="mt-0.5 block font-mono text-[#A27B41]">{ex.duration}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-chosen-text-muted block uppercase tracking-wider font-bold">Reps Target</span>
                    <span className="mt-0.5 block font-mono text-chosen-text-primary">{ex.sets}x{ex.reps}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-chosen-text-muted block uppercase tracking-wider font-bold">Target ROM</span>
                    <span className="mt-0.5 block font-mono text-emerald-500">{ex.target_rom || 120}°</span>
                  </div>
                </div>

                {/* Footer Controls & Quick Actions */}
                <div className="pt-4 border-t border-chosen flex items-center justify-between">
                  <div className="flex items-center gap-2 text-chosen-text-muted select-none">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold text-chosen-text-muted">{ex.assignedCount} patients</span>
                  </div>

                  <div className="flex items-center gap-5 select-none">
                    <button
                      onClick={() => setSelectedExDetails(ex)}
                      className="text-xs font-medium text-chosen-text-muted hover:text-[#A27B41] transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedExerciseToAssign(ex.id);
                        setAssignModalOpen(true);
                      }}
                      className="text-xs font-semibold text-[#A27B41] hover:text-[#8c6734] transition-colors cursor-pointer"
                    >
                      Assign
                    </button>

                    {/* Edit Option Icon */}
                    <button
                      onClick={() => {
                        setSelectedExerciseId(ex.id);
                        setEditExName(ex.name);
                        setEditExDesc(ex.description || '');
                        setEditExInst(ex.instructions || '');
                        setEditExRom(ex.target_rom?.toString() || '');
                        setEditExThumb(ex.thumbnail_url || '');
                        setEditExModalOpen(true);
                      }}
                      className="p-1 text-chosen-text-muted hover:text-[#A27B41] transition-colors rounded hover:bg-[#F5F5F5] dark:hover:bg-charcoal-800 cursor-pointer"
                      title="Edit template details"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* Delete Option Icon */}
                    <button
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="p-1 text-red-400 hover:text-red-650 transition-colors rounded hover:bg-red-500/10 cursor-pointer"
                      title="Remove from catalog"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </ResponsiveGrid>
      ) : (
        /* TABLE VIEW MODE (DESKTOP DETAIL) */
        <Card className="overflow-hidden border border-chosen bg-white dark:bg-[#0c0b16] rounded-chosen-xl shadow-chosen-sm">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-chosen text-left text-xs">
              <thead className="bg-[#F5F5F5] dark:bg-charcoal-850 text-chosen-text-secondary uppercase font-bold tracking-wider text-2xs select-none">
                <tr>
                  <th scope="col" className="px-6 py-4">Exercise Name</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Body Part Target</th>
                  <th scope="col" className="px-6 py-4">Target ROM</th>
                  <th scope="col" className="px-6 py-4">Difficulty</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Patients</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chosen text-chosen-text-secondary">
                {filteredExercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-[#F5F5F5]/30 dark:hover:bg-charcoal-800/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-[#F5F5F5] dark:bg-charcoal-850 border border-chosen shrink-0 flex items-center justify-center overflow-hidden">
                          {ex.thumbnail_url ? (
                            <img src={ex.thumbnail_url} alt="" className="object-cover h-full w-full" />
                          ) : (
                            <Dumbbell className="h-5 w-5 text-[#A27B41]" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-chosen-text-primary block">{ex.name}</span>
                          <span className="text-[10px] text-chosen-text-muted block max-w-xs truncate">{ex.description || 'No description details'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-chosen-surface text-chosen-text-secondary rounded font-semibold text-2xs">
                        {ex.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{ex.bodyPart}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-emerald-500 font-bold">{ex.target_rom || 120}°</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border",
                        ex.difficulty === 'Beginner' && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                        ex.difficulty === 'Intermediate' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                        ex.difficulty === 'Advanced' && "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}>
                        {ex.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                        ex.status === 'Active'
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-red-500/10 border-red-500/20 text-red-500"
                      )}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-chosen-text-primary">
                      {ex.assignedCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right select-none">
                      <div className="flex items-center justify-end gap-2.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setSelectedExDetails(ex)}
                          className="text-chosen-text-muted hover:text-[#A27B41]"
                        >
                          Specs
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setSelectedExerciseToAssign(ex.id);
                            setAssignModalOpen(true);
                          }}
                          className="text-gold-500"
                        >
                          Assign
                        </Button>
                        <button
                          onClick={() => {
                            setSelectedExerciseId(ex.id);
                            setEditExName(ex.name);
                            setEditExDesc(ex.description || '');
                            setEditExInst(ex.instructions || '');
                            setEditExRom(ex.target_rom?.toString() || '');
                            setEditExThumb(ex.thumbnail_url || '');
                            setEditExModalOpen(true);
                          }}
                          className="p-1 text-chosen-text-muted hover:text-[#A27B41] transition-colors rounded"
                          title="Edit exercise"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="p-1 text-red-400 hover:text-red-650 transition-colors rounded"
                          title="Delete exercise"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: EXERCISE SPECIFICATIONS DETAIL PANEL */}
      {selectedExDetails && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedExDetails(null)}
          title={`Exercise Specifications: ${selectedExDetails.name}`}
          size="lg"
        >
          <div className="space-y-6 text-left select-none">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[#F5F5F5] dark:bg-charcoal-850 rounded-chosen-lg border border-chosen text-center">
                <span className="text-[9px] font-bold text-chosen-text-muted uppercase block">Category</span>
                <span className="text-xs font-semibold text-chosen-text-primary mt-1 block">{selectedExDetails.category}</span>
              </div>
              <div className="p-3 bg-[#F5F5F5] dark:bg-charcoal-850 rounded-chosen-lg border border-chosen text-center">
                <span className="text-[9px] font-bold text-chosen-text-muted uppercase block">Body Target</span>
                <span className="text-xs font-semibold text-chosen-text-primary mt-1 block">{selectedExDetails.bodyPart}</span>
              </div>
              <div className="p-3 bg-[#F5F5F5] dark:bg-charcoal-850 rounded-chosen-lg border border-chosen text-center">
                <span className="text-[9px] font-bold text-chosen-text-muted uppercase block">Target ROM</span>
                <span className="text-xs font-bold text-emerald-500 mt-1 block">{selectedExDetails.target_rom || 120}°</span>
              </div>
              <div className="p-3 bg-[#F5F5F5] dark:bg-charcoal-850 rounded-chosen-lg border border-chosen text-center">
                <span className="text-[9px] font-bold text-chosen-text-muted uppercase block">Difficulty</span>
                <span className="text-xs font-semibold text-chosen-text-primary mt-1 block">{selectedExDetails.difficulty}</span>
              </div>
            </div>

            {/* Description & Target Joints */}
            <div className="space-y-2">
              <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Description</span>
              <p className="text-xs text-chosen-text-secondary leading-relaxed bg-[#FAFBFC] dark:bg-charcoal-850/50 p-4 rounded-chosen-lg border border-chosen">
                {selectedExDetails.description || 'No description guidelines registered for this catalog item.'}
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Step-By-Step Instructions</span>
              <div className="text-xs text-chosen-text-secondary bg-[#FAFBFC] dark:bg-charcoal-850/50 p-4 rounded-chosen-lg border border-chosen space-y-2.5">
                {selectedExDetails.instructions ? (
                  selectedExDetails.instructions.split('\n').map((inst, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="h-5 w-5 bg-gold-500/10 border border-gold-500/20 text-[#A27B41] text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="mt-0.5 leading-relaxed">{inst}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-chosen-text-muted text-2xs italic">No instructions guidelines provided.</p>
                )}
              </div>
            </div>

            {/* Target Joints & Motion Support Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 bg-[#F9FBFC] dark:bg-[#11101e] p-4 rounded-chosen-lg border border-chosen">
                <span className="text-[10px] text-[#A27B41] font-bold uppercase tracking-wider block flex items-center gap-1.5">
                  <Activity className="h-4 w-4" /> Camera Tracking Scope
                </span>
                <div className="space-y-1.5 text-xs text-chosen-text-secondary pt-2">
                  <div className="flex justify-between border-b border-chosen pb-1 text-2xs">
                    <span>Motion Tracking support</span>
                    <span className="font-bold text-emerald-500">Fully Supported</span>
                  </div>
                  <div className="flex justify-between border-b border-chosen pb-1 text-2xs">
                    <span>Calculations type</span>
                    <span className="font-semibold">Joint Angle / ROM Delta</span>
                  </div>
                  <div className="flex justify-between text-2xs">
                    <span>Landmarks tracked</span>
                    <span className="font-mono text-chosen-text-muted text-[10px] truncate max-w-[150px] inline-block">
                      {selectedExDetails.target_joints?.list?.join(', ') || 'Shoulder R, Elbow R'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-[#F9FBFC] dark:bg-[#11101e] p-4 rounded-chosen-lg border border-chosen">
                <span className="text-[10px] text-[#A27B41] font-bold uppercase tracking-wider block flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Patient Assignments
                </span>
                <div className="space-y-1.5 text-xs text-chosen-text-secondary pt-2">
                  <div className="flex justify-between border-b border-chosen pb-1 text-2xs">
                    <span>Currently Assigned</span>
                    <span className="font-bold text-chosen-text-primary">{selectedExDetails.assignedCount} Patients</span>
                  </div>
                  <div className="flex justify-between border-b border-chosen pb-1 text-2xs">
                    <span>Weekly Compliance</span>
                    <span className="font-semibold text-emerald-500">92% Average</span>
                  </div>
                  <div className="flex justify-between text-2xs">
                    <span>Target repetitions</span>
                    <span className="font-semibold text-chosen-text-primary">{selectedExDetails.sets} Sets / {selectedExDetails.reps} Reps</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail graphic preview */}
            <div className="space-y-2 border-t border-chosen pt-4">
              <span className="text-[10px] text-chosen-text-muted font-bold uppercase tracking-wider block">Visual Template</span>
              <div className="w-full aspect-[16/9] rounded-chosen-lg border border-chosen bg-slate-950/40 flex items-center justify-center overflow-hidden">
                {selectedExDetails.thumbnail_url ? (
                  <img src={selectedExDetails.thumbnail_url} alt="" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-center space-y-2.5">
                    <Dumbbell className="h-10 w-10 text-[#A27B41]/50 mx-auto" />
                    <p className="text-chosen-text-muted text-2xs font-semibold uppercase tracking-wider">Joint landmarks overlay active during workout</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-chosen">
              <Button
                variant="secondary"
                onClick={() => setSelectedExDetails(null)}
                className="flex-1 font-bold py-2.5 text-xs"
              >
                Close Panel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const exId = selectedExDetails.id;
                  setSelectedExDetails(null);
                  setSelectedExerciseToAssign(exId);
                  setAssignModalOpen(true);
                }}
                className="flex-1 font-bold py-2.5 text-xs btn-primary shadow-chosen-sm"
              >
                Assign to Patient
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ASSIGN TO PATIENT (REDESIGNED) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Exercise to Patient"
      >
        <div className="space-y-4 text-left select-none">
          <p className="text-2xs text-chosen-text-muted">
            Configure target constraints and instructions. The patient will immediately receive details inside their portal.
          </p>

          <form onSubmit={handleAssignExercise} className="space-y-4">
            {/* 1. Patient Selection Box */}
            <div className="space-y-2">
              <span className="text-[10px] text-chosen-text-muted font-bold uppercase block tracking-wider">1. Select Patient</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-chosen-text-muted" />
                <Input
                  type="text"
                  placeholder="Filter patient name..."
                  value={patientSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientSearch(e.target.value)}
                  className="pl-9 py-1.5"
                />
              </div>

              {/* Patient searchable list block */}
              <div className="max-h-40 overflow-y-auto border border-chosen rounded-chosen-lg divide-y divide-chosen bg-[#FAFBFC] dark:bg-charcoal-900 panel-scroll">
                {filteredPatients.length === 0 ? (
                  <div className="p-3 text-center text-chosen-text-muted text-2xs italic">No patients found</div>
                ) : (
                  filteredPatients.map((p) => {
                    const isSelected = selectedPatientId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPatientId(p.id)}
                        className={cn(
                          "w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer",
                          isSelected ? "bg-gold-500/5 text-gold-500 font-semibold" : "text-chosen-text-secondary hover:bg-chosen-surface/10"
                        )}
                      >
                        <div>
                          <span className="block font-bold">{p.full_name}</span>
                          <span className="text-[9px] text-chosen-text-muted font-mono">{p.patient_id} • {p.diagnosis || 'Rehab Treatment'}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-gold-500" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Choose Exercise display (Pre-selected) */}
            <div className="space-y-2">
              <Select
                label="2. Choose Exercise"
                required
                value={selectedExerciseToAssign}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedExerciseToAssign(e.target.value ? Number(e.target.value) : '')}
                options={[
                  { value: '', label: 'Select an exercise...' },
                  ...exercisesList.map((ex) => ({
                    value: ex.id,
                    label: `${ex.name} (ROM Target: ${ex.target_rom || 120}°)`
                  }))
                ]}
              />
            </div>

            {/* 3. Due Date & Practitioner notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Due Date (optional)"
                type="date"
                value={assignDueDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignDueDate(e.target.value)}
              />
              <div className="flex flex-col justify-end pb-1.5 select-none">
                <span className="text-[8px] text-chosen-text-muted uppercase tracking-wider block font-bold">Assignment Schedule</span>
                <span className="text-2xs text-chosen-text-secondary font-medium block mt-1">Patient checklist updates instantly.</span>
              </div>
            </div>

            <Textarea
              label="Therapist Treatment Notes / Instructions"
              placeholder="e.g. Please perform 3 sets daily. Stop if you experience sharp knee flexor stiffness..."
              className="min-h-[60px]"
            />

            <div className="pt-2 flex gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="flex-1 font-bold py-2.5 text-xs border-chosen"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assigning || !selectedPatientId || !selectedExerciseToAssign}
                isLoading={assigning}
                className="flex-1 font-bold py-2.5 text-xs btn-primary shadow-chosen-sm"
              >
                Assign Exercise Plan
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL: CREATE EXERCISE */}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExName(e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Short summary of the exercise..."
            value={newExDesc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewExDesc(e.target.value)}
            className="min-h-[60px]"
          />
          <Textarea
            label="Instructions"
            placeholder="Instructions detailing flexion extension guides..."
            value={newExInst}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewExInst(e.target.value)}
            className="min-h-[65px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target ROM (Degrees)"
              type="number"
              placeholder="e.g. 135"
              value={newExRom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExRom(e.target.value)}
            />
            <Input
              label="Thumbnail Graphic URL"
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={newExThumb}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExThumb(e.target.value)}
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

      {/* MODAL: EDIT EXERCISE */}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditExName(e.target.value)}
          />
          <Textarea
            label="Description"
            value={editExDesc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditExDesc(e.target.value)}
            className="min-h-[60px]"
          />
          <Textarea
            label="Instructions"
            value={editExInst}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditExInst(e.target.value)}
            className="min-h-[65px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target ROM (Degrees)"
              type="number"
              value={editExRom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditExRom(e.target.value)}
            />
            <Input
              label="Thumbnail Graphic URL"
              type="text"
              value={editExThumb}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditExThumb(e.target.value)}
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
    </div>
  );
};
