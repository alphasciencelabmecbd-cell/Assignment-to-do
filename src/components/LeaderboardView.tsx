'use client';

import React, { useState } from 'react';
import { LeaderboardEntry } from '@/types';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Search
} from 'lucide-react';

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    team_name: 'Apex Robotics ASL-01',
    institution: 'Alpha Science Lab MEC Cell',
    track: 'Advanced Robotics & Embedded Systems',
    tasks_completed: 8,
    total_score: 980,
    last_submission_time: '2 hours ago',
  },
  {
    rank: 2,
    team_name: 'Quantum AeroTech',
    institution: 'BUET Aerospace Division',
    track: 'Aerospace, UAV & Autonomous Systems',
    tasks_completed: 7,
    total_score: 860,
    last_submission_time: '4 hours ago',
  },
  {
    rank: 3,
    team_name: 'CyberKinetic Lab',
    institution: 'National University of Sciences',
    track: 'Advanced Robotics & Embedded Systems',
    tasks_completed: 7,
    total_score: 845,
    last_submission_time: '6 hours ago',
  },
  {
    rank: 4,
    team_name: 'Nexus Embedded AI',
    institution: 'MEC Robotics & Automation Society',
    track: 'AI, Edge Computing & Data Science',
    tasks_completed: 6,
    total_score: 720,
    last_submission_time: 'Yesterday',
  },
  {
    rank: 5,
    team_name: 'Titanium Dynamics',
    institution: 'Institute of Technology & Innovation',
    track: 'Sustainable Engineering & Hardware Innovation',
    tasks_completed: 6,
    total_score: 690,
    last_submission_time: 'Yesterday',
  },
  {
    rank: 6,
    team_name: 'HyperDrive Labs',
    institution: 'Polytechnic Engineering Consortium',
    track: 'Aerospace, UAV & Autonomous Systems',
    tasks_completed: 5,
    total_score: 580,
    last_submission_time: '2 days ago',
  },
  {
    rank: 7,
    team_name: 'Synapse Core',
    institution: 'ASL Junior Innovation Cell',
    track: 'AI, Edge Computing & Data Science',
    tasks_completed: 4,
    total_score: 460,
    last_submission_time: '3 days ago',
  },
];

export default function LeaderboardView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All Tracks');

  const filtered = mockLeaderboard.filter((entry) => {
    const matchesSearch = entry.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'All Tracks' || entry.track === selectedTrack;
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Live Competition Standings
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Season 2026
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            National Engineering Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live rankings calculated across all 10 task deliverables, evaluated by the Alpha Science Lab expert jury panel.
          </p>
        </div>

        {/* Podium Highlight */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Medal className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-amber-300 block">Rank #1</span>
            <span className="text-xs font-black text-white font-mono">980 PTS</span>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <Medal className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-300 block">Rank #2</span>
            <span className="text-xs font-black text-white font-mono">860 PTS</span>
          </div>
          <div className="text-center p-3 rounded-xl bg-amber-700/10 border border-amber-700/20">
            <Medal className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-amber-500 block">Rank #3</span>
            <span className="text-xs font-black text-white font-mono">845 PTS</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search team or institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all"
        >
          <option value="All Tracks">All Competition Tracks</option>
          <option value="Advanced Robotics & Embedded Systems">Advanced Robotics</option>
          <option value="Aerospace, UAV & Autonomous Systems">Aerospace & UAV</option>
          <option value="AI, Edge Computing & Data Science">AI & Edge Computing</option>
          <option value="Sustainable Engineering & Hardware Innovation">Sustainable Innovation</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl glass-panel overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6">Team & Institution</th>
                <th className="py-4 px-6 hidden sm:table-cell">Track</th>
                <th className="py-4 px-6 text-center">Tasks (10)</th>
                <th className="py-4 px-6 text-right">Score</th>
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
                  <td className="py-4 px-6 text-center font-mono font-bold">
                    {item.rank === 1 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20">
                        1
                      </span>
                    )}
                    {item.rank === 2 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-200 text-slate-950 font-black">
                        2
                      </span>
                    )}
                    {item.rank === 3 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700 text-white font-black">
                        3
                      </span>
                    )}
                    {item.rank > 3 && (
                      <span className="text-slate-400 font-bold">
                        #{item.rank}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{item.team_name}</span>
                      {item.rank === 1 && (
                        <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.institution}
                    </div>
                  </td>

                  <td className="py-4 px-6 hidden sm:table-cell text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
                      {item.track}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="font-mono font-bold text-cyan-400">
                      {item.tasks_completed}
                    </span>
                    <span className="text-slate-500 font-mono"> / 10</span>
                  </td>

                  <td className="py-4 px-6 text-right font-mono font-black text-sm text-amber-300">
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
