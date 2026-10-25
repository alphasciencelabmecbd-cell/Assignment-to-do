'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Task, Submission, UserProfile, AllowedFormat } from '@/types';
import TaskResourcePlayers from '@/components/TaskResourcePlayers';
import AnimatedCheckmark from '@/components/AnimatedCheckmark';
import AuthModal from '@/components/AuthModal';
import Github from '@/components/GithubIcon';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Sparkles,
  ShieldCheck,
  Video,
  FileText,
  FileCode,
  Edit3,
  UploadCloud,
  ImageIcon
} from 'lucide-react';

function TaskDetailContent() {
  const params = useParams();
  const taskId = parseInt(params.id as string, 10);

  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [masterDeadline, setMasterDeadline] = useState<string>('2026-11-15T23:59:59.000Z');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Dynamic Submission Form State
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [videoUrl, setVideoUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState(false);

  // Refresh submission after auth or edit
  const refreshSubmission = useCallback(async (userId: string) => {
    try {
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .maybeSingle();

      if (subData) {
        setSubmission(subData as Submission);
        setGithubUrl(subData.github_url || '');
        setGithubBranch(subData.github_branch || 'main');
        setVideoUrl(subData.video_url || '');
        setDocumentUrl(subData.document_url || subData.pptx_url || '');
        setImageUrl(subData.image_url || '');
        setNotes(subData.notes || '');
      }
    } catch (err) {
      console.error('Error refreshing submission:', err);
    }
  }, [taskId]);

  // Load task, master deadline, and existing submission
  useEffect(() => {
    let ignore = false;

    async function init() {
      setLoading(true);
      try {
        // 1. Fetch master settings
        try {
          const setRes = await fetch('/api/settings');
          const setData = await setRes.json();
          if (setData.settings?.master_deadline && !ignore) {
            setMasterDeadline(setData.settings.master_deadline);
          }
        } catch {
          // ignore fallback
        }

        // 2. Fetch task directly from Supabase
        const { data: taskData, error: taskErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single();

        if (!ignore && !taskErr && taskData) {
          setTask(taskData as Task);
        } else if (!ignore) {
          // Fallback fetch via API
          const res = await fetch('/api/admin/tasks');
          const data = await res.json();
          const found = (data.tasks || []).find((t: Task) => t.id === taskId);
          if (found && !ignore) setTask(found);
        }

        // 3. Fetch active session and user profile
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !ignore) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!ignore) {
            const prof: UserProfile = profile || {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || 'Individual Competitor',
              department: session.user.user_metadata?.department || 'Engineering',
              batch: session.user.user_metadata?.batch || '2024',
              registration_number: session.user.user_metadata?.registration_number || 'REG-PENDING',
              role: profile?.role || 'participant',
            };
            setUserProfile(prof);

            // 4. Fetch submission for this task
            const { data: subData } = await supabase
              .from('submissions')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('task_id', taskId)
              .maybeSingle();

            if (subData && !ignore) {
              setSubmission(subData as Submission);
              setGithubUrl(subData.github_url || '');
              setGithubBranch(subData.github_branch || 'main');
              setVideoUrl(subData.video_url || '');
              setDocumentUrl(subData.document_url || subData.pptx_url || '');
              setImageUrl(subData.image_url || '');
              setNotes(subData.notes || '');
            }
          }
        }
      } catch (err) {
        console.error('Task detail initialization error:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (!isNaN(taskId)) {
      init();
    }

    return () => {
      ignore = true;
    };
  }, [taskId]);

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userProfile) {
      setAuthModalOpen(true);
      return;
    }

    setUploadingImage(true);
    setErrorMsg(null);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userProfile.id}/task-${taskId}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('asl-submissions')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);
      } else {
        const { data: publicData } = supabase.storage
          .from('asl-submissions')
          .getPublicUrl(data.path);
        setImageUrl(publicData.publicUrl);
      }
    } catch {
      setErrorMsg('Error uploading image deliverable.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Determine which submission formats are allowed for this task
  const allowed = (task?.allowed_formats || ['github']) as AllowedFormat[];
  const isGithubAllowed = allowed.includes('github');
  const isVideoAllowed = allowed.includes('video');
  const isDocumentAllowed = allowed.includes('document') || allowed.includes('pptx');
  const isImageAllowed = allowed.includes('image');

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!userProfile) {
      setAuthModalOpen(true);
      return;
    }

    // Dynamic validation based on enabled formats
    if (isGithubAllowed && githubUrl.trim()) {
      if (!githubUrl.includes('github.com')) {
        setErrorMsg('Please enter a valid GitHub repository URL (e.g. https://github.com/username/project).');
        return;
      }
    }

    const hasAnyDeliverable =
      (isGithubAllowed && Boolean(githubUrl.trim())) ||
      (isVideoAllowed && Boolean(videoUrl.trim())) ||
      (isDocumentAllowed && Boolean(documentUrl.trim())) ||
      (isImageAllowed && Boolean(imageUrl.trim()));

    if (!hasAnyDeliverable) {
      setErrorMsg('Please fill in at least one required deliverable field enabled for this challenge.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          user_id: userProfile.id,
          github_url: isGithubAllowed && githubUrl.trim() ? githubUrl.trim() : null,
          github_branch: isGithubAllowed && githubBranch.trim() ? githubBranch.trim() : 'main',
          video_url: isVideoAllowed && videoUrl.trim() ? videoUrl.trim() : null,
          document_url: isDocumentAllowed && documentUrl.trim() ? documentUrl.trim() : null,
          pptx_url: isDocumentAllowed && documentUrl.trim() ? documentUrl.trim() : null,
          image_url: isImageAllowed && imageUrl.trim() ? imageUrl.trim() : null,
          notes: notes.trim() || null,
          team_name: userProfile.full_name || userProfile.email,
          status: 'submitted',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit task deliverable');
      }

      setSubmission(data.submission);
      setEditingMode(false);
      setSuccessMsg('Task submitted and validated successfully in the database!');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch (err) {
        console.error('Confetti animation error:', err);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving deliverable');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = submission?.status === 'submitted';
  const isEvaluated = submission?.status === 'evaluated';
  const isCompleted = isSubmitted || isEvaluated;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Breadcrumb Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer min-h-9.5 touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Arena Dashboard</span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">&bull;</span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Challenge #{taskId}
          </span>
        </div>

        <div>
          {userProfile ? (
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold text-white truncate max-w-28 sm:max-w-none">
                {userProfile.full_name || userProfile.email}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer min-h-9.5 touch-manipulation"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
              <div className="h-6 w-48 bg-slate-800 rounded-lg" />
              <div className="h-10 w-3/4 bg-slate-800/80 rounded-xl" />
              <div className="h-4 w-1/2 bg-slate-800/50 rounded-lg" />
            </div>
            <div className="h-44 rounded-2xl sm:rounded-3xl bg-slate-900/40 border border-slate-800/80 p-5 sm:p-6 space-y-3">
              <div className="h-5 w-40 bg-slate-800 rounded-lg" />
              <div className="h-4 w-full bg-slate-800/50 rounded" />
              <div className="h-4 w-5/6 bg-slate-800/50 rounded" />
            </div>
          </div>
        ) : !task ? (
          <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            <h1 className="text-xl font-bold text-white">Task #{taskId} Not Found</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              This challenge may have been removed or does not exist in the active competition arena.
            </p>
            <Link
              href="/"
              className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg min-h-10.5 flex items-center justify-center"
            >
              Return to Arena Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* TASK HERO BANNER & UNIFIED MASTER DEADLINE */}
            <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 glass-panel border border-slate-800/90 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-72 sm:w-80 h-72 sm:h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-64 sm:w-72 h-64 sm:h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-3 sm:space-y-4">
                {/* Top Badges */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-cyan-300 border border-blue-500/30 font-mono">
                    CHALLENGE #{task.id < 10 ? `0${task.id}` : task.id}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700">
                    {task.category}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {task.points} PTS MAX
                  </span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>COMPLETED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>PENDING SUBMISSION</span>
                    </span>
                  )}
                </div>

                {/* Task Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight text-balance-fluid">
                  {task.title}
                </h1>

                {/* Unified Master Competition Deadline & Formats */}
                <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-400 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Master Competition Deadline: <strong className="text-white font-mono">{new Date(masterDeadline).toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase">Accepted Formats:</span>
                    {allowed.map((fmt) => (
                      <span key={fmt} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 uppercase font-mono">
                        {fmt === 'github' ? 'GitHub' : fmt === 'video' ? 'YouTube' : fmt === 'document' ? 'Doc/Drive' : fmt === 'image' ? 'Image' : fmt}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* PROBLEM STATEMENT & DETAILED DESCRIPTION */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl glass-panel border border-slate-800/90 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20 shrink-0">
                  <FileCode className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Problem Statement & Engineering Challenge
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {task.description}
              </div>

              {/* Key Deliverables Checklist */}
              {task.deliverables && task.deliverables.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Required Deliverables Checklist:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {task.deliverables.map((deliv, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* EMBEDDED MEDIA RESOURCE PLAYERS */}
            {((task.resources && task.resources.length > 0) || task.youtube_url) && (
              <TaskResourcePlayers
                taskTitle={task.title}
                youtubeUrl={task.youtube_url}
                resources={task.resources}
              />
            )}

            {/* DESIGNATED SUBMISSION HUB (ADMIN-GATED INPUTS) */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800/90 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Completed State View with Animated Checkmark */}
              {isCompleted && !editingMode ? (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <AnimatedCheckmark size={68} />
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>TASK DELIVERABLE RECORDED</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Deliverable Submitted & Verified in Database
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Your submission has been safely recorded. You may inspect your verified links below.
                      </p>
                    </div>
                  </div>

                  {/* Submitted Details Card */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 text-xs">
                    {submission?.github_url && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Github className="w-4 h-4 text-purple-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">GitHub Repository</span>
                            <a
                              href={submission.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-cyan-400 hover:text-cyan-300 font-bold truncate block"
                            >
                              {submission.github_url}
                            </a>
                          </div>
                        </div>
                        <a
                          href={submission.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-xs font-bold shrink-0 self-start sm:self-auto transition-colors"
                        >
                          <span>Open Repo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {submission?.video_url && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-slate-300 truncate">YouTube / Video: {submission.video_url}</span>
                        </div>
                        <a href={submission.video_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline shrink-0">
                          Open Video
                        </a>
                      </div>
                    )}

                    {(submission?.document_url || submission?.pptx_url) && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-slate-300 truncate">Document / Drive: {submission.document_url || submission.pptx_url}</span>
                        </div>
                        <a href={submission.document_url || submission.pptx_url || '#'} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline shrink-0">
                          Open Link
                        </a>
                      </div>
                    )}

                    {submission?.image_url && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 truncate">Image Deliverable: {submission.image_url}</span>
                        </div>
                        <a href={submission.image_url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline shrink-0">
                          View Image
                        </a>
                      </div>
                    )}

                    {submission?.notes && (
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Notes / Abstract:</span>
                        <p className="whitespace-pre-line">{submission.notes}</p>
                      </div>
                    )}

                    {/* Score / Evaluation if available */}
                    {isEvaluated && (
                      <div className="mt-4 p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">Jury Evaluation Result:</span>
                          <div className="text-lg font-black text-white mt-0.5">
                            {submission?.score} / {task.points} PTS
                          </div>
                          {submission?.feedback && (
                            <p className="mt-1 text-slate-300 italic">&ldquo;{submission.feedback}&rdquo;</p>
                          )}
                        </div>
                        <Award className="w-8 h-8 text-purple-400 shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingMode(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Submission Links</span>
                    </button>

                    <Link
                      href="/"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
                    >
                      <span>Explore Other Tasks &rarr;</span>
                    </Link>
                  </div>

                </div>
              ) : (
                /* Admin-Gated Submission Input Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
                        <Send className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Admin-Configured Submission Interface</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Submit Deliverable for Task #{task.id}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Only the submission fields approved by the competition jury for this challenge are displayed below.
                      </p>
                    </div>

                    {editingMode && (
                      <button
                        type="button"
                        onClick={() => setEditingMode(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* ADMIN-GATED INPUT FIELDS */}
                  <div className="space-y-5">
                    
                    {/* 1. GITHUB MONOREPO INPUT (Rendered only if enabled) */}
                    {isGithubAllowed && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-purple-500/40 focus-within:border-purple-400 transition-all space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-white flex-wrap">
                          <Github className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>GitHub Repository URL</span>
                          <span className="text-[10px] text-purple-300 font-normal font-mono">(Public repo link)</span>
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-username/asl-engineering-project"
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm sm:text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all min-h-11"
                        />
                        <div className="w-full sm:w-1/2">
                          <label className="block text-[11px] text-slate-400 mb-1">Target Branch / Release Tag</label>
                          <input
                            type="text"
                            value={githubBranch}
                            onChange={(e) => setGithubBranch(e.target.value)}
                            placeholder="main"
                            className="w-full px-3 py-2 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm sm:text-xs focus:outline-none focus:border-cyan-400 min-h-10"
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. YOUTUBE VIDEO LINK (Rendered only if enabled) */}
                    {isVideoAllowed && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-blue-500/40 focus-within:border-cyan-400 transition-all space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-white flex-wrap">
                          <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>YouTube Video Link</span>
                          <span className="text-[10px] text-cyan-400 font-normal font-mono">(Video demonstration)</span>
                        </label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm sm:text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-11"
                        />
                      </div>
                    )}

                    {/* 3. GOOGLE DRIVE DOCUMENT LINK (Rendered only if enabled) */}
                    {isDocumentAllowed && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 focus-within:border-amber-400 transition-all space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-white flex-wrap">
                          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Google Drive Document Link</span>
                          <span className="text-[10px] text-amber-300 font-normal font-mono">(Google Docs, Slides, or PDF)</span>
                        </label>
                        <input
                          type="url"
                          value={documentUrl}
                          onChange={(e) => setDocumentUrl(e.target.value)}
                          placeholder="https://docs.google.com/presentation/d/... or Google Drive URL"
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm sm:text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-11"
                        />
                      </div>
                    )}

                    {/* 4. DIRECT IMAGE UPLOADS (Rendered only if enabled) */}
                    {isImageAllowed && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 focus-within:border-emerald-400 transition-all space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-white flex-wrap">
                          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Direct Image Upload</span>
                          <span className="text-[10px] text-emerald-300 font-normal font-mono">(CAD renders, schematics, or photos)</span>
                        </label>

                        <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-400/50 rounded-xl p-4 sm:p-6 text-center transition-all bg-slate-900/40 min-h-25 flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1 shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 block">
                            {uploadingImage ? 'Uploading image to storage...' : 'Click or drop image deliverable here'}
                          </span>
                          <span className="text-[10px] text-slate-500">PNG, JPG, WebP up to 15MB</span>
                        </div>

                        {imageUrl && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <span className="text-emerald-400 truncate max-w-md font-mono">{imageUrl}</span>
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 cursor-pointer min-h-8.5"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Notes & Remarks */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Submission Abstract & Technical Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Briefly describe your solution, architecture highlights, or instructions for the jury..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm sm:text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Submit CTA Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Submissions are instantly evaluated against competition rubrics.
                    </span>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50 min-h-12 touch-manipulation"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>{submitting ? 'Submitting...' : 'Submit Deliverables & Validate'}</span>
                    </button>
                  </div>

                </form>
              )}

            </div>
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(prof) => {
          setUserProfile(prof);
          refreshSubmission(prof.id);
        }}
      />

    </div>
  );
}

export default function TaskDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TaskDetailContent />
    </React.Suspense>
  );
}
