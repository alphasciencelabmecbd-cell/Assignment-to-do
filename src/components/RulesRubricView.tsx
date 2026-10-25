'use client';

import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Video, 
  Scale
} from 'lucide-react';
import Github from '@/components/GithubIcon';

export default function RulesRubricView() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      
      {/* Overview Banner */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-400 border border-blue-500/30 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            Official Guidelines
          </span>
          <span className="text-xs text-slate-400 font-mono">ASL Specification v2.4</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight text-balance-fluid">
          Competition Rules, Formats & Evaluation Rubrics
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          All participating competitors must comply with the submission guidelines below. Deliverables are submitted across structured milestone tasks with evaluation from the jury panel.
        </p>
      </div>

      {/* Submission Format Specifications */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>Accepted Deliverable Formats & Standards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* PPTX Presentations */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel border border-slate-800 space-y-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Presentations (PPTX / PDF)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard 16:9 widescreen slides. Include problem statement, architecture diagrams, test results, and references.
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Max file size: 50MB</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Google Slides / Canva cloud links accepted</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Font embedding recommended</span>
              </li>
            </ul>
          </div>

          {/* Demonstration Video */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-cyan-400 border border-blue-500/20 w-fit">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Video Demonstration</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crisp 3-5 minute demonstration showing real physical hardware in action, telemetry graphs, and failure handling.
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>1080p / 4K resolution preferred</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>YouTube (Unlisted/Public) or Loom</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Direct MP4 / WebM upload enabled</span>
              </li>
            </ul>
          </div>

          {/* GitHub Repository */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              <Github className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">GitHub Monorepo</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clean version-controlled repository containing firmware, AI training scripts, simulation models, and setup guides.
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Comprehensive README.md with run steps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Specify branch (e.g. main or release-tag)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Open-source license (MIT, Apache, or BSD)</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Evaluation Rubric Breakdown */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel border border-slate-800">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
          Judges Evaluation Rubric & Point Distribution
        </h3>

        <div className="space-y-3 sm:space-y-4">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-white">1. Technical Rigor & Scientific Methodology (35%)</h5>
              <p className="text-xs text-slate-400 mt-0.5">Sound engineering calculations, proper circuit diagrams, simulation accuracy, and failure analysis.</p>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/40 shrink-0 self-start sm:self-auto">437.5 PTS</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-white">2. Prototype Execution & Live Demonstration (30%)</h5>
              <p className="text-xs text-slate-400 mt-0.5">Physical hardware readiness, responsive telemetry, code cleanliness, and robustness under load.</p>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/40 shrink-0 self-start sm:self-auto">375.0 PTS</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-white">3. Presentation Clarity & PPTX Deck Quality (20%)</h5>
              <p className="text-xs text-slate-400 mt-0.5">Concise visual storytelling, executive slide composition, clear data graphs, and professional design.</p>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/40 shrink-0 self-start sm:self-auto">250.0 PTS</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-white">4. Commercial Viability & Impact (15%)</h5>
              <p className="text-xs text-slate-400 mt-0.5">Unit economics, BOM feasibility, regulatory roadmap, and real-world societal impact.</p>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/40 shrink-0 self-start sm:self-auto">187.5 PTS</span>
          </div>
        </div>
      </div>

    </div>
  );
}
