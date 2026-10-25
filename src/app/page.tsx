'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Task, Submission, UserProfile, NavigationTab } from '@/types';
import Navbar from '@/components/Navbar';
import StatsBanner from '@/components/StatsBanner';
import TaskCard from '@/components/TaskCard';
import AuthModal from '@/components/AuthModal';
import SubmissionsView from '@/components/SubmissionsView';
import LeaderboardView from '@/components/LeaderboardView';
import RulesRubricView from '@/components/RulesRubricView';
import AdminPanel from '@/components/AdminPanel';
import Footer from '@/components/Footer';
import { 
  BookOpen, 
  ArrowRight, 
  Rocket,
  ShieldCheck,
  Video,
  FileText,
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import Github from '@/components/GithubIcon';

export default function Home() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [masterDeadline, setMasterDeadline] = useState<string>('2026-11-15T23:59:59.000Z');
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('uncompleted'); // default to uncompleted tasks for competitor focus

  // Fetch master settings from database
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings?.master_deadline) {
        setMasterDeadline(data.settings.master_deadline);
      }
    } catch (err) {
      console.warn('Dynamic settings fetch error:', err);
    }
  }, []);

  // Fetch dynamic tasks from database / API without predefined presets
  const fetchTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const res = await fetch('/api/admin/tasks');
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks as Task[]);
      } else {
        const { data: directData, error: directErr } = await supabase
          .from('tasks')
          .select('*')
          .order('id', { ascending: true });

        if (!directErr && directData) {
          setTasks(directData as Task[]);
        }
      }
    } catch (err) {
      console.warn('Dynamic task fetch error:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

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

  // Load user session, dynamic tasks and master deadline
  useEffect(() => {
    async function initSession() {
      try {
        await Promise.all([fetchTasks(), fetchSettings()]);

        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const isAdmin = profile?.role === 'admin' || session.user.user_metadata?.role === 'admin';

          const userProf: UserProfile = profile || {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || (isAdmin ? 'ASL Competition Administrator' : 'Individual Competitor'),
            department: session.user.user_metadata?.department || (isAdmin ? 'Alpha Science Lab Executive Board' : 'Engineering'),
            batch: session.user.user_metadata?.batch || (isAdmin ? 'Faculty & Jury' : '2024'),
            registration_number: session.user.user_metadata?.registration_number || (isAdmin ? 'ASL-ADMIN-CHAIR' : 'REG-ASL-001'),
            role: isAdmin ? 'admin' : 'participant',
          };
          setUserProfile(userProf);
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

        const isAdmin = profile?.role === 'admin' || session.user.user_metadata?.role === 'admin';

        const userProf: UserProfile = profile || {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || (isAdmin ? 'ASL Competition Administrator' : 'Individual Competitor'),
          department: session.user.user_metadata?.department || (isAdmin ? 'Alpha Science Lab Executive Board' : 'Engineering'),
          batch: session.user.user_metadata?.batch || (isAdmin ? 'Faculty & Jury' : '2024'),
          registration_number: session.user.user_metadata?.registration_number || (isAdmin ? 'ASL-ADMIN-CHAIR' : 'REG-ASL-001'),
          role: isAdmin ? 'admin' : 'participant',
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
  }, [fetchTasks, loadSubmissions, fetchSettings]);

  // Route protection derived during render: Non-admin users cannot stay on admin tab
  const activeTab: NavigationTab = currentTab === 'admin' && userProfile?.role !== 'admin' ? 'overview' : currentTab;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setSubmissions({});
    setCurrentTab('overview');
  };

  // Secure login handler: automatically route admins to Admin Dashboard, participants to Task Dashboard
  const handleAuthSuccess = (profile: UserProfile, isAdminCredential?: boolean) => {
    setUserProfile(profile);
    loadSubmissions(profile.id);

    if (isAdminCredential || profile.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('tasks');
    }
  };

  const completedCount = Object.values(submissions).filter((s) => s.status === 'submitted' || s.status === 'evaluated').length;
  const totalAvailablePoints = tasks.reduce((acc, t) => acc + t.points, 0);
  const totalPointsEarned = Object.values(submissions).reduce((acc, s) => acc + (Number(s.score) || 0), 0);

  // Uncompleted tasks list
  const uncompletedTasks = tasks.filter((t) => {
    const sub = submissions[t.id];
    return !sub || sub.status === 'draft';
  });

  // Filter tasks based on status and category
  const filteredTasks = tasks.filter((task) => {
    const sub = submissions[task.id];
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'uncompleted' || filterStatus === 'pending') {
      matchesStatus = !sub || sub.status === 'draft';
    } else if (filterStatus === 'completed' || filterStatus === 'submitted') {
      matchesStatus = sub?.status === 'submitted' || sub?.status === 'evaluated';
    }

    return matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={activeTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        submissionCount={completedCount}
        totalTasksCount={tasks.length}
        masterDeadline={masterDeadline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* TAB 1: OVERVIEW & HUB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 sm:space-y-10 animate-fade-in">
            
            {/* Clean Minimal Hero Section */}
            <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 glass-panel border border-slate-800/80 overflow-hidden">
              
              {/* Background Glow Accents */}
              <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wide bg-linear-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-blue-500/30 mb-4 sm:mb-6 flex-wrap">
                  <Rocket className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>ALPHA SCIENCE LAB (ASL) NATIONAL ARENA</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Multi-Stage Technical Innovation Arena
                </h1>

                <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Welcome to the Alpha Science Lab competition hub. Complete and submit technical milestones powered by a dynamic database engine. Inspect embedded YouTube tutorials, schematics, and presentation decks, then submit your GitHub monorepo.
                </p>

                {/* Call to Actions */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setCurrentTab('tasks')}
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-600/30 transition-all group cursor-pointer"
                  >
                    <span>View {tasks.length} Active Challenges</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {!userProfile && (
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Individual Register / Login</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentTab('rules')}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>View Rubric & Rules</span>
                  </button>
                </div>
              </div>

              {/* Supported Formats Pill Strip */}
              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Accepted Output Formats:
                </span>
                <div className="flex items-center gap-2 text-slate-300 font-medium text-xs">
                  <Github className="w-3.5 h-3.5 text-purple-400" />
                  <span>GitHub Monorepo</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium text-xs">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Video Demonstrations</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium text-xs">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>PPTX & PDF Decks</span>
                </div>
              </div>
            </div>

            {/* Live Competition Statistics */}
            <StatsBanner
              completedCount={completedCount}
              totalTasks={tasks.length}
              totalPointsEarned={totalPointsEarned}
              totalAvailablePoints={totalAvailablePoints}
            />

            {/* Uncompleted Tasks Priority Section */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-mono">
                      Action Required
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      Uncompleted Challenges ({uncompletedTasks.length})
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    Small minimal cards for uncompleted tasks. Click any card to navigate directly to its dedicated detail page and submit.
                  </p>
                </div>
                
                <button
                  onClick={() => setCurrentTab('tasks')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                >
                  <span>Explore All Tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {loadingTasks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-4" />
                  ))}
                </div>
              ) : uncompletedTasks.length === 0 && tasks.length > 0 ? (
                <div className="p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">All Tasks Completed!</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Outstanding achievement! You have submitted deliverables for all available competition challenges.
                  </p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Custom Tasks Published Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Administrators can create and publish custom technical tasks anytime through the Admin Panel.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uncompletedTasks.slice(0, 6).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      submission={submissions[task.id] || null}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ALL COMPETITION TASKS (Participant Task Dashboard) */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header & Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-panel">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-400">{tasks.length} DYNAMIC CHALLENGES</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                    Total: {totalAvailablePoints} PTS
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Completed: {completedCount}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Technical Submission Center
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any task card to open its dedicated detail page with embedded resource players and designated submission area.
                </p>
              </div>

              {/* Status and Category Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 flex-1 sm:flex-initial"
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

                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 p-1 flex-1 sm:flex-initial">
                  <button
                    onClick={() => setFilterStatus('uncompleted')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'uncompleted'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Uncompleted ({uncompletedTasks.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'all'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({tasks.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'completed'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Task Grid */}
            {loadingTasks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-4" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Challenges Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {tasks.length === 0 
                    ? 'No tasks have been published in the database yet. Competition admins can create challenges anytime.'
                    : 'No tasks match your selected filter criteria. Try toggling status or category.'}
                </p>
                {userProfile?.role === 'admin' && (
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Custom Task in Admin Panel</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    submission={submissions[task.id] || null}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: MY SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div className="animate-fade-in">
            <SubmissionsView
              tasks={tasks}
              submissions={submissions}
              userProfile={userProfile}
              onEditTask={(t) => {
                router.push(`/tasks/${t.id}`);
              }}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="animate-fade-in">
            <LeaderboardView totalTasksCount={tasks.length} />
          </div>
        )}

        {/* TAB 5: RULES & RUBRICS */}
        {activeTab === 'rules' && (
          <div className="animate-fade-in">
            <RulesRubricView />
          </div>
        )}

        {/* TAB 6: ADMIN PANEL (STRICTLY PROTECTED - VISIBLE ONLY TO AUTHENTICATED ADMIN) */}
        {activeTab === 'admin' && userProfile?.role === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              tasks={tasks}
              onTasksUpdated={fetchTasks}
              currentUser={userProfile}
              masterDeadline={masterDeadline}
              onDeadlineUpdated={(newDeadline) => setMasterDeadline(newDeadline)}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
