'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { NavigationTab } from '@/types';
import { 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  Layers, 
  HelpCircle, 
  ChevronUp, 
  X, 
  Mail, 
  Award, 
  ArrowRight 
} from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: NavigationTab) => void;
  onOpenAuth?: () => void;
}

type PolicyModalTab = 'terms' | 'privacy' | 'honor';

export default function Footer({ onNavigateTab, onOpenAuth }: FooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // State for Legal & Compliance Modal
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyModalTab>('terms');

  // Lock scroll when modal is open
  useEffect(() => {
    if (policyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [policyModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPolicyModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const openPolicy = (tab: PolicyModalTab) => {
    setActivePolicyTab(tab);
    setPolicyModalOpen(true);
  };

  return (
    <footer className="relative mt-20 sm:mt-24 border-t border-slate-800/80 bg-slate-950/95 text-slate-400">
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/40 to-transparent" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12">
        
        {/* ASL Official Motto Hero Banner */}
        <div className="relative mb-12 sm:mb-16 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Official Motto • Alpha Science Lab</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                “Creativity starts from belief”
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Empowering the next generation of engineers, roboticists, and visionary innovators to transform bold concepts into real-world technological breakthroughs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleNavClick('tasks')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
              >
                <span>Explore Milestones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={() => openPolicy('honor')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-750 text-xs sm:text-sm font-medium transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Honor Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Mission (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shrink-0">
                <Image 
                  src="/asl-logo.png" 
                  alt="Alpha Science Lab Logo" 
                  width={44} 
                  height={30} 
                  className="h-8 w-auto object-contain" 
                  loading="eager"
                />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight block">
                  ALPHA SCIENCE LAB
                </span>
                <span className="text-[11px] font-medium text-cyan-400 tracking-wide uppercase block">
                  National Multi-Stage Technical Competition
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier national engineering and robotics milestone competition platform. Organized under the Directorate of Technical Affairs, MEC BD Innovation & Robotics Cell.
            </p>

            {/* Institutional Credentials */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Encrypted Submissions</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
                <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Jury Rubric Audited</span>
              </div>
            </div>
          </div>

          {/* Column 1: Competition Hub */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Competition</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('overview')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Overview & Timeline
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

          {/* Column 2: Governance & Legal */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Governance & Legal</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('terms')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('privacy')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicy('honor')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Honor Code & Fair Play
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('rules')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Deliverable Standards (PPTX / Video)
                </button>
              </li>
              <li>
                <span className="text-slate-500 text-xs inline-block">
                  Academic Non-Exclusive License
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Support */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Support & Cell</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="text-slate-300">
                <span className="font-semibold block text-white text-xs">MEC BD Innovation & Robotics</span>
                <span className="text-[11px] text-slate-400">Executive Technical Board</span>
              </li>
              <li>
                <a
                  href="mailto:support@alphasciencelab.org"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>support@alphasciencelab.org</span>
                </a>
              </li>
              <li className="pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Evaluation Platform Active</span>
                </div>
              </li>
              {onOpenAuth && (
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    Participant Portal Access →
                  </button>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-500">
          
          <div className="space-y-1">
            <p className="text-slate-400">
              © 2026 <strong className="text-slate-300 font-semibold">Alpha Science Lab</strong>. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-500">
              MEC BD Innovation & Robotics Cell • Directorate of Technical Affairs
            </p>
          </div>

          {/* Quick Legal Links & Back to Top */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6 text-xs">
            <button
              type="button"
              onClick={() => openPolicy('terms')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-700 select-none">•</span>
            <button
              type="button"
              onClick={() => openPolicy('privacy')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700 select-none">•</span>
            <button
              type="button"
              onClick={() => openPolicy('honor')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Honor Code
            </button>
            <span className="text-slate-700 select-none">•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

        </div>

      </div>

      {/* Enterprise Policy & Governance Modal */}
      {policyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPolicyModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Official Governance & Policies
                  </h3>
                  <p className="text-xs text-slate-400">
                    Alpha Science Lab National Technical Competition Platform
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-3 gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActivePolicyTab('terms')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activePolicyTab === 'terms'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActivePolicyTab('privacy')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activePolicyTab === 'privacy'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActivePolicyTab('honor')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activePolicyTab === 'honor'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Honor Code & Fair Play
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh]">
              
              {activePolicyTab === 'terms' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                    <p className="font-semibold text-xs sm:text-sm">
                      Official Terms of Competition Governance • Version 2026.1
                    </p>
                    <p className="text-[11px] text-cyan-400/80 mt-1">
                      Applicable to all registered competitors, institutional teams, jury evaluators, and observers.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      1. Eligibility & Registration
                    </h4>
                    <p className="text-slate-400">
                      Participation in the Alpha Science Lab (ASL) Competition is open to enrolled students and verified institutional teams. Each competitor must register with verified academic credentials and retain an active, authentic profile throughout all milestones.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      2. Intellectual Property & Ownership
                    </h4>
                    <p className="text-slate-400">
                      All intellectual property, including source code repositories, 3D CAD models, slide presentations, and video demonstrations submitted by participants, remains the sole property of the original creators. By submitting deliverables, competitors grant ASL and MEC BD Innovation Cell a non-exclusive license strictly for academic review, jury scoring, and competition exhibition.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      3. Submission Standards & Deadlines
                    </h4>
                    <p className="text-slate-400">
                      All deliverables must adhere to the designated milestone formats (GitHub repository links, MP4/YouTube video demonstrations, and PPTX slide decks). Submissions submitted after the announced deadline may receive point deductions or be rendered ineligible according to jury discretion.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      4. Jury Authority & Finality
                    </h4>
                    <p className="text-slate-400">
                      Evaluation scoring is conducted in accordance with the published ASL Rubrics by qualified jury panelists. All decisions regarding score allocations, milestone rankings, and podium designations are final and authoritative.
                    </p>
                  </div>
                </div>
              )}

              {activePolicyTab === 'privacy' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    <p className="font-semibold text-xs sm:text-sm">
                      Participant Data Protection & Confidentiality Policy
                    </p>
                    <p className="text-[11px] text-blue-400/80 mt-1">
                      Ensuring rigorous privacy, encrypted storage, and ethical use of competitor information.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      1. Information Collected
                    </h4>
                    <p className="text-slate-400">
                      We collect competitor full names, institutional email addresses, student registration numbers, academic departments, batch years, and submitted technical deliverables. This information is required exclusively for leaderboard publication, jury access, and certificate generation.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      2. Security & Encrypted Infrastructure
                    </h4>
                    <p className="text-slate-400">
                      All account credentials and submission metadata are protected using industry-grade TLS encryption and strict Row-Level Security policies. Sensitive authentication tokens are never exposed or shared with unauthorized entities.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      3. Non-Disclosure & Commercial Protection
                    </h4>
                    <p className="text-slate-400">
                      Alpha Science Lab strictly prohibits the commercial monetization, resale, or distribution of competitor data. Participant information is never shared with third-party advertisers.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      4. Data Rectification & Deletion
                    </h4>
                    <p className="text-slate-400">
                      Competitors may request profile data corrections or account removal following the conclusion of the competition season by contacting the Directorate of Technical Affairs at support@alphasciencelab.org.
                    </p>
                  </div>
                </div>
              )}

              {activePolicyTab === 'honor' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <p className="font-semibold text-xs sm:text-sm">
                      ASL Academic Honor Code & Fair Competition Pledge
                    </p>
                    <p className="text-[11px] text-amber-400/80 mt-1">
                      Upholding scientific integrity, genuine engineering effort, and transparent collaboration.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      1. Originality & Anti-Plagiarism
                    </h4>
                    <p className="text-slate-400">
                      All code, mechanical schematics, circuit diagrams, and presentations must represent the authentic work of the registered competitor or team. Direct copying or uncredited utilization of another team’s deliverables will result in immediate disqualification.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      2. Open Source & AI Assistance Attribution
                    </h4>
                    <p className="text-slate-400">
                      Participants are permitted to utilize public open-source libraries and modern AI development assistants provided they are appropriately documented in project notes. Competitors must fully understand and be prepared to defend all architecture and implementation details during jury review.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">
                      3. Professional Conduct
                    </h4>
                    <p className="text-slate-400">
                      Respectful, collaborative, and collegiate behavior is mandatory at all times. Unsportsmanlike conduct, attempts to tamper with the leaderboard, or harassment of competitors or jury members will result in platform suspension.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Alpha Science Lab Governance Board
              </span>
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
