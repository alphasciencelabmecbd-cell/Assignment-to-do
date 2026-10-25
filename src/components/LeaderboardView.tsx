'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Search
} from 'lucide-react';

const mockIndividualLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Aiden Vance',
    registration_number: 'REG-CSE-2023-089',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2023',
    tasks_completed: 8,
    total_score: 980,
    last_submission_time: '2 hours ago',
  },
  {
    rank: 2,
    name: 'Elena Rostova',
    registration_number: 'REG-ME-2022-044',
    department: 'Mechanical Engineering',
    batch: 'Batch 2022',
    tasks_completed: 7,
    total_score: 860,
    last_submission_time: '4 hours ago',
  },
  {
    rank: 3,
    name: 'Zayan Kabir',
    registration_number: 'REG-EEE-2023-112',
    department: 'Electrical & Electronic Engineering',
    batch: 'Batch 2023',
    tasks_completed: 7,
    total_score: 845,
    last_submission_time: '6 hours ago',
  },
  {
    rank: 4,
    name: 'Samantha Wei',
    registration_number: 'REG-ROB-2024-019',
    department: 'Robotics & Mechatronics',
    batch: 'Batch 2024',
    tasks_completed: 6,
    total_score: 720,
    last_submission_time: 'Yesterday',
  },
  {
    rank: 5,
    name: 'Farhan Tariq',
    registration_number: 'REG-AI-2023-055',
    department: 'Artificial Intelligence & Data Science',
    batch: 'Batch 2023',
    tasks_completed: 6,
    total_score: 690,
    last_submission_time: 'Yesterday',
  },
  {
    rank: 6,
    name: 'Nadia Chowdhury',
    registration_number: 'REG-CSE-2024-102',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2024',
    tasks_completed: 5,
    total_score: 580,
    last_submission_time: '2 days ago',
  },
  {
    rank: 7,
    name: 'Tanvir Hossain',
    registration_number: 'REG-IPE-2022-031',
    department: 'Industrial & Production Engineering',
    batch: 'Batch 2022',
    tasks_completed: 4,
    total_score: 460,
    last_submission_time: '3 days ago',
  },
];

export default function LeaderboardView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(mockIndividualLeaderboard);

  // Attempt to fetch real participants from API and merge
  useEffect(() => {
    async function loadLiveParticipants() {
      try {
        const res = await fetch('/api/admin/participants');
        const data = await res.json();
        if (data.participants && data.participants.length > 0) {
          // Sort by total_score desc
          const sorted = [...data.participants].sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
          const formatted: LeaderboardEntry[] = sorted.map((p, idx) => ({
            rank: idx + 1,
            name: p.full_name || 'Competitor',
            registration_number: p.registration_number || `REG-${p.id.slice(0, 5).toUpperCase()}`,
            department: p.department || 'Engineering',
            batch: p.batch || '2024',
            tasks_completed: p.submissions_count || 0,
            total_score: p.total_score || 0,
            last_submission_time: 'Active',
          }));

          // If real participants have scores or tasks, use them, otherwise combine
          if (formatted.some(p => p.total_score > 0 || p.tasks_completed > 0)) {
            setLeaderboardData(formatted);
          }
        }
      } catch (err) {
        console.warn('Live leaderboard fetch notice:', err);
      }
    }
    loadLiveParticipants();
  }, []);

  const departments = ['All', 'Computer Science & Engineering', 'Mechanical Engineering', 'Electrical & Electronic Engineering', 'Robotics & Mechatronics', 'Artificial Intelligence & Data Science'];

  const filtered = leaderboardData.filter((entry) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      entry.name.toLowerCase().includes(q) ||
      entry.registration_number.toLowerCase().includes(q) ||
      entry.department.toLowerCase().includes(q) ||
      entry.batch.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'All' || entry.department.includes(selectedDept) || selectedDept.includes(entry.department);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-8 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Live Individual Standings
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Season 2026 Arena
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Individual Engineering Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Live rankings calculated across all submitted task deliverables, verified by the Alpha Science Lab faculty & jury board.
          </p>
        </div>

        {/* Podium Highlight */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 self-stretch sm:self-auto justify-around">
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-1 sm:flex-initial">
            <Medal className="w-5 sm:w-6 h-5 sm:h-6 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-amber-300 block">Rank #1</span>
            <span className="text-xs font-black text-white font-mono">{filtered[0]?.total_score || 980} PTS</span>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex-1 sm:flex-initial">
            <Medal className="w-5 sm:w-6 h-5 sm:h-6 text-slate-300 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-300 block">Rank #2</span>
            <span className="text-xs font-black text-white font-mono">{filtered[1]?.total_score || 860} PTS</span>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-amber-700/10 border border-amber-700/20 flex-1 sm:flex-initial">
            <Medal className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-amber-500 block">Rank #3</span>
            <span className="text-xs font-black text-white font-mono">{filtered[2]?.total_score || 845} PTS</span>
          </div>
        </div>
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
          <option value="All">All Departments</option>
          {departments.slice(1).map((dept) => (
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
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 text-center">Tasks Done</th>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => (
                <tr 
                  key={item.rank}
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
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                      <span className="font-mono text-cyan-300">{item.registration_number}</span>
                      <span>&bull;</span>
                      <span>{item.department}</span>
                      <span className="md:hidden">({item.batch})</span>
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
                    <span className="text-slate-500 font-mono"> / 10</span>
                  </td>

                  <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-right font-mono font-black text-xs sm:text-sm text-amber-300 whitespace-nowrap">
                    {item.total_score} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
