'use client';

import React, { useState } from 'react';
import { TaskResource } from '@/types';
import {
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Maximize2,
  X,
  Play
} from 'lucide-react';

interface TaskResourcePlayersProps {
  youtubeUrl?: string | null;
  resources?: TaskResource[];
  taskTitle: string;
}

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function TaskResourcePlayers({
  youtubeUrl,
  resources = [],
  taskTitle,
}: TaskResourcePlayersProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mainYouTubeId = extractYouTubeId(youtubeUrl);
  
  // Categorize attached resources
  const youtubeResources = resources.filter((r) => r.type === 'youtube' || extractYouTubeId(r.url));
  const pdfResources = resources.filter((r) => r.type === 'pdf' || r.url.toLowerCase().endsWith('.pdf'));
  const pptxResources = resources.filter((r) => r.type === 'pptx' || r.url.toLowerCase().endsWith('.pptx') || r.url.toLowerCase().endsWith('.ppt'));
  const imageResources = resources.filter((r) => r.type === 'image' || /\.(png|jpe?g|webp|gif|svg)$/i.test(r.url));
  const otherResources = resources.filter(
    (r) =>
      !youtubeResources.includes(r) &&
      !pdfResources.includes(r) &&
      !pptxResources.includes(r) &&
      !imageResources.includes(r)
  );

  const hasAnyResources =
    !!mainYouTubeId ||
    youtubeResources.length > 0 ||
    pdfResources.length > 0 ||
    pptxResources.length > 0 ||
    imageResources.length > 0 ||
    otherResources.length > 0;

  if (!hasAnyResources) {
    return null;
  }

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: EMBEDDED YOUTUBE VIDEO PLAYER */}
      {(mainYouTubeId || youtubeResources.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Video Briefing & Engineering Walkthrough
            </h3>
          </div>

          {/* Primary YouTube Embed */}
          {mainYouTubeId && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${mainYouTubeId}?rel=0&modestbranding=1`}
                title={`${taskTitle} - Engineering Walkthrough`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* Secondary YouTube Embeds if any */}
          {youtubeResources.map((yt, idx) => {
            const ytId = extractYouTubeId(yt.url);
            if (!ytId || ytId === mainYouTubeId) return null;
            return (
              <div key={idx} className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">{yt.title || `Resource Video #${idx + 1}`}</span>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
                    title={yt.title || 'Technical Reference Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 2: PDF DOCUMENT RESOURCES (DATASHEETS, RUBRICS, SPEC SHEETS) */}
      {pdfResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Technical Documentation & Datasheets (PDF)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pdfResources.map((pdf, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {pdf.title || `Specification Document #${idx + 1}`}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Official Specification PDF
                    </span>
                  </div>
                </div>

                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold shrink-0 transition-all"
                >
                  <span>Open PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SLIDE DECK (PPTX) RESOURCES */}
      {pptxResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Presentation Slide Decks (PPTX)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pptxResources.map((pptx, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-orange-500/40 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-orange-300 transition-colors">
                      {pptx.title || `Presentation Slide Deck #${idx + 1}`}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      PowerPoint / Presentation Asset
                    </span>
                  </div>
                </div>

                <a
                  href={pptx.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold shrink-0 transition-all"
                >
                  <span>Download Deck</span>
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: IMAGE SCHEMATICS & DIAGRAMS */}
      {imageResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ImageIcon className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Engineering Schematics & Reference Diagrams
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {imageResources.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img.url)}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video cursor-pointer hover:border-cyan-400 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.title || `Schematic diagram #${idx + 1}`}
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 rounded-full bg-slate-900/90 text-cyan-400 border border-cyan-500/30">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-white">Click to Expand</span>
                </div>
                {img.title && (
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-slate-950/80 backdrop-blur-xs text-[11px] font-semibold text-slate-300 truncate">
                    {img.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: OTHER ATTACHED EXTERNAL RESOURCES */}
      {otherResources.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Additional Resource Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {otherResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/40 text-xs text-slate-300 hover:text-white flex items-center justify-between gap-2 transition-all"
              >
                <span className="truncate">{res.title || res.url}</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR IMAGES */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Expanded diagram"
              loading="eager"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl border border-slate-700 object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
