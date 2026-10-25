'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase/client';
import { Task, Submission, UserProfile, AllowedFormat } from '@/types';
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
  Link as LinkIcon, 
  Clock,
  ImageIcon
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
  const [documentUrl, setDocumentUrl] = useState(submission?.document_url || submission?.pptx_url || '');
  const [pptxFileName, setPptxFileName] = useState(submission?.pptx_file_name || '');
  const [imageUrl, setImageUrl] = useState(submission?.image_url || '');
  const [githubUrl, setGithubUrl] = useState(submission?.github_url || '');
  const [githubBranch, setGithubBranch] = useState(submission?.github_branch || 'main');
  const [notes, setNotes] = useState(submission?.notes || '');
  
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine which submission formats are allowed for this task
  const allowed = (task.allowed_formats || ['github']) as AllowedFormat[];
  const isGithubAllowed = allowed.includes('github');
  const isVideoAllowed = allowed.includes('video');
  const isDocumentAllowed = allowed.includes('document') || allowed.includes('pptx');
  const isImageAllowed = allowed.includes('image');

  // File upload handler for Document / Presentation
  const handleFileUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userProfile) {
      onOpenAuth();
      return;
    }

    setUploadingDoc(true);
    setErrorMsg(null);

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userProfile.id}/task-${task.id}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('asl-submissions')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        const localUrl = URL.createObjectURL(file);
        setDocumentUrl(localUrl);
        setPptxFileName(file.name);
      } else {
        const { data: publicData } = supabase.storage
          .from('asl-submissions')
          .getPublicUrl(data.path);
        setDocumentUrl(publicData.publicUrl);
        setPptxFileName(file.name);
      }
    } catch {
      setErrorMsg('Error uploading document file.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Direct Image Upload Handler
  const handleFileUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userProfile) {
      onOpenAuth();
      return;
    }

    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userProfile.id}/task-${task.id}/img_${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('asl-submissions')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);
      } else {
        const { data: publicData } = supabase.storage
          .from('asl-submissions')
          .getPublicUrl(data.path);
        setImageUrl(publicData.publicUrl);
      }
    } catch {
      setErrorMsg('Error uploading image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit deliverable handler
  const handleSubmit = async (targetStatus: 'submitted' | 'draft') => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    // Dynamic validation
    if (isGithubAllowed && githubUrl.trim() && !githubUrl.includes('github.com')) {
      setErrorMsg('Please enter a valid GitHub repository URL (e.g., https://github.com/organization/repo).');
      return;
    }

    const hasAnyDeliverable =
      (isGithubAllowed && Boolean(githubUrl.trim())) ||
      (isVideoAllowed && Boolean(videoUrl.trim())) ||
      (isDocumentAllowed && Boolean(documentUrl.trim())) ||
      (isImageAllowed && Boolean(imageUrl.trim()));

    if (targetStatus === 'submitted' && !hasAnyDeliverable) {
      setErrorMsg('Please provide at least one required deliverable field enabled for this challenge.');
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
        video_url: isVideoAllowed && videoUrl.trim() ? videoUrl.trim() : null,
        document_url: isDocumentAllowed && documentUrl.trim() ? documentUrl.trim() : null,
        pptx_url: isDocumentAllowed && documentUrl.trim() ? documentUrl.trim() : null,
        pptx_file_name: pptxFileName.trim() || null,
        image_url: isImageAllowed && imageUrl.trim() ? imageUrl.trim() : null,
        github_url: isGithubAllowed && githubUrl.trim() ? githubUrl.trim() : null,
        github_branch: isGithubAllowed && githubBranch.trim() ? githubBranch.trim() : 'main',
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('submissions')
        .upsert(submissionData, { onConflict: 'user_id,task_id' })
        .select()
        .single();

      if (error) throw error;

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
          ? `Task ${task.id} deliverable submitted successfully to database!` 
          : `Task ${task.id} saved as draft.`
      );

      setTimeout(() => {
        onSubmitted(data as Submission);
        onClose();
      }, 900);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error submitting deliverable');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Glowing Top Gradient Bar */}
        <div className="h-1.5 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  TASK #{task.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                  {task.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {task.points} Points
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {task.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed line-clamp-2">
                {task.description}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
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

        {/* Modal Body: Only Render Enabled Formats */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
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
            
            {/* 1. GITHUB MONOREPO SECTION (Rendered only if enabled) */}
            {isGithubAllowed && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">GitHub Repository & Monorepo</h4>
                      <p className="text-[11px] text-slate-400">Public repository link containing code, CAD, or markdown docs</p>
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
              </div>
            )}

            {/* 2. YOUTUBE VIDEO SECTION (Rendered only if enabled) */}
            {isVideoAllowed && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">YouTube Video Demonstration</h4>
                      <p className="text-[11px] text-slate-400">YouTube, Vimeo, Loom, or shared video link</p>
                    </div>
                  </div>
                  {videoUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Attached
                    </span>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. GOOGLE DRIVE / DOCUMENT SECTION (Rendered only if enabled) */}
            {isDocumentAllowed && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Drive Document / Slide Deck</h4>
                      <p className="text-[11px] text-slate-400">Google Drive shareable link, Google Slides, or PDF/PPTX upload</p>
                    </div>
                  </div>
                  {documentUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Uploaded
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or https://docs.google.com/..."
                      value={documentUrl}
                      onChange={(e) => {
                        setDocumentUrl(e.target.value);
                        if (!pptxFileName) setPptxFileName('Cloud Document Link');
                      }}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Or Direct Document File Upload */}
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-400/50 rounded-xl p-3 text-center transition-all bg-slate-900/40">
                    <input
                      type="file"
                      accept=".pdf,.pptx,.ppt,.docx"
                      onChange={handleFileUploadDoc}
                      disabled={uploadingDoc}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-200 block">
                      {uploadingDoc ? 'Uploading document...' : 'Or upload document file (PDF / PPTX)'}
                    </span>
                  </div>

                  {documentUrl && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate font-medium">{pptxFileName || documentUrl}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={documentUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 p-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button type="button" onClick={() => { setDocumentUrl(''); setPptxFileName(''); }} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. DIRECT IMAGE UPLOADS (Rendered only if enabled) */}
            {isImageAllowed && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Direct Image Deliverable</h4>
                      <p className="text-[11px] text-slate-400">Upload circuit schematic, CAD rendering, or physical prototype photo</p>
                    </div>
                  </div>
                  {imageUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Attached
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-400/50 rounded-xl p-3 text-center transition-all bg-slate-900/40">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUploadImage}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-200 block">
                      {uploadingImage ? 'Uploading image...' : 'Click or drop image file (PNG, JPG, WebP)'}
                    </span>
                  </div>

                  {imageUrl && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <span className="truncate font-mono text-emerald-400">{imageUrl}</span>
                      <button type="button" onClick={() => setImageUrl('')} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes & Team Comments */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <label className="block text-xs font-bold text-white mb-1.5">
                Technical Notes & Participant Remarks
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
            <span>Submissions can be updated anytime before master competition close.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('submitted')}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Submitting...' : 'Submit Deliverables'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
