'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Task, Submission, UserProfile } from '@/types';
import Navbar from '@/components/Navbar';
import StatsBanner from '@/components/StatsBanner';
import TaskCard from '@/components/TaskCard';
import TaskSubmissionModal from '@/components/TaskSubmissionModal';
import AuthModal from '@/components/AuthModal';
import SubmissionsView from '@/components/SubmissionsView';
import LeaderboardView from '@/components/LeaderboardView';
import RulesRubricView from '@/components/RulesRubricView';
import Footer from '@/components/Footer';
import { 
  BookOpen, 
  ArrowRight, 
  Rocket,
  ShieldCheck,
  Video,
  FileText
} from 'lucide-react';
import Github from '@/components/GithubIcon';

const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: 'Research Formulation & Literature Review',
    short_title: 'Problem & Lit Review',
    category: 'Ideation & Research',
    description: 'Define the technical challenge, conduct a comprehensive literature review, specify target benchmarks, and formulate your engineering hypothesis.',
    points: 100,
    deadline: '2026-11-07T00:00:00Z',
    allowed_formats: ['pptx', 'github', 'document'],
    deliverables: ['Executive Abstract', 'Background & Related Works', 'Formulated Hypothesis', 'Initial Feasibility Study']
  },
  {
    id: 2,
    title: 'System Architecture & Engineering Schematics',
    short_title: 'Architecture & Schematics',
    category: 'Design & Architecture',
    description: 'Develop end-to-end hardware-software system block diagrams, power distribution networks, circuit schematics, and pinout tables.',
    points: 100,
    deadline: '2026-11-14T00:00:00Z',
    allowed_formats: ['pptx', 'github', 'document'],
    deliverables: ['System Block Diagrams', 'Component BOM (Bill of Materials)', 'Circuit Schematics (KiCad/Eagle)', 'Interface Protocols']
  },
  {
    id: 3,
    title: '3D CAD Modeling & Structural Simulation',
    short_title: 'CAD & Simulation',
    category: 'Mechanical & Physical',
    description: 'Design precision 3D CAD mechanical enclosures, structural chassis, aerodynamic/thermal simulations, and bill of materials.',
    points: 100,
    deadline: '2026-11-21T00:00:00Z',
    allowed_formats: ['pptx', 'video', 'github'],
    deliverables: ['STEP / STL CAD Files', 'Stress & Thermal FEA Report', 'Exploded Assembly View', 'Rendered Turntable']
  },
  {
    id: 4,
    title: 'Embedded Firmware & Core Algorithm Monorepo',
    short_title: 'Firmware & Core Algorithms',
    category: 'Software Development',
    description: 'Establish the official GitHub repository with clean firmware code, driver libraries, algorithmic logic, unit tests, and continuous integration pipeline.',
    points: 100,
    deadline: '2026-11-28T00:00:00Z',
    allowed_formats: ['github'],
    deliverables: ['Clean GitHub Repository with README', 'Modular Source Code', 'Automated Unit Tests', 'Build & Flashing Guide']
  },
  {
    id: 5,
    title: 'Mid-Term Milestone Evaluation & Slide Deck',
    short_title: 'Mid-Term Slide Deck',
    category: 'Milestone Evaluation',
    description: 'Present your 50% milestone progress, prototype status, test data, budget expenditure, and risk mitigation strategies in an executive PPTX presentation.',
    points: 150,
    deadline: '2026-12-05T00:00:00Z',
    allowed_formats: ['pptx', 'video'],
    deliverables: ['Professional PPTX Deck (15-20 Slides)', 'Milestone Verification Matrix', 'Risk Management & Timeline Plan']
  },
  {
    id: 6,
    title: 'Live Prototype Demonstration & Telemetry Video',
    short_title: 'Prototype Demo Video',
    category: 'Demonstration',
    description: 'Produce a crisp 3 to 5-minute video demonstrating live hardware in the loop, sensor calibration, wireless telemetry, and real-time execution.',
    points: 150,
    deadline: '2026-12-12T00:00:00Z',
    allowed_formats: ['video', 'github'],
    deliverables: ['High-Resolution Demo Video (MP4/WebM)', 'Live Hardware Run', 'Sensor Telemetry Visualizer Link']
  },
  {
    id: 7,
    title: 'AI / ML Model Pipeline & Analytics Notebook',
    short_title: 'AI/ML Data Pipeline',
    category: 'Data Science & AI',
    description: 'Deploy machine learning models or data processing algorithms. Include training logs, validation metrics, confusion matrices, and Jupyter/Colab notebooks.',
    points: 100,
    deadline: '2026-12-19T00:00:00Z',
    allowed_formats: ['github', 'pptx'],
    deliverables: ['Jupyter Notebook / Python Pipeline', 'Model Weights & Checkpoints', 'Accuracy / F1 Performance Metrics']
  },
  {
    id: 8,
    title: 'Field Testing, Reliability & FMEA Report',
    short_title: 'Stress Testing & FMEA',
    category: 'Validation & Quality',
    description: 'Conduct stress testing, extreme environment verification, Failure Mode and Effects Analysis (FMEA), and reliability optimization.',
    points: 100,
    deadline: '2026-12-26T00:00:00Z',
    allowed_formats: ['pptx', 'document', 'github'],
    deliverables: ['FMEA Severity Matrix', 'Stress & Vibration Test Logs', 'Safety Protocol Verification']
  },
  {
    id: 9,
    title: 'Final Project Pitch Deck & Commercialization',
    short_title: 'Final Pitch Deck',
    category: 'Presentation & Business',
    description: 'Craft an impactful executive slide deck detailing the final engineering solution, commercial viability, manufacturing cost analysis, and scalability.',
    points: 150,
    deadline: '2027-01-02T00:00:00Z',
    allowed_formats: ['pptx', 'video'],
    deliverables: ['Executive Master Pitch Deck (PPTX)', 'Unit Economics & BOM Scaling', 'Market & Application Impact']
  },
  {
    id: 10,
    title: 'Grand Finale: Monorepo & Final Video Showcase',
    short_title: 'Grand Finale Showcase',
    category: 'Grand Finale',
    description: 'Submit your comprehensive GitHub monorepo documentation alongside your flagship 4K/HD video presentation for final jury evaluation and awards.',
    points: 200,
    deadline: '2027-01-09T00:00:00Z',
    allowed_formats: ['video', 'pptx', 'github'],
    deliverables: ['Complete GitHub Monorepo Tagged Release', 'Flagship 5-min 4K Video Showcase', 'Complete Archival Technical Manual']
  }
];

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'tasks' | 'submissions' | 'leaderboard' | 'rules'>('overview');
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Modals state
  const [activeTaskForSubmission, setActiveTaskForSubmission] = useState<Task | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch submissions from Supabase
  const loadSubmissions = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        const map: Record<number, Submission> = {};
        data.forEach((s: Submission) => {
          map[s.task_id] = s;
        });
        setSubmissions(map);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  }, []);

  // Load user session and tasks from Supabase
  useEffect(() => {
    async function initSession() {
      try {
        // Fetch tasks from Supabase
        const { data: tasksData, error: tasksErr } = await supabase
          .from('tasks')
          .select('*')
          .order('id', { ascending: true });

        if (!tasksErr && tasksData && tasksData.length > 0) {
          setTasks(tasksData as Task[]);
        }

        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userProf: UserProfile = profile || {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'Participant',
            team_name: session.user.user_metadata?.team_name || 'Alpha Team',
            institution: session.user.user_metadata?.institution || 'ASL Academy',
            track: session.user.user_metadata?.track || 'Engineering Track',
            role: 'participant',
          };
          setUserProfile(userProf);

          // Fetch submissions for this user
          loadSubmissions(session.user.id);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }

    initSession();

    // Listen for auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const userProf: UserProfile = profile || {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'Participant',
          team_name: session.user.user_metadata?.team_name || 'Alpha Team',
          institution: session.user.user_metadata?.institution || 'ASL Academy',
          track: session.user.user_metadata?.track || 'Engineering Track',
          role: 'participant',
        };
        setUserProfile(userProf);
        loadSubmissions(session.user.id);
      } else {
        setUserProfile(null);
        setSubmissions({});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSubmissions]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setSubmissions({});
  };

  const handleSubmissionSaved = (saved: Submission) => {
    setSubmissions((prev) => ({
      ...prev,
      [saved.task_id]: saved,
    }));
  };

  const completedCount = Object.values(submissions).filter((s) => s.status === 'submitted' || s.status === 'evaluated').length;
  const totalAvailablePoints = tasks.reduce((acc, t) => acc + t.points, 0);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const sub = submissions[task.id];
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'submitted') {
      matchesStatus = sub?.status === 'submitted' || sub?.status === 'evaluated';
    } else if (filterStatus === 'pending') {
      matchesStatus = !sub || sub.status === 'draft';
    }

    return matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        submissionCount={completedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* TAB 1: OVERVIEW & HUB */}
        {currentTab === 'overview' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Hero Section */}
            <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-slate-800/80 overflow-hidden">
              
              {/* Background Glow Accents */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-linear-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-blue-500/30 mb-6">
                  <Rocket className="w-4 h-4 text-cyan-400" />
                  <span>ALPHA SCIENCE LAB (ASL) NATIONAL COMPETITION</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Multi-Stage Technical Innovation Arena
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Welcome to the Alpha Science Lab competition hub. Complete and submit deliverables for <strong className="text-white">up to ten distinct technical tasks</strong> spanning literature research, CAD modeling, embedded firmware, prototype video demonstrations, and executive pitch decks.
                </p>

                {/* Call to Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setCurrentTab('tasks')}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-600/30 transition-all group"
                  >
                    <span>Explore 10 Tasks & Submit</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {!userProfile && (
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Register or Sign In</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentTab('rules')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>View Submission Rubric</span>
                  </button>
                </div>
              </div>

              {/* Supported Formats Pill Strip */}
              <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Accepted Output Formats:
                </span>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>MP4 / YouTube / Vimeo Demonstration Videos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>PowerPoint (.PPTX) & PDF Slide Decks</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Github className="w-4 h-4 text-purple-400" />
                  <span>GitHub Monorepo & Branch Tags</span>
                </div>
              </div>
            </div>

            {/* Live Competition Statistics */}
            <StatsBanner
              completedCount={completedCount}
              totalTasks={tasks.length}
              totalPointsEarned={0}
              totalAvailablePoints={totalAvailablePoints}
            />

            {/* Quick Task Shortcuts Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Competition Milestones
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    10 structured phases to take your project from literature review to grand finale showcase
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('tasks')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                >
                  <span>View All 10 Tasks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    submission={submissions[task.id] || null}
                    onOpenSubmission={(t) => {
                      if (!userProfile) {
                        setAuthModalOpen(true);
                      } else {
                        setActiveTaskForSubmission(t);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ALL 10 COMPETITION TASKS */}
        {currentTab === 'tasks' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header & Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400">10 DISTINCT CHALLENGE TASKS</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                    Total: {totalAvailablePoints} PTS
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Technical Submission Center
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any task to submit videos, presentation slide decks (PPTX), or GitHub repositories.
                </p>
              </div>

              {/* Status and Category Filters */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">All Categories</option>
                  <option value="Ideation & Research">Ideation & Research</option>
                  <option value="Design & Architecture">Design & Schematics</option>
                  <option value="Mechanical & Physical">Mechanical & CAD</option>
                  <option value="Software Development">Software & Firmware</option>
                  <option value="Milestone Evaluation">Milestone Decks</option>
                  <option value="Demonstration">Video Demonstrations</option>
                  <option value="Data Science & AI">AI / ML Pipelines</option>
                  <option value="Grand Finale">Grand Finale</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted Only</option>
                  <option value="pending">Pending Submission</option>
                </select>
              </div>
            </div>

            {/* Task Grid (All 10 Tasks) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  submission={submissions[task.id] || null}
                  onOpenSubmission={(t) => {
                    if (!userProfile) {
                      setAuthModalOpen(true);
                    } else {
                      setActiveTaskForSubmission(t);
                    }
                  }}
                />
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: MY SUBMISSIONS */}
        {currentTab === 'submissions' && (
          <div className="animate-fade-in">
            <SubmissionsView
              tasks={tasks}
              submissions={submissions}
              userProfile={userProfile}
              onEditTask={(t) => setActiveTaskForSubmission(t)}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: LEADERBOARD */}
        {currentTab === 'leaderboard' && (
          <div className="animate-fade-in">
            <LeaderboardView />
          </div>
        )}

        {/* TAB 5: RULES & RUBRICS */}
        {currentTab === 'rules' && (
          <div className="animate-fade-in">
            <RulesRubricView />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Task Submission Modal */}
      {activeTaskForSubmission && (
        <TaskSubmissionModal
          key={activeTaskForSubmission.id}
          task={activeTaskForSubmission}
          submission={submissions[activeTaskForSubmission.id] || null}
          userProfile={userProfile}
          isOpen={!!activeTaskForSubmission}
          onClose={() => setActiveTaskForSubmission(null)}
          onSubmitted={handleSubmissionSaved}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(profile) => {
          setUserProfile(profile);
          loadSubmissions(profile.id);
        }}
      />

    </div>
  );
}
