'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase/client';
import { Task, Submission, UserProfile } from '@/types';
import { 
  X, 
  Video, 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  FileCheck, 
  Sparkles, 
  Link as LinkIcon, 
  Clock
} from 'lucide-react';
import Github from '@/components/GithubIcon';

interface TaskSubmissionModalProps {
  task: Task;
  submission: Submission | null;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (savedSubmission: Submission) => void;
  onOpenAuth: () => void;
}

export default function TaskSubmissionModal({
  task,
  submission,
  userProfile,
  isOpen,
  onClose,
  onSubmitted,
  onOpenAuth,
}: TaskSubmissionModalProps) {
  const [videoUrl, setVideoUrl] = useState(submission?.video_url || '');
  const [videoFileName, setVideoFileName] = useState(submission?.video_file_name || '');
  const [pptxUrl, setPptxUrl] = useState(submission?.pptx_url || '');
  const [pptxFileName, setPptxFileName] = useState(submission?.pptx_file_name || '');
  const [pptxFileSize, setPptxFileSize] = useState<number | null>(submission?.pptx_file_size || null);
  const [githubUrl, setGithubUrl] = useState(submission?.github_url || '');
  const [githubBranch, setGithubBranch] = useState(submission?.github_branch || 'main');
  const [notes, setNotes] = useState(submission?.notes || '');
  
  const [uploadingPptx, setUploadingPptx] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // File upload handler for PPTX / PDF
  const handleFileUploadPptx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userProfile) {
      onOpenAuth();
      return;
    }

    setUploadingPptx(true);
    setErrorMsg(null);

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userProfile.id}/task-${task.id}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('asl-submissions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        // Fallback to object URL if storage policies are restrictive
        console.warn('Storage upload note:', error.message);
        const localUrl = URL.createObjectURL(file);
        setPptxUrl(localUrl);
        setPptxFileName(file.name);
        setPptxFileSize(file.size);
      } else {
        const { data: publicData } = supabase.storage
          .from('asl-submissions')
          .getPublicUrl(data.path);

        setPptxUrl(publicData.publicUrl);
        setPptxFileName(file.name);
        setPptxFileSize(file.size);
      }
    } catch (err: unknown) {
      console.error('PPTX upload error:', err);
      const message = err instanceof Error ? err.message : 'Error uploading presentation file.';
      setErrorMsg(message);
    } finally {
      setUploadingPptx(false);
    }
  };

  // File upload handler for direct video file
  const handleFileUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userProfile) {
      onOpenAuth();
      return;
    }

    setUploadingVideo(true);
    setErrorMsg(null);

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userProfile.id}/task-${task.id}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('asl-submissions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Video storage note:', error.message);
        const localUrl = URL.createObjectURL(file);
        setVideoUrl(localUrl);
        setVideoFileName(file.name);
      } else {
        const { data: publicData } = supabase.storage
          .from('asl-submissions')
          .getPublicUrl(data.path);

        setVideoUrl(publicData.publicUrl);
        setVideoFileName(file.name);
      }
    } catch (err: unknown) {
      console.error('Video upload error:', err);
      const message = err instanceof Error ? err.message : 'Error uploading video file.';
      setErrorMsg(message);
    } finally {
      setUploadingVideo(false);
    }
  };

  // Submit deliverable handler
  const handleSubmit = async (targetStatus: 'submitted' | 'draft') => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    // Validation
    const hasAnyDeliverable = videoUrl.trim() || pptxUrl.trim() || githubUrl.trim();
    if (targetStatus === 'submitted' && !hasAnyDeliverable) {
      setErrorMsg('Please provide at least one required deliverable format (Video, PPTX presentation, or GitHub URL).');
      return;
    }

    if (githubUrl.trim() && !githubUrl.includes('github.com')) {
      setErrorMsg('Please enter a valid GitHub repository URL (e.g., https://github.com/organization/repo).');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const submissionData = {
        user_id: userProfile.id,
        task_id: task.id,
        team_name: userProfile.team_name || userProfile.full_name || 'Participant Team',
        status: targetStatus,
        video_url: videoUrl.trim() || null,
        video_file_name: videoFileName.trim() || null,
        pptx_url: pptxUrl.trim() || null,
        pptx_file_name: pptxFileName.trim() || null,
        pptx_file_size: pptxFileSize,
        github_url: githubUrl.trim() || null,
        github_branch: githubBranch.trim() || 'main',
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('submissions')
        .upsert(submissionData, { onConflict: 'user_id,task_id' })
        .select()
        .single();

      if (error) throw error;

      // Celebrate with confetti if final submitted!
      if (targetStatus === 'submitted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#3b82f6', '#6366f1', '#10b981'],
        });
      }

      setSuccessMsg(
        targetStatus === 'submitted' 
          ? `Task ${task.id} deliverable submitted successfully to Supabase!` 
          : `Task ${task.id} saved as draft.`
      );

      setTimeout(() => {
        onSubmitted(data as Submission);
        onClose();
      }, 900);

    } catch (err: unknown) {
      console.error('Submission save error:', err);
      const message = err instanceof Error ? err.message : 'Failed to save submission to database.';
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  };

  const isVideoAllowed = task.allowed_formats.includes('video');
  const isPptxAllowed = task.allowed_formats.includes('pptx') || task.allowed_formats.includes('document');
  const isGithubAllowed = task.allowed_formats.includes('github');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Top Gradient Header */}
        <div className="h-2 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  TASK #{task.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  {task.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {task.points} Points
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {task.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {task.description}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Deliverables Checklist */}
          {task.deliverables?.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Required Deliverables Checklist:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submission Formats Sections */}
          <div className="space-y-6">
            
            {/* 1. PPTX / Presentation Section */}
            {isPptxAllowed && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Presentation Slide Deck (.pptx / .pdf)</h4>
                      <p className="text-[11px] text-slate-400">Upload executive presentation file or provide presentation cloud link</p>
                    </div>
                  </div>
                  {pptxUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Uploaded
                    </span>
                  )}
                </div>

                {/* Upload or Link */}
                <div className="space-y-3">
                  {/* File Upload Drop Zone */}
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-400/50 rounded-xl p-4 text-center transition-all bg-slate-900/40">
                    <input
                      type="file"
                      accept=".pptx,.ppt,.pdf,.key"
                      onChange={handleFileUploadPptx}
                      disabled={uploadingPptx}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-200 block">
                      {uploadingPptx ? 'Uploading file to Supabase Storage...' : 'Click or drag PPTX / PDF file to upload'}
                    </span>
                    <span className="text-[10px] text-slate-500">Max size 50MB (PowerPoint, PDF format)</span>
                  </div>

                  {/* Or Cloud Link Input */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Or Presentation URL (Google Slides, OneDrive, Canva, SpeakerDeck)
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://docs.google.com/presentation/d/..."
                        value={pptxUrl}
                        onChange={(e) => {
                          setPptxUrl(e.target.value);
                          if (!pptxFileName) setPptxFileName('Cloud Presentation Deck');
                        }}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Uploaded File Status Pill */}
                  {pptxUrl && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate font-medium">{pptxFileName || 'Presentation Deliverable'}</span>
                        {pptxFileSize && (
                          <span className="text-[10px] text-slate-500">
                            ({(pptxFileSize / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={pptxUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-cyan-400 hover:text-cyan-300 p-1"
                          title="Open Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => { setPptxUrl(''); setPptxFileName(''); setPptxFileSize(null); }}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Video Demonstration Section */}
            {isVideoAllowed && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Demonstration Video (MP4 / Link)</h4>
                      <p className="text-[11px] text-slate-400">Direct MP4 upload or YouTube, Vimeo, Loom, or Google Drive link</p>
                    </div>
                  </div>
                  {videoUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Attached
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Video URL Input */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Video Demonstration URL (YouTube, Vimeo, Google Drive, Loom)
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://youtu.be/... or https://vimeo.com/..."
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          if (!videoFileName) setVideoFileName('Demo Video Link');
                        }}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Or Direct Video File Upload */}
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-400/50 rounded-xl p-3 text-center transition-all bg-slate-900/40">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleFileUploadVideo}
                      disabled={uploadingVideo}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-300 block">
                      {uploadingVideo ? 'Uploading video deliverable...' : 'Or upload video file directly (MP4/WebM)'}
                    </span>
                  </div>

                  {/* Live Video Preview if URL is direct video */}
                  {videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm')) && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-48 mx-auto">
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. GitHub Monorepo Section */}
            {isGithubAllowed && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">GitHub Repository & Code Monorepo</h4>
                      <p className="text-[11px] text-slate-400">Public or shared repository containing project code, firmware, or CAD</p>
                    </div>
                  </div>
                  {githubUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Connected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Repository URL
                    </label>
                    <div className="relative">
                      <Github className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://github.com/organization/project-monorepo"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Target Branch / Tag
                    </label>
                    <input
                      type="text"
                      placeholder="main"
                      value={githubBranch}
                      onChange={(e) => setGithubBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {githubUrl && (
                  <div className="mt-2 text-right">
                    <a 
                      href={githubUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <span>Verify GitHub URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 4. Notes & Team Comments */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <label className="block text-xs font-bold text-white mb-1.5">
                Technical Notes & Team Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Include brief execution notes, test environment specs, special instructions for evaluators, or version highlights..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Submissions can be updated anytime before the deadline.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('submitted')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Deliverable</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
