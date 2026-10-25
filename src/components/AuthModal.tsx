'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Calendar, 
  Hash, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Rocket,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile, isAdmin?: boolean) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Individual Registration Fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputEmail = email.trim();
    const inputPassword = password;

    try {
      if (mode === 'signup') {
        // Individual Registration via API route
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            department,
            batch,
            registrationNumber,
            email: inputEmail,
            password: inputPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to complete registration.');
        }

        // Sign in immediately with Supabase client to initialize session
        await supabase.auth.signInWithPassword({
          email: inputEmail.toLowerCase(),
          password: inputPassword,
        });

        const profile: UserProfile = data.profile || {
          id: 'participant-session',
          email: inputEmail.toLowerCase(),
          full_name: name,
          department,
          batch,
          registration_number: registrationNumber,
          role: 'participant',
        };

        if (data.emailSent) {
          setSuccessMsg('Registration successful! Confirmation email sent to your inbox.');
        } else if (data.emailSimulated) {
          setSuccessMsg('Registration successful! Confirmation email simulated in dev mode.');
        } else {
          setSuccessMsg('Registration successful! (Note: Confirmation email could not be sent — check GMAIL_APP_PASSWORD in .env.local)');
        }

        setTimeout(() => {
          onAuthSuccess(profile, false);
          onClose();
        }, 1000);

      } else {
        // Sign In Flow
        // Check exact admin credentials specified: Email: alphasciencelabmecbd.com, Password: Alpha@2025
        const normalizedEmail = inputEmail.toLowerCase();
        const isAdminCredentials = 
          (normalizedEmail === 'alphasciencelabmecbd.com' || normalizedEmail === 'alphasciencelabmecbd@gmail.com') &&
          inputPassword === 'Alpha@2025';

        // For Supabase authentication, use the registered email format
        const authEmail = isAdminCredentials ? 'alphasciencelabmecbd@gmail.com' : normalizedEmail;

        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: inputPassword,
        });

        if (authErr) throw authErr;

        if (authData.user) {
          // Fetch existing profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          const isUserAdmin = isAdminCredentials || profileData?.role === 'admin' || authData.user.user_metadata?.role === 'admin';

          const profile: UserProfile = {
            ...(profileData || {}),
            id: authData.user.id,
            email: authData.user.email || authEmail,
            full_name: profileData?.full_name || (isUserAdmin ? 'ASL Competition Administrator' : 'Individual Competitor'),
            department: profileData?.department || (isUserAdmin ? 'Alpha Science Lab Executive Board' : 'Engineering'),
            batch: profileData?.batch || (isUserAdmin ? 'Faculty & Jury' : '2024'),
            registration_number: profileData?.registration_number || (isUserAdmin ? 'ASL-ADMIN-CHAIR' : 'REG-ASL-001'),
            role: isUserAdmin ? 'admin' : 'participant',
          };

          if (isUserAdmin) {
            setSuccessMsg('Administrator verified. Loading secured Admin Dashboard...');
            setTimeout(() => {
              onAuthSuccess(profile, true);
              onClose();
            }, 600);
          } else {
            setSuccessMsg('Welcome back! Loading your competition dashboard...');
            setTimeout(() => {
              onAuthSuccess(profile, false);
              onClose();
            }, 600);
          }
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

  // Instant Demo Participant Login
  const handleQuickDemoParticipant = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const demoEmail = 'competitor.demo@alphasciencelab.org';
    const demoPassword = 'DemoCompetitionPassword2026!';

    try {
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
          full_name: 'Aiden Vance',
          department: 'Computer Science & Engineering',
          batch: 'Batch 2023',
          registration_number: 'REG-CSE-2023-089',
          role: 'participant',
        };

        setSuccessMsg('Logged in as Demo Participant (Aiden Vance)!');
        setTimeout(() => {
          onAuthSuccess(profile, false);
          onClose();
        }, 500);
        return;
      }

      // If not yet created, register via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Aiden Vance',
          department: 'Computer Science & Engineering',
          batch: 'Batch 2023',
          registrationNumber: 'REG-CSE-2023-089',
          email: demoEmail,
          password: demoPassword,
        }),
      });

      const regData = await res.json();
      await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });

      setSuccessMsg('Registered & logged into Demo Account!');
      setTimeout(() => {
        onAuthSuccess(regData.profile, false);
        onClose();
      }, 500);
    } catch {
      setErrorMsg('Failed to launch demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-7 overflow-y-auto">
          
          {/* Logo & Header */}
          <div className="text-center mb-5">
            <div className="inline-flex p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner mb-2.5">
              <Image 
                src="/asl-logo.png" 
                alt="ASL Logo" 
                width={56} 
                height={36} 
                className="h-8 w-auto object-contain" 
              />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'signin' ? 'Sign In to Competition Portal' : 'Individual Participant Registration'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Alpha Science Lab Engineering & Innovation Arena
            </p>
          </div>

          {/* Quick Demo Participant Button (Clean, no admin buttons) */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleQuickDemoParticipant}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 font-semibold text-xs transition-all group"
            >
              <Rocket className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>1-Click Test Demo Competitor (Aiden Vance)</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              Or with credentials
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 mb-5 rounded-2xl bg-slate-950 border border-slate-800">
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
              Individual Register
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
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {mode === 'signup' && (
              <>
                {/* 1. Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Participant Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                {/* 2. Department & 3. Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Department *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. CSE / ME / EEE"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Batch *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2024 / Batch 22"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Registration Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Registration Number / Student ID *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2022-CSE-042 or REG-8921"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 5. Email Address / Identifier */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. participant@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[10px] text-cyan-400/80 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>An official confirmation email with your credentials will be dispatched to this address.</span>
                </p>
              )}
            </div>

            {/* 6. Password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password *
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
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Portal' : 'Complete Individual Registration'}</span>
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
