'use client';

import React from 'react';
import Image from 'next/image';
import { Database } from 'lucide-react';
import Github from '@/components/GithubIcon';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Image 
                src="/asl-logo.png" 
                alt="ASL Logo" 
                width={40} 
                height={26} 
                className="h-7 w-auto object-contain" 
                loading="eager"
              />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                ALPHA SCIENCE LAB
              </span>
              <p className="text-[11px] text-slate-500">
                National Multi-Stage Technical Competition Platform
              </p>
            </div>
          </div>

          {/* System Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase DB Connected</span>
            </div>

            <a
              href="https://github.com/alphasciencelabmecbd-cell/Assignment-to-do"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <Github className="w-3.5 h-3.5 text-cyan-400" />
              <span>GitHub Repository</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-right text-xs text-slate-500">
            <p>© 2026 Alpha Science Lab. All rights reserved.</p>
            <p className="text-[10px] text-slate-600 mt-0.5">MEC BD Innovation & Robotics Cell</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
