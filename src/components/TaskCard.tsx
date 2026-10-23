'use client';

import React from 'react';
import { Task, Submission } from '@/types';
import { 
  Video, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Award, 
  AlertCircle
} from 'lucide-react';
import Github from '@/components/GithubIcon';

interface TaskCardProps {
  task: Task;
  submission: Submission | null;
  onOpenSubmission: (task: Task) => void;
}

export default function TaskCard({ task, submission, onOpenSubmission }: TaskCardProps) {
  const isSubmitted = submission?.status === 'submitted';
  const isDraft = submission?.status === 'draft';
  const isEvaluated = submission?.status === 'evaluated';

  return (
    <div className="relative group rounded-3xl p-6 glass-panel glass-panel-hover flex flex-col justify-between transition-all">
      
      {/* Top Meta: Task Number, Category & Points */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-black text-cyan-400 font-mono">
              0{task.id}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
              {task.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold font-mono">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{task.points} PTS</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
          {task.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {task.description}
        </p>

        {/* Allowed Submission Formats */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Accepted Formats:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {task.allowed_formats.includes('pptx') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileText className="w-3 h-3" />
                <span>PPTX / Slide Deck</span>
              </span>
            )}
            {task.allowed_formats.includes('video') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                <Video className="w-3 h-3" />
                <span>Video Demo</span>
              </span>
            )}
            {task.allowed_formats.includes('github') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <Github className="w-3 h-3" />
                <span>GitHub Repo</span>
              </span>
            )}
            {task.allowed_formats.includes('document') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileText className="w-3 h-3" />
                <span>Doc / Report</span>
              </span>
            )}
          </div>
        </div>

        {/* Deliverables snippet */}
        {task.deliverables?.length > 0 && (
          <div className="mb-5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Key Deliverables:
            </span>
            <ul className="space-y-1">
              {task.deliverables.slice(0, 2).map((d, i) => (
                <li key={i} className="flex items-center gap-1.5 truncate">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  <span className="truncate">{d}</span>
                </li>
              ))}
              {task.deliverables.length > 2 && (
                <li className="text-[10px] text-slate-500 pl-2.5">
                  +{task.deliverables.length - 2} more deliverables
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Status & Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {/* Status Indicator */}
        <div>
          {isEvaluated ? (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Score: {submission.score} / {task.points}</span>
            </div>
          ) : isSubmitted ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Submitted</span>
            </div>
          ) : isDraft ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Draft Saved</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <AlertCircle className="w-4 h-4 text-slate-600" />
              <span>Not Started</span>
            </div>
          )}
        </div>

        {/* Submit / Edit Button */}
        <button
          onClick={() => onOpenSubmission(task)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
            isSubmitted
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              : 'bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20'
          }`}
        >
          <span>{isSubmitted ? 'Edit Deliverable' : isDraft ? 'Resume Submission' : 'Submit Task'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}
