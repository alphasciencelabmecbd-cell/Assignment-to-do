'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types';
import { 
  X, 
  Mail, 
  Lock, 
  Users, 
  GraduationCap, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Rocket
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [institution, setInstitution] = useState('');
  const [track, setTrack] = useState('Advanced Robotics & Embedded Systems');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        // Sign up with Supabase
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              team_name: teamName,
              institution,
              track,
            },
          },
        });

        if (authErr) throw authErr;

        if (authData.user) {
          // Upsert profile in public.profiles
          const { error: profileErr } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            email,
            full_name: fullName,
            team_name: teamName,
            institution,
            track,
            role: 'participant',
          });

          if (profileErr) {
            console.warn('Profile upsert note:', profileErr.message);
          }

          const profile: UserProfile = {
            id: authData.user.id,
            email,
            full_name: fullName,
            team_name: teamName,
            institution,
            track,
            role: 'participant',
          };

          setSuccessMsg('Account registered successfully! Logging you in...');
          setTimeout(() => {
            onAuthSuccess(profile);
            onClose();
          }, 800);
        }
      } else {
        // Sign in with Supabase
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authErr) throw authErr;

        if (authData.user) {
          // Fetch existing profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          const profile: UserProfile = profileData || {
            id: authData.user.id,
            email: authData.user.email || email,
            full_name: authData.user.user_metadata?.full_name || 'Team Leader',
            team_name: authData.user.user_metadata?.team_name || 'Alpha Team',
            institution: authData.user.user_metadata?.institution || 'ASL Academy',
            track: authData.user.user_metadata?.track || 'Engineering Track',
            role: 'participant',
          };

          setSuccessMsg('Welcome back! Loading your competition workspace...');
          setTimeout(() => {
            onAuthSuccess(profile);
            onClose();
          }, 600);
        }
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify your credentials.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Account shortcut
  const handleQuickDemo = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const demoEmail = 'competitor.demo@alphasciencelab.org';
    const demoPassword = 'DemoCompetitionPassword2026!';

    try {
      // Attempt login
      const { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (!signInErr && authData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        const profile: UserProfile = profileData || {
          id: authData.user.id,
          email: demoEmail,
          full_name: 'Dr. Sarah Connor',
          team_name: 'Apex Robotics ASL-01',
          institution: 'ASL Institute of Science & Technology',
          track: 'Advanced Robotics & Embedded Systems',
          role: 'participant',
        };

        setSuccessMsg('Logged in with Demo Team Account!');
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 500);
        return;
      }

      // If account doesn't exist, create it
      const { data: newAuth, error: signUpErr } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: 'Dr. Sarah Connor',
            team_name: 'Apex Robotics ASL-01',
            institution: 'ASL Institute of Science & Technology',
            track: 'Advanced Robotics & Embedded Systems',
          },
        },
      });

      if (signUpErr) throw signUpErr;

      if (newAuth.user) {
        await supabase.from('profiles').upsert({
          id: newAuth.user.id,
          email: demoEmail,
          full_name: 'Dr. Sarah Connor',
          team_name: 'Apex Robotics ASL-01',
          institution: 'ASL Institute of Science & Technology',
          track: 'Advanced Robotics & Embedded Systems',
          role: 'participant',
        });

        const profile: UserProfile = {
          id: newAuth.user.id,
          email: demoEmail,
          full_name: 'Dr. Sarah Connor',
          team_name: 'Apex Robotics ASL-01',
          institution: 'ASL Institute of Science & Technology',
          track: 'Advanced Robotics & Embedded Systems',
          role: 'participant',
        };

        setSuccessMsg('Created & logged into Demo Team Account!');
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 500);
      }
    } catch (err: unknown) {
      console.error('Demo auth error:', err);
      const message = err instanceof Error ? err.message : 'Failed to launch demo account.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner mb-3">
              <Image 
                src="/asl-logo.png" 
                alt="ASL Logo" 
                width={56} 
                height={36} 
                className="h-9 w-auto object-contain" 
              />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'signin' ? 'Sign In to Competition Hub' : 'Register Competition Team'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Alpha Science Lab Task & Submission Management Portal
            </p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full mb-5 flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl bg-linear-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 font-semibold text-xs transition-all shadow-md group"
          >
            <Rocket className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>1-Click Test Demo Login (Judge / Tester)</span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest">
              Or with credentials
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Team Register
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Team Name
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Robotics ASL-01"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Team Leader / Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Institution / University / School
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. MEC / University of Engineering"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Competition Track
                  </label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all"
                  >
                    <option value="Advanced Robotics & Embedded Systems">Advanced Robotics & Embedded Systems</option>
                    <option value="Aerospace, UAV & Autonomous Systems">Aerospace, UAV & Autonomous Systems</option>
                    <option value="AI, Edge Computing & Data Science">AI, Edge Computing & Data Science</option>
                    <option value="Sustainable Engineering & Hardware Innovation">Sustainable Engineering & Hardware Innovation</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="team@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Complete Team Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
