'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LeaderboardEntry } from '@/types';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Search, 
  RefreshCw, 
  Users, 
  Sparkles 
} from 'lucide-react';

interface LeaderboardViewProps {
  totalTasksCount?: number;
}

export default function LeaderboardView({ totalTasksCount = 0 }: LeaderboardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalSubmissions: 0,
    topScore: 0,
  });

  // Initial fetch and Supabase Realtime subscription
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const res = await fetch('/api/leaderboard', { cache: 'no-store' });
        const data = await res.json();
        if (!ignore && data.leaderboard) {
          setLeaderboardData(data.leaderboard as LeaderboardEntry[]);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.warn('Live leaderboard fetch notice:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    // Subscribe to live database updates on submissions and profiles
    const channel = supabase
      .channel('realtime-leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboardData(data.leaderboard as LeaderboardEntry[]);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.warn('Live leaderboard manual refresh notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const departments = [
    'All',
    'Computer Science & Engineering',
    'Mechanical Engineering',
    'Electrical & Electronic Engineering',
    'Robotics & Mechatronics',
    'Artificial Intelligence & Data Science',
    'Civil Engineering',
    'Industrial & Production Engineering',
  ];

  const filtered = leaderboardData.filter((entry) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      entry.name.toLowerCase().includes(q) ||
      entry.registration_number.toLowerCase().includes(q) ||
      entry.department.toLowerCase().includes(q) ||
      entry.batch.toLowerCase().includes(q);

    const matchesDept =
      selectedDept === 'All' ||
      entry.department.toLowerCase().includes(selectedDept.toLowerCase()) ||
      selectedDept.toLowerCase().includes(entry.department.toLowerCase());

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Top Banner & Live Stats Summary */}
      <div className="p-5 sm:p-8 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Live Database Standings
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Real-Time Points Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Individual Engineering Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Rankings dynamically aggregated from verified technical milestones in the database, ordered descending by total points.
          </p>
        </div>

        {/* Podium Highlight or Live Summary */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 self-stretch sm:self-auto justify-around">
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-1 sm:flex-initial min-w-24">
            <Medal className="w-5 sm:w-6 h-5 sm:h-6 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-amber-300 block">Rank #1</span>
            <span className="text-xs font-black text-white font-mono">
              {filtered[0] ? `${filtered[0].total_score} PTS` : '---'}
            </span>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex-1 sm:flex-initial min-w-24">
            <Medal className="w-5 sm:w-6 h-5 sm:h-6 text-slate-300 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-300 block">Rank #2</span>
            <span className="text-xs font-black text-white font-mono">
              {filtered[1] ? `${filtered[1].total_score} PTS` : '---'}
            </span>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-amber-700/10 border border-amber-700/20 flex-1 sm:flex-initial min-w-24">
            <Medal className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-amber-500 block">Rank #3</span>
            <span className="text-xs font-black text-white font-mono">
              {filtered[2] ? `${filtered[2].total_score} PTS` : '---'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Indicator & Manual Refresh */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] text-slate-300">
            Realtime sync active &bull; {stats.totalParticipants} competitors tracked
          </span>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Standings'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search participant name, reg number, department, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl glass-panel overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 text-center w-14">Rank</th>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6">Competitor Details</th>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 hidden md:table-cell">Batch</th>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 text-center">Tasks Completed</th>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 text-right">Cumulative Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6 text-center">
                      <div className="w-6 h-6 bg-slate-800 rounded-lg mx-auto" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-800 rounded w-48 mb-1.5" />
                      <div className="h-3 bg-slate-900 rounded w-32" />
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="h-4 bg-slate-800 rounded w-16" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-4 bg-slate-800 rounded w-12 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="h-4 bg-slate-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-white">No participants found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {searchTerm || selectedDept !== 'All'
                        ? 'Try adjusting your search query or department filter.'
                        : 'Competitors will appear here once registered and evaluated.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr 
                    key={`${item.rank}-${item.registration_number}`}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      item.rank <= 3 ? 'bg-slate-900/30' : ''
                    }`}
                  >
                    <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center font-mono font-bold">
                      {item.rank === 1 && (
                        <span className="inline-flex items-center justify-center w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20 text-xs">
                          1
                        </span>
                      )}
                      {item.rank === 2 && (
                        <span className="inline-flex items-center justify-center w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-slate-200 text-slate-950 font-black text-xs">
                          2
                        </span>
                      )}
                      {item.rank === 3 && (
                        <span className="inline-flex items-center justify-center w-6 sm:w-7 h-6 sm:h-7 rounded-xl bg-amber-700 text-white font-black text-xs">
                          3
                        </span>
                      )}
                      {item.rank > 3 && (
                        <span className="text-slate-400 font-bold text-xs">
                          #{item.rank}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                      <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.rank === 1 && (
                          <Flame className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                        )}
                        {item.total_score > 0 && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            <Sparkles className="w-2.5 h-2.5" />
                            Scored
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                        <span className="font-mono text-cyan-300 font-bold">{item.registration_number}</span>
                        <span>&bull;</span>
                        <span>{item.department}</span>
                        <span className="md:hidden">({item.batch})</span>
                        {item.last_submission_time !== 'N/A' && (
                          <>
                            <span>&bull;</span>
                            <span className="text-slate-500">Last activity: {item.last_submission_time}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 sm:py-4 px-4 sm:px-6 hidden md:table-cell text-slate-300">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
                        {item.batch}
                      </span>
                    </td>

                    <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-cyan-400">
                        {item.tasks_completed}
                      </span>
                      {totalTasksCount > 0 && (
                        <span className="text-slate-500 font-mono"> / {totalTasksCount}</span>
                      )}
                    </td>

                    <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-right font-mono font-black text-xs sm:text-sm text-amber-300 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        {item.total_score} PTS
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
