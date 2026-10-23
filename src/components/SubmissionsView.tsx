'use client';

import React from 'react';
import { Task, Submission, UserProfile } from '@/types';
import { 
  FileCheck, 
  Video, 
  FileText, 
  ExternalLink, 
  Edit3, 
  Award, 
  Calendar, 
  Download, 
  ShieldCheck
} from 'lucide-react';
import Github from '@/components/GithubIcon';

interface SubmissionsViewProps {
  tasks: Task[];
  submissions: Record<number, Submission>;
  userProfile: UserProfile | null;
  onEditTask: (task: Task) => void;
  onOpenAuth: () => void;
}

export default function SubmissionsView({
  tasks,
  submissions,
  userProfile,
  onEditTask,
  onOpenAuth,
}: SubmissionsViewProps) {
  if (!userProfile) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl glass-panel max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Participant Authentication Required</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
          Please log into your team account to view your uploaded task deliverables, scores, and evaluation feedback.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20"
        >
          Sign In to Access Submissions
        </button>
      </div>
    );
  }

  const submissionEntries = Object.values(submissions);

  if (submissionEntries.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl glass-panel max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <FileCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Deliverables Submitted Yet</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
          You have not submitted deliverables for any of the 10 tasks yet. Select a task to upload your PPTX, demonstration video, or GitHub code repository.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header with Team Details */}
      <div className="p-6 rounded-3xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Team Deliverable Vault
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {submissionEntries.length} Tasks Recorded
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {userProfile.team_name || 'My Competition Team'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {userProfile.institution || 'ASL Innovation Lab'} • Track: {userProfile.track || 'Engineering'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Submission Receipt</span>
        </button>
      </div>

      {/* Submissions Table / Cards */}
      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => {
          const sub = submissions[task.id];
          if (!sub) return null;

          return (
            <div 
              key={task.id}
              className="p-6 rounded-3xl glass-panel border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Task Details */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                    TASK #{task.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {task.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sub.status === 'submitted'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : sub.status === 'evaluated'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {sub.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {task.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submitted on {new Date(sub.submitted_at || sub.updated_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Output Formats Attached */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* PPTX Deliverable */}
                {sub.pptx_url ? (
                  <a
                    href={sub.pptx_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="truncate max-w-32.5">{sub.pptx_file_name || 'Presentation Deck'}</span>
                    <ExternalLink className="w-3 h-3 text-amber-400/80" />
                  </a>
                ) : null}

                {/* Video Deliverable */}
                {sub.video_url ? (
                  <a
                    href={sub.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-300 text-xs font-semibold hover:bg-blue-500/20 transition-all"
                  >
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span className="truncate max-w-32.5">{sub.video_file_name || 'Demo Video'}</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400/80" />
                  </a>
                ) : null}

                {/* GitHub Deliverable */}
                {sub.github_url ? (
                  <a
                    href={sub.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all"
                  >
                    <Github className="w-4 h-4 text-purple-400" />
                    <span className="truncate max-w-32.5">{sub.github_url.replace('https://github.com/', '')}</span>
                    <ExternalLink className="w-3 h-3 text-purple-400/80" />
                  </a>
                ) : null}
              </div>

              {/* Actions & Score */}
              <div className="flex items-center gap-3">
                {sub.score !== null && sub.score !== undefined && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs font-bold text-purple-300">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>{sub.score} / {task.points} PTS</span>
                  </div>
                )}

                <button
                  onClick={() => onEditTask(task)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Update Deliverables</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
