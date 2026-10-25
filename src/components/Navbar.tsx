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
  totalTasksCount: number;
  masterDeadline?: string;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  userProfile,
  onOpenAuth,
  onSignOut,
  submissionCount,
  totalTasksCount,
  masterDeadline,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Master Competition Deadline real-time calculation
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    function calculateTime() {
      const targetTime = masterDeadline
        ? new Date(masterDeadline).getTime()
        : new Date('2026-11-15T23:59:59.000Z').getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [masterDeadline]);

  // Close dropdown or mobile menu on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isAdmin = userProfile?.role === 'admin';

  interface NavItem {
    id: NavigationTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  // Public items - completely dynamic tasks count from database
  const publicNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', description: 'Platform summary & competition timeline', icon: Sparkles },
    {
      id: 'tasks',
      label: totalTasksCount > 0 ? `${totalTasksCount} Challenges` : 'Challenges',
      description: 'Technical milestones & deliverables',
      icon: Layers,
      badge: String(totalTasksCount),
    },
    {
      id: 'submissions',
      label: 'My Submissions',
      description: 'Uploaded presentations, videos & repos',
      icon: FileCheck,
      badge: totalTasksCount > 0 && submissionCount > 0 ? `${submissionCount}/${totalTasksCount}` : submissionCount > 0 ? String(submissionCount) : undefined,
    },
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Minimal Brand Logo */}
          <div 
            onClick={() => handleSelectTab('overview')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg group-hover:border-cyan-400/50 transition-all shrink-0">
              <Image 
                src="/asl-logo.png" 
                alt="Alpha Science Lab Logo" 
                width={36} 
                height={24} 
                className="h-6 sm:h-8 w-auto object-contain filter drop-shadow" 
                priority
                loading="eager"
              />
              <div className="absolute -inset-0.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-20 blur transition-all" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ALPHA SCIENCE LAB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide hidden md:block">
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide border transition-all touch-manipulation min-h-10 ${
                  dropdownOpen
                    ? 'bg-slate-900 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-linear-to-r from-blue-600/30 to-cyan-600/20 text-white border border-cyan-500/30'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-cyan-400'}`}>
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
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          currentTab === 'admin'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 hover:text-white border border-purple-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-purple-500 text-white shrink-0">
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
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                      Master Deadline:
                    </span>
                    <span className={`font-mono font-bold text-[10px] ${timeLeft.isExpired ? 'text-rose-400' : 'text-cyan-400'}`} suppressHydrationWarning>
                      {timeLeft.isExpired ? 'Competition Closed' : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Master Countdown Badge on Navbar */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shrink-0">
              <Clock className={`w-3.5 h-3.5 shrink-0 ${timeLeft.isExpired ? 'text-rose-400' : 'text-cyan-400 animate-pulse'}`} />
              <div className="flex items-center gap-1 font-mono text-[11px]" suppressHydrationWarning>
                {timeLeft.isExpired ? (
                  <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">Closed</span>
                ) : (
                  <>
                    <span className="text-cyan-400 font-bold">{timeLeft.days}d</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-slate-200">{String(timeLeft.hours).padStart(2, '0')}h</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-slate-200">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-cyan-300 font-mono">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Right: Auth Action / Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {userProfile ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Admin Exclusive Dashboard Link */}
                {isAdmin && (
                  <button
                    onClick={() => handleSelectTab('admin')}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'admin'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:text-white'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin Panel</span>
                  </button>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0 ${
                    isAdmin ? 'bg-linear-to-br from-purple-500 to-indigo-600' : 'bg-linear-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {userProfile.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-white text-xs leading-none truncate max-w-28 md:max-w-36">
                      {userProfile.full_name || 'Participant'}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono leading-none mt-0.5 truncate max-w-28 md:max-w-36">
                      {isAdmin ? 'Administrator' : userProfile.registration_number || userProfile.department}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer min-h-9.5 min-w-9.5 flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer min-h-10 touch-manipulation"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline sm:inline">Participant Login</span>
                <span className="xs:hidden sm:hidden">Login</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center min-h-11 min-w-11 p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition-colors touch-manipulation"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-200" /> : <Menu className="w-5 h-5 text-cyan-400" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu & Backdrop Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 top-16 sm:top-20 bg-black/60 backdrop-blur-xs z-30 animate-backdrop"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="md:hidden relative z-40 border-t border-slate-800/80 bg-slate-950/98 backdrop-blur-2xl px-4 py-4 animate-drawer space-y-3.5 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
            
            {/* Mobile Countdown Chip */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                Competition Deadline
              </span>
              <div className="font-mono text-cyan-400 font-bold text-[11px]" suppressHydrationWarning>
                {timeLeft.isExpired 
                  ? 'Competition Closed' 
                  : `${timeLeft.days}d : ${timeLeft.hours}h : ${timeLeft.minutes}m : ${timeLeft.seconds}s`}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1.5">
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all min-h-11 cursor-pointer touch-manipulation ${
                      isActive
                        ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                      <div className="text-left">
                        <div className="font-bold">{item.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
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
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all min-h-11 cursor-pointer touch-manipulation ${
                    currentTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="text-left">
                      <div>Admin Dashboard</div>
                      <div className="text-[10px] text-purple-300/80 font-normal">Submissions & Task Manager</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900 text-purple-200">
                    Protected
                  </span>
                </button>
              )}
            </div>

            {/* Mobile User Profile Section or Login CTA */}
            {userProfile ? (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                      isAdmin ? 'bg-linear-to-br from-purple-500 to-indigo-600' : 'bg-linear-to-br from-blue-500 to-cyan-500'
                    }`}>
                      {userProfile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-white text-xs truncate">
                        {userProfile.full_name || 'Individual Competitor'}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono truncate">
                        {isAdmin ? 'Administrator' : userProfile.registration_number || userProfile.department}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs font-semibold shrink-0 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-600/30 min-h-11 cursor-pointer touch-manipulation"
              >
                <User className="w-4 h-4" />
                <span>Sign In to Participant Portal</span>
              </button>
            )}

          </div>
        </>
      )}
    </header>
  );
}
