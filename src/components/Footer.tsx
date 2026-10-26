'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { NavigationTab } from '@/types';
import { 
  Sparkles, 
  Mail, 
  ChevronUp, 
  Layers 
} from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: NavigationTab) => void;
  onOpenAuth?: () => void;
}

export default function Footer({ onNavigateTab, onOpenAuth }: FooterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (tab: NavigationTab) => {
    if (pathname === '/' && onNavigateTab) {
      onNavigateTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-16 sm:mt-20 border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        
        {/* Main Grid: Branding, Essential Navigation, Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          {/* Column 1: Basic Branding & Official Motto */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                <Image 
                  src="/asl-logo.png" 
                  alt="Alpha Science Lab Logo" 
                  width={36} 
                  height={24} 
                  className="h-7 w-auto object-contain" 
                  loading="eager"
                />
              </div>
              <div>
                <span className="font-extrabold text-base text-white tracking-tight block">
                  ALPHA SCIENCE LAB
                </span>
                <span className="text-xs font-medium text-slate-500 tracking-wide block">
                  National Technical Competition Platform
                </span>
              </div>
            </div>

            {/* Official Motto */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="italic">“Creativity starts from belief”</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering engineers and innovators across structured technical milestone challenges.
            </p>
          </div>

          {/* Column 2: Essential Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Essential Navigation</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('overview')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Competition Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('tasks')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Milestone Tasks
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('leaderboard')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Live Leaderboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('rules')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Rules & Evaluation Rubrics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('submissions')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Participant Submissions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Contact & Support</span>
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <p className="text-slate-400 text-xs">
                For official competition inquiries, technical assistance, or institutional partnerships:
              </p>
              <a
                href="mailto:alphasciencelabmecbd@gmail.com"
                className="inline-flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-slate-700 transition-all font-mono text-xs break-all"
              >
                <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>alphasciencelabmecbd@gmail.com</span>
              </a>
              <p className="text-xs text-slate-500 pt-1">
                MEC BD Innovation & Robotics Cell
              </p>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="inline-block text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer pt-1"
                >
                  Participant Portal Login →
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-500">
          <div className="space-y-1">
            <p className="text-slate-400">
              © 2026 <strong className="text-slate-300 font-semibold">Alpha Science Lab</strong>. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              MEC BD Innovation & Robotics Cell
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer text-xs"
            title="Scroll to top of page"
          >
            <span>Back to Top</span>
            <ChevronUp className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

      </div>
    </footer>
  );
}
