'use client';

import React from 'react';
import Link from 'next/link';
import { Task, Submission } from '@/types';
import { 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Award, 
  AlertCircle,
  Video,
  FileText
} from 'lucide-react';
import Github from '@/components/GithubIcon';

interface TaskCardProps {
  task: Task;
  submission: Submission | null;
  onOpenSubmission?: (task: Task) => void;
}

export default function TaskCard({ task, submission }: TaskCardProps) {
  const isSubmitted = submission?.status === 'submitted';
  const isDraft = submission?.status === 'draft';
  const isEvaluated = submission?.status === 'evaluated';
  const isCompleted = isSubmitted || isEvaluated;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`group relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 border ${
        isCompleted
          ? 'bg-slate-900/50 hover:bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm shadow-emerald-500/5'
          : 'glass-panel hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Top Meta: Number, Category & Points */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-black text-cyan-400 font-mono">
              #{task.id < 10 ? `0${task.id}` : task.id}
            </span>
            <span className="text-[11px] font-medium text-slate-400 truncate max-w-30 sm:max-w-37.5">
              {task.category}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold font-mono shrink-0">
            <Award className="w-3 h-3 text-amber-400" />
            <span>{task.points} PTS</span>
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2 mb-2">
          {task.title}
        </h3>

        {/* Compact Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {task.description}
        </p>

        {/* Media & Accepted Formats Pills (Compact) */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {task.allowed_formats?.includes('github') && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Github className="w-2.5 h-2.5" />
              <span>GitHub</span>
            </span>
          )}
          {task.allowed_formats?.includes('video') && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <Video className="w-2.5 h-2.5" />
              <span>Video</span>
            </span>
          )}
          {(task.allowed_formats?.includes('document') || task.allowed_formats?.includes('pptx')) && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-2.5 h-2.5" />
              <span>Drive / Doc</span>
            </span>
          )}
          {task.allowed_formats?.includes('image') && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span>🖼 Image</span>
            </span>
          )}
          {task.youtube_url && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              <span>▶ Media</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Status & Navigation Link */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
        {/* State Indicator */}
        <div>
          {isEvaluated ? (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Graded: {submission?.score}/{task.points}</span>
            </div>
          ) : isSubmitted ? (
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Submitted</span>
            </div>
          ) : isDraft ? (
            <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Draft</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <AlertCircle className="w-3 h-3 text-slate-600" />
              <span>Not Started</span>
            </div>
          )}
        </div>

        {/* Small Navigation CTA Button */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          isCompleted
            ? 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'
            : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-black'
        }`}>
          <span>{isCompleted ? 'View' : 'Open'}</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
