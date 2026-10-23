'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types';
import { 
  Trophy, 
  Layers, 
  FileCheck, 
  BookOpen, 
  Clock, 
  LogOut, 
  User, 
  Sparkles,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'overview' | 'tasks' | 'submissions' | 'leaderboard' | 'rules';
  setCurrentTab: (tab: 'overview' | 'tasks' | 'submissions' | 'leaderboard' | 'rules') => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  submissionCount: number;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  userProfile,
  onOpenAuth,
  onSignOut,
  submissionCount,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  interface NavItem {
    id: 'overview' | 'tasks' | 'submissions' | 'leaderboard' | 'rules';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'tasks', label: '10 Tasks', icon: Layers, badge: '10' },
    { id: 'submissions', label: 'My Submissions', icon: FileCheck, badge: submissionCount > 0 ? `${submissionCount}/10` : undefined },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'rules', label: 'Rubrics & Rules', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setCurrentTab('overview')} 
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg group-hover:border-cyan-400/50 transition-all">
              <Image 
                src="/asl-logo.png" 
                alt="Alpha Science Lab Logo" 
                width={48} 
                height={32} 
                className="h-8 w-auto object-contain filter drop-shadow" 
                priority
              />
              <div className="absolute -inset-0.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-20 blur transition-all" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ALPHA SCIENCE LAB
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                  COMPETITION HUB
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide hidden sm:block">
                National Multi-Stage Engineering & Innovation Arena
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Deadline Countdown & Auth Status */}
          <div className="flex items-center gap-3">
            {/* Live Countdown Chip */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-900/40 text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                <span className="text-cyan-400 font-semibold">{timeLeft.days}d</span>:
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
                <span className="text-slate-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>

            {/* Auth Button or Profile Info */}
            {userProfile ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {userProfile.team_name || userProfile.full_name || 'Participant'}
                  </span>
                  <span className="text-[10px] text-cyan-400/80 truncate max-w-32.5">
                    {userProfile.institution || userProfile.email}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
                    {(userProfile.team_name || userProfile.full_name || 'U')[0].toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-800/40 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide text-white bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-600/30 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Portal Login</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
