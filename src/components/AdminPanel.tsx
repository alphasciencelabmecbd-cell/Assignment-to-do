'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Task, Submission, UserProfile, Project, TaskResource, ResourceType, AllowedFormat } from '@/types';
import {
  ShieldAlert,
  Layers,
  FileCheck2,
  Users,
  PlusCircle,
  Search,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Trash2,
  Award,
  Sparkles,
  RefreshCw,
  X,
  Download,
  AlertTriangle,
  FileText,
  Video,
  Grid3X3,
  List,
  PlaySquare,
  Image as ImageIcon,
  Paperclip,
  Check,
  Clock,
  UserPlus,
  ShieldCheck,
  Eye,
  Key,
  Lock,
  Ban
} from 'lucide-react';
import Github from '@/components/GithubIcon';

interface AdminPanelProps {
  tasks: Task[];
  onTasksUpdated: () => void;
  currentUser: UserProfile | null;
  masterDeadline?: string;
  onDeadlineUpdated?: (newDeadline: string) => void;
}

export default function AdminPanel({
  tasks,
  onTasksUpdated,
  currentUser,
  masterDeadline,
  onDeadlineUpdated,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'tasks' | 'participants' | 'new-task' | 'projects'>('submissions');
  
  // Data states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Master Competition Deadline management state
  const [adminDeadline, setAdminDeadline] = useState(
    masterDeadline ? new Date(masterDeadline).toISOString().slice(0, 16) : ''
  );
  const [savingDeadline, setSavingDeadline] = useState(false);

  // Inline Point Management state
  const [inlineScores, setInlineScores] = useState<Record<string, string>>({});
  const [savingScoreId, setSavingScoreId] = useState<string | null>(null);

  // Submissions filters & grading modal
  const [searchSubmission, setSearchSubmission] = useState('');
  const [filterTask, setFilterTask] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [evalScore, setEvalScore] = useState<string>('');
  const [evalFeedback, setEvalFeedback] = useState<string>('');
  const [evalStatus, setEvalStatus] = useState<string>('evaluated');
  const [savingEvaluation, setSavingEvaluation] = useState(false);

  // Participant monitoring view toggle: 'matrix' | 'table'
  const [participantViewMode, setParticipantViewMode] = useState<'matrix' | 'table'>('matrix');
  const [searchParticipant, setSearchParticipant] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'participant' | 'judge' | 'admin'>('all');
  const [filterAccountStatus, setFilterAccountStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // Participant inspect/view modal state
  const [inspectingParticipant, setInspectingParticipant] = useState<UserProfile | null>(null);

  // Participant edit state
  const [editingParticipant, setEditingParticipant] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editRole, setEditRole] = useState<'participant' | 'judge' | 'admin'>('participant');
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [editAccountStatus, setEditAccountStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [savingParticipant, setSavingParticipant] = useState(false);

  // New Participant registration state
  const [showCreateParticipantModal, setShowCreateParticipantModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createDept, setCreateDept] = useState('Computer Science & Engineering');
  const [createBatch, setCreateBatch] = useState('2024');
  const [createRegNo, setCreateRegNo] = useState('');
  const [createRole, setCreateRole] = useState<'participant' | 'judge' | 'admin'>('participant');
  const [createIsVerified, setCreateIsVerified] = useState(true);
  const [createAccountStatus, setCreateAccountStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [createSendEmail, setCreateSendEmail] = useState(true);
  const [creatingParticipant, setCreatingParticipant] = useState(false);

  // New Task form state
  const [customTaskId, setCustomTaskId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskShortTitle, setTaskShortTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Software Development');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPoints, setTaskPoints] = useState('100');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskYoutubeUrl, setTaskYoutubeUrl] = useState('');
  const [taskDeliverableInput, setTaskDeliverableInput] = useState('');
  const [taskDeliverables, setTaskDeliverables] = useState<string[]>([
    'Clean GitHub Monorepo Link',
    'Technical Architecture & Documentation',
    'Demonstration Video Link'
  ]);
  const [taskFormats, setTaskFormats] = useState<AllowedFormat[]>(['github', 'video', 'document', 'image']);
  
  // New Task attached resources builder
  const [taskResources, setTaskResources] = useState<TaskResource[]>([]);
  const [resType, setResType] = useState<ResourceType>('pdf');
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Edit Task modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskShortTitle, setEditTaskShortTitle] = useState('');
  const [editTaskCategory, setEditTaskCategory] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskPoints, setEditTaskPoints] = useState('100');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [editTaskYoutubeUrl, setEditTaskYoutubeUrl] = useState('');
  const [editTaskDeliverables, setEditTaskDeliverables] = useState<string[]>([]);
  const [editTaskDeliverableInput, setEditTaskDeliverableInput] = useState('');
  const [editTaskFormats, setEditTaskFormats] = useState<AllowedFormat[]>([]);
  const [editTaskResources, setEditTaskResources] = useState<TaskResource[]>([]);
  const [editResType, setEditResType] = useState<ResourceType>('pdf');
  const [editResTitle, setEditResTitle] = useState('');
  const [editResUrl, setEditResUrl] = useState('');
  const [savingTaskEdit, setSavingTaskEdit] = useState(false);

  // New Project form state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSubtitle, setProjectSubtitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('Hardware & Robotics');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [projectTags, setProjectTags] = useState('Embedded, AI, IoT');
  const [creatingProject, setCreatingProject] = useState(false);

  // Load submissions & participants asynchronously
  const fetchAllData = async () => {
    try {
      const [subRes, partRes, projRes] = await Promise.all([
        fetch('/api/admin/submissions'),
        fetch('/api/admin/participants'),
        fetch('/api/admin/projects'),
      ]);
      const [subData, partData, projData] = await Promise.all([
        subRes.json(),
        partRes.json(),
        projRes.json(),
      ]);

      if (subData.submissions) setSubmissions(subData.submissions);
      if (partData.participants) setParticipants(partData.participants);
      if (projData.projects) setProjects(projData.projects);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [subRes, partRes, projRes] = await Promise.all([
          fetch('/api/admin/submissions'),
          fetch('/api/admin/participants'),
          fetch('/api/admin/projects'),
        ]);
        const [subData, partData, projData] = await Promise.all([
          subRes.json(),
          partRes.json(),
          projRes.json(),
        ]);

        if (!ignore) {
          if (subData.submissions) setSubmissions(subData.submissions);
          if (partData.participants) setParticipants(partData.participants);
          if (projData.projects) setProjects(projData.projects);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    fetchAllData();
    onTasksUpdated();
  };

  // Map submissions by user ID and task ID for real-time matrix monitoring
  const submissionsByUserAndTask = useMemo(() => {
    const map: Record<string, Record<number, Submission>> = {};
    submissions.forEach((sub) => {
      if (!map[sub.user_id]) {
        map[sub.user_id] = {};
      }
      map[sub.user_id][sub.task_id] = sub;
    });
    return map;
  }, [submissions]);

  // Metrics summary
  const metrics = useMemo(() => {
    const totalSubmissions = submissions.length;
    const evaluated = submissions.filter((s) => s.status === 'evaluated').length;
    const underReview = submissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length;
    const totalParticipants = participants.length;
    const avgScore = evaluated > 0
      ? Math.round(submissions.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / evaluated)
      : 0;

    return { totalSubmissions, evaluated, underReview, totalParticipants, avgScore };
  }, [submissions, participants]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchTask = filterTask === 'all' || String(sub.task_id) === filterTask;
      const matchStatus = filterStatus === 'all' || sub.status === filterStatus;
      
      const pName = sub.profile?.full_name?.toLowerCase() || '';
      const pReg = sub.profile?.registration_number?.toLowerCase() || '';
      const pEmail = sub.profile?.email?.toLowerCase() || '';
      const tName = sub.team_name?.toLowerCase() || '';
      const taskTitle = sub.task?.title?.toLowerCase() || '';
      const q = searchSubmission.toLowerCase();

      const matchSearch = !q || pName.includes(q) || pReg.includes(q) || pEmail.includes(q) || tName.includes(q) || taskTitle.includes(q);

      return matchTask && matchStatus && matchSearch;
    });
  }, [submissions, filterTask, filterStatus, searchSubmission]);

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchDept = filterDept === 'all' || p.department === filterDept;
      const matchRole = filterRole === 'all' || p.role === filterRole;
      const matchVerification =
        filterVerification === 'all' ||
        (filterVerification === 'verified' && Boolean(p.is_verified)) ||
        (filterVerification === 'unverified' && !p.is_verified);
      const matchStatus =
        filterAccountStatus === 'all' || (p.account_status || 'active') === filterAccountStatus;

      const q = searchParticipant.toLowerCase();
      const pName = p.full_name?.toLowerCase() || '';
      const pReg = p.registration_number?.toLowerCase() || '';
      const pEmail = p.email?.toLowerCase() || '';
      const pBatch = p.batch?.toLowerCase() || '';

      const matchSearch =
        !q ||
        pName.includes(q) ||
        pReg.includes(q) ||
        pEmail.includes(q) ||
        pBatch.includes(q);

      return matchDept && matchRole && matchVerification && matchStatus && matchSearch;
    });
  }, [participants, filterDept, filterRole, filterVerification, filterAccountStatus, searchParticipant]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      if (p.department) set.add(p.department);
    });
    return Array.from(set);
  }, [participants]);

  // Handle open grading modal
  const handleOpenGrading = (sub: Submission) => {
    setSelectedSubmission(sub);
    setEvalScore(sub.score !== null && sub.score !== undefined ? String(sub.score) : '');
    setEvalFeedback(sub.feedback || '');
    setEvalStatus(sub.status || 'evaluated');
  };

  // Submit evaluation
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setSavingEvaluation(true);

    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSubmission.id,
          score: evalScore ? parseFloat(evalScore) : null,
          feedback: evalFeedback,
          status: evalStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update submission');

      setMessage({ text: 'Submission evaluated and score saved successfully!', type: 'success' });
      setSelectedSubmission(null);
      fetchAllData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Evaluation error', type: 'error' });
    } finally {
      setSavingEvaluation(false);
    }
  };

  // Sync admin deadline input whenever masterDeadline prop changes
  useEffect(() => {
    if (masterDeadline) {
      try {
        setAdminDeadline(new Date(masterDeadline).toISOString().slice(0, 16));
      } catch {
        // ignore invalid date
      }
    }
  }, [masterDeadline]);

  // Handle save Master Competition Deadline (Spec 5)
  const handleSaveMasterDeadline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminDeadline) return;
    setSavingDeadline(true);
    try {
      const iso = new Date(adminDeadline).toISOString();
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ master_deadline: iso }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update master deadline');
      if (onDeadlineUpdated) onDeadlineUpdated(iso);
      setMessage({ text: 'Master competition deadline updated successfully! Countdown timer refreshed.', type: 'success' });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Error updating deadline', type: 'error' });
    } finally {
      setSavingDeadline(false);
    }
  };

  // Handle inline quick score update (Spec 3)
  const handleQuickSaveScore = async (subId: string, currentScoreVal?: number | null) => {
    const rawVal = inlineScores[subId] !== undefined ? inlineScores[subId] : (currentScoreVal !== null && currentScoreVal !== undefined ? String(currentScoreVal) : '');
    const num = parseFloat(rawVal);
    if (isNaN(num) || num < 0 || num > 100) {
      setMessage({ text: 'Please enter a valid evaluation score between 0 and 100 points.', type: 'error' });
      return;
    }
    setSavingScoreId(subId);
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subId,
          score: num,
          status: 'evaluated',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update score');

      // Instantly update local submissions array
      setSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, score: num, status: 'evaluated' } : s))
      );
      setMessage({ text: `Evaluation score of ${num}/100 saved! Leaderboard recalculated.`, type: 'success' });
      fetchAllData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Error saving score', type: 'error' });
    } finally {
      setSavingScoreId(null);
    }
  };

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customTaskId ? parseInt(customTaskId, 10) : undefined,
          title: taskTitle,
          short_title: taskShortTitle || taskTitle,
          category: taskCategory,
          description: taskDescription,
          points: parseInt(taskPoints, 10),
          deadline: taskDeadline || undefined,
          youtube_url: taskYoutubeUrl.trim() || null,
          resources: taskResources,
          deliverables: taskDeliverables,
          allowed_formats: taskFormats,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');

      setMessage({ text: `Task "${taskTitle}" published successfully!`, type: 'success' });
      setCustomTaskId('');
      setTaskTitle('');
      setTaskShortTitle('');
      setTaskDescription('');
      setTaskPoints('100');
      setTaskDeadline('');
      setTaskYoutubeUrl('');
      setTaskResources([]);
      setActiveTab('tasks');
      onTasksUpdated();
      fetchAllData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Error creating task', type: 'error' });
    } finally {
      setCreatingTask(false);
    }
  };

  // Handle open Edit Task modal
  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title || '');
    setEditTaskShortTitle(task.short_title || '');
    setEditTaskCategory(task.category || 'Software Development');
    setEditTaskDescription(task.description || '');
    setEditTaskPoints(String(task.points || 100));
    setEditTaskDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
    setEditTaskYoutubeUrl(task.youtube_url || '');
    setEditTaskDeliverables(task.deliverables || []);
    setEditTaskFormats(task.allowed_formats || ['github']);
    setEditTaskResources(task.resources || []);
  };

  // Handle save Task Edit
  const handleSaveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setSavingTaskEdit(true);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTask.id,
          title: editTaskTitle,
          short_title: editTaskShortTitle || editTaskTitle,
          category: editTaskCategory,
          description: editTaskDescription,
          points: parseInt(editTaskPoints, 10),
          deadline: editTaskDeadline || undefined,
          youtube_url: editTaskYoutubeUrl.trim() || null,
          resources: editTaskResources,
          deliverables: editTaskDeliverables,
          allowed_formats: editTaskFormats,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');

      setMessage({ text: `Task #${editingTask.id} updated successfully!`, type: 'success' });
      setEditingTask(null);
      onTasksUpdated();
      fetchAllData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Error updating task', type: 'error' });
    } finally {
      setSavingTaskEdit(false);
    }
  };

  // Handle delete task
  const handleDeleteTask = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Task #${id}? All associated participant submissions will be removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tasks?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete task');

      setMessage({ text: `Task #${id} deleted successfully.`, type: 'success' });
      onTasksUpdated();
      fetchAllData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Error deleting task', type: 'error' });
    }
  };

  // Handle create project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProject(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          subtitle: projectSubtitle,
          category: projectCategory,
          description: projectDescription,
          link: projectLink,
          tags: projectTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      setMessage({ text: `Project "${projectTitle}" added to showcase!`, type: 'success' });
      setProjectTitle('');
      setProjectSubtitle('');
      setProjectDescription('');
      setProjectLink('');
      setActiveTab('projects');
      fetchAllData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Error creating project', type: 'error' });
    } finally {
      setCreatingProject(false);
    }
  };

  // Auto-generation helpers
  const generateRandomRegNo = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCreateRegNo(`ASL-2024-${randomNum}`);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = 'ASL@';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreatePassword(pwd);
  };

  // Handle participant edit
  const handleOpenEditParticipant = (p: UserProfile) => {
    setEditingParticipant(p);
    setEditName(p.full_name || '');
    setEditEmail(p.email || '');
    setEditPassword('');
    setEditDept(p.department || '');
    setEditBatch(p.batch || '');
    setEditRegNo(p.registration_number || '');
    setEditRole(p.role || 'participant');
    setEditIsVerified(Boolean(p.is_verified));
    setEditAccountStatus(p.account_status || 'active');
  };

  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;
    setSavingParticipant(true);

    try {
      const res = await fetch('/api/admin/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingParticipant.id,
          full_name: editName,
          email: editEmail,
          password: editPassword.trim() ? editPassword.trim() : undefined,
          department: editDept,
          batch: editBatch,
          registration_number: editRegNo,
          role: editRole,
          is_verified: editIsVerified,
          account_status: editAccountStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update participant');

      setMessage({ text: 'Participant details and account status synchronized successfully!', type: 'success' });
      setEditingParticipant(null);
      if (inspectingParticipant?.id === editingParticipant.id && data.participant) {
        setInspectingParticipant((prev) => (prev ? { ...prev, ...data.participant } : null));
      }
      fetchAllData();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Update error', type: 'error' });
    } finally {
      setSavingParticipant(false);
    }
  };

  // Quick 1-click Verify/Unverify Toggle
  const handleToggleVerify = async (p: UserProfile) => {
    const newVerifiedState = !p.is_verified;
    // Optimistic UI update
    setParticipants((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, is_verified: newVerifiedState } : item))
    );
    if (inspectingParticipant?.id === p.id) {
      setInspectingParticipant((prev) => (prev ? { ...prev, is_verified: newVerifiedState } : null));
    }

    try {
      const res = await fetch('/api/admin/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          is_verified: newVerifiedState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update verification status');

      setMessage({
        text: `Participant "${p.full_name || p.email}" is now ${newVerifiedState ? 'Verified' : 'Unverified'}.`,
        type: 'success',
      });
      fetchAllData();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Verification update error',
        type: 'error',
      });
      fetchAllData();
    }
  };

  // Quick Account Status Toggle (Active / Suspended)
  const handleToggleAccountStatus = async (p: UserProfile, newStatus: 'active' | 'suspended') => {
    setParticipants((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, account_status: newStatus } : item))
    );
    if (inspectingParticipant?.id === p.id) {
      setInspectingParticipant((prev) => (prev ? { ...prev, account_status: newStatus } : null));
    }

    try {
      const res = await fetch('/api/admin/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          account_status: newStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update account status');

      setMessage({
        text: `Account for "${p.full_name || p.email}" is now ${newStatus.toUpperCase()}.`,
        type: 'success',
      });
      fetchAllData();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Status update error',
        type: 'error',
      });
      fetchAllData();
    }
  };

  // Handle create participant
  const handleCreateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingParticipant(true);

    try {
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: createName,
          email: createEmail,
          password: createPassword.trim() ? createPassword.trim() : undefined,
          department: createDept,
          batch: createBatch,
          registration_number: createRegNo,
          role: createRole,
          is_verified: createIsVerified,
          account_status: createAccountStatus,
          send_email: createSendEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register participant');

      setMessage({
        text: `Participant "${createName}" successfully registered! ${
          data.generatedPassword ? `Auto-generated Password: ${data.generatedPassword}` : ''
        }`,
        type: 'success',
      });

      // Reset create state
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateDept('Computer Science & Engineering');
      setCreateBatch('2024');
      setCreateRegNo('');
      setCreateRole('participant');
      setCreateIsVerified(true);
      setCreateAccountStatus('active');
      setCreateSendEmail(true);
      setShowCreateParticipantModal(false);

      fetchAllData();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Error creating participant',
        type: 'error',
      });
    } finally {
      setCreatingParticipant(false);
    }
  };

  // Handle delete participant
  const handleDeleteParticipant = async (id: string, name: string | null) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete participant "${name || 'User'}"?\n\nThis will immediately remove their Supabase Auth account, public profile, and all submitted tasks.`
      )
    ) {
      return;
    }

    // Optimistic UI update
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.user_id !== id));
    if (inspectingParticipant?.id === id) setInspectingParticipant(null);
    if (editingParticipant?.id === id) setEditingParticipant(null);

    try {
      const res = await fetch(`/api/admin/participants?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setMessage({
        text: `Participant "${name || 'User'}" permanently deleted from database and auth.`,
        type: 'success',
      });
      fetchAllData();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Delete error',
        type: 'error',
      });
      fetchAllData();
    }
  };

  // Export participants CSV
  const handleExportCSV = () => {
    if (participants.length === 0) return;
    const headers = [
      'Registration No',
      'Name',
      'Department',
      'Batch',
      'Email',
      'Role',
      'Verified',
      'Account Status',
      'Tasks Completed',
      'Total Score'
    ];
    const rows = participants.map((p) => {
      const userSubs = submissionsByUserAndTask[p.id] || {};
      const completedCount = Object.values(userSubs).filter((s) => s.status === 'submitted' || s.status === 'evaluated').length;
      const totalScore = Object.values(userSubs).reduce((acc, s) => acc + (Number(s.score) || 0), 0);

      return [
        `"${p.registration_number || 'N/A'}"`,
        `"${p.full_name || 'N/A'}"`,
        `"${p.department || 'N/A'}"`,
        `"${p.batch || 'N/A'}"`,
        `"${p.email || 'N/A'}"`,
        `"${p.role || 'participant'}"`,
        `"${p.is_verified ? 'Verified' : 'Unverified'}"`,
        `"${p.account_status || 'active'}"`,
        `"${completedCount}/${tasks.length}"`,
        `"${totalScore}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ASL_Competition_Participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Top Banner & Control Deck */}
      <div className="relative rounded-3xl bg-linear-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                Jury & Administrator Control Hub
              </span>
              <span className="text-xs text-slate-400">
                &bull; {currentUser ? `Active Admin: ${currentUser.full_name || currentUser.email}` : 'Dynamic Database Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Competition Administration & Evaluation Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Create, edit, and delete custom technical challenges, embed media resources, monitor participant completion states, and evaluate submissions with direct GitHub repo links.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap justify-end">
            <button
              onClick={() => {
                setShowCreateParticipantModal(true);
                generateRandomRegNo();
                generateRandomPassword();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-xs font-bold text-white transition-all shadow-md shadow-cyan-900/30 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Participant</span>
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold text-cyan-300 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {message && (
          <div className={`mt-5 p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/70 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Participants</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-white">{metrics.totalParticipants}</span>
              <span className="text-[10px] text-cyan-400">Registered</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Submissions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-cyan-400">{metrics.totalSubmissions}</span>
              <span className="text-[10px] text-slate-400">Uploaded</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Pending Review</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-amber-400">{metrics.underReview}</span>
              <span className="text-[10px] text-amber-500">Needs evaluation</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Evaluated Tasks</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">{metrics.evaluated}</span>
              <span className="text-[10px] text-emerald-500">Graded</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 col-span-2 lg:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Average Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-indigo-400">{metrics.avgScore}</span>
              <span className="text-[10px] text-slate-400">PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Master Competition Deadline Control Deck (Spec 5) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-cyan-950/80 via-slate-900/90 to-indigo-950/80 border border-cyan-500/40 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Master Competition Deadline Control
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Unified Global Timer
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Sets the single master deadline countdown in the platform header. Decommissions individual task deadlines and automatically restricts submissions when expired.
          </p>
        </div>

        <form onSubmit={handleSaveMasterDeadline} className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="datetime-local"
              value={adminDeadline}
              onChange={(e) => setAdminDeadline(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
              required
            />
          </div>
          <button
            type="submit"
            disabled={savingDeadline}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {savingDeadline ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{savingDeadline ? 'Saving...' : 'Update Global Deadline'}</span>
          </button>
        </form>
      </div>

      {/* Admin Navigation Subtabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Participant Submissions</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'participants'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participant Monitoring Matrix</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {participants.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tasks & Media Resources</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('new-task')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'new-task'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Custom Task</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Showcase Projects</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {projects.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PARTICIPANT SUBMISSIONS MONITOR & EVALUATION     */}
      {/* ======================================================== */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search participant name, reg number, email, or task..."
                value={searchSubmission}
                onChange={(e) => setSearchSubmission(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterTask}
                onChange={(e) => setFilterTask(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Tasks ({tasks.length})</option>
                {tasks.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    Task #{t.id}: {t.short_title || t.title}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="evaluated">Evaluated</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
              Loading submissions data from database...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
              <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Submissions Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No participant submissions match your current filter criteria or none have been submitted yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((sub) => {
                const participant = sub.profile;
                const task = tasks.find((t) => t.id === sub.task_id) || sub.task;

                return (
                  <div
                    key={sub.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Task #{sub.task_id}: {task?.short_title || `Task ${sub.task_id}`}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'evaluated'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : sub.status === 'under_review'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {sub.status.replace('_', ' ')}
                        </span>

                        {sub.score !== null && sub.score !== undefined && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            Score: {sub.score} / {task?.points || 100} PTS
                          </span>
                        )}
                      </div>

                      {/* Participant Details */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-white text-sm">
                          {participant?.full_name || sub.team_name || 'Individual Participant'}
                        </span>
                        {participant?.registration_number && (
                          <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 text-[11px]">
                            {participant.registration_number}
                          </span>
                        )}
                        {participant?.department && (
                          <span className="text-slate-400 text-[11px]">
                            &bull; {participant.department}
                          </span>
                        )}
                        {participant?.batch && (
                          <span className="text-slate-400 text-[11px]">
                            ({participant.batch})
                          </span>
                        )}
                      </div>

                      {/* Direct Clickable Evaluation Links (GitHub, Video, Deck) */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                        {sub.github_url && (
                          <a
                            href={sub.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 hover:text-white font-mono text-xs font-bold transition-all shadow-sm"
                            title="Direct link to evaluate participant's GitHub repository"
                          >
                            <Github className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                            <span>Open Repo ({sub.github_branch || 'main'})</span>
                            <ExternalLink className="w-3 h-3 text-purple-400" />
                          </a>
                        )}

                        {sub.video_url && (
                          <a
                            href={sub.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-semibold transition-all"
                          >
                            <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>Demo Video</span>
                            <ExternalLink className="w-3 h-3 text-rose-400" />
                          </a>
                        )}

                        {sub.pptx_url && (
                          <a
                            href={sub.pptx_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/50 hover:bg-orange-900/70 border border-orange-500/40 text-orange-200 hover:text-white text-xs font-semibold transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>Slide Deck ({sub.pptx_file_name || 'PPTX/PDF'})</span>
                            <ExternalLink className="w-3 h-3 text-orange-400" />
                          </a>
                        )}

                        {sub.document_url && (
                          <a
                            href={sub.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-blue-200 hover:text-white text-xs font-semibold transition-all"
                            title="Direct link to participant's document"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Document Link</span>
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                          </a>
                        )}

                        {sub.image_url && (
                          <a
                            href={sub.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-semibold transition-all"
                            title="Direct link to participant's schematic/image"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Image Proof</span>
                            <ExternalLink className="w-3 h-3 text-emerald-400" />
                          </a>
                        )}

                        {sub.notes && (
                          <span className="text-slate-400 italic max-w-md truncate text-xs">
                            &quot;{sub.notes}&quot;
                          </span>
                        )}
                      </div>

                      {/* Feedback Note if available */}
                      {sub.feedback && (
                        <div className="text-[11px] text-emerald-400/90 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40">
                          <strong>Jury Feedback:</strong> {sub.feedback}
                        </div>
                      )}
                    </div>

                    {/* Inline Point Management System (Spec 3) & Detailed Evaluation Modal */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 pl-2">Score:</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder={sub.score !== null && sub.score !== undefined ? String(sub.score) : '0-100'}
                          value={inlineScores[sub.id] !== undefined ? inlineScores[sub.id] : (sub.score !== null && sub.score !== undefined ? String(sub.score) : '')}
                          onChange={(e) => setInlineScores({ ...inlineScores, [sub.id]: e.target.value })}
                          className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                        />
                        <span className="text-[10px] font-mono text-slate-500 pr-1">/100</span>
                        <button
                          type="button"
                          onClick={() => handleQuickSaveScore(sub.id, sub.score)}
                          disabled={savingScoreId === sub.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                          title="Save score out of 100 points instantly & recalculate standings"
                        >
                          {savingScoreId === sub.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          <span>Save</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenGrading(sub)}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
                        title="Open detailed rubric feedback modal"
                      >
                        <Award className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Rubric</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PARTICIPANTS MONITORING & COMPLETION MATRIX       */}
      {/* ======================================================== */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          
          {/* Controls Bar & Filters */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by participant name, registration no, email, batch..."
                  value={searchParticipant}
                  onChange={(e) => setSearchParticipant(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={() => {
                    setShowCreateParticipantModal(true);
                    generateRandomRegNo();
                    generateRandomPassword();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Participant</span>
                </button>

                {/* View Switcher: Matrix vs Table */}
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
                  <button
                    onClick={() => setParticipantViewMode('matrix')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      participantViewMode === 'matrix'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span>Matrix</span>
                  </button>
                  <button
                    onClick={() => setParticipantViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      participantViewMode === 'table'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filter Badges Row */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold">Filter By:</span>
              
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Departments ({participants.length})</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value as 'all' | 'verified' | 'unverified')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Verification States</option>
                <option value="verified">Verified Only ({participants.filter(p => p.is_verified).length})</option>
                <option value="unverified">Unverified Only ({participants.filter(p => !p.is_verified).length})</option>
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | 'participant' | 'judge' | 'admin')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Roles</option>
                <option value="participant">Competitors ({participants.filter(p => p.role === 'participant').length})</option>
                <option value="judge">Judges ({participants.filter(p => p.role === 'judge').length})</option>
                <option value="admin">Administrators ({participants.filter(p => p.role === 'admin').length})</option>
              </select>

              <select
                value={filterAccountStatus}
                onChange={(e) => setFilterAccountStatus(e.target.value as 'all' | 'active' | 'suspended')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Account Statuses</option>
                <option value="active">Active Only ({participants.filter(p => (p.account_status || 'active') === 'active').length})</option>
                <option value="suspended">Suspended Only ({participants.filter(p => p.account_status === 'suspended').length})</option>
              </select>

              <span className="text-[11px] text-slate-500 ml-auto font-mono">
                Showing {filteredParticipants.length} of {participants.length}
              </span>
            </div>
          </div>

          {/* Matrix View: Displays participants, total progress, and per-task completion state */}
          {participantViewMode === 'matrix' ? (
            <div className="space-y-3">
              {filteredParticipants.length === 0 ? (
                <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white">No Participants Match</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    No registered competitors match this query. Try clearing the filters or add a new participant.
                  </p>
                </div>
              ) : (
                filteredParticipants.map((p) => {
                  const userSubs = submissionsByUserAndTask[p.id] || {};
                  const completedCount = Object.values(userSubs).filter((s) => s.status === 'submitted' || s.status === 'evaluated').length;
                  const totalScore = Object.values(userSubs).reduce((acc, s) => acc + (Number(s.score) || 0), 0);
                  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
                  const isVerified = Boolean(p.is_verified);
                  const isSuspended = p.account_status === 'suspended';

                  return (
                    <div
                      key={p.id}
                      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/70 border transition-all space-y-3.5 ${
                        isSuspended
                          ? 'border-red-900/50 bg-red-950/10'
                          : 'border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Header: Participant Profile, Badges & Actions */}
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Avatar Circle */}
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner ${
                            p.role === 'admin'
                              ? 'bg-linear-to-br from-purple-600 to-indigo-700'
                              : p.role === 'judge'
                              ? 'bg-linear-to-br from-amber-500 to-orange-600'
                              : 'bg-linear-to-br from-blue-600 to-cyan-600'
                          }`}>
                            {(p.full_name || p.email || 'U').charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-white">
                                {p.full_name || 'Individual Competitor'}
                              </h3>
                              
                              {/* Registration Number */}
                              <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 text-[11px] font-bold">
                                {p.registration_number || 'REG-PENDING'}
                              </span>

                              {/* Role Badge */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                p.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : p.role === 'judge'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {p.role}
                              </span>

                              {/* Verification Badge */}
                              {isVerified ? (
                                <button
                                  onClick={() => handleToggleVerify(p)}
                                  title="Click to unverify"
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer"
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  <span>Verified</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleVerify(p)}
                                  title="Click to verify participant immediately"
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                                >
                                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                                  <span>Unverified (Click to Verify)</span>
                                </button>
                              )}

                              {/* Account Status Badge */}
                              {isSuspended ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 border border-red-500/40 text-red-300">
                                  <Ban className="w-3 h-3 text-red-400" />
                                  <span>Suspended</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span>Active</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                              <span className="font-mono text-slate-400">{p.email}</span>
                              <span>&bull;</span>
                              <span>{p.department || 'Engineering'}</span>
                              <span>({p.batch || '2024'})</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress, Score & Direct Action Buttons */}
                        <div className="flex items-center gap-2.5 self-end lg:self-center flex-wrap">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Progress</span>
                            <div className="flex items-baseline gap-1.5 justify-end">
                              <span className="text-sm font-black text-cyan-400 font-mono">{completedCount} / {tasks.length}</span>
                              <span className="text-[10px] text-slate-400">({progressPct}%)</span>
                            </div>
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
                            <span className="text-[10px] text-purple-400 uppercase font-bold block">Earned</span>
                            <span className="text-sm font-black text-white font-mono">{totalScore} PTS</span>
                          </div>

                          {/* Quick Actions Group */}
                          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => setInspectingParticipant(p)}
                              title="Inspect Full Participant Dossier & Submissions"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleVerify(p)}
                              title={isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isVerified ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-amber-400 hover:bg-amber-950/40'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditParticipant(p)}
                              title="Edit Participant Details & Reset Password"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p.id, p.full_name)}
                              title="Permanently Delete Participant"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div
                          className="bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Task Completion States Matrix */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Specific Task Completion States (Click any completed task to evaluate / open repo):
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
                          {tasks.map((task) => {
                            const sub = userSubs[task.id];
                            const isEval = sub?.status === 'evaluated';
                            const isSub = sub?.status === 'submitted';
                            const isDraft = sub?.status === 'draft';

                            if (sub) {
                              return (
                                <button
                                  key={task.id}
                                  onClick={() => handleOpenGrading(sub)}
                                  title={`Task #${task.id}: ${task.short_title || task.title} - ${sub.status}. Click to evaluate directly.`}
                                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    isEval
                                      ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
                                      : isSub
                                      ? 'bg-cyan-950/40 border-cyan-500/40 hover:border-cyan-400 text-cyan-300'
                                      : isDraft
                                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono text-[10px] font-black">#{task.id}</span>
                                    {isEval ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                    ) : isSub ? (
                                      <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                                    ) : (
                                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold font-mono mt-1 block truncate">
                                    {isEval ? `${sub.score}p` : isSub ? 'Submitted' : 'Draft'}
                                  </span>
                                </button>
                              );
                            }

                            return (
                              <div
                                key={task.id}
                                title={`Task #${task.id}: Not Started`}
                                className="p-2 rounded-xl border border-slate-800/80 bg-slate-950/60 text-slate-600 flex flex-col justify-between opacity-60"
                              >
                                <span className="font-mono text-[10px] font-bold">#{task.id}</span>
                                <span className="text-[10px] font-mono mt-1 block text-slate-600">—</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Traditional Table View */
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Registration No</th>
                    <th className="p-3.5">Participant</th>
                    <th className="p-3.5">Department & Batch</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-center">Progress</th>
                    <th className="p-3.5 text-center">Score</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredParticipants.map((p) => {
                    const userSubs = submissionsByUserAndTask[p.id] || {};
                    const completedCount = Object.values(userSubs).filter((s) => s.status === 'submitted' || s.status === 'evaluated').length;
                    const totalScore = Object.values(userSubs).reduce((acc, s) => acc + (Number(s.score) || 0), 0);
                    const isVerified = Boolean(p.is_verified);
                    const isSuspended = p.account_status === 'suspended';

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-cyan-300 font-bold whitespace-nowrap">
                          {p.registration_number || 'REG-PENDING'}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                              p.role === 'admin'
                                ? 'bg-purple-600'
                                : p.role === 'judge'
                                ? 'bg-amber-600'
                                : 'bg-blue-600'
                            }`}>
                              {(p.full_name || p.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{p.full_name || 'Individual Competitor'}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                                  p.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                                  p.role === 'judge' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {p.role}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono block">{p.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300 whitespace-nowrap">
                          <div className="font-medium text-slate-200">{p.department || 'General Engineering'}</div>
                          <div className="text-[11px] text-slate-400">Batch {p.batch || '2024'}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {isVerified ? (
                            <button
                              onClick={() => handleToggleVerify(p)}
                              title="Click to toggle unverified"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Verified</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleVerify(p)}
                              title="Click to verify participant immediately"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer"
                            >
                              <ShieldAlert className="w-3 h-3 text-amber-400" />
                              <span>Verify Now</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {isSuspended ? (
                            <button
                              onClick={() => handleToggleAccountStatus(p, 'active')}
                              title="Click to activate account"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all cursor-pointer"
                            >
                              <Ban className="w-3 h-3 text-red-400" />
                              <span>Suspended</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleAccountStatus(p, 'suspended')}
                              title="Click to suspend participant account"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/40 transition-all cursor-pointer"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Active</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                            {completedCount} / {tasks.length}
                          </span>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap font-mono font-bold text-white">
                          {totalScore} PTS
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectingParticipant(p)}
                              title="Inspect Full Participant Details & Submissions"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleVerify(p)}
                              title={isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                              className={`p-1.5 rounded-lg bg-slate-800 transition-colors cursor-pointer ${
                                isVerified ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-amber-400 hover:bg-amber-950/40'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditParticipant(p)}
                              title="Edit Participant Details & Password"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p.id, p.full_name)}
                              title="Permanently Remove Participant"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TASKS & MEDIA RESOURCES OVERVIEW & EDIT           */}
      {/* ======================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Dynamic Competition Challenges</h2>
              <p className="text-xs text-slate-400">
                All tasks are stored in Supabase with embedded players for YouTube, PDFs, PPTX decks, and images.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('new-task')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Another Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => {
              const taskSubs = submissions.filter((s) => s.task_id === task.id);
              const evaluatedSubs = taskSubs.filter((s) => s.status === 'evaluated');
              const avg = evaluatedSubs.length > 0
                ? Math.round(evaluatedSubs.reduce((acc, c) => acc + (Number(c.score) || 0), 0) / evaluatedSubs.length)
                : null;

              return (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-cyan-400 border border-blue-500/30 font-mono">
                        Task #{task.id} &bull; {task.points} PTS
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/tasks/${task.id}`}
                          title="View Participant Detail Page"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditTask(task)}
                          title="Edit Task & Resources"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{task.title}</h3>
                      <p className="text-[11px] text-cyan-300 font-semibold">{task.category}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    </div>

                    {/* Attached Resources Badge preview */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {task.youtube_url && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-950/60 border border-red-800/40 text-red-300 flex items-center gap-1">
                          <PlaySquare className="w-2.5 h-2.5" />
                          <span>YouTube Video</span>
                        </span>
                      )}
                      {(task.resources || []).map((res, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                        >
                          {res.type === 'pdf' ? (
                            <FileText className="w-2.5 h-2.5 text-orange-400" />
                          ) : res.type === 'pptx' ? (
                            <FileText className="w-2.5 h-2.5 text-amber-400" />
                          ) : res.type === 'image' ? (
                            <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />
                          ) : (
                            <Paperclip className="w-2.5 h-2.5 text-purple-400" />
                          )}
                          <span className="truncate max-w-25">{res.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Task Submissions Progress */}
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Submissions</span>
                      <span className="font-bold text-white">{taskSubs.length} received</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Avg Score</span>
                      <span className="font-bold text-emerald-400">{avg !== null ? `${avg} PTS` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ADD CUSTOM TASK WITH MEDIA RESOURCES              */}
      {/* ======================================================== */}
      {activeTab === 'new-task' && (
        <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Task Creator Studio
            </span>
            <h2 className="text-xl font-bold text-white mt-2">Publish Custom Technical Task</h2>
            <p className="text-xs text-slate-400 mt-1">
              Define unique task number, name, point value, problem statement, and attach media resources (YouTube, PDFs, PPTX decks, images).
            </p>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            
            {/* Task Number, Title & Short Title */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Number</label>
                <input
                  type="number"
                  min={1}
                  placeholder={`e.g. ${tasks.length + 1}`}
                  value={customTaskId}
                  onChange={(e) => setCustomTaskId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous SLAM & LiDAR Navigation Engine"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Badge Title</label>
                <input
                  type="text"
                  placeholder="e.g. SLAM & LiDAR"
                  value={taskShortTitle}
                  onChange={(e) => setTaskShortTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Category, Points, Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Ideation & Research">Ideation & Research</option>
                  <option value="Design & Architecture">Design & Architecture</option>
                  <option value="Mechanical & Physical">Mechanical & Physical</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Milestone Evaluation">Milestone Evaluation</option>
                  <option value="Demonstration">Demonstration</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Validation & Quality">Validation & Quality</option>
                  <option value="Presentation & Business">Presentation & Business</option>
                  <option value="Grand Finale">Grand Finale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Point Value *</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={1000}
                  value={taskPoints}
                  onChange={(e) => setTaskPoints(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Submission Deadline</label>
                <input
                  type="datetime-local"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Problem Statement & Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Problem Statement & Detailed Technical Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Explain the problem statement, engineering hypothesis, performance criteria, constraints, and evaluation expectations..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Resource Handling: YouTube URL */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-white">
                <PlaySquare className="w-4 h-4 text-red-400" />
                <span>YouTube Video Link (Embedded Video Player)</span>
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={taskYoutubeUrl}
                onChange={(e) => setTaskYoutubeUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 block">
                Generates a responsive embedded YouTube player on the participant task detail page.
              </span>
            </div>

            {/* Resource Handling: Attach Media Resources (PDF, PPTX, Images) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-white">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span>Attach Media Resources (PDFs, Slide Decks, Schematics, Images)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as ResourceType)}
                  className="sm:col-span-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="pptx">Slide Deck (PPTX)</option>
                  <option value="image">Diagram / Image</option>
                  <option value="link">Resource Link</option>
                </select>

                <input
                  type="text"
                  placeholder="Resource Label (e.g. Circuit Schematics PDF)"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="sm:col-span-4 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />

                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="sm:col-span-4 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (resTitle.trim() && resUrl.trim()) {
                      setTaskResources([...taskResources, { type: resType, title: resTitle.trim(), url: resUrl.trim() }]);
                      setResTitle('');
                      setResUrl('');
                    }
                  }}
                  className="sm:col-span-1 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                  title="Attach Resource"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Render Attached Resources */}
              {taskResources.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {taskResources.map((res, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="font-semibold text-cyan-400 uppercase text-[10px]">{res.type}:</span>
                      <span>{res.title}</span>
                      <button
                        type="button"
                        onClick={() => setTaskResources(taskResources.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Deliverables Checklist Builder */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expected Deliverables Checklist
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. KiCad Circuit Schematic PDF"
                  value={taskDeliverableInput}
                  onChange={(e) => setTaskDeliverableInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (taskDeliverableInput.trim()) {
                        setTaskDeliverables([...taskDeliverables, taskDeliverableInput.trim()]);
                        setTaskDeliverableInput('');
                      }
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (taskDeliverableInput.trim()) {
                      setTaskDeliverables([...taskDeliverables, taskDeliverableInput.trim()]);
                      setTaskDeliverableInput('');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-bold text-cyan-400 hover:bg-slate-700 cursor-pointer"
                >
                  Add Item
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {taskDeliverables.map((item, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => setTaskDeliverables(taskDeliverables.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Allowed Submission Formats (Spec 4: Admin-Gated) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div>
                <label className="block text-xs font-bold text-white mb-0.5">
                  Admin-Gated Submission Formats
                </label>
                <p className="text-[11px] text-slate-400">
                  Toggle the exact deliverables participants can submit. Only checked formats will be rendered in the participant submission interface.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {[
                  { id: 'github', label: 'GitHub Monorepo URLs', desc: 'Code repository & branch', icon: Github, color: 'text-purple-400' },
                  { id: 'video', label: 'YouTube Video Links', desc: 'Working demonstration video', icon: Video, color: 'text-rose-400' },
                  { id: 'document', label: 'Google Drive Document Links', desc: 'Architecture & documentation PDF', icon: FileText, color: 'text-blue-400' },
                  { id: 'image', label: 'Direct Image Uploads', desc: 'Schematics, diagrams & visual proof', icon: ImageIcon, color: 'text-emerald-400' },
                ].map(({ id, label, desc, icon: Icon, color }) => {
                  const isChecked = taskFormats.includes(id as AllowedFormat);
                  return (
                    <label
                      key={id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTaskFormats([...taskFormats, id as AllowedFormat]);
                          } else {
                            setTaskFormats(taskFormats.filter((f) => f !== id));
                          }
                        }}
                        className="mt-0.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Icon className={`w-3.5 h-3.5 ${color}`} />
                          <span>{label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={creatingTask}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {creatingTask ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Custom Task to Competition Arena</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SHOWCASE PROJECTS STUDIO                          */}
      {/* ======================================================== */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl">
            <div className="mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Showcase Studio
              </span>
              <h2 className="text-xl font-bold text-white mt-2">Publish Innovation Project</h2>
              <p className="text-xs text-slate-400 mt-1">
                Add flagship research or engineering projects to showcase to students and visitors.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autonomous Quadruped Rover"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subtitle / Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Robotics & Automation Lab"
                    value={projectSubtitle}
                    onChange={(e) => setProjectSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Robotics & AI"
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Executive summary of the project innovation and accomplishments..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Embedded, ROS2, Computer Vision"
                  value={projectTags}
                  onChange={(e) => setProjectTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {creatingProject ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Showcase Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List Existing Projects */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Current Showcase Projects ({projects.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-purple-400 font-bold uppercase">{proj.category}</span>
                  <h4 className="text-sm font-bold text-white mt-1">{proj.title}</h4>
                  {proj.subtitle && <p className="text-xs text-slate-400">{proj.subtitle}</p>}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: GRADING & REVIEW SUBMISSION (DIRECT EVALUATION) */}
      {/* ======================================================== */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Jury Evaluation Deck
                </span>
                <h3 className="text-base font-bold text-white">
                  Grade Deliverable: Task #{selectedSubmission.task_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Participant info card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Participant Credential
                </span>
                <div className="font-bold text-white text-sm">
                  {selectedSubmission.profile?.full_name || selectedSubmission.team_name}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Reg No: <span className="text-cyan-300 font-mono">{selectedSubmission.profile?.registration_number || 'N/A'}</span> &bull; {selectedSubmission.profile?.department || 'Department N/A'} ({selectedSubmission.profile?.batch || 'Batch N/A'})
                </div>
              </div>

              {/* Direct Deliverable Links for Jury Evaluation */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Clickable Deliverables (Direct Evaluation)
                </span>
                
                {selectedSubmission.github_url && (
                  <a
                    href={selectedSubmission.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 hover:text-white transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Github className="w-5 h-5 text-purple-300 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-purple-400 font-bold block uppercase font-mono">GitHub Repository Monorepo</span>
                        <span className="font-mono text-xs font-bold text-white truncate block">{selectedSubmission.github_url}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold shrink-0">
                      <span>Open Repo</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                )}

                {selectedSubmission.video_url && (
                  <a
                    href={selectedSubmission.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-rose-400" />
                      <span>Live Demonstration Video: {selectedSubmission.video_url}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {selectedSubmission.pptx_url && (
                  <a
                    href={selectedSubmission.pptx_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-orange-950/40 border border-orange-800/60 text-orange-200 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span>{selectedSubmission.pptx_file_name || 'Slide Deck Presentation'}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {selectedSubmission.document_url && (
                  <a
                    href={selectedSubmission.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Architecture Document: {selectedSubmission.document_url}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {selectedSubmission.image_url && (
                  <a
                    href={selectedSubmission.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Schematic / Diagram Image Proof</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {selectedSubmission.notes && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Participant Notes:</span>
                    <p className="text-slate-300 italic">{selectedSubmission.notes}</p>
                  </div>
                )}
              </div>

              {/* Evaluation Form */}
              <form onSubmit={handleSaveEvaluation} className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Score (PTS) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={selectedSubmission.task?.points || 200}
                      placeholder={`0 - ${selectedSubmission.task?.points || 100}`}
                      value={evalScore}
                      onChange={(e) => setEvalScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Status *
                    </label>
                    <select
                      value={evalStatus}
                      onChange={(e) => setEvalStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="evaluated">Evaluated / Scored</option>
                      <option value="under_review">Under Review</option>
                      <option value="submitted">Needs Resubmission</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Jury Feedback & Evaluation Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback, rubric evaluation notes, or improvements for the competitor..."
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEvaluation}
                    className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {savingEvaluation ? 'Saving...' : 'Save Evaluation'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT TASK & MEDIA RESOURCES MODAL               */}
      {/* ======================================================== */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Task #{editingTask.id}</span>
                <h3 className="text-base font-bold text-white">Edit Task Details & Attached Resources</h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Points *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={editTaskPoints}
                    onChange={(e) => setEditTaskPoints(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editTaskCategory}
                    onChange={(e) => setEditTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={editTaskDeadline}
                    onChange={(e) => setEditTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Problem Statement / Description *</label>
                <textarea
                  rows={4}
                  required
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Edit YouTube URL */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                  <PlaySquare className="w-3.5 h-3.5 text-red-400" />
                  <span>YouTube Video Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={editTaskYoutubeUrl}
                  onChange={(e) => setEditTaskYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Edit Resources */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Attached Media Resources</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <select
                    value={editResType}
                    onChange={(e) => setEditResType(e.target.value as ResourceType)}
                    className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="pptx">Slide Deck (PPTX)</option>
                    <option value="image">Diagram / Image</option>
                    <option value="link">Resource Link</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Title"
                    value={editResTitle}
                    onChange={(e) => setEditResTitle(e.target.value)}
                    className="sm:col-span-4 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />

                  <input
                    type="url"
                    placeholder="URL"
                    value={editResUrl}
                    onChange={(e) => setEditResUrl(e.target.value)}
                    className="sm:col-span-4 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (editResTitle.trim() && editResUrl.trim()) {
                        setEditTaskResources([...editTaskResources, { type: editResType, title: editResTitle.trim(), url: editResUrl.trim() }]);
                        setEditResTitle('');
                        setEditResUrl('');
                      }
                    }}
                    className="sm:col-span-1 px-2 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {editTaskResources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editTaskResources.map((res, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200"
                      >
                        <span className="font-semibold text-cyan-400 uppercase text-[9px]">{res.type}:</span>
                        <span>{res.title}</span>
                        <button
                          type="button"
                          onClick={() => setEditTaskResources(editTaskResources.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Deliverables */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deliverables</label>
                <div className="flex gap-2 mb-1.5">
                  <input
                    type="text"
                    placeholder="Add deliverable..."
                    value={editTaskDeliverableInput}
                    onChange={(e) => setEditTaskDeliverableInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editTaskDeliverableInput.trim()) {
                        setEditTaskDeliverables([...editTaskDeliverables, editTaskDeliverableInput.trim()]);
                        setEditTaskDeliverableInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-400 font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editTaskDeliverables.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => setEditTaskDeliverables(editTaskDeliverables.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit Allowed Submission Formats (Spec 4: Admin-Gated) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-white mb-0.5">
                    Admin-Gated Submission Formats
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Toggle enabled formats for this task. Unchecked formats will be hidden from the user submission form.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                  {[
                    { id: 'github', label: 'GitHub Monorepo URLs', desc: 'Monorepo code & branch', icon: Github, color: 'text-purple-400' },
                    { id: 'video', label: 'YouTube Video Links', desc: 'Demonstration video', icon: Video, color: 'text-rose-400' },
                    { id: 'document', label: 'Google Drive Document Links', desc: 'Architecture & documentation', icon: FileText, color: 'text-blue-400' },
                    { id: 'image', label: 'Direct Image Uploads', desc: 'Schematics & diagrams', icon: ImageIcon, color: 'text-emerald-400' },
                  ].map(({ id, label, desc, icon: Icon, color }) => {
                    const isChecked = editTaskFormats.includes(id as AllowedFormat);
                    return (
                      <label
                        key={id}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditTaskFormats([...editTaskFormats, id as AllowedFormat]);
                            } else {
                              setEditTaskFormats(editTaskFormats.filter((f) => f !== id));
                            }
                          }}
                          className="mt-0.5 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <div className="text-xs">
                          <div className="flex items-center gap-1 font-bold text-white">
                            <Icon className={`w-3.5 h-3.5 ${color}`} />
                            <span className="text-[11px]">{label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTaskEdit}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingTaskEdit ? 'Saving...' : 'Save Task Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INSPECT FULL PARTICIPANT DOSSIER & SUBMISSIONS */}
      {/* ======================================================== */}
      {inspectingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white shrink-0 shadow-lg ${
                  inspectingParticipant.role === 'admin'
                    ? 'bg-linear-to-br from-purple-600 to-indigo-700'
                    : inspectingParticipant.role === 'judge'
                    ? 'bg-linear-to-br from-amber-500 to-orange-600'
                    : 'bg-linear-to-br from-blue-600 to-cyan-600'
                }`}>
                  {(inspectingParticipant.full_name || inspectingParticipant.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">
                      {inspectingParticipant.full_name || 'Individual Competitor'}
                    </h3>
                    <span className="font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50 text-xs font-bold">
                      {inspectingParticipant.registration_number || 'REG-PENDING'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inspectingParticipant.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : inspectingParticipant.role === 'judge'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {inspectingParticipant.role}
                    </span>
                    {inspectingParticipant.is_verified ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Verified Account</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        <span>Unverified</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{inspectingParticipant.email}</div>
                </div>
              </div>

              <button
                onClick={() => setInspectingParticipant(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              
              {/* Account Quick Status & Fast Actions Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Department</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
                    {inspectingParticipant.department || 'Engineering'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Batch</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                    {inspectingParticipant.batch || '2024'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tasks Completed</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold text-cyan-400 font-mono">
                      {Object.values(submissionsByUserAndTask[inspectingParticipant.id] || {}).filter(s => s.status === 'submitted' || s.status === 'evaluated').length}
                    </span>
                    <span className="text-[10px] text-slate-400">/ {tasks.length}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Score</span>
                  <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">
                    {Object.values(submissionsByUserAndTask[inspectingParticipant.id] || {}).reduce((acc, s) => acc + (Number(s.score) || 0), 0)} PTS
                  </span>
                </div>
              </div>

              {/* Database & Supabase Auth Metadata Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Supabase Identity & Database Record
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVerify(inspectingParticipant)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        inspectingParticipant.is_verified
                          ? 'bg-amber-950/40 border-amber-600/40 text-amber-300 hover:bg-amber-900/40'
                          : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/40'
                      }`}
                    >
                      {inspectingParticipant.is_verified ? 'Revoke Verification' : 'Verify Participant'}
                    </button>
                    <button
                      onClick={() => handleToggleAccountStatus(
                        inspectingParticipant,
                        inspectingParticipant.account_status === 'suspended' ? 'active' : 'suspended'
                      )}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        inspectingParticipant.account_status === 'suspended'
                          ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/40'
                          : 'bg-red-950/40 border-red-600/40 text-red-300 hover:bg-red-900/40'
                      }`}
                    >
                      {inspectingParticipant.account_status === 'suspended' ? 'Unban & Activate' : 'Suspend Account'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                    <span className="text-slate-400 text-[11px]">Database User ID:</span>
                    <span className="font-mono text-cyan-300 text-[10px] truncate max-w-42.5" title={inspectingParticipant.id}>
                      {inspectingParticipant.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                    <span className="text-slate-400 text-[11px]">Account Status:</span>
                    <span className={`font-bold capitalize text-[11px] ${
                      inspectingParticipant.account_status === 'suspended' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {inspectingParticipant.account_status || 'active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                    <span className="text-slate-400 text-[11px]">Registered Date:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {inspectingParticipant.created_at ? new Date(inspectingParticipant.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                    <span className="text-slate-400 text-[11px]">Last Sign In:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {inspectingParticipant.last_sign_in_at ? new Date(inspectingParticipant.last_sign_in_at).toLocaleDateString() : 'Active Session'}
                    </span>
                  </div>
                </div>
              </div>

              {/* All Tasks Submissions Dossier */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Task Submissions Breakdown ({tasks.length} Competition Challenges)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Click Grade to review or change score
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tasks.map((task) => {
                    const sub = (submissionsByUserAndTask[inspectingParticipant.id] || {})[task.id];
                    const isEval = sub?.status === 'evaluated';
                    const isSub = sub?.status === 'submitted';

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          sub
                            ? isEval
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : isSub
                              ? 'bg-cyan-950/20 border-cyan-500/30'
                              : 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-slate-950/40 border-slate-800/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-cyan-400">Task #{task.id}</span>
                              <h5 className="text-xs font-bold text-white">{task.short_title || task.title}</h5>
                              <span className="text-[10px] text-slate-400">({task.points} pts max)</span>
                            </div>
                            
                            {/* Status and Submission meta */}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {sub ? (
                                <>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isEval
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : isSub
                                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}>
                                    {sub.status.toUpperCase()}
                                  </span>
                                  {sub.submitted_at && (
                                    <span className="text-[11px] text-slate-400">
                                      Submitted: {new Date(sub.submitted_at).toLocaleString()}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-500">Not Started</span>
                              )}
                            </div>
                          </div>

                          {/* Score and Grade Button */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {sub && (
                              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 pl-1.5">PTS:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder={sub.score !== null ? String(sub.score) : '0-100'}
                                  value={inlineScores[sub.id] !== undefined ? inlineScores[sub.id] : (sub.score !== null ? String(sub.score) : '')}
                                  onChange={(e) => setInlineScores({ ...inlineScores, [sub.id]: e.target.value })}
                                  className="w-14 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                                />
                                <span className="text-[10px] text-slate-500 font-mono">/100</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickSaveScore(sub.id, sub.score)}
                                  disabled={savingScoreId === sub.id}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                  title="Save score out of 100 points"
                                >
                                  {savingScoreId === sub.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  <span>Save</span>
                                </button>
                              </div>
                            )}

                            {sub && (
                              <button
                                onClick={() => handleOpenGrading(sub)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                              >
                                {sub.score !== null ? 'Re-grade' : 'Grade'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Deliverables Links (if submitted) */}
                        {sub && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-xs">
                            {sub.github_url && (
                              <a
                                href={sub.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>GitHub Repository ({sub.github_branch || 'main'})</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            )}

                            {sub.pptx_url && (
                              <a
                                href={sub.pptx_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 hover:text-white hover:border-indigo-400 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Presentation Deck</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            )}

                            {sub.video_url && (
                              <a
                                href={sub.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-purple-300 hover:text-white hover:border-purple-400 transition-colors"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Demo Video</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            )}

                            {sub.document_url && (
                              <a
                                href={sub.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-blue-300 hover:text-white hover:border-blue-400 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Document</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            )}

                            {sub.image_url && (
                              <a
                                href={sub.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 hover:text-white hover:border-emerald-400 transition-colors"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Image Proof</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            )}

                            {sub.feedback && (
                              <div className="w-full text-[11px] text-emerald-300/90 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/50 mt-1">
                                <strong>Jury Feedback:</strong> {sub.feedback}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const toDelete = inspectingParticipant;
                  setInspectingParticipant(null);
                  handleDeleteParticipant(toDelete.id, toDelete.full_name);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:text-white hover:bg-red-950/50 border border-red-900/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Participant</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toEdit = inspectingParticipant;
                    setInspectingParticipant(null);
                    handleOpenEditParticipant(toEdit);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details & Password</span>
                </button>
                <button
                  onClick={() => setInspectingParticipant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: REGISTER NEW PARTICIPANT (CREATE)               */}
      {/* ======================================================== */}
      {showCreateParticipantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Register New Participant</h3>
                  <p className="text-xs text-slate-400">Creates Supabase Auth credentials and public database profile.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateParticipantModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateParticipant} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@university.edu"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Password field with auto-generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-generate Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter or generate temporary password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Password must be at least 6 characters. The participant can use this to sign in.
                </span>
              </div>

              {/* Registration Number with auto-generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Registration / ID Number *</label>
                  <button
                    type="button"
                    onClick={generateRandomRegNo}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-generate ID</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. ASL-2024-8842"
                  value={createRegNo}
                  onChange={(e) => setCreateRegNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={createDept}
                    onChange={(e) => setCreateDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batch *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024"
                    value={createBatch}
                    onChange={(e) => setCreateBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role / Permissions</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as 'participant' | 'judge' | 'admin')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="participant">Participant (Competitor)</option>
                    <option value="judge">Judge (Evaluator)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Account Status</label>
                  <select
                    value={createAccountStatus}
                    onChange={(e) => setCreateAccountStatus(e.target.value as 'active' | 'pending' | 'suspended')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="active">Active (Can Sign In)</option>
                    <option value="pending">Pending Review</option>
                    <option value="suspended">Suspended (Banned)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createIsVerified}
                    onChange={(e) => setCreateIsVerified(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-200 font-medium">Mark participant as Verified immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createSendEmail}
                    onChange={(e) => setCreateSendEmail(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-slate-200 font-medium block">Send Welcome & Credentials Email</span>
                    <span className="text-[10px] text-slate-400 block">Sends login email, password, and instructions via Gmail service.</span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateParticipantModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingParticipant}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/30 cursor-pointer disabled:opacity-50"
                >
                  {creatingParticipant ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Participant...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register Participant</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT PARTICIPANT DETAILS & SYNC ACCOUNT         */}
      {/* ======================================================== */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Participant & Sync Account</h3>
                  <p className="text-xs text-slate-400">Updates database profile and live Supabase Auth account status.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingParticipant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveParticipant} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Syncs with Supabase Auth login email</span>
                </div>
              </div>

              {/* Password reset option */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Reset Participant Password</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <input
                  type="text"
                  placeholder="Leave empty to keep existing password, or enter new password..."
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500 block">
                  If entered (min 6 chars), participant&apos;s login password will be updated immediately.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={editRegNo}
                    onChange={(e) => setEditRegNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batch</label>
                  <input
                    type="text"
                    required
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role / Permissions</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'participant' | 'judge' | 'admin')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="participant">Participant (Competitor)</option>
                    <option value="judge">Judge (Evaluator)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                  <select
                    value={editAccountStatus}
                    onChange={(e) => setEditAccountStatus(e.target.value as 'active' | 'pending' | 'suspended')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="active">Active (Permitted to Login)</option>
                    <option value="pending">Pending Review</option>
                    <option value="suspended">Suspended (Banned from Login)</option>
                  </select>
                </div>
              </div>

              {/* Verification Toggle */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-medium block">Verification Status</span>
                  <span className="text-[10px] text-slate-400 block">
                    {editIsVerified ? 'Marked as an officially verified competitor.' : 'Awaiting official admin verification.'}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsVerified}
                    onChange={(e) => setEditIsVerified(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${editIsVerified ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {editIsVerified ? 'Verified' : 'Unverified'}
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingParticipant}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingParticipant ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save & Sync Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
