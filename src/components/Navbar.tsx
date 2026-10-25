'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { UserProfile, NavigationTab } from '@/types';
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
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  interface NavItem {
    id: NavigationTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  // Public items - Admin Hub is completely excluded for regular visitors
  const publicNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', description: 'Platform summary & competition timeline', icon: Sparkles },
    { id: 'tasks', label: '10 Tasks', description: 'Technical milestones & deliverables', icon: Layers, badge: '10' },
    { id: 'submissions', label: 'My Submissions', description: 'Uploaded presentations, videos & repos', icon: FileCheck, badge: submissionCount > 0 ? `${submissionCount}/10` : undefined },
    { id: 'leaderboard', label: 'Leaderboard', description: 'Live individual rankings & scores', icon: Trophy },
    { id: 'rules', label: 'Rubrics & Rules', description: 'Evaluation criteria & standards', icon: BookOpen },
  ];

  const currentItemLabel = isAdmin && currentTab === 'admin'
    ? 'Admin Dashboard'
    : publicNavItems.find((item) => item.id === currentTab)?.label || 'Menu';

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Left: Minimal Brand Logo */}
          <div 
            onClick={() => handleSelectTab('overview')} 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg group-hover:border-cyan-400/50 transition-all">
              <Image 
                src="/asl-logo.png" 
                alt="Alpha Science Lab Logo" 
                width={40} 
                height={26} 
                className="h-7 sm:h-8 w-auto object-contain filter drop-shadow" 
                priority
                loading="eager"
              />
              <div className="absolute -inset-0.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-20 blur transition-all" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ALPHA SCIENCE LAB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide hidden sm:block">
                National Engineering & Innovation Arena
              </p>
            </div>
          </div>

          {/* Center / Right: Consolidated Minimal Dropdown Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Minimal Dropdown Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold tracking-wide border transition-all ${
                  dropdownOpen
                    ? 'bg-slate-900 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentItemLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Glassmorphic Dropdown Panel */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-fade-in divide-y divide-slate-800/60">
                  <div className="space-y-1 pb-1">
                    {publicNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-linear-to-r from-blue-600/30 to-cyan-600/20 text-white border border-cyan-500/30'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-cyan-400'}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-none">{item.label}</div>
                              <div className="text-[10px] text-slate-400 mt-1 leading-none">{item.description}</div>
                            </div>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* If user is Admin, exclusive option shown only to authenticated admin */}
                  {isAdmin && (
                    <div className="pt-1.5">
                      <button
                        onClick={() => handleSelectTab('admin')}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                          currentTab === 'admin'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 hover:text-white border border-purple-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-purple-500 text-white">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-none">Admin Dashboard</div>
                            <div className="text-[10px] text-purple-300/80 mt-1 leading-none">Submissions & Task Manager</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-purple-900 text-purple-200">
                          Active
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Bottom Countdown in Dropdown */}
                  <div className="pt-2 px-2 pb-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-[10px]">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      Deadline:
                    </span>
                    <span className="font-mono text-cyan-400 font-bold text-[10px]" suppressHydrationWarning>
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Countdown Badge on Navbar */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300" suppressHydrationWarning>
                <span className="text-cyan-400 font-semibold">{timeLeft.days}d</span>:
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              </div>
            </div>

          </div>

          {/* Right: Auth Action / Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {userProfile ? (
              <div className="flex items-center gap-2">
                {/* Admin Exclusive Dashboard Link */}
                {isAdmin && (
                  <button
                    onClick={() => handleSelectTab('admin')}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentTab === 'admin'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:text-white'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0 ${
                    isAdmin ? 'bg-linear-to-br from-purple-500 to-indigo-600' : 'bg-linear-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {userProfile.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-white text-xs leading-none truncate max-w-30">
                      {userProfile.full_name || 'Participant'}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono leading-none mt-0.5 truncate max-w-30">
                      {isAdmin ? 'Administrator' : userProfile.registration_number || userProfile.department}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Participant Login</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-cyan-400" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 animate-fade-in space-y-3">
          
          {/* Mobile Countdown Chip */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Submission Deadline
            </span>
            <div className="font-mono text-cyan-400 font-bold text-[11px]">
              {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-cyan-400 border border-slate-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* If Admin, show Admin Dashboard in Mobile Menu */}
            {isAdmin && (
              <button
                onClick={() => handleSelectTab('admin')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 text-purple-200">
                  Protected
                </span>
              </button>
            )}
          </div>

          {!userProfile && (
            <button
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 shadow-md mt-2"
            >
              <User className="w-4 h-4" />
              <span>Participant Login</span>
            </button>
          )}

        </div>
      )}
    </header>
  );
}
