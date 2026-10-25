'use client';

import React from 'react';
import { 
  Trophy, 
  Database, 
  Sparkles
} from 'lucide-react';

interface StatsBannerProps {
  completedCount: number;
  totalTasks: number;
  totalPointsEarned: number;
  totalAvailablePoints: number;
}

export default function StatsBanner({
  completedCount,
  totalTasks,
  totalPointsEarned,
  totalAvailablePoints,
}: StatsBannerProps) {
  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      
      {/* Progress & Completion Card */}
      <div className="sm:col-span-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Submission Progress
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white font-mono">
              {completedCount} / {totalTasks} Tasks
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
              {percentage}%
            </span>
            <span className="text-xs text-slate-400">
              Completed & Submitted
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="h-full rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-700 ease-out shadow-sm shadow-cyan-400/50"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-1">
          <span>{Math.max(0, totalTasks - completedCount)} tasks remaining</span>
          <span className="text-cyan-400 font-medium hidden xs:inline sm:inline">Keep going for Grand Finale qualification</span>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Points Card */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Total Points
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {totalAvailablePoints}
            </span>
            <span className="text-xs text-slate-400 font-medium">PTS</span>
          </div>
          <p className="text-xs text-slate-400">
            Across {totalTasks} technical milestones
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">Points Earned</span>
          <span className="text-amber-400 font-mono font-bold">{totalPointsEarned} / {totalAvailablePoints} PTS</span>
        </div>
      </div>

      {/* Backend & Cloud Sync Card */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Live Platform
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white mb-1">
            Cloud Sync Active
          </div>
          <p className="text-xs text-slate-400">
            PostgreSQL DB & Multi-format Storage
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Gmail Notifications</span>
          <span className="text-cyan-400 font-mono">Enabled</span>
        </div>
      </div>

    </div>
  );
}
